// src/features/users/__tests__/user-role-dialog.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRoleDialog } from '../components/user-role-dialog';
import type { User } from '@/core/types';

// Mock Radix Select (same approach as user-filters test)
vi.mock('@/components/ui/select', () => {
  const React = require('react');
  const Select = ({ value, onValueChange, children }: any) =>
    React.createElement('div', { 'data-testid': 'select', 'data-value': value },
      React.Children.map(children, (child: any) =>
        React.cloneElement(child, { onValueChange })));
  const SelectTrigger = ({ children, id }: any) =>
    React.createElement('button', { role: 'combobox', id }, children);
  const SelectValue  = () => React.createElement('span', null);
  const SelectContent = ({ children, onValueChange }: any) =>
    React.createElement('div', { 'data-testid': 'select-content' },
      React.Children.map(children, (child: any) =>
        React.cloneElement(child, { onValueChange })));
  const SelectItem = ({ value, children, onValueChange }: any) =>
    React.createElement('button', {
      role: 'option',
      'data-value': value,
      onClick: () => onValueChange?.(value),
    }, children);
  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});

// Mock sonner toast
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockUpdateRole = vi.fn();
vi.mock('@/core/api/services', () => ({
  usersService: { updateRole: (...a: any[]) => mockUpdateRole(...a) },
}));

const mockUser: User = {
  id: 'u1',
  name: 'John',
  email: 'john@example.com',
  role: 'USER',
  isActive: true,
  createdAt: new Date().toISOString(),
  _count: { enrollments: 0, labProgress: 0 },
};

function renderDialog(user = mockUser, open = true) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <UserRoleDialog
        user={user}
        open={open}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateRole.mockResolvedValue({});
});

describe('UserRoleDialog', () => {
  it('renders dialog with user email', () => {
    renderDialog();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  it('renders all 4 role options', () => {
    renderDialog();
    expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Instructor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Content Creator' })).toBeInTheDocument();
  });

  it('calls usersService.updateRole when role changed and submitted', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    await waitFor(() =>
      expect(mockUpdateRole).toHaveBeenCalledWith('u1', { role: 'ADMIN' }),
    );
  });

  it('shows error alert on API failure', async () => {
    mockUpdateRole.mockRejectedValue({ response: { data: { message: 'Forbidden' } } });
    renderDialog();
    await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Forbidden'),
    );
  });

  it('does not call updateRole when same role selected', async () => {
    renderDialog(); // user.role = 'USER', default select = 'USER'
    await userEvent.click(screen.getByRole('button', { name: /update role/i }));
    expect(mockUpdateRole).not.toHaveBeenCalled();
  });
});
