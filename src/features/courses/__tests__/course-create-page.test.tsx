// src/features/courses/__tests__/course-create-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CourseCreatePage from '../pages/course-create.page';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const { mockCreate, mockSaveCurriculum } = vi.hoisted(() => ({
  mockCreate:         vi.fn(),
  mockSaveCurriculum: vi.fn(),
}));

vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: {
    create:         (...a: any[]) => mockCreate(...a),
    saveCurriculum: (...a: any[]) => mockSaveCurriculum(...a),
  },
}));

vi.mock('@/core/api/services', () => ({
  usersService: {
    getAll: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0 } }),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ────────────────────────────────────────────────────────────────
function wrap() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CourseCreatePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Page has 2 “Save Course” buttons (top-bar + bottom). Click the first one. */
const clickSave = () => fireEvent.click(screen.getAllByText('Save Course')[0]);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('CourseCreatePage', () => {

  // ── Step 1: Upload ───────────────────────────────────────────────
  it('renders upload step by default', () => {
    wrap();
    expect(screen.getByText('Create a New Course')).toBeTruthy();
    expect(screen.getByText('Drop your course JSON here')).toBeTruthy();
  });

  it('renders New Course label in top bar', () => {
    wrap();
    expect(screen.getByText('New Course')).toBeTruthy();
  });

  it('clicking Skip Start Blank advances to edit step', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    expect(screen.getByText('Course Metadata')).toBeTruthy();
  });

  it('clicking Skip and fill manually link advances to edit step', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip and fill manually →'));
    expect(screen.getByText('Course Metadata')).toBeTruthy();
  });

  it('shows error for non-json file upload', () => {
    wrap();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText('Only .json files are supported')).toBeTruthy();
  });

  it('loads valid JSON and advances to edit step', async () => {
    wrap();
    const json = JSON.stringify({
      title: 'Test Course', slug: 'test-course',
      difficulty: 'BEGINNER', access: 'FREE',
      topics: [{ id: 't1', title: { en: 'Topic One', ar: 'موضوع 1' }, elements: [] }],
    });
    const file = new File([json], 'course.json', { type: 'application/json' });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement,
      { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText('Course Metadata')).toBeTruthy());
  });

  // ── Step 2: Edit ────────────────────────────────────────────────
  it('renders all metadata fields in edit step', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    expect(screen.getByPlaceholderText('e.g., Web Application Hacking')).toBeTruthy();
    expect(screen.getByPlaceholderText('web-application-hacking')).toBeTruthy();
    expect(screen.getByText('Topics / Curriculum')).toBeTruthy();
  });

  it('auto-generates slug from title input', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    fireEvent.change(screen.getByPlaceholderText('e.g., Web Application Hacking'),
      { target: { value: 'My New Course' } });
    expect((screen.getByPlaceholderText('web-application-hacking') as HTMLInputElement).value)
      .toBe('my-new-course');
  });

  it('Add Topic button appends a topic row', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    fireEvent.click(screen.getAllByText('Add Topic')[0]);
    expect(screen.getByDisplayValue('Topic 1')).toBeTruthy();
  });

  it('Remove topic button removes the topic row', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    fireEvent.click(screen.getAllByText('Add Topic')[0]);
    expect(screen.getByDisplayValue('Topic 1')).toBeTruthy();
    const trashBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.querySelector('.lucide-trash2'),
    );
    if (trashBtn) fireEvent.click(trashBtn);
    expect(document.querySelectorAll('input[value="Topic 1"]').length).toBe(0);
  });

  it('shows Featured and Mark as New checkboxes', () => {
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    expect(screen.getByText('Featured')).toBeTruthy();
    expect(screen.getByText('Mark as New')).toBeTruthy();
  });

  // ── Validation ─────────────────────────────────────────────────────
  it('Save Course with empty title shows toast error', async () => {
    const { toast } = await import('sonner');
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    clickSave();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Title is required')),
    );
  });

  it('Save Course with title but no instructor shows toast error', async () => {
    const { toast } = await import('sonner');
    wrap();
    fireEvent.click(screen.getByText('Skip — Start Blank'));
    fireEvent.change(screen.getByPlaceholderText('e.g., Web Application Hacking'),
      { target: { value: 'My Course' } });
    clickSave();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Instructor is required')),
    );
  });

  // ── Save success ───────────────────────────────────────────────────
  it('successful save shows SuccessDialog', async () => {
    mockCreate.mockResolvedValue({ id: 'new-1', slug: 'my-course', title: 'My Course' });
    wrap();
    // Load JSON with instructorId pre-set to bypass InstructorPicker UI
    const json = JSON.stringify({
      title: 'My Course', slug: 'my-course',
      instructorId: 'usr-1',
      difficulty: 'BEGINNER', access: 'FREE',
    });
    const file = new File([json], 'course.json', { type: 'application/json' });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement,
      { target: { files: [file] } });
    await waitFor(() => screen.getByText('Course Metadata'));
    clickSave();
    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Course Created!')).toBeTruthy());
  });

  // ── Navigation ─────────────────────────────────────────────────────
  it('Back button calls navigate', () => {
    wrap();
    fireEvent.click(screen.getByText('Back'));
    expect(mockNavigate).toHaveBeenCalled();
  });
});
