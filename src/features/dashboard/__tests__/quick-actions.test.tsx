// src/features/dashboard/__tests__/quick-actions.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QuickActions } from '../components/quick-actions';

// useNavigate is called inside QuickActions — stub it
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderActions() {
  return render(
    <MemoryRouter>
      <QuickActions />
    </MemoryRouter>,
  );
}

describe('QuickActions', () => {
  it('renders all 4 action buttons', () => {
    renderActions();
    expect(screen.getByRole('button', { name: /new course/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new lab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new path/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
  });

  it('navigates to /courses/new on New Course click', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: /new course/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/courses/new');
  });

  it('navigates to /labs/new on New Lab click', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: /new lab/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/labs/new');
  });

  it('navigates to /paths/new on New Path click', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: /new path/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/paths/new');
  });

  it('navigates to /users on Manage Users click', async () => {
    renderActions();
    await userEvent.click(screen.getByRole('button', { name: /manage users/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });
});
