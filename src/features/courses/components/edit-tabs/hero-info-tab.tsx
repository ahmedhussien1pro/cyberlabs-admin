// src/features/courses/components/edit-tabs/hero-info-tab.tsx
// ✅ Pre-fills ALL fields from DB on mount
// ✅ Toast validation for required fields before save
// ✅ Preview dialog — hero styled exactly like CoursePlatformPreviewTab
// ✅ Language driven by admin topbar (i18n.language)
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Eye, AlertTriangle, X, BookOpen, Clock, Shield, FlaskConical, Crown, Unlock, Gem, Rocket, Heart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MatrixRain } from '@/shared/components/common/matrix-rain';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse } from '../../types/admin-course.types';
import {
  COURSE_DIFFICULTIES,
  COURSE_ACCESSES,
  COURSE_COLORS,
  COURSE_CONTENT_TYPES,
  COURSE_CATEGORIES,
  enumLabel,
} from '../../constants/course-enums';

// ── Color maps (mirror course-preview-tab) ────────────────────────────
const MATRIX_COLOR: Record<string, string> = {
  emerald:'#10b981', blue:'#3b82f6', violet:'#8b5cf6',
  rose:'#f43f5e', orange:'#f97316', cyan:'#06b6d4',
};
const STRIPE: Record<string, string> = {
  emerald:'bg-emerald-500', blue:'bg-blue-500', violet:'bg-violet-500',
  rose:'bg-rose-500', orange:'bg-orange-500', cyan:'bg-cyan-500',
};
const BLOOM: Record<string, string> = {
  emerald:'bg-emerald-500', blue:'bg-blue-500', violet:'bg-violet-500',
  rose:'bg-rose-500', orange:'bg-orange-500', cyan:'bg-cyan-500',
};
const TEXT_COLOR: Record<string, string> = {
  emerald:'text-emerald-400', blue:'text-blue-400', violet:'text-violet-400',
  rose:'text-rose-400', orange:'text-orange-400', cyan:'text-cyan-400',
};
const FALLBACK_BG: Record<string, string> = {
  emerald:'from-emerald-950 to-emerald-900', blue:'from-blue-950 to-blue-900',
  violet:'from-violet-950 to-violet-900', rose:'from-rose-950 to-rose-900',
  orange:'from-orange-950 to-orange-900', cyan:'from-cyan-950 to-cyan-900',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};
const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock, PRO: Crown, PREMIUM: Gem,
};

// ── Types ────────────────────────────────────────────────────────────────
interface Props { course: AdminCourse; onSaved: () => void; }

interface FormState {
  title:              string;
  ar_title:           string;
  color:              string;
  image:              string;
  thumbnail:          string;
  access:             string;
  difficulty:         string;
  category:           string;
  contentType:        string;
  state:              string;
  isNew:              boolean;
  isFeatured:         boolean;
  estimatedHours:     string;
  description:        string;
  ar_description:     string;
  longDescription:    string;
  ar_longDescription: string;
  labsLink:           string;
  skills:             string[];
  ar_skills:          string[];
  topics:             string[];
  ar_topics:          string[];
  prerequisites:      string[];
  ar_prerequisites:   string[];
  tags:               string[];
}

const REQUIRED_HERO: Array<{ key: keyof FormState; label: string; labelAr: string }> = [
  { key: 'title',       label: 'Title (EN)',       labelAr: 'العنوان (EN)' },
  { key: 'description', label: 'Description (EN)', labelAr: 'الوصف (EN)' },
];

const STATE_OPTIONS   = ['DRAFT', 'PUBLISHED', 'COMING_SOON'];

// ── TagsInput ────────────────────────────────────────────────────────────
function TagsInput({
  label, value, onChange, dir = 'ltr',
}: { label: string; value: string[]; onChange: (v: string[]) => void; dir?: 'ltr' | 'rtl' }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInput(''); }
  };
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs'>{label}</Label>
      <div dir={dir} className='flex flex-wrap gap-1.5 rounded-lg border border-border bg-background p-2 min-h-[2.5rem]'>
        {value.map((t) => (
          <Badge key={t} variant='secondary' className='gap-1 text-xs'>
            {t}
            <button type='button' onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}
        <input
          dir={dir}
          className='flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          placeholder={dir === 'rtl' ? 'اكتب واضغط Enter' : 'Type & press Enter'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
      </div>
    </div>
  );
}

