// hero-info-tab.tsx — all hero fields + live preview of CourseDetailHero
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse } from '../../types/admin-course.types';

// ── color + access options ────────────────────────────────────────────
const COLOR_OPTIONS   = ['blue','emerald','violet','orange','rose','cyan'];
const ACCESS_OPTIONS  = ['FREE','PRO','PREMIUM'];
const DIFF_OPTIONS    = ['BEGINNER','INTERMEDIATE','ADVANCED'];
const STATE_OPTIONS   = ['DRAFT','PUBLISHED','COMING_SOON'];
const CONTENT_OPTIONS = ['COURSE','LAB_SERIES','WORKSHOP','BOOTCAMP'];
const CATEGORY_OPTIONS = [
  'OFFENSIVE_SECURITY','DEFENSIVE_SECURITY','NETWORK_SECURITY',
  'CLOUD_SECURITY','WEB_SECURITY','MALWARE_ANALYSIS',
  'FORENSICS','COMPLIANCE','GENERAL',
];

interface Props { course: AdminCourse; onSaved: () => void; }

function TagsInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInput(''); }
  };
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs'>{label}</Label>
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
          placeholder='Type & press Enter'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs'>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'>
        {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );
}

// ── Mini Hero Preview (mirrors the real frontend hero layout) ──────────
const STRIPE: Record<string, string> = {
  blue:'bg-blue-500', emerald:'bg-emerald-500', violet:'bg-violet-500',
  orange:'bg-orange-500', rose:'bg-rose-500', cyan:'bg-cyan-500',
};
const TEXT_COLOR: Record<string, string> = {
  blue:'text-blue-400', emerald:'text-emerald-400', violet:'text-violet-400',
  orange:'text-orange-400', rose:'text-rose-400', cyan:'text-cyan-400',
};
const FALLBACK_BG: Record<string, string> = {
  blue:'from-blue-950 to-blue-900', emerald:'from-emerald-950 to-emerald-900',
  violet:'from-violet-950 to-violet-900', orange:'from-orange-950 to-orange-900',
  rose:'from-rose-950 to-rose-900', cyan:'from-cyan-950 to-cyan-900',
};

