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

  it('does not suggest keywords for NameError', () => {
    const code = `whn 1 > 0 { say "yes" }`;
    const { error } = executeIBP(code);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('NameError');
    // Keywords must NOT be suggested
    expect(error?.suggestion).toBeUndefined();
  });

  it('underlines only the offending token, not the entire statement', () => {
    const code = `ask "Enter name:" into undefined_var`;
    // If undefined_var fails when referencing, underline just undefined_var
    const code2 = `say 10 + unknown_variable`;
    const { error } = executeIBP(code2);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('NameError');
    const formatted = error!.format(code2);
    expect(formatted).toContain('^^^^^^^^^^^^^^^^'); // exactly 16 carets for unknown_variable
    expect(formatted).not.toContain('^^^^^^^^^^^^^^^^^^^^^^^^');
  });

  it('matches formatted error snapshot for NameError', () => {
    const code = `keep score = 100\nsay scorr`;
    const { error } = executeIBP(code);
    expect(error).toBeDefined();
    expect(error!.format(code)).toMatchInlineSnapshot(`
      "Oops! IBP tripped on line 2, column 5.

        2 | say scorr
               ^^^^^
      NameError: I don't know anything called "scorr".
      Did you mean "score"?
      Try this: define it first with  keep scorr = ...
      "
    `);
  });

  it('matches formatted error snapshot for locked constant assignment', () => {
    const code = `lock MAX = 10\nMAX = 20`;
    const { error } = executeIBP(code);
    expect(error).toBeDefined();
    expect(error!.format(code)).toMatchInlineSnapshot(`
      "Oops! IBP tripped on line 2, column 1.

        2 | MAX = 20
           ^^^
      TypeError: Cannot reassign locked constant "MAX": can't change a locked value.
      Try this: Define "MAX" with "keep" instead of "lock" if it needs to change.
      "
    `);
  });

  it('formats MathError on division by zero', () => {
    const code = `keep x = 10 / 0`;
    const { error } = executeIBP(code);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('MathError');
    expect(error?.message).toContain('Division by zero');
  });
});

