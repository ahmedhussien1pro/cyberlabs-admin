// src/features/users/__tests__/user-filters.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFilters } from '../components/user-filters';
import type { UserRole } from '@/core/types';
import type { StatusFilter } from '../types';

// Mock Radix Select — jsdom cannot open portalled dropdowns reliably.
// We test the component contract (callbacks fire with correct values)
// instead of DOM portal internals.
vi.mock('@/components/ui/select', () => {
  const React = require('react');
  const Select = ({ value, onValueChange, children }: any) =>
    React.createElement('div', { 'data-testid': 'select', 'data-value': value },
      React.Children.map(children, (child: any) =>
        React.cloneElement(child, { onValueChange })));
  const SelectTrigger = ({ children, 'aria-label': label }: any) =>
    React.createElement('button', { role: 'combobox', 'aria-label': label }, children);
  const SelectValue  = ({ placeholder }: any) => React.createElement('span', null, placeholder);
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

const mockOnSearchChange      = vi.fn();
const mockOnRoleFilterChange  = vi.fn();
const mockOnStatusFilterChange = vi.fn();

function renderFilters(overrides?: {
  search?: string;
  roleFilter?: UserRole | 'ALL';
  statusFilter?: StatusFilter;
}) {
  return render(
    <UserFilters
      search={overrides?.search ?? ''}
      onSearchChange={mockOnSearchChange}
      roleFilter={overrides?.roleFilter ?? 'ALL'}
      onRoleFilterChange={mockOnRoleFilterChange}
      statusFilter={overrides?.statusFilter ?? 'all'}
      onStatusFilterChange={mockOnStatusFilterChange}
    />,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('UserFilters', () => {
  it('renders search input and two role/status selects', () => {
    renderFilters();
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by role/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when user types in search box', async () => {
    renderFilters();
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'John');
    expect(mockOnSearchChange).toHaveBeenCalled();
    expect(mockOnSearchChange).toHaveBeenLastCalledWith(expect.stringContaining('n'));
  });

  it('renders all role options: ALL, USER, ADMIN, INSTRUCTOR, CONTENT_CREATOR', () => {
    renderFilters();
    expect(screen.getByRole('option', { name: 'All Roles' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Instructor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Content Creator' })).toBeInTheDocument();
  });

  it('calls onRoleFilterChange with correct value when role option clicked', async () => {
    renderFilters();
    await userEvent.click(screen.getByRole('option', { name: 'Instructor' }));
    expect(mockOnRoleFilterChange).toHaveBeenCalledWith('INSTRUCTOR');
  });

  it('calls onRoleFilterChange with CONTENT_CREATOR', async () => {
    renderFilters();
    await userEvent.click(screen.getByRole('option', { name: 'Content Creator' }));
    expect(mockOnRoleFilterChange).toHaveBeenCalledWith('CONTENT_CREATOR');
  });

  it('calls onStatusFilterChange when status option clicked', async () => {
    renderFilters();
    await userEvent.click(screen.getByRole('option', { name: 'Active' }));
    expect(mockOnStatusFilterChange).toHaveBeenCalledWith('active');
  });
});
