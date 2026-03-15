// src/features/errors/__tests__/terminal-block.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TerminalBlock } from '../components/terminal-block';

const lines = ['> line one', '> line two'];
const getLineColor = (l: string) => (l.includes('one') ? 'text-red-400' : 'text-primary/80');

describe('TerminalBlock', () => {
  it('renders the terminal header with label', () => {
    render(<TerminalBlock lines={lines} getLineColor={getLineColor} label='test — shell' />);
    expect(screen.getByText('test — shell')).toBeTruthy();
  });

  it('uses default label when not provided', () => {
    render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    expect(screen.getByText('cyberlabs — bash')).toBeTruthy();
  });

  it('renders 3 traffic-light dots in header via innerHTML', () => {
    // jsdom cannot parse Tailwind slash classes in querySelector/querySelectorAll
    // so we check innerHTML for the presence of each color class string
    const { container } = render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    const html = container.innerHTML;
    expect(html).toContain('bg-red-500/70');
    expect(html).toContain('bg-yellow-500/70');
    expect(html).toContain('bg-green-500/70');
    // count occurrences — each appears exactly once in the header
    const countRed    = (html.match(/bg-red-500\/70/g) ?? []).length;
    const countYellow = (html.match(/bg-yellow-500\/70/g) ?? []).length;
    const countGreen  = (html.match(/bg-green-500\/70/g) ?? []).length;
    expect(countRed).toBeGreaterThanOrEqual(1);
    expect(countYellow).toBeGreaterThanOrEqual(1);
    expect(countGreen).toBeGreaterThanOrEqual(1);
  });

  it('starts with empty lines and eventually shows content', async () => {
    vi.useFakeTimers();
    render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(screen.getByText('> line one')).toBeTruthy();
    vi.useRealTimers();
  });

  it('renders cursor blink element via innerHTML', () => {
    const { container } = render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    expect(container.innerHTML).toContain('blink');
  });

  it('applies custom cursorColor via innerHTML', () => {
    const { container } = render(
      <TerminalBlock lines={lines} getLineColor={getLineColor} cursorColor='bg-red-400' />,
    );
    expect(container.innerHTML).toContain('bg-red-400');
  });
});
