// src/features/map/pages/content-map.page.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  GripVertical, BookOpen, FlaskConical, ChevronDown, Pencil, X,
  Plus, Search, Map, Globe, EyeOff, Layers, ArrowRight,
  BarChart3, Clock, Zap, ExternalLink, Sparkles, RefreshCw,
  Route, FlaskRound,
} from 'lucide-react';
import { Button }     from '@/components/ui/button';
import { Input }      from '@/components/ui/input';
import { Badge }      from '@/components/ui/badge';
import { Skeleton }   from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator }  from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { pathsService }                      from '@/core/api/services/paths.service';
import { coursesService, type CourseLabItem } from '@/core/api/services/courses.service';
import { labsService }                       from '@/core/api/services/labs.service';
import { ROUTES }                            from '@/shared/constants';

// ── Types ────────────────────────────────────────────────────────────────────
type SidebarTab = 'path' | 'course' | 'lab';

interface PathModule {
  id: string; order: number; title: string;
  type: 'COURSE' | 'LAB' | 'QUIZ' | 'PROJECT';
  status: string; estimatedHours: number;
  courseId?: string | null; labId?: string | null;
  course?: {
    id: string; title: string; ar_title?: string; slug: string;
    difficulty: string; isPublished: boolean;
    estimatedHours?: number; duration?: number;
    _count?: { lessons?: number; sections?: number };
  } | null;
  lab?: {
    id: string; title: string; ar_title?: string; slug: string;
    difficulty: string; isPublished: boolean;
  } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIFFICULTY_COLOR: Record<string, string> = {
  BEGINNER:     'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  INTERMEDIATE: 'border-amber-500/40   text-amber-400   bg-amber-500/10',
  ADVANCED:     'border-orange-500/40  text-orange-400  bg-orange-500/10',
  EXPERT:       'border-rose-500/40    text-rose-400    bg-rose-500/10',
};

function DiffBadge({ d }: { d?: string }) {
  if (!d) return <span className='text-xs text-muted-foreground'>—</span>;
  return (
    <Badge variant='outline' className={cn('text-[10px] font-semibold py-0 h-4', DIFFICULTY_COLOR[d])}>
      <BarChart3 className='mr-1 h-2.5 w-2.5' />
      {d.charAt(0) + d.slice(1).toLowerCase()}
    </Badge>
  );
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

// ── CourseLabsSection ───────────────────────────────────────────────────────────────
function CourseLabsSection({
  courseId, onLinkLab,
}: { courseId: string; onLinkLab: (id: string) => void }) {
  const queryClient  = useQueryClient();
  const draggedLabId = useRef<string | null>(null);
  const [labOrder, setLabOrder] = useState<CourseLabItem[] | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const { data: fetchedLabs, isLoading } = useQuery({
    queryKey: ['course-labs', courseId],
    queryFn:  () => coursesService.getCourseLabs(courseId),
  });

  const rawLabs = fetchedLabs ?? [];
  const displayLabs: CourseLabItem[] = labOrder ?? (Array.isArray(rawLabs) ? rawLabs : []);

  const detachMutation = useMutation({
    mutationFn: (labId: string) => coursesService.detachLab(courseId, labId),
    onSuccess: () => {
      setLabOrder(null);
      queryClient.invalidateQueries({ queryKey: ['course-labs', courseId] });
      toast.success('Lab unlinked');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to unlink lab'),
  });

  const reorderMutation = useMutation({
    mutationFn: (labIds: string[]) => coursesService.reorderLabs(courseId, labIds),
    onError: () => {
      setLabOrder(null);
      queryClient.invalidateQueries({ queryKey: ['course-labs', courseId] });
    },
  });

  const handleDragStart = (e: React.DragEvent, labId: string) => {
    e.stopPropagation();
    draggedLabId.current = labId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', labId);
  };
  const handleDragOver = (e: React.DragEvent, labId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedLabId.current && draggedLabId.current !== labId) setDragOver(labId);
  };
  const handleDrop = (e: React.DragEvent, targetLabId: string) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(null);
    const srcId = draggedLabId.current; draggedLabId.current = null;
    if (!srcId || srcId === targetLabId) return;
    const from = displayLabs.findIndex((l) => l.lab.id === srcId);
    const to   = displayLabs.findIndex((l) => l.lab.id === targetLabId);
    if (from < 0 || to < 0) return;
    const reordered = reorder(displayLabs, from, to).map((l, i) => ({ ...l, order: i }));
    setLabOrder(reordered);
    reorderMutation.mutate(reordered.map((l) => l.lab.id));
  };

  if (isLoading)
    return (
      <div className='mt-2 space-y-1.5 pl-4'>
        {[1, 2].map((i) => <Skeleton key={i} className='h-9 w-full rounded-lg' />)}
      </div>
    );

  return (
    <div className='mt-2 space-y-1 pl-4'>
      <AnimatePresence initial={false}>
        {displayLabs.map(({ lab }) => (
          <div
            key={lab.id} draggable
            onDragStart={(e) => handleDragStart(e, lab.id)}
            onDragOver={(e)  => handleDragOver(e, lab.id)}
            onDrop={(e)      => handleDrop(e, lab.id)}
            onDragLeave={() => setDragOver(null)}
            className={cn(
              'group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all cursor-grab active:cursor-grabbing',
              dragOver === lab.id
                ? 'border-violet-500/60 bg-violet-500/10 shadow-sm'
                : 'border-border/40 bg-background/50 hover:border-border/70 hover:bg-muted/40',
            )}
          >
            <GripVertical className='h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60' />
            <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/15'>
              <FlaskConical className='h-3 w-3 text-violet-400' />
            </div>
            <span className='min-w-0 flex-1 truncate text-sm font-medium'>{lab.title}</span>
            <div className='flex shrink-0 items-center gap-1.5'>
              <DiffBadge d={lab.difficulty} />
              {lab.isPublished ? <Globe className='h-3 w-3 text-emerald-400' /> : <EyeOff className='h-3 w-3 text-muted-foreground/40' />}
            </div>
            <div className='flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
              <TooltipProvider delayDuration={300}>
                <Tooltip><TooltipTrigger asChild>
                  <Link to={ROUTES.LAB_DETAIL(lab.id)}>
                    <Button variant='ghost' size='icon' className='h-6 w-6'><ExternalLink className='h-3 w-3' /></Button>
                  </Link>
                </TooltipTrigger><TooltipContent side='top'>View</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild>
                  <Link to={ROUTES.LAB_EDIT(lab.id)}>
                    <Button variant='ghost' size='icon' className='h-6 w-6'><Pencil className='h-3 w-3' /></Button>
                  </Link>
                </TooltipTrigger><TooltipContent side='top'>Edit</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-6 w-6 text-destructive hover:bg-destructive/10'
                    onClick={(e) => { e.stopPropagation(); detachMutation.mutate(lab.id); }}
                    disabled={detachMutation.isPending}>
                    <X className='h-3 w-3' />
                  </Button>
                </TooltipTrigger><TooltipContent side='top'>Unlink</TooltipContent></Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </AnimatePresence>
      {displayLabs.length === 0 && (
        <p className='py-1 text-xs text-muted-foreground/60'>No labs linked yet</p>
      )}
      <Button variant='ghost' size='sm'
        className='mt-1 h-7 w-full justify-start gap-1.5 rounded-lg border border-dashed border-violet-500/25 text-xs text-muted-foreground hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-400'
        onClick={() => onLinkLab(courseId)}>
        <Plus className='h-3 w-3' /> Link Lab
      </Button>
    </div>
  );
}

// ── CourseModuleCard (used inside Path view) ───────────────────────────────────────
function CourseModuleCard({
  module, index, isExpanded, isDragOver,
  onToggle, onLinkLab, onDetachCourse,
  onDragStart, onDragOver, onDrop, onDragLeave,
}: {
  module: PathModule; index: number; isExpanded: boolean; isDragOver: boolean;
  onToggle: () => void; onLinkLab: (courseId: string) => void;
  onDetachCourse: (moduleId: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver:  (e: React.DragEvent) => void;
  onDrop:      (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) {
  const course = module.course;
  if (!course) return null;

  return (
    <div
      draggable onDragStart={onDragStart} onDragOver={onDragOver}
      onDrop={onDrop} onDragLeave={onDragLeave}
      className={cn(
        'rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing',
        isDragOver
          ? 'border-blue-500/60 bg-blue-500/5 shadow-lg shadow-blue-500/10 scale-[1.01]'
          : 'border-border/60 bg-card hover:border-border',
      )}
    >
      <div className='flex items-center gap-3 p-3'>
        <GripVertical className='h-4 w-4 shrink-0 text-muted-foreground/30 hover:text-muted-foreground/70' />
        <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/25'>
          {index + 1}
        </span>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20'>
          <BookOpen className='h-4 w-4 text-blue-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <p className='truncate text-sm font-semibold'>{course.title}</p>
            {course.isPublished
              ? <span className='flex items-center gap-1 text-[10px] font-medium text-emerald-400'><span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />Live</span>
              : <span className='flex items-center gap-1 text-[10px] font-medium text-amber-500/80'><span className='h-1.5 w-1.5 rounded-full bg-amber-500/60' />Draft</span>}
          </div>
          <div className='mt-1 flex flex-wrap items-center gap-2'>
            <DiffBadge d={course.difficulty} />
            {(course.estimatedHours ?? course.duration) ? (
              <span className='flex items-center gap-1 text-[10px] text-muted-foreground'><Clock className='h-2.5 w-2.5' />{course.estimatedHours ?? course.duration}h</span>
            ) : null}
            {(course._count?.lessons ?? 0) > 0 && (
              <span className='flex items-center gap-1 text-[10px] text-muted-foreground'><Layers className='h-2.5 w-2.5' />{course._count?.lessons} lessons</span>
            )}
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-0.5'>
          <TooltipProvider delayDuration={300}>
            <Tooltip><TooltipTrigger asChild>
              <Link to={ROUTES.COURSE_EDIT(course.id)}><Button variant='ghost' size='icon' className='h-7 w-7'><ExternalLink className='h-3.5 w-3.5' /></Button></Link>
            </TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Link to={ROUTES.COURSE_EDIT(course.id)}><Button variant='ghost' size='icon' className='h-7 w-7'><Pencil className='h-3.5 w-3.5' /></Button></Link>
            </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive hover:bg-destructive/10'
                onClick={(e) => { e.stopPropagation(); onDetachCourse(module.id); }}>
                <X className='h-3.5 w-3.5' />
              </Button>
            </TooltipTrigger><TooltipContent>Remove from path</TooltipContent></Tooltip>
          </TooltipProvider>
          <Button variant='ghost' size='icon' className='h-7 w-7'
            onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className='h-4 w-4' />
            </motion.div>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-border/40 bg-muted/20 px-4 pb-3 pt-2.5'>
              <p className='mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                <FlaskConical className='h-3 w-3 text-violet-400' /> Linked Labs
              </p>
              <CourseLabsSection courseId={course.id} onLinkLab={onLinkLab} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── LinkLabModal ────────────────────────────────────────────────────────────────
function LinkLabModal({
  open, courseId, onClose,
}: { open: boolean; courseId: string | null; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: labsData, isLoading: labsLoading } = useQuery({
    queryKey: ['labs-picker', search],
    queryFn:  () => labsService.getAll({ search, limit: 50 }),
    enabled:  open,
  });
  const { data: linkedLabs } = useQuery({
    queryKey: ['course-labs', courseId],
    queryFn:  () => coursesService.getCourseLabs(courseId!),
    enabled:  open && !!courseId,
  });

  const linkedIds = new Set((linkedLabs ?? []).map((l: any) => l.lab?.id ?? l.id));

  const attachMutation = useMutation({
    mutationFn: (labId: string) => coursesService.attachLab(courseId!, labId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-labs', courseId] });
      toast.success('Lab linked successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to link lab'),
  });

  const labs: any[] = Array.isArray(labsData) ? labsData : (labsData as any)?.data ?? (labsData as any)?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FlaskConical className='h-5 w-5 text-violet-400' /> Link Lab to Course
          </DialogTitle>
          <DialogDescription>Select labs to add to this course</DialogDescription>
        </DialogHeader>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input placeholder='Search labs...' value={search}
            onChange={(e) => setSearch(e.target.value)} className='pl-9' autoFocus />
        </div>
        <ScrollArea className='h-80'>
          <div className='space-y-1.5 pr-2'>
            {labsLoading && [1,2,3,4].map((i) => <Skeleton key={i} className='h-14 rounded-lg' />)}
            {!labsLoading && labs.length === 0 && (
              <p className='py-10 text-center text-sm text-muted-foreground'>No labs found</p>
            )}
            {labs.map((lab) => {
              const isLinked = courseId ? linkedIds.has(lab.id) : false;
              return (
                <button key={lab.id}
                  disabled={isLinked || attachMutation.isPending || !courseId}
                  onClick={() => courseId && !isLinked && attachMutation.mutate(lab.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                    isLinked ? 'cursor-default border-emerald-500/30 bg-emerald-500/5 opacity-70'
                    : !courseId ? 'cursor-default border-border/30 opacity-50'
                    : 'cursor-pointer border-border/50 hover:border-violet-500/40 hover:bg-violet-500/5',
                  )}
                >
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
                    isLinked ? 'bg-emerald-500/15 ring-emerald-500/20' : 'bg-violet-500/15 ring-violet-500/20')}>
                    <FlaskConical className={cn('h-4 w-4', isLinked ? 'text-emerald-400' : 'text-violet-400')} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{lab.title}</p>
                    <div className='mt-0.5 flex flex-wrap items-center gap-2'>
                      <DiffBadge d={lab.difficulty} />
                      {(lab.xpReward ?? 0) > 0 && (
                        <span className='flex items-center gap-1 text-[10px] text-amber-400'><Zap className='h-2.5 w-2.5' /> {lab.xpReward} XP</span>
                      )}
                    </div>
                  </div>
                  {isLinked
                    ? <span className='shrink-0 text-xs font-semibold text-emerald-400'>✓ Linked</span>
                    : <Plus className='h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100' />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── LinkCourseModal ─────────────────────────────────────────────────────────────
function LinkCourseModal({
  open, pathId, currentCourseIds, onClose,
}: {
  open: boolean; pathId: string | null;
  currentCourseIds: Set<string>; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses-picker', search],
    queryFn: () => coursesService.getAll({ search, limit: 50 }),
    enabled: open && !!pathId,
  });

  const attachMutation = useMutation({
    mutationFn: (courseId: string) => pathsService.attachCourse(pathId!, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-map-detail', pathId] });
      queryClient.invalidateQueries({ queryKey: ['paths-map'] });
      toast.success('Course linked to path');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to link course'),
  });

  const courses: any[] = Array.isArray(coursesData)
    ? coursesData
    : (coursesData as any)?.data ?? (coursesData as any)?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5 text-blue-400' /> Link Course to Path
          </DialogTitle>
          <DialogDescription>Select a course to add to this path</DialogDescription>
        </DialogHeader>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input placeholder='Search courses...' value={search}
            onChange={(e) => setSearch(e.target.value)} className='pl-9' autoFocus />
        </div>
        <ScrollArea className='h-80'>
          <div className='space-y-1.5 pr-2'>
            {isLoading && [1,2,3,4].map((i) => <Skeleton key={i} className='h-14 rounded-lg' />)}
            {!isLoading && courses.length === 0 && (
              <p className='py-10 text-center text-sm text-muted-foreground'>No courses found</p>
            )}
            {courses.map((course) => {
              const isLinked = currentCourseIds.has(course.id);
              return (
                <button key={course.id}
                  disabled={isLinked || attachMutation.isPending}
                  onClick={() => !isLinked && attachMutation.mutate(course.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                    isLinked ? 'cursor-default border-emerald-500/30 bg-emerald-500/5 opacity-70'
                    : 'cursor-pointer border-border/50 hover:border-blue-500/40 hover:bg-blue-500/5',
                  )}
                >
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
                    isLinked ? 'bg-emerald-500/15 ring-emerald-500/20' : 'bg-blue-500/15 ring-blue-500/20')}>
                    <BookOpen className={cn('h-4 w-4', isLinked ? 'text-emerald-400' : 'text-blue-400')} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{course.title}</p>
                    <div className='mt-0.5 flex flex-wrap items-center gap-2'>
                      <DiffBadge d={course.difficulty} />
                      {course.isPublished
                        ? <span className='text-[10px] text-emerald-400'>Live</span>
                        : <span className='text-[10px] text-amber-500/80'>Draft</span>}
                    </div>
                  </div>
                  {isLinked
                    ? <span className='shrink-0 text-xs font-semibold text-emerald-400'>✓ Added</span>
                    : <Plus className='h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100' />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── StandaloneCourseView ──────────────────────────────────────────────────────────
// Course tab: shows all courses in sidebar, click one => manage its labs on the right
function StandaloneCourseView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [linkLabCourseId, setLinkLabCourseId] = useState<string | null>(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses-map', search],
    queryFn:  () => coursesService.getAll({ search, limit: 100 }),
  });

  const courses: any[] = Array.isArray(coursesData)
    ? coursesData
    : (coursesData as any)?.data ?? (coursesData as any)?.items ?? [];

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const { data: fetchedLabs, isLoading: labsLoading, isFetching: labsFetching } = useQuery({
    queryKey: ['course-labs', selectedCourseId],
    queryFn:  () => coursesService.getCourseLabs(selectedCourseId!),
    enabled:  !!selectedCourseId,
  });

  const draggedLabId  = useRef<string | null>(null);
  const [labOrder, setLabOrder] = useState<CourseLabItem[] | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => { setLabOrder(null); }, [selectedCourseId]);

  const rawLabs = fetchedLabs ?? [];
  const displayLabs: CourseLabItem[] = labOrder ?? (Array.isArray(rawLabs) ? rawLabs : []);

  const detachMutation = useMutation({
    mutationFn: (labId: string) => coursesService.detachLab(selectedCourseId!, labId),
    onSuccess: () => {
      setLabOrder(null);
      queryClient.invalidateQueries({ queryKey: ['course-labs', selectedCourseId] });
      toast.success('Lab unlinked');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to unlink lab'),
  });

  const reorderMutation = useMutation({
    mutationFn: (labIds: string[]) => coursesService.reorderLabs(selectedCourseId!, labIds),
    onError: () => {
      setLabOrder(null);
      queryClient.invalidateQueries({ queryKey: ['course-labs', selectedCourseId] });
    },
  });

  const handleDragStart = (e: React.DragEvent, labId: string) => {
    draggedLabId.current = labId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', labId);
  };
  const handleDragOver = (e: React.DragEvent, labId: string) => {
    e.preventDefault();
    if (draggedLabId.current && draggedLabId.current !== labId) setDragOver(labId);
  };
  const handleDrop = (e: React.DragEvent, targetLabId: string) => {
    e.preventDefault(); setDragOver(null);
    const srcId = draggedLabId.current; draggedLabId.current = null;
    if (!srcId || srcId === targetLabId) return;
    const from = displayLabs.findIndex((l) => l.lab.id === srcId);
    const to   = displayLabs.findIndex((l) => l.lab.id === targetLabId);
    if (from < 0 || to < 0) return;
    const reordered = reorder(displayLabs, from, to).map((l, i) => ({ ...l, order: i }));
    setLabOrder(reordered);
    reorderMutation.mutate(reordered.map((l) => l.lab.id));
  };

  return (
    <div className='flex flex-1 overflow-hidden'>
      {/* Course list sidebar */}
      <aside className='flex w-60 shrink-0 flex-col border-r border-border/60 bg-muted/10 xl:w-68'>
        <div className='p-2.5'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search courses...'
              value={search} onChange={(e) => setSearch(e.target.value)}
              className='h-8 pl-8 text-xs'
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className='flex-1'>
          <div className='space-y-0.5 p-2'>
            {isLoading && [1,2,3,4,5].map((i) => <Skeleton key={i} className='h-14 rounded-lg' />)}
            {!isLoading && courses.length === 0 && (
              <p className='py-6 text-center text-xs text-muted-foreground'>No courses found</p>
            )}
            {courses.map((c: any) => (
              <button key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={cn(
                  'group w-full rounded-lg border px-3 py-2.5 text-left transition-all',
                  selectedCourseId === c.id
                    ? 'border-blue-500/40 bg-blue-500/10'
                    : 'border-transparent hover:border-border/50 hover:bg-muted/50',
                )}
              >
                <div className='flex items-start justify-between gap-2'>
                  <span className={cn('text-sm font-medium leading-snug', selectedCourseId === c.id ? 'text-blue-400' : '')}>{c.title}</span>
                  {c.isPublished ? <Globe className='mt-0.5 h-3 w-3 shrink-0 text-emerald-400' /> : <EyeOff className='mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/40' />}
                </div>
                <div className='mt-1 flex items-center gap-2 text-[10px] text-muted-foreground'>
                  <DiffBadge d={c.difficulty} />
                  {(c._count?.lessons ?? 0) > 0 && (
                    <span className='flex items-center gap-1'><Layers className='h-2.5 w-2.5' />{c._count?.lessons} lessons</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className='p-2.5'>
          <Link to={ROUTES.COURSES}>
            <Button variant='outline' size='sm' className='h-8 w-full gap-1.5 text-xs'>
              <Sparkles className='h-3.5 w-3.5' /> Manage Courses <ArrowRight className='ml-auto h-3.5 w-3.5' />
            </Button>
          </Link>
        </div>
      </aside>

      {/* Labs panel */}
      <main className='flex flex-1 flex-col overflow-hidden'>
        {!selectedCourseId && (
          <div className='flex flex-1 flex-col items-center justify-center gap-4'>
            <div className='flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-muted/30'>
              <BookOpen className='h-10 w-10 text-muted-foreground/30' />
            </div>
            <div className='text-center'>
              <p className='text-base font-semibold'>Select a Course</p>
              <p className='mt-1 text-sm text-muted-foreground'>Choose a course to manage its linked labs</p>
            </div>
          </div>
        )}

        {selectedCourseId && selectedCourse && (
          <>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-2.5'>
              <div className='flex items-center gap-3'>
                {labsFetching && <RefreshCw className='h-3.5 w-3.5 animate-spin text-muted-foreground' />}
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20'>
                  <BookOpen className='h-4 w-4 text-blue-400' />
                </div>
                <div>
                  <p className='text-sm font-semibold'>{selectedCourse.title}</p>
                  <p className='text-[11px] text-muted-foreground'>
                    {displayLabs.length} lab{displayLabs.length !== 1 ? 's' : ''} linked
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <Button
                  variant='outline' size='sm'
                  className='h-7 gap-1.5 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50'
                  onClick={() => setLinkLabCourseId(selectedCourseId)}
                >
                  <Plus className='h-3.5 w-3.5' /> Link Lab
                </Button>
                <Link to={ROUTES.COURSE_EDIT(selectedCourseId)}>
                  <Button variant='outline' size='sm' className='h-7 gap-1.5 text-xs'>
                    <ExternalLink className='h-3.5 w-3.5' /> Edit Course
                  </Button>
                </Link>
              </div>
            </div>

            <ScrollArea className='flex-1'>
              <div className='space-y-2 p-5'>
                {labsLoading && [1,2,3].map((i) => <Skeleton key={i} className='h-14 rounded-xl' />)}

                {!labsLoading && displayLabs.length === 0 && (
                  <div className='flex flex-col items-center justify-center gap-3 py-16'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30'>
                      <FlaskConical className='h-7 w-7 text-muted-foreground/30' />
                    </div>
                    <p className='text-sm font-medium text-muted-foreground'>No labs linked to this course</p>
                    <Button variant='outline' size='sm'
                      className='gap-1.5 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10'
                      onClick={() => setLinkLabCourseId(selectedCourseId)}>
                      <Plus className='h-3.5 w-3.5' /> Link Lab
                    </Button>
                  </div>
                )}

                <AnimatePresence>
                  {displayLabs.map(({ lab }, idx) => (
                    <motion.div
                      key={lab.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lab.id)}
                      onDragOver={(e)  => handleDragOver(e, lab.id)}
                      onDrop={(e)      => handleDrop(e, lab.id)}
                      onDragLeave={() => setDragOver(null)}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl border p-3 transition-all cursor-grab active:cursor-grabbing',
                        dragOver === lab.id
                          ? 'border-violet-500/60 bg-violet-500/5 shadow-lg scale-[1.01]'
                          : 'border-border/60 bg-card hover:border-border',
                      )}
                    >
                      <GripVertical className='h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/70' />
                      <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-400 ring-1 ring-violet-500/25'>
                        {idx + 1}
                      </span>
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20'>
                        <FlaskConical className='h-4 w-4 text-violet-400' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold'>{lab.title}</p>
                        <div className='mt-1 flex flex-wrap items-center gap-2'>
                          <DiffBadge d={lab.difficulty} />
                          {lab.isPublished
                            ? <span className='flex items-center gap-1 text-[10px] text-emerald-400'><span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />Live</span>
                            : <span className='flex items-center gap-1 text-[10px] text-amber-500/80'><span className='h-1.5 w-1.5 rounded-full bg-amber-500/60' />Draft</span>}
                        </div>
                      </div>
                      <div className='flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip><TooltipTrigger asChild>
                            <Link to={ROUTES.LAB_DETAIL(lab.id)}><Button variant='ghost' size='icon' className='h-7 w-7'><ExternalLink className='h-3.5 w-3.5' /></Button></Link>
                          </TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Link to={ROUTES.LAB_EDIT(lab.id)}><Button variant='ghost' size='icon' className='h-7 w-7'><Pencil className='h-3.5 w-3.5' /></Button></Link>
                          </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive hover:bg-destructive/10'
                              onClick={() => detachMutation.mutate(lab.id)}
                              disabled={detachMutation.isPending}>
                              <X className='h-3.5 w-3.5' />
                            </Button>
                          </TooltipTrigger><TooltipContent>Unlink</TooltipContent></Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </>
        )}
      </main>

      <LinkLabModal
        open={!!linkLabCourseId}
        courseId={linkLabCourseId}
        onClose={() => setLinkLabCourseId(null)}
      />
    </div>
  );
}

// ── StandaloneLabView ───────────────────────────────────────────────────────────────
function StandaloneLabView() {
  const [search, setSearch] = useState('');

  const { data: labsData, isLoading } = useQuery({
    queryKey: ['labs-standalone', search],
    queryFn:  () => labsService.getAll({ search, limit: 100 }),
  });

  const labs: any[] = Array.isArray(labsData) ? labsData : (labsData as any)?.data ?? (labsData as any)?.items ?? [];

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='border-b border-border/40 bg-muted/20 px-5 py-3'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-semibold'>All Labs</p>
            <p className='text-[11px] text-muted-foreground'>{labs.length} labs on the platform</p>
          </div>
          <Link to={ROUTES.LABS}>
            <Button variant='outline' size='sm' className='h-7 gap-1.5 text-xs'>
              <Sparkles className='h-3.5 w-3.5' /> Manage Labs <ArrowRight className='ml-auto h-3.5 w-3.5' />
            </Button>
          </Link>
        </div>
        <div className='relative mt-3'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search labs...'
            value={search} onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>
      <ScrollArea className='flex-1'>
        <div className='grid grid-cols-1 gap-2 p-5 sm:grid-cols-2 xl:grid-cols-3'>
          {isLoading && [1,2,3,4,5,6].map((i) => <Skeleton key={i} className='h-24 rounded-xl' />)}
          {!isLoading && labs.length === 0 && (
            <div className='col-span-3 flex flex-col items-center justify-center gap-3 py-16'>
              <FlaskConical className='h-10 w-10 text-muted-foreground/20' />
              <p className='text-sm text-muted-foreground'>No labs found</p>
            </div>
          )}
          {labs.map((lab) => (
            <div key={lab.id}
              className='flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20'>
                  <FlaskConical className='h-4 w-4 text-violet-400' />
                </div>
                <div className='flex items-center gap-1'>
                  {lab.isPublished ? <Globe className='h-3.5 w-3.5 text-emerald-400' /> : <EyeOff className='h-3.5 w-3.5 text-muted-foreground/40' />}
                </div>
              </div>
              <div>
                <p className='text-sm font-semibold leading-snug'>{lab.title}</p>
                <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                  <DiffBadge d={lab.difficulty} />
                  {(lab.xpReward ?? 0) > 0 && (
                    <span className='flex items-center gap-1 text-[10px] text-amber-400'><Zap className='h-2.5 w-2.5' />{lab.xpReward} XP</span>
                  )}
                  {(lab.estimatedTime ?? lab.duration ?? 0) > 0 && (
                    <span className='flex items-center gap-1 text-[10px] text-muted-foreground'><Clock className='h-2.5 w-2.5' />{lab.estimatedTime ?? lab.duration}m</span>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-1.5 pt-1 border-t border-border/40'>
                <Link to={ROUTES.LAB_DETAIL(lab.id)} className='flex-1'>
                  <Button variant='ghost' size='sm' className='h-7 w-full gap-1.5 text-xs'><ExternalLink className='h-3 w-3' />View</Button>
                </Link>
                <Link to={ROUTES.LAB_EDIT(lab.id)} className='flex-1'>
                  <Button variant='ghost' size='sm' className='h-7 w-full gap-1.5 text-xs'><Pencil className='h-3 w-3' />Edit</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── PathView (original path tab content) ──────────────────────────────────────────
function PathView() {
  const queryClient = useQueryClient();
  const [selectedPathId,    setSelectedPathId]    = useState<string | null>(null);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());
  const [pathSearch,        setPathSearch]         = useState('');
  const [linkLabCourseId,   setLinkLabCourseId]    = useState<string | null>(null);
  const [showLinkCourse,    setShowLinkCourse]     = useState(false);
  const draggedModuleId    = useRef<string | null>(null);
  const [dragOverModuleId, setDragOverModuleId]   = useState<string | null>(null);
  const [localModules,     setLocalModules]       = useState<PathModule[] | null>(null);

  const { data: pathsData, isLoading: pathsLoading } = useQuery({
    queryKey: ['paths-map'],
    queryFn:  () => pathsService.getAll({ limit: 100 }),
  });

  const { data: pathDetail, isLoading: pathLoading, isFetching: pathFetching } = useQuery({
    queryKey: ['path-map-detail', selectedPathId],
    queryFn:  () => pathsService.getById(selectedPathId!),
    enabled:  !!selectedPathId,
  } as any);

  useEffect(() => {
    if (pathDetail) {
      const mods = ((pathDetail as any).modules ?? [])
        .filter((m: PathModule) => m.type === 'COURSE' && !!m.course)
        .sort((a: PathModule, b: PathModule) => a.order - b.order);
      setLocalModules(mods);
    }
  }, [pathDetail]);

  const detachCourseMutation = useMutation({
    mutationFn: (moduleId: string) => {
      const mod = courseModules.find((m) => m.id === moduleId);
      if (!mod?.courseId) throw new Error('No courseId');
      return pathsService.detachCourse(selectedPathId!, mod.courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-map-detail', selectedPathId] });
      queryClient.invalidateQueries({ queryKey: ['paths-map'] });
      toast.success('Course removed from path');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to remove course'),
  });

  const reorderModulesMutation = useMutation({
    mutationFn: (orders: { id: string; order: number }[]) =>
      pathsService.reorderModules(selectedPathId!, orders),
    onError: () => {
      setLocalModules(null);
      queryClient.invalidateQueries({ queryKey: ['path-map-detail', selectedPathId] });
      toast.error('Failed to reorder');
    },
  });

  const paths: any[] = Array.isArray(pathsData)
    ? pathsData
    : (pathsData as any)?.data ?? (pathsData as any)?.items ?? [];

  const filteredPaths = paths.filter((p: any) =>
    p.title.toLowerCase().includes(pathSearch.toLowerCase()),
  );

  const courseModules: PathModule[] =
    localModules ??
    ((pathDetail as any)?.modules ?? [])
      .filter((m: PathModule) => m.type === 'COURSE' && !!m.course)
      .sort((a: PathModule, b: PathModule) => a.order - b.order);

  const currentCourseIds = new Set(courseModules.map((m) => m.courseId!).filter(Boolean));

  const toggleExpand = useCallback((courseId: string) => {
    setExpandedCourseIds((prev) => {
      const next = new Set(prev);
      next.has(courseId) ? next.delete(courseId) : next.add(courseId);
      return next;
    });
  }, []);

  const handleModuleDragStart = (e: React.DragEvent, moduleId: string) => {
    draggedModuleId.current = moduleId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', moduleId);
  };
  const handleModuleDragOver = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault();
    if (draggedModuleId.current && draggedModuleId.current !== moduleId) setDragOverModuleId(moduleId);
  };
  const handleModuleDrop = (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault(); setDragOverModuleId(null);
    const srcId = draggedModuleId.current; draggedModuleId.current = null;
    if (!srcId || srcId === targetModuleId) return;
    const from = courseModules.findIndex((m) => m.id === srcId);
    const to   = courseModules.findIndex((m) => m.id === targetModuleId);
    if (from < 0 || to < 0) return;
    const reordered = reorder(courseModules, from, to).map((m, i) => ({ ...m, order: i }));
    setLocalModules(reordered);
    reorderModulesMutation.mutate(reordered.map((m) => ({ id: m.id, order: m.order })));
  };

  const selectedPath = paths.find((p: any) => p.id === selectedPathId);

  return (
    <div className='flex flex-1 overflow-hidden'>
      {/* Path sidebar */}
      <aside className='flex w-60 shrink-0 flex-col border-r border-border/60 bg-muted/10 xl:w-68'>
        <div className='p-2.5'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search paths...'
              value={pathSearch} onChange={(e) => setPathSearch(e.target.value)}
              className='h-8 pl-8 text-xs'
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className='flex-1'>
          <div className='space-y-0.5 p-2'>
            {pathsLoading && [1,2,3,4,5].map((i) => <Skeleton key={i} className='h-14 rounded-lg' />)}
            {!pathsLoading && filteredPaths.length === 0 && (
              <p className='py-6 text-center text-xs text-muted-foreground'>No paths found</p>
            )}
            {filteredPaths.map((path: any) => (
              <button key={path.id}
                onClick={() => { setSelectedPathId(path.id); setLocalModules(null); setExpandedCourseIds(new Set()); }}
                className={cn(
                  'group w-full rounded-lg border px-3 py-2.5 text-left transition-all',
                  selectedPathId === path.id ? 'border-blue-500/40 bg-blue-500/10' : 'border-transparent hover:border-border/50 hover:bg-muted/50',
                )}
              >
                <div className='flex items-start justify-between gap-2'>
                  <span className={cn('text-sm font-medium leading-snug', selectedPathId === path.id ? 'text-blue-400' : '')}>{path.title}</span>
                  {path.isPublished ? <Globe className='mt-0.5 h-3 w-3 shrink-0 text-emerald-400' /> : <EyeOff className='mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/40' />}
                </div>
                <div className='mt-1 flex items-center gap-2 text-[10px] text-muted-foreground'>
                  <span className='flex items-center gap-1'><BookOpen className='h-2.5 w-2.5' />{path.totalCourses ?? path._count?.modules ?? 0} courses</span>
                  <span className='flex items-center gap-1'><FlaskConical className='h-2.5 w-2.5' />{path.totalLabs ?? 0} labs</span>
                  {(path.estimatedHours ?? 0) > 0 && <span className='flex items-center gap-1'><Clock className='h-2.5 w-2.5' />{path.estimatedHours}h</span>}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className='p-2.5'>
          <Link to={ROUTES.PATHS}>
            <Button variant='outline' size='sm' className='h-8 w-full gap-1.5 text-xs'>
              <Sparkles className='h-3.5 w-3.5' /> Manage Paths <ArrowRight className='ml-auto h-3.5 w-3.5' />
            </Button>
          </Link>
        </div>
      </aside>

      {/* Path main content */}
      <main className='flex flex-1 flex-col overflow-hidden'>
        {!selectedPathId && (
          <div className='flex flex-1 flex-col items-center justify-center gap-4'>
            <div className='flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-muted/30'>
              <Route className='h-10 w-10 text-muted-foreground/30' />
            </div>
            <div className='text-center'>
              <p className='text-base font-semibold'>Select a Learning Path</p>
              <p className='mt-1 text-sm text-muted-foreground'>Choose a path to manage its courses and labs</p>
            </div>
          </div>
        )}

        {selectedPathId && (
          <>
            <div className='flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-2.5'>
              <div className='flex items-center gap-3'>
                {pathFetching && <RefreshCw className='h-3.5 w-3.5 animate-spin text-muted-foreground' />}
                <div>
                  <p className='text-sm font-semibold'>{selectedPath?.title}</p>
                  <p className='text-[11px] text-muted-foreground'>
                    {courseModules.length} course{courseModules.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <Button variant='ghost' size='sm' className='h-7 gap-1.5 text-xs'
                  onClick={() => setExpandedCourseIds(new Set(courseModules.map((m) => m.course!.id)))}
                  disabled={courseModules.length === 0}>
                  <ChevronDown className='h-3.5 w-3.5' /> Expand All
                </Button>
                <Button variant='ghost' size='sm' className='h-7 gap-1.5 text-xs'
                  onClick={() => setExpandedCourseIds(new Set())}
                  disabled={expandedCourseIds.size === 0}>
                  Collapse All
                </Button>
                <Button variant='outline' size='sm'
                  className='h-7 gap-1.5 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50'
                  onClick={() => setShowLinkCourse(true)}>
                  <Plus className='h-3.5 w-3.5' /> Add Course
                </Button>
                <Link to={ROUTES.PATH_DETAIL(selectedPathId)}>
                  <Button variant='outline' size='sm' className='h-7 gap-1.5 text-xs'>
                    <ExternalLink className='h-3.5 w-3.5' /> View Path
                  </Button>
                </Link>
              </div>
            </div>

            <ScrollArea className='flex-1'>
              <div className='space-y-2.5 p-5'>
                {pathLoading && [1,2,3].map((i) => <Skeleton key={i} className='h-20 w-full rounded-xl' />)}
                {!pathLoading && courseModules.length === 0 && (
                  <div className='flex flex-col items-center justify-center gap-3 py-16'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30'>
                      <BookOpen className='h-7 w-7 text-muted-foreground/30' />
                    </div>
                    <p className='text-sm font-medium text-muted-foreground'>No courses in this path yet</p>
                    <Button variant='outline' size='sm' className='gap-1.5 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                      onClick={() => setShowLinkCourse(true)}>
                      <Plus className='h-3.5 w-3.5' /> Add Course
                    </Button>
                  </div>
                )}
                <AnimatePresence>
                  {courseModules.map((module, index) => (
                    <CourseModuleCard
                      key={module.id} module={module} index={index}
                      isExpanded={expandedCourseIds.has(module.course!.id)}
                      isDragOver={dragOverModuleId === module.id}
                      onToggle={() => toggleExpand(module.course!.id)}
                      onLinkLab={setLinkLabCourseId}
                      onDetachCourse={(moduleId) => detachCourseMutation.mutate(moduleId)}
                      onDragStart={(e) => handleModuleDragStart(e, module.id)}
                      onDragOver={(e)  => handleModuleDragOver(e, module.id)}
                      onDrop={(e)      => handleModuleDrop(e, module.id)}
                      onDragLeave={() => setDragOverModuleId(null)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </>
        )}
      </main>

      <LinkLabModal
        open={!!linkLabCourseId}
        courseId={linkLabCourseId}
        onClose={() => setLinkLabCourseId(null)}
      />
      <LinkCourseModal
        open={showLinkCourse}
        pathId={selectedPathId}
        currentCourseIds={currentCourseIds}
        onClose={() => setShowLinkCourse(false)}
      />
    </div>
  );
}

// ── ContentMapPage (shell with tabs) ──────────────────────────────────────────────
export default function ContentMapPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('path');

  const TABS: { key: SidebarTab; label: string; icon: React.ElementType; color: string; activeColor: string }[] = [
    { key: 'path',   label: 'Path',   icon: Route,        color: 'text-muted-foreground', activeColor: 'text-blue-400   border-blue-500/50   bg-blue-500/10' },
    { key: 'course', label: 'Course', icon: BookOpen,      color: 'text-muted-foreground', activeColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' },
    { key: 'lab',    label: 'Lab',    icon: FlaskRound,    color: 'text-muted-foreground', activeColor: 'text-violet-400  border-violet-500/50  bg-violet-500/10' },
  ];

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col overflow-hidden'>
      {/* ── Global Header ── */}
      <div className='flex items-center justify-between border-b border-border/60 bg-background px-5 py-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-border/60'>
            <Map className='h-4.5 w-4.5 text-blue-400' />
          </div>
          <div>
            <h1 className='text-base font-bold leading-none tracking-tight'>Content Map</h1>
            <p className='mt-0.5 text-xs text-muted-foreground'>Manage relationships between paths, courses & labs</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className='flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1'>
          {TABS.map(({ key, label, icon: Icon, activeColor }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                activeTab === key
                  ? activeColor
                  : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className='h-3.5 w-3.5' />
              {label}
            </button>
          ))}
        </div>

        <div className='hidden items-center gap-4 text-[11px] text-muted-foreground md:flex'>
          <span className='flex items-center gap-1.5'><span className='h-2 w-2 rounded-full bg-blue-500' /> Course</span>
          <span className='flex items-center gap-1.5'><span className='h-2 w-2 rounded-full bg-violet-500' /> Lab</span>
          <span className='flex items-center gap-1.5'><GripVertical className='h-3 w-3' /> Drag to reorder</span>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className='flex flex-1 overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className='flex flex-1 overflow-hidden'
          >
            {activeTab === 'path'   && <PathView />}
            {activeTab === 'course' && <StandaloneCourseView />}
            {activeTab === 'lab'    && <StandaloneLabView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
