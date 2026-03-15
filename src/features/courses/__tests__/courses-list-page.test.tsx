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
    list:      (...a: any[]) => mockList(...a),
    getStats:  ()           => mockGetStats(),
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
    id: `c${i}`, title: `Course-${i}`, slug: `course-${i}`,
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

// ─── Wrapper helpers ───────────────────────────────────────────────────────────
function makeQC() {
  return new QueryClient({
    defaultOptions: {
      queries:   { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function wrap(qc = makeQC()) {
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

  // ── Header ───────────────────────────────────────────────────────────────
  it('renders page title and New Course button', () => {
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
    let resolve!: (v: any) => void;
    mockList.mockReturnValue(new Promise((r) => { resolve = r; }));
    wrap();
    const skeletons = document.querySelectorAll('.animate-pulse, [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    resolve(mockListResponse([makeCourse(1), makeCourse(2)]));
    await waitFor(() => expect(screen.getAllByText('Course-1').length).toBeGreaterThan(0));
  });

  // ── Error state ────────────────────────────────────────────────────────
  it('shows error alert and retry button when list fails', async () => {
    mockList.mockRejectedValue(new Error('network error'));
    wrap();
    await waitFor(() => expect(screen.getByText('errors.loadFailed')).toBeTruthy(), { timeout: 3000 });
    expect(screen.getByText('actions.tryAgain')).toBeTruthy();
  });

  // ── Course data ────────────────────────────────────────────────────────
  it('renders course cards in grid view', async () => {
    wrap();
    // card renders title in multiple places — getAllByText
    await waitFor(() => expect(screen.getAllByText('Course-1').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Course-2').length).toBeGreaterThan(0);
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
    await waitFor(() => screen.getAllByText('Course-1'));
    const tableBtn = screen.getAllByRole('button').find((b) => b.querySelector('.lucide-list'));
    if (tableBtn) fireEvent.click(tableBtn);
    await waitFor(() => expect(screen.getByText('table.course')).toBeTruthy());
  });

  // ── New Course dialog ───────────────────────────────────────────────
  it('clicking New Course button opens dialog', async () => {
    wrap();
    fireEvent.click(screen.getByText('newCourse'));
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeTruthy());
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

  // ── Retry ───────────────────────────────────────────────────────────────
  it('retry button refetches and shows courses', async () => {
    // First render fails
    mockList.mockRejectedValue(new Error('fail'));
    const { unmount } = wrap();
    await waitFor(() => screen.getByText('errors.loadFailed'), { timeout: 3000 });

    // Swap mock to success, click retry
    mockList.mockResolvedValue(mockListResponse([makeCourse(1)]));
    fireEvent.click(screen.getByText('actions.tryAgain'));
    await waitFor(() => expect(screen.getAllByText('Course-1').length).toBeGreaterThan(0));
    unmount();
  });

  // ── Pagination ──────────────────────────────────────────────────────────
  it('shows pagination when totalPages > 1', async () => {
    const courses = Array.from({ length: 8 }, (_, i) => makeCourse(i + 1));
    mockList.mockResolvedValue(mockListResponse(courses, 20));
    wrap();
    await waitFor(() => expect(screen.getAllByText('Course-1').length).toBeGreaterThan(0));
    const hasNext = Array.from(document.querySelectorAll('button')).some(
      (b) => b.querySelector('.lucide-chevron-right'),
    );
    expect(hasNext).toBe(true);
  });

  it('no pagination when total ≤ limit', async () => {
    const courses = Array.from({ length: 3 }, (_, i) => makeCourse(i + 1));
    mockList.mockResolvedValue(mockListResponse(courses, 3));
    wrap();
    await waitFor(() => expect(screen.getAllByText('Course-1').length).toBeGreaterThan(0));
    expect(document.querySelectorAll('.lucide-chevron-first').length).toBe(0);
  });
});
