// src/features/courses/__tests__/course-detail-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseDetailPage from '../pages/course-detail.page';
import type { AdminCourse } from '../types';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const { mockGetById, mockDelete, mockDuplicate, mockSetState } = vi.hoisted(() => ({
  mockGetById:   vi.fn(),
  mockDelete:    vi.fn(),
  mockDuplicate: vi.fn(),
  mockSetState:  vi.fn(),
}));

vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: {
    getById:   (...a: any[]) => mockGetById(...a),
    delete:    (...a: any[]) => mockDelete(...a),
    duplicate: (...a: any[]) => mockDuplicate(...a),
    setState:  (...a: any[]) => mockSetState(...a),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Fixture ────────────────────────────────────────────────────────────────
const mockCourse: AdminCourse = {
  id: 'course-1', slug: 'intro-to-sec',
  title: 'Intro to Security', ar_title: 'مقدمة أمن',
  description: 'Learn security basics.', ar_description: null,
  longDescription: null, ar_longDescription: null,
  image: null, thumbnail: null,
  color: 'BLUE', access: 'FREE', state: 'DRAFT',
  difficulty: 'BEGINNER', category: 'FUNDAMENTALS', contentType: 'MIXED',
  estimatedHours: 5, enrollmentCount: 120,
  totalTopics: 8, labsCount: 3, averageRating: 4.5, reviewCount: 20,
  tags: ['security', 'basics'],
  skills: ['recon', 'enumeration'],
  ar_skills: [], topics: [], ar_topics: [],
  prerequisites: [], ar_prerequisites: [],
  labSlugs: ['lab-1', 'lab-2'],
  isFeatured: false, isNew: false, isPublished: false,
  labsLink: null, instructorId: null,
};

// ─── Wrapper ────────────────────────────────────────────────────────────────
function wrap(id = 'course-1') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/courses/${id}/detail`]}>
        <Routes>
          <Route path='/courses/:id/detail' element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetById.mockResolvedValue(mockCourse);
});

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('CourseDetailPage', () => {

  // ── Loading ────────────────────────────────────────────────────────────
  it('shows skeletons while fetching', () => {
    mockGetById.mockReturnValue(new Promise(() => {}));
    wrap();
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ── Error ───────────────────────────────────────────────────────────────
  it('shows error alert when fetch fails', async () => {
    mockGetById.mockRejectedValue(new Error('not found'));
    wrap();
    await waitFor(() =>
      expect(screen.getByText(/Course not found/)).toBeTruthy(),
    );
  });

  // ── Course data ────────────────────────────────────────────────────────
  it('renders course title', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('Intro to Security')).toBeTruthy());
  });

  it('renders course slug', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('intro-to-sec')).toBeTruthy());
  });

  it('renders ar_title when present', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('مقدمة أمن')).toBeTruthy());
  });

  it('renders description', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('Learn security basics.')).toBeTruthy());
  });

  it('renders stat cards: Topics, Est. Hours, Enrolled, Labs', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('Topics')).toBeTruthy());
    expect(screen.getByText('Est. Hours')).toBeTruthy();
    expect(screen.getByText('Enrolled')).toBeTruthy();
    expect(screen.getByText('Labs')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();   // totalTopics
    expect(screen.getByText('5h')).toBeTruthy();  // estimatedHours
    expect(screen.getByText('120')).toBeTruthy(); // enrollmentCount
  });

  it('renders skills badges', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('recon')).toBeTruthy());
    expect(screen.getByText('enumeration')).toBeTruthy();
  });

  it('renders lab slugs', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('lab-1')).toBeTruthy());
    expect(screen.getByText('lab-2')).toBeTruthy();
  });

  // ── Actions ────────────────────────────────────────────────────────────
  it('Back button navigates to courses list', async () => {
    wrap();
    await waitFor(() => screen.getByText('Intro to Security'));
    fireEvent.click(screen.getByText('Back'));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('Edit button navigates to edit page', async () => {
    wrap();
    await waitFor(() => screen.getByText('Intro to Security'));
    fireEvent.click(screen.getByText('Edit'));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('edit'));
  });

  // ── Danger zone ────────────────────────────────────────────────────────
  it('renders Danger Zone section', async () => {
    wrap();
    await waitFor(() => expect(screen.getByText('Danger Zone')).toBeTruthy());
    expect(screen.getByText('Delete Course')).toBeTruthy();
  });

  it('opens delete confirmation dialog on Delete Course click', async () => {
    wrap();
    await waitFor(() => screen.getByText('Delete Course'));
    fireEvent.click(screen.getByText('Delete Course'));
    await waitFor(() =>
      expect(screen.getByText(/This action cannot be undone/)).toBeTruthy(),
    );
  });
});
