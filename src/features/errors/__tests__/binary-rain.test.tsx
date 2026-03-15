// src/features/errors/__tests__/binary-rain.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BinaryRain } from '../components/binary-rain';

describe('BinaryRain', () => {
  it('renders default 12 columns', () => {
    const { container } = render(<BinaryRain />);
    // each column is a motion.div inside the wrapper
    const cols = container.querySelectorAll('div > div');
    expect(cols.length).toBe(12);
  });

  it('renders custom number of columns', () => {
    const { container } = render(<BinaryRain cols={6} />);
    const cols = container.querySelectorAll('div > div');
    expect(cols.length).toBe(6);
  });

  it('applies custom color class', () => {
    const { container } = render(<BinaryRain color='text-red-400' />);
    expect(container.innerHTML).toContain('text-red-400');
  });

  it('wrapper has pointer-events-none', () => {
    const { container } = render(<BinaryRain />);
    expect(container.firstElementChild?.className).toContain('pointer-events-none');
  });
});
