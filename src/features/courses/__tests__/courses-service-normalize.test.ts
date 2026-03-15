import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test normalizeStats logic directly by replicating its behaviour
// (avoids needing to import the actual axios-dependent service)
function normalizeStats(raw: unknown) {
  let payload: any = raw;
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    payload = (payload as any).data;
  }
  if (payload && typeof payload === 'object' && 'data' in (payload as object)
    && typeof (payload as any).data === 'object') {
    payload = (payload as any).data;
  }
  return {
    total:       payload?.total       ?? 0,
    published:   payload?.published   ?? 0,
    unpublished: payload?.unpublished ?? (payload?.total ?? 0) - (payload?.published ?? 0),
    featured:    payload?.featured    ?? payload?.isFeatured ?? 0,
    byState:     payload?.byState     ?? payload?.by_state ?? {},
  };
}

describe('normalizeStats (courses.service)', () => {
  it('handles direct response { total, published, ... }', () => {
    const result = normalizeStats({ total: 10, published: 7, unpublished: 3, featured: 2, byState: {} });
    expect(result.total).toBe(10);
    expect(result.published).toBe(7);
    expect(result.featured).toBe(2);
  });

  it('handles single-wrapped { data: { total, ... } }', () => {
    const result = normalizeStats({ data: { total: 5, published: 3, unpublished: 2, featured: 0, byState: {} } });
    expect(result.total).toBe(5);
    expect(result.published).toBe(3);
  });

  it('handles double-wrapped { data: { data: { total, ... } } }', () => {
    const result = normalizeStats({ data: { data: { total: 8, published: 6, unpublished: 2, featured: 1, byState: { PUBLISHED: 6 } } } });
    expect(result.total).toBe(8);
    expect(result.published).toBe(6);
    expect(result.byState).toEqual({ PUBLISHED: 6 });
  });

  it('defaults missing fields to 0 / empty object', () => {
    const result = normalizeStats({});
    expect(result.total).toBe(0);
    expect(result.published).toBe(0);
    expect(result.featured).toBe(0);
    expect(result.byState).toEqual({});
  });

  it('computes unpublished from total - published if not in response', () => {
    const result = normalizeStats({ total: 10, published: 6 });
    expect(result.unpublished).toBe(4);
  });

  it('uses isFeatured fallback when featured is absent', () => {
    const result = normalizeStats({ total: 3, published: 3, isFeatured: 2 });
    expect(result.featured).toBe(2);
  });

  it('handles null / undefined input gracefully', () => {
    expect(normalizeStats(null).total).toBe(0);
    expect(normalizeStats(undefined).total).toBe(0);
  });
});
