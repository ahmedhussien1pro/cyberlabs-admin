// src/features/courses/pages/course-import.page.tsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Loader2,
  Eye,
  CloudUpload,
  BookOpen,
  Send,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants';
import { apiClient } from '@/core/api/client';
import { CourseImportPreview } from '../components/course-import-preview';

// ── Enums (mirrors backend) ────────────────────────────────────────
const COLORS = ['EMERALD', 'BLUE', 'VIOLET', 'ORANGE', 'ROSE', 'CYAN'] as const;
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
const ACCESSES = ['FREE', 'PRO', 'PREMIUM'] as const;
const CATEGORIES = [
  'WEB_SECURITY',
  'PENETRATION_TESTING',
  'MALWARE_ANALYSIS',
  'CLOUD_SECURITY',
  'FUNDAMENTALS',
  'CRYPTOGRAPHY',
  'NETWORK_SECURITY',
  'TOOLS_AND_TECHNIQUES',
  'CAREER_AND_INDUSTRY',
] as const;
const CONTENT_TYPES = ['PRACTICAL', 'THEORETICAL', 'MIXED'] as const;

type CourseColor = (typeof COLORS)[number];
type CourseDifficulty = (typeof DIFFICULTIES)[number];
type CourseAccess = (typeof ACCESSES)[number];
type CourseCategory = (typeof CATEGORIES)[number];
type CourseContentType = (typeof CONTENT_TYPES)[number];

// ── JSON file structure ───────────────────────────────────────────
interface CourseJsonData {
  landingData: {
    title: { en: string; ar?: string };
    description?: { en?: string; ar?: string };
    longDescription?: { en?: string; ar?: string };
  };
  topics: Array<{
    title: { en: string; ar?: string };
    description?: { en?: string; ar?: string };
    elements?: Array<{
      title: { en: string; ar?: string };
      type?: string;
      order?: number;
      duration?: number;
      content?: string;
      videoUrl?: string;
    }>;
  }>;
}

// ── Metadata form state ────────────────────────────────────────────
interface MetadataForm {
  slug: string;
  instructorId: string;
  color: CourseColor;
  difficulty: CourseDifficulty;
  access: CourseAccess;
  category: CourseCategory;
  contentType: CourseContentType;
  estimatedHours: number;
  thumbnail: string;
  tags: string; // comma-separated
  skills: string; // comma-separated
  ar_skills: string; // comma-separated
  labSlugs: string; // comma-separated
  isNew: boolean;
  isFeatured: boolean;
  publishImmediately: boolean;
}

// ── Step indicator component ───────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Upload JSON' },
    { n: 2, label: 'Metadata' },
    { n: 3, label: 'Preview & Import' },
  ];
  return (
    <div className='flex items-center gap-0'>
      {steps.map((s, i) => (
        <div key={s.n} className='flex items-center'>
          <div className='flex flex-col items-center gap-1'>
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                current === s.n && 'bg-primary text-primary-foreground',
                current > s.n && 'bg-green-500 text-white',
                current < s.n && 'bg-muted text-muted-foreground',
              )}>
              {current > s.n ? <CheckCircle2 size={16} /> : s.n}
            </div>
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                current >= s.n
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground',
              )}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'h-px w-16 mb-5 mx-1 transition-colors',
                current > s.n ? 'bg-green-500' : 'bg-border',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Auto-generate slug from title ─────────────────────────────────
