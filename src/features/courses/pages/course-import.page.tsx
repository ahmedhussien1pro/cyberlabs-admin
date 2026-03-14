// src/features/courses/pages/course-import.page.tsx
// ✅ Instructor: combobox with live search, filters ADMIN/INSTRUCTOR/CONTENT_CREATOR
// ✅ Curriculum: uses adminCoursesApi.create (not coursesApi) → returns full course.id
// ✅ Curriculum: saveCurriculum called after confirmed course.id
// ✅ color sent UPPERCASE to backend, stored UPPERCASE for CourseColor type
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Upload, FileJson, AlertTriangle,
  CheckCircle2, Loader2, BookOpen, AlertCircle, Search, User,
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
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { adminCoursesApi } from '../services/admin-courses.api';
import { usersService }    from '@/core/api/services';
import { ROUTES }          from '@/shared/constants';
import type {
  CourseDifficulty, CourseAccess,
  CourseColor, CourseCategory, CourseContentType,
} from '../types';
import type { AdminCourseCreateDto } from '../types';

// ══ Enum options ══════════════════════════════════════════════════════════════
const DIFFICULTIES: CourseDifficulty[]  = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const ACCESSES: CourseAccess[]          = ['FREE', 'PRO', 'PREMIUM'];
const COLORS: CourseColor[]             = ['BLUE', 'EMERALD', 'VIOLET', 'ORANGE', 'ROSE', 'CYAN'];
const CATEGORIES: CourseCategory[]      = [
  'WEB_SECURITY', 'PENETRATION_TESTING', 'MALWARE_ANALYSIS',
  'CLOUD_SECURITY', 'FUNDAMENTALS', 'CRYPTOGRAPHY',
  'NETWORK_SECURITY', 'TOOLS_AND_TECHNIQUES', 'CAREER_AND_INDUSTRY',
];
const CONTENT_TYPES: CourseContentType[] = ['PRACTICAL', 'THEORETICAL', 'MIXED'];

const INSTRUCTOR_ROLES = ['ADMIN', 'INSTRUCTOR', 'CONTENT_CREATOR'];

// ══ Difficulty mapper ═════════════════════════════════════════════════════════
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

// ══ JSON extractor ════════════════════════════════════════════════════════════
interface Extracted {
  title: string; ar_title: string; slug: string;
  description: string; ar_description: string;
  difficulty: CourseDifficulty | '';
  access: CourseAccess | '';
  category: CourseCategory | '';
  color: CourseColor | '';
  contentType: CourseContentType | '';
  instructorId: string;
  estimatedHours: string;
  topicsCount: number;
  topics: object[];
}

function extractFromJson(raw: string): Extracted {
  const parsed = JSON.parse(raw);
  const ld = parsed.landingData ?? parsed;

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
  // Normalize color from JSON: accept both 'blue' and 'BLUE' → store UPPERCASE
  const rawColor = ((parsed.color as string) ?? '').toUpperCase() as CourseColor;
  const color: CourseColor | '' = COLORS.includes(rawColor) ? rawColor : '';
  const contentType = CONTENT_TYPES.includes(parsed.contentType as CourseContentType)
    ? (parsed.contentType as CourseContentType) : '';

  if (!titleEn) throw new Error('Could not detect a course title from this JSON');

  return {
    title: titleEn, ar_title: titleAr, slug: slugRaw,
    description: descEn, ar_description: descAr,
    difficulty, access, category, color, contentType,
    instructorId: typeof instructorId === 'string' ? instructorId : '',
    estimatedHours, topicsCount: topics.length, topics,
  };
}

type MissingForm = Omit<Extracted, 'topics' | 'topicsCount'>;

function missingFields(f: MissingForm): (keyof MissingForm)[] {
  const required: (keyof MissingForm)[] = [
    'title', 'slug', 'difficulty', 'access', 'category', 'color', 'contentType', 'instructorId',
  ];
  return required.filter((k) => !f[k]);
}

// ══ SelectField ═══════════════════════════════════════════════════════════════
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

