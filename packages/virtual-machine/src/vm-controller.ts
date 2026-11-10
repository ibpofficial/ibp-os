import {
  Interpreter,
  parse,
  EngineEvent,
  ExecutionLimits,
  DEFAULT_LIMITS,
  ExecutionStatus,
  IBPError,
  IBPSession,
} from '@ibp/engine';
import { defaultVFS } from '@ibp/vfs';
import {
  MainToWorkerMessage,
  WorkerToMainMessage,
  InputRequest,
} from './protocol';

export interface VMRunOptions {
  code: string;
  seed?: number;
  limits?: Partial<ExecutionLimits>;
  breakpoints?: number[];
  onEvent?: (event: EngineEvent) => void;
  onStatusChange?: (status: ExecutionStatus) => void;
  onOutput?: (text: string, mode: 'say' | 'shout' | 'whisper') => void;
  onError?: (error: IBPError) => void;
  onInputRequest?: (req: InputRequest) => void;
  storage?: any;
  inputProvider?: (prompt: string, kind: 'text' | 'number') => Promise<string> | string;
  scriptedInput?: string[];
}

export interface VMOptions {
  workerFactory?: () => Worker;
  fallbackToInProcess?: boolean;
}

export class IBPVirtualMachine {
  private worker: Worker | null = null;
  private workerFactory?: () => Worker;
  private status: ExecutionStatus = 'idle';
  private eventListeners: ((event: EngineEvent) => void)[] = [];
  private statusListeners: ((status: ExecutionStatus) => void)[] = [];
  private outputListeners: ((text: string, mode: 'say' | 'shout' | 'whisper') => void)[] = [];
  private inputRequestListeners: ((req: InputRequest) => void)[] = [];
  private errorListeners: ((err: IBPError) => void)[] = [];

  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  private lastInputRequestId: string | null = null;
  private currentRunResolver: ((res: { events: EngineEvent[]; output: string[]; error?: IBPError }) => void) | null = null;
  private currentRunRejecter: ((err: any) => void) | null = null;
  private accumulatedEvents: EngineEvent[] = [];
  private accumulatedOutput: string[] = [];
  private accumulatedError?: IBPError;

  // Fallback in-process session / interpreter
  private inProcessSession: IBPSession | null = null;
  private inProcessInterpreter: Interpreter | null = null;

  constructor(options: VMOptions = {}) {
    this.workerFactory = options.workerFactory;
    if (this.workerFactory || typeof Worker !== 'undefined') {
      this.initWorker();
    }
  }

  private initWorker(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {}
      this.worker = null;
    }

    try {
      if (this.workerFactory) {
        this.worker = this.workerFactory();
      }
    } catch {
      this.worker = null;
    }

