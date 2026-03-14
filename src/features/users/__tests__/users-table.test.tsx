// src/features/users/__tests__/users-table.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UsersTable } from '../components/users-table';
import type { UserListItem, PaginationMeta } from '@/core/types';

function makeUser(overrides: Partial<UserListItem> = {}): UserListItem {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    isActive: true,
    createdAt: new Date().toISOString(),
    _count: { enrollments: 3, labProgress: 5 },
    ...overrides,
  };
}

function makeMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return { total: 1, totalPages: 1, page: 1, limit: 10, ...overrides };
}

const mockOnPageChange = vi.fn();

function renderTable(
  data: UserListItem[] = [makeUser()],
  meta: PaginationMeta   = makeMeta(),
  page = 1,
) {
  return render(
    <MemoryRouter>
      <UsersTable data={data} meta={meta} page={page} onPageChange={mockOnPageChange} />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('UsersTable — rendering', () => {
  it('renders table with user name and email', () => {
    renderTable();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderTable();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders empty state when no users', () => {
    renderTable([]);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders Active badge for active user', () => {
    renderTable([makeUser({ isActive: true })]);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Suspended badge for suspended user', () => {
    renderTable([makeUser({ security: { isSuspended: true } })]);
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });
});

describe('UsersTable — pagination', () => {
  it('shows pagination text when totalPages > 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 55, page: 2 }), 2);
    expect(
      screen.getByText((_, el) => /page\s+2\s+of\s+3/i.test(el?.textContent ?? '') && el?.tagName !== 'BODY'),
    ).toBeInTheDocument();
  });

  it('calls onPageChange(next) when Next clicked', async () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30, page: 1 }), 1);
    await userEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange(prev) when Previous clicked', async () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30, page: 2 }), 2);
    await userEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('Previous button disabled on page 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30, page: 1 }), 1);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('Next button disabled on last page', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30, page: 3 }), 3);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('pagination not rendered when totalPages = 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 1, total: 1 }), 1);
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument();
  });
});
