// src/features/notifications/__tests__/notifications-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from '../pages/notifications.page';

const mockGetHistory  = vi.fn();
const mockBroadcast   = vi.fn();
const mockToastError  = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('@/core/api/services/notifications.service', () => ({
  notificationsService: {
    getHistory: (...a: any[]) => mockGetHistory(...a),
    broadcast:  (...a: any[]) => mockBroadcast(...a),
  },
}));

vi.mock('@/core/api/services/users.service', () => ({
  usersService: { getAll: vi.fn().mockResolvedValue({ data: [] }) },
}));

vi.mock('sonner', () => ({
  toast: {
    error:   (...a: any[]) => mockToastError(...a),
    success: (...a: any[]) => mockToastSuccess(...a),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, _p?: any) => k }),
}));

function wrap() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><NotificationsPage /></MemoryRouter>
    </QueryClientProvider>,
  );
}

function getSendButton() {
  return screen
    .getAllByRole('button')
    .find((b) => b.textContent?.includes('form.sendButtonAll'))!;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetHistory.mockResolvedValue({ data: [] });
});

describe('NotificationsPage', () => {
  it('renders page title', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('page.title')).toBeTruthy());
  });

  it('renders send form card title', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('form.cardTitle')).toBeTruthy());
  });

  it('shows empty history state', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('history.empty')).toBeTruthy());
  });

  it('renders history items when data present', async () => {
    mockGetHistory.mockResolvedValue({
      data: [{
        id: 'n1', title: 'Alert!', message: 'Msg', type: 'INFO',
        sentAt: new Date().toISOString(), recipientCount: 5,
        sentBy: null, targetUser: null,
      }],
    });
    wrap();
    await waitFor(() => expect(screen.getByText('Alert!')).toBeTruthy());
  });

  it('shows validation error when send clicked with empty form', async () => {
    // Fill title only (message stays empty) so the button becomes enabled
    // but handleSend still hits the validation branch and calls toast.error
    wrap();
    await waitFor(() => screen.getByText('form.cardTitle'));

    fireEvent.change(screen.getByPlaceholderText('form.titlePlaceholder'), {
      target: { value: 'Some Title' },
    });

    const sendBtn = getSendButton();
    fireEvent.click(sendBtn);

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith('form.validationError'),
    );
  });

  it('switches to user target mode', async () => {
    wrap();
    const userBtn = await waitFor(() =>
      screen.getByRole('button', { name: /form\.targetUser/ }),
    );
    fireEvent.click(userBtn);
    await waitFor(() => expect(screen.getByText('form.selectedUser')).toBeTruthy());
  });

  it('opens confirm dialog when form is valid', async () => {
    wrap();
    await waitFor(() => screen.getByPlaceholderText('form.titlePlaceholder'));
    fireEvent.change(screen.getByPlaceholderText('form.titlePlaceholder'), {
      target: { value: 'My Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('form.messagePlaceholder'), {
      target: { value: 'My Message' },
    });
    fireEvent.click(getSendButton());
    await waitFor(() => expect(screen.getByText('confirm.title')).toBeTruthy());
  });

  it('calls broadcast on confirm', async () => {
    mockBroadcast.mockResolvedValue({ recipientCount: 10 });
    wrap();
    await waitFor(() => screen.getByPlaceholderText('form.titlePlaceholder'));
    fireEvent.change(screen.getByPlaceholderText('form.titlePlaceholder'), {
      target: { value: 'Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('form.messagePlaceholder'), {
      target: { value: 'Msg' },
    });
    fireEvent.click(getSendButton());
    await waitFor(() => screen.getByText('confirm.send'));
    fireEvent.click(screen.getByText('confirm.send'));
    await waitFor(() => expect(mockBroadcast).toHaveBeenCalled());
  });

  it('shows char counter for title', async () => {
    wrap();
    await waitFor(() => screen.getByText('0/120'));
    fireEvent.change(screen.getByPlaceholderText('form.titlePlaceholder'), {
      target: { value: 'Hi' },
    });
    await waitFor(() => expect(screen.getByText('2/120')).toBeTruthy());
  });

  it('shows preview when title is typed', async () => {
    wrap();
    await waitFor(() => screen.getByPlaceholderText('form.titlePlaceholder'));
    fireEvent.change(screen.getByPlaceholderText('form.titlePlaceholder'), {
      target: { value: 'Preview Title' },
    });
    await waitFor(() => expect(screen.getByText('form.previewLabel')).toBeTruthy());
  });
});
