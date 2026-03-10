// src/features/courses/pages/course-create.page.tsx
// ✅ Full rebuild: form (left) + live platform preview (right) + JSON import tab
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { adminApiClient } from '@/core/api/admin-client';
import { CourseLivePreview } from '../components/course-live-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import {
  ArrowLeft, ChevronRight, Loader2, Plus, RefreshCw,
  FileJson, PenLine, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminCourseCreateDto, CourseColor } from '../types/admin-course.types';

const COLOR_OPTIONS: { value: CourseColor; label: string; dot: string }[] = [
  { value: 'EMERALD', label: 'Emerald', dot: 'bg-emerald-500' },
  { value: 'BLUE',    label: 'Blue',    dot: 'bg-blue-500'    },
  { value: 'VIOLET',  label: 'Violet',  dot: 'bg-violet-500'  },
  { value: 'ORANGE',  label: 'Orange',  dot: 'bg-orange-500'  },
  { value: 'ROSE',    label: 'Rose',    dot: 'bg-rose-500'    },
  { value: 'CYAN',    label: 'Cyan',    dot: 'bg-cyan-500'    },
];

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

interface AdminUserBasic {
  id: string; name?: string; username?: string; email?: string; role?: string;
}

// ── Required fields for creating a course from JSON ──
const REQUIRED_FIELDS: (keyof AdminCourseCreateDto)[] = [
  'title', 'slug', 'difficulty', 'access', 'category', 'color', 'contentType',
];

