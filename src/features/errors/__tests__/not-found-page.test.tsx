// src/features/errors/__tests__/not-found-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../pages/not-found-page';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

// Lightweight framer-motion mock — avoids deep type instantiation
vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, any>, {
    get: (_t, tag: string) =>
      function MockMotion({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) {
        const Tag = tag as keyof JSX.IntrinsicElements;
        // strip framer-only props to avoid unknown-attr warnings
        const { animate, initial, exit, transition, whileHover, whileTap, ...domProps } = rest as any;
        void animate; void initial; void exit; void transition; void whileHover; void whileTap;
        return <Tag {...domProps}>{children}</Tag>;
      },
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

function wrap() {
  return render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
}

describe('NotFoundPage', () => {
  it('renders 404 text', () => {
    wrap();
    expect(screen.getAllByText('404').length).toBeGreaterThan(0);
  });

  it('renders PAGE_NOT_FOUND badge', () => {
    wrap();
    expect(screen.getByText(/SYSTEM :: PAGE_NOT_FOUND/)).toBeTruthy();
  });

  it('renders terminal header label', () => {
    wrap();
    expect(screen.getByText(/cyberlabs.*bash/)).toBeTruthy();
  });

  it('renders translated notFoundDesc key', () => {
    wrap();
    expect(screen.getByText('notFoundDesc')).toBeTruthy();
  });

  it('renders home button with notFoundBack key', () => {
    wrap();
    expect(screen.getByText('notFoundBack')).toBeTruthy();
  });

  it('renders goBack button', () => {
    wrap();
    expect(screen.getByText('goBack')).toBeTruthy();
  });

  it('goBack button calls window.history.back', () => {
    const spy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    wrap();
    fireEvent.click(screen.getByText('goBack'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
