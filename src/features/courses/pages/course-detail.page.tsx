import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Globe,
  EyeOff,
  Users,
  Star,
  BookOpen,
  Pencil,
  Trash2,
  AlertTriangle,
  Layers,
  Clock,
  BarChart3,
  Crown,
  Unlock,
  Tag,
  GraduationCap,
  Calendar,
  RefreshCw,
  Cpu,
  ChevronRight,
  Sparkles,
  DollarSign,
} from 'lucide-react';
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
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';

const COLOR_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue: 'from-blue-950 to-blue-900 border-blue-800/50',
  violet: 'from-violet-950 to-violet-900 border-violet-800/50',
  orange: 'from-orange-950 to-orange-900 border-orange-800/50',
  rose: 'from-rose-950 to-rose-900 border-rose-800/50',
  cyan: 'from-cyan-950 to-cyan-900 border-cyan-800/50',
};
const COLOR_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  orange: 'text-orange-400',
  rose: 'text-rose-400',
  cyan: 'text-cyan-400',
};
const DIFFICULTY_BADGE: Record<string, string> = {
  BEGINNER: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  INTERMEDIATE: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  ADVANCED: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  EXPERT: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
};

function StateIndicator({
  state,
  isPublished,
}: {
  state?: string;
  isPublished: boolean;
}) {
  if (state === 'COMING_SOON') {
    return (
      <span className='inline-flex items-center gap-1.5 text-sm font-medium text-blue-400'>
        <span className='h-2 w-2 rounded-full bg-blue-500' />
        Coming Soon
      </span>
    );
  }
  if (isPublished || state === 'PUBLISHED') {
    return (
      <span className='inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400'>
        <span className='h-2 w-2 rounded-full bg-emerald-500' />
        Published
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1.5 text-sm font-medium text-amber-400'>
      <span className='h-2 w-2 rounded-full bg-amber-500' />
      Draft
    </span>
  );
}

function ChipList({
  items,
  colorClass = 'bg-muted/60 text-muted-foreground border-border/40',
}: {
  items: string[];
  colorClass?: string;
}) {
  if (!items.length) return <p className='text-sm text-muted-foreground'>—</p>;
  return (
    <div className='flex flex-wrap gap-1.5'>
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
            colorClass,
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => coursesService.publish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast.success('Course published');
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to publish'),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => coursesService.unpublish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast.success('Course moved to Draft');
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to unpublish'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => coursesService.delete(id!),
    onSuccess: () => {
      toast.success('Course deleted');
      navigate(ROUTES.COURSES);
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message ?? 'Cannot delete — course may have active enrollments',
      ),
  });

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-64 rounded-xl' />
        <div className='grid gap-4 xl:grid-cols-3'>
          <div className='space-y-4 xl:col-span-2'>
            <Skeleton className='h-40 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
          </div>
          <div className='space-y-4'>
            <Skeleton className='h-48 rounded-xl' />
            <Skeleton className='h-40 rounded-xl' />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground'>Course not found</p>
      </div>
    );
  }

  const color = course.color ?? 'blue';
  const isPublished = course.isPublished || course.state === 'PUBLISHED';
  const isComingSoon = course.state === 'COMING_SOON';
  const hasEnrollments = (course._count?.enrollments ?? 0) > 0;
  const isToggling = publishMutation.isPending || unpublishMutation.isPending;

  return (
    <div className='space-y-6'>
      {/* ── Breadcrumb ── */}
      <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
        <Link
          to={ROUTES.COURSES}
          className='transition-colors hover:text-foreground'
        >
          Courses
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='max-w-xs truncate text-foreground font-medium'>
          {course.title}
        </span>
      </nav>

      {/* ── Header ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight'>{course.title}</h1>
            <StateIndicator state={course.state} isPublished={course.isPublished} />
          </div>
          <p className='mt-1 font-mono text-sm text-muted-foreground'>
            {course.slug}
          </p>
        </div>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <Link to={ROUTES.COURSE_EDIT(id!)}>
            <Button variant='outline' size='sm' className='h-9 gap-2'>
              <Pencil className='h-4 w-4' />
              Edit
            </Button>
          </Link>

          {!isComingSoon && (
            <Button
              variant='outline'
              size='sm'
              className={cn(
                'h-9 gap-2',
                isPublished
                  ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                  : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
              )}
              onClick={() =>
                isPublished
                  ? unpublishMutation.mutate()
                  : publishMutation.mutate()
              }
              disabled={isToggling}
            >
              {isPublished ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Globe className='h-4 w-4' />
              )}
              {isPublished ? 'Move to Draft' : 'Publish'}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' size='sm' className='h-9 gap-2'>
                <Trash2 className='h-4 w-4' />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-destructive' />
                  Delete Course
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete{' '}
                  <strong>{course.title}</strong>? This action cannot be undone.
                  {hasEnrollments && (
                    <span className='mt-2 flex items-center gap-1.5 font-medium text-destructive'>
                      <AlertTriangle className='h-4 w-4' />
                      This course has {course._count?.enrollments} active enrollments and cannot be deleted.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  disabled={deleteMutation.isPending || hasEnrollments}
                >
                  Delete Course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── Body ── */}
      <div className='grid gap-6 xl:grid-cols-3'>
        {/* ── Left column ── */}
        <div className='space-y-5 xl:col-span-2'>
          {/* Thumbnail hero */}
          <Card className='overflow-hidden'>
            <div className='relative aspect-video w-full'>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div
                  className={cn(
                    'flex h-full w-full items-center justify-center bg-gradient-to-br border-b',
                    COLOR_BG[color] ??
                      'from-zinc-900 to-zinc-800 border-zinc-700',
                  )}
                >
                  <p
                    className={cn(
                      'px-8 text-center text-xl font-black leading-snug',
                      COLOR_TEXT[color] ?? 'text-zinc-400',
                    )}
                  >
                    {course.title}
                  </p>
                </div>
              )}
              {/* Access overlay */}
              <div className='absolute left-3 top-3'>
                {course.access && (
                  <Badge
                    className={cn(
                      'gap-1 font-bold shadow-lg',
                      course.access === 'FREE'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-violet-600 text-white',
                    )}
                  >
                    {course.access === 'FREE' ? (
                      <Unlock className='h-3 w-3' />
                    ) : (
                      <Crown className='h-3 w-3' />
                    )}
                    {course.access}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Description */}
          {(course.description || course.longDescription) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Description</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {course.description && (
                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    {course.description}
                  </p>
                )}
                {course.longDescription && (
                  <>
                    <Separator />
                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      {course.longDescription}
                    </p>
                  </>
                )}
                {course.ar_title && (
                  <>
                    <Separator />
                    <div dir='rtl' className='space-y-1'>
                      <p className='text-sm font-semibold'>{course.ar_title}</p>
                      {course.ar_description && (
                        <p className='text-sm text-muted-foreground'>
                          {course.ar_description}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags / Topics / Skills / Prerequisites */}
          {((course.tags?.length ?? 0) > 0 ||
            (course.topics?.length ?? 0) > 0 ||
            (course.skills?.length ?? 0) > 0 ||
            (course.prerequisites?.length ?? 0) > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Content Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {(course.tags?.length ?? 0) > 0 && (
                  <div className='space-y-2'>
                    <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      <Tag className='h-3.5 w-3.5' /> Tags
                    </p>
                    <ChipList items={course.tags ?? []} />
                  </div>
                )}
                {(course.topics?.length ?? 0) > 0 && (
                  <div className='space-y-2'>
                    <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      <Cpu className='h-3.5 w-3.5' /> Topics
                    </p>
                    <ChipList
                      items={course.topics ?? []}
                      colorClass='bg-blue-500/10 text-blue-400 border-blue-500/30'
                    />
                  </div>
                )}
                {(course.skills?.length ?? 0) > 0 && (
                  <div className='space-y-2'>
                    <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      <GraduationCap className='h-3.5 w-3.5' /> Skills
                    </p>
                    <ChipList
                      items={course.skills ?? []}
                      colorClass='bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    />
                  </div>
                )}
                {(course.prerequisites?.length ?? 0) > 0 && (
                  <div className='space-y-2'>
                    <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      <AlertTriangle className='h-3.5 w-3.5' /> Prerequisites
                    </p>
                    <ChipList
                      items={course.prerequisites ?? []}
                      colorClass='bg-amber-500/10 text-amber-400 border-amber-500/30'
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className='space-y-5'>
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Stats</CardTitle>
            </CardHeader>
            <CardContent className='space-y-0 divide-y divide-border/50'>
              {[
                {
                  icon: Users,
                  label: 'Enrollments',
                  value:
                    course.enrollmentCount ??
                    course._count?.enrollments ??
                    0,
                  color: 'text-blue-400',
                },
                {
                  icon: Layers,
                  label: 'Sections',
                  value: course._count?.sections ?? 0,
                  color: 'text-violet-400',
                },
                {
                  icon: BookOpen,
                  label: 'Lessons',
                  value: course._count?.lessons ?? 0,
                  color: 'text-emerald-400',
                },
                {
                  icon: Star,
                  label: 'Reviews',
                  value: course._count?.reviews ?? 0,
                  color: 'text-amber-400',
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className='flex items-center justify-between py-3'
                >
                  <span className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Icon className={cn('h-4 w-4', color)} />
                    {label}
                  </span>
                  <span className='text-sm font-semibold tabular-nums'>
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Properties</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {[
                {
                  label: 'Difficulty',
                  node: course.difficulty ? (
                    <Badge
                      variant='outline'
                      className={cn(
                        'gap-1 text-xs font-semibold',
                        DIFFICULTY_BADGE[course.difficulty] ?? 'border-border/60',
                      )}
                    >
                      <BarChart3 className='h-3 w-3' />
                      {course.difficulty.charAt(0) +
                        course.difficulty.slice(1).toLowerCase()}
                    </Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  ),
                },
                {
                  label: 'Access',
                  node: course.access ? (
                    <Badge
                      variant='outline'
                      className={cn(
                        'gap-1 text-xs font-bold',
                        course.access === 'FREE'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-violet-500/40 text-violet-400 bg-violet-500/10',
                      )}
                    >
                      {course.access === 'FREE' ? (
                        <Unlock className='h-3 w-3' />
                      ) : (
                        <Crown className='h-3 w-3' />
                      )}
                      {course.access}
                    </Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  ),
                },
                {
                  label: 'Content Type',
                  node: course.contentType ? (
                    <span className='text-sm font-medium'>
                      {course.contentType}
                    </span>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  ),
                },
                {
                  label: 'Category',
                  node: course.category ? (
                    <span className='text-sm font-medium'>{course.category}</span>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  ),
                },
                {
                  label: 'Instructor',
                  node: course.instructor ? (
                    <span className='text-sm font-medium'>
                      {course.instructor.name}
                    </span>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  ),
                },
                {
                  label: 'Price',
                  node:
                    course.price != null ? (
                      <span className='flex items-center gap-1 text-sm font-semibold'>
                        <DollarSign className='h-3.5 w-3.5 text-muted-foreground' />
                        {course.price}
                      </span>
                    ) : (
                      <span className='text-xs text-muted-foreground'>—</span>
                    ),
                },
                {
                  label: 'Duration',
                  node:
                    course.duration != null ? (
                      <span className='flex items-center gap-1 text-sm'>
                        <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                        {course.duration}h
                      </span>
                    ) : (
                      <span className='text-xs text-muted-foreground'>—</span>
                    ),
                },
              ].map(({ label, node }) => (
                <div
                  key={label}
                  className='flex items-center justify-between gap-3'
                >
                  <span className='text-xs text-muted-foreground'>{label}</span>
                  {node}
                </div>
              ))}

              {/* Flags */}
              {(course.isFeatured || course.isNew) && (
                <>
                  <Separator />
                  <div className='flex flex-wrap gap-1.5 pt-1'>
                    {course.isFeatured && (
                      <Badge
                        variant='outline'
                        className='gap-1 border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs'
                      >
                        <Star className='h-3 w-3' /> Featured
                      </Badge>
                    )}
                    {course.isNew && (
                      <Badge
                        variant='outline'
                        className='gap-1 border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs'
                      >
                        <Sparkles className='h-3 w-3' /> New
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Timeline</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {[
                {
                  icon: Calendar,
                  label: 'Created',
                  value: formatDistanceToNow(new Date(course.createdAt), {
                    addSuffix: true,
                  }),
                  sub: format(new Date(course.createdAt), 'dd MMM yyyy'),
                },
                {
                  icon: RefreshCw,
                  label: 'Updated',
                  value: formatDistanceToNow(new Date(course.updatedAt), {
                    addSuffix: true,
                  }),
                  sub: format(new Date(course.updatedAt), 'dd MMM yyyy'),
                },
                ...(course.publishedAt
                  ? [
                      {
                        icon: Globe,
                        label: 'Published',
                        value: formatDistanceToNow(
                          new Date(course.publishedAt),
                          { addSuffix: true },
                        ),
                        sub: format(
                          new Date(course.publishedAt),
                          'dd MMM yyyy',
                        ),
                      },
                    ]
                  : []),
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className='flex items-start justify-between gap-3'>
                  <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Icon className='h-3.5 w-3.5' />
                    {label}
                  </span>
                  <div className='text-right'>
                    <p className='text-xs font-medium'>{value}</p>
                    <p className='text-[10px] text-muted-foreground'>{sub}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