type Tab = 'form' | 'json';

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('form');
  const [jsonText, setJsonText] = useState('');
  const [jsonParsed, setJsonParsed] = useState<Record<string, any> | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [missingValues, setMissingValues] = useState<Record<string, string>>({});

  const { data: instructors = [] } = useQuery<AdminUserBasic[]>({
    queryKey: ['admin', 'instructors'],
    queryFn: async () => {
      try {
        const res = await adminApiClient.get('/admin/users', { params: { role: 'INSTRUCTOR', limit: 100 } });
        const raw = res?.data ?? res;
        const arr = raw?.data ?? raw;
        return Array.isArray(arr) ? arr : [];
      } catch { return []; }
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    register, handleSubmit, setValue, getValues, watch,
    formState: { errors },
  } = useForm<AdminCourseCreateDto>({
    defaultValues: {
      difficulty: 'BEGINNER', access: 'FREE',
      category: 'FUNDAMENTALS', color: 'BLUE',
      contentType: 'PRACTICAL', instructorId: '',
    },
  });

  // Watch all fields for live preview
  const watchedForm = watch();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AdminCourseCreateDto) => adminCoursesApi.create(data),
    onSuccess: (created) => {
      toast.success('Course created!');
      navigate(ROUTES.COURSE_EDIT(created.slug));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create course';
      toast.error(Array.isArray(msg) ? msg.join(' • ') : String(msg), { duration: 6000 });
    },
  });

  const onSubmit = (data: AdminCourseCreateDto) => {
    if (!data.instructorId) delete (data as any).instructorId;
    mutate(data);
  };

  const handleTitleBlur = () => {
    const title = getValues('title');
    const currentSlug = getValues('slug');
    if (title && !currentSlug) setValue('slug', toSlug(title), { shouldValidate: true });
  };

  // ── JSON import logic ──
  const handleJsonParse = () => {
    setJsonError(null);
    setMissingFields([]);
    try {
      const parsed = JSON.parse(jsonText);
      setJsonParsed(parsed);
      const missing = REQUIRED_FIELDS.filter((f) => !parsed[f]);
      setMissingFields(missing);
      const mv: Record<string, string> = {};
      missing.forEach((f) => { mv[f] = ''; });
      setMissingValues(mv);
    } catch (e: any) {
      setJsonError('Invalid JSON: ' + e.message);
    }
  };

  const handleJsonSubmit = () => {
    if (!jsonParsed) return;
    const allMissingFilled = missingFields.every((f) => missingValues[f]?.trim());
    if (!allMissingFilled) {
      toast.error('Please fill in all required fields');
      return;
    }
    const data: AdminCourseCreateDto = {
      ...jsonParsed,
      ...missingValues,
    } as AdminCourseCreateDto;
    if (!data.instructorId) delete (data as any).instructorId;
    mutate(data);
  };

  const Field = ({ id, label, error, children, hint }: any) => (
    <div className='space-y-1.5'>
      <Label htmlFor={id} className='text-sm font-medium'>{label}</Label>
      {children}
      {hint  && <p className='text-[11px] text-muted-foreground'>{hint}</p>}
      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  );

  const instLabel = (i: AdminUserBasic) => i.name ?? i.username ?? i.email ?? i.id;

  return (
    <div className='space-y-6'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
        <Link to={ROUTES.COURSES} className='hover:text-foreground transition-colors'>Courses</Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>New Course</span>
      </nav>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Create Course</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Fill basics — complete all details after creation.</p>
        </div>
        <Button variant='ghost' size='sm' className='h-9 gap-2' onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
      </div>

      {/* Mode tabs */}
      <div className='flex gap-1 border-b border-border/50'>
        {([{ key: 'form', label: 'From Scratch', icon: PenLine }, { key: 'json', label: 'Import JSON', icon: FileJson }] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}>
            <Icon className='h-4 w-4' /> {label}
          </button>
        ))}
      </div>

      {/* ── FROM SCRATCH tab ── */}
      {tab === 'form' && (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
          {/* Form */}
          <Card className='p-6'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <Field id='title' label='Title (EN) *' error={errors.title?.message}>
                  <Input id='title' placeholder='e.g. Web Application Security'
                    {...register('title', { required: 'Title is required' })}
                    onBlur={handleTitleBlur} />
                </Field>
                <Field id='ar_title' label='Title (AR)'>
                  <Input id='ar_title' dir='rtl' placeholder='عنوان الكورس بالعربي' {...register('ar_title')} />
                </Field>
              </div>

              <Field id='slug' label='Slug *' error={errors.slug?.message}
                hint='Auto-generated from title on blur.'>
                <div className='flex gap-2'>
                  <Input id='slug' placeholder='web-application-security' className='font-mono text-sm'
                    {...register('slug', { required: 'Slug is required', pattern: { value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Lowercase, numbers and hyphens only' } })} />
                  <Button type='button' variant='outline' size='icon' className='shrink-0'
                    onClick={() => { const t = getValues('title'); if (t) setValue('slug', toSlug(t)); }}>
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                </div>
              </Field>

              <Field id='description' label='Short Description'>
                <Textarea id='description' rows={3} placeholder='Brief overview...' {...register('description')} />
              </Field>

              <div className='grid gap-4 sm:grid-cols-3'>
                <Field id='difficulty' label='Difficulty'>
                  <Select value={watch('difficulty')} onValueChange={(v) => setValue('difficulty', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((d) => (
                        <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id='access' label='Access'>
                  <Select value={watch('access')} onValueChange={(v) => setValue('access', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['FREE', 'PRO', 'PREMIUM'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id='color' label='Color Theme'>
                  <Select value={watch('color')} onValueChange={(v) => setValue('color', v as CourseColor)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map(({ value, label, dot }) => (
                        <SelectItem key={value} value={value}>
                          <div className='flex items-center gap-2'>
                            <span className={cn('h-3 w-3 rounded-full', dot)} />{label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <Field id='category' label='Category'>
                  <Select value={watch('category')} onValueChange={(v) => setValue('category', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['FUNDAMENTALS','WEB_SECURITY','PENETRATION_TESTING','MALWARE_ANALYSIS','CLOUD_SECURITY','CRYPTOGRAPHY','NETWORK_SECURITY','TOOLS_AND_TECHNIQUES','CAREER_AND_INDUSTRY'].map((c) => (
                        <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id='contentType' label='Content Type'>
                  <Select value={watch('contentType')} onValueChange={(v) => setValue('contentType', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['PRACTICAL', 'THEORETICAL', 'MIXED'].map((ct) => (
                        <SelectItem key={ct} value={ct}>{ct.charAt(0) + ct.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field id='instructorId' label='Instructor'
                hint={instructors.length === 0 ? 'No instructors found — enter UUID manually or assign later.' : undefined}>
                {instructors.length > 0 ? (
                  <Select value={watch('instructorId') ?? ''} onValueChange={(v) => setValue('instructorId', v)}>
                    <SelectTrigger><SelectValue placeholder='Select instructor' /></SelectTrigger>
                    <SelectContent>
                      {instructors.map((i) => <SelectItem key={i.id} value={i.id}>{instLabel(i)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' className='font-mono text-sm' {...register('instructorId')} />
                )}
              </Field>

              <div className='flex justify-end pt-2'>
                <Button type='submit' disabled={isPending} className='gap-2 min-w-[140px]'>
                  {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
                  Create Course
                </Button>
              </div>
            </form>
          </Card>

          {/* Live Preview */}
          <div className='space-y-3'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Live Preview</p>
            <CourseLivePreview
              course={{
                title: watchedForm.title,
                ar_title: watchedForm.ar_title,
                description: watchedForm.description,
                color: watchedForm.color,
                access: watchedForm.access,
                difficulty: watchedForm.difficulty,
                category: watchedForm.category,
              }}
              topics={[]}
            />
          </div>
        </div>
      )}

      {/* ── JSON IMPORT tab ── */}
      {tab === 'json' && (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <Card className='p-4'>
              <p className='text-sm font-medium mb-3'>Paste Course JSON</p>
              <Textarea
                rows={16}
                placeholder={'{ "title": "...", "slug": "...", "difficulty": "BEGINNER", ... }'}
                value={jsonText}
                onChange={(e) => { setJsonText(e.target.value); setJsonParsed(null); setJsonError(null); }}
                className='font-mono text-xs resize-none'
              />
              <div className='flex justify-end mt-3'>
                <Button variant='outline' size='sm' onClick={handleJsonParse} className='gap-2'>
                  <FileJson className='h-4 w-4' /> Parse JSON
                </Button>
              </div>
              {jsonError && (
                <div className='mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'>
                  <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5' />
                  {jsonError}
                </div>
              )}
            </Card>

            {/* Missing fields */}
            {jsonParsed && missingFields.length > 0 && (
              <Card className='p-4 space-y-3'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-amber-400 shrink-0' />
                  <p className='text-sm font-semibold'>Missing Required Fields</p>
                </div>
                {missingFields.map((field) => (
                  <div key={field} className='space-y-1'>
                    <Label className='text-xs capitalize'>{field.replace(/_/g, ' ')} *</Label>
                    {['difficulty', 'access', 'category', 'color', 'contentType'].includes(field) ? (
                      <select
                        value={missingValues[field] ?? ''}
                        onChange={(e) => setMissingValues((p) => ({ ...p, [field]: e.target.value }))}
                        className='w-full text-xs h-8 rounded-md border border-border bg-background px-2'>
                        <option value=''>Select...</option>
                        {field === 'difficulty' && ['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'].map((v) => <option key={v} value={v}>{v}</option>)}
                        {field === 'access' && ['FREE','PRO','PREMIUM'].map((v) => <option key={v} value={v}>{v}</option>)}
                        {field === 'color' && ['EMERALD','BLUE','VIOLET','ORANGE','ROSE','CYAN'].map((v) => <option key={v} value={v}>{v}</option>)}
                        {field === 'contentType' && ['PRACTICAL','THEORETICAL','MIXED'].map((v) => <option key={v} value={v}>{v}</option>)}
                        {field === 'category' && ['FUNDAMENTALS','WEB_SECURITY','PENETRATION_TESTING','MALWARE_ANALYSIS','CLOUD_SECURITY','CRYPTOGRAPHY','NETWORK_SECURITY','TOOLS_AND_TECHNIQUES','CAREER_AND_INDUSTRY'].map((v) => <option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                      </select>
                    ) : (
                      <Input
                        placeholder={field}
                        value={missingValues[field] ?? ''}
                        onChange={(e) => setMissingValues((p) => ({ ...p, [field]: e.target.value }))}
                        className='h-8 text-xs'
                      />
                    )}
                  </div>
                ))}
              </Card>
            )}

            {jsonParsed && missingFields.length === 0 && (
              <div className='flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                JSON is valid — all required fields present.
              </div>
            )}

            {jsonParsed && (
              <div className='flex justify-end'>
                <Button onClick={handleJsonSubmit} disabled={isPending} className='gap-2'>
                  {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
                  Create from JSON
                </Button>
              </div>
            )}
          </div>

          {/* Preview from JSON */}
          <div className='space-y-3'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Preview</p>
            <CourseLivePreview
              course={jsonParsed ?? {}}
              topics={Array.isArray(jsonParsed?.topics) ? jsonParsed.topics : []}
            />
            {jsonParsed && (
              <Card className='p-3'>
                <p className='text-xs font-semibold mb-2 text-muted-foreground'>Parsed Fields</p>
                <div className='flex flex-wrap gap-1.5'>
                  {Object.keys(jsonParsed).map((k) => (
                    <Badge key={k} variant='outline'
                      className={cn('text-[11px]', REQUIRED_FIELDS.includes(k as any)
                        ? (jsonParsed[k] ? 'border-emerald-500/40 text-emerald-400' : 'border-red-500/40 text-red-400')
                        : 'border-border/40 text-muted-foreground')}>
                      {k}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
