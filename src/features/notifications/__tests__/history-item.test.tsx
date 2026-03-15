// src/features/notifications/__tests__/history-item.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryItem } from '../components/history-item';
import type { Notification } from '@/core/api/services/notifications.service';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const base: Notification = {
  id: 'n1',
  title: 'Test Notif',
  message: 'Hello world',
  type: 'INFO',
  sentAt: new Date('2025-01-01T10:00:00Z').toISOString(),
  recipientCount: 42,
  sentBy: { id: 'u1', name: 'Admin' },
  targetUser: null,
};

describe('HistoryItem', () => {
  it('renders title and message', () => {
    render(<HistoryItem notif={base} />);
    expect(screen.getByText('Test Notif')).toBeTruthy();
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('renders recipient count', () => {
    render(<HistoryItem notif={base} />);
    expect(screen.getByText(/42/)).toBeTruthy();
  });

  it('renders sentBy name', () => {
    render(<HistoryItem notif={base} />);
    expect(screen.getByText('Admin')).toBeTruthy();
  });

  it('renders targetUser badge when present', () => {
    render(<HistoryItem notif={{ ...base, targetUser: { id: 'u2', name: 'Bob' } }} />);
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('does NOT render targetUser badge when absent', () => {
    render(<HistoryItem notif={base} />);
    expect(screen.queryByText('Bob')).toBeNull();
  });

  it('falls back to INFO meta for unknown type', () => {
    const { container } = render(
      <HistoryItem notif={{ ...base, type: 'UNKNOWN' as any }} />,
    );
    expect(container.querySelector('.bg-blue-500\/10')).toBeTruthy();
  });

  it('renders type badge using translation key', () => {
    render(<HistoryItem notif={base} />);
    // t mock returns key as-is: 'types.INFO'
    expect(screen.getByText('types.INFO')).toBeTruthy();
  });
});