// ══ Color picker ══════════════════════════════════════════════════════════════
const COLOR_CLASS: Record<CourseColor, string> = {
  BLUE:    'bg-blue-500',
  EMERALD: 'bg-emerald-500',
  VIOLET:  'bg-violet-500',
  ORANGE:  'bg-orange-500',
  ROSE:    'bg-rose-500',
  CYAN:    'bg-cyan-500',
};
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm'>Color <span className='text-destructive'>*</span></Label>
      <div className='flex gap-2 flex-wrap'>
        {COLORS.map((c) => (
          <button key={c} type='button' onClick={() => onChange(c)}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              value === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
            } ${COLOR_CLASS[c]}`}
            title={c}
          />
        ))}
      </div>
      {value && <p className='text-xs text-muted-foreground'>{value}</p>}
    </div>
  );
}

// ══ InstructorPicker — combobox filtered by role ═══════════════════════════════
function InstructorPicker({
  value, onChange,
}: {
  value: string;
  onChange: (id: string, name: string) => void;
}) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const [displayName, setDisplayName] = useState(value ? `ID: ${value.slice(0, 8)}…` : '');

  const { data: adminData }   = useQuery({
    queryKey: ['users-picker', 'ADMIN'],
    queryFn: () => usersService.getAll({ role: 'ADMIN',           limit: 100 }),
    staleTime: 60_000,
  });
  const { data: instrData }   = useQuery({
    queryKey: ['users-picker', 'INSTRUCTOR'],
    queryFn: () => usersService.getAll({ role: 'INSTRUCTOR',      limit: 100 }),
    staleTime: 60_000,
  });
  const { data: ccData }      = useQuery({
    queryKey: ['users-picker', 'CONTENT_CREATOR'],
    queryFn: () => usersService.getAll({ role: 'CONTENT_CREATOR', limit: 100 }),
    staleTime: 60_000,
  });

  const allUsers = [
    ...(adminData?.data ?? []),
    ...(instrData?.data ?? []),
    ...(ccData?.data   ?? []),
  ].filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);

  const filtered = search
    ? allUsers.filter((u) =>
        (u.name ?? u.email).toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const ROLE_BADGE: Record<string, string> = {
    ADMIN:           'bg-rose-500/20 text-rose-400',
    INSTRUCTOR:      'bg-blue-500/20 text-blue-400',
    CONTENT_CREATOR: 'bg-violet-500/20 text-violet-400',
  };

  return (
    <div className='space-y-1.5'>
      <Label className='text-sm'>Instructor <span className='text-destructive'>*</span></Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' role='combobox' aria-expanded={open}
            className='w-full justify-start h-9 font-normal gap-2'>
            <User className='h-4 w-4 shrink-0 text-muted-foreground' />
            <span className='truncate'>
              {displayName || <span className='text-muted-foreground'>Select instructor…</span>}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 p-0' align='start'>
          <Command shouldFilter={false}>
            <div className='flex items-center border-b px-3'>
              <Search className='h-4 w-4 mr-2 shrink-0 text-muted-foreground' />
              <CommandInput
                placeholder='Search by name or email…'
                value={search}
                onValueChange={setSearch}
                className='border-0 focus:ring-0 h-10'
              />
            </div>
            <CommandList className='max-h-64'>
              {filtered.length === 0 && (
                <CommandEmpty className='py-4 text-center text-sm text-muted-foreground'>
                  {allUsers.length === 0 ? 'Loading…' : 'No users found'}
                </CommandEmpty>
              )}
              {INSTRUCTOR_ROLES.map((role) => {
                const group = filtered.filter((u) => u.role === role);
                if (group.length === 0) return null;
                return (
                  <CommandGroup key={role} heading={role.replace('_', ' ')}>
                    {group.map((u) => (
                      <CommandItem key={u.id} value={u.id}
                        onSelect={() => {
                          const label = u.name ? `${u.name} (${u.email})` : u.email;
                          onChange(u.id, label);
                          setDisplayName(label);
                          setOpen(false);
                          setSearch('');
                        }}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          ROLE_BADGE[u.role] ?? 'bg-muted text-muted-foreground'
                        }`}>{u.role}</span>
                        <span className='flex-1 truncate'>
                          {u.name && <span className='font-medium'>{u.name}</span>}
                          <span className='text-muted-foreground text-xs ml-1'>{u.email}</span>
                        </span>
                        {value === u.id && <CheckCircle2 className='h-3.5 w-3.5 text-emerald-400 shrink-0' />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
            <div className='border-t p-2'>
              <p className='text-[10px] text-muted-foreground mb-1'>Or paste UUID directly:</p>
              <Input className='h-7 text-xs font-mono' placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                defaultValue={value}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v) { onChange(v, `ID: ${v.slice(0, 8)}…`); setDisplayName(`ID: ${v.slice(0, 8)}…`); }
                }}
              />
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <p className='text-[10px] text-muted-foreground font-mono'>ID: {value}</p>
      )}
    </div>
  );
}

