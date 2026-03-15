import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/core/api/services';
import { UsersTable } from '../components/users-table';
import { UserFilters } from '../components/user-filters';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import type { UserListItem, PaginationMeta } from '@/core/types';

export function UsersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () =>
      usersService.list({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  });

  const users: UserListItem[] = (data as any)?.data ?? [];
  const meta: PaginationMeta | undefined = (data as any)?.meta;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Users</h1>
          <p className='text-muted-foreground'>
            {meta ? `${meta.total} total users` : 'Manage platform users'}
          </p>
        </div>
        <Link to={ROUTES.USER_CREATE}>
          <Button>
            <UserPlus className='mr-2 h-4 w-4' />
            Add User
          </Button>
        </Link>
      </div>

      <UserFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        roleFilter={roleFilter}
        onRoleFilterChange={(v) => { setRoleFilter(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1); }}
      />

      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        </div>
      )}

      {isError && (
        <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive'>
          Failed to load users. <button onClick={() => refetch()} className='underline'>Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <UsersTable
          data={users}
          meta={meta}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
