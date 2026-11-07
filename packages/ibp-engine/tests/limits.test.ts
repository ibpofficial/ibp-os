import { describe, it, expect } from 'vitest';
import { executeIBP } from '../src';

describe('IBP Safety Limits', () => {
  it('stops infinite loops with LimitError', () => {
    const code = `
      forever {
        # infinite loop
      }
    `;
    const { error } = executeIBP(code, {
      limits: { maxLoopIterations: 500, maxInstructions: 1000 },
    });

    expect(error).toBeDefined();
    expect(error?.kind).toBe('LimitError');
  });

  it('stops deep or infinite recursion with LimitError', () => {
    const code = `
      recipe recurse() {
        recurse()
      }
      recurse()
    `;
    const { error } = executeIBP(code, {
      limits: { maxRecursionDepth: 50 },
    });

    expect(error).toBeDefined();
    expect(error?.kind).toBe('LimitError');
    expect(error?.message).toContain('recursion');
  });

  it('stops excessive output with LimitError', () => {
    const code = `
      repeat 100 times {
        say "12345678901234567890"
      }
    `;
    const { error } = executeIBP(code, {
      limits: { maxOutputLength: 50 },
    });

    expect(error).toBeDefined();
    expect(error?.kind).toBe('LimitError');
    expect(error?.message).toContain('Output size exceeded');
  });
});

