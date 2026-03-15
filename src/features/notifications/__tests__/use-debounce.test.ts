// src/features/notifications/__tests__/use-debounce.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/use-debounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'b' });
    vi.advanceTimersByTime(100);
    expect(result.current).toBe('a');
    vi.useRealTimers();
  });

  it('updates after delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'b' });
    act(() => { vi.advanceTimersByTime(350); });
    expect(result.current).toBe('b');
    vi.useRealTimers();
  });

  it('resets timer on rapid changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'b' });
    vi.advanceTimersByTime(200);
    rerender({ v: 'c' });
    vi.advanceTimersByTime(200);
    expect(result.current).toBe('a'); // still not updated
    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current).toBe('c');
    vi.useRealTimers();
  });
});
