import {
  ProgramNode,
  Statement,
  Expression,
  BlockStmt,
  VarDeclStmt,
  ConstDeclStmt,
  AssignStmt,
  OutputStmt,
  InputStmt,
  WhenStmt,
  UnlessStmt,
  RepeatStmt,
  CountStmt,
  EachStmt,
  WhileStmt,
  ForeverStmt,
  RecipeDeclStmt,
  BoxDeclStmt,
  AddStmt,
  RemoveStmt,
  AttemptStmt,
  RaiseStmt,
  ExpectStmt,
  WaitStmt,
  RememberStmt,
  CelebrateStmt,
  TodoStmt,
  SeedStmt,
  GiveStmt,
  ExprStmt,
  BinaryExpr,
  UnaryExpr,
  PipeExpr,
  RangeExpr,
  CallExpr,
  IndexExpr,
  MemberExpr,
  InterpolatedStringExpr,
} from '../types/ast';
import {
  IBPValue,
  UserRecipe,
  NativeRecipe,
  makeNumber,
  makeText,
  makeBoolean,
  makeEmpty,
  makeList,
  makeBox,
  makeRange,
  valueToString,
  valuesEqual,
} from '../types/values';
import { EngineEvent, EventHandler } from '../types/events';
import { ExecutionLimits, DEFAULT_LIMITS, ExecutionContext, StorageAdapter, FilesystemAdapter } from '../types/limits';
import { Environment } from '../runtime/environment';
import { PRNG } from '../runtime/prng';
import { VirtualClock } from '../runtime/clock';
import { IBPError } from '../diagnostics/error';
import { registerBuiltins } from '../builtins';
import { tokenize } from '../lexer/lexer';
import { Parser } from '../parser/parser';

export interface InterpreterOptions {
  limits?: Partial<ExecutionLimits>;
  storage?: StorageAdapter;
  fs?: FilesystemAdapter;
  initialSeed?: number;
  immediateClock?: boolean;
  onEvent?: EventHandler;
  sourceCode?: string;
  inputProvider?: (prompt: string, kind: 'text' | 'number') => Promise<string> | string;
  scriptedInput?: string[];
  printBareExpressions?: boolean;
}

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';

interface JumpSignal {
  type: 'give' | 'stop' | 'skip';
  value?: IBPValue;
}

export class Interpreter {
  private globalEnv: Environment;
  private currentEnv: Environment;
  private limits: ExecutionLimits;
  private instructions = 0;
  private callDepth = 0;
  private outputLength = 0;
  private prng: PRNG;
  private clock: VirtualClock;
  private storage: StorageAdapter;
  private fs?: FilesystemAdapter;
  private eventHandlers: EventHandler[] = [];
  private sourceCode = '';
  private status: ExecutionStatus = 'idle';
  private breakpoints = new Set<number>();
  private activeGenerator: Generator<EngineEvent, void, unknown> | null = null;
  private inputProvider?: (prompt: string, kind: 'text' | 'number') => Promise<string> | string;
  private scriptedInput?: string[];
  private printBareExpressions = false;
  private lastExprValue?: IBPValue;

  constructor(options: InterpreterOptions = {}, existingGlobalEnv?: Environment) {
    this.limits = { ...DEFAULT_LIMITS, ...options.limits };
    this.storage = options.storage || {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    this.fs = options.fs;
    this.prng = new PRNG(options.initialSeed ?? 42);
    this.clock = new VirtualClock(options.immediateClock ?? true);
    this.sourceCode = options.sourceCode || '';
    this.inputProvider = options.inputProvider;
    this.scriptedInput = options.scriptedInput ? [...options.scriptedInput] : undefined;
    this.printBareExpressions = options.printBareExpressions ?? false;

    if (options.onEvent) {
      this.eventHandlers.push(options.onEvent);
    }

    if (existingGlobalEnv) {
      this.globalEnv = existingGlobalEnv;
      this.currentEnv = existingGlobalEnv;
    } else {
      const builtinsEnv = new Environment(null);
      registerBuiltins(builtinsEnv);
      this.initBuiltins(builtinsEnv);
      this.globalEnv = new Environment(builtinsEnv);
      this.currentEnv = this.globalEnv;
    }
  }

  private initBuiltins(builtinsEnv: Environment): void {
    // Register higher-order builtins that invoke interpreter logic (map, filter, reduce, sort)
    builtinsEnv.declareConst('map', {
      kind: 'recipe',
      name: 'map',
      isNative: true,
      fn: (args) => {
        const list = args[0];
        const fn = args[1];
        if (!list || list.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'map expects a list' });
        if (!fn || fn.kind !== 'recipe') throw new IBPError({ kind: 'TypeError', message: 'map expects a recipe' });
        const result: IBPValue[] = [];
        for (const item of list.elements) {
          result.push(this.callRecipeDirect(fn, [item]));
        }
        return makeList(result);
      },
    });

    builtinsEnv.declareConst('filter', {
      kind: 'recipe',
      name: 'filter',
      isNative: true,
      fn: (args) => {
        const list = args[0];
        const fn = args[1];
        if (!list || list.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'filter expects a list' });
        if (!fn || fn.kind !== 'recipe') throw new IBPError({ kind: 'TypeError', message: 'filter expects a recipe' });
        const result: IBPValue[] = [];
        for (const item of list.elements) {
          const res = this.callRecipeDirect(fn, [item]);
          if (res.kind === 'yes/no' && res.value) {
            result.push(item);
          }
        }
        return makeList(result);
      },
    });

