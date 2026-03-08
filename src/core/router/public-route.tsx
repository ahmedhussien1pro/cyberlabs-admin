import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import Cookies from 'js-cookie';

interface PublicRouteProps {
  children?: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user } = useAuthStore();
  const token = Cookies.get('access_token');

  // If already authenticated, redirect to dashboard
  if (token && user && user.role === 'ADMIN') {
    console.log('✅ Already authenticated - redirecting to dashboard');
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
