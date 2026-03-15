// src/features/errors/__tests__/binary-rain.test.tsx
// NOTE: framer-motion is mocked globally in vitest setup.
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { BinaryRain } from '../components/binary-rain';

vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, React.ElementType>, {
    get: (_t, tag: string) =>
      function MockMotion({ children, style, ...rest }: React.PropsWithChildren<{ style?: React.CSSProperties; [k: string]: unknown }>) {
        const { animate, initial, exit, transition, whileHover, whileTap, ...domProps } = rest;
        void animate; void initial; void exit; void transition; void whileHover; void whileTap;
        return React.createElement(tag, { style, ...domProps }, children);
      },
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('BinaryRain', () => {
  it('renders default 12 columns', () => {
    const { container } = render(<BinaryRain />);
    const cols = container.firstElementChild?.children;
    expect(cols?.length).toBe(12);
  });

  it('renders custom number of columns', () => {
    const { container } = render(<BinaryRain cols={6} />);
    const cols = container.firstElementChild?.children;
    expect(cols?.length).toBe(6);
  });

  it('applies custom color class via innerHTML', () => {
    const { container } = render(<BinaryRain color='text-red-400' />);
    expect(container.innerHTML).toContain('text-red-400');
  });

  it('wrapper has pointer-events-none', () => {
    const { container } = render(<BinaryRain />);
    expect(container.firstElementChild?.className).toContain('pointer-events-none');
  });
});
