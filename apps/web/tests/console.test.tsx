import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { InteractiveConsole, ConsoleLine } from '../src/apps/Studio/InteractiveConsole';

describe('InteractiveConsole Component Tests', () => {
  it('renders output lines with correct formatting', () => {
    const logs: ConsoleLine[] = [
      { id: '1', type: 'output', text: 'Hello, world!', mode: 'say' },
      { id: '2', type: 'output', text: 'ALERT MESSAGE', mode: 'shout' },
      { id: '3', type: 'output', text: 'quietly speaking', mode: 'whisper' },
      { id: '4', type: 'error', text: 'TypeError: Something went wrong' },
    ];

    const html = renderToString(
      <InteractiveConsole
        logs={logs}
        status="idle"
        inputRequest={null}
        onSendInput={vi.fn()}
        onRun={vi.fn()}
        onStop={vi.fn()}
        onRestart={vi.fn()}
        onClear={vi.fn()}
        isRunning={false}
        isLight={false}
      />
    );

    expect(html).toContain('Hello, world!');
    expect(html).toContain('ALERT MESSAGE');
    expect(html).toContain('quietly speaking');
    expect(html).toContain('TypeError: Something went wrong');
    expect(html).toContain('Idle');
  });

  it('renders inline input field when awaiting input', () => {
    const html = renderToString(
      <InteractiveConsole
        logs={[{ id: '1', type: 'output', text: 'Starting...', mode: 'say' }]}
        status="waiting-for-input"
        inputRequest={{ id: '42', prompt: 'Operator (or quit):', kind: 'text' }}
        onSendInput={vi.fn()}
        onRun={vi.fn()}
        onStop={vi.fn()}
        onRestart={vi.fn()}
        onClear={vi.fn()}
        isRunning={true}
        isLight={false}
      />
    );

    expect(html).toContain('Operator (or quit):');
    expect(html).toContain('Waiting for input');
    expect(html).toContain('Type answer and press Enter...');
  });

  it('shows number expected hint when input kind is number', () => {
    const html = renderToString(
      <InteractiveConsole
        logs={[]}
        status="waiting-for-input"
        inputRequest={{ id: '99', prompt: 'Enter first number:', kind: 'number' }}
        onSendInput={vi.fn()}
        onRun={vi.fn()}
        onStop={vi.fn()}
        onRestart={vi.fn()}
        onClear={vi.fn()}
        isRunning={true}
        isLight={false}
      />
    );

    expect(html).toContain('Enter first number:');
    expect(html).toContain('number expected');
    expect(html).toContain('Enter a number (press Enter)...');
  });

  it('shows Finished status chip with duration', () => {
    const html = renderToString(
      <InteractiveConsole
        logs={[{ id: '1', type: 'output', text: 'Done!', mode: 'say' }]}
        status="completed"
        durationMs={42}
        inputRequest={null}
        onSendInput={vi.fn()}
        onRun={vi.fn()}
        onStop={vi.fn()}
        onRestart={vi.fn()}
        onClear={vi.fn()}
        isRunning={false}
        isLight={false}
      />
    );

    expect(html).toContain('Finished');
    expect(html).toContain('42 ms');
  });
});
