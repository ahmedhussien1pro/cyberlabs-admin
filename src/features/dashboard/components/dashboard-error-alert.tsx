// src/features/dashboard/components/dashboard-error-alert.tsx
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ErrorType } from '../utils/dashboard.utils';

interface Props { errorType: ErrorType; warningText?: string; }

const TITLES: Record<NonNullable<ErrorType>, string> = {
  forbidden:    'Access Denied',
  unauthorized: 'Authentication Required',
  network:      'Connection Error',
  server:       'Server Error',
};

export function DashboardErrorAlert({ errorType, warningText }: Props) {
  if (!errorType) return null;
  return (
    <>
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle className='font-semibold'>{TITLES[errorType]}</AlertTitle>
        <AlertDescription className='mt-2'>
          {errorType === 'forbidden' && (
            <div className='space-y-2'>
              <p>You don't have admin permissions to view this dashboard.</p>
              <p className='text-xs'>Contact your system administrator to grant you ADMIN role access.</p>
            </div>
          )}
          {errorType === 'unauthorized' && <p>Your session has expired. Please log in again.</p>}
          {errorType === 'network' && (
            <div className='space-y-2'>
              <p>Cannot connect to the backend server.</p>
              <p className='text-xs'>Check your internet connection or verify the API URL.</p>
            </div>
          )}
          {errorType === 'server' && <p>{warningText ?? 'Failed to load analytics data.'}</p>}
        </AlertDescription>
      </Alert>

      {errorType === 'forbidden' && (
        <Alert>
          <ShieldAlert className='h-4 w-4' />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>This dashboard requires ADMIN role. To fix this, run:</p>
            <pre className='mt-2 overflow-x-auto rounded bg-muted p-2 text-xs'>
              {"UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your-email@domain.com';"}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
