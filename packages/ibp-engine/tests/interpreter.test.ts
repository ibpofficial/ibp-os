import { describe, it, expect } from 'vitest';
import { executeIBP } from '../src';

describe('IBP Interpreter', () => {
  it('executes variables and arithmetic', () => {
    const code = `
      keep a = 10
      keep b = 20
      keep sum = a + b
      say sum
    `;
    const { output, error } = executeIBP(code);
    expect(error).toBeUndefined();
    expect(output).toEqual(['30']);
  });

  it('prevents constant re-assignment', () => {
    const code = `
      lock LIMIT = 100
      LIMIT = 200
    `;
    const { error } = executeIBP(code);
    expect(error).toBeDefined();
    expect(error?.kind).toBe('TypeError');
    expect(error?.message).toContain('locked constant "LIMIT"');
  });

  it('executes shout and whisper output', () => {
    const code = `
      shout "hello world"
      whisper "SECRET MESSAGE"
    `;
    const { output } = executeIBP(code);
    expect(output).toEqual(['HELLO WORLD', 'secret message']);
  });

  it('executes when/orwhen/otherwise conditional blocks', () => {
    const code = `
      keep score = 75
      when score >= 90 {
        say "A"
      } orwhen score >= 70 {
        say "B"
      } otherwise {
        say "C"
      }
    `;
    const { output } = executeIBP(code);
    expect(output).toEqual(['B']);
  });

  it('executes repeat, count, each and while loops', () => {
    const code = `
      keep sum = 0
      count i from 1 to 5 {
        sum = sum + i
      }
      say sum

      keep evens = []
      each num in [1, 2, 3, 4] {
        when num % 2 == 0 {
          add num to evens
        }
      }
      say evens.length
    `;
    const { output } = executeIBP(code);
    expect(output).toEqual(['15', '2']);
  });

  it('executes recipes with recursion and closures', () => {
    const code = `
      recipe fib(n) {
        when n <= 1 { give n }
        give fib(n - 1) + fib(n - 2)
      }
      say fib(6)

      recipe makeAdder(x) {
        recipe add(y) => x + y
        give add
      }
      keep addFive = makeAdder(5)
      say addFive(10)
    `;
    const { output } = executeIBP(code);
    expect(output).toEqual(['8', '15']);
  });

  it('handles boxes and safe property navigation ?.', () => {
    const code = `
      box user {
        name: "Ishant",
        profile: box {
          city: "Delhi"
        }
      }
      say user.name
      say user.profile.city
      say user?.settings?.theme
    `;
    const { output, error } = executeIBP(code);
    expect(error).toBeUndefined();
    expect(output).toEqual(['Ishant', 'Delhi', 'empty']);
  });

  it('handles attempt/rescue/always and custom raise', () => {
    const code = `
      keep status = "idle"
      attempt {
        raise "Something crashed"
      } rescue err {
        say err.message
        status = "handled"
      } always {
        say "cleanup"
      }
      say status
    `;
    const { output, error } = executeIBP(code);
    expect(error).toBeUndefined();
    expect(output).toEqual(['Something crashed', 'cleanup', 'handled']);
  });
});

