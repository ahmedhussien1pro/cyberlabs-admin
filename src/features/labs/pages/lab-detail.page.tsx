import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { labsService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PublishToggle } from '../../courses/components/publish-toggle';
import { FlagAnswerField } from '../components/flag-answer-field';
import { ROUTES } from '@/shared/constants';
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function LabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: lab,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['labs', 'detail', id],
    queryFn: () => labsService.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => labsService.delete(id!),
    onSuccess: () => {
      toast.success('Lab deleted successfully');
      navigate(ROUTES.LABS);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete lab');
    },
  });

  if (error) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Failed to load lab details.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-64' />
      </div>
    );
  }

  if (!lab) {
    return (
      <Alert variant='destructive' className='max-w-md'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>Lab not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate(ROUTES.LABS)}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>{lab.title}</h1>
            <p className='text-muted-foreground'>{lab.slug}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <PublishToggle
            id={lab.id}
            isPublished={lab.isPublished}
            type='lab'
            onSuccess={refetch}
          />
          {/* ✅ Navigate to edit page */}
          <Button
            variant='outline'
            onClick={() => navigate(ROUTES.LAB_EDIT(id!))}>
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Button>
          <Button
            variant='destructive'
            onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      {/* Lab Info */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Lab Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <div className='text-sm text-muted-foreground'>Title</div>
              <div className='font-medium'>{lab.title}</div>
              {lab.ar_title && (
                <div className='text-sm text-muted-foreground dir-rtl'>
                  {lab.ar_title}
                </div>
              )}
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>Slug</div>
              <div className='font-mono text-sm'>{lab.slug}</div>
            </div>
            <div className='flex gap-2 flex-wrap'>
              {lab.difficulty && <Badge>{lab.difficulty}</Badge>}
              {lab.category && (
                <Badge variant='outline'>{lab.category}</Badge>
              )}
              {lab.executionMode && (
                <Badge variant='secondary'>{lab.executionMode}</Badge>
              )}
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>Status</div>
              <Badge variant={lab.isPublished ? 'default' : 'secondary'}>
                {lab.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {lab.description && (
              <div>
                <div className='text-sm text-muted-foreground'>Description</div>
                <div className='text-sm leading-relaxed'>{lab.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              {lab.xpReward != null && (
                <div className='flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-amber-500' />
                  <div>
                    <div className='text-xs text-muted-foreground'>XP Reward</div>
                    <div className='font-semibold'>{lab.xpReward}</div>
                  </div>
                </div>
              )}
              {lab.pointsReward != null && (
                <div className='flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-blue-500' />
                  <div>
                    <div className='text-xs text-muted-foreground'>Points</div>
                    <div className='font-semibold'>{lab.pointsReward}</div>
                  </div>
                </div>
              )}
              {lab.duration && (
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-xs text-muted-foreground'>Duration</div>
                    <div className='font-semibold'>{lab.duration} min</div>
                  </div>
                </div>
              )}
              {lab.maxAttempts && (
                <div>
                  <div className='text-xs text-muted-foreground'>Max Attempts</div>
                  <div className='font-semibold'>{lab.maxAttempts}</div>
                </div>
              )}
              {lab.timeLimit && (
                <div>
                  <div className='text-xs text-muted-foreground'>
                    Time Limit
                  </div>
                  <div className='font-semibold'>{lab.timeLimit}s</div>
                </div>
              )}
            </div>
            {lab.skills && lab.skills.length > 0 && (
              <div>
                <div className='text-sm text-muted-foreground mb-2'>Skills</div>
                <div className='flex flex-wrap gap-1'>
                  {lab.skills.map((skill) => (
                    <Badge key={skill} variant='outline'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {lab._count.submissions}
              </div>
              <div className='text-sm text-muted-foreground'>Submissions</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {lab._count.usersProgress}
              </div>
              <div className='text-sm text-muted-foreground'>In Progress</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{lab._count.instances}</div>
              <div className='text-sm text-muted-foreground'>
                Active Instances
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {lab.hints?.length ?? 0}
              </div>
              <div className='text-sm text-muted-foreground'>Hints</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flag Answer — PROTECTED: only visible to admin, never shown to users */}
      {lab.flagAnswer && <FlagAnswerField flagAnswer={lab.flagAnswer} />}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lab</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{lab.title}&rdquo;? This
              action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
