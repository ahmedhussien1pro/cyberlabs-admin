// src/features/courses/components/course-metadata-form.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label }    from '@/components/ui/label';
import { Badge }    from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// ✅ barrel imports
import { adminCoursesApi } from '../services/admin-courses.api';
import type {
  AdminCourse, AdminCourseUpdateDto,
  CourseColor, CourseAccess, CourseDifficulty, CourseCategory, CourseContentType,
} from '../types';

const COLOR_OPTIONS: { value: CourseColor; dot: string; label: string }[] = [
  { value: 'EMERALD', dot: 'bg-emerald-500', label: 'Emerald' },
  { value: 'BLUE',    dot: 'bg-blue-500',    label: 'Blue'    },
  { value: 'VIOLET',  dot: 'bg-violet-500',  label: 'Violet'  },
  { value: 'ORANGE',  dot: 'bg-orange-500',  label: 'Orange'  },
  { value: 'ROSE',    dot: 'bg-rose-500',    label: 'Rose'    },
  { value: 'CYAN',    dot: 'bg-cyan-500',    label: 'Cyan'    },
];
const COLOR_DOT: Record<CourseColor, string> = {
  EMERALD: 'bg-emerald-500', BLUE: 'bg-blue-500', VIOLET: 'bg-violet-500',
  ORANGE:  'bg-orange-500',  ROSE: 'bg-rose-500', CYAN:   'bg-cyan-500',
};

interface Props { course: AdminCourse; }

