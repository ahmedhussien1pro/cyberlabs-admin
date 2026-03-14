import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFilters } from '../components/user-filters';

const mockOnChange = vi.fn();

const defaultFilters = { search: '', role: '', status: '' };

function renderFilters(filters = defaultFilters) {
  return render(<UserFilters filters={filters} onChange={mockOnChange} />);
}

beforeEach(() => vi.clearAllMocks());

describe('UserFilters', () => {
  it('renders search input and two selects', () => {
    renderFilters();
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by role/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument();
  });

  it('calls onChange when search input changes', async () => {
    renderFilters();
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'John');
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('includes INSTRUCTOR and CONTENT_CREATOR options in role select', async () => {
    renderFilters();
    const roleCombobox = screen.getByRole('combobox', { name: /filter by role/i });
    // Open Radix Select via pointer events (jsdom requires this)
    await userEvent.pointer([{ keys: '[PointerDown]', target: roleCombobox }]);
    // Options render in a portal — query from document.body
    const body = within(document.body);
    expect(body.getByText('Instructor')).toBeInTheDocument();
    expect(body.getByText('Content Creator')).toBeInTheDocument();
  });

  it('includes all role options', async () => {
    renderFilters();
    const roleCombobox = screen.getByRole('combobox', { name: /filter by role/i });
    await userEvent.pointer([{ keys: '[PointerDown]', target: roleCombobox }]);
    const body = within(document.body);
    expect(body.getByText('Admin')).toBeInTheDocument();
    expect(body.getByText('User')).toBeInTheDocument();
    expect(body.getByText('Instructor')).toBeInTheDocument();
    expect(body.getByText('Content Creator')).toBeInTheDocument();
  });
});
