import { Statement, ExprStmt } from '../types/ast';
import { IBPValue, valueToString } from '../types/values';
import { EngineEvent, EventHandler } from '../types/events';
import { ExecutionLimits, DEFAULT_LIMITS, StorageAdapter, FilesystemAdapter } from '../types/limits';
import { Environment, Binding } from '../runtime/environment';
import { PRNG } from '../runtime/prng';
import { VirtualClock } from '../runtime/clock';
import { IBPError } from '../diagnostics/error';
import { registerBuiltins } from '../builtins';
import { tokenize } from '../lexer/lexer';
import { preprocessEasyFlow } from '../lexer/preprocessor';
import { Parser } from '../parser/parser';
import { Interpreter, InterpreterOptions } from './interpreter';
import { TokenType } from '../types/tokens';

export interface IBPSessionOptions {
  limits?: Partial<ExecutionLimits>;
  storage?: StorageAdapter;
  fs?: FilesystemAdapter;
  initialSeed?: number;
  immediateClock?: boolean;
  onEvent?: EventHandler;
  printBareExpressions?: boolean;
  scriptedInput?: string[];
}

export interface SessionEvalResult {
  output: string[];
  events: EngineEvent[];
  value?: IBPValue;
  error?: IBPError;
  incomplete?: boolean;
}

export class IBPSession {
  private globalEnv: Environment;
  private builtinsEnv: Environment;
  private limits: ExecutionLimits;
  private storage: StorageAdapter;
  private fs?: FilesystemAdapter;
  private prng: PRNG;
  private clock: VirtualClock;
  private printBareExpressions: boolean;
  private eventHandlers: EventHandler[] = [];
  private scriptedInput?: string[];

  constructor(options: IBPSessionOptions = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...options.limits };
    this.storage = options.storage || {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    this.fs = options.fs;
    this.prng = new PRNG(options.initialSeed ?? 42);
    this.clock = new VirtualClock(options.immediateClock ?? true);
    this.printBareExpressions = options.printBareExpressions ?? true;
    this.scriptedInput = options.scriptedInput ? [...options.scriptedInput] : undefined;

    if (options.onEvent) {
      this.eventHandlers.push(options.onEvent);
    }

    this.builtinsEnv = new Environment(null);
    registerBuiltins(this.builtinsEnv);
    this.globalEnv = new Environment(this.builtinsEnv);
  }

  public reset(): void {
    this.builtinsEnv = new Environment(null);
    registerBuiltins(this.builtinsEnv);
    this.globalEnv = new Environment(this.builtinsEnv);
  }

  public getGlobalEnv(): Environment {
    return this.globalEnv;
  }

  public getVariables(): Record<string, { kind: string; isConstant: boolean; value: IBPValue }> {
    return this.globalEnv.inspect();
  }

  public addEventListener(handler: EventHandler): void {
    this.eventHandlers.push(handler);
  }

  public isComplete(source: string): boolean {
    const trimmed = source.trim();
    if (!trimmed) return true;

    const processed = preprocessEasyFlow(source);
    const tokens = tokenize(processed);
    let braceDepth = 0;
    let parenDepth = 0;
    let bracketDepth = 0;

    for (const t of tokens) {
      if (t.type === TokenType.LeftBrace) braceDepth++;
      else if (t.type === TokenType.RightBrace) braceDepth--;
      else if (t.type === TokenType.LeftParen) parenDepth++;
      else if (t.type === TokenType.RightParen) parenDepth--;
      else if (t.type === TokenType.LeftBracket) bracketDepth++;
      else if (t.type === TokenType.RightBracket) bracketDepth--;
    }

    if (braceDepth > 0 || parenDepth > 0 || bracketDepth > 0) {
      return false;
    }

    // Try parsing; if we get an EOF syntax error expecting closing delimiter, consider incomplete
    const parser = new Parser(tokens, processed);
    const { errors } = parser.parse();
    for (const err of errors) {
      if (
        err.message &&
        (err.message.includes('Expected "}"') ||
          err.message.includes('Expected ")"') ||
          err.message.includes('Expected "]"') ||
          err.message.includes('Found "EOF"'))
      ) {
        return false;
      }
    }
    return true;
  }

  public eval(source: string, options: { scriptedInput?: string[] } = {}): SessionEvalResult {
    const events: EngineEvent[] = [];
    const output: string[] = [];

    const processed = preprocessEasyFlow(source);

    if (!this.isComplete(processed)) {
      return {
        output: [],
        events: [],
        incomplete: true,
      };
    }

    const tokens = tokenize(processed);
    const parser = new Parser(tokens, processed);
    const { program, errors } = parser.parse();

    if (errors.length > 0) {
      return {
        output,
        events,
        error: errors[0],
      };
    }

    // Snapshot bindings to prevent corruption on runtime error
    const snapshot = this.globalEnv.cloneBindings();

    const scriptedInput = options.scriptedInput
      ? [...options.scriptedInput]
      : this.scriptedInput
        ? [...this.scriptedInput]
        : undefined;

    const interpOpts: InterpreterOptions = {
      limits: this.limits,
      storage: this.storage,
      fs: this.fs,
      sourceCode: source,
      scriptedInput,
      printBareExpressions: this.printBareExpressions,
      onEvent: (ev) => {
        events.push(ev);
        if (ev.type === 'output') output.push(ev.text);
        for (const h of this.eventHandlers) h(ev);
      },
    };

    const interp = new Interpreter(interpOpts, this.globalEnv);

    try {
      interp.run(program);
      const lastVal = interp.getLastExprValue();
      return {
        output,
        events,
        value: lastVal,
      };
    } catch (err: any) {
      // Rollback environment on error
      this.globalEnv.restoreBindings(snapshot);
      const ibpErr = err instanceof IBPError ? err : new IBPError({ kind: 'RaisedError', message: String(err) });
      return {
        output,
        events,
        error: ibpErr,
      };
    }
  }
}