export function CourseMetadataForm({ course }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminCourseUpdateDto>({
    title:              course.title,
    ar_title:           course.ar_title ?? '',
    description:        course.description ?? '',
    ar_description:     course.ar_description ?? '',
    longDescription:    course.longDescription ?? '',
    ar_longDescription: course.ar_longDescription ?? '',
    color:              course.color,
    access:             course.access,
    difficulty:         course.difficulty,
    category:           course.category,
    contentType:        course.contentType,
    estimatedHours:     course.estimatedHours,
    isFeatured:         course.isFeatured,
    isNew:              course.isNew,
    tags:               [...(course.tags ?? [])],
    skills:             [...(course.skills ?? [])],
    prerequisites:      [...(course.prerequisites ?? [])],
    thumbnail:          course.thumbnail ?? '',
    image:              course.image ?? '',
    labsLink:           course.labsLink ?? '',
  });
  const [newTag,    setNewTag]    = useState('');
  const [newSkill,  setNewSkill]  = useState('');
  const [newPrereq, setNewPrereq] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminCoursesApi.update(course.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }); toast.success('Course updated successfully'); },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update course';
      toast.error(Array.isArray(msg) ? msg.join(' • ') : msg);
    },
  });

  const addToArray    = (field: 'tags' | 'skills' | 'prerequisites', value: string) => {
    if (!value.trim()) return;
    setForm((f) => ({ ...f, [field]: [...(f[field] as string[]), value.trim()] }));
  };
  const removeFromArray = (field: 'tags' | 'skills' | 'prerequisites', idx: number) => {
    setForm((f) => ({ ...f, [field]: (f[field] as string[]).filter((_, i) => i !== idx) }));
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>{title}</h3>
  );

  return (
    <div className='space-y-8 max-w-3xl'>
      {/* Titles */}
      <section className='space-y-4'>
        <SectionHeader title='Titles' />
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'><Label>Title (EN)</Label><Input value={form.title as string} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div className='space-y-1.5'><Label>Title (AR)</Label><Input dir='rtl' value={form.ar_title as string} onChange={(e) => setForm((f) => ({ ...f, ar_title: e.target.value }))} /></div>
        </div>
      </section>

      {/* Descriptions */}
      <section className='space-y-4'>
        <SectionHeader title='Descriptions' />
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'><Label>Short (EN)</Label><Textarea rows={3} value={form.description as string} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div className='space-y-1.5'><Label>Short (AR)</Label><Textarea dir='rtl' rows={3} value={form.ar_description as string} onChange={(e) => setForm((f) => ({ ...f, ar_description: e.target.value }))} /></div>
          <div className='space-y-1.5'><Label>Long (EN)</Label><Textarea rows={5} value={form.longDescription as string} onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))} /></div>
          <div className='space-y-1.5'><Label>Long (AR)</Label><Textarea dir='rtl' rows={5} value={form.ar_longDescription as string} onChange={(e) => setForm((f) => ({ ...f, ar_longDescription: e.target.value }))} /></div>
        </div>
      </section>

      {/* Classification */}
      <section className='space-y-4'>
        <SectionHeader title='Classification' />
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <div className='space-y-1.5'><Label>Access</Label>
            <Select value={form.access as string} onValueChange={(v) => setForm((f) => ({ ...f, access: v as CourseAccess }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(['FREE','PRO','PREMIUM'] as CourseAccess[]).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'><Label>Difficulty</Label>
            <Select value={form.difficulty as string} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v as CourseDifficulty }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'] as CourseDifficulty[]).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'><Label>Content Type</Label>
            <Select value={form.contentType as string} onValueChange={(v) => setForm((f) => ({ ...f, contentType: v as CourseContentType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(['PRACTICAL','THEORETICAL','MIXED'] as CourseContentType[]).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'><Label>Est. Hours</Label>
            <Input type='number' min={0} value={form.estimatedHours as number} onChange={(e) => setForm((f) => ({ ...f, estimatedHours: +e.target.value }))} />
          </div>
        </div>
        <div className='space-y-1.5'><Label>Category</Label>
          <Select value={form.category as string} onValueChange={(v) => setForm((f) => ({ ...f, category: v as CourseCategory }))}>
            <SelectTrigger className='w-full sm:w-72'><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['WEB_SECURITY','PENETRATION_TESTING','MALWARE_ANALYSIS','CLOUD_SECURITY','FUNDAMENTALS','CRYPTOGRAPHY','NETWORK_SECURITY','TOOLS_AND_TECHNIQUES','CAREER_AND_INDUSTRY'] as CourseCategory[]).map((v) => (
                <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Color */}
      <section className='space-y-3'>
        <SectionHeader title='Color Theme' />
        <div className='flex gap-2'>
          {COLOR_OPTIONS.map(({ value, dot, label }) => (
            <button key={value} type='button' onClick={() => setForm((f) => ({ ...f, color: value }))} title={label}
              className={cn('h-8 w-8 rounded-full transition-all', dot,
                form.color === value ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110' : 'opacity-60 hover:opacity-100',
              )} />
          ))}
          <span className='flex items-center text-xs text-muted-foreground ml-2'>
            <span className={cn('h-2.5 w-2.5 rounded-full mr-1.5', COLOR_DOT[form.color as CourseColor])} />{form.color}
          </span>
        </div>
      </section>

      {/* Media */}
      <section className='space-y-4'>
        <SectionHeader title='Media' />
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'><Label>Thumbnail URL</Label><Input value={form.thumbnail as string} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder='https://...' /></div>
          <div className='space-y-1.5'><Label>Image URL</Label><Input value={form.image as string} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder='https://...' /></div>
          <div className='space-y-1.5'><Label>Labs Link</Label><Input value={form.labsLink as string} onChange={(e) => setForm((f) => ({ ...f, labsLink: e.target.value }))} placeholder='https://...' /></div>
        </div>
      </section>

      {/* Tags / Skills / Prerequisites */}
      {(['tags', 'skills', 'prerequisites'] as const).map((field) => {
        const labelMap = { tags: 'Tags', skills: 'Skills', prerequisites: 'Prerequisites' };
        const inputMap = { tags: newTag, skills: newSkill, prerequisites: newPrereq };
        const setterMap = { tags: setNewTag, skills: setNewSkill, prerequisites: setNewPrereq };
        return (
          <section key={field} className='space-y-3'>
            <SectionHeader title={labelMap[field]} />
            <div className='flex flex-wrap gap-1.5'>
              {((form[field] as string[]) ?? []).map((v, i) => (
                <Badge key={i} variant='secondary' className='gap-1 pr-1'>
                  {v}
                  <button onClick={() => removeFromArray(field, i)} className='ml-1 rounded hover:text-destructive'><X className='h-3 w-3' /></button>
                </Badge>
              ))}
            </div>
            <div className='flex gap-2'>
              <Input value={inputMap[field]} onChange={(e) => setterMap[field](e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToArray(field, inputMap[field]); setterMap[field](''); } }}
                placeholder={`Add ${labelMap[field].toLowerCase().slice(0, -1)}...`} className='max-w-xs' />
              <Button variant='outline' size='icon' onClick={() => { addToArray(field, inputMap[field]); setterMap[field](''); }}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </section>
        );
      })}

      <div className='border-t pt-4'>
        <Button onClick={() => mutate()} disabled={isPending} className='gap-2'>
          <Save className='h-4 w-4' />{isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
