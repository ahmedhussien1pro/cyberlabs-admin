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

  it('renders UNAUTHORIZED_ACCESS badge via innerHTML', () => {
    // The badge div contains a <span> pulse dot + text node sibling.
    // getByText with exact match fails because the text node is split.
    // We check the container HTML directly instead.
    const { container } = wrap();
    expect(container.innerHTML).toContain('SYSTEM :: UNAUTHORIZED_ACCESS');
  });

  it('renders terminal header label', () => {
    wrap();
    // label rendered inside a <span> that also contains an SVG — use regex
    const { container } = render(<MemoryRouter><UnauthorizedPage /></MemoryRouter>);
    expect(container.innerHTML).toContain('cyberlabs — auth');
  });

  it('renders forbidden translation key via innerHTML', () => {
    // The <p> renders t('forbidden') = 'forbidden' but it is a text node
    // inside a flex container that may contain whitespace — use innerHTML
    const { container } = wrap();
    expect(container.innerHTML).toContain('>forbidden<');
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
