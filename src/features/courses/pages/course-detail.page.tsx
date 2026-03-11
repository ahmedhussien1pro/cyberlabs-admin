// src/features/courses/pages/course-detail.page.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Edit, Copy,
  AlertCircle, BookOpen, Clock, Users,
  FlaskConical, Crown, Unlock, Shield,
  CheckCircle2, Globe, Star, Trash2, Loader2, BookText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import type { AdminCourse } from '../types/admin-course.types';

const COLOR_CLASS: Record<string, string> = {
  EMERALD: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  BLUE:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
  VIOLET:  'bg-violet-500/10 border-violet-500/30 text-violet-400',
  ORANGE:  'bg-orange-500/10 border-orange-500/30 text-orange-400',
  ROSE:    'bg-rose-500/10 border-rose-500/30 text-rose-400',
  CYAN:    'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
};

const STATE_CLASS: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  DRAFT:       'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
  COMING_SOON: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3'>
      <Icon className='h-5 w-5 text-muted-foreground shrink-0' />
      <div>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-base font-bold'>{value}</p>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  // Route is /courses/:id/detail — param name is "id" (UUID)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryKey = ['admin', 'course', 'detail', id];

  const { data: course, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => adminCoursesApi.getById(id!),
    enabled: !!id,
    retry: false,
  });

  const { mutate: deleteCourse, isPending: deleting } = useMutation({
    mutationFn: () => adminCoursesApi.delete(id!),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      navigate(ROUTES.COURSES);
    },
    onError: () => toast.error('Failed to delete course'),
  });

  const { mutate: duplicateCourse, isPending: duplicating } = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(id!),
    onSuccess: (dup: AdminCourse) => {
      toast.success(`Duplicated as "${dup.title}"`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      navigate(`/courses/${dup.id}/detail`);
    },
    onError: () => toast.error('Failed to duplicate'),
  });

  const isPublished = course?.isPublished ?? course?.state === 'PUBLISHED';

  const { mutate: togglePublish, isPending: publishing } = useMutation({
    mutationFn: () =>
      isPublished
        ? adminCoursesApi.unpublish(id!)
        : adminCoursesApi.publish(id!),
    onSuccess: (updated: AdminCourse) => {
      // Update cache directly with the returned course — no round-trip needed
      queryClient.setQueryData(queryKey, updated);
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', 'edit'] });
      toast.success(
        updated.isPublished ? 'Course published ✓' : 'Course unpublished',
      );
    },
    onError: () => toast.error('Failed to update state'),
  });

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-32 w-full rounded-xl' />
        <div className='grid grid-cols-3 gap-4'>
          {[1, 2, 3].map((i) => <Skeleton key={i} className='h-20 rounded-xl' />)}
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Course not found: <code className='font-mono text-xs'>{id}</code>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const colorClass = COLOR_CLASS[course.color?.toUpperCase()] ?? COLOR_CLASS.BLUE;
  const courseState = course.isPublished ? 'PUBLISHED' : (course.state ?? 'DRAFT');
  const stateClass = STATE_CLASS[courseState] ?? STATE_CLASS.DRAFT;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start gap-4'>
        <Button variant='ghost' size='sm' className='gap-2 mt-0.5'
          onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <div className='flex-1 min-w-0'>
          <div className='flex flex-wrap items-center gap-2 mb-1'>
            <h1 className='text-xl font-bold truncate'>{course.title}</h1>
            <Badge variant='outline' className={`rounded-full text-xs ${stateClass}`}>
              {courseState === 'PUBLISHED'
                ? <><CheckCircle2 className='h-3 w-3 mr-1 inline' />Published</>
                : courseState.replace('_', ' ')}
            </Badge>
            {course.isFeatured && (
              <Badge variant='outline' className='rounded-full text-xs bg-yellow-500/10 border-yellow-500/30 text-yellow-400'>
                <Star className='h-3 w-3 mr-1 inline' />Featured
              </Badge>
            )}
          </div>
          {course.ar_title && (
            <p className='text-sm text-muted-foreground' dir='rtl'>{course.ar_title}</p>
          )}
          <p className='text-xs text-muted-foreground font-mono mt-1'>{course.slug}</p>
        </div>

        {/* Actions */}
        <div className='flex flex-wrap items-center gap-2 shrink-0'>
          <Button
            variant='outline' size='sm' className='gap-2'
            onClick={() => togglePublish()} disabled={publishing}
          >
            {publishing
              ? <Loader2 className='h-4 w-4 animate-spin' />
              : <Globe className='h-4 w-4' />}
            {isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button
            variant='outline' size='sm' className='gap-2'
            onClick={() => duplicateCourse()} disabled={duplicating}
          >
            {duplicating
              ? <Loader2 className='h-4 w-4 animate-spin' />
              : <Copy className='h-4 w-4' />}
            Duplicate
          </Button>
          <Button
            variant='outline' size='sm' className='gap-2'
            onClick={() => navigate(`/courses/${course.slug}/edit?tab=curriculum`)}
          >
            <BookText className='h-4 w-4' /> Curriculum
          </Button>
          <Button
            size='sm' className='gap-2'
            onClick={() => navigate(`/courses/${course.slug}/edit`)}
          >
            <Edit className='h-4 w-4' /> Edit
          </Button>
        </div>
      </div>

      {/* Hero card */}
      <Card>
        <CardContent className='pt-5 pb-4'>
          <div className='flex items-start gap-4'>
            <div className='h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/50'>
              {course.image || course.thumbnail ? (
                <img
                  src={(course.image ?? course.thumbnail)!}
                  alt={course.title}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className={`h-full w-full flex items-center justify-center rounded-xl border ${colorClass}`}>
                  <BookOpen className='h-6 w-6' />
                </div>
              )}
            </div>
            <div className='min-w-0 flex-1 space-y-2'>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='outline' className={`rounded-full text-xs ${colorClass}`}>
                  {course.color?.toLowerCase()}
                </Badge>
                <Badge variant='outline' className='rounded-full text-xs'>
                  {course.access === 'FREE'
                    ? <Unlock className='h-3 w-3 mr-1 inline' />
                    : <Crown className='h-3 w-3 mr-1 inline' />}
                  {course.access}
                </Badge>
                <Badge variant='outline' className='rounded-full text-xs'>
                  <Shield className='h-3 w-3 mr-1 inline' />{course.difficulty}
                </Badge>
                <Badge variant='outline' className='rounded-full text-xs'>
                  {course.category?.replace(/_/g, ' ')}
                </Badge>
              </div>
              {course.description && (
                <p className='text-sm text-muted-foreground leading-relaxed'>{course.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard label='Topics'     value={course.totalTopics ?? 0}                         icon={BookOpen}    />
        <StatCard label='Est. Hours' value={`${course.estimatedHours ?? 0}h`}               icon={Clock}       />
        <StatCard label='Enrolled'   value={(course.enrollmentCount ?? 0).toLocaleString()}  icon={Users}       />
        <StatCard label='Labs'       value={course.labSlugs?.length ?? 0}                    icon={FlaskConical} />
      </div>

      {/* Skills & Tags */}
      {(course.skills?.length > 0 || course.tags?.length > 0) && (
        <Card>
          <CardHeader><CardTitle className='text-base'>Skills & Tags</CardTitle></CardHeader>
          <CardContent className='space-y-3'>
            {course.skills?.length > 0 && (
              <div>
                <p className='text-xs text-muted-foreground mb-2'>Skills</p>
                <div className='flex flex-wrap gap-2'>
                  {course.skills.map((s) => (
                    <Badge key={s} variant='secondary' className='text-xs'>{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {course.tags?.length > 0 && (
              <div>
                <p className='text-xs text-muted-foreground mb-2'>Tags</p>
                <div className='flex flex-wrap gap-2'>
                  {course.tags.map((t) => (
                    <Badge key={t} variant='outline' className='text-xs opacity-70'>{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Labs */}
      {course.labSlugs?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className='text-base'>Attached Labs</CardTitle></CardHeader>
          <CardContent>
            <div className='grid gap-2 sm:grid-cols-2'>
              {course.labSlugs.map((slug) => (
                <div key={slug} className='flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2'>
                  <FlaskConical className='h-4 w-4 text-muted-foreground shrink-0' />
                  <span className='text-sm font-mono'>{slug}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Danger zone */}
      <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-4'>
        <h3 className='text-sm font-semibold text-destructive mb-2'>Danger Zone</h3>
        <p className='text-xs text-muted-foreground mb-3'>
          Deleting this course is irreversible. All curriculum data will be lost.
        </p>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' size='sm' className='gap-2' disabled={deleting}>
              {deleting
                ? <><Loader2 className='h-4 w-4 animate-spin' /> Deleting...</>
                : <><Trash2 className='h-4 w-4' /> Delete Course</>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{course.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The course and all its curriculum data will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCourse()}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                Delete Course
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
