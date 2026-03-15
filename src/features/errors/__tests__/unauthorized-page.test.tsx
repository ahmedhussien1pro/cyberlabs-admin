// src/features/errors/__tests__/unauthorized-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnauthorizedPage from '../pages/unauthorized-page';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

function wrap() {
  return render(<MemoryRouter><UnauthorizedPage /></MemoryRouter>);
}

describe('UnauthorizedPage', () => {
  it('renders 401 text', () => {
    wrap();
    expect(screen.getAllByText('401').length).toBeGreaterThan(0);
  });

  it('renders UNAUTHORIZED_ACCESS badge', () => {
    wrap();
    expect(screen.getByText('SYSTEM :: UNAUTHORIZED_ACCESS')).toBeTruthy();
  });

  it('renders terminal header label', () => {
    wrap();
    expect(screen.getByText('cyberlabs — auth')).toBeTruthy();
  });

  it('renders forbidden translation key', () => {
    wrap();
    expect(screen.getByText('forbidden')).toBeTruthy();
  });

  it('renders forbiddenBack button', () => {
    wrap();
    expect(screen.getByText('forbiddenBack')).toBeTruthy();
  });

  it('renders forbiddenLogin button', () => {
    wrap();
    expect(screen.getByText('forbiddenLogin')).toBeTruthy();
  });

  it('renders ShieldAlert icon (svg present)', () => {
    const { container } = wrap();
    expect(container.querySelector('.lucide-shield-alert')).toBeTruthy();
  });
});
