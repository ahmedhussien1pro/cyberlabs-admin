// CoursesTable — Table view for courses list
import { useNavigate }   from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast }          from 'sonner';
import {
  Edit2, Globe, EyeOff, Trash2, Copy,
  ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react';
import { Card }          from '@/components/ui/card';
import { Button }        from '@/components/ui/button';
import { Badge }         from '@/components/ui/badge';
import { cn }            from '@/lib/utils';
import { coursesApi }    from '../services/courses.api';
import { ROUTES }        from '@/shared/constants';
import type { Course }   from '../types/course.types';

interface Props {
  data: Course[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  page: number;
  onPageChange: (p: number) => void;
  onRefetch: () => void;
}

const STATE_BADGE: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  DRAFT:       'bg-zinc-500/10    border-zinc-500/30    text-zinc-400',
  COMING_SOON: 'bg-blue-500/10    border-blue-500/30    text-blue-400',
};

export function CoursesTable({ data, meta, page, onPageChange, onRefetch }: Props) {
  const navigate    = useNavigate();
  const qc          = useQueryClient();
  const invalidate  = () => qc.invalidateQueries({ queryKey: ['courses'] });

  const deleteMut = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); invalidate(); onRefetch(); },
    onError: () => toast.error('Failed to delete'),
  });

  const pubMut = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      published ? coursesApi.unpublish(id) : coursesApi.publish(id),
    onSuccess: () => { toast.success('Updated'); invalidate(); onRefetch(); },
    onError: () => toast.error('Failed to update state'),
  });

  const dupMut = useMutation({
    mutationFn: (id: string) => coursesApi.duplicate(id),
    onSuccess: (c) => { toast.success('Duplicated'); invalidate(); navigate(ROUTES.COURSE_EDIT(c.slug)); },
    onError: () => toast.error('Failed to duplicate'),
  });

  return (
    <Card className='overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-muted/30'>
              <th className='px-4 py-3 text-start font-semibold text-muted-foreground'>Course</th>
              <th className='px-4 py-3 text-start font-semibold text-muted-foreground'>State</th>
              <th className='px-4 py-3 text-start font-semibold text-muted-foreground'>Difficulty</th>
              <th className='px-4 py-3 text-start font-semibold text-muted-foreground'>Access</th>
              <th className='px-4 py-3 text-start font-semibold text-muted-foreground'>Enrolled</th>
              <th className='px-4 py-3 text-end font-semibold text-muted-foreground'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((course) => (
              <tr key={course.id} className='border-b border-border/50 hover:bg-muted/20 transition-colors'>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-muted'>
                      {(course.image ?? course.thumbnail) ? (
                        <img src={course.image ?? course.thumbnail ?? ''} alt={course.title}
                          className='h-full w-full object-cover' />
                      ) : (
                        <div className='h-full w-full bg-primary/10 flex items-center justify-center'>
                          <span className='text-[8px] font-bold text-primary px-1 text-center leading-tight'>
                            {course.title.slice(0, 10)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className='font-semibold text-foreground line-clamp-1'>{course.title}</p>
                      <p className='text-xs text-muted-foreground'>{course.slug}</p>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <Badge variant='outline' className={cn('text-[10px] font-semibold', STATE_BADGE[course.state])}>
                    {course.state.replace('_', ' ')}
                  </Badge>
                </td>
                <td className='px-4 py-3'>
                  <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <BarChart3 className='h-3 w-3' />
                    {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <span className='text-xs text-muted-foreground'>{course.access}</span>
                </td>
                <td className='px-4 py-3'>
                  <span className='text-xs font-semibold'>{course.enrollmentCount ?? 0}</span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center justify-end gap-1'>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'
                      onClick={() => navigate(ROUTES.COURSE_EDIT(course.slug))}>
                      <Edit2 className='h-3.5 w-3.5' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'
                      onClick={() => pubMut.mutate({ id: course.id, published: course.state === 'PUBLISHED' })}>
                      {course.state === 'PUBLISHED'
                        ? <EyeOff className='h-3.5 w-3.5 text-amber-400' />
                        : <Globe  className='h-3.5 w-3.5 text-emerald-400' />}
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'
                      onClick={() => dupMut.mutate(course.id)}>
                      <Copy className='h-3.5 w-3.5' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                      onClick={() => {
                        if (confirm(`Delete "${course.title}"?`)) deleteMut.mutate(course.id);
                      }}>
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className='flex items-center justify-between border-t px-4 py-3'>
          <p className='text-xs text-muted-foreground'>
            Page <span className='font-semibold text-foreground'>{page}</span> of{' '}
            <span className='font-semibold text-foreground'>{meta.totalPages}</span>
          </p>
          <div className='flex items-center gap-1'>
            <Button variant='outline' size='sm' className='h-8 w-8 p-0'
              onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              <ChevronLeft className='h-3.5 w-3.5' />
            </Button>
            <Button variant='outline' size='sm' className='h-8 w-8 p-0'
              onClick={() => onPageChange(page + 1)} disabled={page === meta.totalPages}>
              <ChevronRight className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
