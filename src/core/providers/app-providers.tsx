import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { I18nProvider } from './i18n-provider';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nProvider>
      <QueryProvider>
        <ThemeProvider>
          {children}
          <Toaster
            position='top-center'
            expand={false}
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </QueryProvider>
    </I18nProvider>
  );
}

export default AppProviders;
