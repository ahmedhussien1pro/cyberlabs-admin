import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlagAnswerField } from '../components/flag-answer-field';

// mock sonner
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const FLAG = 'CTF{s3cr3t_fl4g_v4lu3}';

describe('FlagAnswerField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with flag masked by default', () => {
    render(<FlagAnswerField flagAnswer={FLAG} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    // input type should be password initially (masked)
    expect(input.type).toBe('password');
    expect(input.value).toBe(FLAG);
  });

  it('shows the flag value when eye icon is clicked', () => {
    render(<FlagAnswerField flagAnswer={FLAG} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    // Find the toggle button (Eye icon)
    const toggleBtn = screen.getByRole('button', { name: '' });
    expect(input.type).toBe('password');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
  });

  it('hides the flag again when eye icon is clicked twice', () => {
    render(<FlagAnswerField flagAnswer={FLAG} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('password');
  });

  it('copies flag to clipboard and shows success toast', async () => {
    const { toast } = await import('sonner');
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<FlagAnswerField flagAnswer={FLAG} />);
    const copyBtn = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FLAG);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('shows error toast when clipboard fails', async () => {
    const { toast } = await import('sonner');
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
    });

    render(<FlagAnswerField flagAnswer={FLAG} />);
    const copyBtn = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('shows sensitive-info warning alert', () => {
    render(<FlagAnswerField flagAnswer={FLAG} />);
    expect(screen.getByText(/sensitive information/i)).toBeTruthy();
  });
});
