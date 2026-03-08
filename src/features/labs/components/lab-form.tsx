import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { labsService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import type { CreateLabRequest, Lab } from '@/core/types';
import { useState } from 'react';

interface LabFormProps {
  /** When provided the form operates in edit mode */
  initialData?: Partial<Lab>;
  labId?: string;
}

export function LabForm({ initialData, labId }: LabFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!labId;
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLabRequest>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description,
          category: initialData.category,
          difficulty: initialData.difficulty,
          executionMode: initialData.executionMode,
          points: initialData.points,
          flagAnswer: initialData.flagAnswer,
          xpReward: initialData.xpReward,
          pointsReward: initialData.pointsReward,
          duration: initialData.duration,
          maxAttempts: initialData.maxAttempts,
          timeLimit: initialData.timeLimit,
        }
      : undefined,
  });

  const difficulty = watch('difficulty');
  const category = watch('category');
  const executionMode = watch('executionMode');

  const createMutation = useMutation({
    mutationFn: labsService.create,
    onSuccess: (data) => {
      toast.success('Lab created successfully');
      navigate(ROUTES.LAB_DETAIL(data.id));
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create lab');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateLabRequest>) =>
      labsService.update(labId!, payload),
    onSuccess: (data) => {
      toast.success('Lab updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lab', labId] });
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      navigate(ROUTES.LAB_DETAIL(data.id));
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update lab');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CreateLabRequest) => {
    setError('');
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="SQL Injection Basics"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  {...register('slug', {
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 'Slug must be lowercase with hyphens only',
                    },
                  })}
                  placeholder="sql-injection-basics"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Lab description..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setValue('difficulty', v as any)}
              >
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue('category', v as any)}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB_SECURITY">Web Security</SelectItem>
                  <SelectItem value="NETWORK_SECURITY">Network Security</SelectItem>
                  <SelectItem value="CRYPTOGRAPHY">Cryptography</SelectItem>
                  <SelectItem value="FORENSICS">Forensics</SelectItem>
                  <SelectItem value="REVERSE_ENGINEERING">Reverse Engineering</SelectItem>
                  <SelectItem value="BINARY_EXPLOITATION">Binary Exploitation</SelectItem>
                  <SelectItem value="OSINT">OSINT</SelectItem>
                  <SelectItem value="MISC">Misc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Execution Mode</Label>
              <Select
                value={executionMode}
                onValueChange={(v) => setValue('executionMode', v as any)}
              >
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRONTEND">Frontend</SelectItem>
                  <SelectItem value="SHARED_BACKEND">Shared Backend</SelectItem>
                  <SelectItem value="DOCKER">Docker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="xpReward">XP Reward</Label>
              <Input
                id="xpReward"
                type="number"
                {...register('xpReward', { valueAsNumber: true })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsReward">Points Reward</Label>
              <Input
                id="pointsReward"
                type="number"
                {...register('pointsReward', { valueAsNumber: true })}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                {...register('maxAttempts', { valueAsNumber: true })}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
              <Input
                id="timeLimit"
                type="number"
                {...register('timeLimit', { valueAsNumber: true })}
                placeholder="3600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flag Answer */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-400">
            <Shield className="h-5 w-5" />
            Flag Answer (Protected)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-amber-500/50">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 dark:text-amber-400">
              Stored securely. Never exposed to users.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="flagAnswer">Flag Answer</Label>
            <Input
              id="flagAnswer"
              {...register('flagAnswer')}
              placeholder="FLAG{example_flag_here}"
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            navigate(isEditMode ? ROUTES.LAB_DETAIL(labId!) : ROUTES.LABS)
          }
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Save Changes' : 'Create Lab'}
        </Button>
      </div>
    </form>
  );
}
