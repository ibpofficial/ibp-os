import { describe, it, expect, vi } from 'vitest';
import { IBPVirtualMachine } from '../src/vm-controller';
import { MainToWorkerMessage, WorkerToMainMessage } from '../src/protocol';

class MockWorker {
  public onmessage: ((e: MessageEvent<WorkerToMainMessage>) => void) | null = null;
  public onerror: ((err: any) => void) | null = null;
  public messagesReceived: MainToWorkerMessage[] = [];
  public isTerminated = false;

  constructor() {}

  public postMessage(msg: MainToWorkerMessage) {
    this.messagesReceived.push(msg);

    if (msg.type === 'run') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', {
            data: { type: 'status', status: 'running' },
          }));
          this.onmessage(new MessageEvent('message', {
            data: { type: 'output', text: 'Hello from worker!', mode: 'say' },
          }));
          this.onmessage(new MessageEvent('message', {
            data: { type: 'done', durationMs: 15 },
          }));
        }
      }, 10);
    } else if (msg.type === 'stop') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', {
            data: { type: 'status', status: 'stopped' },
          }));
          this.onmessage(new MessageEvent('message', {
            data: { type: 'done', durationMs: 0 },
          }));
        }
      }, 5);
    }
  }

  public terminate() {
    this.isTerminated = true;
  }
}

describe('Worker protocol tests', () => {
  it('handles message in and out through worker', async () => {
    let mock: MockWorker | null = null;
    const vm = new IBPVirtualMachine({
      workerFactory: () => {
        mock = new MockWorker();
        return mock as unknown as Worker;
      },
    });

    const outputs: string[] = [];
    vm.onOutput((text) => outputs.push(text));

    const res = await vm.run({ code: 'say "Hello from worker!"' });
    expect(res.output).toContain('Hello from worker!');
    expect(outputs).toContain('Hello from worker!');
    expect(mock!.messagesReceived.some((m) => m.type === 'run')).toBe(true);
  });

  it('stops during run when stop is requested', async () => {
    let mock: MockWorker | null = null;
    const vm = new IBPVirtualMachine({
      workerFactory: () => {
        mock = new MockWorker();
        return mock as unknown as Worker;
      },
    });

    // Start run
    const runPromise = vm.run({ code: 'forever { }' });
    vm.stop();

    await runPromise;
    expect(vm.getStatus()).toBe('stopped');
    expect(mock!.messagesReceived.some((m) => m.type === 'stop')).toBe(true);
  });

  it('stops while awaiting input', async () => {
    let mockWorker: any;
    const vm = new IBPVirtualMachine({
      workerFactory: () => {
        mockWorker = {
          onmessage: null,
          postMessage: (msg: any) => {
            if (msg.type === 'run') {
              setTimeout(() => {
                mockWorker.onmessage({
                  data: {
                    type: 'awaiting-input',
                    id: '1',
                    prompt: 'What is your name?',
                    kind: 'text',
                  },
                });
              }, 10);
            } else if (msg.type === 'stop') {
              setTimeout(() => {
                mockWorker.onmessage({ data: { type: 'status', status: 'stopped' } });
                mockWorker.onmessage({ data: { type: 'done', durationMs: 0 } });
              }, 5);
            }
          },
          terminate: vi.fn(),
        };
        return mockWorker;
      },
    });

    let inputRequested = false;
    vm.onInputRequest(() => {
      inputRequested = true;
      vm.stop();
    });

    await vm.run({ code: 'ask "What is your name?" into name' });
    expect(inputRequested).toBe(true);
    expect(vm.getStatus()).toBe('stopped');
  });

  it('triggers watchdog restart when worker is unresponsive for > 2s after Stop', async () => {
    vi.useFakeTimers();
    let terminated = false;
    let workerCount = 0;

    const vm = new IBPVirtualMachine({
      workerFactory: () => {
        workerCount++;
        return {
          onmessage: null,
          postMessage: () => {
            // Unresponsive on stop: does not reply
          },
          terminate: () => {
            terminated = true;
          },
        } as unknown as Worker;
      },
    });

    // Call stop
    vm.stop();
    expect(terminated).toBe(false);

    // Advance 2100ms
    vi.advanceTimersByTime(2100);

    // Watchdog should have terminated unresponsive worker and created a new one
    expect(terminated).toBe(true);
    expect(workerCount).toBe(2);

    vi.useRealTimers();
  });
});

