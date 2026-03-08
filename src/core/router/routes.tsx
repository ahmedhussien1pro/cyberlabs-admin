import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import * as Pages from './lazy-routes';
import { ROUTES } from '@/shared/constants';
import { Preloader } from '@/shared/components/common/preloader';
import ProtectedRoute from './protected-route';
import AdminLayout from '@/shared/components/layout/admin-layout';

const LazyPage = ({
  Component,
}: {
  Component: React.LazyExoticComponent<React.ComponentType>;
}) => (
  <Suspense fallback={<Preloader />}>
    <Component />
  </Suspense>
);

export const routes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <LazyPage Component={Pages.LoginPage} />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyPage Component={Pages.DashboardPage} /> },
      { path: 'users', element: <LazyPage Component={Pages.UsersListPage} /> },
      {
        path: 'users/:id',
        element: <LazyPage Component={Pages.UserDetailPage} />,
      },
      {
        path: 'courses',
        element: <LazyPage Component={Pages.CoursesListPage} />,
      },
      {
        path: 'courses/new',
        element: <LazyPage Component={Pages.CourseCreatePage} />,
      },
      {
        path: 'courses/import',
        element: <LazyPage Component={Pages.CourseImportPage} />,
      },
      {
        path: 'courses/:id',
        element: <LazyPage Component={Pages.CourseDetailPage} />,
      },
      {
        path: 'courses/:id/edit',
        element: <LazyPage Component={Pages.CourseEditPage} />,
      },

      { path: 'labs', element: <LazyPage Component={Pages.LabsListPage} /> },
      {
        path: 'labs/new',
        element: <LazyPage Component={Pages.LabCreatePage} />,
      },
      {
        path: 'labs/:id',
        element: <LazyPage Component={Pages.LabDetailPage} />,
      },
      {
        path: 'labs/:id/edit',
        element: <LazyPage Component={Pages.LabEditPage} />,
      },
      // ─── Paths ───────────────────────────────────────────────────────────────
      { path: 'paths', element: <LazyPage Component={Pages.PathsListPage} /> },
      {
        path: 'paths/create',
        element: <LazyPage Component={Pages.PathCreatePage} />,
      },
      {
        path: 'paths/:id',
        element: <LazyPage Component={Pages.PathDetailPage} />,
      },
      {
        path: 'paths/:id/edit',
        element: <LazyPage Component={Pages.PathEditPage} />,
      },
    ],
  },
];

export default routes;
