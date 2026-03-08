import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';
import AdminLayout from '@/shared/components/layout/admin-layout';

// Lazy load pages
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/features/auth/pages/login.page'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard.page'));
const UsersListPage = lazy(() => import('@/features/users/pages/users-list.page'));
const UserDetailPage = lazy(() => import('@/features/users/pages/user-detail.page'));
const CoursesListPage = lazy(() => import('@/features/courses/pages/courses-list.page'));
const CourseDetailPage = lazy(() => import('@/features/courses/pages/course-detail.page'));
const CourseCreatePage = lazy(() => import('@/features/courses/pages/course-create.page'));
const LabsListPage = lazy(() => import('@/features/labs/pages/labs-list.page'));
const LabDetailPage = lazy(() => import('@/features/labs/pages/lab-detail.page'));
const LabCreatePage = lazy(() => import('@/features/labs/pages/lab-create.page'));

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.USERS,
        element: <UsersListPage />,
      },
      {
        path: ROUTES.USER_DETAIL(':id'),
        element: <UserDetailPage />,
      },
      {
        path: ROUTES.COURSES,
        element: <CoursesListPage />,
      },
      {
        path: ROUTES.COURSE_DETAIL(':id'),
        element: <CourseDetailPage />,
      },
      {
        path: ROUTES.COURSE_CREATE,
        element: <CourseCreatePage />,
      },
      {
        path: ROUTES.LABS,
        element: <LabsListPage />,
      },
      {
        path: ROUTES.LAB_DETAIL(':id'),
        element: <LabDetailPage />,
      },
      {
        path: ROUTES.LAB_CREATE,
        element: <LabCreatePage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
