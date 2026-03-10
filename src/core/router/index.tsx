import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { ROUTES } from '@/shared/constants';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';
import { AdminGate } from './AdminGate';
import AdminLayout from '@/shared/components/layout/admin-layout';
import { Preloader } from '@/shared/components/common/preloader';
import * as Pages from './lazy-routes';

// ── Suspense wrapper ──────────────────────────────────────────────────
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Preloader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  // ─── Public ───────────────────────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <S><Pages.LoginPage /></S>
      </PublicRoute>
    ),
  },

  // ─── Protected Admin Area ─────────────────────────────────────────────
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminGate>
          <AdminLayout />
        </AdminGate>
      </ProtectedRoute>
    ),
    children: [
      // ── Dashboard ──
      {
        index: true,
        element: <S><Pages.DashboardPage /></S>,
      },

      // ── Users ──
      { path: 'users',     element: <S><Pages.UsersListPage /></S> },
      { path: 'users/:id', element: <S><Pages.UserDetailPage /></S> },

      // ── Courses ──
      { path: 'courses',              element: <S><Pages.CoursesListPage /></S> },
      { path: 'courses/new',          element: <S><Pages.CourseCreatePage /></S> },
      { path: 'courses/import',       element: <S><Pages.CourseImportPage /></S> },
      { path: 'courses/:id/edit',     element: <S><Pages.CourseEditPage /></S> },
      // Redirect /courses/:slug/detail → edit?tab=preview
      { path: 'courses/:slug/detail', element: <Navigate to='../edit?tab=preview' replace /> },

      // ── Labs ──
      { path: 'labs',          element: <S><Pages.LabsListPage /></S> },
      { path: 'labs/new',      element: <S><Pages.LabCreatePage /></S> },
      { path: 'labs/:id',      element: <S><Pages.LabDetailPage /></S> },
      { path: 'labs/:id/edit', element: <S><Pages.LabEditPage /></S> },

      // ── Paths ──
      { path: 'paths',          element: <S><Pages.PathsListPage /></S> },
      { path: 'paths/create',   element: <S><Pages.PathCreatePage /></S> },
      { path: 'paths/:id',      element: <S><Pages.PathDetailPage /></S> },
      { path: 'paths/:id/edit', element: <S><Pages.PathEditPage /></S> },

      // ── Content Map ──
      { path: 'map', element: <S><Pages.ContentMapPage /></S> },

      // ── Badges ──
      { path: 'badges', element: <S><Pages.BadgesListPage /></S> },

      // ── Notifications ──
      { path: 'notifications', element: <S><Pages.NotificationsPage /></S> },

      // ── Settings ──
      { path: 'settings', element: <S><Pages.SettingsPage /></S> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
