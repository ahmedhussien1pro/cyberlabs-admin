// src/features/users/__tests__/user-filters.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFilters } from '../components/user-filters';

function renderFilters(overrides = {}) {
  const props = {
    search: '',
    onSearchChange: vi.fn(),
    roleFilter: 'ALL' as const,
    onRoleFilterChange: vi.fn(),
    statusFilter: 'all' as const,
    onStatusFilterChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<UserFilters {...props} />), ...props };
}

describe('UserFilters — rendering', () => {
  it('renders search input', () => {
    renderFilters();
    expect(screen.getByRole('textbox', { name: /search users/i })).toBeInTheDocument();
  });

  it('renders role and status selects', () => {
    renderFilters();
    expect(screen.getByRole('combobox', { name: /filter by role/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument();
  });
});

describe('UserFilters — search', () => {
  it('calls onSearchChange on input', async () => {
    const onSearchChange = vi.fn();
    renderFilters({ onSearchChange });
    await userEvent.type(screen.getByRole('textbox', { name: /search users/i }), 'ali');
    expect(onSearchChange).toHaveBeenCalled();
  });
});

describe('UserFilters — role options', () => {
  it('includes INSTRUCTOR and CONTENT_CREATOR options', async () => {
    renderFilters();
    await userEvent.click(screen.getByRole('combobox', { name: /filter by role/i }));
    expect(screen.getByText('Instructor')).toBeInTheDocument();
    expect(screen.getByText('Content Creator')).toBeInTheDocument();
  });
});
