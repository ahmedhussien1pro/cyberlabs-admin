// src/features/labs/components/lab-admin-overlay-controls.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, Globe, EyeOff, Copy, ExternalLink } from 'lucide-react';
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
import { labsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { useLabsT } from '@/hooks/use-locale';
import type { LabListItem } from '@/core/types';

interface LabAdminOverlayControlsProps {
  lab: LabListItem;
}

export function LabAdminOverlayControls({ lab }: LabAdminOverlayControlsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const t = useLabsT();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['labs'] });

  const publishMutation = useMutation({
    mutationFn: () =>
      lab.isPublished ? labsService.unpublish(lab.id) : labsService.publish(lab.id),
    onSuccess: () => {
      toast.success(
        lab.isPublished ? t.unpublishedMsg(lab.title) : t.publishedMsg(lab.title),
      );
      invalidate();
    },
    onError: () => toast.error(t.failedStatus),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => labsService.duplicate(lab.id),
    onSuccess: () => {
      toast.success(t.duplicatedMsg(lab.title));
      invalidate();
    },
    onError: () => toast.error(t.failedDuplicate),
  });

  const deleteMutation = useMutation({
    mutationFn: () => labsService.delete(lab.id),
    onSuccess: () => {
      toast.success(t.deletedMsg(lab.title));
      invalidate();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete';
      toast.error(`${t.delete}: ${msg}`);
    },
  });

  const platformUrl = `${import.meta.env.VITE_PLATFORM_URL ?? 'https://test.cyber-labs.tech'}/labs/${lab.slug}`;

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col justify-between p-2',
          'bg-gradient-to-b from-black/70 via-transparent to-black/70',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        )}
        onClick={stopProp}
      >
        {/* Top row */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-7 gap-1.5 text-[11px] font-semibold rounded-full px-2.5',
              lab.isPublished
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            )}
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
          >
            {lab.isPublished ? (
              <><EyeOff className="h-3 w-3" /> {t.unpublish}</>
            ) : (
              <><Globe className="h-3 w-3" /> {t.publish}</>
            )}
          </Button>
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stopProp}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            title={t.viewOnPlatform}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            className="flex-1 h-8 text-[11px] gap-1.5 bg-primary/80 hover:bg-primary text-white rounded-lg"
            onClick={() => navigate(ROUTES.LAB_EDIT(lab.id))}
          >
            <Pencil className="h-3 w-3" /> {t.edit}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/10 text-white hover:bg-white/20 rounded-lg"
            onClick={() => duplicateMutation.mutate()}
            disabled={duplicateMutation.isPending}
            title={t.duplicate}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded-lg"
            onClick={() => setDeleteOpen(true)}
            title={t.delete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={stopProp}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle(lab.title)}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t.deleting : t.deleteLab}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
