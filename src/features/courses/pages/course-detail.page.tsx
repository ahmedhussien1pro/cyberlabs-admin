import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { labsService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Globe,
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
  Monitor,
  LayoutTemplate,
  FlaskConical,
  Plus,
  X,
  GripVertical,
  Search,
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
import { CoursePreviewSheet } from '../components/course-preview-sheet';
import { CourseStateDropdown } from '../components/course-state-dropdown';

// ── constants (same as before) ─────────────────────────────────────────
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

type TabId = 'overview' | 'labs';

// ── Labs Tab Component ─────────────────────────────────────────────────
function CourseLabsTab({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [labSearch, setLabSearch] = useState('');

  // Get attached labs
  const { data: courseLabs = [], isLoading } = useQuery({
    queryKey: ['course-labs', courseId],
    queryFn: () => coursesService.getCourseLabs(courseId),
  });

  // Search all labs for the add modal
  const { data: allLabsData } = useQuery({
    queryKey: ['labs', 'list', 'for-attach', labSearch],
    queryFn: () =>
      labsService.getAll({ search: labSearch || undefined, limit: 20 }),
    enabled: addOpen,
  });

  const attachMutation = useMutation({
    mutationFn: (labId: string) => coursesService.attachLab(courseId, labId),
    onSuccess: () => {
      toast.success('Lab attached');
      queryClient.invalidateQueries({ queryKey: ['course-labs', courseId] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to attach lab'),
  });

  const detachMutation = useMutation({
    mutationFn: (labId: string) => coursesService.detachLab(courseId, labId),
    onSuccess: () => {
      toast.success('Lab removed');
      queryClient.invalidateQueries({ queryKey: ['course-labs', courseId] });
    },
    onError: () => toast.error('Failed to remove lab'),
  });

  const attachedLabIds = new Set(courseLabs.map((cl) => cl.lab.id));

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-16 rounded-xl' />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='font-semibold'>Attached Labs</h3>
          <p className='text-xs text-muted-foreground'>
            {courseLabs.length} lab{courseLabs.length !== 1 ? 's' : ''} in this
            course
          </p>
        </div>
        <Button
          size='sm'
          className='h-8 gap-2'
          onClick={() => setAddOpen(true)}>
          <Plus className='h-3.5 w-3.5' />
          Add Lab
        </Button>
      </div>

      {/* Labs list */}
      {courseLabs.length === 0 ? (
        <Card className='flex flex-col items-center justify-center gap-3 p-12 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
            <FlaskConical className='h-5 w-5 text-muted-foreground' />
          </div>
          <p className='font-medium'>No labs attached yet</p>
          <p className='text-sm text-muted-foreground'>
            Click "Add Lab" to attach labs to this course.
          </p>
        </Card>
      ) : (
        <div className='space-y-2'>
          {courseLabs.map((item, index) => (
            <Card key={index} className='flex items-center gap-4 p-3'>
              <GripVertical className='h-4 w-4 text-muted-foreground/40 shrink-0' />
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20'>
                <FlaskConical className='h-4 w-4 text-violet-400' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate text-sm font-semibold'>
                  {item.lab.title}
                </p>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>{item.lab.category}</span>
                  <span>·</span>
                  <span>{item.lab.difficulty}</span>
                  <span>·</span>
                  <span>{item.lab.executionMode}</span>
                </div>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <Badge variant='outline' className='text-[10px]'>
                  Order {item.order}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'>
                      <X className='h-3.5 w-3.5' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Lab</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove <strong>{item.lab.title}</strong> from this
                        course?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => detachMutation.mutate(item.lab.id)}
                        className='bg-destructive text-destructive-foreground'>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Lab Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FlaskConical className='h-4 w-4 text-violet-400' />
              Add Lab to Course
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search labs...'
                value={labSearch}
                onChange={(e) => setLabSearch(e.target.value)}
                className='pl-9 h-9'
              />
            </div>
            <div className='max-h-72 space-y-1 overflow-y-auto'>
              {(allLabsData?.data ?? []).map((lab) => {
                const isAttached = attachedLabIds.has(lab.id);
                return (
                  <div
                    key={lab.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm',
                      isAttached
                        ? 'opacity-50 bg-muted/30'
                        : 'hover:bg-muted/50 cursor-pointer',
                    )}>
                    <div className='min-w-0'>
                      <p className='truncate font-medium'>{lab.title}</p>
                      <p className='text-xs text-muted-foreground'>
                        {lab.category} · {lab.difficulty}
                      </p>
                    </div>
                    <Button
                      size='sm'
                      variant={isAttached ? 'outline' : 'default'}
                      className='h-7 shrink-0 text-xs'
                      disabled={isAttached || attachMutation.isPending}
                      onClick={() => attachMutation.mutate(lab.id)}>
                      {isAttached ? 'Added' : 'Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── State Indicator (helper) ────────────────────────────────────────────
function StateIndicator({
  state,
  isPublished,
}: {
  state?: string;
  isPublished: boolean;
}) {
  if (state === 'COMING_SOON')
    return (
      <span className='inline-flex items-center gap-1.5 text-sm font-medium text-blue-400'>
        <span className='h-2 w-2 rounded-full bg-blue-500' />
        Coming Soon
      </span>
    );
  if (isPublished || state === 'PUBLISHED')
    return (
      <span className='inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400'>
        <span className='h-2 w-2 rounded-full bg-emerald-500' />
        Published
      </span>
    );
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
          )}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

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
        err.response?.data?.message ??
          'Cannot delete — course may have active enrollments',
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
          className='transition-colors hover:text-foreground'>
          Courses
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='max-w-xs truncate font-medium text-foreground'>
          {course.title}
        </span>
      </nav>

      {/* ── Header ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight'>
              {course.title}
            </h1>
            <StateIndicator
              state={course.state}
              isPublished={course.isPublished}
            />
          </div>
          <p className='mt-1 font-mono text-sm text-muted-foreground'>
            {course.slug}
          </p>
        </div>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-9 gap-2'
            onClick={() => setPreviewOpen(true)}>
            <Monitor className='h-4 w-4' />
            Preview
          </Button>
          <Link to={ROUTES.COURSE_EDIT(id!)}>
            <Button variant='outline' size='sm' className='h-9 gap-2'>
              <Pencil className='h-4 w-4' />
              Edit
            </Button>
          </Link>
          <Button
            variant='outline'
            size='sm'
            className='h-9 gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary'
            onClick={() => navigate(`/courses/${id}/content`)}>
            <LayoutTemplate className='h-4 w-4' />
            Edit Content
          </Button>
          {/* State dropdown in header */}
          <CourseStateDropdown
            courseId={id!}
            currentState={course.state as any}
            isPublished={course.isPublished}
          />
          {/* Delete */}
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
                  Permanently delete <strong>{course.title}</strong>? This
                  cannot be undone.
                  {hasEnrollments && (
                    <span className='mt-2 flex items-center gap-1.5 font-medium text-destructive'>
                      <AlertTriangle className='h-4 w-4' />
                      This course has {course._count?.enrollments} active
                      enrollments.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  disabled={deleteMutation.isPending || hasEnrollments}>
                  Delete Course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='flex border-b border-border/50'>
        {(
          [
            { id: 'overview', label: 'Overview', icon: BookOpen },
            {
              id: 'labs',
              label: `Labs (${course._count?.sections ?? 0})`,
              icon: FlaskConical,
            },
          ] as { id: TabId; label: string; icon: any }[]
        ).map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tabId
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}>
            <Icon className='h-3.5 w-3.5' />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'labs' ? (
        <CourseLabsTab courseId={id!} />
      ) : (
        // ── Overview (existing layout preserved) ──
        <div className='grid gap-6 xl:grid-cols-3'>
          <div className='space-y-5 xl:col-span-2'>
            {/* Thumbnail */}
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
                    )}>
                    <p
                      className={cn(
                        'px-8 text-center text-xl font-black leading-snug',
                        COLOR_TEXT[color] ?? 'text-zinc-400',
                      )}>
                      {course.title}
                    </p>
                  </div>
                )}
                <div className='absolute left-3 top-3'>
                  {course.access && (
                    <Badge
                      className={cn(
                        'gap-1 font-bold shadow-lg',
                        course.access === 'FREE'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-violet-600 text-white',
                      )}>
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
                        <p className='text-sm font-semibold'>
                          {course.ar_title}
                        </p>
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

            {/* Tags / Topics / Skills */}
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
                        <Tag className='h-3.5 w-3.5' />
                        Tags
                      </p>
                      <ChipList items={course.tags ?? []} />
                    </div>
                  )}
                  {(course.topics?.length ?? 0) > 0 && (
                    <div className='space-y-2'>
                      <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                        <Cpu className='h-3.5 w-3.5' />
                        Topics
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
                        <GraduationCap className='h-3.5 w-3.5' />
                        Skills
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
                        <AlertTriangle className='h-3.5 w-3.5' />
                        Prerequisites
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

          {/* Right sidebar */}
          <div className='space-y-5'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Stats</CardTitle>
              </CardHeader>
              <CardContent className='divide-y divide-border/50 space-y-0'>
                {[
                  {
                    icon: Users,
                    label: 'Enrollments',
                    value:
                      course.enrollmentCount ?? course._count?.enrollments ?? 0,
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
                ].map(({ icon: Icon, label, value, color: c }) => (
                  <div
                    key={label}
                    className='flex items-center justify-between py-3'>
                    <span className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Icon className={cn('h-4 w-4', c)} />
                      {label}
                    </span>
                    <span className='text-sm font-semibold tabular-nums'>
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                          DIFFICULTY_BADGE[course.difficulty] ??
                            'border-border/60',
                        )}>
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
                        )}>
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
                    label: 'Category',
                    node: course.category ? (
                      <span className='text-sm font-medium'>
                        {course.category}
                      </span>
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
                    className='flex items-center justify-between gap-3'>
                    <span className='text-xs text-muted-foreground'>
                      {label}
                    </span>
                    {node}
                  </div>
                ))}
                {(course.isFeatured || course.isNew) && (
                  <>
                    <Separator />
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      {course.isFeatured && (
                        <Badge
                          variant='outline'
                          className='gap-1 border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs'>
                          <Star className='h-3 w-3' />
                          Featured
                        </Badge>
                      )}
                      {course.isNew && (
                        <Badge
                          variant='outline'
                          className='gap-1 border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs'>
                          <Sparkles className='h-3 w-3' />
                          New
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                  <div
                    key={label}
                    className='flex items-start justify-between gap-3'>
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
      )}

      <CoursePreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        course={course}
      />
    </div>
  );
}
