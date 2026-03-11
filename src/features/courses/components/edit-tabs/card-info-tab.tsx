// CardInfoTab — تعديل بيانات الكارد الأساسية
import { useState }      from 'react';
import { useMutation }   from '@tanstack/react-query';
import { toast }         from 'sonner';
import { Save }          from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }        from '@/components/ui/button';
import { Input }         from '@/components/ui/input';
import { Label }         from '@/components/ui/label';
import { Textarea }      from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch }        from '@/components/ui/switch';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse } from '../../types/admin-course.types';

interface Props { course: AdminCourse; onSaved: () => void; }

export function CardInfoTab({ course, onSaved }: Props) {
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
    onSuccess: () => { toast.success('Card info saved'); onSaved(); },
    onError:   () => toast.error('Failed to save'),
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader><CardTitle className='text-base'>Basic Info</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>Title (EN)</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>Title (AR)</Label>
              <Input dir='rtl' value={form.ar_title} onChange={(e) => set('ar_title', e.target.value)} />
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>Description (EN)</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>Description (AR)</Label>
              <Textarea dir='rtl' rows={3} value={form.ar_description} onChange={(e) => set('ar_description', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className='text-base'>Settings</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <div className='space-y-1.5'>
              <Label>Color</Label>
              <Select value={form.color} onValueChange={(v) => set('color', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['EMERALD','BLUE','VIOLET','ORANGE','ROSE','CYAN'].map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Access</Label>
              <Select value={form.access} onValueChange={(v) => set('access', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='FREE'>Free</SelectItem>
                  <SelectItem value='PRO'>Pro</SelectItem>
                  <SelectItem value='PREMIUM'>Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'].map((d) => (
                    <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Content Type</Label>
              <Select value={form.contentType} onValueChange={(v) => set('contentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='PRACTICAL'>Practical</SelectItem>
                  <SelectItem value='THEORETICAL'>Theoretical</SelectItem>
                  <SelectItem value='MIXED'>Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['WEB_SECURITY','PENETRATION_TESTING','MALWARE_ANALYSIS','CLOUD_SECURITY',
                    'FUNDAMENTALS','CRYPTOGRAPHY','NETWORK_SECURITY','TOOLS_AND_TECHNIQUES',
                    'CAREER_AND_INDUSTRY'].map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Estimated Hours</Label>
              <Input type='number' min={0} value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)} />
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-6 pt-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} id='featured' />
              <Label htmlFor='featured'>Featured</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={form.isNew} onCheckedChange={(v) => set('isNew', v)} id='isNew' />
              <Label htmlFor='isNew'>Mark as New</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending} className='gap-2'>
          <Save className='h-4 w-4' /> {mut.isPending ? 'Saving...' : 'Save Card Info'}
        </Button>
      </div>
    </div>
  );
}
