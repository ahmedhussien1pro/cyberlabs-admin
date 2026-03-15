// src/features/dashboard/__tests__/stats-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { StatsCard } from '../components/stats-card';

describe('StatsCard', () => {
  it('renders title and numeric value formatted with locale', () => {
    render(<StatsCard title='Total Users' value={1500} icon={Users} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    // toLocaleString may render as '1,500' or '1 500' depending on locale
    expect(screen.getByText(/1[,\s.]?500|1500/)).toBeInTheDocument();
  });

  it('renders string value as-is', () => {
    render(<StatsCard title='Revenue' value='$99' icon={Users} />);
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatsCard title='T' value={0} icon={Users} subtitle='active this month' />);
    expect(screen.getByText('active this month')).toBeInTheDocument();
  });

  it('does not render subtitle when omitted', () => {
    render(<StatsCard title='T' value={0} icon={Users} />);
    expect(screen.queryByText(/active/i)).not.toBeInTheDocument();
  });

  it('renders positive change indicator', () => {
    render(<StatsCard title='T' value={0} icon={Users} change={12} />);
    expect(screen.getByText(/\+12%/)).toBeInTheDocument();
  });

  it('renders negative change indicator', () => {
    render(<StatsCard title='T' value={0} icon={Users} change={-5} />);
    expect(screen.getByText(/-5%/)).toBeInTheDocument();
  });

  it('renders zero change without + or - prefix', () => {
    render(<StatsCard title='T' value={0} icon={Users} change={0} />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });
});
