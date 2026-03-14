// JSX-capable setup file — framer-motion mock lives here.
// vitest.config.ts loads this AFTER setup.ts.
import { vi } from 'vitest';
import React from 'react';

// Silence framer-motion in jsdom — replace all motion.* with plain fragments
vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, React.FC<any>>, {
    get: (_t, _tag: string) =>
      ({ children, ...rest }: any) => {
        // Strip framer-specific props so React doesn't warn about unknown DOM attrs
        const {
          initial, animate, exit, transition,
          whileHover, whileTap, whileFocus,
          variants, layoutId, layout,
          ...domProps
        } = rest;
        void initial; void animate; void exit; void transition;
        void whileHover; void whileTap; void whileFocus;
        void variants; void layoutId; void layout; void domProps;
        return <>{children}</>;
      },
  }),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useAnimation:    () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  useMotionValue:  (initial: any) => ({ get: () => initial, set: vi.fn() }),
  useTransform:    (_v: any, _from: any, to: any[]) => ({ get: () => to[0], set: vi.fn() }),
}));
