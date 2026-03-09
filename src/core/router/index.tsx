import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ROUTES } from '@/shared/constants';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';
import { AdminGate } from './AdminGate';
import AdminLayout from '@/shared/components/layout/admin-layout';
import { Preloader } from '@/shared/components/common/preloader';

// Lazy pages
const LoginPage = lazy(() => import('@/features/auth/pages/login.page'));
const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/dashboard.page'),
);
const UsersListPage = lazy(
  () => import('@/features/users/pages/users-list.page'),
);
const UserDetailPage = lazy(
  () => import('@/features/users/pages/user-detail.page'),
);
const CoursesListPage = lazy(
  () => import('@/features/courses/pages/courses-list.page'),
);
const CourseDetailPage = lazy(
  () => import('@/features/courses/pages/course-detail.page'),
);
const CourseCreatePage = lazy(
  () => import('@/features/courses/pages/course-create.page'),
);
const CourseEditPage = lazy(
  () => import('@/features/courses/pages/course-edit.page'),
);
const CourseImportPage = lazy(
  () => import('@/features/courses/pages/course-import.page'),
);
const CoursePlatformPreviewPage = lazy(
  () => import('@/features/courses/pages/course-platform-preview.page'),
);
const LabsListPage = lazy(() => import('@/features/labs/pages/labs-list.page'));
const LabDetailPage = lazy(
  () => import('@/features/labs/pages/lab-detail.page'),
);
const LabCreatePage = lazy(
  () => import('@/features/labs/pages/lab-create.page'),
);
const LabEditPage = lazy(() => import('@/features/labs/pages/lab-edit.page'));
const PathsListPage = lazy(
  () => import('@/features/paths/pages/paths-list.page'),
);
const PathDetailPage = lazy(
  () => import('@/features/paths/pages/path-detail.page'),
);
const PathCreatePage = lazy(
  () => import('@/features/paths/pages/path-create.page'),
);
const PathEditPage = lazy(
  () => import('@/features/paths/pages/path-edit.page'),
);
const CourseEditorPage = lazy(
  () => import('@/features/courses/pages/course-edit.page'),
);
const ContentMapPage = lazy(
  () => import('@/features/map/pages/content-map.page'),
);
// Suspense wrapper
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Preloader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  // ─── Public ───────────────────────────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <S>
          <LoginPage />
        </S>
      </PublicRoute>
    ),
  },

  // ─── Protected Admin Area ─────────────────────────────────────────────────
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
      {
        index: true,
        element: (
          <S>
            <DashboardPage />
          </S>
        ),
      },

      // ─── Users
      {
        path: 'users',
        element: (
          <S>
            <UsersListPage />
          </S>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <S>
            <UserDetailPage />
          </S>
        ),
      },

      // ─── Courses
      {
        path: 'courses',
        element: (
          <S>
            <CoursesListPage />
          </S>
        ),
      },
      {
        path: 'courses/new',
        element: (
          <S>
            <CourseCreatePage />
          </S>
        ),
      },
      {
        path: 'courses/import',
        element: (
          <S>
            <CourseImportPage />
          </S>
        ),
      },
      {
        path: 'courses/:id',
        element: (
          <S>
            <CourseDetailPage />
          </S>
        ),
      },
      {
        path: 'courses/:id/edit',
        element: (
          <S>
            <CourseEditPage />
          </S>
        ),
      },
      {
        path: 'courses/:id/platform-preview',
        element: <CoursePlatformPreviewPage />,
      },
      { path: '/courses/editor', element: <CourseEditorPage /> },
      { path: '/courses/:id/content', element: <CourseEditorPage /> },
      // ─── Labs
      {
        path: 'labs',
        element: (
          <S>
            <LabsListPage />
          </S>
        ),
      },
      {
        path: 'labs/new',
        element: (
          <S>
            <LabCreatePage />
          </S>
        ),
      },
      {
        path: 'labs/:id',
        element: (
          <S>
            <LabDetailPage />
          </S>
        ),
      },
      {
        path: 'labs/:id/edit',
        element: (
          <S>
            <LabEditPage />
          </S>
        ),
      },

      // ─── Paths
      {
        path: 'paths',
        element: (
          <S>
            <PathsListPage />
          </S>
        ),
      },
      {
        path: 'paths/create',
        element: (
          <S>
            <PathCreatePage />
          </S>
        ),
      },
      {
        path: 'paths/:id',
        element: (
          <S>
            <PathDetailPage />
          </S>
        ),
      },
      {
        path: 'paths/:id/edit',
        element: (
          <S>
            <PathEditPage />
          </S>
        ),
      },
      { path: ROUTES.MAP, element: <ContentMapPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
