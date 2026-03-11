import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { Suspense } from 'react';
import { ROUTES } from '@/shared/constants';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';
import { AdminGate } from './AdminGate';
import AdminLayout from '@/shared/components/layout/admin-layout';
import { Preloader } from '@/shared/components/common/preloader';
import * as Pages from './lazy-routes';

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
      { index: true, element: <S><Pages.DashboardPage /></S> },

      // ── Users ──
      { path: 'users',                element: <S><Pages.UsersListPage /></S> },
      { path: 'users/:id',            element: <S><Pages.UserDetailPage /></S> },
      { path: 'users/:id/activity',   element: <S><Pages.UserActivityPage /></S> },

      // ── Courses ──
      { path: 'courses',              element: <S><Pages.CoursesListPage /></S> },
      { path: 'courses/new',          element: <S><Pages.CourseCreatePage /></S> },
      { path: 'courses/import',       element: <S><Pages.CourseImportPage /></S> },
      // :slug — the URL segment is always a slug (e.g. threats-and-risk-management)
      { path: 'courses/:slug/edit',   element: <S><Pages.CourseEditPage /></S> },
      // :id — UUID from the DB, used for detail view
      { path: 'courses/:id/detail',   element: <S><Pages.CourseDetailPage /></S> },

      // ── Labs ──
      { path: 'labs',                 element: <S><Pages.LabsListPage /></S> },
      { path: 'labs/new',             element: <S><Pages.LabCreatePage /></S> },
      { path: 'labs/:id',             element: <S><Pages.LabDetailPage /></S> },
      { path: 'labs/:id/edit',        element: <S><Pages.LabEditPage /></S> },

      // ── Paths ──
      { path: 'paths',                element: <S><Pages.PathsListPage /></S> },
      { path: 'paths/create',         element: <S><Pages.PathCreatePage /></S> },
      { path: 'paths/:id',            element: <S><Pages.PathDetailPage /></S> },
      { path: 'paths/:id/edit',       element: <S><Pages.PathEditPage /></S> },

      // ── Other ──
      { path: 'map',                  element: <S><Pages.ContentMapPage /></S> },
      { path: 'badges',               element: <S><Pages.BadgesListPage /></S> },
      { path: 'notifications',        element: <S><Pages.NotificationsPage /></S> },
      { path: 'settings',             element: <S><Pages.SettingsPage /></S> },
      { path: 'referrals',            element: <S><Pages.ReferralLinksPage /></S> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
