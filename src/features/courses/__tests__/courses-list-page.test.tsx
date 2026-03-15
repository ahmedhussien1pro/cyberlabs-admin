// src/features/courses/__tests__/courses-list-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoursesListPage from '../pages/courses-list.page';
import type { AdminCourse, AdminCourseStats } from '../types';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const { mockList, mockGetStats } = vi.hoisted(() => ({
  mockList:     vi.fn(),
  mockGetStats: vi.fn(),
}));

vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: {
    list:     (...a: any[]) => mockList(...a),
    getStats: ()           => mockGetStats(),
    // overlay controls — not called in page-level tests
    delete:    vi.fn(),
    setState:  vi.fn(),
    duplicate: vi.fn(),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: any) => (typeof fallback === 'string' ? fallback : key),
    i18n: { language: 'en' },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockStats: AdminCourseStats = {
  total: 10, published: 5, draft: 3, comingSoon: 2,
};

function makeCourse(i: number): AdminCourse {
  return {
    id: `c${i}`, title: `Course ${i}`, slug: `course-${i}`,
    state: 'DRAFT', difficulty: 'BEGINNER', access: 'FREE',
    enrollmentCount: i * 10, color: 'blue',
    tags: [], skills: [], ar_skills: [], topics: [], ar_topics: [],
    prerequisites: [], ar_prerequisites: [], labSlugs: [],
    contentType: 'MIXED', isFeatured: false, isNew: false,
  } as AdminCourse;
}

const mockListResponse = (courses: AdminCourse[], total = courses.length) => ({
  data: courses,
  meta: { total, page: 1, limit: 8, totalPages: Math.ceil(total / 8) },
});

// ─── Wrapper ─────────────────────────────────────────────────────────────────
function wrap() {
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CoursesListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetStats.mockResolvedValue(mockStats);
  mockList.mockResolvedValue(mockListResponse([makeCourse(1), makeCourse(2)]));
});

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('CoursesListPage', () => {

  // ── Page header ────────────────────────────────────────────────────────
  it('renders page title and New Course button', async () => {
    wrap();
    expect(screen.getByText('title')).toBeTruthy();
    expect(screen.getByText('newCourse')).toBeTruthy();
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  it('renders stat numbers after load', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('10')).toBeTruthy());
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  // ── Loading skeletons ────────────────────────────────────────────────
  it('shows skeletons while loading then renders courses', async () => {
    let resolve: (v: any) => void;
    mockList.mockReturnValue(new Promise((r) => { resolve = r; }));
    wrap();
    // skeletons visible immediately
    const skeletons = document.querySelectorAll('.animate-pulse, [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    // resolve and check courses appear
    resolve!(mockListResponse([makeCourse(1), makeCourse(2)]));
    await waitFor(() => expect(screen.getByText('Course 1')).toBeTruthy());
  });

  // ── Error state ────────────────────────────────────────────────────────
  it('shows error alert and retry button when list fails', async () => {
    mockList.mockRejectedValue(new Error('network error'));
    wrap();
    await waitFor(() => expect(screen.getByText('errors.loadFailed')).toBeTruthy());
    expect(screen.getByText('actions.tryAgain')).toBeTruthy();
  });

  // ── Course data ────────────────────────────────────────────────────────
  it('renders course cards in grid view', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('Course 1')).toBeTruthy());
    expect(screen.getByText('Course 2')).toBeTruthy();
  });

  it('calls api.list once on mount', async () => {
    wrap();
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));
    expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 8 }));
  });

  // ── Empty state ────────────────────────────────────────────────────────
  it('shows empty state when no courses returned', async () => {
    mockList.mockResolvedValue(mockListResponse([]));
    wrap();
    await waitFor(() => expect(screen.getByText('table.noResults')).toBeTruthy());
  });

  // ── View toggle ────────────────────────────────────────────────────────
  it('switches to table view and renders table', async () => {
    wrap();
    await waitFor(() => screen.getByText('Course 1'));
    // find the List (table) toggle button by its icon aria
    const buttons = screen.getAllByRole('button');
    // table toggle is the second icon button in the view group
    const tableBtn = buttons.find((b) => b.querySelector('.lucide-list'));
    if (tableBtn) fireEvent.click(tableBtn);
    // table header "table.course" should appear
    await waitFor(() => expect(screen.getByText('table.course')).toBeTruthy());
  });

  // ── New Course dialog ───────────────────────────────────────────────
  it('clicking New Course button opens dialog', async () => {
    wrap();
    fireEvent.click(screen.getByText('newCourse'));
    // dialog should mount — check for a dialog role or known content
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });

  // ── Search filter ─────────────────────────────────────────────────────
  it('typing in search input re-calls api.list with search param', async () => {
    wrap();
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));
    const input = screen.getByPlaceholderText('filters.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'react' } });
    await waitFor(() =>
      expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ search: 'react', page: 1 })),
    );
  });

  // ── Retry ────────────────────────────────────────────────────────────────
  it('retry button re-calls api.list', async () => {
    mockList.mockRejectedValue(new Error('fail'));
    wrap();
    await waitFor(() => screen.getByText('actions.tryAgain'));
    mockList.mockResolvedValue(mockListResponse([makeCourse(1)]));
    fireEvent.click(screen.getByText('actions.tryAgain'));
    await waitFor(() => expect(screen.getByText('Course 1')).toBeTruthy());
  });

  // ── Pagination ──────────────────────────────────────────────────────────
  it('shows pagination when totalPages > 1', async () => {
    const courses = Array.from({ length: 8 }, (_, i) => makeCourse(i + 1));
    mockList.mockResolvedValue(mockListResponse(courses, 20));
    wrap();
    await waitFor(() => expect(screen.getByText('Course 1')).toBeTruthy());
    // next page button present
    const nextBtns = document.querySelectorAll('button[aria-label], button');
    const hasNext = Array.from(nextBtns).some((b) => b.querySelector('.lucide-chevron-right'));
    expect(hasNext).toBe(true);
  });

  it('no pagination when total ≤ limit', async () => {
    const courses = Array.from({ length: 3 }, (_, i) => makeCourse(i + 1));
    mockList.mockResolvedValue(mockListResponse(courses, 3));
    wrap();
    await waitFor(() => screen.getByText('Course 1'));
    // pagination component returns null — chevron-first / chevron-last hidden
    const firstBtns = document.querySelectorAll('.lucide-chevron-first');
    expect(firstBtns.length).toBe(0);
  });
});
