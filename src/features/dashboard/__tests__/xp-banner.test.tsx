// src/features/dashboard/__tests__/xp-banner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XpBanner } from '../components/xp-banner';

describe('XpBanner', () => {
  it('renders XP value formatted with locale', () => {
    render(<XpBanner totalXP={1000} totalPoints={500} />);
    expect(screen.getByText('1,000')).toBeTruthy();
  });

  it('renders points value', () => {
    render(<XpBanner totalXP={0} totalPoints={2500} />);
    expect(screen.getByText('2,500')).toBeTruthy();
  });

  it('renders both labels', () => {
    render(<XpBanner totalXP={0} totalPoints={0} />);
    expect(screen.getByText('Total XP Awarded')).toBeTruthy();
    expect(screen.getByText('Total Points Awarded')).toBeTruthy();
  });
});
