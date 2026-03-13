// src/features/courses/pages/course-create.page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Unified "New Course" flow:
//   Step 1 — Upload JSON (or start blank)  →  populates metadata + topics
//   Step 2 — Review & edit everything before saving
//   Step 3 — Success dialog: Preview or Done
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Upload, FileJson, CheckCircle2, Loader2,
  Plus, Trash2, ChevronUp, ChevronDown, BookOpen, Eye,
  Save, AlertCircle, Search, User, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminCoursesApi } from '../services/admin-courses.api';
import { usersService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import {
  COURSE_DIFFICULTIES, COURSE_ACCESSES, COURSE_COLORS,
  COURSE_CONTENT_TYPES, COURSE_CATEGORIES, COURSE_STATES, enumLabel,
} from '../constants/course-enums';
import type {
  AdminCourseCreateDto, CourseAccess, CourseCategory, CourseColor,
  CourseContentType, CourseDifficulty, CourseState,
} from '../types/admin-course.types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TopicRow {
  id: string;
  title_en: string;
  title_ar: string;
  elements: object[];
}

interface CourseMeta {
  title: string;
  ar_title: string;
  slug: string;
  description: string;
  ar_description: string;
  difficulty: CourseDifficulty;
  access: CourseAccess;
  category: CourseCategory;
  color: CourseColor;
  contentType: CourseContentType;
  state: CourseState;
  estimatedHours: number;
  instructorId: string;
  tags: string;
  skills: string;
  isFeatured: boolean;
  isNew: boolean;
}

type Step = 'upload' | 'edit' | 'done';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function defaultMeta(): CourseMeta {
  return {
    title: '', ar_title: '', slug: '', description: '', ar_description: '',
    difficulty: 'BEGINNER', access: 'FREE', category: 'FUNDAMENTALS',
    color: 'BLUE', contentType: 'MIXED', state: 'DRAFT',
    estimatedHours: 0, instructorId: '', tags: '', skills: '',
    isFeatured: false, isNew: false,
  };
}

function parseJson(content: string): { meta: Partial<CourseMeta>; topics: TopicRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const parsed = JSON.parse(content);
  const src = Array.isArray(parsed) ? {} : parsed;

  const meta: Partial<CourseMeta> = {};
  const setIfString = (key: keyof CourseMeta, val: any) => {
    if (val && typeof val === 'string') (meta as any)[key] = val;
  };
  setIfString('title', src.title);
  setIfString('ar_title', src.ar_title);
  setIfString('slug', src.slug);
  setIfString('description', src.description);
  setIfString('ar_description', src.ar_description);
  setIfString('difficulty', src.difficulty);
  setIfString('access', src.access);
  setIfString('category', src.category);
  setIfString('color', src.color);
  setIfString('contentType', src.contentType);
  setIfString('state', src.state);
  setIfString('instructorId', src.instructorId);
  if (src.estimatedHours) meta.estimatedHours = Number(src.estimatedHours) || 0;
  if (Array.isArray(src.tags))   meta.tags   = src.tags.join(', ');
  if (Array.isArray(src.skills)) meta.skills = src.skills.join(', ');
  if (src.isFeatured !== undefined) meta.isFeatured = Boolean(src.isFeatured);
  if (src.isNew !== undefined)      meta.isNew      = Boolean(src.isNew);

  const rawTopics: any[] = Array.isArray(parsed)
    ? parsed
    : (Array.isArray(src.topics) ? src.topics : Array.isArray(src.curriculum) ? src.curriculum : []);

  const topics: TopicRow[] = rawTopics.map((t: any, i: number) => {
    if (!t || typeof t !== 'object') {
      warnings.push(`Topic ${i + 1}: invalid format, skipped`);
      return null as any;
    }
    const title_en = typeof t.title === 'object' ? (t.title?.en ?? '') : (t.title ?? `Topic ${i + 1}`);
    const title_ar = typeof t.title === 'object' ? (t.title?.ar ?? '') : '';
    const elements = Array.isArray(t.elements) ? t.elements : (Array.isArray(t.lessons) ? t.lessons : []);
    return {
      id: t.id ?? `topic-${Date.now()}-${i}`,
      title_en: String(title_en),
      title_ar: String(title_ar),
      elements,
    };
  }).filter(Boolean);

  return { meta, topics, warnings };
}

function topicsToApiFormat(topics: TopicRow[]): object[] {
  return topics.map((t) => ({
    id: t.id,
    title: { en: t.title_en, ar: t.title_ar },
    elements: t.elements,
  }));
}

