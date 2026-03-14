import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRoleDialog } from '../components/user-role-dialog';

const mockUpdateRole = vi.fn();

vi.mock('@/core/api/services', () => ({
  usersService: {
    updateRole: (...a: any[]) => mockUpdateRole(...a),
  },
}));

const mockUser = {
  id: 'u1',
  name: 'John',
  email: 'john@example.com',
  role: 'USER' as const,
  status: 'ACTIVE' as const,
  createdAt: new Date().toISOString(),
  enrollmentsCount: 0,
  labsCount: 0,
};

function renderDialog(user = mockUser) {
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <UserRoleDialog user={user} open onClose={vi.fn()} onSuccess={vi.fn()} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateRole.mockResolvedValue({});
});

describe('UserRoleDialog', () => {
  it('renders dialog with user info', () => {
    renderDialog();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  it('renders all 4 role options', async () => {
    renderDialog();
    const combobox = screen.getByRole('combobox');
    await userEvent.pointer([{ keys: '[PointerDown]', target: combobox }]);
    const body = within(document.body);
    expect(body.getByText('Instructor')).toBeInTheDocument();
    expect(body.getByText('Content Creator')).toBeInTheDocument();
    expect(body.getByText('Admin')).toBeInTheDocument();
    expect(body.getByText('User')).toBeInTheDocument();
  });

  it('calls updateRole when role changed and submitted', async () => {
    renderDialog();
    const combobox = screen.getByRole('combobox');
    await userEvent.pointer([{ keys: '[PointerDown]', target: combobox }]);
    await userEvent.click(within(document.body).getByText('Admin'));
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    await waitFor(() =>
      expect(mockUpdateRole).toHaveBeenCalledWith('u1', { role: 'ADMIN' }),
    );
  });

  it('shows error alert on API failure', async () => {
    mockUpdateRole.mockRejectedValue({ message: 'Forbidden' });
    renderDialog();
    const combobox = screen.getByRole('combobox');
    await userEvent.pointer([{ keys: '[PointerDown]', target: combobox }]);
    await userEvent.click(within(document.body).getByText('Admin'));
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Forbidden'),
    );
  });
});
