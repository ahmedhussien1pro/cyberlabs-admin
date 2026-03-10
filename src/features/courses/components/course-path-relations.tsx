// src/features/courses/components/course-path-relations.tsx
// إدارة علاقة الكورس بالمسارات (Paths) عبر PathModule
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { pathsService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  GitBranch,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Link2,
} from 'lucide-react';

interface Props {
  courseId: string;
  courseTitle: string;
}

export function CoursePathRelations({ courseId }: Props) {
  const queryClient = useQueryClient();
  const [selectedPathId, setSelectedPathId] = useState('');
  const [newOrder, setNewOrder] = useState<number>(1);

  // جلب الـ PathModules المرتبطة بالكورس
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['admin', 'courses', courseId, 'path-modules'],
    queryFn: () => adminCoursesApi.getPathModules(courseId),
  });

  // جلب كل المسارات المتاحة
  const { data: pathsData, isLoading: pathsLoading } = useQuery({
    queryKey: ['admin', 'paths', 'list'],
    queryFn: () => pathsService.getAll({ limit: 100 }),
  });

  const paths = (pathsData as any)?.data ?? pathsData ?? [];

  // إضافة الكورس لمسار
  const { mutate: addToPath, isPending: adding } = useMutation({
    mutationFn: () =>
      adminCoursesApi.addToPath(selectedPathId, courseId, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', courseId, 'path-modules'],
      });
      toast.success('Course added to path');
      setSelectedPathId('');
      setNewOrder(1);
    },
    onError: () => toast.error('Failed to add course to path'),
  });

  // حذف الكورس من مسار
  const { mutate: removeFromPath, isPending: removing } = useMutation({
    mutationFn: (moduleId: string) => adminCoursesApi.removeFromPath(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', courseId, 'path-modules'],
      });
      toast.success('Course removed from path');
    },
    onError: () => toast.error('Failed to remove course from path'),
  });

  // إعادة ترتيب
  const { mutate: reorder, isPending: reordering } = useMutation({
    mutationFn: ({ moduleId, order }: { moduleId: string; order: number }) =>
      adminCoursesApi.reorderPathModule(moduleId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', courseId, 'path-modules'],
      });
    },
    onError: () => toast.error('Failed to reorder'),
  });

  // المسارات التي الكورس مش فيها بالفعل
  const existingPathIds = new Set(
    modules.map((m: any) => m.pathId ?? m.path?.id),
  );
  const availablePaths = (paths as any[]).filter(
    (p: any) => !existingPathIds.has(p.id),
  );

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* ── Current Relations ── */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <GitBranch className='h-4 w-4 text-primary' />
          <h3 className='font-semibold'>Current Path Relations</h3>
          <Badge variant='outline' className='text-xs'>
            {modules.length} paths
          </Badge>
        </div>

        {modulesLoading ? (
          <div className='space-y-2'>
            {[1, 2].map((i) => (
              <Skeleton key={i} className='h-14 rounded-lg' />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <Card className='flex flex-col items-center gap-2 p-8 text-center'>
            <Link2 className='h-8 w-8 text-muted-foreground/30' />
            <p className='text-sm text-muted-foreground'>
              This course is not linked to any path yet.
            </p>
          </Card>
        ) : (
          <div className='space-y-2'>
            {modules.map((mod: any, idx: number) => (
              <Card key={mod.id} className='flex items-center gap-3 px-4 py-3'>
                {/* Order badge */}
                <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                  {mod.order ?? idx + 1}
                </span>

                {/* Path info */}
                <div className='flex-1 min-w-0'>
                  <p className='truncate text-sm font-medium'>
                    {mod.path?.title ?? mod.pathTitle ?? 'Unknown Path'}
                  </p>
                  <p className='truncate font-mono text-xs text-muted-foreground'>
                    Module ID: {mod.id}
                  </p>
                </div>

                {/* Reorder buttons */}
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    disabled={reordering || (mod.order ?? idx + 1) <= 1}
                    onClick={() =>
                      reorder({
                        moduleId: mod.id,
                        order: (mod.order ?? idx + 1) - 1,
                      })
                    }>
                    <ArrowUp className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    disabled={reordering}
                    onClick={() =>
                      reorder({
                        moduleId: mod.id,
                        order: (mod.order ?? idx + 1) + 1,
                      })
                    }>
                    <ArrowDown className='h-3.5 w-3.5' />
                  </Button>
                </div>

                {/* Remove */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  disabled={removing}
                  onClick={() => removeFromPath(mod.id)}>
                  {removing ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <Trash2 className='h-3.5 w-3.5' />
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Add to Path ── */}
      <div className='space-y-3 rounded-xl border border-dashed border-border/60 p-4'>
        <h3 className='text-sm font-semibold text-muted-foreground'>
          Add to a Path
        </h3>

        {pathsLoading ? (
          <Skeleton className='h-10 w-full' />
        ) : availablePaths.length === 0 ? (
          <p className='text-xs text-muted-foreground'>
            {(paths as any[]).length === 0
              ? 'No paths found.'
              : 'This course is already added to all available paths.'}
          </p>
        ) : (
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
            {/* Select Path */}
            <div className='flex-1 space-y-1.5'>
              <Label className='text-xs'>Select Path</Label>
              <Select value={selectedPathId} onValueChange={setSelectedPathId}>
                <SelectTrigger>
                  <SelectValue placeholder='Choose a path...' />
                </SelectTrigger>
                <SelectContent>
                  {availablePaths.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className='w-24 space-y-1.5'>
              <Label className='text-xs'>Order</Label>
              <Input
                type='number'
                min={1}
                value={newOrder}
                onChange={(e) => setNewOrder(+e.target.value)}
              />
            </div>

            {/* Add button */}
            <Button
              onClick={() => addToPath()}
              disabled={!selectedPathId || adding}
              className='gap-2'>
              {adding ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Plus className='h-4 w-4' />
              )}
              Add to Path
            </Button>
          </div>
        )}
      </div>

      {/* Info note */}
      <p className='text-xs text-muted-foreground'>
        Relations are managed via{' '}
        <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>
          PathModule
        </code>{' '}
        — never via direct course → path links.
      </p>
    </div>
  );
}
