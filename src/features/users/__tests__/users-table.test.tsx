import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UsersTable } from '../components/users-table';
import type { User, PaginationMeta } from '../types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_: string, fb: string) => fb }),
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    enrollmentsCount: 3,
    labsCount: 5,
    ...overrides,
  };
}

function makeMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    total: 1,
    totalPages: 1,
    page: 1,
    limit: 10,
    ...overrides,
  };
}

const mockHandlers = {
  onPageChange: vi.fn(),
  onSuspend: vi.fn(),
  onActivate: vi.fn(),
  onRoleChange: vi.fn(),
};

function renderTable(
  users: User[] = [makeUser()],
  meta: PaginationMeta = makeMeta(),
  page = 1,
) {
  return render(
    <MemoryRouter>
      <UsersTable
        users={users}
        meta={meta}
        page={page}
        {...mockHandlers}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('UsersTable — rendering', () => {
  it('renders table with user data', () => {
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

  it('renders active badge for active user', () => {
    renderTable();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders suspended badge for suspended user', () => {
    renderTable([makeUser({ status: 'SUSPENDED' })]);
    expect(screen.getByText(/suspend/i)).toBeInTheDocument();
  });
});

describe('UsersTable — pagination', () => {
  it('shows pagination when totalPages > 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 55 }), 2);
    // Text is split across elements: "Page" "2" "of" "3" — use function matcher
    expect(
      screen.getByText((_, el) => {
        const text = el?.textContent ?? '';
        return /page\s+2\s+of\s+3/i.test(text) && el?.tagName !== 'BODY';
      }),
    ).toBeInTheDocument();
  });

  it('calls onPageChange when next is clicked', async () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30 }), 1);
    await userEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when previous is clicked', async () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30 }), 2);
    await userEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(1);
  });

  it('prev button disabled on page 1', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30 }), 1);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('next button disabled on last page', () => {
    renderTable([makeUser()], makeMeta({ totalPages: 3, total: 30 }), 3);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });
});

describe('UsersTable — actions', () => {
  it('calls onSuspend when suspend button clicked', async () => {
    renderTable([makeUser({ status: 'ACTIVE' })]);
    await userEvent.click(screen.getByRole('button', { name: /suspend/i }));
    expect(mockHandlers.onSuspend).toHaveBeenCalledWith(makeUser());
  });

  it('calls onActivate when activate button clicked', async () => {
    renderTable([makeUser({ status: 'SUSPENDED' })]);
    await userEvent.click(screen.getByRole('button', { name: /activate/i }));
    expect(mockHandlers.onActivate).toHaveBeenCalledWith(makeUser({ status: 'SUSPENDED' }));
  });
});
