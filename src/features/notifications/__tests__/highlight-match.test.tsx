// src/features/notifications/__tests__/highlight-match.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { highlightMatch } from '../utils/highlight-match';

describe('highlightMatch', () => {
  it('returns plain text when query is empty', () => {
    expect(highlightMatch('Ahmed', '')).toBe('Ahmed');
  });

  it('returns plain text when no match found', () => {
    expect(highlightMatch('Ahmed', 'xyz')).toBe('Ahmed');
  });

  it('wraps matched part in <mark>', () => {
    const node = highlightMatch('Ahmed Ali', 'Ali');
    const { container } = render(<>{node}</>);
    expect(container.querySelector('mark')?.textContent).toBe('Ali');
  });

  it('is case-insensitive', () => {
    const node = highlightMatch('Ahmed', 'ahmed');
    const { container } = render(<>{node}</>);
    expect(container.querySelector('mark')?.textContent).toBe('Ahmed');
  });

  it('only highlights first occurrence', () => {
    const node = highlightMatch('aa aa', 'aa');
    const { container } = render(<>{node}</>);
    expect(container.querySelectorAll('mark').length).toBe(1);
  });
});
