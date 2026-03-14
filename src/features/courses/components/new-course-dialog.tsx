// src/features/courses/components/new-course-dialog.tsx
// Supports two usage modes:
//   1. Uncontrolled: <NewCourseDialog />  — renders its own trigger button
//   2. Controlled:  <NewCourseDialog open={x} onClose={fn} /> — parent controls open state
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';

interface Props {
  /** Controlled open state. If provided, the internal trigger button is hidden. */
  open?: boolean;
  /** Called when the dialog should close (controlled mode). */
  onClose?: () => void;
}

export function NewCourseDialog({ open: controlledOpen, onClose }: Props = {}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);

  const open    = isControlled ? controlledOpen! : internalOpen;
  const setOpen = isControlled
    ? (v: boolean) => { if (!v) onClose?.(); }
    : setInternalOpen;

  const [title, setTitle] = useState('');
  const [slug,  setSlug]  = useState('');
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminCoursesApi.create({ title: title.trim(), slug: slug.trim() }),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(`Course "${course.title}" created!`);
      setOpen(false); setTitle(''); setSlug('');
      navigate(ROUTES.COURSE_EDIT(course.slug));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create course';
      toast.error(Array.isArray(msg) ? msg.join(' • ') : msg);
    },
  });

  const handleSlug = (raw: string) =>
    setSlug(raw.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));

  const content = (
    <DialogContent className='sm:max-w-md'>
      <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
      <div className='space-y-4 pt-2'>
        <div className='space-y-1.5'>
          <Label>Course Title</Label>
          <Input
            placeholder='e.g. Web Security Fundamentals'
            value={title}
            onChange={(e) => { setTitle(e.target.value); handleSlug(e.target.value); }}
          />
        </div>
        <div className='space-y-1.5'>
          <Label>Slug (URL)</Label>
          <Input
            placeholder='e.g. web-security-fundamentals'
            value={slug}
            onChange={(e) => handleSlug(e.target.value)}
            className='font-mono text-sm'
          />
          <p className='text-xs text-muted-foreground'>
            /courses/<span className='text-primary'>{slug || '…'}</span>
          </p>
        </div>
        <div className='flex gap-2 pt-2'>
          <Button variant='outline' className='flex-1' onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className='flex-1 gap-2'
            onClick={() => mutate()}
            disabled={isPending || !title.trim() || !slug.trim()}>
            {isPending
              ? <><Loader2 className='h-4 w-4 animate-spin' />Creating…</>
              : <><Plus className='h-4 w-4' />Create</>}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'><Plus className='h-4 w-4' />New Course</Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
