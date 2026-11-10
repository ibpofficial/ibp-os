import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TerminalView } from '../src/components/Terminal/TerminalView';

describe('TerminalView Component Tests', () => {
  it('renders initial prompt and system information', () => {
    const html = renderToString(<TerminalView compact={false} />);
    expect(html).toContain('IBP Interactive Terminal &amp; Shell');
    expect(html).toContain('PS C:\\Users\\guest\\projects&gt;');
  });

  it('renders compact prompt when compact is true', () => {
    const html = renderToString(
      <TerminalView compact={true} initialCwd="IBP://USERS/guest/projects" />
    );
    expect(html).toContain('IBP://USERS/guest/projects&gt;');
  });

  it('renders input line with prompt styling', () => {
    const html = renderToString(<TerminalView compact={true} />);
    expect(html).toContain('<input');
  });
});

