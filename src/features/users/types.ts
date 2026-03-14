// src/features/users/types.ts
// Shared users feature types

export type StatusFilter = 'all' | 'active' | 'suspended';

export interface UserFiltersState {
  search: string;
  roleFilter: string;   // UserRole | 'ALL'
  statusFilter: StatusFilter;
  page: number;
}

export interface SuspendDialogState {
  open: boolean;
  userId?: string;
}
