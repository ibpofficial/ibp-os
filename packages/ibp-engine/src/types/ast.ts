import { SourceSpan } from './tokens';

export type ASTNode = Statement | Expression;

export type Statement =
  | VarDeclStmt
  | ConstDeclStmt
  | AssignStmt
  | OutputStmt
  | InputStmt
  | WhenStmt
  | UnlessStmt
  | RepeatStmt
  | CountStmt
  | EachStmt
  | WhileStmt
  | ForeverStmt
  | RecipeDeclStmt
  | BoxDeclStmt
  | AddStmt
  | RemoveStmt
  | AttemptStmt
  | RaiseStmt
  | ExpectStmt
  | WaitStmt
  | RememberStmt
  | CelebrateStmt
  | TodoStmt
  | SeedStmt
  | StopStmt
  | SkipStmt
  | GiveStmt
  | ExprStmt
  | BlockStmt;

export interface BaseNode {
  span: SourceSpan;
}

export interface ProgramNode extends BaseNode {
  type: 'Program';
  body: Statement[];
}

export interface BlockStmt extends BaseNode {
  type: 'BlockStmt';
  body: Statement[];
}

export interface VarDeclStmt extends BaseNode {
  type: 'VarDeclStmt';
  name: string;
  init?: Expression;
}

export interface ConstDeclStmt extends BaseNode {
  type: 'ConstDeclStmt';
  name: string;
  init: Expression;
}

export interface AssignStmt extends BaseNode {
  type: 'AssignStmt';
  target: TargetExpr;
  value: Expression;
}

export type TargetExpr = IdentifierExpr | IndexExpr | MemberExpr;

export interface OutputStmt extends BaseNode {
  type: 'OutputStmt';
  mode: 'say' | 'shout' | 'whisper';
  value: Expression;
  values?: Expression[];
}

export interface InputStmt extends BaseNode {
  type: 'InputStmt';
  isNumber: boolean;
  prompt: Expression;
  target: string;
}

export interface WhenBranch {
  condition: Expression;
  body: BlockStmt;
  span: SourceSpan;
}

export interface WhenStmt extends BaseNode {
  type: 'WhenStmt';
  condition: Expression;
  body: BlockStmt;
  orwhenBranches: WhenBranch[];
  otherwiseBranch?: BlockStmt;
}

export interface UnlessStmt extends BaseNode {
  type: 'UnlessStmt';
  condition: Expression;
  body: BlockStmt;
}

export interface RepeatStmt extends BaseNode {
  type: 'RepeatStmt';
  count: Expression;
  body: BlockStmt;
}

export interface CountStmt extends BaseNode {
  type: 'CountStmt';
  variable: string;
  from: Expression;
  to: Expression;
  step?: Expression;
  body: BlockStmt;
}

export interface EachStmt extends BaseNode {
  type: 'EachStmt';
  variable: string;
  collection: Expression;
  body: BlockStmt;
}

export interface WhileStmt extends BaseNode {
  type: 'WhileStmt';
  condition: Expression;
  body: BlockStmt;
}

export interface ForeverStmt extends BaseNode {
  type: 'ForeverStmt';
  body: BlockStmt;
}

export interface RecipeParam {
  name: string;
  defaultValue?: Expression;
}

export interface RecipeDeclStmt extends BaseNode {
  type: 'RecipeDeclStmt';
  name: string;
  params: RecipeParam[];
  body: BlockStmt | Expression; // Block or arrow expr
  isArrow: boolean;
}

export interface BoxEntry {
  key: string;
  value: Expression;
  span: SourceSpan;
}

export interface BoxDeclStmt extends BaseNode {
  type: 'BoxDeclStmt';
  name: string;
  entries: BoxEntry[];
}

export interface AddStmt extends BaseNode {
  type: 'AddStmt';
  item: Expression;
  target: string;
}

export interface RemoveStmt extends BaseNode {
  type: 'RemoveStmt';
  item: Expression;
  target: string;
}

