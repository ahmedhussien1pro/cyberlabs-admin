// src/features/courses/components/course-labs-panel.tsx
// Attach / detach labs from a course via /admin/courses/:id/labs/:labId
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@/core/api/admin-client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FlaskConical, Search, Trash2, Plus, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function unwrap(res: any) {
  const raw =
    res?.status !== undefined && res?.data !== undefined ? res.data : res;
  return raw?.data ?? raw;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
  HARD: 'bg-red-500/15     text-red-400     border-red-500/30',
};

interface Props {
  courseId: string;
}

export function CourseLabsPanel({ courseId }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Attached labs
  const { data: attachedRaw, isLoading: loadingAttached } = useQuery({
    queryKey: ['admin', 'courses', courseId, 'labs'],
    queryFn: async () => {
      const res = await adminApiClient.get(`/admin/courses/${courseId}/labs`);
      return unwrap(res);
    },
  });
  const attached: any[] = Array.isArray(attachedRaw) ? attachedRaw : [];

  // All labs (for search/attach)
  const { data: allLabsRaw, isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'labs', 'list-for-attach'],
    queryFn: async () => {
      const res = await adminApiClient.get('/admin/labs', {
        params: { limit: 100, isPublished: true },
      });
      const d = unwrap(res);
      return Array.isArray(d) ? d : (d?.data ?? d ?? []);
    },
  });
  const allLabs: any[] = Array.isArray(allLabsRaw) ? allLabsRaw : [];

  const attachedIds = new Set(
    attached.map((a: any) => a.labId ?? a.lab?.id ?? a.id),
  );
  const filtered = allLabs.filter(
    (l: any) =>
      !attachedIds.has(l.id) &&
      (!search || l.title?.toLowerCase().includes(search.toLowerCase())),
  );

  const { mutate: attach, isPending: attaching } = useMutation({
    mutationFn: (labId: string) =>
      adminApiClient.post(`/admin/courses/${courseId}/labs/${labId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', courseId, 'labs'],
      });
      toast.success('Lab attached');
    },
    onError: () => toast.error('Failed to attach lab'),
  });

  const { mutate: detach, isPending: detaching } = useMutation({
    mutationFn: (labId: string) =>
      adminApiClient.delete(`/admin/courses/${courseId}/labs/${labId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', courseId, 'labs'],
      });
      toast.success('Lab detached');
    },
    onError: () => toast.error('Failed to detach lab'),
  });

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Attached labs */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Link2 className='h-4 w-4 text-primary' />
          <h3 className='text-sm font-semibold'>Attached Labs</h3>
          <Badge variant='outline' className='text-xs ml-auto'>
            {attached.length}
          </Badge>
        </div>

        {loadingAttached &&
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-14 rounded-lg' />
          ))}

        {!loadingAttached && attached.length === 0 && (
          <Card className='p-6 text-center text-muted-foreground text-sm'>
            No labs attached to this course yet.
          </Card>
        )}

        {attached.map((item: any) => {
          const lab = item.lab ?? item;
          const labId = item.labId ?? item.lab?.id ?? item.id;
          return (
            <div
              key={labId}
              className='flex items-center gap-3 rounded-lg border bg-card px-4 py-3'>
              <FlaskConical className='h-4 w-4 text-muted-foreground shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{lab.title}</p>
                <p className='text-xs text-muted-foreground font-mono truncate'>
                  {lab.slug}
                </p>
              </div>
              {lab.difficulty && (
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs shrink-0',
                    DIFFICULTY_COLORS[lab.difficulty] ?? '',
                  )}>
                  {lab.difficulty}
                </Badge>
              )}
              <button
                disabled={detaching}
                onClick={() => detach(labId)}
                className='shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'>
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            </div>
          );
        })}
      </div>

      {/* Available labs */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <FlaskConical className='h-4 w-4 text-muted-foreground' />
          <h3 className='text-sm font-semibold'>Available Labs</h3>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search labs...'
            className='pl-9 h-9 text-sm'
          />
        </div>

        {loadingAll &&
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-14 rounded-lg' />
          ))}

        {!loadingAll && filtered.length === 0 && (
          <Card className='p-6 text-center text-muted-foreground text-sm'>
            {search
              ? 'No labs match your search.'
              : 'All available labs are already attached.'}
          </Card>
        )}

        <div className='space-y-2 max-h-[480px] overflow-y-auto pr-1'>
          {filtered.map((lab: any) => (
            <div
              key={lab.id}
              className='flex items-center gap-3 rounded-lg border bg-card px-4 py-3'>
              <FlaskConical className='h-4 w-4 text-muted-foreground shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{lab.title}</p>
                <p className='text-xs text-muted-foreground font-mono truncate'>
                  {lab.slug}
                </p>
              </div>
              {lab.difficulty && (
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs shrink-0',
                    DIFFICULTY_COLORS[lab.difficulty] ?? '',
                  )}>
                  {lab.difficulty}
                </Badge>
              )}
              <button
                disabled={attaching}
                onClick={() => attach(lab.id)}
                className='shrink-0 rounded p-1 text-primary hover:bg-primary/10 transition-colors'>
                <Plus className='h-3.5 w-3.5' />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
