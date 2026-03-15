import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublishToggle } from '../components/publish-toggle';

// vi.hoisted ensures these refs exist before vi.mock factory runs
const {
  mockPublish,
  mockUnpublish,
  mockLabPublish,
  mockLabUnpublish,
} = vi.hoisted(() => ({
  mockPublish:      vi.fn(),
  mockUnpublish:    vi.fn(),
  mockLabPublish:   vi.fn(),
  mockLabUnpublish: vi.fn(),
}));

vi.mock('@/core/api/services', () => ({
  coursesService: {
    publish:   (id: string) => mockPublish(id),
    unpublish: (id: string) => mockUnpublish(id),
  },
  labsService: {
    publish:   (id: string) => mockLabPublish(id),
    unpublish: (id: string) => mockLabUnpublish(id),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPublish.mockResolvedValue({});
  mockUnpublish.mockResolvedValue({});
  mockLabPublish.mockResolvedValue({});
  mockLabUnpublish.mockResolvedValue({});
});

describe('PublishToggle', () => {
  it('shows Unpublish when already published', () => {
    wrap(<PublishToggle id="c1" isPublished={true} type="course" />);
    expect(screen.getByRole('button', { name: /unpublish/i })).toBeTruthy();
  });

  it('shows Publish when not published', () => {
    wrap(<PublishToggle id="c1" isPublished={false} type="course" />);
    expect(screen.getByRole('button', { name: /^publish$/i })).toBeTruthy();
  });

  it('calls coursesService.unpublish when published course toggled', async () => {
    wrap(<PublishToggle id="c1" isPublished={true} type="course" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(mockUnpublish).toHaveBeenCalledWith('c1'));
  });

  it('calls coursesService.publish when unpublished course toggled', async () => {
    wrap(<PublishToggle id="c1" isPublished={false} type="course" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(mockPublish).toHaveBeenCalledWith('c1'));
  });

  it('calls labsService.publish when lab type toggled', async () => {
    wrap(<PublishToggle id="lab1" isPublished={false} type="lab" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(mockLabPublish).toHaveBeenCalledWith('lab1'));
  });

  it('calls onSuccess callback after mutation', async () => {
    const onSuccess = vi.fn();
    wrap(<PublishToggle id="c1" isPublished={false} type="course" onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('reverts optimistic state and shows error on failure', async () => {
    mockPublish.mockRejectedValue(new Error('fail'));
    const { toast } = await import('sonner');
    wrap(<PublishToggle id="c1" isPublished={false} type="course" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    // after revert, button should show Publish again
    expect(screen.getByRole('button', { name: /^publish$/i })).toBeTruthy();
  });
});
