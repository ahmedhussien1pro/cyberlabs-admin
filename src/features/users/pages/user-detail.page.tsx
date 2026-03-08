import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { UserRoleDialog } from '../components/user-role-dialog';
import { SuspendUserDialog } from '../components/suspend-user-dialog';
import { ROUTES } from '@/shared/constants';
import {
  AlertCircle,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Activity,
  Trophy,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
  });

  if (error) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Failed to load user details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-64' />
        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-80' />
          <Skeleton className='h-80' />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant='destructive' className='max-w-md'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>User not found.</AlertDescription>
      </Alert>
    );
  }

  // ✅ isSuspended uses security.isSuspended — the authoritative field
  const isSuspended = user.security?.isSuspended ?? false;
  const isActive = user.isActive !== false && !isSuspended;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate(ROUTES.USERS)}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {user.name ?? user.email}
            </h1>
            <p className='text-muted-foreground'>{user.email}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setRoleDialogOpen(true)}>
            <Shield className='mr-2 h-4 w-4' />
            Change Role
          </Button>
          {isSuspended ? (
            <Button onClick={() => setSuspendDialogOpen(true)}>
              <CheckCircle2 className='mr-2 h-4 w-4' />
              Unsuspend User
            </Button>
          ) : (
            <Button
              variant='destructive'
              onClick={() => setSuspendDialogOpen(true)}>
              <XCircle className='mr-2 h-4 w-4' />
              Suspend User
            </Button>
          )}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Mail className='h-4 w-4 text-muted-foreground shrink-0' />
              <div>
                <p className='text-xs text-muted-foreground'>Email</p>
                <p className='font-medium text-sm'>{user.email}</p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Shield className='h-4 w-4 text-muted-foreground shrink-0' />
              <div>
                <p className='text-xs text-muted-foreground'>Role</p>
                <Badge
                  variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Activity className='h-4 w-4 text-muted-foreground shrink-0' />
              <div>
                <p className='text-xs text-muted-foreground'>Account Status</p>
                <Badge
                  variant={
                    isSuspended
                      ? 'destructive'
                      : isActive
                        ? 'default'
                        : 'secondary'
                  }>
                  {isSuspended ? 'Suspended' : isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Email Verified */}
            <div className='flex items-center gap-3'>
              {user.isEmailVerified ? (
                <CheckCircle2 className='h-4 w-4 text-green-500 shrink-0' />
              ) : (
                <XCircle className='h-4 w-4 text-muted-foreground shrink-0' />
              )}
              <div>
                <p className='text-xs text-muted-foreground'>Email Verified</p>
                <p className='text-sm font-medium'>
                  {user.isEmailVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>

            {/* 2FA */}
            <div className='flex items-center gap-3'>
              {user.twoFactorEnabled ? (
                <CheckCircle2 className='h-4 w-4 text-green-500 shrink-0' />
              ) : (
                <XCircle className='h-4 w-4 text-muted-foreground shrink-0' />
              )}
              <div>
                <p className='text-xs text-muted-foreground'>Two-Factor Auth</p>
                <p className='text-sm font-medium'>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            <Separator />

            <div className='flex items-center gap-3'>
              <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
              <div>
                <p className='text-xs text-muted-foreground'>Joined</p>
                <p className='text-sm font-medium'>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {format(new Date(user.createdAt), 'PPP')}
                </p>
              </div>
            </div>

            {user.lastLoginAt && (
              <div className='flex items-center gap-3'>
                <Clock className='h-4 w-4 text-muted-foreground shrink-0' />
                <div>
                  <p className='text-xs text-muted-foreground'>Last Login</p>
                  <p className='text-sm font-medium'>
                    {formatDistanceToNow(new Date(user.lastLoginAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Activity */}
        <div className='space-y-4'>
          {/* Points & Level */}
          {user.points && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-yellow-500' />
                  Progress & Points
                </CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <p className='text-2xl font-bold text-yellow-500'>
                    {user.points.level}
                  </p>
                  <p className='text-xs text-muted-foreground'>Level</p>
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-500'>
                    {user.points.totalXP.toLocaleString()}
                  </p>
                  <p className='text-xs text-muted-foreground'>Total XP</p>
                </div>
                <div>
                  <p className='text-2xl font-bold text-purple-500'>
                    {user.points.totalPoints.toLocaleString()}
                  </p>
                  <p className='text-xs text-muted-foreground'>Points</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrollments & Labs */}
          {user._count && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Activity Counts</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <BookOpen className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>Course Enrollments</span>
                  </div>
                  <span className='font-semibold'>
                    {user._count.enrollments}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <FlaskConical className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>Labs Progress</span>
                  </div>
                  <span className='font-semibold'>
                    {user._count.labProgress}
                  </span>
                </div>
                {user._count.badges !== undefined && (
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Trophy className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>Badges Earned</span>
                    </div>
                    <span className='font-semibold'>{user._count.badges}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security / Suspension Info */}
          {isSuspended && user.security && (
            <Card className='border-destructive/50 bg-destructive/5'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base text-destructive flex items-center gap-2'>
                  <XCircle className='h-4 w-4' />
                  Suspension Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                {user.security.suspensionReason && (
                  <div>
                    <p className='text-xs text-muted-foreground'>Reason</p>
                    <p className='font-medium'>
                      {user.security.suspensionReason}
                    </p>
                  </div>
                )}
                {user.security.suspendedAt && (
                  <div>
                    <p className='text-xs text-muted-foreground'>Suspended</p>
                    <p className='font-medium'>
                      {formatDistanceToNow(
                        new Date(user.security.suspendedAt),
                        { addSuffix: true },
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Account Meta</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div>
                <p className='text-xs text-muted-foreground'>User ID</p>
                <p className='font-mono text-xs break-all'>{user.id}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Created</p>
                <p>{format(new Date(user.createdAt), 'PPpp')}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Last Updated</p>
                <p>{format(new Date(user.updatedAt), 'PPpp')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <UserRoleDialog
        user={user}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onSuccess={refetch}
      />
      <SuspendUserDialog
        user={user}
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
