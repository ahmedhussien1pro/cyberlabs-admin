// src/features/errors/__tests__/not-found-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../pages/not-found-page';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('framer-motion', async (orig) => {
  const actual = await orig<typeof import('framer-motion')>();
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (_t, tag: string) =>
        ({ children, ...p }: any) =>
          actual.motion[tag as keyof typeof actual.motion]
            ? actual.motion[tag as keyof typeof actual.motion](p, children)
            : <div {...p}>{children}</div>,
    }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

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
    expect(screen.getByText('SYSTEM :: PAGE_NOT_FOUND')).toBeTruthy();
  });

  it('renders terminal header label', () => {
    wrap();
    expect(screen.getByText('cyberlabs — bash')).toBeTruthy();
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
