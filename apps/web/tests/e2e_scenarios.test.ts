import { describe, it, expect, beforeEach } from 'vitest';
import { useDesktopStore } from '../src/stores/desktopStore';
import { useVFSStore } from '../src/stores/vfsStore';
import { executeIBP, IBPSession } from '@ibp/engine';
import { IBPVirtualMachine } from '@ibp/vm';
import * as fs from 'fs';
import * as path from 'path';

describe('End-to-End User Scenarios (Acceptance Flow)', () => {
  const examplesDir = path.resolve(__dirname, '../../../examples');

  beforeEach(() => {
    useDesktopStore.setState({
      windows: [],
      activeWindowId: null,
      topZIndex: 10,
      isBooted: false,
      isStartMenuOpen: false,
      isCommandPaletteOpen: false,
    });
  });

  it('Flow 1: Boot sequence, skip, and open IBP Studio', () => {
    const desktop = useDesktopStore.getState();
    expect(desktop.isBooted).toBe(false);

    // Booting up
    desktop.setBooted(true);
    expect(useDesktopStore.getState().isBooted).toBe(true);

    // Open Studio
    const studioId = desktop.openWindow('studio');
    const state = useDesktopStore.getState();
    expect(state.windows.some((w) => w.id === studioId && w.appId === 'studio')).toBe(true);
  });

  it('Flow 2, 3, 4: Calculator program execution with interactive inputs, division by zero, and summary', () => {
    const code = fs.readFileSync(path.join(examplesDir, 'calculator.ibp'), 'utf-8');

    // Feeds: +, 10, 20 -> 10 + 20 = 30
    // Feeds: /, 5, 0 -> Cannot divide by zero
    // Feeds: quit -> Summary and celebration
    const scriptedInput = ['+', '10', '20', '/', '5', '0', 'quit'];
    let celebrateFired = false;

    const { output, error, events } = executeIBP(code, {
      scriptedInput,
      onEvent: (ev) => {
        if (ev.type === 'celebrate') {
          celebrateFired = true;
        }
      },
    });

    expect(error).toBeUndefined();
    expect(output).toContain('10 + 20 = 30');
    expect(output).toContain('Cannot divide by zero');
    expect(output).toContain('Calculations: 1');
    expect(output).toContain('Total: 30');
    expect(output).toContain('Average: 30');
    expect(celebrateFired).toBe(true);
  });

  it('Flow 5: Infinite loop stopped via VM controller', async () => {
    class LoopWorker {
      public onmessage: ((e: MessageEvent<any>) => void) | null = null;
      public postMessage(msg: any) {
        if (msg.type === 'run') {
          setTimeout(() => {
            this.onmessage?.(new MessageEvent('message', { data: { type: 'status', status: 'running' } }));
          }, 5);
        } else if (msg.type === 'stop') {
          setTimeout(() => {
            this.onmessage?.(new MessageEvent('message', { data: { type: 'status', status: 'stopped' } }));
            this.onmessage?.(new MessageEvent('message', { data: { type: 'done', durationMs: 0 } }));
          }, 5);
        }
      }
    }

    const vm = new IBPVirtualMachine({ workerFactory: () => new LoopWorker() as any });

    const runPromise = vm.run({
      code: 'forever { }',
    });

    // Give it a short moment then stop
    setTimeout(() => {
      vm.stop();
    }, 15);

    await runPromise;
    expect(vm.getStatus()).toBe('stopped');
  });

  it('Flow 6: File save & execution in Terminal', async () => {
    const vfs = useVFSStore.getState();
    const testPath = 'IBP://USERS/guest/projects/calc_test.ibp';
    await vfs.createFile(testPath, 'ask "Name:" into n\nsay "Hello, {n}!"');

    const state = useVFSStore.getState();
    const activeTab = state.openTabs.find((t) => t.path === state.activeFilePath);
    expect(activeTab?.content).toBeDefined();

    const { output, error } = executeIBP(activeTab!.content, {
      scriptedInput: ['Explorer'],
    });

    expect(error).toBeUndefined();
    expect(output).toContain('Hello, Explorer!');
  });

  it('Flow 7: REPL remembers variables between lines and evaluates bare expressions', () => {
    const session = new IBPSession();

    const r1 = session.eval('keep x = 5');
    expect(r1.error).toBeUndefined();

    const r2 = session.eval('say x * 2');
    expect(r2.error).toBeUndefined();
    expect(r2.output).toContain('10');

    // Bare expression
    const r3 = session.eval('x + 10');
    expect(r3.error).toBeUndefined();
    expect(r3.value).toEqual({ kind: 'number', value: 15 });
    expect(r3.output).toContain('15');

    // .vars inspection
    const vars = session.getVariables();
    expect(vars['x'].value).toEqual({ kind: 'number', value: 5 });
  });

  it('Flow 8: Multi-line block continuation in REPL', () => {
    const session = new IBPSession();
    expect(session.isComplete('count i from 1 to 3 {')).toBe(false);
    expect(session.isComplete('say i\n}')).toBe(true);

    const res = session.eval('count i from 1 to 3 {\nsay i\n}');
    expect(res.error).toBeUndefined();
    expect(res.output).toEqual(['1', '2', '3']);
  });

  it('Flow 9: Error underlines target right token with no keyword suggestions', () => {
    const code = 'keep total = 10\nsay toal';
    const { error } = executeIBP(code);

    expect(error).toBeDefined();
    expect(error?.kind).toBe('NameError');

    const formatted = error!.format(code);
    expect(formatted).toContain('Did you mean "total"?');
    expect(formatted).not.toContain('Did you mean "or"?');
    expect(formatted).not.toContain('Did you mean "for"?');
  });
});
