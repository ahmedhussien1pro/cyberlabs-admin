import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LabsTable } from '../components/labs-table';
import type { LabListItem, PaginationMeta } from '@/core/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));
vi.mock('@/hooks/use-locale', () => ({ useLocale: () => ({ locale: 'en' }) }));

const mockLab: LabListItem = {
  id: 'lab-1',
  slug: 'sql-injection-basics',
  title: 'SQL Injection Basics',
  ar_title: null,
  difficulty: 'BEGINNER',
  category: 'WEB_SECURITY',
  executionMode: 'FRONTEND',
  isPublished: true,
  _count: { submissions: 42, usersProgress: 7 },
} as any;

const meta: PaginationMeta = { total: 1, page: 1, limit: 20, totalPages: 1 };

describe('LabsTable', () => {
  it('renders empty state when no data', () => {
    render(
      <LabsTable data={[]} page={1} onPageChange={vi.fn()} onRefetch={vi.fn()} />
    );
    expect(screen.getByText('noLabs')).toBeTruthy();
  });

  it('renders lab title and slug', () => {
    render(
      <LabsTable data={[mockLab]} meta={meta} page={1} onPageChange={vi.fn()} onRefetch={vi.fn()} />
    );
    expect(screen.getByText('SQL Injection Basics')).toBeTruthy();
    expect(screen.getByText('sql-injection-basics')).toBeTruthy();
  });

  it('renders correct submissions and inProgress counts', () => {
    render(
      <LabsTable data={[mockLab]} meta={meta} page={1} onPageChange={vi.fn()} onRefetch={vi.fn()} />
    );
    expect(screen.getByText(/42/)).toBeTruthy();
    expect(screen.getByText(/7/)).toBeTruthy();
  });

  it('navigates to lab detail on row click', () => {
    render(
      <LabsTable data={[mockLab]} meta={meta} page={1} onPageChange={vi.fn()} onRefetch={vi.fn()} />
    );
    const row = screen.getByText('SQL Injection Basics').closest('tr')!;
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('does not render pagination when only 1 page', () => {
    render(
      <LabsTable data={[mockLab]} meta={meta} page={1} onPageChange={vi.fn()} onRefetch={vi.fn()} />
    );
    expect(screen.queryByText('previous')).toBeNull();
  });

  it('renders pagination when totalPages > 1', () => {
    const multiMeta: PaginationMeta = { total: 50, page: 2, limit: 20, totalPages: 3 };
    render(
      <LabsTable data={[mockLab]} meta={multiMeta} page={2} onPageChange={vi.fn()} onRefetch={vi.fn()} />
    );
    expect(screen.getByText('previous')).toBeTruthy();
    expect(screen.getByText('next')).toBeTruthy();
  });

  it('calls onPageChange with correct page when next clicked', () => {
    const onPageChange = vi.fn();
    const multiMeta: PaginationMeta = { total: 50, page: 1, limit: 20, totalPages: 3 };
    render(
      <LabsTable data={[mockLab]} meta={multiMeta} page={1} onPageChange={onPageChange} onRefetch={vi.fn()} />
    );
    fireEvent.click(screen.getByText('next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
