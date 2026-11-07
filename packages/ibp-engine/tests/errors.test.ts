import { describe, it, expect } from 'vitest';
import { executeIBP } from '../src';

describe('IBP Friendly Error Messages', () => {
  it('formats NameError with line, column, caret, and Did you mean suggestion', () => {
    const code = `keep score = 100\nsay scorr`;
    const { error } = executeIBP(code);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('NameError');
    expect(error?.span?.start.line).toBe(2);

    const formatted = error!.format(code);
    expect(formatted).toContain('Oops! IBP tripped on line 2, column 5.');
    expect(formatted).toContain('say scorr');
    expect(formatted).toContain('^^^^^');
    expect(formatted).toContain('Did you mean "score"?');
    expect(formatted).toContain('Try this: define it first with  keep scorr = ...');
  });

  it('suggests closest keyword when mistyping keyword', () => {
    const code = `whn 1 > 0 { say "yes" }`;
    const { error } = executeIBP(code);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('NameError');
    expect(error?.suggestion).toBe('when');
  });

  it('formats MathError on division by zero', () => {
    const code = `keep x = 10 / 0`;
    const { error } = executeIBP(code);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('MathError');
    expect(error?.message).toContain('Division by zero');
  });
});

