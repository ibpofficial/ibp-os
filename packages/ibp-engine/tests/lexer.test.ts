import { describe, it, expect } from 'vitest';
import { tokenize, TokenType } from '../src';

describe('IBP Lexer', () => {
  it('tokenizes keywords, identifiers, and numbers', () => {
    const source = 'keep score = 42\nlock PI = 3.14159';
    const tokens = tokenize(source);

    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.Keep,
      TokenType.Identifier,
      TokenType.Assign,
      TokenType.Number,
      TokenType.Newline,
      TokenType.Lock,
      TokenType.Identifier,
      TokenType.Assign,
      TokenType.Number,
      TokenType.EOF,
    ]);
  });

  it('recognizes boolean aliases and empty', () => {
    const source = 'keep a = yes\nkeep b = no\nkeep c = true\nkeep d = false\nkeep e = empty';
    const tokens = tokenize(source);

    const booleans = tokens.filter((t) => t.type === TokenType.Boolean);
    expect(booleans.length).toBe(4);
    expect(tokens.some((t) => t.type === TokenType.Empty)).toBe(true);
  });

  it('tokenizes comments and ignores them', () => {
    const source = '# This is a comment\nsay "Hello" # Inline comment';
    const tokens = tokenize(source);

    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.Say,
      TokenType.String,
      TokenType.EOF,
    ]);
  });

  it('tokenizes operator aliases: is, isnt, above, below', () => {
    const source = 'when age is 18 and score isnt 0 or count above 5 or val below 10';
    const tokens = tokenize(source);

    expect(tokens.map((t) => t.type)).toContain(TokenType.Is);
    expect(tokens.map((t) => t.type)).toContain(TokenType.Isnt);
    expect(tokens.map((t) => t.type)).toContain(TokenType.Above);
    expect(tokens.map((t) => t.type)).toContain(TokenType.Below);
    expect(tokens.map((t) => t.type)).toContain(TokenType.And);
    expect(tokens.map((t) => t.type)).toContain(TokenType.Or);
  });

  it('tokenizes pipe |>, range .., and fat arrow =>', () => {
    const source = 'recipe double(x) => x * 2\nnumbers |> map(double)\n1..10';
    const tokens = tokenize(source);

    expect(tokens.some((t) => t.type === TokenType.FatArrow)).toBe(true);
    expect(tokens.some((t) => t.type === TokenType.Pipe)).toBe(true);
    expect(tokens.some((t) => t.type === TokenType.Range)).toBe(true);
  });

  it('handles Unicode and Emoji identifiers', () => {
    const source = 'keep 🌟star = 100\nsay 🌟star';
    const tokens = tokenize(source);

    expect(tokens[1].type).toBe(TokenType.Identifier);
    expect(tokens[1].value).toBe('🌟star');
  });
});

