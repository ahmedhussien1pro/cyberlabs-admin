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
import { Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';
import type { CreateCourseRequest } from '@/core/types';

// ─── Preview Component (بنفس تصميم SharedCourseCard) ──────────────────────
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
  INTERMEDIATE: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  ADVANCED: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
};
const ACCESS_COLORS: Record<string, string> = {
  FREE: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  PRO: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  PREMIUM: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
};

function CoursePreview({ data }: { data: Partial<CreateCourseRequest> }) {
  const color = (data.color as string) ?? 'blue';
  const hasThumbnail = !!data.thumbnail;

  return (
    <div className='sticky top-4'>
      <p className='text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider'>
        Live Preview — كما تظهر في المنصة
      </p>

      {/* ── Full Card Preview ─────────────────────────── */}
      <div
        className={cn(
          'rounded-2xl border bg-card overflow-hidden shadow-xl ring-1 ring-transparent',
          'transition-all duration-300',
        )}>
        {/* Thumbnail */}
        <div className='relative aspect-video overflow-hidden bg-muted'>
          {hasThumbnail ? (
            <img
              src={data.thumbnail}
              alt={data.title ?? 'Course'}
              className='w-full h-full object-cover'
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className={cn(
                'w-full h-full flex items-center justify-center bg-gradient-to-br border',
                COLOR_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
              )}>
              <p
                className={cn(
                  'font-black text-center px-3 leading-tight text-lg',
                  COLOR_TEXT[color] ?? 'text-zinc-400',
                )}>
                {data.title || 'Course Title'}
              </p>
            </div>
          )}
          {/* Available badge */}
          <div className='absolute top-3 start-3'>
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md'>
              <span className='h-1.5 w-1.5 rounded-full bg-white' /> Available
            </span>
          </div>
        </div>

        {/* Body */}
        <div className='flex flex-col p-4 gap-3'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1'>
              {data.ar_title || data.title || (
                <span className='text-muted-foreground italic'>
                  العنوان بالعربي / Title
                </span>
              )}
            </h3>
            {data.category && (
              <span className='text-[11px] text-muted-foreground shrink-0'>
                {data.category}
              </span>
            )}
          </div>

          {data.description && (
            <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
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
                )}>
                {data.difficulty}
              </Badge>
            )}
            {data.access && (
              <Badge
                variant='outline'
                className={cn(
                  'gap-1 text-[10px] font-bold',
                  ACCESS_COLORS[data.access as string],
                )}>
                {data.access}
              </Badge>
            )}
            {/* ✅ Fix #1: cast to Number to avoid string|number > number TS error */}
            {Number(data.duration ?? 0) > 0 && (
              <Badge
                variant='outline'
                className='text-[10px] text-muted-foreground border-border/40'>
                ⏱ {data.duration}h
              </Badge>
            )}
            {data.isFeatured && (
              <Badge
                variant='outline'
                className='text-[10px] text-yellow-400 border-yellow-500/40 bg-yellow-500/10'>
                ⭐ Featured
              </Badge>
            )}
            {data.isNew && (
              <Badge
                variant='outline'
                className='text-[10px] text-cyan-400 border-cyan-500/40 bg-cyan-500/10'>
                ✨ New
              </Badge>
            )}
          </div>

          {/* Tags */}
          {(data.tags ?? []).length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {(data.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className='text-[10px] bg-muted/60 text-muted-foreground rounded-md px-1.5 py-0.5 border border-border/40'>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className='flex gap-2 mt-auto pt-1'>
            <Button size='sm' className='flex-1 h-9 text-xs' disabled>
              Start Learning →
            </Button>
          </div>
        </div>
      </div>

      {/* Arabic Title indicator */}
      {data.ar_title && (
        <div
          className={cn(
            'mt-3 rounded-xl border bg-card overflow-hidden p-3',
            'border-border/50',
          )}>
          <p className='text-[11px] text-muted-foreground mb-1'>
            Arabic version:
          </p>
          <p className='text-sm font-bold text-right' dir='rtl'>
            {data.ar_title}
          </p>
          {data.ar_description && (
            <p
              className='text-xs text-muted-foreground text-right mt-1 line-clamp-2'
              dir='rtl'>
              {data.ar_description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TagInput Component ────────────────────────────────────────────────────
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
    <div className='flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[42px]'>
      {value.map((tag) => (
        <span
          key={tag}
          className='flex items-center gap-1 text-xs bg-muted rounded px-2 py-0.5 text-foreground'>
          {tag}
          <button
            type='button'
            onClick={() => onChange(value.filter((t) => t !== tag))}>
            <X className='h-3 w-3' />
          </button>
        </span>
      ))}
      <input
        className='flex-1 min-w-[100px] outline-none bg-transparent text-sm placeholder:text-muted-foreground'
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

// ─── Main CourseForm ───────────────────────────────────────────────────────
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

  // Auto-load data in edit mode
  // ✅ Fix #2: getById (not getOne)
  const { data: courseDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => coursesService.getById(courseId!),
    enabled: mode === 'edit' && !!courseId,
  });

  useEffect(() => {
    if (courseDetail) reset(courseDetail as unknown as CreateCourseRequest);
  }, [courseDetail, reset]);

  // Users list for instructorId picker
  // ✅ Fix #3: getAll (not getList)
  const { data: usersData } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => usersService.getAll({ limit: 100 }),
  });

  const watched = watch();

  // Auto-generate slug from title
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
    <div className='grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6'>
      {/* ── Form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='basic'>Basic</TabsTrigger>
            <TabsTrigger value='arabic'>🇸🇦 Arabic</TabsTrigger>
            <TabsTrigger value='meta'>Metadata</TabsTrigger>
            <TabsTrigger value='advanced'>Advanced</TabsTrigger>
          </TabsList>

          {/* ── TAB: Basic ─────────────────────────── */}
          <TabsContent value='basic' className='space-y-4 mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* instructorId — Required! */}
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
                        onValueChange={field.onChange}>
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

                {/* Title */}
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
                          message:
                            'Lowercase letters, numbers, and hyphens only',
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
                        onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='BEGINNER'>Beginner</SelectItem>
                          <SelectItem value='INTERMEDIATE'>
                            Intermediate
                          </SelectItem>
                          <SelectItem value='ADVANCED'>Advanced</SelectItem>
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
                        onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='FREE'>Free</SelectItem>
                          <SelectItem value='PRO'>Pro</SelectItem>
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
                        onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='PRACTICAL'>Practical</SelectItem>
                          <SelectItem value='THEORETICAL'>
                            Theoretical
                          </SelectItem>
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
                        onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='WEB'>Web Security</SelectItem>
                          <SelectItem value='NETWORK'>Network</SelectItem>
                          <SelectItem value='FORENSICS'>Forensics</SelectItem>
                          <SelectItem value='CRYPTOGRAPHY'>
                            Cryptography
                          </SelectItem>
                          <SelectItem value='REVERSE_ENGINEERING'>
                            Reverse Engineering
                          </SelectItem>
                          <SelectItem value='OSINT'>OSINT</SelectItem>
                          <SelectItem value='MALWARE_ANALYSIS'>
                            Malware Analysis
                          </SelectItem>
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
                        onValueChange={field.onChange}>
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
                                  className={`w-3 h-3 rounded-full bg-${c}-500`}
                                />{' '}
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
                        onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='DRAFT'>Draft</SelectItem>
                          <SelectItem value='PUBLISHED'>Published</SelectItem>
                          <SelectItem value='COMING_SOON'>
                            Coming Soon
                          </SelectItem>
                          <SelectItem value='ARCHIVED'>Archived</SelectItem>
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
                  <Input {...register('thumbnail')} placeholder='https://...' />
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
                <CardTitle>Tags & Skills</CardTitle>
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
                <div className='flex items-center justify-between p-3 border rounded-lg'>
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
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <Label className='font-semibold'>Mark as New</Label>
                    <p className='text-xs text-muted-foreground'>
                      Show "New" badge on card
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

          {/* ── TAB: Arabic ─────────────────────────── */}
          <TabsContent value='arabic' className='space-y-4 mt-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  🇸🇦 Arabic Content
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

          {/* ── TAB: Metadata ─────────────────────── */}
          <TabsContent value='meta' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Raw Metadata Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='text-xs bg-muted/50 p-4 rounded-lg overflow-auto max-h-64 text-foreground'>
                  {JSON.stringify(watched, null, 2)}
                </pre>
                <p className='text-xs text-muted-foreground mt-2'>
                  هذه هي البيانات اللي هتتبعت للـ Backend عند الحفظ.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Advanced ──────────────────────── */}
          <TabsContent value='advanced' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Publishing is separate from saving. After{' '}
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
            onClick={() => navigate(ROUTES.COURSES)}>
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {mode === 'create' ? 'Create Course' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* ── Live Preview ──────────────────────────── */}
      <div className='hidden xl:block'>
        <CoursePreview data={watched} />
      </div>
    </div>
  );
}
