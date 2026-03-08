import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/core/api/services';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import { Preloader } from '@/shared/components/common/preloader';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, setUser, clearAuth } = useAuthStore();
  const token = Cookies.get('access_token');

  // Fetch user if token exists but no user in store
  const { isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: !!token && !user,
    retry: false,
    staleTime: Infinity,
  });

  // Update store when query succeeds
  useEffect(() => {
    if (isError && token) {
      clearAuth();
      Cookies.remove('access_token');
    }
  }, [isError, token, clearAuth]);

  // No token - redirect to login
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Loading user data
  if (isLoading) {
    return <Preloader />;
  }

  // Failed to load user or no user in store
  if ((isError || !user) && token) {
    // Clear everything and redirect
    clearAuth();
    Cookies.remove('access_token');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Not admin - access denied
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You need admin privileges to access this panel.
          </p>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
