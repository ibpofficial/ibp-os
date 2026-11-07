import { describe, it, expect } from 'vitest';
import { executeIBP } from '../src/interpreter/interpreter';

describe('Fun & Easy Coding Features', () => {
  it('supports friendly aliases (let, const, if, print, fn, return, true/false)', () => {
    const code = `
let x = 10
const Y = 20
let flag = true
if x < Y {
  print "Aliases work!", flag
}
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Aliases work! yes');
  });

  it('supports comma-separated output in say/print', () => {
    const code = `
keep score = 99
say "Player:", "Aria", "Score:", score
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Player: Aria Score: 99');
  });

  it('supports trailing commas in lists, boxes, and recipes', () => {
    const code = `
recipe multiply(a, b,) {
  give a * b
}
keep items = [1, 2, 3,]
box user {
  name: "Hero",
  score: 100,
}
say multiply(4, 5,)
say items.length
say user.name
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output).toEqual(['20', '3', 'Hero']);
  });

  it('executes fun built-ins: magic8Ball, joke, asciiArt, rollDice, d20', () => {
    const code = `
seed 42
say magic8Ball()
say joke()
say rollDice(6)
say d20()
say asciiArt("rocket")
say badge("LEVEL UP", "⭐")
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output.length).toBe(6);
    expect(res.output[0]).toBeTruthy();
    expect(res.output[1].length).toBeGreaterThan(10);
    expect(res.output[4]).toContain('IBP');
    expect(res.output[5]).toBe('[ ⭐ LEVEL UP ]');
  });
});
