import { describe, it, expect } from 'vitest';
import { executeIBP, IBP_TIPS } from '../src';

describe('IBP Signature Features', () => {
  it('supports pipe flow |>', () => {
    const code = `
      recipe double(x) => x * 2
      recipe isEven(x) => x % 2 == 0

      keep numbers = [1, 2, 3, 4]
      keep res = numbers |> filter(isEven) |> map(double) |> total
      say res
    `;
    const { output, error } = executeIBP(code);
    expect(error).toBeUndefined();
    // evens: 2, 4 -> doubled: 4, 8 -> total: 12
    expect(output).toEqual(['12']);
  });

  it('supports string interpolation with expressions', () => {
    const code = `
      keep name = "Aria"
      keep age = 19
      say "Hello {name}, next year you will be {age + 1}!"
    `;
    const { output } = executeIBP(code);
    expect(output).toEqual(['Hello Aria, next year you will be 20!']);
  });

  it('guarantees deterministic seeded randomness', () => {
    const code1 = `
      seed 12345
      say luck(1, 100)
      say coin()
      say pick(["A", "B", "C", "D"])
    `;
    const run1 = executeIBP(code1);

    const code2 = `
      seed 12345
      say luck(1, 100)
      say coin()
      say pick(["A", "B", "C", "D"])
    `;
    const run2 = executeIBP(code2);

    expect(run1.output).toEqual(run2.output);
  });

  it('supports ranges as first-class values', () => {
    const code = `
      keep r = 1..5
      say r.length
      keep sum = 0
      each n in r {
        sum = sum + n
      }
      say sum
    `;
    const { output } = executeIBP(code);
    expect(output).toEqual(['5', '15']);
  });

  it('supports remember and recall persistent store', () => {
    const memStore = new Map<string, string>();
    const storage = {
      getItem: (k: string) => memStore.get(k) ?? null,
      setItem: (k: string, v: string) => { memStore.set(k, v); },
      removeItem: (k: string) => { memStore.delete(k); },
    };

    const code1 = `
      remember "highScore" = 999
    `;
    executeIBP(code1, { storage });

    const code2 = `
      keep score = recall("highScore", 0)
      say score
    `;
    const run2 = executeIBP(code2, { storage });
    expect(run2.output).toEqual(['999']);
  });

  it('supports expect checks without crashing on failures', () => {
    const code = `
      expect 1 + 1 is 2
      expect "should fail": 2 + 2 is 5
      say "I am still alive"
    `;
    const { output, events } = executeIBP(code);
    expect(output).toEqual(['I am still alive']);

    const passes = events.filter((e) => e.type === 'check-passed');
    const fails = events.filter((e) => e.type === 'check-failed');
    expect(passes.length).toBe(1);
    expect(fails.length).toBe(1);
  });

  it('contains at least 25 built-in tips', () => {
    expect(IBP_TIPS.length).toBeGreaterThanOrEqual(25);
    const { output } = executeIBP('say tip()');
    expect(output.length).toBe(1);
    expect(output[0].length).toBeGreaterThan(5);
  });

  it('emits celebrate and todo events', () => {
    const code = `
      celebrate
      todo "optimize this later"
    `;
    const { events } = executeIBP(code);
    expect(events.some((e) => e.type === 'celebrate')).toBe(true);
    expect(events.some((e) => e.type === 'todo')).toBe(true);
  });
});