    builtinsEnv.declareConst('reduce', {
      kind: 'recipe',
      name: 'reduce',
      isNative: true,
      fn: (args) => {
        const list = args[0];
        const fn = args[1];
        let acc = args[2] || makeEmpty();
        if (!list || list.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'reduce expects a list' });
        if (!fn || fn.kind !== 'recipe') throw new IBPError({ kind: 'TypeError', message: 'reduce expects a recipe' });
        for (const item of list.elements) {
          acc = this.callRecipeDirect(fn, [acc, item]);
        }
        return acc;
      },
    });

    builtinsEnv.declareConst('sort', {
      kind: 'recipe',
      name: 'sort',
      isNative: true,
      fn: (args) => {
        const list = args[0];
        if (!list || list.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'sort expects a list' });
        const customComp = args[1]?.kind === 'recipe' ? args[1] : null;
        const copy = [...list.elements];
        copy.sort((a, b) => {
          if (customComp) {
            const res = this.callRecipeDirect(customComp, [a, b]);
            return res.kind === 'number' ? res.value : 0;
          }
          if (a.kind === 'number' && b.kind === 'number') return a.value - b.value;
          return valueToString(a).localeCompare(valueToString(b));
        });
        return makeList(copy);
      },
    });
  }

  public addEventListener(handler: EventHandler): void {
    this.eventHandlers.push(handler);
  }

  public setBreakpoints(lines: number[]): void {
    this.breakpoints = new Set(lines);
  }

  public getStatus(): ExecutionStatus {
    return this.status;
  }

  public getGlobalEnv(): Environment {
    return this.globalEnv;
  }

  public getCurrentEnv(): Environment {
    return this.currentEnv;
  }

  private emit(event: EngineEvent): void {
    for (const h of this.eventHandlers) {
      h(event);
    }
  }

  private checkLimits(): void {
    this.instructions++;
    if (this.instructions > this.limits.maxInstructions) {
      throw new IBPError({
        kind: 'LimitError',
        message: `Exceeded maximum instruction count of ${this.limits.maxInstructions.toLocaleString()}.`,
        hint: 'Check for infinite loops or reduce iteration size.',
        sourceCode: this.sourceCode,
      });
    }
  }

  private getContext(): ExecutionContext {
    return {
      limits: this.limits,
      instructionsCount: this.instructions,
      currentCallDepth: this.callDepth,
      outputLength: this.outputLength,
      startTime: 0,
      prng: this.prng,
      clock: this.clock,
      storage: this.storage,
      fs: this.fs,
      inputProvider: this.inputProvider,
    };
  }

  // --- Resumable Generator Runner ---
  public *runProgram(program: ProgramNode): Generator<EngineEvent, void, unknown> {
    this.status = 'running';
    const startTime = Date.now();

    try {
      for (const stmt of program.body) {
        if ((this.status as ExecutionStatus) === 'stopped') break;

        const line = stmt.span.start.line;
        if (this.breakpoints.has(line)) {
          this.status = 'paused';
          yield {
            type: 'line-entered',
            span: stmt.span,
            line,
            column: stmt.span.start.column,
          };
          while (this.status === 'paused') {
            yield {
              type: 'line-entered',
              span: stmt.span,
              line,
              column: stmt.span.start.column,
            };
          }
          if (this.status === 'stopped') break;
        }

        yield* this.executeStatement(stmt);
      }

      this.status = 'completed';
      const completedEvent: EngineEvent = {
        type: 'completed',
        totalInstructions: this.instructions,
        durationMs: Date.now() - startTime,
      };
      this.emit(completedEvent);
      yield completedEvent;
    } catch (err: any) {
      this.status = 'error';
      const ibpErr =
        err instanceof IBPError
          ? err
          : new IBPError({
              kind: 'RaisedError',
              message: String(err.message || err),
              sourceCode: this.sourceCode,
            });
      const errEvent: EngineEvent = { type: 'error', error: ibpErr };
      this.emit(errEvent);
      yield errEvent;
      throw ibpErr;
    }
  }

  // Synchronous run all
  public run(program: ProgramNode): void {
    const gen = this.runProgram(program);
    let nextArg: unknown = undefined;
    while (true) {
      const res = gen.next(nextArg);
      if (res.done) break;
      const event = res.value;
      if (event && typeof event === 'object' && event.type === 'awaiting-input') {
        if (this.scriptedInput) {
          if (this.scriptedInput.length === 0) {
            throw new IBPError({
              kind: 'InputError',
              message: 'This program needs input, but none is available.',
              hint: 'Scripted input ran out of values.',
              sourceCode: this.sourceCode,
            });
          }
          nextArg = this.scriptedInput.shift();
        } else {
          throw new IBPError({
            kind: 'InputError',
            message: 'This program needs input, but none is available.',
            hint: 'Provide an input source or run interactively.',
            sourceCode: this.sourceCode,
          });
        }
      } else {
        nextArg = undefined;
      }
    }
  }

  public getLastExprValue(): IBPValue | undefined {
    return this.lastExprValue;
  }

  public evalExpressionDirect(expr: Expression): IBPValue {
    return this.evalExpression(expr);
  }

  public executeStatementDirect(stmt: Statement): Generator<EngineEvent, JumpSignal | void, unknown> {
    return this.executeStatement(stmt);
  }

  public emitDirect(ev: EngineEvent): void {
    this.emit(ev);
  }

  // Step single statement
  public step(program: ProgramNode): boolean {
    if (!this.activeGenerator) {
      this.activeGenerator = this.runProgram(program);
    }
    const res = this.activeGenerator.next();
    return !res.done;
  }

  public pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'running';
    }
  }

  public stop(): void {
    this.status = 'stopped';
    this.activeGenerator = null;
  }

  // --- Statement Execution Generator ---
  private *executeStatement(stmt: Statement): Generator<EngineEvent, JumpSignal | void, unknown> {
    this.checkLimits();

    const lineEvent: EngineEvent = {
      type: 'line-entered',
      span: stmt.span,
      line: stmt.span.start.line,
      column: stmt.span.start.column,
    };
    this.emit(lineEvent);
    yield lineEvent;

    switch (stmt.type) {
      case 'VarDeclStmt': {
        const initVal = stmt.init ? this.evalExpression(stmt.init) : makeEmpty();
        this.currentEnv.declareVar(stmt.name, initVal, stmt.nameSpan || stmt.span);
        const changeEvent: EngineEvent = {
          type: 'variable-changed',
          name: stmt.name,
          newValue: initVal,
          scopeLevel: this.currentEnv.level,
        };
        this.emit(changeEvent);
        yield changeEvent;
        return;
      }
      case 'ConstDeclStmt': {
        const initVal = this.evalExpression(stmt.init);
        this.currentEnv.declareConst(stmt.name, initVal, stmt.nameSpan || stmt.span);
        const changeEvent: EngineEvent = {
          type: 'variable-changed',
          name: stmt.name,
          newValue: initVal,
          scopeLevel: this.currentEnv.level,
        };
        this.emit(changeEvent);
        yield changeEvent;
        return;
      }
      case 'AssignStmt': {
        const val = this.evalExpression(stmt.value);
        this.assignTarget(stmt.target, val);
        return;
      }
      case 'OutputStmt': {
        const expressions = stmt.values && stmt.values.length > 0 ? stmt.values : [stmt.value];
        const pieces = expressions.map((e) => valueToString(this.evalExpression(e)));
        let text = pieces.join(' ');
        if (stmt.mode === 'shout') text = text.toUpperCase();
        else if (stmt.mode === 'whisper') text = text.toLowerCase();

        this.outputLength += text.length + 1;
        if (this.outputLength > this.limits.maxOutputLength) {
          throw new IBPError({
            kind: 'LimitError',
            message: `Output size exceeded maximum limit of ${this.limits.maxOutputLength.toLocaleString()} characters.`,
            span: stmt.span,
            sourceCode: this.sourceCode,
          });
        }

        const outEvent: EngineEvent = { type: 'output', text, mode: stmt.mode };
        this.emit(outEvent);
        yield outEvent;
        return;
      }
      case 'InputStmt': {
        const promptVal = this.evalExpression(stmt.prompt);
        const promptStr = valueToString(promptVal);
        const kind: 'text' | 'number' = stmt.kind || (stmt.isNumber ? 'number' : 'text');
        let invalidCount = 0;
        let finalVal: IBPValue;

        while (true) {
          if ((this.status as ExecutionStatus) === 'stopped') return;

          const reqEvent: EngineEvent = {
            type: 'awaiting-input',
            prompt: promptStr,
            kind,
          };
          this.emit(reqEvent);
          let rawInput: unknown = yield reqEvent;

          if ((this.status as ExecutionStatus) === 'stopped') return;

          if (rawInput === undefined || rawInput === null) {
            if (this.scriptedInput) {
              if (this.scriptedInput.length === 0) {
                throw new IBPError({
                  kind: 'InputError',
                  message: 'This program needs input, but none is available.',
                  hint: 'Scripted input ran out of values.',
                  span: stmt.targetSpan || stmt.span,
                  sourceCode: this.sourceCode,
                });
              }
              rawInput = this.scriptedInput.shift();
            } else {
              throw new IBPError({
                kind: 'InputError',
                message: 'This program needs input, but none is available.',
                hint: 'Provide input when prompted.',
                span: stmt.targetSpan || stmt.span,
                sourceCode: this.sourceCode,
              });
            }
          }

          const inputStr = String(rawInput);
          const transcriptText = promptStr
            ? (promptStr.endsWith(' ') ? `${promptStr}${inputStr}` : `${promptStr} ${inputStr}`)
            : inputStr;
          const transcriptEvent: EngineEvent = {
            type: 'output',
            text: transcriptText,
            mode: 'say',
          };
          this.emit(transcriptEvent);
          yield transcriptEvent;

          if (kind === 'number') {
            const trimmed = inputStr.trim();
            const num = Number(trimmed);
            if (trimmed === '' || isNaN(num) || !isFinite(num)) {
              invalidCount++;
              if (invalidCount >= 5) {
                throw new IBPError({
                  kind: 'InputError',
                  message: `Expected a number after 5 attempts, but received "${inputStr}".`,
                  hint: 'Enter a valid number such as 10, -5, or 3.14.',
                  span: stmt.targetSpan || stmt.span,
                  sourceCode: this.sourceCode,
                });
              }
              const retryEvent: EngineEvent = {
                type: 'output',
                text: "That wasn't a number. Try again.",
                mode: 'whisper',
              };
              this.emit(retryEvent);
              yield retryEvent;
              continue;
            }
            finalVal = makeNumber(num);
            break;
          } else {
            finalVal = makeText(inputStr);
            break;
          }
        }

        this.currentEnv.assignOrDeclare(stmt.target, finalVal, stmt.targetSpan || stmt.span);
        const changeEvent: EngineEvent = {
          type: 'variable-changed',
          name: stmt.target,
          newValue: finalVal,
          scopeLevel: this.currentEnv.level,
        };
        this.emit(changeEvent);
        yield changeEvent;
        return;
      }
      case 'WhenStmt': {
        const cond = this.evalExpression(stmt.condition);
        if (this.isTruthy(cond)) {
          return yield* this.executeBlock(stmt.body);
        }
        for (const branch of stmt.orwhenBranches) {
          const branchCond = this.evalExpression(branch.condition);
          if (this.isTruthy(branchCond)) {
            return yield* this.executeBlock(branch.body);
          }
        }
        if (stmt.otherwiseBranch) {
          return yield* this.executeBlock(stmt.otherwiseBranch);
        }
        return;
      }
      case 'UnlessStmt': {
        const cond = this.evalExpression(stmt.condition);
        if (!this.isTruthy(cond)) {
          return yield* this.executeBlock(stmt.body);
        }
        return;
      }
      case 'RepeatStmt': {
        const countVal = this.evalExpression(stmt.count);
        if (countVal.kind !== 'number') {
          throw new IBPError({
            kind: 'TypeError',
            message: `Repeat count must be a number, got "${countVal.kind}".`,
            span: stmt.count.span,
            sourceCode: this.sourceCode,
          });
        }
        const count = Math.max(0, Math.floor(countVal.value));
        for (let i = 0; i < count; i++) {
          if (i > this.limits.maxLoopIterations) {
            throw new IBPError({
              kind: 'LimitError',
              message: `Repeat loop exceeded iteration limit of ${this.limits.maxLoopIterations.toLocaleString()}.`,
              span: stmt.span,
              sourceCode: this.sourceCode,
            });
          }
          const jump = yield* this.executeBlock(stmt.body);
          if (jump) {
            if (jump.type === 'give') return jump;
            if (jump.type === 'stop') break;
            if (jump.type === 'skip') continue;
          }
        }
        return;
      }
      case 'CountStmt': {
        const fromVal = this.evalExpression(stmt.from);
        const toVal = this.evalExpression(stmt.to);
        const stepVal = stmt.step ? this.evalExpression(stmt.step) : makeNumber(1);

        if (fromVal.kind !== 'number' || toVal.kind !== 'number' || stepVal.kind !== 'number') {
          throw new IBPError({
            kind: 'TypeError',
            message: 'Count bounds and step must be numbers.',
            span: stmt.span,
            sourceCode: this.sourceCode,
          });
        }

        const start = fromVal.value;
        const end = toVal.value;
        const rawStep = stepVal.value;
        const step = rawStep === 0 ? 1 : Math.abs(rawStep);
        const ascending = start <= end;

        let iterations = 0;
        let curr = start;

        while (ascending ? curr <= end : curr >= end) {
          iterations++;
          if (iterations > this.limits.maxLoopIterations) {
            throw new IBPError({
              kind: 'LimitError',
              message: `Count loop exceeded iteration limit of ${this.limits.maxLoopIterations.toLocaleString()}.`,
              span: stmt.span,
              sourceCode: this.sourceCode,
            });
          }

          const loopEnv = new Environment(this.currentEnv);
          loopEnv.declareVar(stmt.variable, makeNumber(curr), stmt.span);
          const prevEnv = this.currentEnv;
          this.currentEnv = loopEnv;

          let jump: JumpSignal | void;
          try {
            jump = yield* this.executeBlockStatements(stmt.body.body);
          } finally {
            this.currentEnv = prevEnv;
          }

          if (jump) {
            if (jump.type === 'give') return jump;
            if (jump.type === 'stop') break;
            if (jump.type === 'skip') {
              curr = ascending ? curr + step : curr - step;
              continue;
            }
          }

          curr = ascending ? curr + step : curr - step;
        }
        return;
      }
      case 'EachStmt': {
        const colVal = this.evalExpression(stmt.collection);
        let items: IBPValue[] = [];
        if (colVal.kind === 'list') {
          items = colVal.elements;
        } else if (colVal.kind === 'text') {
          items = Array.from(colVal.value).map(makeText);
        } else if (colVal.kind === 'range') {
          const step = colVal.step === 0 ? 1 : Math.abs(colVal.step);
          const asc = colVal.start <= colVal.end;
          let c = colVal.start;
          while (asc ? c <= colVal.end : c >= colVal.end) {
            items.push(makeNumber(c));
            c = asc ? c + step : c - step;
          }
        } else if (colVal.kind === 'box') {
          items = Array.from(colVal.fields.keys()).map(makeText);
        } else {
          throw new IBPError({
            kind: 'TypeError',
            message: `Cannot iterate over kind "${colVal.kind}". "each" expects a list, text, range, or box.`,
            span: stmt.collection.span,
            sourceCode: this.sourceCode,
          });
        }

        let iterations = 0;
        for (const item of items) {
          iterations++;
          if (iterations > this.limits.maxLoopIterations) {
            throw new IBPError({
              kind: 'LimitError',
              message: `Loop exceeded iteration limit of ${this.limits.maxLoopIterations.toLocaleString()}.`,
              span: stmt.span,
              sourceCode: this.sourceCode,
            });
          }

          const loopEnv = new Environment(this.currentEnv);
          loopEnv.declareVar(stmt.variable, item, stmt.span);
          const prevEnv = this.currentEnv;
          this.currentEnv = loopEnv;

          let jump: JumpSignal | void;
          try {
            jump = yield* this.executeBlockStatements(stmt.body.body);
          } finally {
            this.currentEnv = prevEnv;
          }

          if (jump) {
            if (jump.type === 'give') return jump;
            if (jump.type === 'stop') break;
            if (jump.type === 'skip') continue;
          }
        }
        return;
      }
      case 'WhileStmt': {
        let iterations = 0;
        while (this.isTruthy(this.evalExpression(stmt.condition))) {
          iterations++;
          if (iterations > this.limits.maxLoopIterations) {
            throw new IBPError({
              kind: 'LimitError',
              message: `While loop exceeded iteration limit of ${this.limits.maxLoopIterations.toLocaleString()}.`,
              span: stmt.span,
              sourceCode: this.sourceCode,
            });
          }
          const jump = yield* this.executeBlock(stmt.body);
          if (jump) {
            if (jump.type === 'give') return jump;
            if (jump.type === 'stop') break;
            if (jump.type === 'skip') continue;
          }
        }
        return;
      }
      case 'ForeverStmt': {
        let iterations = 0;
        while (true) {
          iterations++;
          if (iterations > this.limits.maxLoopIterations) {
            throw new IBPError({
              kind: 'LimitError',
              message: `Forever loop exceeded safety limit of ${this.limits.maxLoopIterations.toLocaleString()} iterations.`,
              span: stmt.span,
              sourceCode: this.sourceCode,
            });
          }
          const jump = yield* this.executeBlock(stmt.body);
          if (jump) {
            if (jump.type === 'give') return jump;
            if (jump.type === 'stop') break;
            if (jump.type === 'skip') continue;
          }
        }
        return;
      }
      case 'RecipeDeclStmt': {
        const recipeVal: UserRecipe = {
          kind: 'recipe',
          name: stmt.name,
          isNative: false,
          params: stmt.params,
          body: stmt.body,
          isArrow: stmt.isArrow,
          closure: this.currentEnv,
        };
        this.currentEnv.declareConst(stmt.name, recipeVal, stmt.span);
        const changeEvent: EngineEvent = {
          type: 'variable-changed',
          name: stmt.name,
          newValue: recipeVal,
          scopeLevel: this.currentEnv.level,
        };
        this.emit(changeEvent);
        yield changeEvent;
        return;
      }
      case 'BoxDeclStmt': {
        const boxMap = new Map<string, IBPValue>();
        for (const entry of stmt.entries) {
          boxMap.set(entry.key, this.evalExpression(entry.value));
        }
        const boxVal = makeBox(boxMap);
        this.currentEnv.declareVar(stmt.name, boxVal, stmt.span);
        const changeEvent: EngineEvent = {
          type: 'variable-changed',
          name: stmt.name,
          newValue: boxVal,
          scopeLevel: this.currentEnv.level,
        };
        this.emit(changeEvent);
        yield changeEvent;
        return;
      }
      case 'AddStmt': {
        const itemVal = this.evalExpression(stmt.item);
        const targetVal = this.currentEnv.get(stmt.target, stmt.targetSpan || stmt.span);
        if (targetVal.kind !== 'list') {
          throw new IBPError({
            kind: 'TypeError',
            message: `Cannot add item to "${stmt.target}". Target must be a list, found "${targetVal.kind}".`,
            span: stmt.targetSpan || stmt.span,
            sourceCode: this.sourceCode,
          });
        }
        targetVal.elements.push(itemVal);
        return;
      }
      case 'RemoveStmt': {
        const itemVal = this.evalExpression(stmt.item);
        const targetVal = this.currentEnv.get(stmt.target, stmt.targetSpan || stmt.span);
        if (targetVal.kind !== 'list') {
          throw new IBPError({
            kind: 'TypeError',
            message: `Cannot remove item from "${stmt.target}". Target must be a list, found "${targetVal.kind}".`,
            span: stmt.targetSpan || stmt.span,
            sourceCode: this.sourceCode,
          });
        }
        const idx = targetVal.elements.findIndex((el) => valuesEqual(el, itemVal));
        if (idx >= 0) {
          targetVal.elements.splice(idx, 1);
        }
        return;
      }
      case 'AttemptStmt': {
        try {
          const jump = yield* this.executeBlock(stmt.attemptBody);
          if (jump) return jump;
        } catch (err: any) {
          const rescueEnv = new Environment(this.currentEnv);
          const errObj = makeBox({
            message: makeText(err instanceof Error ? err.message : String(err)),
            kind: makeText(err instanceof IBPError ? err.kind : 'Error'),
          });
          rescueEnv.declareVar(stmt.errorVar, errObj, stmt.span);
          const prevEnv = this.currentEnv;
          this.currentEnv = rescueEnv;
          try {
            const jump = yield* this.executeBlockStatements(stmt.rescueBody.body);
            if (jump) return jump;
          } finally {
            this.currentEnv = prevEnv;
          }
        } finally {
          if (stmt.alwaysBody) {
            yield* this.executeBlock(stmt.alwaysBody);
          }
        }
        return;
      }
      case 'RaiseStmt': {
        const val = this.evalExpression(stmt.value);
        throw new IBPError({
          kind: 'RaisedError',
          message: valueToString(val),
          span: stmt.span,
          sourceCode: this.sourceCode,
        });
      }
      case 'ExpectStmt': {
        let actual: IBPValue;
        let passed = false;
        let expected: IBPValue | undefined;

        if (stmt.expression.type === 'BinaryExpr' && (stmt.expression.operator === '==' || stmt.expression.operator === 'is')) {
          const leftVal = this.evalExpression(stmt.expression.left);
          const rightVal = this.evalExpression(stmt.expression.right);
          actual = leftVal;
          expected = rightVal;
          passed = valuesEqual(leftVal, rightVal);
        } else {
          actual = this.evalExpression(stmt.expression);
          passed = this.isTruthy(actual);
        }

        if (passed) {
          const passEvent: EngineEvent = { type: 'check-passed', label: stmt.label, actual };
          this.emit(passEvent);
          yield passEvent;
        } else {
          const failEvent: EngineEvent = {
            type: 'check-failed',
            label: stmt.label,
            actual,
            expected,
            message: expected
              ? `Expected ${valueToString(expected)} but got ${valueToString(actual)}`
              : `Expected truthy value but got ${valueToString(actual)}`,
          };
          this.emit(failEvent);
          yield failEvent;
        }
        return;
      }
      case 'WaitStmt': {
        const durVal = this.evalExpression(stmt.duration);
        const secs = durVal.kind === 'number' ? Math.max(0, durVal.value) : 0;
        const waitEvent: EngineEvent = { type: 'waiting', durationSeconds: secs };
        this.emit(waitEvent);
        yield waitEvent;
        this.clock.advance(secs);
        return;
      }
      case 'RememberStmt': {
        const keyVal = this.evalExpression(stmt.key);
        const val = this.evalExpression(stmt.value);
        this.storage.setItem(valueToString(keyVal), JSON.stringify(val.kind === 'text' ? val.value : (val as any).value ?? valueToString(val)));
        return;
      }
      case 'CelebrateStmt': {
        const celEvent: EngineEvent = { type: 'celebrate', timestamp: Date.now() };
        this.emit(celEvent);
        yield celEvent;
        return;
      }
      case 'TodoStmt': {
        const todoEvent: EngineEvent = { type: 'todo', text: stmt.text, span: stmt.span };
        this.emit(todoEvent);
        yield todoEvent;
        return;
      }
      case 'SeedStmt': {
        const seedVal = this.evalExpression(stmt.seed);
        if (seedVal.kind === 'number') {
          this.prng.setSeed(seedVal.value);
        }
        return;
      }
      case 'StopStmt': {
        return { type: 'stop' };
      }
      case 'SkipStmt': {
        return { type: 'skip' };
      }
      case 'GiveStmt': {
        const val = stmt.value ? this.evalExpression(stmt.value) : makeEmpty();
        return { type: 'give', value: val };
      }
      case 'ExprStmt': {
        const val = this.evalExpression(stmt.expression);
        this.lastExprValue = val;
        if (this.printBareExpressions) {
          const outText = valueToString(val);
          this.outputLength += outText.length + 1;
          const outEv: EngineEvent = { type: 'output', text: outText, mode: 'say' };
          this.emit(outEv);
          yield outEv;
        }
        return;
      }
      case 'BlockStmt': {
        return yield* this.executeBlock(stmt);
      }
    }
  }

  private *executeBlock(block: BlockStmt): Generator<EngineEvent, JumpSignal | void, unknown> {
    const blockEnv = new Environment(this.currentEnv);
    const prevEnv = this.currentEnv;
    this.currentEnv = blockEnv;
    try {
      return yield* this.executeBlockStatements(block.body);
    } finally {
      this.currentEnv = prevEnv;
    }
  }

  private *executeBlockStatements(statements: Statement[]): Generator<EngineEvent, JumpSignal | void, unknown> {
    for (const stmt of statements) {
      const jump = yield* this.executeStatement(stmt);
      if (jump) return jump;
    }
  }

  private assignTarget(target: any, value: IBPValue): void {
    if (target.type === 'IdentifierExpr') {
      this.currentEnv.assign(target.name, value, target.span);
      const changeEvent: EngineEvent = {
        type: 'variable-changed',
        name: target.name,
        newValue: value,
        scopeLevel: this.currentEnv.level,
      };
      this.emit(changeEvent);
      return;
    }

    if (target.type === 'IndexExpr') {
      const col = this.evalExpression(target.target);
      const idxVal = this.evalExpression(target.index);
      if (col.kind === 'list') {
        if (idxVal.kind !== 'number') {
          throw new IBPError({ kind: 'TypeError', message: 'List index must be a number' });
        }
        const index = Math.floor(idxVal.value);
        if (index < 0 || index >= col.elements.length) {
          throw new IBPError({ kind: 'RangeError', message: `Index ${index} is out of bounds for list of length ${col.elements.length}.` });
        }
        col.elements[index] = value;
        return;
      }
      if (col.kind === 'box') {
        col.fields.set(valueToString(idxVal), value);
        return;
      }
      throw new IBPError({ kind: 'TypeError', message: `Cannot index assign into kind "${col.kind}".` });
    }

    if (target.type === 'MemberExpr') {
      const boxVal = this.evalExpression(target.target);
      if (boxVal.kind !== 'box') {
        throw new IBPError({ kind: 'TypeError', message: `Cannot set property "${target.property}" on non-box kind "${boxVal.kind}".` });
      }
      boxVal.fields.set(target.property, value);
      return;
    }
  }

  // --- Expression Evaluation ---
  public evalExpression(expr: Expression): IBPValue {
    this.checkLimits();

    switch (expr.type) {
      case 'NumberLiteral':
        return makeNumber(expr.value);
      case 'StringLiteral':
        return makeText(expr.value);
      case 'BooleanLiteral':
        return makeBoolean(expr.value);
      case 'EmptyLiteral':
        return makeEmpty();
      case 'IdentifierExpr':
        return this.currentEnv.get(expr.name, expr.span);
      case 'ListLiteral':
        return makeList(expr.elements.map((el) => this.evalExpression(el)));
      case 'BoxLiteral': {
        const map = new Map<string, IBPValue>();
        for (const entry of expr.entries) {
          map.set(entry.key, this.evalExpression(entry.value));
        }
        return makeBox(map);
      }
      case 'InterpolatedStringExpr': {
        let result = '';
        for (const part of expr.parts) {
          if (part.type === 'text') {
            result += part.value;
          } else {
            const val = this.evalExpression(part.value);
            result += valueToString(val);
          }
        }
        return makeText(result);
      }
      case 'RangeExpr': {
        const startVal = this.evalExpression(expr.start);
        const endVal = this.evalExpression(expr.end);
        if (startVal.kind !== 'number' || endVal.kind !== 'number') {
          throw new IBPError({ kind: 'TypeError', message: 'Range bounds must be numbers.' });
        }
        return makeRange(startVal.value, endVal.value);
      }
      case 'UnaryExpr': {
        const operand = this.evalExpression(expr.operand);
        if (expr.operator === '-') {
          if (operand.kind !== 'number') {
            throw new IBPError({ kind: 'TypeError', message: 'Cannot negate non-number.' });
          }
          return makeNumber(-operand.value);
        }
        if (expr.operator === 'not') {
          return makeBoolean(!this.isTruthy(operand));
        }
        throw new IBPError({ kind: 'SyntaxError', message: `Unknown unary operator "${expr.operator}".` });
      }
      case 'BinaryExpr': {
        return this.evalBinary(expr);
      }
      case 'PipeExpr': {
        const leftVal = this.evalExpression(expr.left);
        // Pipe syntax: left |> right
        if (expr.right.type === 'CallExpr') {
          // Pass leftVal as first argument
          const callee = this.evalExpression(expr.right.callee);
          const args = [leftVal, ...expr.right.arguments.map((a) => this.evalExpression(a))];
          return this.callRecipeDirect(callee, args, expr.right.span);
        }
        if (expr.right.type === 'IdentifierExpr') {
          // Identifier used directly in pipe: e.g. list |> total |> say
          if (expr.right.name === 'say' || expr.right.name === 'shout' || expr.right.name === 'whisper') {
            let text = valueToString(leftVal);
            if (expr.right.name === 'shout') text = text.toUpperCase();
            if (expr.right.name === 'whisper') text = text.toLowerCase();
            this.emit({ type: 'output', text, mode: expr.right.name });
            return leftVal;
          }
          const callee = this.currentEnv.get(expr.right.name, expr.right.span);
          return this.callRecipeDirect(callee, [leftVal], expr.right.span);
        }
        throw new IBPError({ kind: 'SyntaxError', message: 'Right side of pipe must be a recipe call or recipe name.' });
      }
      case 'CallExpr': {
        const callee = this.evalExpression(expr.callee);
        const args = expr.arguments.map((a) => this.evalExpression(a));
        return this.callRecipeDirect(callee, args, expr.span);
      }
      case 'IndexExpr': {
        const target = this.evalExpression(expr.target);
        const indexVal = this.evalExpression(expr.index);

        if (target.kind === 'list') {
          if (indexVal.kind !== 'number') {
            throw new IBPError({ kind: 'TypeError', message: 'List index must be a number.' });
          }
          const idx = Math.floor(indexVal.value);
          if (idx < 0 || idx >= target.elements.length) {
            throw new IBPError({
              kind: 'RangeError',
              message: `List index ${idx} is out of bounds (length ${target.elements.length}).`,
            });
          }
          return target.elements[idx];
        }

        if (target.kind === 'text') {
          if (indexVal.kind !== 'number') {
            throw new IBPError({ kind: 'TypeError', message: 'Text index must be a number.' });
          }
          const idx = Math.floor(indexVal.value);
          if (idx < 0 || idx >= target.value.length) {
            throw new IBPError({
              kind: 'RangeError',
              message: `Text index ${idx} is out of bounds (length ${target.value.length}).`,
            });
          }
          return makeText(target.value[idx]);
        }

        if (target.kind === 'box') {
          const key = valueToString(indexVal);
          return target.fields.get(key) || makeEmpty();
        }

        throw new IBPError({ kind: 'TypeError', message: `Cannot index into value of kind "${target.kind}".` });
      }
      case 'MemberExpr': {
        const target = this.evalExpression(expr.target);
        if (target.kind === 'empty' && expr.isSafe) {
          return makeEmpty();
        }
        if (expr.property === 'length') {
          if (target.kind === 'list') return makeNumber(target.elements.length);
          if (target.kind === 'text') return makeNumber(target.value.length);
          if (target.kind === 'range') return makeNumber(Math.max(0, Math.floor((target.end - target.start) / target.step) + 1));
          if (target.kind === 'box') return makeNumber(target.fields.size);
        }
        if (target.kind === 'box') {
          return target.fields.get(expr.property) || makeEmpty();
        }
        if (expr.isSafe) return makeEmpty();
        throw new IBPError({
          kind: 'TypeError',
          message: `Cannot access property "${expr.property}" on kind "${target.kind}".`,
          span: expr.span,
        });
      }
    }
  }

  private evalBinary(expr: BinaryExpr): IBPValue {
    // Short-circuiting for logical operators
    if (expr.operator === 'and') {
      const left = this.evalExpression(expr.left);
      if (!this.isTruthy(left)) return makeBoolean(false);
      const right = this.evalExpression(expr.right);
      return makeBoolean(this.isTruthy(right));
    }
    if (expr.operator === 'or') {
      const left = this.evalExpression(expr.left);
      if (this.isTruthy(left)) return makeBoolean(true);
      const right = this.evalExpression(expr.right);
      return makeBoolean(this.isTruthy(right));
    }

    const left = this.evalExpression(expr.left);
    const right = this.evalExpression(expr.right);

    switch (expr.operator) {
      case '==':
      case 'is':
        return makeBoolean(valuesEqual(left, right));
      case '!=':
      case 'isnt':
        return makeBoolean(!valuesEqual(left, right));
      case '<':
      case 'below':
        return makeBoolean(this.compareValues(left, right) < 0);
      case '>':
      case 'above':
        return makeBoolean(this.compareValues(left, right) > 0);
      case '<=':
        return makeBoolean(this.compareValues(left, right) <= 0);
      case '>=':
        return makeBoolean(this.compareValues(left, right) >= 0);
      case '+': {
        if (left.kind === 'number' && right.kind === 'number') {
          return makeNumber(left.value + right.value);
        }
        if (left.kind === 'text' || right.kind === 'text') {
          return makeText(valueToString(left) + valueToString(right));
        }
        if (left.kind === 'list' && right.kind === 'list') {
          return makeList([...left.elements, ...right.elements]);
        }
        throw new IBPError({ kind: 'TypeError', message: `Cannot add "${left.kind}" and "${right.kind}".` });
      }
      case '-': {
        if (left.kind === 'number' && right.kind === 'number') {
          return makeNumber(left.value - right.value);
        }
        throw new IBPError({ kind: 'TypeError', message: `Cannot subtract "${right.kind}" from "${left.kind}".` });
      }
      case '*': {
        if (left.kind === 'number' && right.kind === 'number') {
          return makeNumber(left.value * right.value);
        }
        if (left.kind === 'text' && right.kind === 'number') {
          return makeText(left.value.repeat(Math.max(0, Math.floor(right.value))));
        }
        throw new IBPError({ kind: 'TypeError', message: `Cannot multiply "${left.kind}" by "${right.kind}".` });
      }
      case '/': {
        if (left.kind === 'number' && right.kind === 'number') {
          if (right.value === 0) {
            throw new IBPError({ kind: 'MathError', message: 'Division by zero is not allowed.' });
          }
          return makeNumber(left.value / right.value);
        }
        throw new IBPError({ kind: 'TypeError', message: `Cannot divide "${left.kind}" by "${right.kind}".` });
      }
      case '%': {
        if (left.kind === 'number' && right.kind === 'number') {
          if (right.value === 0) {
            throw new IBPError({ kind: 'MathError', message: 'Modulo by zero is not allowed.' });
          }
          return makeNumber(left.value % right.value);
        }
        throw new IBPError({ kind: 'TypeError', message: `Cannot modulo "${left.kind}" by "${right.kind}".` });
      }
      case '**': {
        if (left.kind === 'number' && right.kind === 'number') {
          return makeNumber(Math.pow(left.value, right.value));
        }
        throw new IBPError({ kind: 'TypeError', message: `Cannot raise "${left.kind}" to power "${right.kind}".` });
      }
      case 'in': {
        if (right.kind === 'list') {
          return makeBoolean(right.elements.some((el) => valuesEqual(el, left)));
        }
        if (right.kind === 'text') {
          return makeBoolean(right.value.includes(valueToString(left)));
        }
        if (right.kind === 'box') {
          return makeBoolean(right.fields.has(valueToString(left)));
        }
        if (right.kind === 'range') {
          if (left.kind === 'number') {
            const min = Math.min(right.start, right.end);
            const max = Math.max(right.start, right.end);
            return makeBoolean(left.value >= min && left.value <= max);
          }
          return makeBoolean(false);
        }
        throw new IBPError({ kind: 'TypeError', message: `"in" operator expects list, text, range, or box on right side.` });
      }
    }
  }

  private compareValues(a: IBPValue, b: IBPValue): number {
    if (a.kind === 'number' && b.kind === 'number') {
      return a.value - b.value;
    }
    if (a.kind === 'text' && b.kind === 'text') {
      return a.value.localeCompare(b.value);
    }
    throw new IBPError({ kind: 'TypeError', message: `Cannot compare "${a.kind}" with "${b.kind}".` });
  }

  private isTruthy(val: IBPValue): boolean {
    if (val.kind === 'empty') return false;
    if (val.kind === 'yes/no') return val.value;
    if (val.kind === 'number') return val.value !== 0;
    if (val.kind === 'text') return val.value.length > 0;
    if (val.kind === 'list') return val.elements.length > 0;
    if (val.kind === 'box') return val.fields.size > 0;
    return true;
  }

  public callRecipeDirect(recipeVal: IBPValue, args: IBPValue[], span?: any): IBPValue {
    if (recipeVal.kind !== 'recipe') {
      throw new IBPError({
        kind: 'TypeError',
        message: `Cannot call non-recipe value of kind "${recipeVal.kind}".`,
        span,
      });
    }

    this.callDepth++;
    if (this.callDepth > this.limits.maxRecursionDepth) {
      throw new IBPError({
        kind: 'LimitError',
        message: `Exceeded maximum call stack depth of ${this.limits.maxRecursionDepth}. Possible infinite recursion.`,
        span,
        sourceCode: this.sourceCode,
      });
    }

    this.emit({ type: 'call-pushed', recipeName: recipeVal.name, args, depth: this.callDepth });

    try {
      if (recipeVal.isNative) {
        const result = recipeVal.fn(args, this.getContext());
        this.emit({ type: 'call-popped', recipeName: recipeVal.name, returnValue: result, depth: this.callDepth });
        return result;
      }

      // User recipe
      const callEnv = new Environment(recipeVal.closure);
      for (let i = 0; i < recipeVal.params.length; i++) {
        const param = recipeVal.params[i];
        let argVal = args[i];
        if (argVal === undefined && param.defaultValue) {
          const prevEnv = this.currentEnv;
          this.currentEnv = callEnv;
          try {
            argVal = this.evalExpression(param.defaultValue);
          } finally {
            this.currentEnv = prevEnv;
          }
        }
        callEnv.declareVar(param.name, argVal ?? makeEmpty());
      }

      const prevEnv = this.currentEnv;
      this.currentEnv = callEnv;

      try {
        if (recipeVal.isArrow) {
          const result = this.evalExpression(recipeVal.body as Expression);
          this.emit({ type: 'call-popped', recipeName: recipeVal.name, returnValue: result, depth: this.callDepth });
          return result;
        }

        // Block recipe
        const block = recipeVal.body as BlockStmt;
        const gen = this.executeBlockStatements(block.body);
        let retVal: IBPValue = makeEmpty();

        while (true) {
          const stepRes = gen.next();
          if (stepRes.done) {
            if (stepRes.value && stepRes.value.type === 'give') {
              retVal = stepRes.value.value ?? makeEmpty();
            }
            break;
          }
        }

        this.emit({ type: 'call-popped', recipeName: recipeVal.name, returnValue: retVal, depth: this.callDepth });
        return retVal;
      } finally {
        this.currentEnv = prevEnv;
      }
    } finally {
      this.callDepth--;
    }
  }
}

export function executeIBP(source: string, options: InterpreterOptions = {}): {
  events: EngineEvent[];
  output: string[];
  error?: IBPError;
} {
  const events: EngineEvent[] = [];
  const output: string[] = [];

  const opts: InterpreterOptions = {
    ...options,
    sourceCode: source,
    scriptedInput: options.scriptedInput ? [...options.scriptedInput] : undefined,
    onEvent: (ev) => {
      events.push(ev);
      if (ev.type === 'output') output.push(ev.text);
      if (options.onEvent) options.onEvent(ev);
    },
  };

  const tokens = tokenize(source);
  const parser = new Parser(tokens, source);
  const { program, errors } = parser.parse();

  if (errors.length > 0) {
    return {
      events,
      output,
      error: errors[0],
    };
  }

  const interpreter = new Interpreter(opts);
  try {
    interpreter.run(program);
    return { events, output };
  } catch (err: any) {
    return {
      events,
      output,
      error: err instanceof IBPError ? err : new IBPError({ kind: 'RaisedError', message: String(err) }),
    };
  }
}
