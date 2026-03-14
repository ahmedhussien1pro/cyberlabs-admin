// src/features/users/__tests__/users-table.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UsersTable } from '../components/users-table';
import type { UserListItem, PaginationMeta } from '@/core/types';

const makeUser = (overrides: Partial<UserListItem> = {}): UserListItem => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  isActive: true,
  createdAt: new Date().toISOString(),
  security: { isSuspended: false },
  _count: { enrollments: 3, labProgress: 5 },
  ...overrides,
});

const makeMeta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  page: 1, totalPages: 3, total: 55, limit: 20,
  ...overrides,
});

function renderTable(
  users: UserListItem[] = [makeUser()],
  meta?: PaginationMeta,
  page = 1,
  onPageChange = vi.fn(),
) {
  return render(
    <MemoryRouter>
      <UsersTable data={users} meta={meta} page={page} onPageChange={onPageChange} />
    </MemoryRouter>,
  );
}

describe('UsersTable — empty state', () => {
  it('shows "No users found" when data is empty', () => {
    renderTable([]);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });
});

describe('UsersTable — data display', () => {
  it('renders user name and email', () => {
    renderTable();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    renderTable([makeUser({ role: 'ADMIN' })]);
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('shows "Active" badge for active user', () => {
    renderTable([makeUser({ isActive: true, security: { isSuspended: false } })]);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows "Suspended" badge for suspended user', () => {
    renderTable([makeUser({ security: { isSuspended: true } })]);
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  it('shows enrollment and lab counts', () => {
    renderTable([makeUser({ _count: { enrollments: 7, labProgress: 2 } })]);
    expect(screen.getByText(/7 enrollments/i)).toBeInTheDocument();
    expect(screen.getByText(/2 labs/i)).toBeInTheDocument();
  });

  it('falls back to email when name is null', () => {
    renderTable([makeUser({ name: null as any })]);
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
  });
});

describe('UsersTable — pagination', () => {
  it('shows pagination when totalPages > 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3 }), 2);
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
  });

  it('hides pagination when totalPages <= 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 1 }));
    expect(screen.queryByText(/previous/i)).not.toBeInTheDocument();
  });

  it('Previous button disabled on first page', () => {
    renderTable([makeUser()], makeMeta(), 1);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('Next button disabled on last page', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3 }), 3);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('calls onPageChange with page-1 on Previous click', () => {
    const onPageChange = vi.fn();
    renderTable([makeUser()], makeMeta(), 2, onPageChange);
    fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with page+1 on Next click', () => {
    const onPageChange = vi.fn();
    renderTable([makeUser()], makeMeta({ totalPages: 3 }), 2, onPageChange);
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
