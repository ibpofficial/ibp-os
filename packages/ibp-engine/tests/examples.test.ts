import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { executeIBP } from '../src';

describe('Examples integration tests', () => {
  const examplesDir = path.resolve(__dirname, '../../../examples');

  function testExampleFile(filePath: string) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const expectedPath = filePath.replace(/\.ibp$/, '.expected');

    if (!fs.existsSync(expectedPath)) {
      return;
    }

    const expected = fs.readFileSync(expectedPath, 'utf-8').trim();
    const { output, error } = executeIBP(code);

    if (error) {
      throw new Error(`Execution failed in ${filePath}: ${error.format(code)}`);
    }

    const actual = output.join('\n').trim();
    expect(actual).toBe(expected);
  }

  it('runs hello-world.ibp with exact expected output', () => {
    testExampleFile(path.join(examplesDir, 'hello-world.ibp'));
  });

  it('runs calculator.ibp with exact expected output', () => {
    testExampleFile(path.join(examplesDir, 'calculator.ibp'));
  });

  it('runs loops.ibp with exact expected output', () => {
    testExampleFile(path.join(examplesDir, 'loops.ibp'));
  });

  it('runs pipes.ibp with exact expected output', () => {
    testExampleFile(path.join(examplesDir, 'pipes.ibp'));
  });
});

