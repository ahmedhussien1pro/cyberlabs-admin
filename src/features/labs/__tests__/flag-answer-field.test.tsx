import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlagAnswerField } from '../components/flag-answer-field';

// mock sonner
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const FLAG = 'CTF{s3cr3t_fl4g_v4lu3}';

// Helper: password inputs are NOT role="textbox" — use querySelector instead
const getInput = (container: HTMLElement) =>
  container.querySelector('input') as HTMLInputElement;

// Helper: the eye-toggle button has no text label — grab it by position (first button)
const getToggleBtn = () =>
  screen.getAllByRole('button').find(
    (b) => !b.textContent?.match(/copy/i)
  ) as HTMLElement;

describe('FlagAnswerField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with flag masked by default (type=password)', () => {
    const { container } = render(<FlagAnswerField flagAnswer={FLAG} />);
    const input = getInput(container);
    expect(input.type).toBe('password');
    expect(input.value).toBe(FLAG);
  });

  it('shows the flag value (type=text) when eye icon is clicked', () => {
    const { container } = render(<FlagAnswerField flagAnswer={FLAG} />);
    const input = getInput(container);
    expect(input.type).toBe('password');
    fireEvent.click(getToggleBtn());
    expect(input.type).toBe('text');
  });

  it('hides the flag again when eye icon is clicked twice', () => {
    const { container } = render(<FlagAnswerField flagAnswer={FLAG} />);
    const input = getInput(container);
    const btn = getToggleBtn();
    fireEvent.click(btn);
    expect(input.type).toBe('text');
    fireEvent.click(btn);
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
