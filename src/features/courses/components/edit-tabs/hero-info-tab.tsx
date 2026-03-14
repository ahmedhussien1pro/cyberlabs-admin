// hero-info-tab.tsx
// ✅ Pre-fills ALL fields from DB on mount
// ✅ Toast validation for required fields before save
// ✅ Preview dialog — hero styled exactly like CoursePlatformPreviewTab
// ✅ Language driven by admin topbar (i18n.language)
// ✅ instructorId field added — pre-filled, editable, sent in update payload
// ✅ color stored lowercase in form (for UI maps), sent UPPERCASE to backend
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Eye, AlertTriangle, X, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse } from '../../types/admin-course.types';
import {
  COURSE_DIFFICULTIES, COURSE_ACCESSES, COURSE_COLORS,
  COURSE_CONTENT_TYPES, COURSE_CATEGORIES, enumLabel,
} from '../../constants/course-enums';
import { TagsInput }      from './hero-info/TagsInput';
import { LiveHeroPreview } from './hero-info/LiveHeroPreview';
import type { FormState }  from './hero-info/LiveHeroPreview';

interface Props { course: AdminCourse; onSaved: () => void; }

const REQUIRED_HERO: Array<{ key: keyof FormState; label: string; labelAr: string }> = [
  { key: 'title',       label: 'Title (EN)',       labelAr: 'العنوان (EN)' },
  { key: 'description', label: 'Description (EN)', labelAr: 'الوصف (EN)' },
];

