import { describe, it, expect } from 'vitest';
import { parse, Interpreter } from '../src';

describe('IBP Resumable Interpreter & Debugger', () => {
  it('steps through statements generator-by-generator', () => {
    const code = `
      keep a = 1
      keep b = 2
      keep c = a + b
    `;
    const { program } = parse(code);
    const events: string[] = [];
    const interpreter = new Interpreter({
      onEvent: (ev) => {
        if (ev.type === 'variable-changed') {
          events.push(`${ev.name}=${(ev.newValue as any).value}`);
        }
      },
    });

    const gen = interpreter.runProgram(program);
    let step = gen.next();
    while (!step.done) {
      step = gen.next();
    }

    expect(events).toEqual(['a=1', 'b=2', 'c=3']);
  });

  it('pauses at breakpoints and resumes', () => {
    const code = `
      keep x = 10
      keep y = 20
      keep z = 30
    `;
    const { program } = parse(code);
    const interpreter = new Interpreter();
    // Line 3 is "keep y = 20"
    interpreter.setBreakpoints([3]);

    const gen = interpreter.runProgram(program);
    // Advance until pause
    let paused = false;
    for (let i = 0; i < 20; i++) {
      gen.next();
      if (interpreter.getStatus() === 'paused') {
        paused = true;
        break;
      }
    }

    expect(paused).toBe(true);
    expect(interpreter.getCurrentEnv().get('x')).toEqual({ kind: 'number', value: 10 });
    expect(interpreter.getCurrentEnv().has('y')).toBe(false);

    // Resume
    interpreter.resume();
    let step = gen.next();
    while (!step.done) {
      step = gen.next();
    }
    expect(interpreter.getStatus()).toBe('completed');
    expect(interpreter.getCurrentEnv().get('z')).toEqual({ kind: 'number', value: 30 });
  });
});

