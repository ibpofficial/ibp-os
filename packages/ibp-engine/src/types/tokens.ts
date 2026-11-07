export interface SourceLocation {
  line: number; // 1-based
  column: number; // 1-based
  offset: number; // 0-based character index
}

export interface SourceSpan {
  start: SourceLocation;
  end: SourceLocation;
}

export enum TokenType {
  // Keywords
  Keep = 'KEEP',
  Lock = 'LOCK',
  Say = 'SAY',
  Shout = 'SHOUT',
  Whisper = 'WHISPER',
  Ask = 'ASK',
  Into = 'INTO',
  When = 'WHEN',
  OrWhen = 'ORWHEN',
  Otherwise = 'OTHERWISE',
  Unless = 'UNLESS',
  Repeat = 'REPEAT',
  Times = 'TIMES',
  Count = 'COUNT',
  From = 'FROM',
  To = 'TO',
  Step = 'STEP',
  Each = 'EACH',
  In = 'IN',
  While = 'WHILE',
  Forever = 'FOREVER',
  Skip = 'SKIP',
  Stop = 'STOP',
  Recipe = 'RECIPE',
  Give = 'GIVE',
  Box = 'BOX',
  Add = 'ADD',
  Remove = 'REMOVE',
  Attempt = 'ATTEMPT',
  Rescue = 'RESCUE',
  Always = 'ALWAYS',
  Raise = 'RAISE',
  Expect = 'EXPECT',
  Wait = 'WAIT',
  Seconds = 'SECONDS',
  Remember = 'REMEMBER',
  Recall = 'RECALL',
  Celebrate = 'CELEBRATE',
  Todo = 'TODO',
  Seed = 'SEED',

  // Logical / Comparison Word Keywords
  Is = 'IS',
  Isnt = 'ISNT',
  Above = 'ABOVE',
  Below = 'BELOW',
  And = 'AND',
  Or = 'OR',
  Not = 'NOT',

  // Literals
  Number = 'NUMBER',
  String = 'STRING',
  InterpolatedStringStart = 'INTERPOLATED_STRING_START',
  InterpolatedStringMid = 'INTERPOLATED_STRING_MID',
  InterpolatedStringEnd = 'INTERPOLATED_STRING_END',
  Boolean = 'BOOLEAN',
  Empty = 'EMPTY',
  Identifier = 'IDENTIFIER',

  // Operators
  Plus = 'PLUS', // +
  Minus = 'MINUS', // -
  Star = 'STAR', // *
  Slash = 'SLASH', // /
  Percent = 'PERCENT', // %
  Power = 'POWER', // **
  Assign = 'ASSIGN', // =
  Equal = 'EQUAL', // ==
  NotEqual = 'NOT_EQUAL', // !=
  Less = 'LESS', // <
  Greater = 'GREATER', // >
  LessEqual = 'LESS_EQUAL', // <=
  GreaterEqual = 'GREATER_EQUAL', // >=
  Pipe = 'PIPE', // |>
  Range = 'RANGE', // ..
  FatArrow = 'FAT_ARROW', // =>
  SafeDot = 'SAFE_DOT', // ?.

  // Punctuation
  Dot = 'DOT', // .
  Comma = 'COMMA', // ,
  Colon = 'COLON', // :
  LeftParen = 'LEFT_PAREN', // (
  RightParen = 'RIGHT_PAREN', // )
  LeftBracket = 'LEFT_BRACKET', // [
  RightBracket = 'RIGHT_BRACKET', // ]
  LeftBrace = 'LEFT_BRACE', // {
  RightBrace = 'RIGHT_BRACE', // }
  Newline = 'NEWLINE',
  Semicolon = 'SEMICOLON',

  // Special
  Comment = 'COMMENT',
  EOF = 'EOF',
  Error = 'ERROR',
}

export interface Token {
  type: TokenType;
  value: string;
  span: SourceSpan;
}