// ══ ParsedPreview ═════════════════════════════════════════════════════════════
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

// ══ Main page ═════════════════════════════════════════════════════════════════
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
        title: ext.title, ar_title: ext.ar_title, slug: ext.slug,
        description: ext.description, ar_description: ext.ar_description,
        difficulty: ext.difficulty, access: ext.access,
        category: ext.category, color: ext.color,
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

  const missing   = extracted ? missingFields(form) : [];
  const canImport = extracted !== null && missing.length === 0;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!extracted || !canImport) throw new Error('Fill all required fields first');

      const dto: AdminCourseCreateDto = {
        title:          form.title,
        ar_title:       form.ar_title     || undefined,
        slug:           form.slug,
        description:    form.description  || undefined,
        ar_description: form.ar_description || undefined,
        difficulty:     form.difficulty   as CourseDifficulty,
        access:         form.access       as CourseAccess,
        category:       form.category     as CourseCategory,
        color:          form.color        as CourseColor,   // already UPPERCASE
        contentType:    form.contentType  as CourseContentType,
        instructorId:   form.instructorId,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      };

      const course = await adminCoursesApi.create(dto);

      if (!course?.id) {
        throw new Error('Course created but backend returned no id — check API response');
      }

      if (extracted.topics.length > 0) {
        try {
          await adminCoursesApi.saveCurriculum(course.id, extracted.topics);
        } catch (currErr: any) {
          const msg = currErr?.response?.data?.message ?? currErr?.message ?? 'Unknown';
          toast.warning(`Course created ✓ but curriculum failed: ${Array.isArray(msg) ? msg.join(' · ') : msg}`);
          return course;
        }
      }

      return course;
    },
    onSuccess: (course) => {
      const topicMsg = (extracted?.topics.length ?? 0) > 0
        ? ` + ${extracted!.topics.length} topics` : '';
      toast.success(`"${course.title}" imported${topicMsg}!`);
      navigate(`/courses/${course.slug}/edit`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Import failed';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  return (
    <div className='space-y-6 max-w-2xl'>
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

      {extracted && <ParsedPreview ext={extracted} />}

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
                Required but not detected:{' '}
                <span className='text-amber-400 font-mono'>{missing.join(', ')}</span>
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
                <Label className='text-sm'>Est. Hours</Label>
                <Input type='number' min={1} value={form.estimatedHours} placeholder='e.g. 3'
                  onChange={(e) => set('estimatedHours', e.target.value)} />
              </div>
            </div>

            <InstructorPicker
              value={form.instructorId}
              onChange={(id) => set('instructorId', id)}
            />

            <div className='grid grid-cols-2 gap-4'>
              <SField label='Difficulty *'   value={form.difficulty}  options={DIFFICULTIES}
                onChange={(v) => set('difficulty',  v as CourseDifficulty)} />
              <SField label='Access *'       value={form.access}      options={ACCESSES}
                onChange={(v) => set('access',      v as CourseAccess)} />
              <SField label='Category *'     value={form.category}    options={CATEGORIES}
                onChange={(v) => set('category',    v as CourseCategory)} />
              <SField label='Content Type *' value={form.contentType} options={CONTENT_TYPES}
                onChange={(v) => set('contentType', v as CourseContentType)} />
            </div>

            <ColorPicker value={form.color} onChange={(v) => set('color', v as CourseColor)} />
          </CardContent>
        </Card>
      )}

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
