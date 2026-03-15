// src/features/courses/__tests__/admin-overlay-controls.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AdminOverlayControls } from '../components/admin-overlay-controls';
import type { AdminCourse } from '../types';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const { mockDelete, mockSetState, mockDuplicate } = vi.hoisted(() => ({
  mockDelete:    vi.fn(),
  mockSetState:  vi.fn(),
  mockDuplicate: vi.fn(),
}));

vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: {
    delete:    (id: string)                => mockDelete(id),
    setState:  (id: string, state: string) => mockSetState(id, state),
    duplicate: (id: string)                => mockDuplicate(id),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ──────────────────────────────────────────────────────────────
function makeCourse(overrides: Partial<AdminCourse> = {}): AdminCourse {
  return {
    id: 'c1', title: 'Test Course', slug: 'test-course',
    state: 'DRAFT', difficulty: 'BEGINNER', access: 'FREE',
    enrollmentCount: 0, color: 'blue',
    tags: [], skills: [], ar_skills: [], topics: [], ar_topics: [],
    prerequisites: [], ar_prerequisites: [], labSlugs: [],
    contentType: 'MIXED', isFeatured: false, isNew: false,
    ...overrides,
  } as AdminCourse;
}

function wrap(course: AdminCourse) {
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <div className='group relative'>
          <AdminOverlayControls course={course} />
        </div>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDelete.mockResolvedValue(undefined);
  mockSetState.mockResolvedValue({ id: 'c1', state: 'PUBLISHED' });
  mockDuplicate.mockResolvedValue({ id: 'c2', title: 'copy', slug: 'test-course-copy' });
});

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('AdminOverlayControls', () => {

  // ── Render ───────────────────────────────────────────────────────────────
  it('renders Edit, Preview, Duplicate, Delete buttons', () => {
    wrap(makeCourse());
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByTitle('Preview')).toBeTruthy();
    expect(screen.getByTitle('Duplicate')).toBeTruthy();
    expect(screen.getByTitle('Delete')).toBeTruthy();
  });

  it('renders state trigger with current state label', () => {
    wrap(makeCourse({ state: 'DRAFT' }));
    expect(screen.getByText('Draft')).toBeTruthy();
  });

  it('renders PUBLISHED state label', () => {
    wrap(makeCourse({ state: 'PUBLISHED' }));
    expect(screen.getByText('Published')).toBeTruthy();
  });

  // ── Navigation ───────────────────────────────────────────────────────────
  it('Edit button navigates to course edit route', () => {
    wrap(makeCourse({ slug: 'my-course' }));
    fireEvent.click(screen.getByText('Edit'));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('my-course'));
  });

  // ── Delete flow ──────────────────────────────────────────────────────────
  it('clicking Delete opens confirmation dialog', async () => {
    wrap(makeCourse());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => expect(screen.getByText(/permanently delete/i)).toBeTruthy());
  });

  it('Cancel in delete dialog does NOT call api.delete', async () => {
    wrap(makeCourse());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => screen.getByText(/permanently delete/i));
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('Confirm delete calls api.delete with course id', async () => {
    wrap(makeCourse({ id: 'cXYZ' }));
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => screen.getByText(/permanently delete/i));
    fireEvent.click(screen.getByText('Delete Course'));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('cXYZ'));
  });

  it('shows error toast when delete fails', async () => {
    const { toast } = await import('sonner');
    mockDelete.mockRejectedValue(new Error('server error'));
    wrap(makeCourse());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => screen.getByText(/permanently delete/i));
    fireEvent.click(screen.getByText('Delete Course'));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  // ── Duplicate ─────────────────────────────────────────────────────────────
  it('Duplicate calls api.duplicate and navigates to copy', async () => {
    wrap(makeCourse({ id: 'c1' }));
    fireEvent.click(screen.getByTitle('Duplicate'));
    await waitFor(() => expect(mockDuplicate).toHaveBeenCalledWith('c1'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('test-course-copy')),
    );
  });

  // ── State dropdown (Radix portal — use userEvent to open) ────────────────
  it('clicking a different state calls api.setState', async () => {
    const user = userEvent.setup();
    wrap(makeCourse({ state: 'DRAFT' }));

    // Open the Radix dropdown via userEvent (handles pointer-events & portal)
    const trigger = screen.getByRole('button', { name: /draft/i });
    await user.click(trigger);

    // Dropdown items appear in a portal — query the whole document
    const publishedItem = await screen.findByRole('menuitem', { name: /published/i });
    await user.click(publishedItem);

    await waitFor(() =>
      expect(mockSetState).toHaveBeenCalledWith('c1', 'PUBLISHED'),
    );
  });

  it('shows error toast when setState fails', async () => {
    const user = userEvent.setup();
    const { toast } = await import('sonner');
    mockSetState.mockRejectedValue(new Error('server error'));

    wrap(makeCourse({ state: 'DRAFT' }));
    const trigger = screen.getByRole('button', { name: /draft/i });
    await user.click(trigger);

    const publishedItem = await screen.findByRole('menuitem', { name: /published/i });
    await user.click(publishedItem);

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
