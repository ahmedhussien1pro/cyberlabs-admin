// src/features/badges/__tests__/badge-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeCard } from '../components/badge-card';
import type { BadgeItem } from '@/core/api/services';

const base: BadgeItem = {
  id: 'b1', type: 'LAB', title: 'Lab Master', ar_title: 'سيد المختبر',
  description: 'Complete 10 labs', imageUrl: '', xpReward: 100, pointsReward: 50,
} as any;

describe('BadgeCard', () => {
  it('renders title', () => {
    render(<BadgeCard badge={base} />);
    expect(screen.getByText('Lab Master')).toBeTruthy();
  });

  it('renders ar_title', () => {
    render(<BadgeCard badge={base} />);
    expect(screen.getByText('سيد المختبر')).toBeTruthy();
  });

  it('renders description', () => {
    render(<BadgeCard badge={base} />);
    expect(screen.getByText('Complete 10 labs')).toBeTruthy();
  });

  it('renders XP reward badge', () => {
    render(<BadgeCard badge={base} />);
    expect(screen.getByText('100 XP')).toBeTruthy();
  });

  it('renders points reward badge', () => {
    render(<BadgeCard badge={base} />);
    expect(screen.getByText('50 pts')).toBeTruthy();
  });

  it('does not render XP badge when xpReward is 0', () => {
    render(<BadgeCard badge={{ ...base, xpReward: 0 }} />);
    expect(screen.queryByText(/XP/)).toBeNull();
  });

  it('renders type label badge', () => {
    render(<BadgeCard badge={base} />);
    expect(screen.getByText('Lab')).toBeTruthy();
  });

  it('renders DEFAULT_META label for unknown type', () => {
    render(<BadgeCard badge={{ ...base, type: 'UNKNOWN' }} />);
    expect(screen.getByText('Other')).toBeTruthy();
  });

  it('renders img when imageUrl is provided', () => {
    const { container } = render(<BadgeCard badge={{ ...base, imageUrl: 'https://cdn/x.png' }} />);
    expect(container.querySelector('img')).toBeTruthy();
  });
});
