import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store';
import { ROUTES } from '@/shared/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireGuest = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    );
  }

  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
    );
  }

  // Redirect to dashboard if guest route but user is authenticated
  if (requireGuest && isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD.DashboardPage} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
