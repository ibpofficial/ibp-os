import {
  Interpreter,
  parse,
  EngineEvent,
  ExecutionLimits,
  DEFAULT_LIMITS,
  ExecutionStatus,
  IBPError,
} from '@ibp/engine';
import { defaultVFS } from '@ibp/vfs';

export interface VMRunOptions {
  code: string;
  seed?: number;
  limits?: Partial<ExecutionLimits>;
  breakpoints?: number[];
  onEvent?: (event: EngineEvent) => void;
  onStatusChange?: (status: ExecutionStatus) => void;
  onOutput?: (text: string, mode: 'say' | 'shout' | 'whisper') => void;
  onError?: (error: IBPError) => void;
  storage?: any;
  inputProvider?: (prompt: string, isNumber: boolean) => string;
}

export class IBPVirtualMachine {
  private interpreter: Interpreter | null = null;
  private status: ExecutionStatus = 'idle';
  private eventListeners: ((event: EngineEvent) => void)[] = [];
  private statusListeners: ((status: ExecutionStatus) => void)[] = [];

  constructor() {}

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
    const events: EngineEvent[] = [];
    const output: string[] = [];
    let runError: IBPError | undefined;

    this.setStatus('running');

    const { program, errors } = parse(options.code);
    if (errors.length > 0) {
      this.setStatus('error');
      const err = errors[0];
      if (options.onError) options.onError(err);
      return { events, output, error: err };
    }

    const fsAdapter = defaultVFS.getSyncAdapter();

    this.interpreter = new Interpreter({
      limits: options.limits,
      initialSeed: options.seed,
      sourceCode: options.code,
      storage: options.storage,
      fs: fsAdapter,
      inputProvider: options.inputProvider,
      onEvent: (ev) => {
        events.push(ev);
        if (ev.type === 'output') {
          output.push(ev.text);
          if (options.onOutput) options.onOutput(ev.text, ev.mode);
        }
        if (ev.type === 'error') {
          runError = ev.error;
          if (options.onError) options.onError(ev.error);
        }
        for (const l of this.eventListeners) {
          l(ev);
        }
        if (options.onEvent) options.onEvent(ev);
      },
    });

    if (options.breakpoints) {
      this.interpreter.setBreakpoints(options.breakpoints);
    }

    try {
      this.interpreter.run(program);
      this.setStatus('completed');
    } catch (err: any) {
      this.setStatus('error');
      runError = err instanceof IBPError ? err : new IBPError({ kind: 'RaisedError', message: String(err) });
      if (options.onError) options.onError(runError);
    }

    return { events, output, error: runError };
  }

  public pause(): void {
    if (this.interpreter) {
      this.interpreter.pause();
      this.setStatus('paused');
    }
  }

  public resume(): void {
    if (this.interpreter) {
      this.interpreter.resume();
      this.setStatus('running');
    }
  }

  public stop(): void {
    if (this.interpreter) {
      this.interpreter.stop();
      this.setStatus('stopped');
    }
  }
}
