// src/features/courses/__tests__/course-admin-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseAdminCard } from '../components/course-admin-card';
import type { AdminCourse } from '../types';

// ─── Mocks ─────────────────────────────────────────────────────────────────
vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: { delete: vi.fn(), setState: vi.fn(), duplicate: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' } }),
}));
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────
function base(overrides: Partial<AdminCourse> = {}): AdminCourse {
  return {
    id: 'c1', title: 'My Course', slug: 'my-course',
    ar_title: null, description: null, ar_description: null,
    longDescription: null, ar_longDescription: null,
    image: null, thumbnail: null,
    state: 'DRAFT', difficulty: 'BEGINNER', access: 'FREE',
    color: 'BLUE', category: 'FUNDAMENTALS', contentType: 'MIXED',
    estimatedHours: 0, enrollmentCount: 0,
    totalTopics: 0, labsCount: 0, averageRating: 0, reviewCount: 0,
    tags: [], skills: [], ar_skills: [], topics: [], ar_topics: [],
    prerequisites: [], ar_prerequisites: [], labSlugs: [],
    isFeatured: false, isNew: false, isPublished: false,
    labsLink: null, instructorId: null,
    ...overrides,
  };
}

function wrap(course: AdminCourse, view: 'grid' | 'list' = 'grid') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <div className='group relative'>
          <CourseAdminCard course={course} index={0} view={view} />
        </div>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// AdminOverlayControls renders a hidden <span> with state text too,
// so state labels appear 2x in the DOM — getAllByText is correct here.
const hasText = (text: string) => screen.getAllByText(text).length > 0;

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('CourseAdminCard', () => {

  // ── Grid view ──────────────────────────────────────────────────────────
  it('renders course title in grid view', () => {
    wrap(base());
    expect(screen.getAllByText('My Course').length).toBeGreaterThan(0);
  });

  it('renders DRAFT state badge', () => {
    wrap(base({ state: 'DRAFT' }));
    expect(hasText('Draft')).toBe(true);
  });

  it('renders PUBLISHED state badge', () => {
    wrap(base({ state: 'PUBLISHED' }));
    expect(hasText('Published')).toBe(true);
  });

  it('renders COMING_SOON overlay + badge', () => {
    wrap(base({ state: 'COMING_SOON' }));
    expect(hasText('Coming Soon')).toBe(true);
  });

  it('renders difficulty badge', () => {
    wrap(base({ difficulty: 'ADVANCED' }));
    expect(screen.getByText('Advanced')).toBeTruthy();
  });

  it('renders access badge — FREE', () => {
    wrap(base({ access: 'FREE' }));
    expect(screen.getByText('Free')).toBeTruthy();
  });

  it('renders access badge — PRO', () => {
    wrap(base({ access: 'PRO' }));
    expect(screen.getByText('Pro')).toBeTruthy();
  });

  it('renders content-type badge — Mixed', () => {
    wrap(base({ contentType: 'MIXED' }));
    expect(screen.getByText('Mixed')).toBeTruthy();
  });

  it('renders NEW badge when isNew=true', () => {
    wrap(base({ isNew: true }));
    expect(screen.getByText('NEW')).toBeTruthy();
  });

  it('renders topics count badge when totalTopics > 0', () => {
    wrap(base({ totalTopics: 7 }));
    expect(screen.getByText(/7/)).toBeTruthy();
    expect(screen.getByText(/Topics/)).toBeTruthy();
  });

  it('renders fallback thumbnail when no image', () => {
    wrap(base());
    expect(screen.getAllByText('My Course').length).toBeGreaterThanOrEqual(2);
  });

  it('renders img tag when image is provided', () => {
    wrap(base({ image: 'https://cdn.example.com/img.jpg' }));
    const img = document.querySelector('img[alt="My Course"]');
    expect(img).toBeTruthy();
    expect((img as HTMLImageElement).src).toContain('cdn.example.com');
  });

  // ── List view ──────────────────────────────────────────────────────────
  it('renders title in list view', () => {
    wrap(base(), 'list');
    expect(screen.getAllByText('My Course').length).toBeGreaterThan(0);
  });
});
