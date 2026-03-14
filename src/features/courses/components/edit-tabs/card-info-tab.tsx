// src/features/courses/components/edit-tabs/card-info-tab.tsx
// ✅ Pre-fills all fields from DB on mount
// ✅ Toast validation before save (required fields)
// ✅ Preview dialog shows live card with form data (not saved yet)
// ✅ Language driven by admin topbar (i18n.language)
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Eye, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch }  from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, FlaskConical, BookMarked,
  BarChart3, Unlock, Crown, Gem, Sparkles, Star,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  FALLBACK_BG,
  FALLBACK_TEXT,
  ACCESS_BADGE,
} from '../../constants/course-colors';

// ── Types ────────────────────────────────────────────────────────────────
interface Props { course: AdminCourse; onSaved: () => void; }

interface FormState {
  title:          string;
  ar_title:       string;
  description:    string;
  ar_description: string;
  color:          string;
  access:         string;
  difficulty:     string;
  category:       string;
  contentType:    string;
  estimatedHours: string;
  isFeatured:     boolean;
  isNew:          boolean;
}

// ── Required fields ──────────────────────────────────────────────────────
const REQUIRED: Array<{ key: keyof FormState; label: string; labelAr: string }> = [
  { key: 'title',       label: 'Title (EN)',    labelAr: 'العنوان (EN)' },
  { key: 'description', label: 'Description (EN)', labelAr: 'الوصف (EN)' },
];

// ── Mini card preview (mirrors CourseAdminCard grid view) ───────────────
const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock, PRO: Crown, PREMIUM: Gem,
};
const CONTENT_ICON: Record<string, { Icon: React.ElementType; en: string; ar: string }> = {
  PRACTICAL:   { Icon: FlaskConical, en: 'Practical', ar: 'تطبيقي' },
  THEORETICAL: { Icon: BookMarked,   en: 'Theory',    ar: 'نظري' },
  MIXED:       { Icon: BookOpen,     en: 'Mixed',     ar: 'مختلط' },
};
const DIFF_AR: Record<string, string> = {
  BEGINNER: 'مبتدئ', INTERMEDIATE: 'متوسط', ADVANCED: 'متقدم', EXPERT: 'خبير',
};
const ACCESS_AR: Record<string, string> = {
  FREE: 'مجاني', PRO: 'برو', PREMIUM: 'مميز',
};

