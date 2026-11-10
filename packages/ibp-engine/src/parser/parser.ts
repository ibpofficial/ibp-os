import { Token, TokenType, SourceSpan } from '../types/tokens';
import {
  ProgramNode,
  Statement,
  Expression,
  BlockStmt,
  VarDeclStmt,
  ConstDeclStmt,
  AssignStmt,
  TargetExpr,
  OutputStmt,
  InputStmt,
  WhenStmt,
  WhenBranch,
  UnlessStmt,
  RepeatStmt,
  CountStmt,
  EachStmt,
  WhileStmt,
  ForeverStmt,
  RecipeDeclStmt,
  RecipeParam,
  BoxDeclStmt,
  BoxEntry,
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
  StopStmt,
  SkipStmt,
  GiveStmt,
  ExprStmt,
  BinaryOperator,
  InterpolatedStringExpr,
  StringLiteral,
  StringPart,
} from '../types/ast';
import { IBPError } from '../diagnostics/error';
import { tokenize } from '../lexer/lexer';

export interface ParseResult {
  program: ProgramNode;
  errors: IBPError[];
}

export class Parser {
  private tokens: Token[];
  private current = 0;
  private errors: IBPError[] = [];
  private source: string;

  constructor(tokens: Token[], source = '') {
    this.tokens = tokens;
    this.source = source;
  }

