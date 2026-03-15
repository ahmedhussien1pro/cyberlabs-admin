// src/features/dashboard/__tests__/dashboard-error-alert.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardErrorAlert } from '../components/dashboard-error-alert';

describe('DashboardErrorAlert', () => {
  it('renders nothing when errorType is null', () => {
    const { container } = render(<DashboardErrorAlert errorType={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders forbidden title and extra info block', () => {
    render(<DashboardErrorAlert errorType='forbidden' />);
    expect(screen.getByText('Access Denied')).toBeTruthy();
    expect(screen.getByText('Admin Access Required')).toBeTruthy();
  });

  it('renders unauthorized message', () => {
    render(<DashboardErrorAlert errorType='unauthorized' />);
    expect(screen.getByText('Authentication Required')).toBeTruthy();
    expect(screen.getByText(/session has expired/)).toBeTruthy();
  });

  it('renders network message', () => {
    render(<DashboardErrorAlert errorType='network' />);
    expect(screen.getByText('Connection Error')).toBeTruthy();
  });

  it('renders custom warningText for server error', () => {
    render(<DashboardErrorAlert errorType='server' warningText='Custom warning' />);
    expect(screen.getByText('Custom warning')).toBeTruthy();
  });
});
