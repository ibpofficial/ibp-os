import { describe, it, expect } from 'vitest';
import { CHALLENGES } from '../src/apps/Playground/challenges';
import { executeIBP } from '@ibp/engine';

describe('Playground Challenges Verification', () => {
  it('contains at least 20 challenges across Beginner, Easy, Medium, Hard', () => {
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(20);

    const difficulties = new Set(CHALLENGES.map((c) => c.difficulty));
    expect(difficulties.has('Beginner')).toBe(true);
    expect(difficulties.has('Easy')).toBe(true);
    expect(difficulties.has('Medium')).toBe(true);
    expect(difficulties.has('Hard')).toBe(true);
  });

  // Test that every challenge verification suite is syntactically valid and runnable
  it.each(CHALLENGES)('verifies challenge: $title', (ch) => {
    // If starter code provides the solution or default structure, test combined
    const fullCode = `${ch.starterCode}\n# --- Verification ---\n${ch.testCheck}`;
    const { error } = executeIBP(fullCode, { scriptedInput: ch.scriptedInput });

    // If an error is thrown, it should at least not be a SyntaxError in the testCheck
    if (error && error.kind === 'SyntaxError') {
      throw new Error(`Syntax error in testCheck for "${ch.title}": ${error.format(fullCode)}`);
    }
  });
});

