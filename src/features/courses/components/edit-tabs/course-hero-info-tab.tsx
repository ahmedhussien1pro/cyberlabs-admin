// src/features/courses/components/edit-tabs/course-hero-info-tab.tsx
// Tab 2 — Hero Info: long descriptions EN/AR, skills, topics, prerequisites
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse } from '../../types/admin-course.types';

function TagListEditor({
  label, arLabel, items, arItems,
  onChangeItems, onChangeArItems,
}: {
  label: string;
  arLabel: string;
  items: string[];
  arItems: string[];
  onChangeItems: (v: string[]) => void;
  onChangeArItems: (v: string[]) => void;
}) {
  const [enInput, setEnInput] = useState('');
  const [arInput, setArInput] = useState('');

  const addEn = () => {
    const v = enInput.trim();
    if (v && !items.includes(v)) { onChangeItems([...items, v]); }
    setEnInput('');
  };
  const addAr = () => {
    const v = arInput.trim();
    if (v && !arItems.includes(v)) { onChangeArItems([...arItems, v]); }
    setArInput('');
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>{label} / {arLabel}</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* EN */}
        <div className='space-y-2'>
          <Label className='text-xs'>English</Label>
          <div className='flex gap-2'>
            <Input
              value={enInput}
              onChange={(e) => setEnInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEn(); } }}
              placeholder={`Add ${label.toLowerCase()}...`}
              className='h-8 text-xs'
            />
            <Button size='sm' variant='outline' className='h-8 px-2' onClick={addEn}>
              <Plus className='h-3.5 w-3.5' />
            </Button>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {items.map((item) => (
              <Badge key={item} variant='secondary' className='text-xs gap-1 pr-1'>
                {item}
                <button onClick={() => onChangeItems(items.filter((i) => i !== item))} className='hover:text-destructive'>
                  <X className='h-2.5 w-2.5' />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        {/* AR */}
        <div className='space-y-2'>
          <Label className='text-xs'>Arabic</Label>
          <div className='flex gap-2'>
            <Input
              value={arInput}
              onChange={(e) => setArInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAr(); } }}
              placeholder='أضف عنصراً...'
              dir='rtl'
              className='h-8 text-xs'
            />
            <Button size='sm' variant='outline' className='h-8 px-2' onClick={addAr}>
              <Plus className='h-3.5 w-3.5' />
            </Button>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {arItems.map((item) => (
              <Badge key={item} variant='secondary' className='text-xs gap-1 pr-1' dir='rtl'>
                {item}
                <button onClick={() => onChangeArItems(arItems.filter((i) => i !== item))} className='hover:text-destructive'>
                  <X className='h-2.5 w-2.5' />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseHeroInfoTab({ course }: { course: AdminCourse }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    longDescription:    course.longDescription    ?? '',
    ar_longDescription: course.ar_longDescription ?? '',
    skills:             [...(course.skills         ?? [])],
    ar_skills:          [...(course.ar_skills      ?? [])],
    topics:             [...(course.topics         ?? [])],
    ar_topics:          [...(course.ar_topics      ?? [])],
    prerequisites:      [...(course.prerequisites  ?? [])],
    ar_prerequisites:   [...(course.ar_prerequisites ?? [])],
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      adminCoursesApi.update(course.id, {
        longDescription:    form.longDescription    || undefined,
        ar_longDescription: form.ar_longDescription || undefined,
        skills:             form.skills,
        ar_skills:          form.ar_skills,
        topics:             form.topics,
        ar_topics:          form.ar_topics,
        prerequisites:      form.prerequisites,
        ar_prerequisites:   form.ar_prerequisites,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Hero info saved ✅');
    },
    onError: () => toast.error('Failed to save'),
  });

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className='space-y-4'>
      {/* Long Description */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>Long Description (Hero)</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label className='text-xs'>English</Label>
            <Textarea
              rows={6}
              value={form.longDescription}
              onChange={(e) => set('longDescription', e.target.value)}
              placeholder='Detailed course description shown on the hero section...'
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Arabic</Label>
            <Textarea
              rows={6}
              value={form.ar_longDescription}
              onChange={(e) => set('ar_longDescription', e.target.value)}
              placeholder='وصف تفصيلي للكورس يظهر في قسم الهيرو...'
              dir='rtl'
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <TagListEditor
        label='Skills' arLabel='مهارات'
        items={form.skills}      arItems={form.ar_skills}
        onChangeItems={(v) => set('skills', v)}
        onChangeArItems={(v) => set('ar_skills', v)}
      />

      {/* What you'll learn / Topics */}
      <TagListEditor
        label='Topics / What You Learn' arLabel='المواضيع'
        items={form.topics}      arItems={form.ar_topics}
        onChangeItems={(v) => set('topics', v)}
        onChangeArItems={(v) => set('ar_topics', v)}
      />

      {/* Prerequisites */}
      <TagListEditor
        label='Prerequisites' arLabel='المتطلبات'
        items={form.prerequisites}   arItems={form.ar_prerequisites}
        onChangeItems={(v) => set('prerequisites', v)}
        onChangeArItems={(v) => set('ar_prerequisites', v)}
      />

      {/* Save */}
      <div className='flex justify-end'>
        <Button onClick={() => save()} disabled={isPending} className='gap-2 min-w-[120px]'>
          {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
          Save Hero Info
        </Button>
      </div>
    </div>
  );
}
