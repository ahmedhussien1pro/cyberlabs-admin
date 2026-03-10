import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coursesService, labsService } from '@/core/api/services';

interface PublishToggleProps {
  id: string;
  isPublished: boolean;
  type: 'course' | 'lab';
  onSuccess?: () => void;
}

export function PublishToggle({ id, isPublished, type, onSuccess }: PublishToggleProps) {
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState(isPublished);

  const mutation = useMutation({
    mutationFn: () => {
      if (type === 'course') {
        return optimistic
          ? coursesService.unpublish(id)
          : coursesService.publish(id);
      } else {
        return optimistic
          ? labsService.unpublish(id)
          : labsService.publish(id);
      }
    },
    onMutate: () => {
      setOptimistic((prev) => !prev);
    },
    onSuccess: () => {
      const nextState = !isPublished;
      toast.success(`${type === 'course' ? 'Course' : 'Lab'} ${nextState ? 'published' : 'unpublished'} successfully`);
      if (type === 'course') {
        qc.invalidateQueries({ queryKey: ['courses'] });
      } else {
        qc.invalidateQueries({ queryKey: ['labs'] });
      }
      onSuccess?.();
    },
    onError: () => {
      setOptimistic(isPublished);
      toast.error(`Failed to ${isPublished ? 'unpublish' : 'publish'} ${type}`);
    },
  });

  return (
    <Button
      variant={optimistic ? 'outline' : 'default'}
      size='sm'
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className='gap-2'
    >
      {mutation.isPending ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : optimistic ? (
        <EyeOff className='h-4 w-4' />
      ) : (
        <Eye className='h-4 w-4' />
      )}
      {mutation.isPending
        ? 'Updating...'
        : optimistic
          ? 'Unpublish'
          : 'Publish'}
    </Button>
  );
}
