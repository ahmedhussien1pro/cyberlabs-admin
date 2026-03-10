// src/features/paths/components/path-admin-overlay-controls.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, Globe, EyeOff, Copy, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { pathsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import type { LearningPathListItem } from '@/core/types/api.types';

interface PathAdminOverlayControlsProps {
  path: LearningPathListItem;
}

export function PathAdminOverlayControls({ path }: PathAdminOverlayControlsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });

  const publishMutation = useMutation({
    mutationFn: () =>
      path.isPublished ? pathsService.unpublish(path.id) : pathsService.publish(path.id),
    onSuccess: () => {
      toast.success(path.isPublished ? `"${path.title}" unpublished` : `"${path.title}" published`);
      invalidate();
    },
    onError: () => toast.error('Failed to update status'),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => pathsService.duplicate(path.id),
    onSuccess: () => {
      toast.success(`"${path.title}" duplicated`);
      invalidate();
    },
    onError: () => toast.error('Failed to duplicate path'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => pathsService.delete(path.id),
    onSuccess: () => {
      toast.success(`"${path.title}" deleted`);
      invalidate();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete';
      toast.error(`Cannot delete: ${msg}`);
    },
  });

  const platformUrl = `${import.meta.env.VITE_PLATFORM_URL ?? 'https://test.cyber-labs.tech'}/paths/${path.id}`;

  return (
    <>
      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col justify-between p-2',
          'bg-gradient-to-b from-black/70 via-transparent to-black/70',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        )}
      >
        {/* Top row */}
        <div className='flex items-center justify-between'>
          <Button
            size='sm'
            variant='ghost'
            className={cn(
              'h-7 gap-1.5 text-[11px] font-semibold rounded-full px-2.5',
              path.isPublished
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            )}
            onClick={(e) => { e.preventDefault(); publishMutation.mutate(); }}
            disabled={publishMutation.isPending}
          >
            {path.isPublished ? <><EyeOff className='h-3 w-3' /> Unpublish</> : <><Globe className='h-3 w-3' /> Publish</>}
          </Button>
          <a
            href={platformUrl}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors'
            title='View on platform'
          >
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        </div>

        {/* Bottom row */}
        <div className='flex items-center gap-1.5'>
          <Button
            size='sm'
            className='flex-1 h-8 text-[11px] gap-1.5 bg-primary/80 hover:bg-primary text-white rounded-lg'
            onClick={(e) => { e.preventDefault(); navigate(ROUTES.PATH_EDIT(path.id)); }}
          >
            <Pencil className='h-3 w-3' /> Edit
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0 bg-white/10 text-white hover:bg-white/20 rounded-lg'
            onClick={(e) => { e.preventDefault(); navigate(ROUTES.PATH_DETAIL(path.id)); }}
            title='View detail'
          >
            <Eye className='h-3.5 w-3.5' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0 bg-white/10 text-white hover:bg-white/20 rounded-lg'
            onClick={(e) => { e.preventDefault(); duplicateMutation.mutate(); }}
            disabled={duplicateMutation.isPending}
            title='Duplicate'
          >
            <Copy className='h-3.5 w-3.5' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0 bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded-lg'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteOpen(true); }}
            title='Delete'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{path.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the learning path and all its modules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Path'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