// ── Stat pill (mirrors course-preview-tab) ─────────────────────────────
function Stat({ icon, value, label, textClass }: {
  icon: React.ReactNode; value?: number | string; label?: string; textClass: string;
}) {
  return (
    <div className='flex items-center gap-1.5 text-xs'>
      <span className={textClass}>{icon}</span>
      <span className='font-bold text-white'>{value}</span>
      {label && <span className='text-white/45'>{label}</span>}
    </div>
  );
}

// ── Live Hero Preview (same markup as CoursePlatformPreviewTab hero) ─────
function LiveHeroPreview({ form, course, isAr }: {
  form: FormState; course: AdminCourse; isAr: boolean;
}) {
  const col        = (form.color ?? 'blue').toLowerCase();
  const matrixHex  = MATRIX_COLOR[col] ?? '#3b82f6';
  const textCls    = TEXT_COLOR[col] ?? 'text-blue-400';
  const imgSrc     = form.image || form.thumbnail || course.image || course.thumbnail;
  const comingSoon = form.state === 'COMING_SOON';
  const AccessIcon = ACCESS_ICON[form.access ?? 'FREE'] ?? Unlock;

  const title = isAr ? form.ar_title || form.title : form.title;
  const desc  = isAr ? form.ar_description || form.description : form.description;

  return (
    <div className='rounded-xl overflow-hidden border border-border/50 bg-background' dir={isAr ? 'rtl' : 'ltr'}>
      {/* ━━━ HERO ━━━ */}
      <section className='relative overflow-hidden border-b border-white/8 bg-zinc-950'>
        {/* Color stripe */}
        <div className={cn('absolute inset-x-0 top-0 z-[3] h-[3px]', STRIPE[col] ?? 'bg-blue-500')} />

        {/* MatrixRain — same as frontend */}
        <MatrixRain color={matrixHex} opacity={0.07} speed={6} />

        {/* Bloom */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -start-20 -top-10 z-[2] h-56 w-56 rounded-full blur-3xl opacity-[0.12]',
            BLOOM[col] ?? 'bg-blue-500',
          )}
        />

        {/* Content */}
        <div className='container relative z-[4] mx-auto px-4'>
          <div className='py-6'>
            {/* Breadcrumb */}
            <nav className='mb-4 flex items-center gap-1 text-[11px] text-white/35'>
              <span>{isAr ? 'الكورسات' : 'Courses'}</span>
              <span className='mx-1 text-white/20'>/</span>
              <span className='truncate text-white/65'>{title || (isAr ? 'عنوان الكورس' : 'Course Title')}</span>
            </nav>

            {/* Icon + Text row */}
            <div className='flex flex-col gap-5 min-w-0'>
              <div className='flex items-start gap-4'>
                {/* Thumbnail */}
                <div className='hidden sm:block shrink-0'>
                  <div className='h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10'>
                    {imgSrc ? (
                      <img src={imgSrc} alt={title ?? ''} className='h-full w-full object-cover' />
                    ) : (
                      <div className={cn(
                        'h-full w-full flex items-center justify-center bg-gradient-to-br border border-white/10',
                        FALLBACK_BG[col] ?? 'from-zinc-900 to-zinc-800',
                      )}>
                        <p className={cn('text-[9px] font-black text-center px-1.5 leading-tight', textCls)}>
                          {(title || 'Course')?.slice(0, 12)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text block */}
                <div className='min-w-0 flex-1 space-y-2'>
                  {/* Badges */}
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <Badge
                      variant='outline'
                      className={cn('rounded-full text-[11px] font-bold gap-1', ACCESS_BADGE[form.access ?? 'FREE'] ?? ACCESS_BADGE.FREE)}>
                      <AccessIcon className='h-2.5 w-2.5' />
                      {form.access ?? 'FREE'}
                    </Badge>
                    {form.difficulty && (
                      <Badge variant='outline' className='rounded-full border-white/20 text-[11px] text-white/65 gap-1'>
                        <Shield className='h-2.5 w-2.5' /> {form.difficulty}
                      </Badge>
                    )}
                    {form.category && (
                      <Badge variant='outline' className='rounded-full border-white/15 text-[11px] text-white/50'>
                        {form.category.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {form.isNew && (
                      <span className='inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                        {isAr ? 'جديد' : 'New'}
                      </span>
                    )}
                    {comingSoon && (
                      <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-600/80 px-2 py-0.5 text-[10px] font-bold text-white'>
                        <Clock className='h-2.5 w-2.5' /> {isAr ? 'قريباً' : 'Coming Soon'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className='text-xl font-black leading-tight tracking-tight text-white sm:text-2xl'>
                    {title || <span className='opacity-30 italic'>{isAr ? 'عنوان الكورس' : 'Course Title'}</span>}
                  </h1>

                  {/* Description */}
                  {desc && (
                    <p className='mt-2 max-w-2xl text-sm leading-relaxed text-white/60'>{desc}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats bar */}
          <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 py-3'>
            <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5'>
              {(course.totalTopics ?? 0) > 0 && (
                <Stat icon={<BookOpen className='h-3.5 w-3.5' />} value={course.totalTopics} label={isAr ? 'موضوع' : 'Topics'} textClass={textCls} />
              )}
              {Number(form.estimatedHours) > 0 && (
                <Stat icon={<Clock className='h-3.5 w-3.5' />} value={`${form.estimatedHours}h`} label='est.' textClass={textCls} />
              )}
              <div className='flex items-center gap-1.5 text-xs'>
                <span className={textCls}><FlaskConical className='h-3.5 w-3.5' /></span>
                <span className='font-bold text-white'>{isAr ? 'مختبرات' : 'Labs'}</span>
              </div>
              {(course.enrollmentCount ?? 0) > 0 && (
                <Stat icon={<Users className='h-3.5 w-3.5' />} value={(course.enrollmentCount ?? 0).toLocaleString()} label={isAr ? 'مسجل' : 'enrolled'} textClass={textCls} />
              )}
            </div>
            <div className='flex items-center gap-2'>
              <button className='flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/50 cursor-default'>
                <Heart className='h-3.5 w-3.5' /> {isAr ? 'حفظ' : 'Save'}
              </button>
              <button className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white cursor-default',
                comingSoon ? 'border border-white/15 bg-white/5 text-white/50' : 'bg-primary',
              )}>
                {comingSoon
                  ? <><Clock className='h-3.5 w-3.5' /> {isAr ? 'قريباً' : 'Coming Soon'}</>
                  : <><Rocket className='h-3.5 w-3.5' /> {isAr ? 'ابدأ مجاناً' : 'Start Free'}</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Long description preview */}
      {(isAr ? form.ar_longDescription : form.longDescription) && (
        <div className='px-5 pt-6'>
          <div className='p-4 rounded-xl border border-border/40 bg-muted/20'>
            <p className='text-sm text-foreground/70 leading-7'>
              {isAr ? form.ar_longDescription : form.longDescription}
            </p>
          </div>
        </div>
      )}

      {/* Skills / Prerequisites teaser */}
      {(form.skills.length > 0 || form.prerequisites.length > 0) && (
        <div className='bg-zinc-900/60 px-5 py-3 flex flex-wrap gap-4 border-t border-white/5 mt-4'>
          {form.skills.length > 0 && (
            <div>
              <p className='text-[10px] text-white/30 mb-1'>{isAr ? 'مهارات' : 'Skills'}</p>
              <div className='flex flex-wrap gap-1'>
                {(isAr ? form.ar_skills.length > 0 ? form.ar_skills : form.skills : form.skills).slice(0, 4).map((s) => (
                  <span key={s} className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50'>{s}</span>
                ))}
                {form.skills.length > 4 && <span className='text-[10px] text-white/30'>+{form.skills.length - 4}</span>}
              </div>
            </div>
          )}
          {form.prerequisites.length > 0 && (
            <div>
              <p className='text-[10px] text-white/30 mb-1'>{isAr ? 'متطلبات' : 'Prerequisites'}</p>
              <div className='flex flex-wrap gap-1'>
                {(isAr ? form.ar_prerequisites.length > 0 ? form.ar_prerequisites : form.prerequisites : form.prerequisites).slice(0, 3).map((s) => (
                  <span key={s} className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50'>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// I need Users import – adding it
import { Users } from 'lucide-react';

// ── Main component ────────────────────────────────────────────────────────────
export function HeroInfoTab({ course, onSaved }: Props) {
  const { t, i18n } = useTranslation('courses');
  const isAr = i18n.language === 'ar';
  const [previewOpen, setPreviewOpen] = useState(false);

  // ✅ Pre-fill ALL fields from DB
  const [form, setForm] = useState<FormState>({
    title:              course.title              ?? '',
    ar_title:           course.ar_title           ?? '',
    color:              (course.color             ?? 'blue').toLowerCase(),
    image:              course.image              ?? '',
    thumbnail:          course.thumbnail          ?? '',
    access:             course.access             ?? 'FREE',
    difficulty:         course.difficulty         ?? 'BEGINNER',
    category:           course.category           ?? 'GENERAL',
    contentType:        course.contentType        ?? 'MIXED',
    state:              course.state              ?? 'DRAFT',
    isNew:              course.isNew              ?? false,
    isFeatured:         course.isFeatured         ?? false,
    estimatedHours:     String(course.estimatedHours ?? 0),
    description:        course.description        ?? '',
    ar_description:     course.ar_description     ?? '',
    longDescription:    course.longDescription    ?? '',
    ar_longDescription: course.ar_longDescription ?? '',
    labsLink:           course.labsLink           ?? '',
    skills:             [...(course.skills             ?? [])],
    ar_skills:          [...(course.ar_skills          ?? [])],
    topics:             [...(course.topics             ?? [])],
    ar_topics:          [...(course.ar_topics          ?? [])],
    prerequisites:      [...(course.prerequisites      ?? [])],
    ar_prerequisites:   [...(course.ar_prerequisites   ?? [])],
    tags:               [...(course.tags               ?? [])],
  });

  const set = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const missing = REQUIRED_HERO
      .filter((f) => !String(form[f.key]).trim())
      .map((f) => isAr ? f.labelAr : f.label);
    if (missing.length > 0) {
      toast.error(
        <div className='flex items-start gap-2'>
          <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5 text-amber-400' />
          <div>
            <p className='font-semibold'>{isAr ? 'حقول مطلوبة' : 'Required fields missing'}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>{missing.join(' · ')}</p>
          </div>
        </div>
      );
      return false;
    }
    return true;
  };

  // ── Save mutation ────────────────────────────────────────────────────────────
  const mut = useMutation({
    mutationFn: () => adminCoursesApi.update(course.id, {
      color:              form.color              as any,
      image:              form.image              || null,
      thumbnail:          form.thumbnail          || null,
      access:             form.access             as any,
      difficulty:         form.difficulty         as any,
      category:           form.category           as any,
      contentType:        form.contentType        as any,
      state:              form.state              as any,
      isNew:              form.isNew,
      isFeatured:         form.isFeatured,
      estimatedHours:     Number(form.estimatedHours),
      description:        form.description        || null,
      ar_description:     form.ar_description     || null,
      longDescription:    form.longDescription    || null,
      ar_longDescription: form.ar_longDescription || null,
      labsLink:           form.labsLink           || null,
      skills:             form.skills,
      ar_skills:          form.ar_skills,
      topics:             form.topics,
      ar_topics:          form.ar_topics,
      prerequisites:      form.prerequisites,
      ar_prerequisites:   form.ar_prerequisites,
      tags:               form.tags,
    }),
    onSuccess: () => {
      toast.success(isAr ? 'تم حفظ بيانات الهيرو ✔' : 'Hero info saved ✔');
      onSaved();
    },
    onError: () => toast.error(isAr ? 'فشل الحفظ' : 'Failed to save'),
  });

  const handleSave = () => { if (validate()) mut.mutate(); };

  const lbl = (en: string, ar: string) => isAr ? ar : en;

  return (
    <div className='space-y-6' dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Visual ── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{lbl('Visual & Status', 'المظهر والحالة')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>

            {/* Color */}
            <div className='space-y-1.5'>
              <Label>{lbl('Color', 'اللون')}</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v.toLowerCase())}>
                <SelectTrigger>
                  <div className='flex items-center gap-2'>
                    <span className={cn('h-3 w-3 rounded-full', {
                      'bg-emerald-500': form.color === 'emerald',
                      'bg-blue-500':    form.color === 'blue',
                      'bg-violet-500':  form.color === 'violet',
                      'bg-rose-500':    form.color === 'rose',
                      'bg-orange-500':  form.color === 'orange',
                      'bg-cyan-500':    form.color === 'cyan',
                    })} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COURSE_COLORS.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      <div className='flex items-center gap-2'>
                        <span className={cn('h-3 w-3 rounded-full', {
                          'bg-emerald-500': c === 'EMERALD',
                          'bg-blue-500':    c === 'BLUE',
                          'bg-violet-500':  c === 'VIOLET',
                          'bg-rose-500':    c === 'ROSE',
                          'bg-orange-500':  c === 'ORANGE',
                          'bg-cyan-500':    c === 'CYAN',
                        })} />
                        {enumLabel(c)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access */}
            <div className='space-y-1.5'>
              <Label>{lbl('Access', 'الوصول')}</Label>
              <Select value={form.access} onValueChange={(v) => set('access', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_ACCESSES.map((a) => (
                    <SelectItem key={a} value={a}>{t(`access.${a}`, a)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className='space-y-1.5'>
              <Label>{lbl('Difficulty', 'المستوى')}</Label>
              <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>{t(`difficulty.${d}`, d)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className='space-y-1.5'>
              <Label>{lbl('Content Type', 'نوع المحتوى')}</Label>
              <Select value={form.contentType} onValueChange={(v) => set('contentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct}>{t(`contentType.${ct}`, ct)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className='space-y-1.5'>
              <Label>{lbl('Category', 'الفئة')}</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State */}
            <div className='space-y-1.5'>
              <Label>{lbl('State', 'الحالة')}</Label>
              <Select value={form.state} onValueChange={(v) => set('state', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image URLs */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Cover Image URL', 'رابط الصورة')}</Label>
              <Input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder='https://...' />
              {form.image && <img src={form.image} alt='' className='mt-1 h-20 rounded-lg object-cover border border-border' />}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Thumbnail URL', 'رابط المصغر')}</Label>
              <Input value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} placeholder='https://...' />
              {form.thumbnail && <img src={form.thumbnail} alt='' className='mt-1 h-20 rounded-lg object-cover border border-border' />}
            </div>
          </div>

          {/* Flags */}
          <div className='flex flex-wrap items-center gap-6 pt-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isNew} onCheckedChange={(v) => set('isNew', v)} id='hero-isNew' />
              <Label htmlFor='hero-isNew'>{lbl('Is New', 'جديد')}</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} id='hero-featured' />
              <Label htmlFor='hero-featured'>{lbl('Featured', 'مميز')}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Title & Description ── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{lbl('Title & Description', 'العنوان والوصف')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>
                {lbl('Title', 'العنوان')} (EN)
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Input
                dir='ltr' value={form.title}
                placeholder='Course title in English'
                onChange={(e) => set('title', e.target.value)}
                className={!form.title.trim() ? 'border-amber-500/50' : ''}
              />
              {!form.title.trim() && (
                <p className='text-[11px] text-amber-500 flex items-center gap-1'>
                  <AlertTriangle className='h-3 w-3' /> {lbl('Required', 'مطلوب')}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Title', 'العنوان')} (AR)</Label>
              <Input dir='rtl' value={form.ar_title} placeholder='عنوان بالعربي'
                onChange={(e) => set('ar_title', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>
                {lbl('Short Description', 'وصف مختصر')} (EN)
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Textarea dir='ltr' rows={3} value={form.description}
                placeholder='Short description in English'
                onChange={(e) => set('description', e.target.value)}
                className={!form.description.trim() ? 'border-amber-500/50' : ''}
              />
              {!form.description.trim() && (
                <p className='text-[11px] text-amber-500 flex items-center gap-1'>
                  <AlertTriangle className='h-3 w-3' /> {lbl('Required', 'مطلوب')}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Short Description', 'وصف مختصر')} (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description}
                placeholder='وصف مختصر بالعربي'
                onChange={(e) => set('ar_description', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Long Description', 'وصف تفصيلي')} (EN)</Label>
              <Textarea dir='ltr' rows={5} value={form.longDescription}
                placeholder='Detailed description in English'
                onChange={(e) => set('longDescription', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Long Description', 'وصف تفصيلي')} (AR)</Label>
              <Textarea dir='rtl' rows={5} value={form.ar_longDescription}
                placeholder='وصف تفصيلي بالعربي'
                onChange={(e) => set('ar_longDescription', e.target.value)} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Estimated Hours', 'ساعات تقديرية')}</Label>
              <Input type='number' min={0} step={0.5} value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Labs Link', 'رابط المختبرات')}</Label>
              <Input value={form.labsLink} placeholder='https://...' onChange={(e) => set('labsLink', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Skills, Topics, Prerequisites ── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{lbl('Skills, Topics & Prerequisites', 'المهارات والمواضيع والمتطلبات')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <TagsInput label={lbl('Skills (EN)', 'مهارات (EN)')} value={form.skills}           onChange={(v) => set('skills', v)} />
            <TagsInput label={lbl('Skills (AR)', 'مهارات (AR)')} value={form.ar_skills}        onChange={(v) => set('ar_skills', v)} dir='rtl' />
            <TagsInput label={lbl('Topics (EN)', 'مواضيع (EN)')} value={form.topics}           onChange={(v) => set('topics', v)} />
            <TagsInput label={lbl('Topics (AR)', 'مواضيع (AR)')} value={form.ar_topics}        onChange={(v) => set('ar_topics', v)} dir='rtl' />
            <TagsInput label={lbl('Prerequisites (EN)', 'متطلبات (EN)')} value={form.prerequisites}    onChange={(v) => set('prerequisites', v)} />
            <TagsInput label={lbl('Prerequisites (AR)', 'متطلبات (AR)')} value={form.ar_prerequisites} onChange={(v) => set('ar_prerequisites', v)} dir='rtl' />
            <TagsInput label={lbl('Tags', 'التاجات')} value={form.tags} onChange={(v) => set('tags', v)} />
          </div>
        </CardContent>
      </Card>

      {/* ── Action buttons ── */}
      <div className='flex items-center justify-between gap-3'>
        <Button variant='outline' onClick={() => setPreviewOpen(true)} className='gap-2'>
          <Eye className='h-4 w-4' />
          {lbl('Preview Hero', 'معاينة الهيرو')}
        </Button>
        <Button onClick={handleSave} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' />
          {mut.isPending
            ? lbl('Saving...', 'جاري الحفظ…')
            : lbl('Save Hero Info', 'حفظ بيانات الهيرو')}
        </Button>
      </div>

      {/* ── Hero Preview Dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-4 w-4' />
              {lbl('Hero Preview (unsaved)', 'معاينة الهيرو (غير محفوظ)')}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {lbl(
                'Live preview with current form data. Not saved yet.',
                'معاينة حية ببيانات الفورم الحالية. لن يتغير حتى تحفظ.',
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='py-2'>
            <LiveHeroPreview form={form} course={course} isAr={isAr} />
          </div>

          {/* Pending changes diff */}
          <div className='rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1.5'>
            <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wide'>
              {lbl('Pending changes', 'التغييرات المعلقة')}
            </p>
            {([
              { label: lbl('Title EN',    'عنوان EN'),        old: course.title,              cur: form.title },
              { label: lbl('Title AR',    'عنوان AR'),        old: course.ar_title,           cur: form.ar_title },
              { label: lbl('Color',       'اللون'),           old: (course.color ?? '').toLowerCase(), cur: form.color },
              { label: lbl('Access',      'الوصول'),         old: course.access,             cur: form.access },
              { label: lbl('Difficulty',  'المستوى'),       old: course.difficulty,         cur: form.difficulty },
              { label: lbl('State',       'الحالة'),           old: course.state,              cur: form.state },
              { label: lbl('Hours',       'ساعات'),           old: String(course.estimatedHours ?? 0), cur: form.estimatedHours },
              { label: 'isNew',                old: String(course.isNew ?? false), cur: String(form.isNew) },
              { label: 'isFeatured',           old: String(course.isFeatured ?? false), cur: String(form.isFeatured) },
            ] as Array<{ label: string; old: string | undefined; cur: string }>)
              .filter((r) => (r.old ?? '') !== r.cur)
              .map((r) => (
                <div key={r.label} className='flex items-center gap-2 text-xs'>
                  <span className='text-muted-foreground w-28 shrink-0'>{r.label}</span>
                  <span className='line-through text-destructive/70 truncate max-w-[80px]'>{r.old || '—'}</span>
                  <span className='text-muted-foreground'>→</span>
                  <span className='text-emerald-400 font-medium truncate max-w-[80px]'>{r.cur || '—'}</span>
                </div>
              ))}
            {(course.title === form.title &&
              (course.color ?? '').toLowerCase() === form.color &&
              course.state === form.state) && (
              <p className='text-[11px] text-muted-foreground/50 italic'>
                {lbl('No changes yet', 'لا تغييرات')}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
