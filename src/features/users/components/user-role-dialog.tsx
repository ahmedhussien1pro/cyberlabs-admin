// src/features/users/components/user-role-dialog.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/core/api/services';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User, UserRole } from '@/core/types';

// All assignable roles — was missing INSTRUCTOR + CONTENT_CREATOR
const ASSIGNABLE_ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'USER',            label: 'User'            },
  { value: 'ADMIN',           label: 'Admin'           },
  { value: 'INSTRUCTOR',      label: 'Instructor'      },
  { value: 'CONTENT_CREATOR', label: 'Content Creator' },
];

interface UserRoleDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserRoleDialog({ user, open, onOpenChange, onSuccess }: UserRoleDialogProps) {
  const [role, setRole]   = useState<UserRole>(user.role);
  const [error, setError] = useState('');

  const updateRoleMutation = useMutation({
    mutationFn: () => usersService.updateRole(user.id, { role }),
    onSuccess: () => {
      toast.success('User role updated successfully');
      onSuccess();
      onOpenChange(false);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Failed to update user role');
    },
  });

  const handleSubmit = () => {
    if (role === user.role) { onOpenChange(false); return; }
    setError('');
    updateRoleMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.name ?? user.email} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id='role'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant='destructive' role='alert'>
              <AlertCircle className='h-4 w-4' aria-hidden='true' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={updateRoleMutation.isPending}>
            {updateRoleMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
