import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import { Preloader } from '@/shared/components/common/preloader';
import Cookies from 'js-cookie';

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { user, clearAuth, _hasHydrated } = useAuthStore();
  const token = Cookies.get('access_token');

  useEffect(() => {
    if (_hasHydrated && (!token || !user)) {
      clearAuth();
      Cookies.remove('access_token');
    }
  }, [token, user, clearAuth, _hasHydrated]);

  // انتظر Zustand يخلص تحميل localStorage
  if (!_hasHydrated) return <Preloader />;

  if (!token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  if (user.role !== 'ADMIN') {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Access Denied</h1>
          <p className='mt-2 text-muted-foreground'>
            You need admin privileges to access this panel.
          </p>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
