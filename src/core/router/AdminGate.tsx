import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import Cookies from 'js-cookie';

interface AdminGateProps {
  children: React.ReactNode;
}

/**
 * AdminGate performs a backend role verification on every session load.
 * It calls GET /admin/health (AdminGuard-protected) to confirm the token
 * belongs to an ADMIN user. On failure, it clears auth state and redirects
 * to login. This is a secondary guard complementing ProtectedRoute's
 * local Zustand/Cookie checks.
 */
export function AdminGate({ children }: AdminGateProps) {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'checking' | 'ok' | 'fail'>('checking');

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await authService.verifyAdminHealth();
        if (mounted) setStatus('ok');
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('cyberlabs-auth');
        if (mounted) {
          setStatus('fail');
          navigate(ROUTES.LOGIN, { replace: true });
        }
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (status === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === 'fail') return null;

  return <>{children}</>;
}
