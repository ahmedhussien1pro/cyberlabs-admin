// src/features/auth/__tests__/login-form.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../components/login-form';

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_: string, fallback: string) => fallback }),
}));

const mockLogin      = vi.fn();
const mockVerify     = vi.fn();
const mockSetUser    = vi.fn();
const mockTokenSave  = vi.fn();
const mockTokenClear = vi.fn();

vi.mock('@/core/api/services', () => ({
  authService: {
    login:             (...a: any[]) => mockLogin(...a),
    verifyAdminHealth: (...a: any[]) => mockVerify(...a),
  },
}));

vi.mock('@/core/store/auth.store', () => ({
  useAuthStore: () => ({ setUser: mockSetUser }),
}));

vi.mock('../services/auth-tokens.service', () => ({
  authTokenService: {
    save:  (...a: any[]) => mockTokenSave(...a),
    clear: (...a: any[]) => mockTokenClear(...a),
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────
// Use exact: true to avoid matching "Show password" button aria-label
const getEmail    = () => screen.getByLabelText('Email', { exact: true });
const getPassword = () => screen.getByLabelText('Password', { exact: true });
const getSubmit   = () => screen.getByRole('button', { name: /sign in/i });
const getForm     = () => screen.getByRole('form', { name: /login form/i });

function renderForm() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────
describe('LoginForm — rendering', () => {
  it('renders email, password fields and submit button', () => {
    renderForm();
    expect(getEmail()).toBeInTheDocument();
    expect(getPassword()).toBeInTheDocument();
    expect(getSubmit()).toBeInTheDocument();
  });

  it('password field is type="password" by default', () => {
    renderForm();
    expect(getPassword()).toHaveAttribute('type', 'password');
  });

  it('toggle shows/hides password', async () => {
    renderForm();
    const toggle = screen.getByRole('button', { name: /show password/i });
    await userEvent.click(toggle);
    expect(getPassword()).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(getPassword()).toHaveAttribute('type', 'password');
  });
});

describe('LoginForm — validation', () => {
  it('shows required errors when submitted empty', async () => {
    renderForm();
    fireEvent.submit(getForm());
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows invalid email error', async () => {
    renderForm();
    await userEvent.type(getEmail(), 'not-an-email');
    fireEvent.submit(getForm());
    await waitFor(() => expect(screen.getByText(/invalid email/i)).toBeInTheDocument());
  });

  it('shows min-length error for short password', async () => {
    renderForm();
    await userEvent.type(getEmail(), 'a@b.com');
    await userEvent.type(getPassword(), '123');
    fireEvent.submit(getForm());
    await waitFor(() => expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument());
  });
});

describe('LoginForm — happy path', () => {
  const credentials = { email: 'admin@cyberlabs.com', password: 'secret123' };
  const fakeUser    = { id: '1', email: credentials.email, role: 'ADMIN', name: 'Admin' };

  beforeEach(() => {
    mockLogin.mockResolvedValue({ accessToken: 'tok_abc', refreshToken: 'ref_xyz', user: fakeUser });
    mockVerify.mockResolvedValue(true);
  });

  it('calls authService.login with correct credentials', async () => {
    renderForm();
    await userEvent.type(getEmail(), credentials.email);
    await userEvent.type(getPassword(), credentials.password);
    await userEvent.click(getSubmit());
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(credentials));
  });

  it('saves tokens via authTokenService', async () => {
    renderForm();
    await userEvent.type(getEmail(), credentials.email);
    await userEvent.type(getPassword(), credentials.password);
    await userEvent.click(getSubmit());
    await waitFor(() => expect(mockTokenSave).toHaveBeenCalledWith('tok_abc', 'ref_xyz'));
  });

  it('navigates to dashboard on success', async () => {
    renderForm();
    await userEvent.type(getEmail(), credentials.email);
    await userEvent.type(getPassword(), credentials.password);
    await userEvent.click(getSubmit());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });
});

describe('LoginForm — error paths', () => {
  it('shows error alert when login fails', async () => {
    mockLogin.mockRejectedValue({ message: 'Invalid credentials' });
    renderForm();
    await userEvent.type(getEmail(), 'a@b.com');
    await userEvent.type(getPassword(), 'password123');
    await userEvent.click(getSubmit());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('clears tokens and shows error if verifyAdminHealth fails', async () => {
    mockLogin.mockResolvedValue({ accessToken: 'tok', user: { id: '1', role: 'USER', email: 'x@y.com' } });
    mockVerify.mockRejectedValue(new Error('403'));
    renderForm();
    await userEvent.type(getEmail(), 'a@b.com');
    await userEvent.type(getPassword(), 'password123');
    await userEvent.click(getSubmit());
    await waitFor(() => {
      expect(mockTokenClear).toHaveBeenCalled();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('does NOT navigate on failure', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    renderForm();
    await userEvent.type(getEmail(), 'a@b.com');
    await userEvent.type(getPassword(), 'password123');
    await userEvent.click(getSubmit());
    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
  });
});

describe('LoginForm — security', () => {
  it('submit button is disabled while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // never resolves
    renderForm();
    await userEvent.type(getEmail(), 'a@b.com');
    await userEvent.type(getPassword(), 'password123');
    await userEvent.click(getSubmit());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled(),
    );
  });

  it('form has noValidate attribute', () => {
    renderForm();
    expect(getForm()).toHaveAttribute('novalidate');
  });

  it('password field has autocomplete=current-password', () => {
    renderForm();
    expect(getPassword()).toHaveAttribute('autocomplete', 'current-password');
  });

  it('email field has autocomplete=email', () => {
    renderForm();
    expect(getEmail()).toHaveAttribute('autocomplete', 'email');
  });
});
