// HeroInfoTab — تعديل hero: image, longDescription, skills, topics, prerequisites
import { useState }      from 'react';
import { useMutation }   from '@tanstack/react-query';
import { toast }         from 'sonner';
import { Save, X }       from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }        from '@/components/ui/button';
import { Input }         from '@/components/ui/input';
import { Label }         from '@/components/ui/label';
import { Textarea }      from '@/components/ui/textarea';
import { Badge }         from '@/components/ui/badge';
import { coursesApi }    from '../../services/courses.api';
import type { Course }   from '../../types/course.types';

interface Props { course: Course; onSaved: () => void; }

function TagsInput({
  label, value, onChange,
}: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInput(''); }
  };
  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      <div className='flex flex-wrap gap-1.5 rounded-lg border border-border bg-background p-2 min-h-[2.5rem]'>
        {value.map((t) => (
          <Badge key={t} variant='secondary' className='gap-1 text-xs'>
            {t}
            <button type='button' onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}
        <input
          className='flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          placeholder='Add & press Enter'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
      </div>
    </div>
  );
}

export function HeroInfoTab({ course, onSaved }: Props) {
  const [form, setForm] = useState({
    image:              course.image              ?? '',
    thumbnail:          course.thumbnail          ?? '',
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

  const set  = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => coursesApi.update(course.id, {
      image:              form.image              || null,
      thumbnail:          form.thumbnail          || null,
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
    onSuccess: () => { toast.success('Hero info saved'); onSaved(); },
    onError:   () => toast.error('Failed to save'),
  });

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader><CardTitle className='text-base'>Images</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>Cover Image URL</Label>
              <Input value={form.image} onChange={(e) => set('image', e.target.value)}
                placeholder='https://...' />
              {form.image && (
                <img src={form.image} alt='' className='mt-2 h-24 rounded-lg object-cover border border-border' />
              )}
            </div>
            <div className='space-y-1.5'>
              <Label>Thumbnail URL</Label>
              <Input value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)}
                placeholder='https://...' />
              {form.thumbnail && (
                <img src={form.thumbnail} alt='' className='mt-2 h-24 rounded-lg object-cover border border-border' />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className='text-base'>Long Description</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>EN</Label>
              <Textarea rows={5} value={form.longDescription}
                onChange={(e) => set('longDescription', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>AR</Label>
              <Textarea dir='rtl' rows={5} value={form.ar_longDescription}
                onChange={(e) => set('ar_longDescription', e.target.value)} />
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label>Labs Link</Label>
            <Input value={form.labsLink} onChange={(e) => set('labsLink', e.target.value)}
              placeholder='https://...' />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className='text-base'>Skills, Topics & Prerequisites</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <TagsInput label='Skills (EN)'          value={form.skills}           onChange={(v) => set('skills', v)} />
            <TagsInput label='Skills (AR)'          value={form.ar_skills}        onChange={(v) => set('ar_skills', v)} />
            <TagsInput label='Topics (EN)'          value={form.topics}           onChange={(v) => set('topics', v)} />
            <TagsInput label='Topics (AR)'          value={form.ar_topics}        onChange={(v) => set('ar_topics', v)} />
            <TagsInput label='Prerequisites (EN)'   value={form.prerequisites}    onChange={(v) => set('prerequisites', v)} />
            <TagsInput label='Prerequisites (AR)'   value={form.ar_prerequisites} onChange={(v) => set('ar_prerequisites', v)} />
            <TagsInput label='Tags'                 value={form.tags}             onChange={(v) => set('tags', v)} />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' /> {mut.isPending ? 'Saving...' : 'Save Hero Info'}
        </Button>
      </div>
    </div>
  );
}