function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Main Page ─────────────────────────────────────────────────────
export default function CourseImportPage() {
  const navigate = useNavigate();

  // ── Step state ─────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1: JSON file ──────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [parsedJson, setParsedJson] = useState<CourseJsonData | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 2: Metadata ───────────────────────────────────────────
  const [meta, setMeta] = useState<MetadataForm>({
    slug: '',
    instructorId: '',
    color: 'BLUE',
    difficulty: 'BEGINNER',
    access: 'FREE',
    category: 'FUNDAMENTALS',
    contentType: 'THEORETICAL',
    estimatedHours: 1,
    thumbnail: '',
    tags: '',
    skills: '',
    ar_skills: '',
    labSlugs: '',
    isNew: false,
    isFeatured: false,
    publishImmediately: false,
  });
  const [metaErrors, setMetaErrors] = useState<
    Partial<Record<keyof MetadataForm, string>>
  >({});

  // ── Fetch instructors list ─────────────────────────────────────
  const { data: instructors = [] } = useQuery({
    queryKey: ['admin-instructors'],
    queryFn: () =>
      apiClient
        .get('/admin/users?role=ADMIN&limit=100')
        .then((r) => r.data.data ?? []),
  });

  // ── Import mutation ────────────────────────────────────────────
  const importMutation = useMutation({
    mutationFn: async (publishNow: boolean) => {
      if (!file || !parsedJson) throw new Error('No file');

      const formData = new FormData();
      formData.append('file', file);

      const metadata = {
        slug: meta.slug,
        instructorId: meta.instructorId,
        color: meta.color,
        difficulty: meta.difficulty,
        access: meta.access,
        category: meta.category,
        contentType: meta.contentType,
        estimatedHours: Number(meta.estimatedHours),
        thumbnail: meta.thumbnail || undefined,
        tags: meta.tags
          ? meta.tags
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        skills: meta.skills
          ? meta.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        ar_skills: meta.ar_skills
          ? meta.ar_skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        labSlugs: meta.labSlugs
          ? meta.labSlugs
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        isNew: meta.isNew,
        isFeatured: meta.isFeatured,
        publishImmediately: publishNow,
      };
      formData.append('metadata', JSON.stringify(metadata));

      return apiClient.post('/admin/courses/import-json', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (_, publishNow) => {
      toast.success(
        publishNow
          ? '✅ Course imported and published!'
          : '✅ Course imported as draft!',
      );
      navigate(ROUTES.COURSES);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Import failed';
      toast.error(`❌ ${msg}`);
    },
  });

  // ── File parsing ───────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    setJsonError(null);
    setParsedJson(null);
    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as CourseJsonData;
        if (!json.landingData?.title?.en) {
          setJsonError('Missing landingData.title.en in JSON');
          return;
        }
        if (!Array.isArray(json.topics) || json.topics.length === 0) {
          setJsonError('Missing or empty topics array in JSON');
          return;
        }
        setParsedJson(json);
        // Auto-fill slug + estimatedHours from JSON title
        const autoSlug = toSlug(json.landingData.title.en);
        setMeta((prev) => ({
          ...prev,
          slug: prev.slug || autoSlug,
        }));
      } catch {
        setJsonError('Invalid JSON file — could not parse');
      }
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.json')) handleFile(dropped);
    else setJsonError('Only .json files are accepted');
  };

  // ── Step 2 validation ──────────────────────────────────────────
  const validateMeta = (): boolean => {
    const errors: typeof metaErrors = {};
    if (!meta.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
      errors.slug = 'Slug must be lowercase letters, numbers, and hyphens';
    if (!meta.instructorId) errors.instructorId = 'Instructor is required';
    if (!meta.estimatedHours || meta.estimatedHours < 1)
      errors.estimatedHours = 'Must be at least 1 hour';
    setMetaErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const totalLessons = parsedJson
    ? parsedJson.topics.reduce((s, t) => s + (t.elements?.length ?? 0), 0)
    : 0;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <FileJson className='h-7 w-7 text-primary' />
            Import Course from JSON
          </h1>
          <p className='text-muted-foreground'>
            Upload a course JSON file, configure metadata, preview, then import
          </p>
        </div>
      </div>

      {/* ── Step Indicator ──────────────────────────────────── */}
      <div className='flex justify-center py-2'>
        <StepIndicator current={step} />
      </div>

      {/* ════════════════════════════════════════════════════════
          STEP 1 — Upload JSON
      ════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className='space-y-6'>
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all text-center',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
              parsedJson && 'border-green-500/50 bg-green-500/5',
            )}>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json'
              className='hidden'
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {!parsedJson ? (
              <div className='space-y-3'>
                <CloudUpload className='mx-auto h-12 w-12 text-muted-foreground' />
                <div>
                  <p className='font-semibold text-lg'>
                    Drop your course JSON here
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    or click to browse · .json files only · max 10 MB
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                <CheckCircle2 className='mx-auto h-12 w-12 text-green-500' />
                <p className='font-bold text-lg text-green-600 dark:text-green-400'>
                  {file?.name}
                </p>
                <p className='text-muted-foreground'>Click to replace file</p>
              </div>
            )}
          </div>

          {/* JSON error */}
          {jsonError && (
            <div className='flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm'>
              <AlertCircle size={16} />
              {jsonError}
            </div>
          )}

          {/* Parsed structure preview */}
          {parsedJson && (
            <div className='rounded-xl border bg-muted/30 p-5 space-y-4'>
              <h3 className='font-semibold text-sm flex items-center gap-2'>
                <CheckCircle2 size={15} className='text-green-500' />
                Parsed Successfully
              </h3>

              <div className='grid grid-cols-3 gap-3'>
                <div className='rounded-lg border bg-card p-3 text-center'>
                  <div className='text-2xl font-bold'>
                    {parsedJson.topics.length}
                  </div>
                  <div className='text-xs text-muted-foreground'>Sections</div>
                </div>
                <div className='rounded-lg border bg-card p-3 text-center'>
                  <div className='text-2xl font-bold'>{totalLessons}</div>
                  <div className='text-xs text-muted-foreground'>Lessons</div>
                </div>
                <div className='rounded-lg border bg-card p-3 text-center'>
                  <div className='text-2xl font-bold'>
                    {parsedJson.topics.reduce(
                      (s, t) =>
                        s +
                        (t.elements?.filter(
                          (e) => e.type?.toLowerCase() === 'video',
                        ).length ?? 0),
                      0,
                    )}
                  </div>
                  <div className='text-xs text-muted-foreground'>Videos</div>
                </div>
              </div>

              <div className='space-y-1'>
                <p className='text-xs text-muted-foreground font-medium'>
                  Title detected:
                </p>
                <p className='font-semibold'>
                  {parsedJson.landingData.title.en}
                </p>
                {parsedJson.landingData.title.ar && (
                  <p className='text-muted-foreground text-sm' dir='rtl'>
                    {parsedJson.landingData.title.ar}
                  </p>
                )}
              </div>

              {/* Topics list */}
              <div className='space-y-1'>
                <p className='text-xs text-muted-foreground font-medium'>
                  Sections:
                </p>
                <div className='space-y-1 max-h-40 overflow-y-auto pr-1'>
                  {parsedJson.topics.map((t, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between text-sm px-2 py-1.5 rounded-md bg-muted/50'>
                      <span className='truncate'>
                        {i + 1}. {t.title.en}
                      </span>
                      <Badge
                        variant='secondary'
                        className='ml-2 shrink-0 text-xs'>
                        {t.elements?.length ?? 0} lessons
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next button */}
          <div className='flex justify-end'>
            <Button
              disabled={!parsedJson}
              onClick={() => setStep(2)}
              className='gap-2'>
              Next: Configure Metadata
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 2 — Metadata
      ════════════════════════════════════════════════════════ */}
      {step === 2 && parsedJson && (
        <div className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Slug */}
            <div className='space-y-1.5'>
              <Label>
                Slug <span className='text-destructive'>*</span>
              </Label>
              <Input
                value={meta.slug}
                onChange={(e) =>
                  setMeta((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder='course-slug-here'
                className={metaErrors.slug ? 'border-destructive' : ''}
              />
              {metaErrors.slug && (
                <p className='text-xs text-destructive'>{metaErrors.slug}</p>
              )}
            </div>

            {/* Instructor */}
            <div className='space-y-1.5'>
              <Label>
                Instructor <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={meta.instructorId}
                onValueChange={(v) =>
                  setMeta((p) => ({ ...p, instructorId: v }))
                }>
                <SelectTrigger
                  className={
                    metaErrors.instructorId ? 'border-destructive' : ''
                  }>
                  <SelectValue placeholder='Select instructor' />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {metaErrors.instructorId && (
                <p className='text-xs text-destructive'>
                  {metaErrors.instructorId}
                </p>
              )}
            </div>

            {/* Color */}
            <div className='space-y-1.5'>
              <Label>Color Theme</Label>
              <Select
                value={meta.color}
                onValueChange={(v) =>
                  setMeta((p) => ({ ...p, color: v as CourseColor }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className='space-y-1.5'>
              <Label>Difficulty</Label>
              <Select
                value={meta.difficulty}
                onValueChange={(v) =>
                  setMeta((p) => ({ ...p, difficulty: v as CourseDifficulty }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access */}
            <div className='space-y-1.5'>
              <Label>Access Level</Label>
              <Select
                value={meta.access}
                onValueChange={(v) =>
                  setMeta((p) => ({ ...p, access: v as CourseAccess }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESSES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className='space-y-1.5'>
              <Label>Category</Label>
              <Select
                value={meta.category}
                onValueChange={(v) =>
                  setMeta((p) => ({ ...p, category: v as CourseCategory }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className='space-y-1.5'>
              <Label>Content Type</Label>
              <Select
                value={meta.contentType}
                onValueChange={(v) =>
                  setMeta((p) => ({
                    ...p,
                    contentType: v as CourseContentType,
                  }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Hours */}
            <div className='space-y-1.5'>
              <Label>
                Estimated Hours <span className='text-destructive'>*</span>
              </Label>
              <Input
                type='number'
                min={1}
                value={meta.estimatedHours}
                onChange={(e) =>
                  setMeta((p) => ({
                    ...p,
                    estimatedHours: Number(e.target.value),
                  }))
                }
                className={
                  metaErrors.estimatedHours ? 'border-destructive' : ''
                }
              />
            </div>

            {/* Thumbnail */}
            <div className='space-y-1.5 md:col-span-2'>
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={meta.thumbnail}
                onChange={(e) =>
                  setMeta((p) => ({ ...p, thumbnail: e.target.value }))
                }
                placeholder='https://...'
              />
            </div>

            {/* Skills */}
            <div className='space-y-1.5'>
              <Label>Skills (EN, comma-separated)</Label>
              <Textarea
                rows={2}
                value={meta.skills}
                onChange={(e) =>
                  setMeta((p) => ({ ...p, skills: e.target.value }))
                }
                placeholder='SQL Injection, XSS, OWASP'
              />
            </div>

            {/* AR Skills */}
            <div className='space-y-1.5'>
              <Label>Skills (AR, comma-separated)</Label>
              <Textarea
                dir='rtl'
                rows={2}
                value={meta.ar_skills}
                onChange={(e) =>
                  setMeta((p) => ({ ...p, ar_skills: e.target.value }))
                }
                placeholder='حقن SQL، XSS، OWASP'
              />
            </div>

            {/* Tags */}
            <div className='space-y-1.5'>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={meta.tags}
                onChange={(e) =>
                  setMeta((p) => ({ ...p, tags: e.target.value }))
                }
                placeholder='beginner, web, owasp'
              />
            </div>

            {/* Lab Slugs */}
            <div className='space-y-1.5'>
              <Label>Linked Lab Slugs (comma-separated)</Label>
              <Input
                value={meta.labSlugs}
                onChange={(e) =>
                  setMeta((p) => ({ ...p, labSlugs: e.target.value }))
                }
                placeholder='sqli-basics, xss-lab'
              />
            </div>
          </div>

          {/* Flags */}
          <div className='flex flex-wrap gap-6 pt-2 border-t'>
            {(
              [
                { key: 'isNew', label: '🆕 Mark as New' },
                { key: 'isFeatured', label: '⭐ Mark as Featured' },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className='flex items-center gap-2'>
                <Switch
                  checked={meta[key] as boolean}
                  onCheckedChange={(v) => setMeta((p) => ({ ...p, [key]: v }))}
                />
                <Label>{label}</Label>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className='flex justify-between pt-2'>
            <Button
              variant='outline'
              onClick={() => setStep(1)}
              className='gap-2'>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              onClick={() => {
                if (validateMeta()) setStep(3);
              }}
              className='gap-2'>
              Preview Course
              <Eye size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 3 — Preview & Import
      ════════════════════════════════════════════════════════ */}
      {step === 3 && parsedJson && (
        <div className='space-y-6'>
          <CourseImportPreview
            landingData={parsedJson.landingData}
            topics={parsedJson.topics}
            metadata={{
              slug: meta.slug,
              color: meta.color,
              difficulty: meta.difficulty,
              access: meta.access,
              category: meta.category,
              contentType: meta.contentType,
              estimatedHours: Number(meta.estimatedHours),
              isNew: meta.isNew,
              isFeatured: meta.isFeatured,
              thumbnail: meta.thumbnail || undefined,
              tags: meta.tags
                ? meta.tags
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
              skills: meta.skills
                ? meta.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            }}
          />

          {/* Summary box */}
          <div className='rounded-xl border bg-muted/30 p-4 space-y-2 text-sm'>
            <p className='font-semibold'>Import Summary</p>
            <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground'>
              <span>Slug:</span>{' '}
              <span className='font-mono text-foreground'>{meta.slug}</span>
              <span>Access:</span>{' '}
              <span className='font-semibold text-foreground'>
                {meta.access}
              </span>
              <span>Difficulty:</span>{' '}
              <span className='text-foreground'>{meta.difficulty}</span>
              <span>Category:</span>{' '}
              <span className='text-foreground'>
                {meta.category.replace(/_/g, ' ')}
              </span>
              <span>Sections:</span>{' '}
              <span className='text-foreground'>
                {parsedJson.topics.length}
              </span>
              <span>Lessons:</span>{' '}
              <span className='text-foreground'>{totalLessons}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex items-center justify-between gap-4 pt-2 border-t'>
            <Button
              variant='outline'
              onClick={() => setStep(2)}
              className='gap-2'
              disabled={importMutation.isPending}>
              <ArrowLeft size={16} /> Back to Metadata
            </Button>

            <div className='flex gap-3'>
              {/* Save as Draft */}
              <Button
                variant='secondary'
                onClick={() => importMutation.mutate(false)}
                disabled={importMutation.isPending}
                className='gap-2'>
                {importMutation.isPending ? (
                  <Loader2 size={15} className='animate-spin' />
                ) : (
                  <BookOpen size={15} />
                )}
                Import as Draft
              </Button>

              {/* Import & Publish */}
              <Button
                onClick={() => importMutation.mutate(true)}
                disabled={importMutation.isPending}
                className='gap-2 bg-green-600 hover:bg-green-700 text-white'>
                {importMutation.isPending ? (
                  <Loader2 size={15} className='animate-spin' />
                ) : (
                  <Send size={15} />
                )}
                Import & Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
