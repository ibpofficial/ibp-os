/// <reference lib="webworker" />
import {
  Interpreter,
  parse,
  EngineEvent,
  ExecutionStatus,
  IBPError,
  IBPSession,
} from '@ibp/engine';
import { defaultVFS } from '@ibp/vfs';
import { MainToWorkerMessage, WorkerToMainMessage } from '@ibp/vm';

const ctx: DedicatedWorkerGlobalScope = self as any;

let session: IBPSession | null = null;
let currentInterpreter: Interpreter | null = null;
let isRunning = false;
let isPaused = false;
let pendingInputResolver: ((val: string) => void) | null = null;
let currentInputId: string | null = null;
let nextInputSeq = 0;

function sanitizeValueForClone(val: any, depth = 0): any {
  if (depth > 6) return '[Nested]';
  if (val === null || val === undefined) return val;
  if (typeof val === 'function') return undefined;
  if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') return val;

  if (typeof val === 'object') {
    if (val.kind === 'recipe') {
      return {
        kind: 'recipe',
        name: val.name || '',
        isNative: Boolean(val.isNative),
        params: Array.isArray(val.params) ? val.params : [],
      };
    }
    if (val.kind === 'box' && val.fields instanceof Map) {
      const obj: Record<string, any> = {};
      for (const [k, v] of val.fields.entries()) {
        obj[k] = sanitizeValueForClone(v, depth + 1);
      }
      return { kind: 'box', fields: obj };
    }
    if (val.kind === 'list' && Array.isArray(val.elements)) {
      return {
        kind: 'list',
        elements: val.elements.map((el: any) => sanitizeValueForClone(el, depth + 1)),
      };
    }
    if (Array.isArray(val)) {
      return val.map((item) => sanitizeValueForClone(item, depth + 1));
    }

    const copy: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      if (key === 'closure' || key === 'fn') continue;
      try {
        const fieldVal = val[key];
        if (typeof fieldVal !== 'function') {
          copy[key] = sanitizeValueForClone(fieldVal, depth + 1);
        }
      } catch {}
    }
    return copy;
  }
  return String(val);
}

function sanitizeEvent(ev: EngineEvent): any {
  if (!ev) return ev;
  if (ev.type === 'variable-changed') {
    return {
      type: 'variable-changed',
      name: ev.name,
      scopeLevel: ev.scopeLevel,
      oldValue: sanitizeValueForClone(ev.oldValue),
      newValue: sanitizeValueForClone(ev.newValue),
    };
  }
  if (ev.type === 'call-pushed' || ev.type === 'call-popped') {
    return {
      ...ev,
      args: (ev as any).args ? (ev as any).args.map((a: any) => sanitizeValueForClone(a)) : undefined,
      returnValue: sanitizeValueForClone((ev as any).returnValue),
    };
  }
  if (ev.type === 'error' && (ev as any).error) {
    const err = (ev as any).error;
    return {
      type: 'error',
      error: {
        kind: err.kind || 'RaisedError',
        message: err.message || String(err),
        span: err.span,
        hint: err.hint,
      },
    };
  }
  return sanitizeValueForClone(ev);
}

function send(msg: WorkerToMainMessage) {
  try {
    if (msg.type === 'event' && msg.event) {
      ctx.postMessage({ ...msg, event: sanitizeEvent(msg.event) });
    } else if (msg.type === 'error' && msg.error) {
      ctx.postMessage({
        ...msg,
        error: {
          kind: msg.error.kind || 'RaisedError',
          message: msg.error.message || String(msg.error),
          span: msg.error.span,
          hint: msg.error.hint,
        } as any,
      });
    } else if (msg.type === 'done' && (msg as any).value) {
      ctx.postMessage({
        ...msg,
        value: sanitizeValueForClone((msg as any).value),
      });
    } else {
      ctx.postMessage(msg);
    }
  } catch (err) {
    console.warn('Worker postMessage failed to clone message:', err);
  }
}

function setStatus(status: ExecutionStatus) {
  send({ type: 'status', status });
}

let vfsReadyPromise: Promise<void> | null = null;
function ensureVFS(): Promise<void> {
  if (!vfsReadyPromise) {
    vfsReadyPromise = defaultVFS.init(false).catch((err) => {
      console.warn('VFS init in worker error:', err);
    });
  }
  return vfsReadyPromise;
}

const memoryStorage = new Map<string, string>();
const storageAdapter = {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => memoryStorage.set(k, v),
  removeItem: (k: string) => memoryStorage.delete(k),
};

