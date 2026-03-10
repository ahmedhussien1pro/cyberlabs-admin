import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
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
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          // ── Dashboard ──
          {
            index: true,
            element: <LazyPage Component={Pages.DashboardPage} />,
          },

          // ── Users ──
          { path: 'users',     element: <LazyPage Component={Pages.UsersListPage} /> },
          { path: 'users/:id', element: <LazyPage Component={Pages.UserDetailPage} /> },

          // ── Courses (CMS) ──
          { path: 'courses',              element: <LazyPage Component={Pages.CoursesListPage} /> },
          { path: 'courses/new',          element: <LazyPage Component={Pages.CourseCreatePage} /> },
          { path: 'courses/import',       element: <LazyPage Component={Pages.CourseImportPage} /> },
          // ✅ All-in-one page: Metadata | Curriculum | Path Relations | Preview
          { path: 'courses/:slug/edit',   element: <LazyPage Component={Pages.CourseEditPage} /> },
          // Redirect /courses/:slug/detail → /courses/:slug/edit?tab=preview
          { path: 'courses/:slug/detail', element: <Navigate to='../edit?tab=preview' replace /> },

          // ── Labs ──
          { path: 'labs',          element: <LazyPage Component={Pages.LabsListPage} /> },
          { path: 'labs/new',      element: <LazyPage Component={Pages.LabCreatePage} /> },
          { path: 'labs/:id',      element: <LazyPage Component={Pages.LabDetailPage} /> },
          { path: 'labs/:id/edit', element: <LazyPage Component={Pages.LabEditPage} /> },

          // ── Paths ──
          { path: 'paths',           element: <LazyPage Component={Pages.PathsListPage} /> },
          { path: 'paths/create',    element: <LazyPage Component={Pages.PathCreatePage} /> },
          { path: 'paths/:id',       element: <LazyPage Component={Pages.PathDetailPage} /> },
          { path: 'paths/:id/edit',  element: <LazyPage Component={Pages.PathEditPage} /> },

          // ── Map ──
          { path: 'map', element: <LazyPage Component={Pages.ContentMapPage} /> },

          // ── Badges ──
          { path: 'badges', element: <LazyPage Component={Pages.BadgesListPage} /> },

          // ── Settings ──
          { path: 'settings', element: <LazyPage Component={Pages.SettingsPage} /> },
        ],
      },
    ],
  },
];

export default routes;
