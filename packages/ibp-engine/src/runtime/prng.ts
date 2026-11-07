/**
 * Deterministic Mulberry32 Seeded Pseudo-Random Number Generator
 */

export class PRNG {
  private state: number;
  public readonly initialSeed: number;

  constructor(seed: number = 42) {
    this.initialSeed = Math.floor(seed) >>> 0;
    this.state = this.initialSeed;
  }

  public setSeed(seed: number): void {
    this.state = Math.floor(seed) >>> 0;
  }

  // Returns floating point number in [0, 1)
  public next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Integer in [min, max] inclusive
  public luck(min: number, max: number): number {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return Math.floor(this.next() * (high - low + 1)) + low;
  }

  // "heads" or "tails"
  public coin(): 'heads' | 'tails' {
    return this.next() < 0.5 ? 'heads' : 'tails';
  }

  // Random item from an array
  public pick<T>(items: T[]): T | undefined {
    if (items.length === 0) return undefined;
    const index = Math.floor(this.next() * items.length);
    return items[index];
  }

  // New shuffled copy using Fisher-Yates
  public shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }
}

