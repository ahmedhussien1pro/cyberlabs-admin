// src/features/dashboard/__tests__/breakdown-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreakdownCard } from '../components/breakdown-card';
import { Users } from 'lucide-react';

const baseRows = [
  { label: 'Total', value: 42 },
  { label: 'Active', value: 30, badge: 'secondary' as const },
  { label: 'Banned',  value: 2,  badge: 'destructive' as const },
];

describe('BreakdownCard', () => {
  it('renders the title', () => {
    render(<BreakdownCard title='Users Breakdown' icon={Users} rows={baseRows} />);
    expect(screen.getByText('Users Breakdown')).toBeTruthy();
  });

  it('renders all row labels', () => {
    render(<BreakdownCard title='Test' icon={Users} rows={baseRows} />);
    expect(screen.getByText('Total')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Banned')).toBeTruthy();
  });

  it('renders row values', () => {
    render(<BreakdownCard title='Test' icon={Users} rows={baseRows} />);
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('renders section heading and rows', () => {
    render(
      <BreakdownCard
        title='Test' icon={Users} rows={[{ label: 'T', value: 1 }]}
        section={{ heading: 'By Role', rows: [['admin', 5], ['user', 10]] }}
      />,
    );
    expect(screen.getByText('By Role')).toBeTruthy();
    expect(screen.getByText('admin')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renders green badge correctly', () => {
    const { container } = render(
      <BreakdownCard title='T' icon={Users} rows={[{ label: 'Pub', value: 7, badge: 'green' }]} />,
    );
    expect(container.querySelector('.text-green-800, .text-green-100')).toBeTruthy();
  });
});