  private peek(): Token {
    return this.tokens[this.current] || this.tokens[this.tokens.length - 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const t of types) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string, hint?: string): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new IBPError({
      kind: 'SyntaxError',
      message: `${message}. Found "${token.value || token.type}".`,
      span: token.span,
      hint,
      sourceCode: this.source,
    });
  }

  private consumeIdentifierName(message: string, hint?: string): Token {
    const token = this.peek();
    if (
      token.type === TokenType.Identifier ||
      (token.type !== TokenType.EOF &&
        token.type !== TokenType.Newline &&
        token.type !== TokenType.Semicolon &&
        token.type !== TokenType.LeftParen &&
        token.type !== TokenType.RightParen &&
        token.type !== TokenType.LeftBracket &&
        token.type !== TokenType.RightBracket &&
        token.type !== TokenType.LeftBrace &&
        token.type !== TokenType.RightBrace &&
        /^[a-zA-Z_\u00A0-\uFFFF][a-zA-Z0-9_\u00A0-\uFFFF]*$/.test(token.value))
    ) {
      this.advance();
      return { ...token, type: TokenType.Identifier };
    }
    throw new IBPError({
      kind: 'SyntaxError',
      message: `${message}. Found "${token.value || token.type}".`,
      span: token.span,
      hint,
      sourceCode: this.source,
    });
  }

  private skipTerminators(): void {
    while (this.match(TokenType.Newline, TokenType.Semicolon)) {
      // consume newlines and semicolons
    }
  }

  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.Newline || this.previous().type === TokenType.Semicolon) {
        return;
      }
      switch (this.peek().type) {
        case TokenType.Keep:
        case TokenType.Lock:
        case TokenType.Say:
        case TokenType.Shout:
        case TokenType.Whisper:
        case TokenType.Ask:
        case TokenType.When:
        case TokenType.Unless:
        case TokenType.Repeat:
        case TokenType.Count:
        case TokenType.Each:
        case TokenType.While:
        case TokenType.Forever:
        case TokenType.Recipe:
        case TokenType.Box:
        case TokenType.Attempt:
        case TokenType.Expect:
        case TokenType.RightBrace:
          return;
      }
      this.advance();
    }
  }

  public parse(): ParseResult {
    const statements: Statement[] = [];
    const startLoc = this.peek().span.start;

    this.skipTerminators();
    while (!this.isAtEnd()) {
      if (this.match(TokenType.Comma)) {
        this.skipTerminators();
        continue;
      }
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (err: any) {
        if (err instanceof IBPError) {
          this.errors.push(err);
          this.synchronize();
        } else {
          this.errors.push(
            new IBPError({
              kind: 'SyntaxError',
              message: String(err.message || err),
              span: this.peek().span,
              sourceCode: this.source,
            })
          );
          this.synchronize();
        }
      }
      this.skipTerminators();
      while (this.match(TokenType.Comma)) {
        this.skipTerminators();
      }
    }

    const endLoc = this.peek().span.end;
    return {
      program: {
        type: 'Program',
        body: statements,
        span: { start: startLoc, end: endLoc },
      },
      errors: this.errors,
    };
  }

  // --- Statement Parsers ---
  private parseStatement(): Statement {
    this.skipTerminators();

    if (this.match(TokenType.Keep)) return this.parseVarDecl();
    if (this.match(TokenType.Lock)) return this.parseConstDecl();
    if (this.match(TokenType.Say)) return this.parseOutput('say');
    if (this.match(TokenType.Shout)) return this.parseOutput('shout');
    if (this.match(TokenType.Whisper)) return this.parseOutput('whisper');
    if (this.match(TokenType.Ask)) return this.parseInput();
    if (this.match(TokenType.When)) return this.parseWhen();
    if (this.match(TokenType.Unless)) return this.parseUnless();
    if (this.match(TokenType.Repeat)) return this.parseRepeat();
    if (this.match(TokenType.Count)) return this.parseCount();
    if (this.match(TokenType.Each)) return this.parseEach();
    if (this.match(TokenType.While)) return this.parseWhile();
    if (this.match(TokenType.Forever)) return this.parseForever();
    if (this.match(TokenType.Recipe)) return this.parseRecipeDecl();
    if (this.match(TokenType.Box)) {
      // Lookahead: is this "box Name {" or inline expression "box {"?
      if (this.peek().type === TokenType.Identifier && this.tokens[this.current + 1]?.type === TokenType.LeftBrace) {
        return this.parseBoxDecl();
      }
      // Otherwise, it is an expression statement starting with box literal
      this.current--; // put back 'box'
      return this.parseAssignmentOrExprStmt();
    }
    if (this.match(TokenType.Add)) return this.parseAdd();
    if (this.match(TokenType.Remove)) return this.parseRemove();
    if (this.match(TokenType.Attempt)) return this.parseAttempt();
    if (this.match(TokenType.Raise)) return this.parseRaise();
    if (this.match(TokenType.Expect)) return this.parseExpect();
    if (this.match(TokenType.Wait)) return this.parseWait();
    if (this.match(TokenType.Remember)) return this.parseRemember();
    if (this.match(TokenType.Celebrate)) {
      const prev = this.previous();
      return { type: 'CelebrateStmt', span: prev.span };
    }
    if (this.match(TokenType.Todo)) return this.parseTodo();
    if (this.match(TokenType.Seed)) return this.parseSeed();
    if (this.match(TokenType.Stop)) return { type: 'StopStmt', span: this.previous().span };
    if (this.match(TokenType.Skip)) return { type: 'SkipStmt', span: this.previous().span };
    if (this.match(TokenType.Give)) return this.parseGive();
    if (this.match(TokenType.LeftBrace)) {
      this.current--;
      return this.parseBlock();
    }

    return this.parseAssignmentOrExprStmt();
  }

  private parseVarDecl(): VarDeclStmt {
    const keepToken = this.previous();
    const idToken = this.consume(TokenType.Identifier, 'Expected variable name after "keep"');
    let init: Expression | undefined;
    if (this.match(TokenType.Assign)) {
      init = this.parseExpression();
    }
    const end = init ? init.span.end : idToken.span.end;
    return {
      type: 'VarDeclStmt',
      name: idToken.value,
      nameSpan: idToken.span,
      init,
      span: { start: keepToken.span.start, end },
    };
  }

  private parseConstDecl(): ConstDeclStmt {
    const lockToken = this.previous();
    const idToken = this.consume(TokenType.Identifier, 'Expected constant name after "lock"');
    this.consume(TokenType.Assign, 'Expected "=" after constant name in "lock" declaration', 'Constants must be initialized with a value.');
    const init = this.parseExpression();
    return {
      type: 'ConstDeclStmt',
      name: idToken.value,
      nameSpan: idToken.span,
      init,
      span: { start: lockToken.span.start, end: init.span.end },
    };
  }

  private parseOutput(mode: 'say' | 'shout' | 'whisper'): OutputStmt {
    const start = this.previous().span.start;
    const values: Expression[] = [this.parseExpression()];
    while (this.match(TokenType.Comma)) {
      if (
        this.check(TokenType.Newline) ||
        this.check(TokenType.Semicolon) ||
        this.check(TokenType.RightBrace) ||
        this.isAtEnd()
      ) {
        break; // trailing comma
      }
      values.push(this.parseExpression());
    }
    const end = values[values.length - 1].span.end;
    return {
      type: 'OutputStmt',
      mode,
      value: values[0],
      values,
      span: { start, end },
    };
  }

  private parseInput(): InputStmt {
    const start = this.previous().span.start;
    let kind: 'text' | 'number' = 'text';
    let explicitKind = false;
    if (this.match(TokenType.Identifier)) {
      const val = this.previous().value;
      if (val === 'number') {
        kind = 'number';
        explicitKind = true;
      } else if (val === 'text') {
        kind = 'text';
        explicitKind = true;
      } else {
        this.current--;
      }
    }
    const prompt = this.parseExpression();
    this.consume(TokenType.Into, 'Expected "into" after prompt in "ask" statement', 'Example: ask "What is your name?" into name');
    const target = this.consume(TokenType.Identifier, 'Expected variable name after "into"');
    return {
      type: 'InputStmt',
      isNumber: kind === 'number',
      kind,
      explicitKind,
      prompt,
      target: target.value,
      targetSpan: target.span,
      span: { start, end: target.span.end },
    };
  }

  private parseWhen(): WhenStmt {
    const start = this.previous().span.start;
    const condition = this.parseExpression();
    const body = this.parseBlock();
    const orwhenBranches: WhenBranch[] = [];

    this.skipTerminators();
    while (this.match(TokenType.OrWhen)) {
      const orStart = this.previous().span.start;
      const orCond = this.parseExpression();
      const orBody = this.parseBlock();
      orwhenBranches.push({
        condition: orCond,
        body: orBody,
        span: { start: orStart, end: orBody.span.end },
      });
      this.skipTerminators();
    }

    let otherwiseBranch: BlockStmt | undefined;
    if (this.match(TokenType.Otherwise)) {
      otherwiseBranch = this.parseBlock();
    }

    const end = otherwiseBranch
      ? otherwiseBranch.span.end
      : orwhenBranches.length > 0
      ? orwhenBranches[orwhenBranches.length - 1].span.end
      : body.span.end;

    return {
      type: 'WhenStmt',
      condition,
      body,
      orwhenBranches,
      otherwiseBranch,
      span: { start, end },
    };
  }

  private parseUnless(): UnlessStmt {
    const start = this.previous().span.start;
    const condition = this.parseExpression();
    const body = this.parseBlock();
    return {
      type: 'UnlessStmt',
      condition,
      body,
      span: { start, end: body.span.end },
    };
  }

  private parseRepeat(): RepeatStmt {
    const start = this.previous().span.start;
    const count = this.parseExpression();
    this.consume(TokenType.Times, 'Expected "times" after count in repeat loop', 'Example: repeat 5 times { ... }');
    const body = this.parseBlock();
    return {
      type: 'RepeatStmt',
      count,
      body,
      span: { start, end: body.span.end },
    };
  }

  private parseCount(): CountStmt {
    const start = this.previous().span.start;
    const variable = this.consume(TokenType.Identifier, 'Expected loop variable name after "count"').value;
    this.consume(TokenType.From, 'Expected "from" in count loop', 'Example: count i from 1 to 10 { ... }');
    const from = this.parseExpression();
    this.consume(TokenType.To, 'Expected "to" in count loop');
    const to = this.parseExpression();
    let step: Expression | undefined;
    if (this.match(TokenType.Step)) {
      step = this.parseExpression();
    }
    const body = this.parseBlock();
    return {
      type: 'CountStmt',
      variable,
      from,
      to,
      step,
      body,
      span: { start, end: body.span.end },
    };
  }

  private parseEach(): EachStmt {
    const start = this.previous().span.start;
    const variable = this.consume(TokenType.Identifier, 'Expected item variable name after "each"').value;
    this.consume(TokenType.In, 'Expected "in" after variable name in "each" loop', 'Example: each item in list { ... }');
    const collection = this.parseExpression();
    const body = this.parseBlock();
    return {
      type: 'EachStmt',
      variable,
      collection,
      body,
      span: { start, end: body.span.end },
    };
  }

  private parseWhile(): WhileStmt {
    const start = this.previous().span.start;
    const condition = this.parseExpression();
    const body = this.parseBlock();
    return {
      type: 'WhileStmt',
      condition,
      body,
      span: { start, end: body.span.end },
    };
  }

  private parseForever(): ForeverStmt {
    const start = this.previous().span.start;
    const body = this.parseBlock();
    return {
      type: 'ForeverStmt',
      body,
      span: { start, end: body.span.end },
    };
  }

  private parseRecipeDecl(): RecipeDeclStmt {
    const start = this.previous().span.start;
    const name = this.consumeIdentifierName('Expected recipe name after "recipe"').value;
    this.consume(TokenType.LeftParen, 'Expected "(" after recipe name');

    const params: RecipeParam[] = [];
    if (!this.check(TokenType.RightParen)) {
      do {
        this.skipTerminators();
        if (this.check(TokenType.RightParen)) break;
        const paramName = this.consumeIdentifierName('Expected parameter name').value;
        let defaultValue: Expression | undefined;
        if (this.match(TokenType.Assign)) {
          defaultValue = this.parseExpression();
        }
        params.push({ name: paramName, defaultValue });
        this.skipTerminators();
      } while (this.match(TokenType.Comma) && !this.check(TokenType.RightParen));
    }
    this.consume(TokenType.RightParen, 'Expected ")" after parameter list');
    this.match(TokenType.Colon);
    this.skipTerminators();

    let isArrow = false;
    let body: BlockStmt | Expression;
    if (this.match(TokenType.FatArrow)) {
      isArrow = true;
      body = this.parseExpression();
    } else {
      body = this.parseBlock();
    }

    return {
      type: 'RecipeDeclStmt',
      name,
      params,
      body,
      isArrow,
      span: { start, end: body.span.end },
    };
  }

  private parseBoxDecl(): BoxDeclStmt {
    const start = this.previous().span.start;
    const name = this.consume(TokenType.Identifier, 'Expected box name after "box"').value;
    this.consume(TokenType.LeftBrace, 'Expected "{" after box name');

    const entries: BoxEntry[] = [];
    this.skipTerminators();
    while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      const entryStart = this.peek().span.start;
      let key = '';
      if (this.match(TokenType.Identifier, TokenType.String)) {
        key = this.previous().value;
      } else {
        throw new IBPError({
          kind: 'SyntaxError',
          message: `Expected box field key. Found "${this.peek().value}".`,
          span: this.peek().span,
        });
      }
      this.consume(TokenType.Colon, 'Expected ":" after box field key');
      const val = this.parseExpression();
      entries.push({ key, value: val, span: { start: entryStart, end: val.span.end } });
      this.skipTerminators();
      if (!this.check(TokenType.RightBrace)) {
        this.match(TokenType.Comma);
      }
      this.skipTerminators();
    }
    const end = this.consume(TokenType.RightBrace, 'Expected "}" to close box declaration').span.end;

    return {
      type: 'BoxDeclStmt',
      name,
      entries,
      span: { start, end },
    };
  }

  private parseAdd(): AddStmt {
    const start = this.previous().span.start;
    const item = this.parseExpression();
    this.consume(TokenType.To, 'Expected "to" after item in "add" statement', 'Example: add 40 to scores');
    const targetToken = this.consume(TokenType.Identifier, 'Expected target list variable in "add" statement');
    return {
      type: 'AddStmt',
      item,
      target: targetToken.value,
      targetSpan: targetToken.span,
      span: { start, end: targetToken.span.end },
    };
  }

  private parseRemove(): RemoveStmt {
    const start = this.previous().span.start;
    const item = this.parseExpression();
    this.consume(TokenType.From, 'Expected "from" after item in "remove" statement', 'Example: remove 10 from scores');
    const targetToken = this.consume(TokenType.Identifier, 'Expected target list variable in "remove" statement');
    return {
      type: 'RemoveStmt',
      item,
      target: targetToken.value,
      targetSpan: targetToken.span,
      span: { start, end: targetToken.span.end },
    };
  }

  private parseAttempt(): AttemptStmt {
    const start = this.previous().span.start;
    const attemptBody = this.parseBlock();
    this.skipTerminators();
    this.consume(TokenType.Rescue, 'Expected "rescue" after attempt block', 'Example: attempt { ... } rescue problem { ... }');
    const errorVar = this.consume(TokenType.Identifier, 'Expected variable name for caught error after "rescue"').value;
    const rescueBody = this.parseBlock();
    this.skipTerminators();

    let alwaysBody: BlockStmt | undefined;
    if (this.match(TokenType.Always)) {
      alwaysBody = this.parseBlock();
    }

    const end = alwaysBody ? alwaysBody.span.end : rescueBody.span.end;
    return {
      type: 'AttemptStmt',
      attemptBody,
      errorVar,
      rescueBody,
      alwaysBody,
      span: { start, end },
    };
  }

  private parseRaise(): RaiseStmt {
    const start = this.previous().span.start;
    const value = this.parseExpression();
    return {
      type: 'RaiseStmt',
      value,
      span: { start, end: value.span.end },
    };
  }

  private parseExpect(): ExpectStmt {
    const start = this.previous().span.start;
    let label: string | undefined;

    // Check if there is an optional string label followed by a colon
    if (this.check(TokenType.String) && this.tokens[this.current + 1]?.type === TokenType.Colon) {
      label = this.advance().value;
      this.advance(); // consume ':'
    }

    const expression = this.parseExpression();
    return {
      type: 'ExpectStmt',
      label,
      expression,
      span: { start, end: expression.span.end },
    };
  }

  private parseWait(): WaitStmt {
    const start = this.previous().span.start;
    const duration = this.parseExpression();
    this.consume(TokenType.Seconds, 'Expected "seconds" or "second" after wait duration', 'Example: wait 2 seconds');
    return {
      type: 'WaitStmt',
      duration,
      span: { start, end: this.previous().span.end },
    };
  }

  private parseRemember(): RememberStmt {
    const start = this.previous().span.start;
    const key = this.parseExpression();
    this.consume(TokenType.Assign, 'Expected "=" after key in remember statement', 'Example: remember "highscore" = 50');
    const value = this.parseExpression();
    return {
      type: 'RememberStmt',
      key,
      value,
      span: { start, end: value.span.end },
    };
  }

  private parseTodo(): TodoStmt {
    const start = this.previous().span.start;
    const strToken = this.consume(TokenType.String, 'Expected string description after "todo"');
    return {
      type: 'TodoStmt',
      text: strToken.value,
      span: { start, end: strToken.span.end },
    };
  }

  private parseSeed(): SeedStmt {
    const start = this.previous().span.start;
    const seed = this.parseExpression();
    return {
      type: 'SeedStmt',
      seed,
      span: { start, end: seed.span.end },
    };
  }

  private parseGive(): GiveStmt {
    const start = this.previous().span.start;
    let value: Expression | undefined;
    if (!this.check(TokenType.Newline) && !this.check(TokenType.Semicolon) && !this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      value = this.parseExpression();
    }
    const end = value ? value.span.end : this.previous().span.end;
    return {
      type: 'GiveStmt',
      value,
      span: { start, end },
    };
  }

  private parseBlock(): BlockStmt {
    this.match(TokenType.Colon);
    this.skipTerminators();

    if (!this.check(TokenType.LeftBrace)) {
      // Single statement block (e.g. "when x > 0: say 'yes'")
      const start = this.peek().span.start;
      const stmt = this.parseStatement();
      return {
        type: 'BlockStmt',
        body: stmt ? [stmt] : [],
        span: stmt ? stmt.span : { start, end: this.previous().span.end },
      };
    }

    const openBrace = this.consume(TokenType.LeftBrace, 'Expected "{" to start block');
    const body: Statement[] = [];
    this.skipTerminators();

    while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      if (this.match(TokenType.Comma)) {
        this.skipTerminators();
        continue;
      }
      try {
        const stmt = this.parseStatement();
        if (stmt) body.push(stmt);
      } catch (err: any) {
        if (err instanceof IBPError) {
          this.errors.push(err);
          this.synchronize();
        } else {
          this.errors.push(
            new IBPError({
              kind: 'SyntaxError',
              message: String(err.message || err),
              span: this.peek().span,
            })
          );
          this.synchronize();
        }
      }
      this.skipTerminators();
      while (this.match(TokenType.Comma)) {
        this.skipTerminators();
      }
    }

    const closeBrace = this.consume(TokenType.RightBrace, 'Expected "}" to close block');
    return {
      type: 'BlockStmt',
      body,
      span: { start: openBrace.span.start, end: closeBrace.span.end },
    };
  }

  private parseAssignmentOrExprStmt(): Statement {
    const expr = this.parseExpression();

    if (this.match(TokenType.Assign)) {
      if (
        expr.type === 'IdentifierExpr' ||
        expr.type === 'IndexExpr' ||
        expr.type === 'MemberExpr'
      ) {
        const value = this.parseExpression();
        return {
          type: 'AssignStmt',
          target: expr as TargetExpr,
          value,
          span: { start: expr.span.start, end: value.span.end },
        };
      }
      throw new IBPError({
        kind: 'SyntaxError',
        message: 'Invalid assignment target.',
        span: expr.span,
        hint: 'You can only assign to variables, list indices, or box fields.',
      });
    }

    return {
      type: 'ExprStmt',
      expression: expr,
      span: expr.span,
    };
  }

  // --- Expression Parsers ---
  public parseExpression(): Expression {
    return this.parsePipe();
  }

  private parsePipe(): Expression {
    let expr = this.parseLogicalOr();

    while (this.match(TokenType.Pipe)) {
      const right = this.parseLogicalOr();
      expr = {
        type: 'PipeExpr',
        left: expr,
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseLogicalOr(): Expression {
    let expr = this.parseLogicalAnd();

    while (this.match(TokenType.Or)) {
      const right = this.parseLogicalAnd();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: 'or',
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseLogicalAnd(): Expression {
    let expr = this.parseEquality();

    while (this.match(TokenType.And)) {
      const right = this.parseEquality();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: 'and',
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseEquality(): Expression {
    let expr = this.parseRelational();

    while (this.match(TokenType.Equal, TokenType.NotEqual, TokenType.Is, TokenType.Isnt)) {
      const opToken = this.previous();
      let op: BinaryOperator;
      if (opToken.type === TokenType.Equal || opToken.type === TokenType.Is) {
        op = '==';
      } else {
        op = '!=';
      }
      const right = this.parseRelational();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op,
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseRelational(): Expression {
    let expr = this.parseMembership();

    while (
      this.match(
        TokenType.Less,
        TokenType.Greater,
        TokenType.LessEqual,
        TokenType.GreaterEqual,
        TokenType.Above,
        TokenType.Below
      )
    ) {
      const opToken = this.previous();
      let op: BinaryOperator;
      if (opToken.type === TokenType.Less || opToken.type === TokenType.Below) op = '<';
      else if (opToken.type === TokenType.Greater || opToken.type === TokenType.Above) op = '>';
      else if (opToken.type === TokenType.LessEqual) op = '<=';
      else op = '>=';

      const right = this.parseMembership();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op,
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseMembership(): Expression {
    let expr = this.parseRange();

    if (this.match(TokenType.In)) {
      const right = this.parseRange();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: 'in',
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseRange(): Expression {
    const expr = this.parseAdditive();

    if (this.match(TokenType.Range)) {
      const right = this.parseAdditive();
      return {
        type: 'RangeExpr',
        start: expr,
        end: right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseAdditive(): Expression {
    let expr = this.parseMultiplicative();

    while (this.match(TokenType.Plus, TokenType.Minus)) {
      const op: BinaryOperator = this.previous().type === TokenType.Plus ? '+' : '-';
      const right = this.parseMultiplicative();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op,
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseMultiplicative(): Expression {
    let expr = this.parsePower();

    while (this.match(TokenType.Star, TokenType.Slash, TokenType.Percent)) {
      const t = this.previous().type;
      const op: BinaryOperator = t === TokenType.Star ? '*' : t === TokenType.Slash ? '/' : '%';
      const right = this.parsePower();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op,
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parsePower(): Expression {
    const expr = this.parseUnary();

    if (this.match(TokenType.Power)) {
      const right = this.parsePower(); // right-associative
      return {
        type: 'BinaryExpr',
        left: expr,
        operator: '**',
        right,
        span: { start: expr.span.start, end: right.span.end },
      };
    }

    return expr;
  }

  private parseUnary(): Expression {
    if (this.match(TokenType.Minus, TokenType.Not)) {
      const opToken = this.previous();
      const op = opToken.type === TokenType.Minus ? '-' : 'not';
      const operand = this.parseUnary();
      return {
        type: 'UnaryExpr',
        operator: op,
        operand,
        span: { start: opToken.span.start, end: operand.span.end },
      };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.LeftParen)) {
        // Call expression
        const args: Expression[] = [];
        if (!this.check(TokenType.RightParen)) {
          do {
            this.skipTerminators();
            if (this.check(TokenType.RightParen)) break;
            args.push(this.parseExpression());
            this.skipTerminators();
          } while (this.match(TokenType.Comma) && !this.check(TokenType.RightParen));
        }
        const rightParen = this.consume(TokenType.RightParen, 'Expected ")" after argument list');
        expr = {
          type: 'CallExpr',
          callee: expr,
          arguments: args,
          span: { start: expr.span.start, end: rightParen.span.end },
        };
      } else if (this.match(TokenType.LeftBracket)) {
        // Index expression
        const index = this.parseExpression();
        const rightBracket = this.consume(TokenType.RightBracket, 'Expected "]" after index');
        expr = {
          type: 'IndexExpr',
          target: expr,
          index,
          span: { start: expr.span.start, end: rightBracket.span.end },
        };
      } else if (this.match(TokenType.Dot)) {
        // Member expression
        const prop = this.consume(TokenType.Identifier, 'Expected property name after "."').value;
        expr = {
          type: 'MemberExpr',
          target: expr,
          property: prop,
          isSafe: false,
          span: { start: expr.span.start, end: this.previous().span.end },
        };
      } else if (this.match(TokenType.SafeDot)) {
        // Safe Member expression ?.
        const prop = this.consume(TokenType.Identifier, 'Expected property name after "?."').value;
        expr = {
          type: 'MemberExpr',
          target: expr,
          property: prop,
          isSafe: true,
          span: { start: expr.span.start, end: this.previous().span.end },
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): Expression {
    if (this.match(TokenType.Number)) {
      const token = this.previous();
      return {
        type: 'NumberLiteral',
        value: parseFloat(token.value),
        span: token.span,
      };
    }

    if (this.match(TokenType.String)) {
      const token = this.previous();
      return this.parseStringWithInterpolation(token.value, token.span);
    }

    if (this.match(TokenType.Boolean)) {
      const token = this.previous();
      const val = token.value === 'yes' || token.value === 'true';
      return {
        type: 'BooleanLiteral',
        value: val,
        span: token.span,
      };
    }

    if (this.match(TokenType.Empty)) {
      return {
        type: 'EmptyLiteral',
        span: this.previous().span,
      };
    }

    if (this.match(TokenType.Identifier)) {
      const token = this.previous();
      return {
        type: 'IdentifierExpr',
        name: token.value,
        span: token.span,
      };
    }

    // List Literal [ ... ]
    if (this.match(TokenType.LeftBracket)) {
      const start = this.previous().span.start;
      const elements: Expression[] = [];
      this.skipTerminators();
      if (!this.check(TokenType.RightBracket)) {
        do {
          this.skipTerminators();
          if (this.check(TokenType.RightBracket)) break;
          elements.push(this.parseExpression());
          this.skipTerminators();
        } while (this.match(TokenType.Comma) && !this.check(TokenType.RightBracket));
      }
      this.skipTerminators();
      const end = this.consume(TokenType.RightBracket, 'Expected "]" to close list').span.end;
      return {
        type: 'ListLiteral',
        elements,
        span: { start, end },
      };
    }

    // Inline Box Literal: box { ... }
    if (this.match(TokenType.Box)) {
      const start = this.previous().span.start;
      this.consume(TokenType.LeftBrace, 'Expected "{" after "box"');
      const entries: BoxEntry[] = [];
      this.skipTerminators();
      while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
        const entryStart = this.peek().span.start;
        let key = '';
        if (this.match(TokenType.Identifier, TokenType.String)) {
          key = this.previous().value;
        } else {
          throw new IBPError({
            kind: 'SyntaxError',
            message: `Expected box field key. Found "${this.peek().value}".`,
            span: this.peek().span,
          });
        }
        this.consume(TokenType.Colon, 'Expected ":" after field key');
        const val = this.parseExpression();
        entries.push({ key, value: val, span: { start: entryStart, end: val.span.end } });
        this.skipTerminators();
        if (!this.check(TokenType.RightBrace)) {
          this.match(TokenType.Comma);
        }
        this.skipTerminators();
      }
      const end = this.consume(TokenType.RightBrace, 'Expected "}" to close box').span.end;
      return {
        type: 'BoxLiteral',
        entries,
        span: { start, end },
      };
    }

    // Parenthesized expression: ( expr )
    if (this.match(TokenType.LeftParen)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RightParen, 'Expected ")" to close parenthesized expression');
      return expr;
    }

    // Fallback: any word keyword used in identifier/call/pipe position (e.g. add, total, luck, etc.)
    const peekTok = this.peek();
    if (
      peekTok.type !== TokenType.EOF &&
      peekTok.type !== TokenType.Newline &&
      peekTok.type !== TokenType.Semicolon &&
      peekTok.type !== TokenType.LeftBrace &&
      peekTok.type !== TokenType.RightBrace &&
      peekTok.type !== TokenType.LeftBracket &&
      peekTok.type !== TokenType.RightBracket &&
      peekTok.type !== TokenType.RightParen &&
      /^[a-zA-Z_\u00A0-\uFFFF][a-zA-Z0-9_\u00A0-\uFFFF]*$/.test(peekTok.value)
    ) {
      const token = this.advance();
      return {
        type: 'IdentifierExpr',
        name: token.value,
        span: token.span,
      };
    }

    const token = this.peek();
    throw new IBPError({
      kind: 'SyntaxError',
      message: `Unexpected token "${token.value || token.type}". Expected an expression.`,
      span: token.span,
      sourceCode: this.source,
    });
  }

  private parseStringWithInterpolation(raw: string, span: SourceSpan): Expression {
    // Check if raw contains unescaped {
    if (!raw.includes('{')) {
      return {
        type: 'StringLiteral',
        value: raw,
        span,
      };
    }

    const parts: StringPart[] = [];
    let i = 0;
    let currentText = '';

    while (i < raw.length) {
      if (raw[i] === '{') {
        if (currentText.length > 0) {
          parts.push({ type: 'text', value: currentText });
          currentText = '';
        }
        i++; // skip '{'
        // Scan until matching '}'
        let depth = 1;
        let exprStr = '';
        while (i < raw.length && depth > 0) {
          if (raw[i] === '{') depth++;
          else if (raw[i] === '}') depth--;
          if (depth > 0) {
            exprStr += raw[i];
            i++;
          }
        }
        if (depth > 0) {
          throw new IBPError({
            kind: 'SyntaxError',
            message: 'Unclosed "{" in string interpolation.',
            span,
            hint: 'Add a closing "}" for the expression inside the string.',
          });
        }
        i++; // skip '}'

        // Tokenize and parse inner expression
        const subTokens = tokenize(exprStr);
        const subParser = new Parser(subTokens, exprStr);
        const subExpr = subParser.parseExpression();
        parts.push({ type: 'expr', value: subExpr });
      } else {
        currentText += raw[i];
        i++;
      }
    }

    if (currentText.length > 0) {
      parts.push({ type: 'text', value: currentText });
    }

    return {
      type: 'InterpolatedStringExpr',
      parts,
      span,
    };
  }
}

export function parse(source: string): ParseResult {
  const tokens = tokenize(source);
  const parser = new Parser(tokens, source);
  return parser.parse();
}