const STATE_OPTIONS = ['DRAFT', 'PUBLISHED', 'COMING_SOON'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function HeroInfoTab({ course, onSaved }: Props) {
  const { t, i18n } = useTranslation('courses');
  const isAr = i18n.language === 'ar';
  const [previewOpen, setPreviewOpen] = useState(false);

  const [form, setForm] = useState<FormState>({
    title:              course.title              ?? '',
    ar_title:           course.ar_title           ?? '',
    color:              (course.color             ?? 'blue').toLowerCase(),
    image:              course.image              ?? '',
    thumbnail:          course.thumbnail          ?? '',
    access:             course.access             ?? 'FREE',
    difficulty:         course.difficulty         ?? 'BEGINNER',
    category:           course.category           ?? 'FUNDAMENTALS',
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
    instructorId:       course.instructorId       ?? '',
    skills:             [...(course.skills             ?? [])],
    ar_skills:          [...(course.ar_skills          ?? [])],
    topics:             [...(course.topics             ?? [])],
    ar_topics:          [...(course.ar_topics          ?? [])],
    prerequisites:      [...(course.prerequisites      ?? [])],
    ar_prerequisites:   [...(course.ar_prerequisites   ?? [])],
    tags:               [...(course.tags               ?? [])],
  });

  const set = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const missing = REQUIRED_HERO
      .filter((f) => !String(form[f.key]).trim())
      .map((f) => (isAr ? f.labelAr : f.label));
    if (missing.length > 0) {
      toast.error(
        <div className='flex items-start gap-2'>
          <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5 text-amber-400' />
          <div>
            <p className='font-semibold'>{isAr ? 'حقول مطلوبة' : 'Required fields missing'}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>{missing.join(' · ')}</p>
          </div>
        </div>,
      );
      return false;
    }
    return true;
  };

  const mut = useMutation({
    mutationFn: () => adminCoursesApi.update(course.id, {
      color:              form.color.toUpperCase() as any,
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
      instructorId:       form.instructorId       || null,
      skills:             form.skills,
      ar_skills:          form.ar_skills,
      topics:             form.topics,
      ar_topics:          form.ar_topics,
      prerequisites:      form.prerequisites,
      ar_prerequisites:   form.ar_prerequisites,
      tags:               form.tags,
    }),
    onSuccess: () => { toast.success(isAr ? 'تم حفظ بيانات الهيرو ✔' : 'Hero info saved ✔'); onSaved(); },
    onError: () => toast.error(isAr ? 'فشل الحفظ' : 'Failed to save'),
  });

  const handleSave = () => { if (validate()) mut.mutate(); };
  const lbl = (en: string, ar: string) => (isAr ? ar : en);
  const instructorIdInvalid = form.instructorId.length > 0 && !UUID_RE.test(form.instructorId);

  return (
    <div className='space-y-6' dir={isAr ? 'rtl' : 'ltr'}>

      {/* Visual & Status */}
      <Card>
        <CardHeader><CardTitle className='text-base'>{lbl('Visual & Status', 'المظهر والحالة')}</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <div className='space-y-1.5'>
              <Label>{lbl('Color', 'اللون')}</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v.toLowerCase())}>
                <SelectTrigger>
                  <div className='flex items-center gap-2'>
                    <span className={cn('h-3 w-3 rounded-full', {
                      'bg-emerald-500': form.color === 'emerald', 'bg-blue-500': form.color === 'blue',
                      'bg-violet-500': form.color === 'violet',   'bg-rose-500': form.color === 'rose',
                      'bg-orange-500': form.color === 'orange',   'bg-cyan-500': form.color === 'cyan',
                    })} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COURSE_COLORS.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      <div className='flex items-center gap-2'>
                        <span className={cn('h-3 w-3 rounded-full', {
                          'bg-emerald-500': c === 'EMERALD', 'bg-blue-500': c === 'BLUE',
                          'bg-violet-500': c === 'VIOLET',   'bg-rose-500': c === 'ROSE',
                          'bg-orange-500': c === 'ORANGE',   'bg-cyan-500': c === 'CYAN',
                        })} />
                        {enumLabel(c)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('Access', 'الوصول')}</Label>
              <Select value={form.access} onValueChange={(v) => set('access', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COURSE_ACCESSES.map((a) => <SelectItem key={a} value={a}>{t(`access.${a}`, a)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('Difficulty', 'المستوى')}</Label>
              <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COURSE_DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{t(`difficulty.${d}`, d)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('Content Type', 'نوع المحتوى')}</Label>
              <Select value={form.contentType} onValueChange={(v) => set('contentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COURSE_CONTENT_TYPES.map((ct) => <SelectItem key={ct} value={ct}>{t(`contentType.${ct}`, ct)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('Category', 'الفئة')}</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COURSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('State', 'الحالة')}</Label>
              <Select value={form.state} onValueChange={(v) => set('state', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

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

          <div className='space-y-1.5'>
            <Label className='text-xs flex items-center gap-1.5'>
              <UserCog className='h-3.5 w-3.5 text-muted-foreground' />
              {lbl('Instructor ID', 'معرف المدرب')} <span className='text-muted-foreground font-normal'>(UUID)</span>
            </Label>
            <div className='flex items-center gap-2'>
              <Input dir='ltr' value={form.instructorId} onChange={(e) => set('instructorId', e.target.value.trim())}
                placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                className={cn('font-mono text-xs', instructorIdInvalid && 'border-amber-500/60 focus-visible:ring-amber-500/40')} />
              {form.instructorId && (
                <Button type='button' variant='ghost' size='icon' className='shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive'
                  onClick={() => set('instructorId', '')} title={lbl('Clear', 'مسح')}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
            {instructorIdInvalid && (
              <p className='text-[11px] text-amber-500 flex items-center gap-1'>
                <AlertTriangle className='h-3 w-3' /> {lbl('Not a valid UUID format', 'صيغة UUID غير صحيحة')}
              </p>
            )}
            {form.instructorId && UUID_RE.test(form.instructorId) && (
              <p className='text-[11px] text-emerald-500/80 flex items-center gap-1'>✔ {lbl('Valid UUID', 'UUID صحيح')}</p>
            )}
            {!form.instructorId && (
              <p className='text-[11px] text-muted-foreground/50'>{lbl('Leave empty to unassign instructor', 'اتركه فارغاً لإلغاء تعيين المدرب')}</p>
            )}
          </div>

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

      {/* Title & Description */}
      <Card>
        <CardHeader><CardTitle className='text-base'>{lbl('Title & Description', 'العنوان والوصف')}</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Title', 'العنوان')} (EN)<span className='text-destructive ms-1'>*</span></Label>
              <Input dir='ltr' value={form.title} placeholder='Course title in English'
                onChange={(e) => set('title', e.target.value)}
                className={!form.title.trim() ? 'border-amber-500/50' : ''} />
              {!form.title.trim() && <p className='text-[11px] text-amber-500 flex items-center gap-1'><AlertTriangle className='h-3 w-3' /> {lbl('Required', 'مطلوب')}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Title', 'العنوان')} (AR)</Label>
              <Input dir='rtl' value={form.ar_title} placeholder='عنوان بالعربي' onChange={(e) => set('ar_title', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Short Description', 'وصف مختصر')} (EN)<span className='text-destructive ms-1'>*</span></Label>
              <Textarea dir='ltr' rows={3} value={form.description} placeholder='Short description in English'
                onChange={(e) => set('description', e.target.value)}
                className={!form.description.trim() ? 'border-amber-500/50' : ''} />
              {!form.description.trim() && <p className='text-[11px] text-amber-500 flex items-center gap-1'><AlertTriangle className='h-3 w-3' /> {lbl('Required', 'مطلوب')}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Short Description', 'وصف مختصر')} (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description} placeholder='وصف مختصر بالعربي' onChange={(e) => set('ar_description', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Long Description', 'وصف تفصيلي')} (EN)</Label>
              <Textarea dir='ltr' rows={5} value={form.longDescription} placeholder='Detailed description in English' onChange={(e) => set('longDescription', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Long Description', 'وصف تفصيلي')} (AR)</Label>
              <Textarea dir='rtl' rows={5} value={form.ar_longDescription} placeholder='وصف تفصيلي بالعربي' onChange={(e) => set('ar_longDescription', e.target.value)} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Estimated Hours', 'ساعات تقديرية')}</Label>
              <Input type='number' min={0} step={0.5} value={form.estimatedHours} onChange={(e) => set('estimatedHours', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{lbl('Labs Link', 'رابط المختبرات')}</Label>
              <Input value={form.labsLink} placeholder='https://...' onChange={(e) => set('labsLink', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills, Topics, Prerequisites */}
      <Card>
        <CardHeader><CardTitle className='text-base'>{lbl('Skills, Topics & Prerequisites', 'المهارات والمواضيع والمتطلبات')}</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <TagsInput label={lbl('Skills (EN)', 'مهارات (EN)')}        value={form.skills}           onChange={(v) => set('skills', v)} />
            <TagsInput label={lbl('Skills (AR)', 'مهارات (AR)')}        value={form.ar_skills}        onChange={(v) => set('ar_skills', v)} dir='rtl' />
            <TagsInput label={lbl('Topics (EN)', 'مواضيع (EN)')}        value={form.topics}           onChange={(v) => set('topics', v)} />
            <TagsInput label={lbl('Topics (AR)', 'مواضيع (AR)')}        value={form.ar_topics}        onChange={(v) => set('ar_topics', v)} dir='rtl' />
            <TagsInput label={lbl('Prerequisites (EN)', 'متطلبات (EN)')} value={form.prerequisites}    onChange={(v) => set('prerequisites', v)} />
            <TagsInput label={lbl('Prerequisites (AR)', 'متطلبات (AR)')} value={form.ar_prerequisites} onChange={(v) => set('ar_prerequisites', v)} dir='rtl' />
            <TagsInput label={lbl('Tags', 'التاجات')}               value={form.tags}             onChange={(v) => set('tags', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex items-center justify-between gap-3'>
        <Button variant='outline' onClick={() => setPreviewOpen(true)} className='gap-2'>
          <Eye className='h-4 w-4' /> {lbl('Preview Hero', 'معاينة الهيرو')}
        </Button>
        <Button onClick={handleSave} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' />
          {mut.isPending ? lbl('Saving...', 'جاري الحفظ…') : lbl('Save Hero Info', 'حفظ بيانات الهيرو')}
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-4 w-4' /> {lbl('Hero Preview (unsaved)', 'معاينة الهيرو (غير محفوظ)')}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {lbl('Live preview with current form data. Not saved yet.', 'معاينة حية ببيانات الفورم الحالية. لن يتغير حتى تحفظ.')}
            </DialogDescription>
          </DialogHeader>
          <div className='py-2'>
            <LiveHeroPreview form={form} course={course} isAr={isAr} />
          </div>
          <div className='rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1.5'>
            <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wide'>
              {lbl('Pending changes', 'التغييرات المعلقة')}
            </p>
            {([
              { label: lbl('Title EN',''),   old: course.title,                       cur: form.title },
              { label: lbl('Title AR',''),   old: course.ar_title,                    cur: form.ar_title },
              { label: lbl('Color',''),      old: (course.color ?? '').toLowerCase(), cur: form.color },
              { label: lbl('Access',''),     old: course.access,                      cur: form.access },
              { label: lbl('Difficulty',''), old: course.difficulty,                  cur: form.difficulty },
              { label: lbl('State',''),      old: course.state,                       cur: form.state },
              { label: lbl('Hours',''),      old: String(course.estimatedHours ?? 0), cur: form.estimatedHours },
              { label: lbl('Instructor ID',''), old: course.instructorId ?? '',       cur: form.instructorId },
              { label: 'isNew',      old: String(course.isNew ?? false),    cur: String(form.isNew) },
              { label: 'isFeatured', old: String(course.isFeatured ?? false), cur: String(form.isFeatured) },
            ] as Array<{ label: string; old: string | undefined | null; cur: string }>)
              .filter((r) => (r.old ?? '') !== r.cur)
              .map((r) => (
                <div key={r.label} className='flex items-center gap-2 text-xs'>
                  <span className='text-muted-foreground w-28 shrink-0'>{r.label}</span>
                  <span className='line-through text-destructive/70 truncate max-w-[80px]'>{r.old || '—'}</span>
                  <span className='text-muted-foreground'>→</span>
                  <span className='text-emerald-400 font-medium truncate max-w-[80px]'>{r.cur || '—'}</span>
                </div>
              ))}
            {(course.color ?? '').toLowerCase() === form.color && course.state === form.state && course.title === form.title && (
              <p className='text-[11px] text-muted-foreground/50 italic'>{lbl('No changes yet', 'لا تغييرات')}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
