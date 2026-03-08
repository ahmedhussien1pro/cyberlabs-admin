import { useEffect, useState } from 'react';
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
  const [shouldFetch, setShouldFetch] = useState(!!token && !user);

  // Fetch user if token exists but no user in store
  const { isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: shouldFetch,
    retry: false,
    onSuccess: (data) => {
      setUser(data);
      setShouldFetch(false);
    },
    onError: () => {
      clearAuth();
      Cookies.remove('access_token');
      setShouldFetch(false);
    },
  });

  // No token - redirect to login
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Loading user data
  if (isLoading || shouldFetch) {
    return <Preloader />;
  }

  // Failed to load user
  if (error || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Not admin - access denied
  if (user.role !== 'ADMIN') {
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
