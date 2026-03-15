// src/features/errors/__tests__/binary-rain.test.tsx
// NOTE: framer-motion is mocked globally in vitest setup.
// BinaryRain renders motion.div columns — we test via innerHTML / data-testid.
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BinaryRain } from '../components/binary-rain';

// Mock framer-motion so motion.div renders as plain div
vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, any>, {
    get: (_t, tag: string) =>
      function MockMotion({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) {
        const Tag = tag as keyof JSX.IntrinsicElements;
        const { animate, initial, exit, transition, whileHover, whileTap, style, ...domProps } = rest as any;
        void animate; void initial; void exit; void transition; void whileHover; void whileTap;
        return <Tag style={style} {...domProps}>{children}</Tag>;
      },
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('BinaryRain', () => {
  it('renders default 12 columns', () => {
    const { container } = render(<BinaryRain />);
    // wrapper div > 12 motion.div columns
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
    // class is applied on each column div — check innerHTML string
    expect(container.innerHTML).toContain('text-red-400');
  });

  it('wrapper has pointer-events-none', () => {
    const { container } = render(<BinaryRain />);
    expect(container.firstElementChild?.className).toContain('pointer-events-none');
  });
});
