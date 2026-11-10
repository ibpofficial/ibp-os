import { Token, TokenType, SourceLocation, SourceSpan } from '../types/tokens';
import { IBPError } from '../diagnostics/error';

const KEYWORDS: Record<string, TokenType> = {
  keep: TokenType.Keep,
  lock: TokenType.Lock,
  say: TokenType.Say,
  shout: TokenType.Shout,
  whisper: TokenType.Whisper,
  ask: TokenType.Ask,
  into: TokenType.Into,
  when: TokenType.When,
  orwhen: TokenType.OrWhen,
  otherwise: TokenType.Otherwise,
  unless: TokenType.Unless,
  repeat: TokenType.Repeat,
  times: TokenType.Times,
  time: TokenType.Times,
  count: TokenType.Count,
  from: TokenType.From,
  to: TokenType.To,
  step: TokenType.Step,
  each: TokenType.Each,
  in: TokenType.In,
  while: TokenType.While,
  forever: TokenType.Forever,
  skip: TokenType.Skip,
  stop: TokenType.Stop,
  recipe: TokenType.Recipe,
  give: TokenType.Give,
  box: TokenType.Box,
  add: TokenType.Add,
  remove: TokenType.Remove,
  attempt: TokenType.Attempt,
  rescue: TokenType.Rescue,
  always: TokenType.Always,
  raise: TokenType.Raise,
  expect: TokenType.Expect,
  wait: TokenType.Wait,
  seconds: TokenType.Seconds,
  second: TokenType.Seconds,
  remember: TokenType.Remember,
  celebrate: TokenType.Celebrate,
  todo: TokenType.Todo,
  seed: TokenType.Seed,

  is: TokenType.Is,
  isnt: TokenType.Isnt,
  above: TokenType.Above,
  below: TokenType.Below,
  and: TokenType.And,
  or: TokenType.Or,
  not: TokenType.Not,

  yes: TokenType.Boolean,
  no: TokenType.Boolean,
  true: TokenType.Boolean,
  false: TokenType.Boolean,
  empty: TokenType.Empty,
  null: TokenType.Empty,
  nil: TokenType.Empty,
  none: TokenType.Empty,

  // Friendly aliases for effortless coding
  print: TokenType.Say,
  let: TokenType.Keep,
  var: TokenType.Keep,
  const: TokenType.Lock,
  if: TokenType.When,
  elif: TokenType.OrWhen,
  else: TokenType.Otherwise,
  fun: TokenType.Recipe,
  fn: TokenType.Recipe,
  function: TokenType.Recipe,
  return: TokenType.Give,
  break: TokenType.Stop,
  continue: TokenType.Skip,
  for: TokenType.Each,

  // Hinglish language commands
  bolo: TokenType.Say,
  batao: TokenType.Say,
  likho: TokenType.Say,
  chillao: TokenType.Shout,
  dhire: TokenType.Whisper,
  rakho: TokenType.Keep,
  banao: TokenType.Keep,
  pakka: TokenType.Lock,
  fix: TokenType.Lock,
  poocho: TokenType.Ask,
  mein: TokenType.Into,
  me: TokenType.Into,
  agar: TokenType.When,
  warna_agar: TokenType.OrWhen,
  warna: TokenType.Otherwise,
  jabtak: TokenType.While,
  dohrao: TokenType.Repeat,
  baar: TokenType.Times,
  har: TokenType.Each,
  gino: TokenType.Count,
  tareeka: TokenType.Recipe,
  vidhi: TokenType.Recipe,
  karo: TokenType.Recipe,
  de_do: TokenType.Give,
  wapas: TokenType.Give,
  haan: TokenType.Boolean,
  sahi: TokenType.Boolean,
  nahi: TokenType.Boolean,
  galat: TokenType.Boolean,
  khali: TokenType.Empty,
  ruko: TokenType.Stop,
  aage_badho: TokenType.Skip,
  jashn: TokenType.Celebrate,
  taali: TokenType.Celebrate,
  aur: TokenType.And,
  ya: TokenType.Or,
  mat: TokenType.Not,
};

export class Lexer {
  private source: string;
  private pos = 0;
  private line = 1;
  private col = 1;
  private parenDepth = 0;
  private bracketDepth = 0;

  constructor(source: string) {
    this.source = source;
  }

  private currentLoc(): SourceLocation {
    return { line: this.line, column: this.col, offset: this.pos };
  }

  private peek(): string {
    return this.pos < this.source.length ? this.source[this.pos] : '\0';
  }

  private peekNext(): string {
    return this.pos + 1 < this.source.length ? this.source[this.pos + 1] : '\0';
  }

