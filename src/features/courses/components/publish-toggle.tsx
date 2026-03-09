// src/features/courses/components/publish-toggle.tsx
import { useMutation } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { labsService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PublishToggleProps {
  id: string;
  isPublished: boolean;
  type: 'course' | 'lab';
  onSuccess: () => void;
}

export function PublishToggle({ id, isPublished, type, onSuccess }: PublishToggleProps) {
  // Both coursesService and labsService now have publish/unpublish
  // backed by real backend endpoints:
  //   courses: PATCH /admin/courses/:id/publish|unpublish
  //   labs:    PATCH /admin/labs/:id/publish|unpublish
  const service = type === 'course' ? coursesService : labsService;

  const mutation = useMutation({
    mutationFn: () =>
      isPublished ? service.unpublish(id) : service.publish(id),
    onSuccess: () => {
      const entity = type === 'course' ? 'Course' : 'Lab';
      toast.success(
        isPublished
          ? `${entity} unpublished successfully`
          : `${entity} published successfully`,
      );
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update publish status');
    },
  });

  return (
    <Button
      variant={isPublished ? 'outline' : 'default'}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      size='sm'
    >
      {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {isPublished ? 'Unpublish' : 'Publish'}
    </Button>
  );
}
