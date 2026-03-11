// src/features/courses/components/edit-tabs/course-card-info-tab.tsx
// Tab 1 — Card Info: title, ar_title, description, ar_description,
//                    thumbnail, difficulty, access, category, color,
//                    contentType, tags, estimatedHours, isNew, isFeatured
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse } from '../../types/admin-course.types';

// ── Preview of the card thumbnail ──────────────────────────────────────
const FALLBACK_BG: Record<string, string> = {
  EMERALD: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  BLUE:    'from-blue-950    to-blue-900    border-blue-800/50',
  VIOLET:  'from-violet-950  to-violet-900  border-violet-800/50',
  ORANGE:  'from-orange-950  to-orange-900  border-orange-800/50',
  ROSE:    'from-rose-950    to-rose-900    border-rose-800/50',
  CYAN:    'from-cyan-950    to-cyan-900    border-cyan-800/50',
};
const FALLBACK_TEXT: Record<string, string> = {
  EMERALD: 'text-emerald-400', BLUE: 'text-blue-400',
  VIOLET:  'text-violet-400',  ORANGE: 'text-orange-400',
  ROSE:    'text-rose-400',    CYAN: 'text-cyan-400',
};

export function CourseCardInfoTab({ course }: { course: AdminCourse }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title:           course.title           ?? '',
    ar_title:        course.ar_title        ?? '',
    description:     course.description     ?? '',
    ar_description:  course.ar_description  ?? '',
    thumbnail:       course.thumbnail       ?? '',
    image:           (course as any).image  ?? '',
    difficulty:      course.difficulty      ?? 'BEGINNER',
    access:          course.access          ?? 'FREE',
    category:        course.category        ?? 'FUNDAMENTALS',
    color:           course.color           ?? 'BLUE',
    contentType:     course.contentType     ?? 'MIXED',
    estimatedHours:  String(course.estimatedHours ?? ''),
    isFeatured:      course.isFeatured      ?? false,
    isNew:           course.isNew           ?? false,
    tagsRaw:         (course.tags ?? []).join(', '),
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      adminCoursesApi.update(course.id, {
        title:          form.title          || undefined,
        ar_title:       form.ar_title       || undefined,
        description:    form.description    || undefined,
        ar_description: form.ar_description || undefined,
        thumbnail:      form.thumbnail      || undefined,
        difficulty:     form.difficulty     as any,
        access:         form.access         as any,
        category:       form.category       as any,
        color:          form.color          as any,
        contentType:    form.contentType    as any,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        isFeatured:     form.isFeatured,
        isNew:          form.isNew,
        tags:           form.tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Card info saved ✅');
    },
    onError: () => toast.error('Failed to save'),
  });

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const thumbUrl = form.image || form.thumbnail;
  const colorKey = form.color.toUpperCase();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* ── Left: form ── */}
      <div className='lg:col-span-2 space-y-4'>

        {/* Titles */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>Title</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>English</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder='Course title' />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Arabic</Label>
              <Input value={form.ar_title} onChange={(e) => set('ar_title', e.target.value)} placeholder='عنوان الكورس' dir='rtl' />
            </div>
          </CardContent>
        </Card>

        {/* Descriptions */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>Short Description (Card)</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>English</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder='Brief description shown on card...' />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Arabic</Label>
              <Textarea rows={3} value={form.ar_description} onChange={(e) => set('ar_description', e.target.value)} placeholder='وصف مختصر...' dir='rtl' />
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm flex items-center gap-2'><ImageIcon className='h-4 w-4' /> Thumbnail URL</CardTitle>
          </CardHeader>
          <CardContent className='space-y-1.5'>
            <Input
              value={form.thumbnail}
              onChange={(e) => set('thumbnail', e.target.value)}
              placeholder='https://cdn.example.com/course-thumb.jpg'
            />
            <p className='text-xs text-muted-foreground'>Leave empty to use gradient fallback based on color.</p>
          </CardContent>
        </Card>

        {/* Selects row */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>Course Properties</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
                <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Access</Label>
              <Select value={form.access} onValueChange={(v) => set('access', v)}>
                <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['FREE','PRO','PREMIUM'].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Content Type</Label>
              <Select value={form.contentType} onValueChange={(v) => set('contentType', v)}>
                <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['PRACTICAL','THEORETICAL','MIXED'].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Color</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v)}>
                <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['BLUE','EMERALD','VIOLET','ORANGE','ROSE','CYAN'].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Category</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    'WEB_SECURITY','PENETRATION_TESTING','MALWARE_ANALYSIS',
                    'CLOUD_SECURITY','FUNDAMENTALS','CRYPTOGRAPHY',
                    'NETWORK_SECURITY','TOOLS_AND_TECHNIQUES','CAREER_AND_INDUSTRY',
                  ].map((v) => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Est. Hours</Label>
              <Input
                type='number' min='0' step='0.5'
                value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)}
                placeholder='e.g. 8'
                className='h-9'
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader className='pb-3'><CardTitle className='text-sm'>Tags</CardTitle></CardHeader>
          <CardContent className='space-y-2'>
            <Input
              value={form.tagsRaw}
              onChange={(e) => set('tagsRaw', e.target.value)}
              placeholder='web, hacking, ctf (comma separated)'
            />
            {form.tagsRaw && (
              <div className='flex flex-wrap gap-1.5 pt-1'>
                {form.tagsRaw.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <Badge key={tag} variant='secondary' className='text-xs'>{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toggles */}
        <Card>
          <CardContent className='pt-4 flex items-center gap-8'>
            <div className='flex items-center gap-3'>
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} id='featured' />
              <Label htmlFor='featured' className='text-sm cursor-pointer'>Featured</Label>
            </div>
            <div className='flex items-center gap-3'>
              <Switch checked={form.isNew} onCheckedChange={(v) => set('isNew', v)} id='isnew' />
              <Label htmlFor='isnew' className='text-sm cursor-pointer'>Mark as New</Label>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className='flex justify-end'>
          <Button onClick={() => save()} disabled={isPending} className='gap-2 min-w-[120px]'>
            {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Right: live card preview ── */}
      <div className='hidden lg:flex flex-col gap-3'>
        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Live Preview</p>
        <div className='rounded-2xl border bg-card overflow-hidden ring-1 ring-transparent'>
          {/* Thumbnail */}
          <div className='relative aspect-video overflow-hidden bg-muted'>
            {thumbUrl ? (
              <img src={thumbUrl} alt='' className='w-full h-full object-cover' />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br border ${
                FALLBACK_BG[colorKey] ?? 'from-zinc-900 to-zinc-800 border-zinc-700'
              }`}>
                <p className={`font-black text-center px-3 leading-tight text-lg ${
                  FALLBACK_TEXT[colorKey] ?? 'text-zinc-400'
                }`}>{form.title || 'Course Title'}</p>
              </div>
            )}
            <div className='absolute top-3 start-3'>
              <span className='inline-flex items-center gap-1 rounded-full bg-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-300 shadow-md'>
                <span className='h-1.5 w-1.5 rounded-full bg-zinc-400' /> Draft
              </span>
            </div>
          </div>
          {/* Body */}
          <div className='p-4 space-y-2'>
            <p className='text-sm font-bold leading-snug line-clamp-2'>{form.title || 'Course Title'}</p>
            {form.ar_title && (
              <p className='text-xs text-muted-foreground' dir='rtl'>{form.ar_title}</p>
            )}
            {form.description && (
              <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>{form.description}</p>
            )}
            <div className='flex flex-wrap gap-1.5 pt-1'>
              <Badge variant='outline' className='text-[10px]'>{form.difficulty}</Badge>
              <Badge variant='outline' className='text-[10px]'>{form.access}</Badge>
              {form.estimatedHours && (
                <Badge variant='outline' className='text-[10px]'>{form.estimatedHours}h</Badge>
              )}
            </div>
          </div>
        </div>
        <p className='text-[10px] text-muted-foreground text-center'>Updates as you type</p>
      </div>
    </div>
  );
}
