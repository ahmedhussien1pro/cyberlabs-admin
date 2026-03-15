import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseFilters } from '../components/course-filters';
import type { Difficulty } from '@/core/types';

vi.mock('@/components/ui/select', () => {
  const React = require('react');
  const Select = ({ value, onValueChange, children }: any) =>
    React.createElement('div', { 'data-value': value },
      React.Children.map(children, (c: any) => React.cloneElement(c, { onValueChange })));
  const SelectTrigger = ({ children }: any) => React.createElement('div', null, children);
  const SelectValue = ({ placeholder }: any) => React.createElement('span', null, placeholder);
  const SelectContent = ({ children, onValueChange }: any) =>
    React.createElement('div', null,
      React.Children.map(children, (c: any) => React.cloneElement(c, { onValueChange })));
  const SelectItem = ({ value, children, onValueChange }: any) =>
    React.createElement('button', { role: 'option', 'data-value': value, onClick: () => onValueChange?.(value) }, children);
  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});

const defaultProps = {
  search: '',
  onSearchChange: vi.fn(),
  difficultyFilter: 'ALL' as Difficulty | 'ALL',
  onDifficultyFilterChange: vi.fn(),
  publishedFilter: 'all' as 'all' | 'published' | 'unpublished',
  onPublishedFilterChange: vi.fn(),
};

describe('CourseFilters', () => {
  it('renders search input', () => {
    render(<CourseFilters {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('calls onSearchChange when typing', () => {
    const onSearchChange = vi.fn();
    render(<CourseFilters {...defaultProps} onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'react' } });
    expect(onSearchChange).toHaveBeenCalledWith('react');
  });

  it('shows current search value', () => {
    render(<CourseFilters {...defaultProps} search="python" />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('python');
  });

  it('renders difficulty options', () => {
    render(<CourseFilters {...defaultProps} />);
    expect(screen.getByRole('option', { name: 'Beginner' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Advanced' })).toBeTruthy();
  });

  it('calls onDifficultyFilterChange when difficulty selected', () => {
    const fn = vi.fn();
    render(<CourseFilters {...defaultProps} onDifficultyFilterChange={fn} />);
    fireEvent.click(screen.getByRole('option', { name: 'Beginner' }));
    expect(fn).toHaveBeenCalledWith('BEGINNER');
  });

  it('renders published filter options', () => {
    render(<CourseFilters {...defaultProps} />);
    expect(screen.getByRole('option', { name: 'Published' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Draft' })).toBeTruthy();
  });

  it('calls onPublishedFilterChange when status selected', () => {
    const fn = vi.fn();
    render(<CourseFilters {...defaultProps} onPublishedFilterChange={fn} />);
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));
    expect(fn).toHaveBeenCalledWith('published');
  });
});
