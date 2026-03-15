// src/features/courses/__tests__/admin-overlay-controls.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    delete:    (id: string)                   => mockDelete(id),
    setState:  (id: string, state: string)    => mockSetState(id, state),
    duplicate: (id: string)                   => mockDuplicate(id),
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

// ─── Helpers ───────────────────────────────────────────────────────────────
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
        {/* needs a group parent so hover overlay is visible */}
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

  // ── Render ────────────────────────────────────────────────────────────────
  it('renders Edit button', () => {
    wrap(makeCourse());
    expect(screen.getByTitle('Preview') || screen.getByText('Edit')).toBeTruthy();
  });

  it('renders Delete button', () => {
    wrap(makeCourse());
    expect(screen.getByTitle('Delete')).toBeTruthy();
  });

  it('renders Duplicate button', () => {
    wrap(makeCourse());
    expect(screen.getByTitle('Duplicate')).toBeTruthy();
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  it('Edit button navigates to course edit route', () => {
    wrap(makeCourse({ slug: 'my-course' }));
    fireEvent.click(screen.getByText('Edit'));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('my-course'));
  });

  // ── Delete flow ───────────────────────────────────────────────────────────
  it('clicking Delete opens confirmation dialog', async () => {
    wrap(makeCourse());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() =>
      expect(screen.getByText(/permanently delete/i)).toBeTruthy()
    );
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

  // ── Duplicate ─────────────────────────────────────────────────────────────
  it('Duplicate button calls api.duplicate and navigates', async () => {
    wrap(makeCourse({ id: 'c1' }));
    fireEvent.click(screen.getByTitle('Duplicate'));
    await waitFor(() => expect(mockDuplicate).toHaveBeenCalledWith('c1'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('test-course-copy'))
    );
  });

  // ── State change ─────────────────────────────────────────────────────────
  it('state dropdown shows current state', () => {
    wrap(makeCourse({ state: 'PUBLISHED' }));
    // The state pill renders the current label
    expect(screen.getByText('Published')).toBeTruthy();
  });

  it('clicking a different state calls api.setState', async () => {
    wrap(makeCourse({ state: 'DRAFT' }));
    // open dropdown — the trigger shows "Draft"
    const trigger = screen.getByText('Draft').closest('button')!;
    fireEvent.click(trigger);
    // click Published option
    await waitFor(() => screen.getAllByText('Published'));
    const items = screen.getAllByText('Published');
    fireEvent.click(items[items.length - 1]); // last = dropdown item
    await waitFor(() =>
      expect(mockSetState).toHaveBeenCalledWith('c1', 'PUBLISHED')
    );
  });

  // ── Error path ────────────────────────────────────────────────────────────
  it('shows error toast when delete fails', async () => {
    const { toast } = await import('sonner');
    mockDelete.mockRejectedValue(new Error('server error'));
    wrap(makeCourse());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => screen.getByText(/permanently delete/i));
    fireEvent.click(screen.getByText('Delete Course'));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('shows error toast when setState fails', async () => {
    const { toast } = await import('sonner');
    mockSetState.mockRejectedValue(new Error('server error'));
    wrap(makeCourse({ state: 'DRAFT' }));
    const trigger = screen.getByText('Draft').closest('button')!;
    fireEvent.click(trigger);
    await waitFor(() => screen.getAllByText('Published'));
    const items = screen.getAllByText('Published');
    fireEvent.click(items[items.length - 1]);
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
