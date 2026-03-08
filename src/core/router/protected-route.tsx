import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, clearAuth } = useAuthStore();
  const token = Cookies.get('access_token');

  useEffect(() => {
    console.log('🔒 ProtectedRoute check:', {
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email,
    });
  }, [token, user]);

  // No token - redirect to login
  if (!token) {
    console.log('❌ No token found - redirecting to login');
    clearAuth();
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // No user in store - redirect to login
  if (!user) {
    console.log('❌ No user in store - redirecting to login');
    clearAuth();
    Cookies.remove('access_token');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Not admin - access denied
  if (user.role !== 'ADMIN') {
    console.log('❌ User is not admin:', user.role);
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

  console.log('✅ Access granted - rendering protected content');
  return children ? <>{children}</> : <Outlet />;
}