function LiveCardPreview({ form, course, isAr }: { form: FormState; course: AdminCourse; isAr: boolean }) {
  const color      = (form.color ?? 'blue').toLowerCase();
  const comingSoon = course.state === 'COMING_SOON';
  const ct         = CONTENT_ICON[form.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[form.access ?? 'FREE'] ?? Unlock;
  const img        = course.image ?? course.thumbnail;

  const activeTitle = isAr ? form.ar_title || form.title : form.title;
  const activeDesc  = isAr ? form.ar_description || form.description : form.description;

  const diffLabel   = form.difficulty
    ? isAr ? DIFF_AR[form.difficulty] : form.difficulty.charAt(0) + form.difficulty.slice(1).toLowerCase()
    : null;
  const accessLabel = form.access
    ? isAr ? ACCESS_AR[form.access] : form.access.charAt(0) + form.access.slice(1).toLowerCase()
    : null;
  const ctLabel     = ct ? (isAr ? ct.ar : ct.en) : null;
  const topicsLabel = isAr ? 'موضوعات' : 'Topics';

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}
      className='group relative flex flex-col rounded-2xl border bg-card overflow-hidden w-64 mx-auto shadow-lg'>
      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        {img ? (
          <img src={img} alt={activeTitle} className='w-full h-full object-cover' />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br border',
            FALLBACK_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
          )}>
            <p className={cn('font-black text-center px-3 leading-tight text-lg',
              FALLBACK_TEXT[color] ?? 'text-zinc-400')}>
              {activeTitle || 'Course'}
            </p>
          </div>
        )}
        {comingSoon && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> {isAr ? 'قريباً' : 'Coming Soon'}
            </span>
          </div>
        )}
        {/* State badge */}
        <div className='absolute top-2 start-2 z-20'>
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
            course.state === 'PUBLISHED'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : course.state === 'COMING_SOON'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full',
              course.state === 'PUBLISHED' ? 'bg-emerald-400' :
              course.state === 'COMING_SOON' ? 'bg-blue-400' : 'bg-zinc-400'
            )} />
            {isAr
              ? ({ PUBLISHED: 'منشور', DRAFT: 'مسودة', COMING_SOON: 'قريباً' } as any)[course.state]
              : ({ PUBLISHED: 'Published', DRAFT: 'Draft', COMING_SOON: 'Coming Soon' } as any)[course.state]}
          </span>
        </div>
        {form.isFeatured && (
          <div className='absolute top-2 end-2 z-20'>
            <span className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-yellow-500/20 border-yellow-500/40 text-yellow-300'>
              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            </span>
          </div>
        )}
        {form.isNew && (
          <div className='absolute bottom-2 end-2 z-20'>
            <span className='inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold bg-primary/80 text-white border border-primary/40'>
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='flex flex-col flex-1 p-4 gap-2'>
        <h3 className='text-sm font-bold text-foreground leading-snug line-clamp-2'>
          {activeTitle || <span className='italic text-muted-foreground/40'>{isAr ? 'عنوان…' : 'Title…'}</span>}
        </h3>
        {activeDesc ? (
          <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>{activeDesc}</p>
        ) : (
          <p className='text-xs text-muted-foreground/30 italic'>
            {isAr ? 'لا يوجد وصف…' : 'No description…'}
          </p>
        )}
        <div className='flex flex-wrap items-center gap-1.5 mt-auto pt-3 border-t border-border/30'>
          {diffLabel && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' /> {diffLabel}
            </Badge>
          )}
          {accessLabel && (
            <Badge variant='outline' className={cn('gap-1 text-[10px] font-bold', ACCESS_BADGE[form.access])}>
              <AccessIcon className='h-3 w-3' /> {accessLabel}
            </Badge>
          )}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <BookOpen className='h-3 w-3' /> {course.totalTopics} {topicsLabel}
            </Badge>
          )}
          {ct && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' /> {ctLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CardInfoTab({ course, onSaved }: Props) {
  const { t, i18n } = useTranslation('courses');
  const isAr = i18n.language === 'ar';
  const [previewOpen, setPreviewOpen] = useState(false);

  // ✅ Pre-fill ALL fields from DB
  const [form, setForm] = useState<FormState>({
    title:          course.title          ?? '',
    ar_title:       course.ar_title       ?? '',
    description:    course.description    ?? '',
    ar_description: course.ar_description ?? '',
    color:          (course.color         ?? 'BLUE').toUpperCase(),
    access:         course.access         ?? 'FREE',
    difficulty:     course.difficulty     ?? 'BEGINNER',
    category:       course.category       ?? 'FUNDAMENTALS',
    contentType:    course.contentType    ?? 'MIXED',
    estimatedHours: String(course.estimatedHours ?? 0),
    isFeatured:     course.isFeatured     ?? false,
    isNew:          course.isNew          ?? false,
  });

  const set = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const missing = REQUIRED
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
      title:          form.title,
      ar_title:       form.ar_title       || undefined,
      description:    form.description    || undefined,
      ar_description: form.ar_description || undefined,
      color:          form.color as AdminCourse['color'],
      access:         form.access as AdminCourse['access'],
      difficulty:     form.difficulty as AdminCourse['difficulty'],
      category:       form.category as AdminCourse['category'],
      contentType:    form.contentType as AdminCourse['contentType'],
      estimatedHours: Number(form.estimatedHours),
      isFeatured:     form.isFeatured,
      isNew:          form.isNew,
    }),
    onSuccess: () => {
      toast.success(isAr ? 'تم حفظ بيانات الكارد ✔' : 'Card info saved ✔');
      onSaved();
    },
    onError: () => toast.error(isAr ? 'فشل الحفظ' : 'Failed to save'),
  });

  const handleSave = () => {
    if (validate()) mut.mutate();
  };

  return (
    <div className='space-y-6' dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Basic Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            {isAr ? 'المعلومات الأساسية' : t('form.basicInfo', 'Basic Info')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {/* Title EN */}
            <div className='space-y-1.5'>
              <Label>
                {isAr ? 'العنوان' : t('form.title', 'Title')} (EN)
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Input
                dir='ltr'
                value={form.title}
                placeholder='Course title in English'
                onChange={(e) => set('title', e.target.value)}
                className={!form.title.trim() ? 'border-amber-500/50 focus-visible:ring-amber-500/30' : ''}
              />
              {!form.title.trim() && (
                <p className='text-[11px] text-amber-500 flex items-center gap-1'>
                  <AlertTriangle className='h-3 w-3' />
                  {isAr ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>
            {/* Title AR */}
            <div className='space-y-1.5'>
              <Label>{isAr ? 'العنوان' : t('form.title', 'Title')} (AR)</Label>
              <Input dir='rtl' value={form.ar_title}
                placeholder='عنوان الكورس بالعربي'
                onChange={(e) => set('ar_title', e.target.value)} />
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {/* Description EN */}
            <div className='space-y-1.5'>
              <Label>
                {isAr ? 'الوصف' : t('form.description', 'Description')} (EN)
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Textarea
                dir='ltr'
                rows={3}
                value={form.description}
                placeholder='Short course description in English'
                onChange={(e) => set('description', e.target.value)}
                className={!form.description.trim() ? 'border-amber-500/50 focus-visible:ring-amber-500/30' : ''}
              />
              {!form.description.trim() && (
                <p className='text-[11px] text-amber-500 flex items-center gap-1'>
                  <AlertTriangle className='h-3 w-3' />
                  {isAr ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>
            {/* Description AR */}
            <div className='space-y-1.5'>
              <Label>{isAr ? 'الوصف' : t('form.description', 'Description')} (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description}
                placeholder='وصف مختصر بالعربي'
                onChange={(e) => set('ar_description', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Classification ── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            {isAr ? 'التصنيف' : t('form.classification', 'Classification')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>

            {/* Color */}
            <div className='space-y-1.5'>
              <Label>{isAr ? 'اللون' : t('form.color', 'Color')}</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v)}>
                <SelectTrigger>
                  <div className='flex items-center gap-2'>
                    <span className={cn('h-3 w-3 rounded-full', {
                      'bg-emerald-500': form.color === 'EMERALD',
                      'bg-blue-500':    form.color === 'BLUE',
                      'bg-violet-500':  form.color === 'VIOLET',
                      'bg-rose-500':    form.color === 'ROSE',
                      'bg-orange-500':  form.color === 'ORANGE',
                      'bg-cyan-500':    form.color === 'CYAN',
                    })} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COURSE_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
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
              <Label>{isAr ? 'الوصول' : t('form.access', 'Access')}</Label>
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
              <Label>{isAr ? 'المستوى' : t('form.difficulty', 'Difficulty')}</Label>
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
              <Label>{isAr ? 'نوع المحتوى' : t('form.contentType', 'Content Type')}</Label>
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
              <Label>{isAr ? 'الفئة' : t('form.category', 'Category')}</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Hours */}
            <div className='space-y-1.5'>
              <Label>{isAr ? 'الساعات التقديرية' : t('form.estimatedHours', 'Est. Hours')}</Label>
              <Input
                type='number' min={0} step={0.5}
                value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)}
              />
            </div>
          </div>

          {/* Flags */}
          <div className='flex flex-wrap items-center gap-6 pt-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} id='featured' />
              <Label htmlFor='featured'>{isAr ? 'مميز' : t('form.featured', 'Featured')}</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isNew} onCheckedChange={(v) => set('isNew', v)} id='isNew' />
              <Label htmlFor='isNew'>{isAr ? 'جديد' : t('form.isNew', 'New')}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Action buttons ── */}
      <div className='flex items-center justify-between gap-3'>
        {/* Preview button */}
        <Button
          variant='outline'
          onClick={() => setPreviewOpen(true)}
          className='gap-2'
        >
          <Eye className='h-4 w-4' />
          {isAr ? 'معاينة الكارد' : 'Preview Card'}
        </Button>

        {/* Save button */}
        <Button onClick={handleSave} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' />
          {mut.isPending
            ? (isAr ? 'جاري الحفظ…' : 'Saving...')
            : (isAr ? 'حفظ التغييرات' : t('form.saveChanges', 'Save Changes'))}
        </Button>
      </div>

      {/* ── Card Preview Dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-4 w-4' />
              {isAr ? 'معاينة الكارد (غير محفوظ)' : 'Card Preview (unsaved)'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {isAr
                ? 'هذا شكل الكارد بالبيانات الحالية في الفورم. لن يتغير حتى تحفظ.'
                : 'This is how the card looks with current form data. Not saved yet.'}
            </DialogDescription>
          </DialogHeader>
          <div className='py-2'>
            <LiveCardPreview form={form} course={course} isAr={isAr} />
          </div>
          {/* Mini diff: what changed */}
          <div className='rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1.5'>
            <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wide'>
              {isAr ? 'التغييرات المعلقة' : 'Pending changes'}
            </p>
            {[
              { label: isAr ? 'العنوان EN' : 'Title EN',       old: course.title,          cur: form.title },
              { label: isAr ? 'العنوان AR' : 'Title AR',       old: course.ar_title,       cur: form.ar_title },
              { label: isAr ? 'اللون' : 'Color',              old: course.color?.toUpperCase(), cur: form.color },
              { label: isAr ? 'الوصول' : 'Access',            old: course.access,         cur: form.access },
              { label: isAr ? 'المستوى' : 'Difficulty',       old: course.difficulty,     cur: form.difficulty },
              { label: isAr ? 'الفئة' : 'Category',           old: course.category,       cur: form.category },
              { label: isAr ? 'ساعات' : 'Hours',              old: String(course.estimatedHours ?? 0), cur: form.estimatedHours },
              { label: 'isFeatured',                   old: String(course.isFeatured ?? false), cur: String(form.isFeatured) },
              { label: 'isNew',                        old: String(course.isNew ?? false),      cur: String(form.isNew) },
            ]
              .filter((r) => r.old !== r.cur)
              .map((r) => (
                <div key={r.label} className='flex items-center gap-2 text-xs'>
                  <span className='text-muted-foreground w-24 shrink-0'>{r.label}</span>
                  <span className='line-through text-destructive/70 truncate max-w-[80px]'>{r.old || '—'}</span>
                  <span className='text-muted-foreground'>→</span>
                  <span className='text-emerald-400 font-medium truncate max-w-[80px]'>{r.cur || '—'}</span>
                </div>
              ))}
            {[
              { label: isAr ? 'العنوان EN' : 'Title EN',       old: course.title,          cur: form.title },
              { label: isAr ? 'العنوان AR' : 'Title AR',       old: course.ar_title,       cur: form.ar_title },
              { label: isAr ? 'اللون' : 'Color',              old: course.color?.toUpperCase(), cur: form.color },
              { label: isAr ? 'الوصول' : 'Access',            old: course.access,         cur: form.access },
              { label: isAr ? 'المستوى' : 'Difficulty',       old: course.difficulty,     cur: form.difficulty },
              { label: isAr ? 'الفئة' : 'Category',           old: course.category,       cur: form.category },
              { label: isAr ? 'ساعات' : 'Hours',              old: String(course.estimatedHours ?? 0), cur: form.estimatedHours },
              { label: 'isFeatured',                   old: String(course.isFeatured ?? false), cur: String(form.isFeatured) },
              { label: 'isNew',                        old: String(course.isNew ?? false),      cur: String(form.isNew) },
            ].filter((r) => r.old === r.cur).length === 9 && (
              <p className='text-[11px] text-muted-foreground/50 italic'>
                {isAr ? 'لا تغييرات' : 'No changes yet'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
