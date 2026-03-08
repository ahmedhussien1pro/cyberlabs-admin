import { useMutation } from '@tanstack/react-query';
import { coursesService, labsService } from '@/core/api/services';
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
  const service = type === 'course' ? coursesService : labsService;

  const publishMutation = useMutation({
    mutationFn: () => (isPublished ? service.unpublish(id) : service.publish(id)),
    onSuccess: () => {
      toast.success(
        isPublished
          ? `${type === 'course' ? 'Course' : 'Lab'} unpublished successfully`
          : `${type === 'course' ? 'Course' : 'Lab'} published successfully`
      );
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update publish status');
    },
  });

  return (
    <Button
      variant={isPublished ? 'outline' : 'default'}
      onClick={() => publishMutation.mutate()}
      disabled={publishMutation.isPending}
    >
      {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPublished ? 'Unpublish' : 'Publish'}
    </Button>
  );
}