  private advance(): string {
    const ch = this.peek();
    this.pos++;
    if (ch === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return ch;
  }

  private match(expected: string): boolean {
    if (this.peek() === expected) {
      this.advance();
      return true;
    }
    return false;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      const ch = this.peek();

      // Whitespace
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Comments
      if (ch === '#') {
        while (this.pos < this.source.length && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // Newlines
      if (ch === '\n') {
        const start = this.currentLoc();
        this.advance();
        const end = this.currentLoc();
        // Ignore newlines inside open parentheses or brackets
        if (this.parenDepth === 0 && this.bracketDepth === 0) {
          // Collapse consecutive newlines
          if (tokens.length > 0 && tokens[tokens.length - 1].type !== TokenType.Newline) {
            tokens.push({ type: TokenType.Newline, value: '\n', span: { start, end } });
          }
        }
        continue;
      }

      // Semicolon
      if (ch === ';') {
        const start = this.currentLoc();
        this.advance();
        const end = this.currentLoc();
        tokens.push({ type: TokenType.Semicolon, value: ';', span: { start, end } });
        continue;
      }

      // Numbers
      if (this.isDigit(ch)) {
        tokens.push(this.scanNumber());
        continue;
      }

      // Strings
      if (ch === '"') {
        tokens.push(this.scanString());
        continue;
      }

      // Identifiers / Keywords / Booleans
      if (this.isIdentifierStart(ch)) {
        tokens.push(this.scanIdentifier());
        continue;
      }

      // Operators and Delimiters
      const start = this.currentLoc();
      switch (ch) {
        case '(':
          this.advance();
          this.parenDepth++;
          tokens.push({ type: TokenType.LeftParen, value: '(', span: { start, end: this.currentLoc() } });
          break;
        case ')':
          this.advance();
          this.parenDepth = Math.max(0, this.parenDepth - 1);
          tokens.push({ type: TokenType.RightParen, value: ')', span: { start, end: this.currentLoc() } });
          break;
        case '[':
          this.advance();
          this.bracketDepth++;
          tokens.push({ type: TokenType.LeftBracket, value: '[', span: { start, end: this.currentLoc() } });
          break;
        case ']':
          this.advance();
          this.bracketDepth = Math.max(0, this.bracketDepth - 1);
          tokens.push({ type: TokenType.RightBracket, value: ']', span: { start, end: this.currentLoc() } });
          break;
        case '{':
          this.advance();
          tokens.push({ type: TokenType.LeftBrace, value: '{', span: { start, end: this.currentLoc() } });
          break;
        case '}':
          this.advance();
          tokens.push({ type: TokenType.RightBrace, value: '}', span: { start, end: this.currentLoc() } });
          break;
        case ',':
          this.advance();
          tokens.push({ type: TokenType.Comma, value: ',', span: { start, end: this.currentLoc() } });
          break;
        case ':':
          this.advance();
          tokens.push({ type: TokenType.Colon, value: ':', span: { start, end: this.currentLoc() } });
          break;
        case '+':
          this.advance();
          tokens.push({ type: TokenType.Plus, value: '+', span: { start, end: this.currentLoc() } });
          break;
        case '-':
          this.advance();
          tokens.push({ type: TokenType.Minus, value: '-', span: { start, end: this.currentLoc() } });
          break;
        case '*':
          this.advance();
          if (this.match('*')) {
            tokens.push({ type: TokenType.Power, value: '**', span: { start, end: this.currentLoc() } });
          } else {
            tokens.push({ type: TokenType.Star, value: '*', span: { start, end: this.currentLoc() } });
          }
          break;
        case '/':
          this.advance();
          tokens.push({ type: TokenType.Slash, value: '/', span: { start, end: this.currentLoc() } });
          break;
        case '%':
          this.advance();
          tokens.push({ type: TokenType.Percent, value: '%', span: { start, end: this.currentLoc() } });
          break;
        case '^':
          this.advance();
          tokens.push({ type: TokenType.Power, value: '^', span: { start, end: this.currentLoc() } });
          break;
        case '=':
          this.advance();
          if (this.match('=')) {
            tokens.push({ type: TokenType.Equal, value: '==', span: { start, end: this.currentLoc() } });
          } else if (this.match('>')) {
            tokens.push({ type: TokenType.FatArrow, value: '=>', span: { start, end: this.currentLoc() } });
          } else {
            tokens.push({ type: TokenType.Assign, value: '=', span: { start, end: this.currentLoc() } });
          }
          break;
        case '!':
          this.advance();
          if (this.match('=')) {
            tokens.push({ type: TokenType.NotEqual, value: '!=', span: { start, end: this.currentLoc() } });
          } else {
            throw new IBPError({
              kind: 'SyntaxError',
              message: 'Unexpected "!" character.',
              span: { start, end: this.currentLoc() },
              hint: 'In IBP, use "not" for logic and "!=" or "isnt" for not-equal.',
            });
          }
          break;
        case '<':
          this.advance();
          if (this.match('=')) {
            tokens.push({ type: TokenType.LessEqual, value: '<=', span: { start, end: this.currentLoc() } });
          } else {
            tokens.push({ type: TokenType.Less, value: '<', span: { start, end: this.currentLoc() } });
          }
          break;
        case '>':
          this.advance();
          if (this.match('=')) {
            tokens.push({ type: TokenType.GreaterEqual, value: '>=', span: { start, end: this.currentLoc() } });
          } else {
            tokens.push({ type: TokenType.Greater, value: '>', span: { start, end: this.currentLoc() } });
          }
          break;
        case '|':
          this.advance();
          if (this.match('>')) {
            tokens.push({ type: TokenType.Pipe, value: '|>', span: { start, end: this.currentLoc() } });
          } else {
            throw new IBPError({
              kind: 'SyntaxError',
              message: 'Unexpected "|" character.',
              span: { start, end: this.currentLoc() },
              hint: 'Did you mean the pipe operator "|>" or the keyword "or"?',
            });
          }
          break;
        case '.':
          this.advance();
          if (this.match('.')) {
            tokens.push({ type: TokenType.Range, value: '..', span: { start, end: this.currentLoc() } });
          } else {
            tokens.push({ type: TokenType.Dot, value: '.', span: { start, end: this.currentLoc() } });
          }
          break;
        case '?':
          this.advance();
          if (this.match('.')) {
            tokens.push({ type: TokenType.SafeDot, value: '?.', span: { start, end: this.currentLoc() } });
          } else {
            throw new IBPError({
              kind: 'SyntaxError',
              message: 'Unexpected "?" character.',
              span: { start, end: this.currentLoc() },
              hint: 'Safe navigation uses "?." in IBP, e.g. user?.address?.city.',
            });
          }
          break;
        default:
          this.advance();
          throw new IBPError({
            kind: 'SyntaxError',
            message: `Unexpected character "${ch}".`,
            span: { start, end: this.currentLoc() },
          });
      }
    }

    const endLoc = this.currentLoc();
    tokens.push({
      type: TokenType.EOF,
      value: '',
      span: { start: endLoc, end: endLoc },
    });

    return tokens;
  }

  private scanNumber(): Token {
    const start = this.currentLoc();
    let numStr = '';

    while (this.isDigit(this.peek())) {
      numStr += this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      numStr += this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        numStr += this.advance();
      }
    }

    return {
      type: TokenType.Number,
      value: numStr,
      span: { start, end: this.currentLoc() },
    };
  }

  private scanString(): Token {
    const start = this.currentLoc();
    this.advance(); // consume opening quote '"'
    let content = '';

    while (this.pos < this.source.length && this.peek() !== '"') {
      const ch = this.peek();
      if (ch === '\n') {
        throw new IBPError({
          kind: 'SyntaxError',
          message: 'Unterminated string literal. Strings cannot span multiple lines directly.',
          span: { start, end: this.currentLoc() },
          hint: 'Close the quote with " before the newline, or use \\n for newlines.',
        });
      }
      if (ch === '\\') {
        this.advance(); // consume '\'
        const esc = this.advance();
        if (esc === 'n') content += '\n';
        else if (esc === 't') content += '\t';
        else if (esc === 'r') content += '\r';
        else if (esc === '"') content += '"';
        else if (esc === '\\') content += '\\';
        else if (esc === '{') content += '{';
        else content += esc;
      } else {
        content += this.advance();
      }
    }

    if (this.pos >= this.source.length) {
      throw new IBPError({
        kind: 'SyntaxError',
        message: 'Unterminated string literal at end of file.',
        span: { start, end: this.currentLoc() },
        hint: 'Add a closing double-quote " to finish the string.',
      });
    }

    this.advance(); // consume closing quote '"'
    return {
      type: TokenType.String,
      value: content,
      span: { start, end: this.currentLoc() },
    };
  }

  private scanIdentifier(): Token {
    const start = this.currentLoc();
    let name = '';

    while (this.pos < this.source.length && this.isIdentifierPart(this.peek())) {
      name += this.advance();
    }

    const lower = name.toLowerCase();
    const keywordType = KEYWORDS[lower];

    if (keywordType) {
      return {
        type: keywordType,
        value: lower,
        span: { start, end: this.currentLoc() },
      };
    }

    return {
      type: TokenType.Identifier,
      value: name,
      span: { start, end: this.currentLoc() },
    };
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isIdentifierStart(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return (
      (ch >= 'a' && ch <= 'z') ||
      (ch >= 'A' && ch <= 'Z') ||
      ch === '_' ||
      code > 127 // Unicode & Emoji
    );
  }

  private isIdentifierPart(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return (
      (ch >= 'a' && ch <= 'z') ||
      (ch >= 'A' && ch <= 'Z') ||
      (ch >= '0' && ch <= '9') ||
      ch === '_' ||
      code > 127 // Unicode & Emoji
    );
  }
}

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}

