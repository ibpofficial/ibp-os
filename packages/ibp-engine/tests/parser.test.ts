import { describe, it, expect } from 'vitest';
import { parse } from '../src';

describe('IBP Parser', () => {
  it('parses variable and constant declarations', () => {
    const source = `
      keep name = "Ishant"
      lock MAX = 100
      keep uninitialized
    `;
    const { program, errors } = parse(source);

    expect(errors).toHaveLength(0);
    expect(program.body).toHaveLength(3);
    expect(program.body[0].type).toBe('VarDeclStmt');
    expect(program.body[1].type).toBe('ConstDeclStmt');
    expect(program.body[2].type).toBe('VarDeclStmt');
  });

  it('parses when / orwhen / otherwise and unless', () => {
    const source = `
      when age >= 18 {
        say "Adult"
      } orwhen age >= 13 {
        say "Teen"
      } otherwise {
        say "Child"
      }

      unless active {
        say "Inactive"
      }
    `;
    const { program, errors } = parse(source);

    expect(errors).toHaveLength(0);
    expect(program.body).toHaveLength(2);
    expect(program.body[0].type).toBe('WhenStmt');
    expect((program.body[0] as any).orwhenBranches).toHaveLength(1);
    expect((program.body[0] as any).otherwiseBranch).toBeDefined();
    expect(program.body[1].type).toBe('UnlessStmt');
  });

  it('parses loops: repeat, count, each, while, forever', () => {
    const source = `
      repeat 5 times { say "Hi" }
      count i from 1 to 10 step 2 { say i }
      each item in list { say item }
      while active { stop }
      forever { skip }
    `;
    const { program, errors } = parse(source);

    expect(errors).toHaveLength(0);
    expect(program.body.map((s) => s.type)).toEqual([
      'RepeatStmt',
      'CountStmt',
      'EachStmt',
      'WhileStmt',
      'ForeverStmt',
    ]);
  });

  it('parses recipes and inline arrow recipes', () => {
    const source = `
      recipe add(a, b = 0) {
        give a + b
      }
      recipe double(x) => x * 2
    `;
    const { program, errors } = parse(source);

    expect(errors).toHaveLength(0);
    expect(program.body).toHaveLength(2);
    expect(program.body[0].type).toBe('RecipeDeclStmt');
    expect((program.body[1] as any).isArrow).toBe(true);
  });

  it('recovers from syntax errors and reports multiple issues', () => {
    const source = `
      keep good = 1
      keep = bad
      say "still parsing"
      lock broken =
      say "end"
    `;
    const { program, errors } = parse(source);

    expect(errors.length).toBeGreaterThanOrEqual(2);
    // Verified parser did not crash and parsed subsequent valid statements
    expect(program.body.some((s) => s.type === 'OutputStmt')).toBe(true);
  });
});

