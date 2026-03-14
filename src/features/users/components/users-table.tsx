// src/features/users/components/users-table.tsx
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import type { UserListItem, PaginationMeta } from '@/core/types';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UsersTableProps {
  data: UserListItem[];
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  // onRefetch removed — was declared but never used inside this component
}

export function UsersTable({ data, meta, page, onPageChange }: UsersTableProps) {
  if (data.length === 0) {
    return (
      <Card className='p-12 text-center'>
        <p className='text-muted-foreground'>No users found</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className='w-full' role='table'>
          <thead className='border-b'>
            <tr>
              <th className='p-4 text-left text-sm font-medium' scope='col'>User</th>
              <th className='p-4 text-left text-sm font-medium' scope='col'>Role</th>
              <th className='p-4 text-left text-sm font-medium' scope='col'>Status</th>
              <th className='p-4 text-left text-sm font-medium' scope='col'>Activity</th>
              <th className='p-4 text-left text-sm font-medium' scope='col'>Joined</th>
              <th className='p-4 text-right text-sm font-medium' scope='col'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => {
              const isSuspended = user.security?.isSuspended ?? false;
              const isActive    = user.isActive !== false && !isSuspended;

              return (
                <tr key={user.id} className='border-b last:border-0 hover:bg-muted/50'>
                  <td className='p-4'>
                    <div>
                      <div className='font-medium'>{user.name ?? user.email}</div>
                      <div className='text-sm text-muted-foreground'>{user.email}</div>
                    </div>
                  </td>
                  <td className='p-4'>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className='p-4'>
                    <Badge variant={isActive ? 'default' : 'destructive'}>
                      {isSuspended ? 'Suspended' : isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className='p-4'>
                    <div className='text-sm'>
                      <div>{user._count.enrollments} enrollments</div>
                      <div className='text-muted-foreground'>{user._count.labProgress} labs</div>
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='text-sm'>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className='p-4 text-right'>
                    <Link to={ROUTES.USER_DETAIL(user.id)}>
                      <Button variant='ghost' size='sm'>
                        View <ExternalLink className='ml-2 h-3 w-3' aria-hidden='true' />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className='flex items-center justify-between border-t p-4'>
          <div className='text-sm text-muted-foreground'>
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline' size='sm'
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label='Previous page'
            >
              <ChevronLeft className='h-4 w-4' /> Previous
            </Button>
            <Button
              variant='outline' size='sm'
              onClick={() => onPageChange(page + 1)}
              disabled={page === meta.totalPages}
              aria-label='Next page'
            >
              Next <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