function getSession(): IBPSession {
  if (!session) {
    session = new IBPSession({
      storage: storageAdapter,
      fs: defaultVFS.getSyncAdapter(),
      printBareExpressions: true,
      onEvent: (ev) => send({ type: 'event', event: ev }),
    });
  }
  return session;
}

ctx.onmessage = async (e: MessageEvent<MainToWorkerMessage>) => {
  const msg = e.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'run': {
      await ensureVFS();
      await runCode(msg.code, msg.seed, msg.limits);
      break;
    }
    case 'input-reply': {
      if (pendingInputResolver && (currentInputId === null || currentInputId === msg.id)) {
        const resolve = pendingInputResolver;
        pendingInputResolver = null;
        currentInputId = null;
        resolve(msg.value);
      }
      break;
    }
    case 'stop': {
      isRunning = false;
      isPaused = false;
      if (currentInterpreter) {
        currentInterpreter.stop();
      }
      if (pendingInputResolver) {
        const resolve = pendingInputResolver;
        pendingInputResolver = null;
        currentInputId = null;
        resolve('');
      }
      setStatus('stopped');
      send({ type: 'done', durationMs: 0 });
      break;
    }
    case 'pause': {
      isPaused = true;
      if (currentInterpreter) {
        currentInterpreter.pause();
      }
      setStatus('paused');
      break;
    }
    case 'resume': {
      isPaused = false;
      if (currentInterpreter) {
        currentInterpreter.resume();
      }
      setStatus('running');
      break;
    }
    case 'step': {
      // Step single step if paused or running
      break;
    }
    case 'eval': {
      await ensureVFS();
      const sess = getSession();
      const start = Date.now();
      const res = sess.eval(msg.line);
      for (const ev of res.events) {
        send({ type: 'event', event: ev });
      }
      for (const out of res.output) {
        send({ type: 'output', text: out, mode: 'say' });
      }
      if (res.error) {
        send({ type: 'error', error: res.error });
      }
      send({ type: 'done', durationMs: Date.now() - start, value: res.value });
      break;
    }
    case 'reset-session': {
      session = null;
      memoryStorage.clear();
      setStatus('idle');
      break;
    }
  }
};

async function runCode(code: string, seed?: number, limits?: any) {
  const startTime = Date.now();
  setStatus('running');
  isRunning = true;
  isPaused = false;

  const { program, errors } = parse(code);
  if (errors.length > 0) {
    setStatus('error');
    send({ type: 'error', error: errors[0] });
    send({ type: 'done', durationMs: Date.now() - startTime });
    isRunning = false;
    return;
  }

  const interpreter = new Interpreter({
    limits,
    initialSeed: seed,
    sourceCode: code,
    storage: storageAdapter,
    fs: defaultVFS.getSyncAdapter(),
    onEvent: (ev) => {
      send({ type: 'event', event: ev });
      if (ev.type === 'output') {
        send({ type: 'output', text: ev.text, mode: ev.mode });
      }
    },
  });

  currentInterpreter = interpreter;
  const gen = interpreter.runProgram(program);

  let nextArg: unknown = undefined;
  const BATCH_SIZE = 50;
  let stmtCount = 0;

  try {
    while (isRunning) {
      while (isPaused && isRunning) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (!isRunning) break;

      const res = gen.next(nextArg);
      nextArg = undefined;

      if (res.done) {
        setStatus('completed');
        send({ type: 'done', durationMs: Date.now() - startTime });
        break;
      }

      const ev = res.value;
      if (ev && typeof ev === 'object' && ev.type === 'awaiting-input') {
        const inputId = String(++nextInputSeq);
        currentInputId = inputId;
        setStatus('paused'); // waiting for input state
        send({
          type: 'awaiting-input',
          id: inputId,
          prompt: ev.prompt,
          kind: ev.kind,
        });

        // Wait for reply or stop
        const inputAnswer = await new Promise<string>((resolve) => {
          pendingInputResolver = resolve;
        });

        if (!isRunning) break;
        setStatus('running');
        nextArg = inputAnswer;
      }

      stmtCount++;
      if (stmtCount % BATCH_SIZE === 0) {
        // Yield to event loop so stop/pause/input messages can be handled
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  } catch (err: any) {
    setStatus('error');
    const ibpErr =
      err instanceof IBPError
        ? err
        : new IBPError({ kind: 'RaisedError', message: String(err.message || err) });
    send({ type: 'error', error: ibpErr });
    send({ type: 'done', durationMs: Date.now() - startTime });
  } finally {
    isRunning = false;
    currentInterpreter = null;
  }
}

