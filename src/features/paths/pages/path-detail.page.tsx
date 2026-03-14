// src/features/paths/pages/path-detail.page.tsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  MapPin,
  BookOpen,
  FlaskConical,
  Lock,
  Unlock,
  Clock,
  Users,
  Plus,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { pathsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import type { PathModule } from '@/core/types/api.types';
import { AddModuleModal } from '../components/add-module-modal';
import type { NewModule } from '../components/add-module-modal';
import { cn } from '@/lib/utils';

export default function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('paths');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [attachingCount, setAttachingCount] = useState(0);

  const { data: path, isLoading } = useQuery({
    queryKey: PATHS_QUERY_KEYS.detail(id!),
    queryFn: () => pathsService.getById(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      path?.isPublished
        ? pathsService.unpublish(id!)
        : pathsService.publish(id!),
    onSuccess: () => {
      toast.success(
        path?.isPublished
          ? t('messages.unpublishSuccess')
          : t('messages.publishSuccess'),
      );
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.detail(id!) });
    },
    onError: () => toast.error('Failed to update publish status'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => pathsService.delete(id!),
    onSuccess: () => {
      toast.success(t('messages.deleteSuccess'));
      navigate(ROUTES.PATHS);
    },
    onError: () => toast.error('Failed to delete path'),
  });

  const detachCourseMutation = useMutation({
    mutationFn: (courseId: string) => pathsService.detachCourse(id!, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.detail(id!) });
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
      toast.success('Module removed');
    },
    onError: () => toast.error('Failed to remove module'),
  });

  const handleAddModules = async (newModules: NewModule[]) => {
    if (!path || newModules.length === 0) return;
    setShowAddModal(false);
    setAttachingCount(newModules.length);

    let successCount = 0;

    for (const mod of newModules) {
      try {
        if (mod.type === 'COURSE' && mod.courseId) {
          await pathsService.attachCourse(id!, mod.courseId);
        } else if (mod.type === 'LAB' && mod.labId) {
          await pathsService.attachLab(id!, mod.labId);
        }
        successCount++;
      } catch (err: unknown) {
        const msg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? 'Unknown error';
        toast.error(`Failed to add "${mod.title}": ${Array.isArray(msg) ? msg.join(' · ') : msg}`);
      }
    }

    setAttachingCount(0);

    if (successCount > 0) {
      toast.success(`${successCount} module${successCount > 1 ? 's' : ''} added successfully`);
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.detail(id!) });
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
    }
  };

  const handleRemoveModule = (module: PathModule) => {
    if (module.courseId) {
      detachCourseMutation.mutate(module.courseId);
    } else if (module.labId) {
      pathsService
        .detachLab(id!, module.labId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.detail(id!) });
          queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
          toast.success('Module removed');
        })
        .catch(() => toast.error('Failed to remove module'));
    }
  };

  const handleToggleLock = (_module: PathModule) => {
    toast.info('Lock/unlock requires a dedicated backend endpoint — coming soon');
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-40' />
        <Skeleton className='h-36 rounded-2xl' />
        <Skeleton className='h-64 rounded-2xl' />
      </div>
    );
  }

  if (!path) return null;

  const existingCourseIds = path.modules.filter((m) => m.courseId).map((m) => m.courseId!);
  const existingLabIds    = path.modules.filter((m) => m.labId).map((m) => m.labId!);
  const isAttaching = attachingCount > 0;

  return (
    <div className='space-y-6'>
      {/* ── Back + Actions ── */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Button variant='ghost' onClick={() => navigate(ROUTES.PATHS)}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('title')}
        </Button>

        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
            {publishMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : path.isPublished ? (
              <EyeOff className='mr-2 h-4 w-4' />
            ) : (
              <Globe className='mr-2 h-4 w-4' />
            )}
            {path.isPublished ? t('actions.unpublish') : t('actions.publish')}
          </Button>

          <Button variant='outline' asChild>
            <Link to={ROUTES.PATH_EDIT(path.id)}>
              <Pencil className='mr-2 h-4 w-4' />
              {t('actions.edit')}
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <Trash2 className='mr-2 h-4 w-4' />
                {t('actions.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('messages.deleteConfirm')}</AlertDialogTitle>
                <AlertDialogDescription>{t('messages.deleteWarning')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive text-destructive-foreground'
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {t('actions.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── Path Info Card ── */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-start gap-6'>
            {path.thumbnail ? (
              <img src={path.thumbnail} alt={path.title} className='h-24 w-24 shrink-0 rounded-xl object-cover' />
            ) : (
              <div className='flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                <MapPin className='h-10 w-10 text-primary' />
              </div>
            )}
            <div className='flex-1 space-y-2'>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-2xl font-bold'>{path.title}</h1>
                <Badge variant={path.isPublished ? 'default' : 'secondary'}>
                  {path.isPublished ? t('filters.published') : t('filters.unpublished')}
                </Badge>
              </div>
              {path.ar_title && <p className='text-sm text-muted-foreground' dir='rtl'>{path.ar_title}</p>}
              {path.description && <p className='text-sm text-muted-foreground'>{path.description}</p>}
              <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <span className='flex items-center gap-1'><Users className='h-4 w-4' />{path._count.enrollments} {t('enrollments')}</span>
                <span className='flex items-center gap-1'><MapPin className='h-4 w-4' />{t('modulesCount', { count: path._count.modules })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Modules Card ── */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-4'>
          <CardTitle>{t('modules.title')}</CardTitle>
          <Button size='sm' onClick={() => setShowAddModal(true)} disabled={isAttaching}>
            {isAttaching ? (
              <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Adding {attachingCount}...</>
            ) : (
              <><Plus className='mr-2 h-4 w-4' />Add Module</>
            )}
          </Button>
        </CardHeader>

        <CardContent>
          {isAttaching && (
            <div className='mb-3 flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2 text-sm text-primary'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Attaching {attachingCount} module{attachingCount > 1 ? 's' : ''} to path...
            </div>
          )}

          {path.modules.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center'>
              <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted'>
                <BookOpen className='h-7 w-7 text-muted-foreground' />
              </div>
              <p className='font-medium text-muted-foreground'>{t('modules.empty')}</p>
              <p className='mt-1 text-sm text-muted-foreground'>Add courses or labs to build this learning path</p>
              <Button className='mt-4' onClick={() => setShowAddModal(true)} disabled={isAttaching}>
                <Plus className='mr-2 h-4 w-4' />Add First Module
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              {path.modules.map((module: PathModule, idx: number) => (
                <div
                  key={module.id}
                  className={cn(
                    'group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-accent/30 hover:shadow-sm',
                    isAttaching && 'pointer-events-none opacity-60',
                  )}>
                  <div className='flex shrink-0 items-center gap-1 text-muted-foreground'>
                    <GripVertical className='h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100' />
                    <span className='w-5 text-center font-mono text-sm'>{idx + 1}</span>
                  </div>

                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    module.type === 'COURSE' ? 'bg-blue-500/10' : 'bg-purple-500/10',
                  )}>
                    {module.type === 'COURSE'
                      ? <BookOpen className='h-5 w-5 text-blue-600' />
                      : <FlaskConical className='h-5 w-5 text-purple-600' />}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium'>
                      {module.course?.title ?? module.lab?.title ?? module.title}
                    </p>
                    <div className='mt-1 flex flex-wrap items-center gap-2'>
                      <Badge variant='outline' className='py-0 text-xs'>{module.type}</Badge>
                      {(module.course?.difficulty ?? module.lab?.difficulty) && (
                        <Badge variant='secondary' className='py-0 text-xs'>
                          {module.course?.difficulty ?? module.lab?.difficulty}
                        </Badge>
                      )}
                      {module.estimatedHours > 0 && (
                        <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />{module.estimatedHours}h
                        </span>
                      )}
                      {module.isLocked && (
                        <span className='flex items-center gap-1 text-xs text-orange-500'>
                          <Lock className='h-3 w-3' />Locked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex shrink-0 items-center gap-1'>
                    <Button variant='ghost' size='icon' className='h-8 w-8'
                      title={module.isLocked ? 'Unlock module' : 'Lock module'}
                      onClick={() => handleToggleLock(module)}>
                      {module.isLocked
                        ? <Lock className='h-4 w-4 text-orange-500' />
                        : <Unlock className='h-4 w-4 text-muted-foreground' />}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='ghost' size='icon'
                          className='h-8 w-8 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove module?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove &ldquo;{module.course?.title ?? module.lab?.title ?? module.title}&rdquo; from this path. The course/lab itself won&apos;t be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className='bg-destructive text-destructive-foreground'
                            onClick={() => handleRemoveModule(module)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <AddModuleModal
          existingCourseIds={existingCourseIds}
          existingLabIds={existingLabIds}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddModules}
          isSubmitting={isAttaching}
        />
      )}
    </div>
  );
}
