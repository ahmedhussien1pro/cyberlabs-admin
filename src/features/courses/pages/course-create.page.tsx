// src/features/courses/pages/course-create.page.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { coursesApi } from '../services/courses.api';
import { ROUTES } from '@/shared/constants';
import type { CourseCreateDto } from '../types/course.types';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
const ACCESSES     = ['FREE', 'PRO', 'PREMIUM'] as const;
const COLORS       = ['BLUE', 'EMERALD', 'VIOLET', 'ORANGE', 'ROSE', 'CYAN'] as const;
const CONTENT_TYPES = ['MIXED', 'PRACTICAL', 'THEORETICAL'] as const;
const CATEGORIES   = [
  'FUNDAMENTALS', 'WEB_SECURITY', 'PENETRATION_TESTING', 'MALWARE_ANALYSIS',
  'CLOUD_SECURITY', 'CRYPTOGRAPHY', 'NETWORK_SECURITY',
  'TOOLS_AND_TECHNIQUES', 'CAREER_AND_INDUSTRY',
] as const;

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CourseCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    title: string;
    ar_title: string;
    slug: string;
    description: string;
    difficulty: typeof DIFFICULTIES[number];
    access: typeof ACCESSES[number];
    category: typeof CATEGORIES[number];
    color: typeof COLORS[number];
    contentType: typeof CONTENT_TYPES[number];
    instructorId: string;
  }>({
    title: '',
    ar_title: '',
    slug: '',
    description: '',
    difficulty: 'BEGINNER',
    access: 'FREE',
    category: 'FUNDAMENTALS',
    color: 'BLUE',
    contentType: 'MIXED',
    instructorId: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (v: string) => {
    setForm((f) => ({
      ...f,
      title: v,
      slug: f.slug === slugify(f.title) || f.slug === '' ? slugify(v) : f.slug,
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CourseCreateDto) => coursesApi.create(dto),
    onSuccess: (course) => {
      toast.success(`Course "${course.title}" created!`);
      navigate(`/courses/${course.slug}/edit`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create course';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.slug.trim())  return toast.error('Slug is required');
    mutate({
      title: form.title.trim(),
      ar_title: form.ar_title.trim() || undefined,
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      difficulty: form.difficulty,
      access: form.access,
      category: form.category,
      color: form.color,
      contentType: form.contentType,
      instructorId: form.instructorId.trim() || 'default',
    });
  };

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' className='gap-2' onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <div>
          <h1 className='text-xl font-bold'>Create New Course</h1>
          <p className='text-xs text-muted-foreground'>Fill in the basic info. You can edit everything later.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Titles */}
        <Card>
          <CardHeader><CardTitle className='text-base'>Basic Info</CardTitle></CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>Title (EN) *</Label>
                <Input
                  placeholder='e.g. Web Application Hacking'
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Title (AR)</Label>
                <Input
                  dir='rtl'
                  placeholder='العنوان بالعربي'
                  value={form.ar_title}
                  onChange={(e) => set('ar_title', e.target.value)}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label>Slug *</Label>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground font-mono shrink-0'>courses/</span>
                <Input
                  placeholder='web-application-hacking'
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  className='font-mono text-sm'
                  required
                />
              </div>
              <p className='text-[11px] text-muted-foreground'>Auto-generated from title. Must be unique.</p>
            </div>

            <div className='space-y-1.5'>
              <Label>Description (EN)</Label>
              <Textarea
                rows={3}
                placeholder='Short description shown on course cards...'
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader><CardTitle className='text-base'>Settings</CardTitle></CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              <div className='space-y-1.5'>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label>Access</Label>
                <Select value={form.access} onValueChange={(v) => set('access', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCESSES.map((a) => (
                      <SelectItem key={a} value={a}>{a.charAt(0) + a.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label>Color</Label>
                <Select value={form.color} onValueChange={(v) => set('color', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label>Content Type</Label>
                <Select value={form.contentType} onValueChange={(v) => set('contentType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5 col-span-2'>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => navigate(ROUTES.COURSES)}>
            Cancel
          </Button>
          <Button type='submit' disabled={isPending} className='gap-2 min-w-[140px]'>
            {isPending
              ? <><Loader2 className='h-4 w-4 animate-spin' /> Creating...</>
              : <><Plus className='h-4 w-4' /> Create Course</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
