import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/core/config';
import { ENV } from '@/shared/constants';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ENV.ENABLE_DEVTOOLS && (
        <ReactQueryDevtools initialIsOpen={false} position='bottom' />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
