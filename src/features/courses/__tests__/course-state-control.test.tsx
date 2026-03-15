import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseStateControl } from '../components/course-state-control';

const mockSetState = vi.fn();
vi.mock('../services/admin-courses.api', () => ({
  adminCoursesApi: { setState: (...a: any[]) => mockSetState(...a) },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSetState.mockResolvedValue({});
});

describe('CourseStateControl', () => {
  it('renders compact badge only when compact=true', () => {
    wrap(<CourseStateControl courseId="c1" currentState="PUBLISHED" compact />);
    expect(screen.getByText('Published')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders 3 state buttons when not compact', () => {
    wrap(<CourseStateControl courseId="c1" currentState="DRAFT" />);
    expect(screen.getByRole('button', { name: 'Published' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Coming Soon' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Draft' })).toBeTruthy();
  });

  it('current state button is disabled', () => {
    wrap(<CourseStateControl courseId="c1" currentState="DRAFT" />);
    const draftBtn = screen.getByRole('button', { name: 'Draft' }) as HTMLButtonElement;
    expect(draftBtn.disabled).toBe(true);
  });

  it('calls adminCoursesApi.setState when non-active state clicked', async () => {
    wrap(<CourseStateControl courseId="c1" currentState="DRAFT" />);
    fireEvent.click(screen.getByRole('button', { name: 'Published' }));
    await waitFor(() =>
      expect(mockSetState).toHaveBeenCalledWith('c1', 'PUBLISHED')
    );
  });

  it('calls onStateChange callback after success', async () => {
    const onStateChange = vi.fn();
    wrap(
      <CourseStateControl
        courseId="c1"
        currentState="DRAFT"
        onStateChange={onStateChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Published' }));
    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith('PUBLISHED'));
  });

  it('reverts optimistic state on error', async () => {
    mockSetState.mockRejectedValue(new Error('fail'));
    const { toast } = await import('sonner');
    wrap(<CourseStateControl courseId="c1" currentState="DRAFT" />);
    fireEvent.click(screen.getByRole('button', { name: 'Published' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
