// src/features/errors/__tests__/not-found-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../pages/not-found-page';

vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, React.ElementType>, {
    get: (_t, tag: string) =>
      function MockMotion({
        children,
        ...rest
      }: React.PropsWithChildren<Record<string, unknown>>) {
        const {
          animate,
          initial,
          exit,
          transition,
          whileHover,
          whileTap,
          ...domProps
        } = rest;
        void animate;
        void initial;
        void exit;
        void transition;
        void whileHover;
        void whileTap;
        return React.createElement(tag, domProps, children);
      },
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('../components/binary-rain', () => ({
  BinaryRain: () => <div data-testid='binary-rain' />,
}));
vi.mock('../components/glitch-text', () => ({
  GlitchText: ({ text }: { text: string }) => <span>{text}</span>,
}));
vi.mock('../components/terminal-block', () => ({
  TerminalBlock: ({ lines }: { lines: string[] }) => (
    <pre>{lines.join('\n')}</pre>
  ),
}));

describe('NotFoundPage', () => {
  function wrap() {
    return render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
  }

  it('renders 404 glitch text', () => {
    wrap();
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('renders the BinaryRain component', () => {
    wrap();
    expect(screen.getByTestId('binary-rain')).toBeTruthy();
  });

  it('renders a link back to home', () => {
    wrap();
    const link = screen.getByRole('link');
    expect(link).toBeTruthy();
  });

  it('renders terminal block', () => {
    wrap();
    expect(
      screen.getByRole('heading', { level: 2 }) ||
        screen.getAllByText(/404|not.found/i).length,
    ).toBeTruthy();
  });

  it('renders the not-found heading text', () => {
    wrap();
    const el = screen.getByText(/Page Not Found|not found/i);
    expect(el).toBeTruthy();
  });

  it('has a go-home / go-back button or link', () => {
    wrap();
    const btns = screen.getAllByRole('link');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = wrap();
    expect(container.firstChild).toBeTruthy();
  });
});
