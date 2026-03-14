// src/features/courses/pages/course-import.page.tsx
// ✅ Parses both flat format AND landingData-nested format (like the real course JSON files)
// ✅ Detects missing required fields: instructor, color, access, category, contentType, difficulty
// ✅ Shows only missing fields in a form — pre-fills what’s detected from JSON
// ✅ Saves curriculum topics after course creation
// ✅ FIX: color sent as UPPERCASE to backend (backend enum: BLUE, EMERALD...) then normalize() lowercases on response
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Upload, FileJson, AlertTriangle,
  CheckCircle2, Loader2, BookOpen, AlertCircle,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { adminCoursesApi } from '../services/admin-courses.api';
import { coursesApi }      from '../services/courses.api';
import { ROUTES }          from '@/shared/constants';
import type {
  CourseDifficulty, CourseAccess,
  CourseColor, CourseCategory, CourseContentType,
} from '../types/admin-course.types';
import type { CourseCreateDto } from '../types/course.types';

// ══ Enum options ══════════════════════════════════════════════════════
const DIFFICULTIES: CourseDifficulty[]  = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const ACCESSES: CourseAccess[]          = ['FREE', 'PRO', 'PREMIUM'];
// UI uses lowercase for Tailwind classes; we toUpperCase() before sending to backend
const COLORS: CourseColor[]             = ['blue', 'emerald', 'violet', 'orange', 'rose', 'cyan'];
const CATEGORIES: CourseCategory[]      = [
  'WEB_SECURITY', 'PENETRATION_TESTING', 'MALWARE_ANALYSIS',
  'CLOUD_SECURITY', 'FUNDAMENTALS', 'CRYPTOGRAPHY',
  'NETWORK_SECURITY', 'TOOLS_AND_TECHNIQUES', 'CAREER_AND_INDUSTRY',
];
const CONTENT_TYPES: CourseContentType[] = ['PRACTICAL', 'THEORETICAL', 'MIXED'];

// ══ Difficulty text → enum mapper ════════════════════════════════════════
function guessDifficulty(raw?: string): CourseDifficulty | '' {
  if (!raw) return '';
  const v = raw.toLowerCase();
  if (v.includes('beginner'))     return 'BEGINNER';
  if (v.includes('intermediate')) return 'INTERMEDIATE';
  if (v.includes('advanced'))     return 'ADVANCED';
  if (v.includes('expert'))       return 'EXPERT';
  const upper = raw.toUpperCase() as CourseDifficulty;
  if (DIFFICULTIES.includes(upper)) return upper;
  return '';
}

// ══ Smart JSON parser (supports flat format AND landingData format) ═════════
interface Extracted {
  title:          string;
  ar_title:       string;
  slug:           string;
  description:    string;
  ar_description: string;
  difficulty:     CourseDifficulty | '';
  access:         CourseAccess | '';
  category:       CourseCategory | '';
  color:          CourseColor | '';   // stored lowercase for UI/Tailwind
  contentType:    CourseContentType | '';
  instructorId:   string;
  estimatedHours: string;
  topicsCount:    number;
  topics:         object[];
}

function extractFromJson(raw: string): Extracted {
  const parsed = JSON.parse(raw);
  const ld     = parsed.landingData ?? parsed;

  const titleEn = ld.title?.en   ?? parsed.title       ?? '';
  const titleAr = ld.title?.ar   ?? parsed.ar_title     ?? '';
  const descEn  = ld.description?.en ?? parsed.description  ?? '';
  const descAr  = ld.description?.ar ?? parsed.ar_description ?? '';

  const rawDiff    = ld.difficulty?.en ?? ld.difficulty ?? parsed.difficulty ?? '';
  const difficulty = guessDifficulty(typeof rawDiff === 'string' ? rawDiff : '');

  const slugRaw = parsed.slug
    ?? titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const instructorId = parsed.instructorId ?? parsed.instructor ?? ld.instructor ?? '';

  const durRaw = ld.duration?.en ?? ld.duration ?? parsed.estimatedHours ?? parsed.duration ?? '';
  let estimatedHours = '';
  if (typeof durRaw === 'number') {
    estimatedHours = String(durRaw);
  } else {
    const m = String(durRaw).match(/(\d+)/);
    if (m) {
      const num = parseInt(m[1]);
      estimatedHours = num >= 60 ? String(Math.round(num / 60)) : String(num);
    }
  }

  const topics: object[] = Array.isArray(parsed.topics) ? parsed.topics : [];

  const access = ACCESSES.includes((parsed.access ?? '').toUpperCase() as CourseAccess)
    ? ((parsed.access as string).toUpperCase() as CourseAccess) : '';
  const category = CATEGORIES.includes(parsed.category as CourseCategory)
    ? (parsed.category as CourseCategory) : '';
  // store lowercase for UI; toUpperCase() happens in mutationFn before POST
  const color = COLORS.includes((parsed.color ?? '').toLowerCase() as CourseColor)
    ? ((parsed.color as string).toLowerCase() as CourseColor) : '';
  const contentType = CONTENT_TYPES.includes(parsed.contentType as CourseContentType)
    ? (parsed.contentType as CourseContentType) : '';

  if (!titleEn) throw new Error('Could not detect a course title from this JSON');

  return {
    title: titleEn,       ar_title: titleAr,
    slug: slugRaw,
    description: descEn,  ar_description: descAr,
    difficulty, access, category,
    color, contentType,
    instructorId: typeof instructorId === 'string' ? instructorId : '',
    estimatedHours,
    topicsCount: topics.length,
    topics,
  };
}

