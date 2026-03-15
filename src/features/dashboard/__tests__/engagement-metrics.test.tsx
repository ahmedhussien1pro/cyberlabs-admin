// src/features/dashboard/__tests__/engagement-metrics.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EngagementMetrics } from '../components/engagement-metrics';
import type { EngagementMetrics as EngagementMetricsType } from '@/core/types';

const mockData: EngagementMetricsType = {
  activeUsers: 120,
  labLaunches: 340,
  submissions: 95,
  avgSessionDuration: 3660, // 1h 1m
};

describe('EngagementMetrics', () => {
  it('renders all 4 metric labels', () => {
    render(<EngagementMetrics data={mockData} />);
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Lab Launches')).toBeInTheDocument();
    expect(screen.getByText('Submissions')).toBeInTheDocument();
    expect(screen.getByText('Avg Session')).toBeInTheDocument();
  });

  it('renders formatted avgSessionDuration as "1h 1m"', () => {
    render(<EngagementMetrics data={mockData} />);
    expect(screen.getByText('1h 1m')).toBeInTheDocument();
  });

  it('renders numeric values with toLocaleString', () => {
    render(<EngagementMetrics data={mockData} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('340')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('renders card title', () => {
    render(<EngagementMetrics data={mockData} />);
    expect(screen.getByText(/engagement metrics/i)).toBeInTheDocument();
  });
});
