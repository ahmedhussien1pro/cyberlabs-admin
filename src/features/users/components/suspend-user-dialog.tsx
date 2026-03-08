import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/core/api/services';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/core/types';

interface SuspendUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SuspendUserDialog({ user, open, onOpenChange, onSuccess }: SuspendUserDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const isSuspended = !user.isActive;

  const suspendMutation = useMutation({
    mutationFn: () =>
      isSuspended
        ? usersService.unsuspend(user.id)
        : usersService.suspend(user.id, reason),
    onSuccess: () => {
      toast.success(isSuspended ? 'User unsuspended successfully' : 'User suspended successfully');
      onSuccess();
      onOpenChange(false);
      setReason('');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to update user status';
      setError(message);
    },
  });

  const handleSubmit = () => {
    setError('');
    suspendMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSuspended ? 'Unsuspend User' : 'Suspend User'}</DialogTitle>
          <DialogDescription>
            {isSuspended
              ? `Restore access for ${user.name} (${user.email})`
              : `Temporarily block access for ${user.name} (${user.email})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isSuspended && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="Enter suspension reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isSuspended ? 'default' : 'destructive'}
            onClick={handleSubmit}
            disabled={suspendMutation.isPending}
          >
            {suspendMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSuspended ? 'Unsuspend' : 'Suspend'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
