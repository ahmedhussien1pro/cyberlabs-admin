import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import { Preloader } from '@/shared/components/common/preloader';
import Cookies from 'js-cookie';

interface PublicRouteProps {
  children?: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, _hasHydrated } = useAuthStore();
  const token = Cookies.get('access_token');

  if (!_hasHydrated) return <Preloader />;

  if (token && user && user.role === 'ADMIN') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
