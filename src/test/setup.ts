import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

// Silence framer-motion in tests
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, tag) => (props: any) => {
      const { children, ...rest } = props;
      // remove framer-specific props to avoid DOM warnings
      const { initial, animate, transition, whileHover, whileTap, ...domProps } = rest;
      return <>{children}</>;
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Silence matchMedia (not in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
