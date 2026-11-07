import { describe, it, expect } from 'vitest';
import { executeIBP } from '../src/interpreter/interpreter';

describe('Hinglish Language Commands', () => {
  it('executes programs using Hinglish syntax', () => {
    const code = `
rakho naam = "Ishant"
pakka UMAR = 21

bolo "Namaste, {naam}!"

agar UMAR >= 18 {
  chillao "Swagat hai! Aap adult hain."
} warna {
  dhire "Aap chote hain."
}

tareeka jodo(a, b) {
  de_do a + b
}

bolo "10 + 20 = {jodo(10, 20)}"
jashn
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Namaste, Ishant!');
    expect(res.output).toContain('SWAGAT HAI! AAP ADULT HAIN.');
    expect(res.output).toContain('10 + 20 = 30');
    expect(res.events.some((e) => e.type === 'celebrate')).toBe(true);
  });

  it('supports colons in blocks and single statements', () => {
    const code = `
keep x = 10
when x > 5: {
  say "Greater than 5 with colon block"
}

# Single statement without braces
when x == 10: say "Single line colon success!"

# Recipe with colon
recipe add(a, b): => a + b
say add(15, 25)
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output).toContain('Greater than 5 with colon block');
    expect(res.output).toContain('Single line colon success!');
    expect(res.output).toContain('40');
  });
});

describe('Advanced Math & Physics Smartness', () => {
  it('calculates trigonometry, interpolation, and distance', () => {
    const code = `
say round(sin(0))
say round(cos(0))
say clamp(150, 0, 100)
say lerp(10, 20, 0.5)
say distance(0, 0, 3, 4)

box p1 { x: 10, y: 10 }
box p2 { x: 13, y: 14 }
say distance(p1, p2)
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output).toEqual(['0', '1', '100', '15', '5', '5']);
  });

  it('calculates physics formulas: Force, Kinetic Energy, Free Fall, Constants', () => {
    const code = `
keep mass = 2
keep speed = 10
say "Kinetic Energy: {kineticEnergy(mass, speed)}"
say "Force (m=5, a=2): {force(5, 2)}"

keep drop = freeFall(2) # 2 seconds fall
say "Fall velocity: {drop.velocity}"
say "Gravity is: {GRAVITY}"
say "Speed of Light: {SPEED_OF_LIGHT}"
`;
    const res = executeIBP(code);
    expect(res.error).toBeUndefined();
    expect(res.output[0]).toBe('Kinetic Energy: 100');
    expect(res.output[1]).toBe('Force (m=5, a=2): 10');
    expect(res.output[2]).toContain('19.6');
    expect(res.output[3]).toContain('9.8');
    expect(res.output[4]).toBe('Speed of Light: 299792458');
  });
});
