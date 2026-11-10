import { describe, it, expect } from 'vitest';
import { executeIBP, Interpreter, IBPSession } from '../src';

describe('Engine Fixes: ask and interactive execution', () => {
  it('ask into undeclared name declares it in current scope', () => {
    const code = `
ask "What is your name?" into user_name
say "Hello, {user_name}!"
`;
    const res = executeIBP(code, { scriptedInput: ['Alice'] });
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Hello, Alice!');
    expect(res.output).toContain('What is your name? Alice');
  });

  it('ask explicit text into undeclared name declares it', () => {
    const code = `
ask text "Enter hobby:" into hobby
say "Hobby: {hobby}"
`;
    const res = executeIBP(code, { scriptedInput: ['Coding'] });
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Hobby: Coding');
  });

  it('ask into existing name assigns to it', () => {
    const code = `
keep score = 10
ask "New score?" into score
say "Score is now {score}"
`;
    const res = executeIBP(code, { scriptedInput: ['99'] });
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Score is now 99');
  });

  it('ask inside a block then use after block ends works only if declared outside', () => {
    // Declared outside: persists
    const code1 = `
keep val = "original"
when yes {
  ask "Enter value:" into val
}
say "Result: {val}"
`;
    const res1 = executeIBP(code1, { scriptedInput: ['modified'] });
    expect(res1.error).toBeUndefined();
    expect(res1.output).toContain('Result: modified');

    // Not declared outside: block-scoped, using outside errors with NameError
    const code2 = `
when yes {
  ask "Enter inner:" into inner_val
}
say "Result: {inner_val}"
`;
    const res2 = executeIBP(code2, { scriptedInput: ['secret'] });
    expect(res2.error).toBeDefined();
    expect(res2.error?.kind).toBe('NameError');
    expect(res2.error?.message).toContain('inner_val');
  });

  it('ask into locked constant throws a clear error', () => {
    const code = `
lock FIXED = 100
ask "Change fixed:" into FIXED
`;
    const res = executeIBP(code, { scriptedInput: ['200'] });
    expect(res.error).toBeDefined();
    expect(res.error?.kind).toBe('TypeError');
    expect(res.error?.message).toContain("can't change a locked value");
  });

  it('Hinglish forms of ask behave identically', () => {
    const code = `
poocho "Aapka naam?" into naam
bolo "Namaste {naam}"
poocho number "Umar?" mein umar
bolo "Umar agle saal: {umar + 1}"
`;
    const res = executeIBP(code, { scriptedInput: ['Rohan', '20'] });
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Namaste Rohan');
    expect(res.output).toContain('Umar agle saal: 21');
  });

  it('ask number re-asks on invalid input and accepts valid input', () => {
    const code = `
ask number "Enter age:" into age
say "Age is {age}"
`;
    // First two invalid answers, third is valid
    const res = executeIBP(code, { scriptedInput: ['abc', 'not-a-number', '25'] });
    expect(res.error).toBeUndefined();
    expect(res.output).toContain("That wasn't a number. Try again.");
    expect(res.output).toContain('Age is 25');
  });

  it('5 invalid answers for ask number raises InputError', () => {
    const code = `
ask number "Enter pin:" into pin
say "Pin: {pin}"
`;
    const res = executeIBP(code, { scriptedInput: ['bad1', 'bad2', 'bad3', 'bad4', 'bad5'] });
    expect(res.error).toBeDefined();
    expect(res.error?.kind).toBe('InputError');
    expect(res.error?.hint).toBeDefined();
  });

  it('raises clear InputError when host provides no input source', () => {
    const code = `
ask "Your name?" into name
`;
    const res = executeIBP(code);
    expect(res.error).toBeDefined();
    expect(res.error?.kind).toBe('InputError');
    expect(res.error?.message).toContain('This program needs input, but none is available');
  });

  it('scriptedInput feeds answers in order and running out raises InputError', () => {
    const code = `
ask "First?" into a
ask "Second?" into b
`;
    const res = executeIBP(code, { scriptedInput: ['one'] });
    expect(res.error).toBeDefined();
    expect(res.error?.kind).toBe('InputError');
    expect(res.error?.message).toContain('This program needs input, but none is available');
  });
});

describe('IBPSession and REPL persistence', () => {
  it('persists variables, locks, recipes across eval calls', () => {
    const session = new IBPSession();

    const r1 = session.eval('keep x = 10');
    expect(r1.error).toBeUndefined();

    const r2 = session.eval('recipe double(n) => n * 2');
    expect(r2.error).toBeUndefined();

    const r3 = session.eval('say double(x)');
    expect(r3.error).toBeUndefined();
    expect(r3.output).toEqual(['20']);

    // Bare expression prints value
    const r4 = session.eval('x + 5');
    expect(r4.error).toBeUndefined();
    expect(r4.output).toEqual(['15']);
    expect(r4.value).toEqual({ kind: 'number', value: 15 });
  });

  it('failing eval does not corrupt session state', () => {
    const session = new IBPSession();

    session.eval('keep counter = 5');
    // Failing line with runtime error (division by zero)
    const errRes = session.eval('counter = 10 / 0');
    expect(errRes.error).toBeDefined();

    // Previous counter must still be 5
    const checkRes = session.eval('say counter');
    expect(checkRes.error).toBeUndefined();
    expect(checkRes.output).toEqual(['5']);
  });

  it('supports multi-line block continuation', () => {
    const session = new IBPSession();

    const r1 = session.eval('when yes {');
    expect(r1.incomplete).toBe(true);

    const r2 = session.eval('when yes {\n  say "Inside block"\n}');
    expect(r2.incomplete).toBeFalsy();
    expect(r2.error).toBeUndefined();
    expect(r2.output).toEqual(['Inside block']);
  });
});
