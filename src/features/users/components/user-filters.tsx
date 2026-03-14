// src/features/users/components/user-filters.tsx
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { UserRole } from '@/core/types';
import type { StatusFilter } from '../types';

// All recognised roles — previously only USER/ADMIN were listed
export const USER_ROLES: Array<UserRole | 'ALL'> = [
  'ALL', 'USER', 'ADMIN', 'INSTRUCTOR', 'CONTENT_CREATOR',
];

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: UserRole | 'ALL';
  onRoleFilterChange: (value: UserRole | 'ALL') => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export function UserFilters({
  search, onSearchChange,
  roleFilter, onRoleFilterChange,
  statusFilter, onStatusFilterChange,
}: UserFiltersProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row'>
      {/* Search */}
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' aria-hidden='true' />
        <Input
          placeholder='Search by name or email...'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-9'
          aria-label='Search users'
        />
      </div>

      {/* Role filter — now includes INSTRUCTOR + CONTENT_CREATOR */}
      <Select value={roleFilter} onValueChange={(v) => onRoleFilterChange(v as UserRole | 'ALL')}>
        <SelectTrigger className='w-full sm:w-44' aria-label='Filter by role'>
          <SelectValue placeholder='Role' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>All Roles</SelectItem>
          <SelectItem value='USER'>User</SelectItem>
          <SelectItem value='ADMIN'>Admin</SelectItem>
          <SelectItem value='INSTRUCTOR'>Instructor</SelectItem>
          <SelectItem value='CONTENT_CREATOR'>Content Creator</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
        <SelectTrigger className='w-full sm:w-40' aria-label='Filter by status'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='suspended'>Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
