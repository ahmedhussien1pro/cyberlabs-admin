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

  it('renders 3 traffic-light dots in header', () => {
    const { container } = render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    const dots = container.querySelectorAll('.bg-red-500\/70, .bg-yellow-500\/70, .bg-green-500\/70');
    expect(dots.length).toBe(3);
  });

  it('starts with empty lines and eventually shows content', async () => {
    vi.useFakeTimers();
    render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    // advance past first line interval
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(screen.getByText('> line one')).toBeTruthy();
    vi.useRealTimers();
  });

  it('renders cursor blink element', () => {
    const { container } = render(<TerminalBlock lines={lines} getLineColor={getLineColor} />);
    expect(container.innerHTML).toContain('blink');
  });

  it('applies custom cursorColor', () => {
    const { container } = render(
      <TerminalBlock lines={lines} getLineColor={getLineColor} cursorColor='bg-red-400' />,
    );
    expect(container.innerHTML).toContain('bg-red-400');
  });
});
