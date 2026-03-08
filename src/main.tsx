import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/core/providers';
import App from './App';
import './index.css';

import '@/core/styles/globals.css';
import '@/core/config/i18n.config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