// ─── InstructorPicker ─────────────────────────────────────────────────────────
function InstructorPicker({ value, onChange }: { value: string; onChange: (id: string, name: string) => void }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  const { data: adminData } = useQuery({
    queryKey: ['users', 'ADMIN'],
    queryFn: () => usersService.getAll({ page: 1, limit: 100, role: 'ADMIN' as any }),
  });
  const { data: instData } = useQuery({
    queryKey: ['users', 'INSTRUCTOR'],
    queryFn: () => usersService.getAll({ page: 1, limit: 100, role: 'INSTRUCTOR' as any }),
  });

  const allUsers = [
    ...(adminData?.data ?? []),
    ...(instData?.data ?? []),
  ].filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);

  const filtered = allUsers.filter((u: any) => {
    const name = u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    const q = `${name} ${u.email ?? ''}`.toLowerCase();
    return q.includes(search.toLowerCase());
  });

  const handleSelect = (u: any) => {
    const name = (u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()) || u.email;
    onChange(u.id, name);
    setSelectedName(name);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className='relative'>
      <label className='text-xs text-muted-foreground mb-1 block'>Instructor</label>
      <button type='button'
        className='w-full flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-left hover:bg-muted/30 transition-colors'
        onClick={() => setOpen((v) => !v)}>
        <User size={14} className='text-muted-foreground shrink-0' />
        <span className={selectedName ? '' : 'text-muted-foreground'}>
          {selectedName || 'Select instructor…'}
        </span>
        {value && (
          <span className='ml-auto text-xs font-mono text-muted-foreground truncate max-w-[100px]'>
            {value.slice(0, 8)}…
          </span>
        )}
      </button>
      {open && (
        <div className='absolute z-50 mt-1 w-full rounded-md border bg-card shadow-xl'>
          <div className='p-2 border-b'>
            <div className='flex items-center gap-2 px-2 py-1 rounded border bg-background'>
              <Search size={12} className='text-muted-foreground' />
              <input autoFocus className='flex-1 bg-transparent text-sm outline-none'
                placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <ul className='max-h-44 overflow-y-auto py-1'>
            {filtered.length === 0
              ? <li className='px-4 py-3 text-xs text-muted-foreground text-center'>No users found</li>
              : filtered.map((u: any) => {
                  const displayName = (u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()) || 'No name';
                  const initial = (u.name?.[0] ?? u.firstName?.[0] ?? u.email?.[0] ?? '?').toUpperCase();
                  return (
                    <li key={u.id}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${u.id === value ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => handleSelect(u)}>
                      <div className='w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0'>
                        {initial}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium truncate'>{displayName}</p>
                        <p className='text-xs text-muted-foreground truncate'>{u.email}</p>
                      </div>
                      <span className='ml-auto text-xs bg-muted px-1.5 py-0.5 rounded shrink-0'>{u.role}</span>
                    </li>
                  );
                })
            }
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Success Dialog ───────────────────────────────────────────────────────────
function SuccessDialog({
  courseTitle,
  courseSlug,
  onPreview,
  onDone,
}: {
  courseTitle: string;
  courseSlug: string;
  onPreview: () => void;
  onDone: () => void;
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl border bg-card shadow-2xl p-8 text-center space-y-5'>
        <div className='w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto'>
          <CheckCircle2 size={34} className='text-emerald-400' />
        </div>
        <div>
          <h2 className='text-xl font-bold'>Course Created!</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            <span className='font-medium text-foreground'>"{courseTitle}"</span> has been saved successfully.
          </p>
          <p className='text-xs text-muted-foreground mt-1 font-mono'>/courses/{courseSlug}</p>
        </div>
        <div className='flex flex-col gap-2 pt-2'>
          <Button className='w-full gap-2' onClick={onPreview}>
            <Eye size={15} /> Preview Course
          </Button>
          <Button variant='outline' className='w-full gap-2' onClick={onDone}>
            <BookOpen size={15} /> Go to Courses List
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className='text-xs text-muted-foreground mb-1 block'>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder = '', dir }: {
  value: string; onChange: (v: string) => void; placeholder?: string; dir?: string;
}) {
  return (
    <input
      className='w-full rounded-md border bg-background px-3 py-2 text-sm'
      value={value} placeholder={placeholder} dir={dir}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Select({ value, onChange, opts }: {
  value: string; onChange: (v: string) => void; opts: readonly string[];
}) {
  return (
    <select className='w-full rounded-md border bg-background px-3 py-2 text-sm'
      value={value} onChange={(e) => onChange(e.target.value)}>
      {opts.map((o) => <option key={o} value={o}>{enumLabel(o)}</option>)}
    </select>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CourseCreatePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileError, setFileError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [meta, setMeta] = useState<CourseMeta>(defaultMeta());
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [savedSlug, setSavedSlug] = useState('');
  const [savedTitle, setSavedTitle] = useState('');

  const setTitle = (v: string) => setMeta((f) => ({
    ...f, title: v,
    slug: f.slug === slugify(f.title) || f.slug === '' ? slugify(v) : f.slug,
  }));

  const setField = <K extends keyof CourseMeta>(k: K, v: CourseMeta[K]) =>
    setMeta((f) => ({ ...f, [k]: v }));

  // ── File handling ─────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) { setFileError('Only .json files are supported'); return; }
    setFileError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { meta: parsedMeta, topics: parsedTopics, warnings: w } = parseJson(e.target!.result as string);
        setMeta((prev) => ({ ...prev, ...parsedMeta }));
        setTopics(parsedTopics);
        setWarnings(w);
        setStep('edit');
        if (parsedTopics.length > 0) toast.success(`JSON loaded: ${parsedTopics.length} topics found`);
        else toast.info('JSON loaded — no topics found, you can add them manually');
      } catch (err: any) {
        setFileError(`Parse error: ${err?.message ?? 'Invalid JSON'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Topics ────────────────────────────────────────────────────────────
  const addTopic = () => setTopics((prev) => [
    ...prev,
    { id: `topic-${Date.now()}`, title_en: `Topic ${prev.length + 1}`, title_ar: '', elements: [] },
  ]);

  const removeTopic = (i: number) => setTopics((prev) => prev.filter((_, idx) => idx !== i));

  const moveTopic = (i: number, dir: 'up' | 'down') => {
    const ni = dir === 'up' ? i - 1 : i + 1;
    if (ni < 0 || ni >= topics.length) return;
    const arr = [...topics];
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    setTopics(arr);
  };

  const updateTopic = (i: number, field: 'title_en' | 'title_ar', v: string) =>
    setTopics((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: v } : t));

  // ── Save ──────────────────────────────────────────────────────────────
  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!meta.title.trim()) throw new Error('Title is required');
      if (!meta.slug.trim()) throw new Error('Slug is required');
      if (!meta.instructorId.trim()) throw new Error('Instructor is required');

      const dto: AdminCourseCreateDto & Record<string, any> = {
        title:          meta.title.trim(),
        ar_title:       meta.ar_title.trim() || undefined,
        slug:           meta.slug.trim(),
        description:    meta.description.trim() || undefined,
        ar_description: meta.ar_description.trim() || undefined,
        difficulty:     meta.difficulty,
        access:         meta.access,
        category:       meta.category,
        color:          meta.color,
        contentType:    meta.contentType,
        state:          meta.state,
        instructorId:   meta.instructorId.trim(),
        estimatedHours: meta.estimatedHours || undefined,
        isFeatured:     meta.isFeatured,
        isNew:          meta.isNew,
        tags:           meta.tags ? meta.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        skills:         meta.skills ? meta.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const course = await adminCoursesApi.create(dto);

      if (topics.length > 0) {
        await adminCoursesApi.saveCurriculum(course.id, topicsToApiFormat(topics));
      }

      return course;
    },
    onSuccess: (course) => {
      setSavedSlug(course.slug);
      setSavedTitle(course.title);
      setStep('done');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create course';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  const frontendBase = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:3000';

  return (
    <div className='min-h-[calc(100vh-4rem)] bg-background'>

      {/* Success Dialog */}
      {step === 'done' && (
        <SuccessDialog
          courseTitle={savedTitle}
          courseSlug={savedSlug}
          onPreview={() => window.open(`${frontendBase}/courses/${savedSlug}`, '_blank')}
          onDone={() => navigate(ROUTES.COURSES)}
        />
      )}

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className='sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b bg-card/95 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' className='gap-1' onClick={() => navigate(ROUTES.COURSES)}>
            <ArrowLeft size={14} /> Back
          </Button>
          <div className='h-4 w-px bg-border' />
          <span className='text-sm font-semibold'>New Course</span>
          {step === 'edit' && (
            <span className='text-xs text-muted-foreground'>
              — {topics.length} topic{topics.length !== 1 ? 's' : ''} loaded
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {step === 'upload' && (
            <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setStep('edit')}>
              Skip — Start Blank
            </Button>
          )}
          {step === 'edit' && (
            <>
              <input ref={fileRef} type='file' accept='.json' className='hidden'
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
              <Button variant='outline' size='sm' className='gap-1.5' onClick={() => fileRef.current?.click()}>
                <FileJson size={13} /> Replace JSON
              </Button>
              <Button size='sm' className='gap-1.5 min-w-[110px]' onClick={() => save()} disabled={isSaving}>
                {isSaving ? <><Loader2 size={13} className='animate-spin' /> Saving…</> : <><Save size={13} /> Save Course</>}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Step 1: Upload ───────────────────────────────────────────────── */}
      {step === 'upload' && (
        <div className='max-w-xl mx-auto px-6 py-16 space-y-6'>
          <div className='text-center space-y-2'>
            <div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto'>
              <FileJson size={28} className='text-primary' />
            </div>
            <h1 className='text-2xl font-bold'>Create a New Course</h1>
            <p className='text-sm text-muted-foreground'>
              Upload a course JSON to pre-fill everything, or start from scratch.
            </p>
          </div>

          <label
            className='flex flex-col items-center justify-center gap-4 w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-muted/20 hover:border-primary/60 transition-all'
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}>
            <input ref={fileRef} type='file' accept='.json' className='hidden'
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
            <Upload size={32} className='text-muted-foreground' />
            <div className='text-center space-y-1'>
              <p className='text-sm font-semibold'>Drop your course JSON here</p>
              <p className='text-xs text-muted-foreground'>or click to browse</p>
            </div>
            <div className='text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 font-mono text-center leading-relaxed'>
              {'{ title, slug, difficulty, access, color, category,'}<br />
              {'  topics: [{ title: {en, ar}, elements: [] }] }'}
            </div>
          </label>

          {fileError && (
            <div className='flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <AlertCircle size={15} /> {fileError}
            </div>
          )}

          <div className='text-center'>
            <button className='text-sm text-primary underline underline-offset-2' onClick={() => setStep('edit')}>
              Skip and fill manually →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Edit ────────────────────────────────────────────────── */}
      {step === 'edit' && (
        <div className='max-w-3xl mx-auto px-6 py-8 space-y-8'>

          {warnings.length > 0 && (
            <div className='rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4 space-y-1.5'>
              <p className='text-xs font-semibold text-yellow-400 flex items-center gap-1.5'>
                <AlertCircle size={13} /> {warnings.length} warning{warnings.length > 1 ? 's' : ''} from import
              </p>
              {warnings.map((w, i) => <p key={i} className='text-xs text-yellow-300/80 ml-4'>• {w}</p>)}
            </div>
          )}

          <section className='rounded-xl border bg-card p-6 space-y-5'>
            <h2 className='text-sm font-bold flex items-center gap-2'>
              <BookOpen size={15} className='text-primary' /> Course Metadata
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Field label='Title (EN) *'>
                <Input value={meta.title} onChange={setTitle} placeholder='e.g., Web Application Hacking' />
              </Field>
              <Field label='Title (AR)'>
                <Input value={meta.ar_title} onChange={(v) => setField('ar_title', v)} placeholder='العنوان بالعربي' dir='rtl' />
              </Field>
            </div>

            <Field label='Slug *'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground font-mono shrink-0'>courses/</span>
                <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono'
                  value={meta.slug} placeholder='web-application-hacking'
                  onChange={(e) => setField('slug', slugify(e.target.value))} />
              </div>
            </Field>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Field label='Description (EN)'>
                <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={2}
                  value={meta.description} placeholder='Short description…'
                  onChange={(e) => setField('description', e.target.value)} />
              </Field>
              <Field label='Description (AR)'>
                <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={2} dir='rtl'
                  value={meta.ar_description} placeholder='وصف قصير…'
                  onChange={(e) => setField('ar_description', e.target.value)} />
              </Field>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
              <Field label='Difficulty'>
                <Select value={meta.difficulty} onChange={(v) => setField('difficulty', v as CourseDifficulty)} opts={COURSE_DIFFICULTIES} />
              </Field>
              <Field label='Access'>
                <Select value={meta.access} onChange={(v) => setField('access', v as CourseAccess)} opts={COURSE_ACCESSES} />
              </Field>
              <Field label='State'>
                <Select value={meta.state} onChange={(v) => setField('state', v as CourseState)} opts={COURSE_STATES} />
              </Field>
              <Field label='Color'>
                <Select value={meta.color} onChange={(v) => setField('color', v as CourseColor)} opts={COURSE_COLORS} />
              </Field>
              <Field label='Content Type'>
                <Select value={meta.contentType} onChange={(v) => setField('contentType', v as CourseContentType)} opts={COURSE_CONTENT_TYPES} />
              </Field>
              <Field label='Estimated Hours'>
                <input type='number' min={0} className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                  value={meta.estimatedHours || ''}
                  onChange={(e) => setField('estimatedHours', Number(e.target.value) || 0)} />
              </Field>
            </div>

            <Field label='Category'>
              <Select value={meta.category} onChange={(v) => setField('category', v as CourseCategory)} opts={COURSE_CATEGORIES} />
            </Field>

            <InstructorPicker
              value={meta.instructorId}
              onChange={(id, name) => { setField('instructorId', id); void name; }}
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Field label='Tags (comma-separated)'>
                <Input value={meta.tags} onChange={(v) => setField('tags', v)} placeholder='ctf, web, beginner' />
              </Field>
              <Field label='Skills (comma-separated)'>
                <Input value={meta.skills} onChange={(v) => setField('skills', v)} placeholder='SQL Injection, XSS' />
              </Field>
            </div>

            <div className='flex items-center gap-6'>
              <label className='flex items-center gap-2 cursor-pointer text-sm'>
                <input type='checkbox' checked={meta.isFeatured}
                  onChange={(e) => setField('isFeatured', e.target.checked)} />
                Featured
              </label>
              <label className='flex items-center gap-2 cursor-pointer text-sm'>
                <input type='checkbox' checked={meta.isNew}
                  onChange={(e) => setField('isNew', e.target.checked)} />
                Mark as New
              </label>
            </div>
          </section>

          <section className='rounded-xl border bg-card p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-sm font-bold flex items-center gap-2'>
                <Layers size={15} className='text-primary' />
                Topics / Curriculum
                <span className='text-xs font-normal text-muted-foreground ml-1'>
                  ({topics.length} topic{topics.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <Button size='sm' variant='outline' className='gap-1' onClick={addTopic}>
                <Plus size={13} /> Add Topic
              </Button>
            </div>

            {topics.length === 0 ? (
              <div className='rounded-xl border border-dashed py-10 text-center space-y-3'>
                <Layers size={28} className='text-muted-foreground mx-auto' />
                <p className='text-sm text-muted-foreground'>No topics yet — add them manually or import from JSON.</p>
                <div className='flex items-center justify-center gap-2'>
                  <Button size='sm' className='gap-1' onClick={addTopic}><Plus size={12} /> Add Topic</Button>
                  <Button size='sm' variant='outline' className='gap-1' onClick={() => fileRef.current?.click()}>
                    <FileJson size={12} /> Load from JSON
                  </Button>
                </div>
              </div>
            ) : (
              <ul className='space-y-2'>
                {topics.map((t, i) => (
                  <li key={t.id} className='flex items-start gap-2 rounded-lg border bg-background p-3'>
                    <div className='flex flex-col gap-1 shrink-0 mt-1'>
                      <button className='p-0.5 rounded hover:bg-muted disabled:opacity-30'
                        disabled={i === 0} onClick={() => moveTopic(i, 'up')}>
                        <ChevronUp size={12} />
                      </button>
                      <button className='p-0.5 rounded hover:bg-muted disabled:opacity-30'
                        disabled={i === topics.length - 1} onClick={() => moveTopic(i, 'down')}>
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <div>
                        <label className='text-xs text-muted-foreground mb-0.5 block'>Title (EN)</label>
                        <input className='w-full rounded border bg-card px-2.5 py-1.5 text-sm'
                          value={t.title_en}
                          onChange={(e) => updateTopic(i, 'title_en', e.target.value)} />
                      </div>
                      <div>
                        <label className='text-xs text-muted-foreground mb-0.5 block'>Title (AR)</label>
                        <input className='w-full rounded border bg-card px-2.5 py-1.5 text-sm' dir='rtl'
                          value={t.title_ar}
                          onChange={(e) => updateTopic(i, 'title_ar', e.target.value)} />
                      </div>
                    </div>
                    <div className='flex items-center gap-1 shrink-0 mt-1'>
                      <span className='text-xs text-muted-foreground'>
                        {t.elements.length} el.
                      </span>
                      <button className='p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors'
                        onClick={() => removeTopic(i)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className='flex justify-end pb-8'>
            <Button size='lg' className='gap-2 min-w-[160px]' onClick={() => save()} disabled={isSaving}>
              {isSaving
                ? <><Loader2 size={15} className='animate-spin' /> Saving…</>
                : <><Save size={15} /> Save Course</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