export interface AttemptStmt extends BaseNode {
  type: 'AttemptStmt';
  attemptBody: BlockStmt;
  errorVar: string;
  rescueBody: BlockStmt;
  alwaysBody?: BlockStmt;
}

export interface RaiseStmt extends BaseNode {
  type: 'RaiseStmt';
  value: Expression;
}

export interface ExpectStmt extends BaseNode {
  type: 'ExpectStmt';
  label?: string;
  expression: Expression;
}

export interface WaitStmt extends BaseNode {
  type: 'WaitStmt';
  duration: Expression;
}

export interface RememberStmt extends BaseNode {
  type: 'RememberStmt';
  key: Expression;
  value: Expression;
}

export interface CelebrateStmt extends BaseNode {
  type: 'CelebrateStmt';
}

export interface TodoStmt extends BaseNode {
  type: 'TodoStmt';
  text: string;
}

export interface SeedStmt extends BaseNode {
  type: 'SeedStmt';
  seed: Expression;
}

export interface StopStmt extends BaseNode {
  type: 'StopStmt';
}

export interface SkipStmt extends BaseNode {
  type: 'SkipStmt';
}

export interface GiveStmt extends BaseNode {
  type: 'GiveStmt';
  value?: Expression;
}

export interface ExprStmt extends BaseNode {
  type: 'ExprStmt';
  expression: Expression;
}

export type Expression =
  | NumberLiteral
  | StringLiteral
  | InterpolatedStringExpr
  | BooleanLiteral
  | EmptyLiteral
  | IdentifierExpr
  | ListLiteral
  | BoxLiteral
  | BinaryExpr
  | UnaryExpr
  | PipeExpr
  | RangeExpr
  | CallExpr
  | IndexExpr
  | MemberExpr;

export interface NumberLiteral extends BaseNode {
  type: 'NumberLiteral';
  value: number;
}

export interface StringLiteral extends BaseNode {
  type: 'StringLiteral';
  value: string;
}

export type StringPart = { type: 'text'; value: string } | { type: 'expr'; value: Expression };

export interface InterpolatedStringExpr extends BaseNode {
  type: 'InterpolatedStringExpr';
  parts: StringPart[];
}

export interface BooleanLiteral extends BaseNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface EmptyLiteral extends BaseNode {
  type: 'EmptyLiteral';
}

export interface IdentifierExpr extends BaseNode {
  type: 'IdentifierExpr';
  name: string;
}

export interface ListLiteral extends BaseNode {
  type: 'ListLiteral';
  elements: Expression[];
}

export interface BoxLiteral extends BaseNode {
  type: 'BoxLiteral';
  entries: BoxEntry[];
}

export type BinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '**'
  | '=='
  | '!='
  | 'is'
  | 'isnt'
  | '<'
  | '>'
  | '<='
  | '>='
  | 'above'
  | 'below'
  | 'and'
  | 'or'
  | 'in';

export interface BinaryExpr extends BaseNode {
  type: 'BinaryExpr';
  left: Expression;
  operator: BinaryOperator;
  right: Expression;
}

export type UnaryOperator = '-' | 'not';

export interface UnaryExpr extends BaseNode {
  type: 'UnaryExpr';
  operator: UnaryOperator;
  operand: Expression;
}

export interface PipeExpr extends BaseNode {
  type: 'PipeExpr';
  left: Expression;
  right: Expression;
}

export interface RangeExpr extends BaseNode {
  type: 'RangeExpr';
  start: Expression;
  end: Expression;
}

export interface CallExpr extends BaseNode {
  type: 'CallExpr';
  callee: Expression;
  arguments: Expression[];
}

export interface IndexExpr extends BaseNode {
  type: 'IndexExpr';
  target: Expression;
  index: Expression;
}

export interface MemberExpr extends BaseNode {
  type: 'MemberExpr';
  target: Expression;
  property: string;
  isSafe: boolean; // ?.
}

