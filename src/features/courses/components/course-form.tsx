import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { coursesService, usersService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  X,
  Clock,
  Star,
  Sparkles,
  Languages,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';
import type { CreateCourseRequest } from '@/core/types';

// ─── Preview Component (matches SharedCourseCard design) ────────────────────
const COLOR_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue: 'from-blue-950    to-blue-900    border-blue-800/50',
  violet: 'from-violet-950  to-violet-900  border-violet-800/50',
  orange: 'from-orange-950  to-orange-900  border-orange-800/50',
  rose: 'from-rose-950    to-rose-900    border-rose-800/50',
  cyan: 'from-cyan-950    to-cyan-900    border-cyan-800/50',
};
const COLOR_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  orange: 'text-orange-400',
  rose: 'text-rose-400',
  cyan: 'text-cyan-400',
};
const DIFF_COLORS: Record<string, string> = {
  BEGINNER: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  INTERMEDIATE: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  ADVANCED: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  EXPERT: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
};
const ACCESS_COLORS: Record<string, string> = {
  FREE: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  PREMIUM: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
};

function CoursePreview({ data }: { data: Partial<CreateCourseRequest> }) {
  const color = (data.color as string) ?? 'blue';
  const hasThumbnail = !!data.thumbnail;

  return (
    <div className='sticky top-4'>
      <p className='mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
        Live Preview
      </p>

      <div className='overflow-hidden rounded-2xl border bg-card shadow-xl'>
        {/* Thumbnail */}
        <div className='relative aspect-video overflow-hidden bg-muted'>
          {hasThumbnail ? (
            <img
              src={data.thumbnail}
              alt={data.title ?? 'Course'}
              className='h-full w-full object-cover'
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center bg-gradient-to-br border',
                COLOR_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
              )}
            >
              <p
                className={cn(
                  'px-4 text-center font-black leading-tight text-lg',
                  COLOR_TEXT[color] ?? 'text-zinc-400',
                )}
              >
                {data.title || 'Course Title'}
              </p>
            </div>
          )}
          <div className='absolute left-3 top-3'>
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md'>
              <span className='h-1.5 w-1.5 rounded-full bg-white' />
              Available
            </span>
          </div>
        </div>

        {/* Body */}
        <div className='flex flex-col gap-3 p-4'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='line-clamp-2 flex-1 text-sm font-bold leading-snug'>
              {data.ar_title || data.title || (
                <span className='italic text-muted-foreground'>
                  Course Title
                </span>
              )}
            </h3>
            {data.category && (
              <span className='shrink-0 text-[11px] text-muted-foreground'>
                {data.category}
              </span>
            )}
          </div>

          {data.description && (
            <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
              {data.description}
            </p>
          )}

          <div className='flex flex-wrap items-center gap-1.5'>
            {data.difficulty && (
              <Badge
                variant='outline'
                className={cn(
                  'gap-1 text-[10px] font-semibold',
                  DIFF_COLORS[data.difficulty as string],
                )}
              >
                {data.difficulty}
              </Badge>
            )}
            {data.access && (
              <Badge
                variant='outline'
                className={cn(
                  'gap-1 text-[10px] font-bold',
                  ACCESS_COLORS[data.access as string],
                )}
              >
                {data.access}
              </Badge>
            )}
            {Number(data.duration ?? 0) > 0 && (
              <Badge
                variant='outline'
                className='gap-1 text-[10px] text-muted-foreground border-border/40'
              >
                <Clock className='h-3 w-3' />
                {data.duration}h
              </Badge>
            )}
            {data.isFeatured && (
              <Badge
                variant='outline'
                className='gap-1 text-[10px] text-amber-400 border-amber-500/40 bg-amber-500/10'
              >
                <Star className='h-3 w-3' />
                Featured
              </Badge>
            )}
            {data.isNew && (
              <Badge
                variant='outline'
                className='gap-1 text-[10px] text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
              >
                <Sparkles className='h-3 w-3' />
                New
              </Badge>
            )}
          </div>

          {(data.tags ?? []).length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {(data.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className='rounded-md border border-border/40 bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className='mt-auto pt-1'>
            <Button size='sm' className='h-9 w-full text-xs' disabled>
              Start Learning
            </Button>
          </div>
        </div>
      </div>

      {data.ar_title && (
        <div className='mt-3 overflow-hidden rounded-xl border bg-card p-3'>
          <p className='mb-1 text-[11px] text-muted-foreground'>Arabic version</p>
          <p className='text-right text-sm font-bold' dir='rtl'>
            {data.ar_title}
          </p>
          {data.ar_description && (
            <p
              className='mt-1 line-clamp-2 text-right text-xs text-muted-foreground'
              dir='rtl'
            >
              {data.ar_description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TagInput Component ────────────────────────────────────────────────
function TagInput({
  value = [],
  onChange,
  placeholder,
}: {
  value?: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput('');
  };
  return (
    <div className='flex min-h-[42px] flex-wrap gap-1.5 rounded-md border bg-background p-2'>
      {value.map((tag) => (
        <span
          key={tag}
          className='flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-foreground'
        >
          {tag}
          <button
            type='button'
            onClick={() => onChange(value.filter((t) => t !== tag))}
          >
            <X className='h-3 w-3' />
          </button>
        </span>
      ))}
      <input
        className='min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        placeholder={value.length === 0 ? placeholder : '+ Add...'}
      />
    </div>
  );
}

// ─── Main CourseForm ─────────────────────────────────────────────────────
interface CourseFormProps {
  mode?: 'create' | 'edit';
  courseId?: string;
  initialData?: Partial<CreateCourseRequest>;
}

export function CourseForm({
  mode = 'create',
  courseId,
  initialData,
}: CourseFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateCourseRequest>({
    defaultValues: {
      difficulty: 'BEGINNER',
      access: 'FREE',
      color: 'blue',
      contentType: 'MIXED',
      isNew: false,
      isFeatured: false,
      tags: [],
      topics: [],
      skills: [],
      prerequisites: [],
      ...initialData,
    },
  });

  const { data: courseDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => coursesService.getById(courseId!),
    enabled: mode === 'edit' && !!courseId,
  });

  useEffect(() => {
    if (courseDetail) reset(courseDetail as unknown as CreateCourseRequest);
  }, [courseDetail, reset]);

  const { data: usersData } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => usersService.getAll({ limit: 100 }),
  });

  const watched = watch();

  useEffect(() => {
    if (mode === 'create' && watched.title) {
      const slug = watched.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug);
    }
  }, [watched.title, mode, setValue]);

  const createMutation = useMutation({
    mutationFn: coursesService.create,
    onSuccess: (data) => {
      toast.success('Course created successfully');
      navigate(ROUTES.COURSE_DETAIL(data.id));
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Failed to create course'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCourseRequest>) =>
      coursesService.update(courseId!, data),
    onSuccess: () => {
      toast.success('Course updated successfully');
      navigate(ROUTES.COURSE_DETAIL(courseId!));
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Failed to update course'),
  });

  const onSubmit = (data: CreateCourseRequest) => {
    setError('');
    if (mode === 'create') createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (mode === 'edit' && isLoadingDetail) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]'>
      {/* ── Form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='basic'>Basic</TabsTrigger>
            <TabsTrigger value='arabic' className='gap-1.5'>
              <Languages className='h-3.5 w-3.5' />
              Arabic
            </TabsTrigger>
            <TabsTrigger value='meta'>Metadata</TabsTrigger>
            <TabsTrigger value='advanced'>Advanced</TabsTrigger>
          </TabsList>

          {/* ── TAB: Basic ─────────────────────────────── */}
          <TabsContent value='basic' className='mt-4 space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Instructor */}
                <div className='space-y-2'>
                  <Label>
                    Instructor <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    name='instructorId'
                    control={control}
                    rules={{ required: 'Instructor is required' }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select instructor...' />
                        </SelectTrigger>
                        <SelectContent>
                          {usersData?.data?.map((u: any) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.instructorId && (
                    <p className='text-sm text-destructive'>
                      {errors.instructorId.message}
                    </p>
                  )}
                </div>

                {/* Title + Slug */}
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>
                      Title <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      {...register('title', { required: 'Title is required' })}
                      placeholder='Introduction to Web Security'
                    />
                    {errors.title && (
                      <p className='text-sm text-destructive'>
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      Slug <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      {...register('slug', {
                        required: 'Slug is required',
                        pattern: {
                          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                          message: 'Lowercase letters, numbers, hyphens only',
                        },
                      })}
                      placeholder='intro-to-web-security'
                    />
                    {errors.slug && (
                      <p className='text-sm text-destructive'>
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <Label>Short Description</Label>
                  <Textarea
                    {...register('description')}
                    placeholder='Brief course description...'
                    rows={3}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Long Description</Label>
                  <Textarea
                    {...register('longDescription')}
                    placeholder='Detailed course description...'
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-3'>
                {/* Difficulty */}
                <div className='space-y-2'>
                  <Label>Difficulty</Label>
                  <Controller
                    name='difficulty'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='BEGINNER'>Beginner</SelectItem>
                          <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
                          <SelectItem value='ADVANCED'>Advanced</SelectItem>
                          <SelectItem value='EXPERT'>Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Access */}
                <div className='space-y-2'>
                  <Label>Access</Label>
                  <Controller
                    name='access'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='FREE'>Free</SelectItem>
                          <SelectItem value='PREMIUM'>Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* ContentType */}
                <div className='space-y-2'>
                  <Label>Content Type</Label>
                  <Controller
                    name='contentType'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='PRACTICAL'>Practical</SelectItem>
                          <SelectItem value='THEORETICAL'>Theoretical</SelectItem>
                          <SelectItem value='MIXED'>Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Category */}
                <div className='space-y-2'>
                  <Label>Category</Label>
                  <Controller
                    name='category'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='WEB'>Web Security</SelectItem>
                          <SelectItem value='NETWORK'>Network</SelectItem>
                          <SelectItem value='FORENSICS'>Forensics</SelectItem>
                          <SelectItem value='CRYPTOGRAPHY'>Cryptography</SelectItem>
                          <SelectItem value='REVERSE_ENGINEERING'>Reverse Engineering</SelectItem>
                          <SelectItem value='OSINT'>OSINT</SelectItem>
                          <SelectItem value='MALWARE_ANALYSIS'>Malware Analysis</SelectItem>
                          <SelectItem value='GENERAL'>General</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Color */}
                <div className='space-y-2'>
                  <Label>Card Color</Label>
                  <Controller
                    name='color'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? 'blue'}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'blue',
                            'emerald',
                            'violet',
                            'orange',
                            'rose',
                            'cyan',
                          ].map((c) => (
                            <SelectItem key={c} value={c}>
                              <span className='flex items-center gap-2 capitalize'>
                                <span
                                  className={cn(
                                    'h-3 w-3 rounded-full',
                                    `bg-${c}-500`,
                                  )}
                                />
                                {c}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* State */}
                <div className='space-y-2'>
                  <Label>State</Label>
                  <Controller
                    name='state'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? 'DRAFT'}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='DRAFT'>Draft</SelectItem>
                          <SelectItem value='PUBLISHED'>Published</SelectItem>
                          <SelectItem value='COMING_SOON'>Coming Soon</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Thumbnail URL</Label>
                  <Input
                    {...register('thumbnail')}
                    placeholder='https://...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Background Image URL</Label>
                  <Input
                    {...register('backgroundImage')}
                    placeholder='https://...'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metrics</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label>Price ($)</Label>
                  <Input
                    type='number'
                    {...register('price', { valueAsNumber: true, min: 0 })}
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Duration (hours)</Label>
                  <Input
                    type='number'
                    {...register('duration', { min: 1 })}
                    placeholder='10'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Estimated Hours</Label>
                  <Input
                    type='number'
                    {...register('estimatedHours', {
                      valueAsNumber: true,
                      min: 1,
                    })}
                    placeholder='5'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags &amp; Skills</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Tags</Label>
                  <Controller
                    name='tags'
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder='Add tag + Enter'
                      />
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Skills</Label>
                  <Controller
                    name='skills'
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder='Add skill...'
                      />
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Topics</Label>
                  <Controller
                    name='topics'
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder='Add topic...'
                      />
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Prerequisites</Label>
                  <Controller
                    name='prerequisites'
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder='Add prerequisite...'
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flags</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-2'>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div>
                    <Label className='font-semibold'>Featured Course</Label>
                    <p className='text-xs text-muted-foreground'>
                      Show in featured section
                    </p>
                  </div>
                  <Controller
                    name='isFeatured'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div>
                    <Label className='font-semibold'>Mark as New</Label>
                    <p className='text-xs text-muted-foreground'>
                      Show badge on card
                    </p>
                  </div>
                  <Controller
                    name='isNew'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Arabic ───────────────────────────── */}
          <TabsContent value='arabic' className='mt-4 space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Languages className='h-5 w-5' />
                  Arabic Content
                  <Badge variant='outline' className='text-xs'>
                    RTL
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4' dir='rtl'>
                <div className='space-y-2'>
                  <Label>العنوان بالعربية</Label>
                  <Input
                    {...register('ar_title')}
                    placeholder='أمان تطبيقات الويب'
                    className='text-right'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>الوصف المختصر</Label>
                  <Textarea
                    {...register('ar_description')}
                    placeholder='وصف مختصر للكورس...'
                    rows={3}
                    className='text-right'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>الوصف التفصيلي</Label>
                  <Textarea
                    {...register('ar_longDescription')}
                    placeholder='وصف تفصيلي...'
                    rows={5}
                    className='text-right'
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Metadata ─────────────────────────── */}
          <TabsContent value='meta' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Raw Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='max-h-64 overflow-auto rounded-lg bg-muted/50 p-4 text-xs text-foreground'>
                  {JSON.stringify(watched, null, 2)}
                </pre>
                <p className='mt-2 text-xs text-muted-foreground'>
                  This is the exact payload that will be sent to the backend on save.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Advanced ────────────────────────── */}
          <TabsContent value='advanced' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Publishing is controlled separately from saving. After{' '}
                    {mode === 'create' ? 'creating' : 'updating'} the course,
                    use the <strong>Publish</strong> button on the course detail
                    page.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='flex justify-end gap-2 pb-8'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate(ROUTES.COURSES)}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {mode === 'create' ? 'Create Course' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* ── Live Preview ───────────────────────────── */}
      <div className='hidden xl:block'>
        <CoursePreview data={watched} />
      </div>
    </div>
  );
}
