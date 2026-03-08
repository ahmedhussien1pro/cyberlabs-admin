import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/core/api/services';
import { UsersTable } from '../components/users-table';
import { UserFilters } from '../components/user-filters';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users, UserX, UserPlus, Shield } from 'lucide-react';
import type { UserRole } from '@/core/types';

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const limit = 20;

  const { data: stats } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
  });

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', 'list', page, search, roleFilter, statusFilter],
    queryFn: () =>
      usersService.getAll({
        page,
        limit,
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }),
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load users. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Build stat cards from the correct backend response shape
  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.total, icon: Users },
        // byRole.ADMIN replaces the removed stats.admins field
        { label: 'Admins', value: stats.byRole.ADMIN, icon: Shield },
        { label: 'Suspended', value: stats.suspended, icon: UserX },
        // newThisMonth replaces the removed stats.activeToday field
        { label: 'New This Month', value: stats.newThisMonth, icon: UserPlus },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage platform users and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats ? (
          statCards.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      {/* Filters */}
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Users Table */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </Card>
      ) : (
        <UsersTable
          data={usersData?.data ?? []}
          meta={usersData?.meta}
          page={page}
          onPageChange={setPage}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