// ══ Types ══════════════════════════════════════════════════════════════
type MissingForm = Omit<Extracted, 'topics' | 'topicsCount'>;

function missingFields(f: MissingForm): (keyof MissingForm)[] {
  const required: (keyof MissingForm)[] = [
    'title', 'slug', 'difficulty', 'access', 'category', 'color', 'contentType', 'instructorId',
  ];
  return required.filter((k) => !f[k]);
}

// ══ SelectField helper ───────────────────────────────────────────────
function SField({
  label, value, options, onChange,
}: {
  label: string; value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm'>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='h-9'>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

// ══ Color swatch picker (UI lowercase, sends UPPERCASE to API) ────────────────
const COLOR_CLASS: Record<CourseColor, string> = {
  blue: 'bg-blue-500', emerald: 'bg-emerald-500', violet: 'bg-violet-500',
  orange: 'bg-orange-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500',
};
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm'>Color <span className='text-destructive'>*</span></Label>
      <div className='flex gap-2 flex-wrap'>
        {COLORS.map((c) => (
          <button key={c} type='button' onClick={() => onChange(c)}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              value === c
                ? 'border-foreground scale-110 shadow-md'
                : 'border-transparent opacity-60 hover:opacity-100'
            } ${COLOR_CLASS[c]}`}
            title={c}
          />
        ))}
      </div>
      {value && <p className='text-xs text-muted-foreground'>{value}</p>}
    </div>
  );
}

// ══ ParsedPreview ──────────────────────────────────────────────────────────
function ParsedPreview({ ext }: { ext: Extracted }) {
  return (
    <Card className='border-primary/30 bg-primary/5'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <CheckCircle2 className='h-4 w-4 text-emerald-400' /> Detected from JSON
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 text-sm'>
        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
          <div>
            <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>Title EN</p>
            <p className='font-semibold'>{ext.title}</p>
          </div>
          {ext.ar_title && (
            <div dir='rtl'>
              <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>عنوان</p>
              <p className='font-semibold'>{ext.ar_title}</p>
            </div>
          )}
          <div>
            <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>Slug</p>
            <p className='font-mono text-xs'>{ext.slug}</p>
          </div>
          {ext.difficulty && (
            <div>
              <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>Difficulty</p>
              <p>{ext.difficulty}</p>
            </div>
          )}
          {ext.estimatedHours && (
            <div>
              <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>Est. Hours</p>
              <p>{ext.estimatedHours}h</p>
            </div>
          )}
        </div>
        {ext.topicsCount > 0 && (
          <div className='flex items-center gap-2 pt-2 border-t border-border/40 mt-2'>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
            <span><strong>{ext.topicsCount}</strong> topics detected</span>
            <Badge variant='outline' className='ml-auto text-xs'>Curriculum included</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══ Main page ══════════════════════════════════════════════════════════════
export default function CourseImportPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);
  const [raw,        setRaw]        = useState('');
  const [extracted,  setExtracted]  = useState<Extracted | null>(null);
  const [parseError, setParseError] = useState('');

  const [form, setForm] = useState<MissingForm>({
    title: '', ar_title: '', slug: '', description: '', ar_description: '',
    difficulty: '', access: '', category: '', color: '', contentType: '',
    instructorId: '', estimatedHours: '',
  });

  const set = <K extends keyof MissingForm>(k: K, v: MissingForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const tryParse = (text: string) => {
    setParseError('');
    try {
      const ext = extractFromJson(text);
      setExtracted(ext);
      setForm({
        title: ext.title,           ar_title: ext.ar_title,
        slug: ext.slug,
        description: ext.description, ar_description: ext.ar_description,
        difficulty: ext.difficulty,   access: ext.access,
        category: ext.category,       color: ext.color,
        contentType: ext.contentType, instructorId: ext.instructorId,
        estimatedHours: ext.estimatedHours,
      });
    } catch (e: any) {
      setExtracted(null);
      setParseError(e.message ?? 'Invalid JSON');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRaw(text); tryParse(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const missing    = extracted ? missingFields(form) : [];
  const canImport  = extracted !== null && missing.length === 0;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!extracted || !canImport) throw new Error('Fill all required fields first');

      const dto: CourseCreateDto = {
        title:          form.title,
        ar_title:       form.ar_title     || undefined,
        slug:           form.slug,
        description:    form.description  || undefined,
        difficulty:     form.difficulty   as CourseDifficulty,
        access:         form.access       as CourseAccess,
        category:       form.category     as CourseCategory,
        // ✅ backend expects UPPERCASE enum: BLUE, EMERALD, etc.
        // normalize() in courses.api.ts lowercases it back on response
        color:          (form.color as string).toUpperCase() as any,
        contentType:    form.contentType  as CourseContentType,
        instructorId:   form.instructorId,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      };

      const course = await coursesApi.create(dto);

      if (extracted.topics.length > 0) {
        await adminCoursesApi.saveCurriculum(course.id, extracted.topics);
      }

      return course;
    },
    onSuccess: (course) => {
      toast.success(`“${course.title}” imported — ${extracted!.topics.length} topics saved!`);
      navigate(`/courses/${course.slug}/edit`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Import failed';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' className='gap-2'
          onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <div>
          <h1 className='text-xl font-bold'>Import Course from JSON</h1>
          <p className='text-xs text-muted-foreground'>
            Upload a course JSON file — metadata and curriculum will be detected automatically.
          </p>
        </div>
      </div>

      {/* Upload / Paste */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <FileJson className='h-4 w-4 text-primary' /> Course JSON
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3'>
            <input ref={fileRef} type='file' accept='.json,application/json'
              className='hidden' onChange={handleFile} />
            <Button variant='outline' size='sm' className='gap-2'
              onClick={() => fileRef.current?.click()}>
              <Upload className='h-4 w-4' /> Choose .json file
            </Button>
            <span className='text-xs text-muted-foreground'>or paste below</span>
          </div>

          <Textarea rows={8} placeholder='Paste course JSON here…'
            value={raw} className='font-mono text-xs resize-y'
            onChange={(e) => {
              setRaw(e.target.value);
              if (e.target.value.trim()) tryParse(e.target.value);
              else { setExtracted(null); setParseError(''); }
            }}
          />

          {parseError && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
              <AlertTriangle className='h-3.5 w-3.5 mt-0.5 shrink-0' /> {parseError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detected preview */}
      {extracted && <ParsedPreview ext={extracted} />}

      {/* Missing / editable fields form */}
      {extracted && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              {missing.length > 0
                ? <><AlertCircle className='h-4 w-4 text-amber-400' /> Fill Missing Fields</>
                : <><CheckCircle2 className='h-4 w-4 text-emerald-400' /> Course Details</>}
            </CardTitle>
            {missing.length > 0 && (
              <p className='text-xs text-muted-foreground'>
                Required but not detected:
                {' '}<span className='text-amber-400 font-mono'>{missing.join(', ')}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className='space-y-4'>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-sm'>Title EN <span className='text-destructive'>*</span></Label>
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className='space-y-1.5' dir='rtl'>
                <Label className='text-sm'>عنوان AR</Label>
                <Input value={form.ar_title} onChange={(e) => set('ar_title', e.target.value)} />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-sm'>Slug <span className='text-destructive'>*</span></Label>
                <Input value={form.slug} dir='ltr' placeholder='course-slug-here'
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-sm'>Instructor ID <span className='text-destructive'>*</span></Label>
                <Input value={form.instructorId} placeholder='instructor-uuid or name'
                  onChange={(e) => set('instructorId', e.target.value)} />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <SField label='Difficulty *'  value={form.difficulty}  options={DIFFICULTIES}
                onChange={(v) => set('difficulty',  v as CourseDifficulty)} />
              <SField label='Access *'      value={form.access}      options={ACCESSES}
                onChange={(v) => set('access',      v as CourseAccess)} />
              <SField label='Category *'    value={form.category}    options={CATEGORIES}
                onChange={(v) => set('category',    v as CourseCategory)} />
              <SField label='Content Type *' value={form.contentType} options={CONTENT_TYPES}
                onChange={(v) => set('contentType', v as CourseContentType)} />
            </div>

            <div className='w-40 space-y-1.5'>
              <Label className='text-sm'>Estimated Hours</Label>
              <Input type='number' min={1} value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)} placeholder='e.g. 3' />
            </div>

            <ColorPicker value={form.color} onChange={(v) => set('color', v as CourseColor)} />

          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={() => navigate(ROUTES.COURSES)}>Cancel</Button>
        <Button disabled={!canImport || isPending} className='gap-2 min-w-[160px]'
          onClick={() => mutate()}>
          {isPending
            ? <><Loader2 className='h-4 w-4 animate-spin' /> Importing…</>
            : <><FileJson className='h-4 w-4' /> Import Course</>}
        </Button>
      </div>
    </div>
  );
}
