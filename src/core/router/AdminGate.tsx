import React from 'react';
import { authService } from '@/core/api/services';
import Cookies from 'js-cookie';

type Props = {
  children: React.ReactNode;
  onFail?: () => void;
};

export function AdminGate({ children, onFail }: Props) {
  const [state, setState] = React.useState<'checking' | 'ok' | 'fail'>(
    'checking',
  );

  React.useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        await authService.verifyAdminHealth();
        if (mounted) setState('ok');
      } catch (e) {
        Cookies.remove('access_token');
        localStorage.removeItem('cyberlabs-auth');
        if (mounted) setState('fail');
        onFail?.();
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [onFail]);

  if (state === 'checking') return null; // لاحقًا: skeleton/loader
  if (state === 'fail') return null; // لاحقًا: redirect لصفحة login

  return <>{children}</>;
}
