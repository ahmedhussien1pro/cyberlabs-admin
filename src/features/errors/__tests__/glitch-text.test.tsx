// src/features/errors/__tests__/glitch-text.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlitchText } from '../components/glitch-text';

describe('GlitchText', () => {
  it('renders the text 3 times (main + 2 aria-hidden layers)', () => {
    render(<GlitchText text='404' />);
    const spans = document.querySelectorAll('span');
    const texts = Array.from(spans).map((s) => s.textContent);
    expect(texts.filter((t) => t === '404').length).toBe(3);
  });

  it('marks both glitch layers as aria-hidden', () => {
    render(<GlitchText text='401' />);
    const hidden = document.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBe(2);
  });

  it('applies custom gradient classes', () => {
    const { container } = render(
      <GlitchText text='X' gradient='from-red-500 via-orange-400 to-red-500' />,
    );
    expect(container.innerHTML).toContain('from-red-500');
  });

  it('applies default gradient when no props passed', () => {
    const { container } = render(<GlitchText text='Y' />);
    expect(container.innerHTML).toContain('from-primary');
  });
});
