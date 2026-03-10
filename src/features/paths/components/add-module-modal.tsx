import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  BookOpen,
  FlaskConical,
  Plus,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { coursesService, labsService } from '@/core/api/services';
import type {
  CourseListItem,
  LabListItem,
  Difficulty,
  CreateCourseRequest,
} from '@/core/types/api.types';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

export interface NewModule {
  title: string;
  type: 'COURSE' | 'LAB';
  courseId?: string;
  labId?: string;
  estimatedHours: number;
  isLocked: boolean;
}

interface Props {
  existingCourseIds: string[];
  existingLabIds: string[];
  onClose: () => void;
  onAdd: (modules: NewModule[]) => void;
  isSubmitting?: boolean;
}

// ── Inline Create Course Form ─────────────────────────────────────────────────

function CreateCourseInlineForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (course: CourseListItem) => void;
}) {
  const [title, setTitle] = useState('');
  const [arTitle, setArTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('BEGINNER');
  const qc = useQueryClient();

  const generateSlug = (t: string) =>
    t
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const createMutation = useMutation({
    mutationFn: (data: CreateCourseRequest) =>
      coursesService.create(data as unknown as Record<string, unknown>),
    onSuccess: (course) => {
      qc.invalidateQueries({ queryKey: ['courses', 'list'] });
      toast.success('Course created successfully!');
      onCreated(course as CourseListItem);
    },
    onError: () => toast.error('Failed to create course'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      ar_title: arTitle.trim() || undefined,
      slug: slug.trim(),
      difficulty,
      instructorId: '',
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-semibold text-primary'>Create New Course</p>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={onCancel}>
          <X className='h-3 w-3' />
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs'>
            Title (EN) <span className='text-destructive'>*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(generateSlug(e.target.value));
            }}
            placeholder='Web Security Basics'
            className='h-8 text-sm'
            required
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Title (AR)</Label>
          <Input
            value={arTitle}
            onChange={(e) => setArTitle(e.target.value)}
            placeholder='أساسيات أمن الويب'
            className='h-8 text-sm'
            dir='rtl'
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs'>
            Slug <span className='text-destructive'>*</span>
          </Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className='h-8 font-mono text-sm'
            placeholder='web-security-basics'
            required
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}>
            <SelectTrigger className='h-8 text-sm'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                [
                  'BEGINNER',
                  'INTERMEDIATE',
                  'ADVANCED',
                  'EXPERT',
                ] as Difficulty[]
              ).map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' size='sm' disabled={createMutation.isPending}>
          {createMutation.isPending && (
            <Loader2 className='mr-2 h-3 w-3 animate-spin' />
          )}
          Create & Select
        </Button>
      </div>
    </form>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function AddModuleModal({
  existingCourseIds,
  existingLabIds,
  onClose,
  onAdd,
  isSubmitting = false,
}: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<NewModule[]>([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'list', 'picker', search],
    queryFn: () =>
      coursesService.getAll({ search: search || undefined, limit: 100 }),
  });

  const { data: labsData, isLoading: labsLoading } = useQuery({
    queryKey: ['labs', 'list', 'picker', search],
    queryFn: () =>
      labsService.getAll({ search: search || undefined, limit: 100 }),
  });

  const courses: CourseListItem[] = coursesData?.data ?? [];
  const labs: LabListItem[] = labsData?.data ?? [];

  const isCourseSelected = (id: string) =>
    selected.some((s) => s.courseId === id);
  const isLabSelected = (id: string) => selected.some((s) => s.labId === id);

  const toggleCourse = (course: CourseListItem) => {
    if (isCourseSelected(course.id)) {
      setSelected((prev) => prev.filter((s) => s.courseId !== course.id));
    } else {
      setSelected((prev) => [
        ...prev,
        {
          title: course.title,
          type: 'COURSE',
          courseId: course.id,
          estimatedHours: course._count?.lessons ?? 0,
          isLocked: false,
        },
      ]);
    }
  };

  const toggleLab = (lab: LabListItem) => {
    if (isLabSelected(lab.id)) {
      setSelected((prev) => prev.filter((s) => s.labId !== lab.id));
    } else {
      setSelected((prev) => [
        ...prev,
        {
          title: lab.title,
          type: 'LAB',
          labId: lab.id,
          estimatedHours: 0,
          isLocked: false,
        },
      ]);
    }
  };

  const onCourseCreated = (course: CourseListItem) => {
    setSelected((prev) => [
      ...prev,
      {
        title: course.title,
        type: 'COURSE',
        courseId: course.id,
        estimatedHours: 0,
        isLocked: false,
      },
    ]);
    setShowCreateCourse(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='flex max-h-[85vh] max-w-3xl flex-col gap-0 p-0'>
        {/* ── Header ── */}
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle>Add Modules to Path</DialogTitle>
        </DialogHeader>

        {/* ── Search ── */}
        <div className='border-b px-6 py-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search courses or labs...'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs
          defaultValue='courses'
          className='flex flex-1 flex-col overflow-hidden'>
          <TabsList className='mx-6 mt-3 grid w-auto grid-cols-2 self-start'>
            <TabsTrigger value='courses' className='gap-2'>
              <BookOpen className='h-4 w-4' />
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value='labs' className='gap-2'>
              <FlaskConical className='h-4 w-4' />
              Labs ({labs.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Courses Tab ── */}
          <TabsContent
            value='courses'
            className='mt-0 flex-1 space-y-2 overflow-y-auto px-6 py-3'>
            {!showCreateCourse && (
              <button
                type='button'
                onClick={() => setShowCreateCourse(true)}
                className='flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 p-3 text-left transition-colors hover:border-primary/60 hover:bg-primary/5'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                  <Plus className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <p className='text-sm font-medium text-primary'>
                    Create New Course
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Create a course and add it to this path immediately
                  </p>
                </div>
              </button>
            )}

            {showCreateCourse && (
              <CreateCourseInlineForm
                onCancel={() => setShowCreateCourse(false)}
                onCreated={onCourseCreated}
              />
            )}

            {coursesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-16 rounded-xl' />
              ))
            ) : courses.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                <BookOpen className='mb-2 h-8 w-8' />
                <p className='text-sm'>No courses found</p>
              </div>
            ) : (
              courses.map((course) => {
                const isAlreadyAdded = existingCourseIds.includes(course.id);
                const isSelected = isCourseSelected(course.id);

                return (
                  <button
                    key={course.id}
                    type='button'
                    disabled={isAlreadyAdded}
                    onClick={() => !isAlreadyAdded && toggleCourse(course)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      isAlreadyAdded
                        ? 'cursor-not-allowed bg-muted/50 opacity-50'
                        : isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'hover:bg-accent/40',
                    )}>
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        className='h-10 w-10 shrink-0 rounded-lg object-cover'
                        alt=''
                      />
                    ) : (
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10'>
                        <BookOpen className='h-5 w-5 text-blue-600' />
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {course.title}
                      </p>
                      {course.ar_title && (
                        <p
                          className='truncate text-xs text-muted-foreground'
                          dir='rtl'>
                          {course.ar_title}
                        </p>
                      )}
                      <div className='mt-0.5 flex flex-wrap items-center gap-1.5'>
                        <Badge variant='outline' className='py-0 text-xs'>
                          {course.difficulty}
                        </Badge>
                        <Badge
                          variant={course.isPublished ? 'default' : 'secondary'}
                          className='py-0 text-xs'>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    {isAlreadyAdded && (
                      <span className='shrink-0 text-xs text-muted-foreground'>
                        Already in path
                      </span>
                    )}
                    {isSelected && !isAlreadyAdded && (
                      <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary'>
                        <Check className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </TabsContent>

          {/* ── Labs Tab ── */}
          <TabsContent
            value='labs'
            className='mt-0 flex-1 space-y-2 overflow-y-auto px-6 py-3'>
            {labsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-16 rounded-xl' />
              ))
            ) : labs.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                <FlaskConical className='mb-2 h-8 w-8' />
                <p className='text-sm'>No labs found</p>
              </div>
            ) : (
              labs.map((lab) => {
                const isAlreadyAdded = existingLabIds.includes(lab.id);
                const isSelected = isLabSelected(lab.id);

                return (
                  <button
                    key={lab.id}
                    type='button'
                    disabled={isAlreadyAdded}
                    onClick={() => !isAlreadyAdded && toggleLab(lab)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      isAlreadyAdded
                        ? 'cursor-not-allowed bg-muted/50 opacity-50'
                        : isSelected
                          ? 'border-purple-500 bg-purple-500/5 shadow-sm'
                          : 'hover:bg-accent/40',
                    )}>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10'>
                      <FlaskConical className='h-5 w-5 text-purple-600' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {lab.title}
                      </p>
                      <div className='mt-0.5 flex flex-wrap items-center gap-1.5'>
                        <Badge variant='outline' className='py-0 text-xs'>
                          {lab.difficulty}
                        </Badge>
                        <Badge variant='secondary' className='py-0 text-xs'>
                          {lab.category}
                        </Badge>
                        <Badge
                          variant={lab.isPublished ? 'default' : 'secondary'}
                          className='py-0 text-xs'>
                          {lab.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    {isAlreadyAdded && (
                      <span className='shrink-0 text-xs text-muted-foreground'>
                        Already in path
                      </span>
                    )}
                    {isSelected && !isAlreadyAdded && (
                      <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500'>
                        <Check className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* ── Footer ── */}
        <DialogFooter className='border-t px-6 py-4'>
          <div className='flex w-full items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {selected.length > 0 ? (
                <span className='font-medium text-foreground'>
                  {selected.length} module(s) selected
                </span>
              ) : (
                'Select courses or labs to add'
              )}
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                disabled={selected.length === 0 || isSubmitting}
                onClick={() => onAdd(selected)}>
                {isSubmitting && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Add{selected.length > 0 ? ` (${selected.length})` : ''}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
