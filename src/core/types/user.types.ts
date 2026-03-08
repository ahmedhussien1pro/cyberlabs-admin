export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    labProgress: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  isSuspended: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    labProgress: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  admins: number;
}
