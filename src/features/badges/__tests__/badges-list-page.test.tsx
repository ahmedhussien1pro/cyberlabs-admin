// src/features/badges/__tests__/badges-list-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BadgesListPage from '../pages/badges-list.page';
import type { BadgeItem } from '@/core/api/services';

const mockGetAll = vi.fn();

vi.mock('@/core/api/services', () => ({
  badgesService: { getAll: () => mockGetAll() },
}));

const makeBadge = (id: string, type: string, title: string): BadgeItem => ({
  id, type, title, ar_title: '', description: '', imageUrl: '',
  xpReward: 10, pointsReward: 5,
} as any);

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}><BadgesListPage /></QueryClientProvider>,
  );
}

beforeEach(() => { vi.clearAllMocks(); });

describe('BadgesListPage', () => {
  it('renders page heading', async () => {
    mockGetAll.mockResolvedValue([]);
    wrap();
    await waitFor(() => expect(screen.getByText('Badges')).toBeTruthy());
  });

  it('shows loading skeletons initially', () => {
    mockGetAll.mockResolvedValue(new Promise(() => {})); // never resolves
    wrap();
    // skeletons rendered as divs with animate-pulse; check DOM has them
    const { container } = wrap();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state when no badges', async () => {
    mockGetAll.mockResolvedValue([]);
    wrap();
    await waitFor(() => expect(screen.getByText('No badges configured yet')).toBeTruthy());
  });

  it('shows error alert on failure', async () => {
    mockGetAll.mockRejectedValue(new Error('fail'));
    wrap();
    await waitFor(() => expect(screen.getByText(/Failed to load badges/)).toBeTruthy());
  });

  it('renders badges grouped by type', async () => {
    mockGetAll.mockResolvedValue([
      makeBadge('1', 'LAB', 'First Lab'),
      makeBadge('2', 'COURSE', 'Intro Course'),
    ]);
    wrap();
    await waitFor(() => {
      expect(screen.getByText('First Lab')).toBeTruthy();
      expect(screen.getByText('Intro Course')).toBeTruthy();
    });
  });

  it('renders section headers for each type', async () => {
    mockGetAll.mockResolvedValue([
      makeBadge('1', 'LAB', 'Lab X'),
      makeBadge('2', 'SPECIAL', 'Special Y'),
    ]);
    wrap();
    await waitFor(() => {
      expect(screen.getByText('Lab Badges')).toBeTruthy();
      expect(screen.getByText('Special Badges')).toBeTruthy();
    });
  });

  it('shows total badge count in header', async () => {
    mockGetAll.mockResolvedValue([
      makeBadge('1', 'LAB', 'A'),
      makeBadge('2', 'LAB', 'B'),
      makeBadge('3', 'COURSE', 'C'),
    ]);
    wrap();
    await waitFor(() => expect(screen.getByText('3 badges')).toBeTruthy());
  });
});
