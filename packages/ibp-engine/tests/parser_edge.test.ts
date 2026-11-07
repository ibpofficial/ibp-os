import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser/parser';

describe('Parser Edge Cases & Incomplete Typing', () => {
  const testCases = [
    'say "hello", "world"',
    'say "test",',
    'keep a = 1,',
    '[1, 2,]',
    'box user { name: "test", }',
    '\n\n\n',
    'when age > 10 {\n',
    'recipe add(a, b,) { give a + b }',
    '1, 2',
    ',,,',
    '\n\n,\n\n',
    'keep name = "A", keep age = 10',
    'say 10, say 20',
    'say 10 \n\n say 20',
    'say',
    'recipe (',
    'box {',
    'attempt {',
    'wait',
    'remember',
    'expect',
    'keep',
    'lock',
    'when',
    'each',
    'count',
    'repeat',
    'while',
    'forever',
    'shout',
    'whisper',
    'ask',
    'ask into',
    'add',
    'remove',
    'raise',
    'seed',
    'todo',
  ];

  for (const code of testCases) {
    it(`parses safely without throwing on: ${JSON.stringify(code)}`, () => {
      const res = parse(code);
      expect(res).toBeDefined();
      expect(res.program).toBeDefined();
      expect(Array.isArray(res.errors)).toBe(true);
      for (const err of res.errors) {
        expect(err.span).toBeDefined();
        expect(err.span.start.line).toBeGreaterThanOrEqual(1);
        expect(err.span.start.column).toBeGreaterThanOrEqual(1);
      }
    });
  }
});