    if (this.worker) {
      this.worker.onmessage = (e: MessageEvent<WorkerToMainMessage>) => {
        this.handleWorkerMessage(e.data);
      };
      this.worker.onerror = (err) => {
        console.error('VM Worker error:', err);
        this.setStatus('error');
        if (this.currentRunRejecter) {
          this.currentRunRejecter(err);
          this.currentRunResolver = null;
          this.currentRunRejecter = null;
        }
      };
    }
  }

  private handleWorkerMessage(msg: WorkerToMainMessage): void {
    if (!msg) return;

    switch (msg.type) {
      case 'output': {
        this.accumulatedOutput.push(msg.text);
        for (const l of this.outputListeners) {
          l(msg.text, msg.mode);
        }
        break;
      }
      case 'event': {
        if (msg.event && (msg.event as any).type === 'error' && (msg.event as any).error) {
          const rawErr = (msg.event as any).error;
          const rehydrated =
            rawErr instanceof IBPError
              ? rawErr
              : new IBPError({
                  kind: rawErr?.kind || 'RaisedError',
                  message: rawErr?.message || String(rawErr),
                  span: rawErr?.span,
                  hint: rawErr?.hint,
                });
          (msg.event as any).error = rehydrated;
          this.accumulatedError = rehydrated;
          for (const l of this.errorListeners) {
            l(rehydrated);
          }
        }
        this.accumulatedEvents.push(msg.event);
        for (const l of this.eventListeners) {
          l(msg.event);
        }
        break;
      }
      case 'awaiting-input': {
        this.lastInputRequestId = msg.id;
        this.setStatus('paused');
        const req: InputRequest = { id: msg.id, prompt: msg.prompt, kind: msg.kind };
        for (const l of this.inputRequestListeners) {
          l(req);
        }
        break;
      }
      case 'status': {
        this.setStatus(msg.status);
        if (msg.status === 'stopped' && this.watchdogTimer) {
          clearTimeout(this.watchdogTimer);
          this.watchdogTimer = null;
        }
        break;
      }
      case 'error': {
        const ibpErr =
          msg.error instanceof IBPError
            ? msg.error
            : new IBPError({
                kind: msg.error?.kind || 'RaisedError',
                message: msg.error?.message || String(msg.error),
                span: msg.error?.span,
                hint: msg.error?.hint,
              });
        this.accumulatedError = ibpErr;
        for (const l of this.errorListeners) {
          l(ibpErr);
        }
        break;
      }
      case 'done': {
        if (this.watchdogTimer) {
          clearTimeout(this.watchdogTimer);
          this.watchdogTimer = null;
        }
        if (this.currentRunResolver) {
          const res = {
            events: [...this.accumulatedEvents],
            output: [...this.accumulatedOutput],
            error: this.accumulatedError,
          };
          this.currentRunResolver(res);
          this.currentRunResolver = null;
          this.currentRunRejecter = null;
        }
        break;
      }
    }
  }

  private postToWorker(msg: MainToWorkerMessage): void {
    if (this.worker) {
      this.worker.postMessage(msg);
    }
  }

  public onEvent(listener: (event: EngineEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener);
    };
  }

  public onStatus(listener: (status: ExecutionStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  public onOutput(listener: (text: string, mode: 'say' | 'shout' | 'whisper') => void): () => void {
    this.outputListeners.push(listener);
    return () => {
      this.outputListeners = this.outputListeners.filter((l) => l !== listener);
    };
  }

  public onInputRequest(listener: (req: InputRequest) => void): () => void {
    this.inputRequestListeners.push(listener);
    return () => {
      this.inputRequestListeners = this.inputRequestListeners.filter((l) => l !== listener);
    };
  }

  public onError(listener: (err: IBPError) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: ExecutionStatus): void {
    this.status = status;
    for (const l of this.statusListeners) {
      l(status);
    }
  }

  public getStatus(): ExecutionStatus {
    return this.status;
  }

  public async run(options: VMRunOptions): Promise<{
    events: EngineEvent[];
    output: string[];
    error?: IBPError;
  }> {
    this.accumulatedEvents = [];
    this.accumulatedOutput = [];
    this.accumulatedError = undefined;

    // Attach transient run listeners
    const unsubs: (() => void)[] = [];
    if (options.onEvent) unsubs.push(this.onEvent(options.onEvent));
    if (options.onOutput) unsubs.push(this.onOutput(options.onOutput));
    if (options.onStatusChange) unsubs.push(this.onStatus(options.onStatusChange));
    if (options.onError) unsubs.push(this.onError(options.onError));
    if (options.onInputRequest) unsubs.push(this.onInputRequest(options.onInputRequest));

    if (options.inputProvider) {
      unsubs.push(
        this.onInputRequest(async (req) => {
          try {
            const ans = await Promise.resolve(options.inputProvider!(req.prompt, req.kind));
            this.provideInput(req.id, ans);
          } catch {
            this.provideInput(req.id, '');
          }
        })
      );
    }

    if (this.worker) {
      this.setStatus('running');
      return new Promise<{ events: EngineEvent[]; output: string[]; error?: IBPError }>((resolve, reject) => {
        this.currentRunResolver = (result) => {
          unsubs.forEach((u) => u());
          resolve(result);
        };
        this.currentRunRejecter = (err) => {
          unsubs.forEach((u) => u());
          reject(err);
        };
        this.postToWorker({
          type: 'run',
          code: options.code,
          seed: options.seed,
          limits: options.limits,
        });
      });
    }

    // Fallback: in-process execution (for tests without worker)
    this.setStatus('running');
    const { program, errors } = parse(options.code);
    if (errors.length > 0) {
      this.setStatus('error');
      const err = errors[0];
      if (options.onError) options.onError(err);
      unsubs.forEach((u) => u());
      return { events: [], output: [], error: err };
    }

    const fsAdapter = defaultVFS.getSyncAdapter();
    const interp = new Interpreter({
      limits: options.limits,
      initialSeed: options.seed,
      sourceCode: options.code,
      storage: options.storage,
      fs: fsAdapter,
      scriptedInput: options.scriptedInput,
      inputProvider: options.inputProvider,
      onEvent: (ev) => {
        this.accumulatedEvents.push(ev);
        if (ev.type === 'output') {
          this.accumulatedOutput.push(ev.text);
          for (const l of this.outputListeners) l(ev.text, ev.mode);
        }
        for (const l of this.eventListeners) l(ev);
      },
    });

    this.inProcessInterpreter = interp;
    try {
      interp.run(program);
      this.setStatus('completed');
    } catch (err: any) {
      this.setStatus('error');
      this.accumulatedError =
        err instanceof IBPError ? err : new IBPError({ kind: 'RaisedError', message: String(err) });
      if (options.onError) options.onError(this.accumulatedError);
    } finally {
      this.inProcessInterpreter = null;
      unsubs.forEach((u) => u());
    }

    return {
      events: this.accumulatedEvents,
      output: this.accumulatedOutput,
      error: this.accumulatedError,
    };
  }

  public provideInput(idOrValue: string, value?: string): void {
    if (value !== undefined) {
      this.postToWorker({ type: 'input-reply', id: idOrValue, value });
    } else if (this.lastInputRequestId) {
      this.postToWorker({ type: 'input-reply', id: this.lastInputRequestId, value: idOrValue });
    } else {
      this.postToWorker({ type: 'input-reply', id: '', value: idOrValue });
    }
  }

  public pause(): void {
    if (this.worker) {
      this.postToWorker({ type: 'pause' });
    } else if (this.inProcessInterpreter) {
      this.inProcessInterpreter.pause();
      this.setStatus('paused');
    }
  }

  public resume(): void {
    if (this.worker) {
      this.postToWorker({ type: 'resume' });
    } else if (this.inProcessInterpreter) {
      this.inProcessInterpreter.resume();
      this.setStatus('running');
    }
  }

  public stop(): void {
    if (this.worker) {
      this.postToWorker({ type: 'stop' });
      this.setStatus('stopped');

      // Hard watchdog: 2 seconds
      if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
      this.watchdogTimer = setTimeout(() => {
        console.warn('IBPVirtualMachine watchdog: worker unresponsive after 2s, terminating.');
        this.terminateWorker();
        this.initWorker();
        this.setStatus('stopped');
      }, 2000);
    } else if (this.inProcessInterpreter) {
      this.inProcessInterpreter.stop();
      this.setStatus('stopped');
    }
  }

  public step(): void {
    if (this.worker) {
      this.postToWorker({ type: 'step' });
    }
  }

  public async eval(line: string): Promise<{ output: string[]; events: EngineEvent[]; error?: IBPError; value?: any }> {
    if (this.worker) {
      return new Promise((resolve) => {
        const events: EngineEvent[] = [];
        const output: string[] = [];
        let err: IBPError | undefined;

        const unsubEv = this.onEvent((ev) => events.push(ev));
        const unsubOut = this.onOutput((text) => output.push(text));

        const originalResolver = this.currentRunResolver;
        this.currentRunResolver = (res) => {
          unsubEv();
          unsubOut();
          this.currentRunResolver = originalResolver;
          resolve({ output, events, error: res.error });
        };

        this.postToWorker({ type: 'eval', line });
      });
    }

    if (!this.inProcessSession) {
      this.inProcessSession = new IBPSession();
    }
    return this.inProcessSession.eval(line);
  }

  public resetSession(): void {
    if (this.worker) {
      this.postToWorker({ type: 'reset-session' });
    }
    if (this.inProcessSession) {
      this.inProcessSession.reset();
    }
  }

  public terminateWorker(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {}
      this.worker = null;
    }
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  public destroy(): void {
    this.terminateWorker();
    this.eventListeners = [];
    this.statusListeners = [];
    this.outputListeners = [];
    this.inputRequestListeners = [];
  }
}
