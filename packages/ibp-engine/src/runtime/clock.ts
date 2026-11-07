export class VirtualClock {
  private virtualNow: number;
  private readonly isImmediate: boolean;

  constructor(immediate = true, initialTimeMs = 1700000000000) {
    this.isImmediate = immediate;
    this.virtualNow = initialTimeMs;
  }

  public now(): number {
    return this.virtualNow;
  }

  public today(): string {
    const d = new Date(this.virtualNow);
    return d.toISOString().split('T')[0];
  }

  public advance(seconds: number): void {
    this.virtualNow += seconds * 1000;
  }

  public async wait(seconds: number): Promise<void> {
    this.advance(seconds);
    if (!this.isImmediate) {
      // In UI mode, wait a tiny fraction of a second or yield
      await new Promise((resolve) => setTimeout(resolve, Math.min(seconds * 1000, 500)));
    }
  }
}

