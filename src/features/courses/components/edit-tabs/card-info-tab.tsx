// card-info-tab.tsx
// ✅ Pre-fills all fields from DB on mount
// ✅ Toast validation before save (required fields)
// ✅ Preview dialog shows live card with form data
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
import { Switch } from '@/components/ui/switch';
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
import { LiveCardPreview } from './card-info/LiveCardPreview';
import type { CardFormState as FormState } from './card-info/LiveCardPreview';

interface Props { course: AdminCourse; onSaved: () => void; }

const REQUIRED: Array<{ key: keyof FormState; label: string; labelAr: string }> = [
  { key: 'title',       label: 'Title (EN)',       labelAr: 'العنوان (EN)' },
  { key: 'description', label: 'Description (EN)', labelAr: 'الوصف (EN)' },
];

export function CardInfoTab({ course, onSaved }: Props) {
  const { t, i18n } = useTranslation('courses');
  const isAr = i18n.language === 'ar';
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const validate = (): boolean => {
    const missing = REQUIRED
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
    onSuccess: () => { toast.success(isAr ? 'تم حفظ بيانات الكارد ✔' : 'Card info saved ✔'); onSaved(); },
    onError: () => toast.error(isAr ? 'فشل الحفظ' : 'Failed to save'),
  });

  const handleSave = () => { if (validate()) mut.mutate(); };
  const lbl = (en: string, ar: string) => (isAr ? ar : en);

  return (
    <div className='space-y-6' dir={isAr ? 'rtl' : 'ltr'}>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className='text-base'>{lbl('Basic Info', 'المعلومات الأساسية')}</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>{lbl('Title', 'العنوان')} (EN)<span className='text-destructive ms-1'>*</span></Label>
              <Input dir='ltr' value={form.title} placeholder='Course title in English'
                onChange={(e) => set('title', e.target.value)}
                className={!form.title.trim() ? 'border-amber-500/50 focus-visible:ring-amber-500/30' : ''} />
              {!form.title.trim() && <p className='text-[11px] text-amber-500 flex items-center gap-1'><AlertTriangle className='h-3 w-3' /> {lbl('Required', 'مطلوب')}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('Title', 'العنوان')} (AR)</Label>
              <Input dir='rtl' value={form.ar_title} placeholder='عنوان الكورس بالعربي' onChange={(e) => set('ar_title', e.target.value)} />
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>{lbl('Description', 'الوصف')} (EN)<span className='text-destructive ms-1'>*</span></Label>
              <Textarea dir='ltr' rows={3} value={form.description} placeholder='Short course description in English'
                onChange={(e) => set('description', e.target.value)}
                className={!form.description.trim() ? 'border-amber-500/50 focus-visible:ring-amber-500/30' : ''} />
              {!form.description.trim() && <p className='text-[11px] text-amber-500 flex items-center gap-1'><AlertTriangle className='h-3 w-3' /> {lbl('Required', 'مطلوب')}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label>{lbl('Description', 'الوصف')} (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description} placeholder='وصف مختصر بالعربي' onChange={(e) => set('ar_description', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader><CardTitle className='text-base'>{lbl('Classification', 'التصنيف')}</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <div className='space-y-1.5'>
              <Label>{lbl('Color', 'اللون')}</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v)}>
                <SelectTrigger>
                  <div className='flex items-center gap-2'>
                    <span className={cn('h-3 w-3 rounded-full', {
                      'bg-emerald-500': form.color === 'EMERALD', 'bg-blue-500': form.color === 'BLUE',
                      'bg-violet-500': form.color === 'VIOLET',   'bg-rose-500': form.color === 'ROSE',
                      'bg-orange-500': form.color === 'ORANGE',   'bg-cyan-500': form.color === 'CYAN',
                    })} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COURSE_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
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
              <Label>{lbl('Est. Hours', 'الساعات')}</Label>
              <Input type='number' min={0} step={0.5} value={form.estimatedHours} onChange={(e) => set('estimatedHours', e.target.value)} />
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-6 pt-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} id='featured' />
              <Label htmlFor='featured'>{lbl('Featured', 'مميز')}</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isNew} onCheckedChange={(v) => set('isNew', v)} id='isNew' />
              <Label htmlFor='isNew'>{lbl('New', 'جديد')}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex items-center justify-between gap-3'>
        <Button variant='outline' onClick={() => setPreviewOpen(true)} className='gap-2'>
          <Eye className='h-4 w-4' /> {lbl('Preview Card', 'معاينة الكارد')}
        </Button>
        <Button onClick={handleSave} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' />
          {mut.isPending ? lbl('Saving...', 'جاري الحفظ…') : lbl('Save Changes', 'حفظ التغييرات')}
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-4 w-4' /> {lbl('Card Preview (unsaved)', 'معاينة الكارد (غير محفوظ)')}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {lbl('Live preview with current form data. Not saved yet.', 'معاينة حية ببيانات الفورم الحالية. لن يتغير حتى تحفظ.')}
            </DialogDescription>
          </DialogHeader>
          <div className='py-2'>
            <LiveCardPreview form={form} course={course} isAr={isAr} />
          </div>
          {/* Diff */}
          <div className='rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1.5'>
            <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wide'>
              {lbl('Pending changes', 'التغييرات المعلقة')}
            </p>
            {([
              { label: lbl('Title EN', 'العنوان EN'),  old: course.title,                          cur: form.title },
              { label: lbl('Title AR', 'العنوان AR'),  old: course.ar_title,                       cur: form.ar_title },
              { label: lbl('Color', 'اللون'),          old: (course.color ?? '').toUpperCase(),    cur: form.color },
              { label: lbl('Access', 'الوصول'),        old: course.access,                         cur: form.access },
              { label: lbl('Difficulty', 'المستوى'),   old: course.difficulty,                     cur: form.difficulty },
              { label: lbl('Category', 'الفئة'),       old: course.category,                       cur: form.category },
              { label: lbl('Hours', 'ساعات'),          old: String(course.estimatedHours ?? 0),    cur: form.estimatedHours },
              { label: 'isFeatured',                   old: String(course.isFeatured ?? false),    cur: String(form.isFeatured) },
              { label: 'isNew',                        old: String(course.isNew ?? false),         cur: String(form.isNew) },
            ] as Array<{ label: string; old: string | undefined | null; cur: string }>)
              .filter((r) => (r.old ?? '') !== r.cur)
              .map((r) => (
                <div key={r.label} className='flex items-center gap-2 text-xs'>
                  <span className='text-muted-foreground w-24 shrink-0'>{r.label}</span>
                  <span className='line-through text-destructive/70 truncate max-w-[80px]'>{r.old || '—'}</span>
                  <span className='text-muted-foreground'>→</span>
                  <span className='text-emerald-400 font-medium truncate max-w-[80px]'>{r.cur || '—'}</span>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
