// src/features/users/__tests__/user-role-dialog.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRoleDialog } from '../components/user-role-dialog';
import type { User } from '@/core/types';

const mockUpdateRole = vi.fn();
vi.mock('@/core/api/services', () => ({
  usersService: { updateRole: (...a: any[]) => mockUpdateRole(...a) },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const fakeUser: User = {
  id: 'u1', email: 'john@example.com', name: 'John',
  role: 'USER', isActive: true, createdAt: new Date().toISOString(),
} as User;

function renderDialog(open = true, onSuccess = vi.fn(), onOpenChange = vi.fn()) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <UserRoleDialog user={fakeUser} open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('UserRoleDialog', () => {
  it('renders all 4 role options', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Instructor')).toBeInTheDocument();
    expect(screen.getByText('Content Creator')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('calls updateRole when role changed and submitted', async () => {
    mockUpdateRole.mockResolvedValue({});
    renderDialog();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Admin'));
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    await waitFor(() => expect(mockUpdateRole).toHaveBeenCalledWith('u1', { role: 'ADMIN' }));
  });

  it('closes without API call if same role selected', async () => {
    const onOpenChange = vi.fn();
    renderDialog(true, vi.fn(), onOpenChange);
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    expect(mockUpdateRole).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error alert on API failure', async () => {
    mockUpdateRole.mockRejectedValue({ response: { data: { message: 'Forbidden' } } });
    renderDialog();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Admin'));
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Forbidden'));
  });
});
