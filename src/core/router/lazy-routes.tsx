import { lazy } from 'react';

// Auth
export const LoginPage = lazy(() => import('@/features/auth/pages/login.page'));

// Dashboard
export const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/dashboard.page'),
);

// Users
export const UsersListPage = lazy(
  () => import('@/features/users/pages/users-list.page'),
);
export const UserDetailPage = lazy(
  () => import('@/features/users/pages/user-detail.page'),
);

// Courses
export const CoursesListPage = lazy(
  () => import('@/features/courses/pages/courses-list.page'),
);
export const CourseDetailPage = lazy(
  () => import('@/features/courses/pages/course-detail.page'),
);
export const CourseCreatePage = lazy(
  () => import('@/features/courses/pages/course-create.page'),
);
export const CourseEditPage = lazy(
  () => import('@/features/courses/pages/course-edit.page'),
);
export const CourseImportPage = lazy(
  () => import('@/features/courses/pages/course-import.page'),
);

// Labs
export const LabsListPage = lazy(
  () => import('@/features/labs/pages/labs-list.page'),
);
export const LabDetailPage = lazy(
  () => import('@/features/labs/pages/lab-detail.page'),
);
export const LabCreatePage = lazy(
  () => import('@/features/labs/pages/lab-create.page'),
);
export const LabEditPage = lazy(
  () => import('@/features/labs/pages/lab-edit.page'),
);

// Paths
export const PathsListPage = lazy(
  () => import('@/features/paths/pages/paths-list.page'),
);
export const PathDetailPage = lazy(
  () => import('@/features/paths/pages/path-detail.page'),
);
export const PathCreatePage = lazy(
  () => import('@/features/paths/pages/path-create.page'),
);
export const PathEditPage = lazy(
  () => import('@/features/paths/pages/path-edit.page'),
);