function HeroPreview({ form }: { form: ReturnType<typeof buildForm> }) {
  const col = form.color || 'blue';
  const img = form.image || form.thumbnail;
  return (
    <div className='rounded-xl overflow-hidden border border-border/40 text-white'>
      {/* Top stripe */}
      <div className={`h-1 w-full ${STRIPE[col] ?? 'bg-blue-500'}`} />
      {/* Dark hero area */}
      <div className='relative bg-zinc-950 px-6 py-6 space-y-3'>
        {/* breadcrumb */}
        <p className='text-[11px] text-white/40'>Courses › <span className='text-white/60'>{form.title || 'Course Title'}</span></p>
        {/* icon + title row */}
        <div className='flex items-start gap-3'>
          <div className='h-12 w-12 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10'>
            {img
              ? <img src={img} alt='' className='h-full w-full object-cover' />
              : <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${FALLBACK_BG[col] ?? 'from-zinc-900 to-zinc-800'}`}>
                  <span className={`text-[9px] font-black text-center px-1 ${TEXT_COLOR[col]}`}>{form.title?.slice(0, 12)}</span>
                </div>
            }
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap gap-1.5 mb-1.5'>
              <span className={`inline-flex items-center rounded-full border border-${col}-500/40 bg-${col}-500/10 px-2 py-0.5 text-[10px] font-bold ${TEXT_COLOR[col]}`}>
                {form.access}
              </span>
              <span className='inline-flex items-center rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/60'>
                {form.difficulty}
              </span>
              <span className='inline-flex items-center rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/50'>
                {form.category?.replace(/_/g, ' ')}
              </span>
              {form.isNew && (
                <span className='inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white'>New</span>
              )}
            </div>
            <h1 className='text-base font-black leading-tight'>{form.title || 'Course Title'}</h1>
            {form.ar_title && <p className='text-xs text-white/50 mt-0.5' dir='rtl'>{form.ar_title}</p>}
          </div>
        </div>
        {/* description */}
        {form.description && (
          <p className='text-xs text-white/55 leading-relaxed max-w-lg'>{form.description}</p>
        )}
        {/* stats bar */}
        <div className={`flex flex-wrap items-center gap-4 text-xs ${TEXT_COLOR[col]}`}>
          <span>📖 {form.totalTopics ?? 0} Topics</span>
          <span>⏱ {form.estimatedHours ?? 0}h est.</span>
          {form.labsLink && <span>🔗 Labs</span>}
        </div>
        {/* long desc */}
        {form.longDescription && (
          <div className='mt-3 rounded-lg border border-border/30 bg-white/5 p-3'>
            <p className='text-xs text-white/50 leading-relaxed'>{form.longDescription}</p>
          </div>
        )}
      </div>
      {/* skills / prerequisites teaser */}
      {(form.skills.length > 0 || form.prerequisites.length > 0) && (
        <div className='bg-zinc-900 px-6 py-3 flex flex-wrap gap-4 border-t border-white/5'>
          {form.skills.length > 0 && (
            <div>
              <p className='text-[10px] text-white/30 mb-1'>Skills</p>
              <div className='flex flex-wrap gap-1'>
                {form.skills.slice(0, 4).map((s) => (
                  <span key={s} className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50'>{s}</span>
                ))}
                {form.skills.length > 4 && <span className='text-[10px] text-white/30'>+{form.skills.length - 4}</span>}
              </div>
            </div>
          )}
          {form.prerequisites.length > 0 && (
            <div>
              <p className='text-[10px] text-white/30 mb-1'>Prerequisites</p>
              <div className='flex flex-wrap gap-1'>
                {form.prerequisites.slice(0, 3).map((s) => (
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

function buildForm(course: AdminCourse) {
  return {
    // identity
    title:              course.title              ?? '',
    ar_title:           course.ar_title           ?? '',
    // visual
    color:              course.color              ?? 'blue',
    image:              course.image              ?? '',
    thumbnail:          course.thumbnail          ?? '',
    // meta
    access:             course.access             ?? 'FREE',
    difficulty:         course.difficulty         ?? 'BEGINNER',
    category:           course.category           ?? 'GENERAL',
    contentType:        course.contentType        ?? 'COURSE',
    state:              course.state              ?? 'DRAFT',
    isNew:              course.isNew              ?? false,
    isFeatured:         course.isFeatured         ?? false,
    // numbers
    estimatedHours:     course.estimatedHours     ?? 0,
    totalTopics:        course.totalTopics        ?? 0,
    // text
    description:        course.description        ?? '',
    ar_description:     course.ar_description     ?? '',
    longDescription:    course.longDescription    ?? '',
    ar_longDescription: course.ar_longDescription ?? '',
    labsLink:           course.labsLink           ?? '',
    // arrays
    skills:             [...(course.skills             ?? [])],
    ar_skills:          [...(course.ar_skills          ?? [])],
    topics:             [...(course.topics             ?? [])],
    ar_topics:          [...(course.ar_topics          ?? [])],
    prerequisites:      [...(course.prerequisites      ?? [])],
    ar_prerequisites:   [...(course.ar_prerequisites   ?? [])],
    tags:               [...(course.tags               ?? [])],
  };
}

export function HeroInfoTab({ course, onSaved }: Props) {
  const [form, setForm] = useState(() => buildForm(course));
  const [showPreview, setShowPreview] = useState(true);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => adminCoursesApi.update(course.id, {
      color:              form.color,
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
    onSuccess: () => { toast.success('Hero info saved'); onSaved(); },
    onError:   () => toast.error('Failed to save'),
  });

  return (
    <div className='space-y-6'>

      {/* ── Preview toggle ── */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>Edit all hero fields below. Preview updates live.</p>
        <Button variant='outline' size='sm' className='gap-1.5 h-8' onClick={() => setShowPreview((v) => !v)}>
          {showPreview ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {/* ── Live Preview ── */}
      {showPreview && <HeroPreview form={form} />}

      {/* ── Visual ── */}
      <Card>
        <CardHeader><CardTitle className='text-base'>Visual</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <SelectField label='Color'       value={form.color}       options={COLOR_OPTIONS}   onChange={(v) => set('color', v)} />
            <SelectField label='Access'      value={form.access}      options={ACCESS_OPTIONS}  onChange={(v) => set('access', v)} />
            <SelectField label='Difficulty'  value={form.difficulty}  options={DIFF_OPTIONS}    onChange={(v) => set('difficulty', v)} />
            <SelectField label='Category'    value={form.category}    options={CATEGORY_OPTIONS} onChange={(v) => set('category', v)} />
            <SelectField label='Content Type' value={form.contentType} options={CONTENT_OPTIONS} onChange={(v) => set('contentType', v)} />
            <SelectField label='State'       value={form.state}       options={STATE_OPTIONS}   onChange={(v) => set('state', v)} />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Cover Image URL</Label>
              <Input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder='https://...' />
              {form.image && <img src={form.image} alt='' className='mt-1 h-20 rounded-lg object-cover border border-border' />}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Thumbnail URL</Label>
              <Input value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} placeholder='https://...' />
              {form.thumbnail && <img src={form.thumbnail} alt='' className='mt-1 h-20 rounded-lg object-cover border border-border' />}
            </div>
          </div>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 text-sm cursor-pointer'>
              <input type='checkbox' checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} className='rounded' />
              Is New
            </label>
            <label className='flex items-center gap-2 text-sm cursor-pointer'>
              <input type='checkbox' checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className='rounded' />
              Featured
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ── Identity ── */}
      <Card>
        <CardHeader><CardTitle className='text-base'>Title & Description</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Title (EN)</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Title (AR)</Label>
              <Input dir='rtl' value={form.ar_title} onChange={(e) => set('ar_title', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Short Description (EN)</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Short Description (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description} onChange={(e) => set('ar_description', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Long Description (EN)</Label>
              <Textarea rows={5} value={form.longDescription} onChange={(e) => set('longDescription', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Long Description (AR)</Label>
              <Textarea dir='rtl' rows={5} value={form.ar_longDescription} onChange={(e) => set('ar_longDescription', e.target.value)} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Estimated Hours</Label>
              <Input type='number' min={0} value={form.estimatedHours} onChange={(e) => set('estimatedHours', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Labs Link</Label>
              <Input value={form.labsLink} onChange={(e) => set('labsLink', e.target.value)} placeholder='https://...' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Arrays ── */}
      <Card>
        <CardHeader><CardTitle className='text-base'>Skills, Topics & Prerequisites</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <TagsInput label='Skills (EN)'         value={form.skills}           onChange={(v) => set('skills', v)} />
            <TagsInput label='Skills (AR)'         value={form.ar_skills}        onChange={(v) => set('ar_skills', v)} />
            <TagsInput label='Topics (EN)'         value={form.topics}           onChange={(v) => set('topics', v)} />
            <TagsInput label='Topics (AR)'         value={form.ar_topics}        onChange={(v) => set('ar_topics', v)} />
            <TagsInput label='Prerequisites (EN)'  value={form.prerequisites}    onChange={(v) => set('prerequisites', v)} />
            <TagsInput label='Prerequisites (AR)'  value={form.ar_prerequisites} onChange={(v) => set('ar_prerequisites', v)} />
            <TagsInput label='Tags'                value={form.tags}             onChange={(v) => set('tags', v)} />
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
