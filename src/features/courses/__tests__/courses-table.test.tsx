import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { CoursesTable } from '../components/courses-table';
import type { AdminCourse } from '../types';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const { mockDelete, mockSetState, mockDuplicate } = vi.hoisted(() => ({
  mockDelete:    vi.fn(),
  mockSetState:  vi.fn(),
  mockDuplicate: vi.fn(),
}));

vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: {
    delete:    (id: string) => mockDelete(id),
    setState:  (id: string, state: string) => mockSetState(id, state),
    duplicate: (id: string) => mockDuplicate(id),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params?.title) return `${key}:${params.title}`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});
const mockNavigate = vi.fn();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeCourse(overrides: Partial<AdminCourse> = {}): AdminCourse {
  return {
    id: 'c1', title: 'Test Course', slug: 'test-course',
    state: 'DRAFT', difficulty: 'BEGINNER', access: 'FREE',
    enrollmentCount: 42, color: 'blue',
    tags: [], skills: [], ar_skills: [], topics: [], ar_topics: [],
    prerequisites: [], ar_prerequisites: [], labSlugs: [],
    contentType: 'MIXED', isFeatured: false, isNew: false,
    ...overrides,
  } as AdminCourse;
}

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

const baseProps = {
  page: 1,
  onPageChange: vi.fn(),
  onRefetch: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDelete.mockResolvedValue(undefined);
  mockSetState.mockResolvedValue({ id: 'c1', state: 'PUBLISHED' });
  mockDuplicate.mockResolvedValue({ id: 'c2', title: 'Test Course (copy)', slug: 'test-course-copy' });
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CoursesTable', () => {
  it('renders empty state when data is empty', () => {
    wrap(<CoursesTable data={[]} {...baseProps} />);
    expect(screen.getByText('table.noResults')).toBeTruthy();
  });

  it('renders course row with title and slug', () => {
    wrap(<CoursesTable data={[makeCourse()]} {...baseProps} />);
    expect(screen.getByText('Test Course')).toBeTruthy();
    expect(screen.getByText('test-course')).toBeTruthy();
  });

  it('renders enrollment count', () => {
    wrap(<CoursesTable data={[makeCourse({ enrollmentCount: 99 })]} {...baseProps} />);
    expect(screen.getByText('99')).toBeTruthy();
  });

  it('shows pagination when totalPages > 1', () => {
    wrap(
      <CoursesTable
        data={[makeCourse()]}
        meta={{ total: 40, page: 1, limit: 20, totalPages: 2 }}
        {...baseProps}
      />,
    );
    expect(screen.getByLabelText('table.nextPage')).toBeTruthy();
    expect(screen.getByLabelText('table.prevPage')).toBeTruthy();
  });

  it('prev page button disabled on page 1', () => {
    wrap(
      <CoursesTable
        data={[makeCourse()]}
        meta={{ total: 40, page: 1, limit: 20, totalPages: 2 }}
        page={1}
        onPageChange={vi.fn()}
        onRefetch={vi.fn()}
      />,
    );
    expect((screen.getByLabelText('table.prevPage') as HTMLButtonElement).disabled).toBe(true);
  });

  it('navigate to edit on edit button click', () => {
    wrap(<CoursesTable data={[makeCourse()]} {...baseProps} />);
    fireEvent.click(screen.getByLabelText('overlay.edit Test Course'));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('test-course'));
  });

  it('calls duplicate only for clicked course row', async () => {
    const courses = [
      makeCourse({ id: 'c1', title: 'Course One', slug: 'course-one' }),
      makeCourse({ id: 'c2', title: 'Course Two', slug: 'course-two' }),
    ];
    // make duplicate hang so we can check pending state
    mockDuplicate.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: 'c3', title: 'copy', slug: 'copy' }), 500)),
    );
    wrap(<CoursesTable data={courses} {...baseProps} />);
    fireEvent.click(screen.getByLabelText('overlay.duplicate Course One'));
    // c1 duplicate btn becomes disabled, c2 stays enabled
    await waitFor(() => {
      expect((screen.getByLabelText('overlay.duplicate Course One') as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByLabelText('overlay.duplicate Course Two') as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('opens delete dialog and calls delete on confirm', async () => {
    wrap(<CoursesTable data={[makeCourse()]} {...baseProps} />);
    fireEvent.click(screen.getByLabelText('overlay.delete Test Course'));
    // dialog should appear
    await waitFor(() => expect(screen.getByText('dialogs.deleteDesc')).toBeTruthy());
    // confirm
    fireEvent.click(screen.getByText('dialogs.deleteConfirm'));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('c1'));
  });
});
