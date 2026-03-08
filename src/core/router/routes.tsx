import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import * as Pages from './lazy-routes';
import { ROUTES } from '@/shared/constants';
import { Preloader } from '@/shared/components/common/preloader';
import ProtectedRoute from './protected-route';

const LazyPage = ({
  Component,
}: {
  Component: React.LazyExoticComponent<React.ComponentType>;
}) => (
  <Suspense fallback={<Preloader />}>
    <Component />
  </Suspense>
);

export const routes: RouteObject[] = [];

export default routes;
