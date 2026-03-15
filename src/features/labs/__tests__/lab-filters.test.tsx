import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LabFilters } from '../components/lab-filters';
import type { SortOption } from '../components/lab-filters';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

const defaultProps = {
  search: '',
  onSearchChange: vi.fn(),
  difficultyFilter: 'ALL',
  onDifficultyFilterChange: vi.fn(),
  categoryFilter: 'ALL',
  onCategoryFilterChange: vi.fn(),
  executionModeFilter: 'ALL',
  onExecutionModeFilterChange: vi.fn(),
  publishedFilter: 'all' as const,
  onPublishedFilterChange: vi.fn(),
  sort: 'newest' as SortOption,
  onSortChange: vi.fn(),
};

describe('LabFilters', () => {
  it('renders search input', () => {
    render(<LabFilters {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('calls onSearchChange when typing in search input', () => {
    const onSearchChange = vi.fn();
    render(<LabFilters {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'sql injection' } });
    expect(onSearchChange).toHaveBeenCalledWith('sql injection');
  });

  it('renders current search value', () => {
    render(<LabFilters {...defaultProps} search="xss" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('xss');
  });

  it('renders all filter selects', () => {
    render(<LabFilters {...defaultProps} />);
    // Select triggers are comboboxes
    const selects = screen.getAllByRole('combobox');
    // difficulty, category, published, executionMode, sort = 5 selects
    expect(selects.length).toBeGreaterThanOrEqual(5);
  });
});
