import { SourceSpan } from '../types/tokens';

export type IBPErrorKind =
  | 'SyntaxError'
  | 'NameError'
  | 'TypeError'
  | 'MathError'
  | 'RangeError'
  | 'FileError'
  | 'LimitError'
  | 'RaisedError';

export interface IBPErrorOptions {
  kind: IBPErrorKind;
  message: string;
  span?: SourceSpan;
  suggestion?: string;
  hint?: string;
  sourceCode?: string;
}

export class IBPError extends Error {
  public readonly kind: IBPErrorKind;
  public readonly span?: SourceSpan;
  public readonly suggestion?: string;
  public readonly hint?: string;
  public readonly sourceCode?: string;

  constructor(options: IBPErrorOptions) {
    super(options.message);
    this.name = options.kind;
    this.kind = options.kind;
    this.span = options.span;
    this.suggestion = options.suggestion;
    this.hint = options.hint;
    this.sourceCode = options.sourceCode;
    Object.setPrototypeOf(this, IBPError.prototype);
  }

  public format(source?: string): string {
    const src = source || this.sourceCode || '';
    const line = this.span ? this.span.start.line : 1;
    const col = this.span ? this.span.start.column : 1;

    let output = `Oops! IBP tripped on line ${line}, column ${col}.\n\n`;

    if (src) {
      const lines = src.split('\n');
      const errorLineIdx = line - 1;
      if (errorLineIdx >= 0 && errorLineIdx < lines.length) {
        const errorLineText = lines[errorLineIdx];
        const lineNumStr = String(line).padStart(3, ' ');
        output += `${lineNumStr} | ${errorLineText}\n`;

        const startCol = col;
        const endCol =
          this.span && this.span.end.line === line
            ? Math.max(col, this.span.end.column)
            : col + 1;
        const length = Math.max(1, endCol - startCol);
        const indent = ' '.repeat(5 + Math.max(0, startCol - 1));
        const caret = '^'.repeat(length);
        output += `${indent}${caret}\n`;
      }
    }

    output += `${this.kind}: ${this.message}\n`;
    if (this.suggestion) {
      output += `Did you mean "${this.suggestion}"?\n`;
    }
    if (this.hint) {
      output += `Try this: ${this.hint}\n`;
    }

    return output;
  }
}

// Levenshtein distance for "Did you mean?" suggestions
export function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export function findClosest(word: string, candidates: string[], maxDistance = 3): string | undefined {
  let closest: string | undefined;
  let bestDist = maxDistance + 1;

  for (const candidate of candidates) {
    const dist = levenshtein(word.toLowerCase(), candidate.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      closest = candidate;
    }
  }

  return closest;
}

