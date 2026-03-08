import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const token = Cookies.get('access_token');

  // Not authenticated - redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Authenticated but not admin - access denied
  if (user?.role !== 'ADMIN') {
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
