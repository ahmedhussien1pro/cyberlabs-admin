// CardInfoTab — تعديل بيانات الكارد الأساسية
import { useState }    from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast }       from 'sonner';
import { Save }        from 'lucide-react';
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

interface Props { course: AdminCourse; onSaved: () => void; }

export function CardInfoTab({ course, onSaved }: Props) {
  const { t } = useTranslation('courses');

  const [form, setForm] = useState({
    title:          course.title          ?? '',
    ar_title:       course.ar_title       ?? '',
    description:    course.description    ?? '',
    ar_description: course.ar_description ?? '',
    color:          course.color          ?? 'BLUE',
    access:         course.access         ?? 'FREE',
    difficulty:     course.difficulty     ?? 'BEGINNER',
    category:       course.category       ?? 'FUNDAMENTALS',
    contentType:    course.contentType    ?? 'MIXED',
    estimatedHours: String(course.estimatedHours ?? 0),
    isFeatured:     course.isFeatured     ?? false,
    isNew:          course.isNew          ?? false,
  });

  const mut = useMutation({
    mutationFn: () => adminCoursesApi.update(course.id, {
      title:          form.title,
      ar_title:       form.ar_title       || undefined,
      description:    form.description    || undefined,
      ar_description: form.ar_description || undefined,
      color:          form.color          as AdminCourse['color'],
      access:         form.access         as AdminCourse['access'],
      difficulty:     form.difficulty     as AdminCourse['difficulty'],
      category:       form.category       as AdminCourse['category'],
      contentType:    form.contentType    as AdminCourse['contentType'],
      estimatedHours: Number(form.estimatedHours),
      isFeatured:     form.isFeatured,
      isNew:          form.isNew,
    }),
    onSuccess: () => { toast.success(t('toast.stateUpdated')); onSaved(); },
    onError:   () => toast.error(t('errors.publishFailed')),
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className='space-y-6'>
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{t('form.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>{t('form.title')} (EN)</Label>
              <Input value={form.title}
                onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>{t('form.title')} (AR)</Label>
              <Input dir='rtl' value={form.ar_title}
                onChange={(e) => set('ar_title', e.target.value)} />
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>{t('form.description')} (EN)</Label>
              <Textarea rows={3} value={form.description}
                onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>{t('form.description')} (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description}
                onChange={(e) => set('ar_description', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{t('form.classification')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>

            {/* Color */}
            <div className='space-y-1.5'>
              <Label>{t('form.color')}</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access */}
            <div className='space-y-1.5'>
              <Label>{t('form.access')}</Label>
              <Select value={form.access} onValueChange={(v) => set('access', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_ACCESSES.map((a) => (
                    <SelectItem key={a} value={a}>{t(`access.${a}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className='space-y-1.5'>
              <Label>{t('form.difficulty')}</Label>
              <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>{t(`difficulty.${d}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className='space-y-1.5'>
              <Label>{t('form.contentType')}</Label>
              <Select value={form.contentType} onValueChange={(v) => set('contentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSE_CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct}>{t(`contentType.${ct}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className='space-y-1.5'>
              <Label>{t('form.category')}</Label>
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
              <Label>{t('form.estimatedHours')}</Label>
              <Input type='number' min={0} value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)} />
            </div>
          </div>

          {/* Flags */}
          <div className='flex flex-wrap items-center gap-6 pt-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isFeatured}
                onCheckedChange={(v) => set('isFeatured', v)} id='featured' />
              <Label htmlFor='featured'>{t('form.featured')}</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isNew}
                onCheckedChange={(v) => set('isNew', v)} id='isNew' />
              <Label htmlFor='isNew'>{t('form.isNew')}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' />
          {mut.isPending ? t('form.saveChanges') + '...' : t('form.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
