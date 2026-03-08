import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import type { CreateCourseRequest, Course } from '@/core/types';
import { useState } from 'react';

interface CourseFormProps {
  /** If provided, the form works in "edit" mode */
  initialData?: Partial<Course>;
  courseId?: string;
}

export function CourseForm({ initialData, courseId }: CourseFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const isEditMode = !!courseId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCourseRequest>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          ar_title: initialData.ar_title,
          slug: initialData.slug,
          description: initialData.description,
          ar_description: initialData.ar_description,
          difficulty: initialData.difficulty,
          category: initialData.category,
          thumbnail: initialData.thumbnail,
          isFeatured: initialData.isFeatured,
          isNew: initialData.isNew,
          instructorId: initialData.instructor?.id,
        }
      : undefined,
  });

  const difficulty = watch('difficulty');

  const createMutation = useMutation({
    mutationFn: coursesService.create,
    onSuccess: (data) => {
      toast.success('Course created successfully');
      navigate(ROUTES.COURSE_DETAIL(data.id));
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateCourseRequest>) =>
      coursesService.update(courseId!, payload),
    onSuccess: (data) => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate(ROUTES.COURSE_DETAIL(data.id));
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update course');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CreateCourseRequest) => {
    setError('');
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title (EN) *</Label>
              <Input
                id='title'
                {...register('title', { required: 'Title is required' })}
                placeholder='Introduction to Web Security'
              />
              {errors.title && (
                <p className='text-sm text-destructive'>
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='ar_title'>Title (AR)</Label>
              <Input
                id='ar_title'
                {...register('ar_title')}
                placeholder='مقدمة في أمن الويب'
                dir='rtl'
              />
            </div>
          </div>

          {!isEditMode && (
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='slug'>Slug *</Label>
                <Input
                  id='slug'
                  {...register('slug', {
                    required: 'Slug is required',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 'Slug must be lowercase with hyphens only',
                    },
                  })}
                  placeholder='intro-to-web-security'
                />
                {errors.slug && (
                  <p className='text-sm text-destructive'>
                    {errors.slug.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='instructorId'>Instructor ID *</Label>
                <Input
                  id='instructorId'
                  {...register('instructorId', {
                    required: 'Instructor ID is required',
                  })}
                  placeholder='uuid'
                />
                {errors.instructorId && (
                  <p className='text-sm text-destructive'>
                    {errors.instructorId.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='description'>Description (EN)</Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder='Course description...'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ar_description'>Description (AR)</Label>
            <Textarea
              id='ar_description'
              {...register('ar_description')}
              placeholder='وصف الدورة...'
              rows={3}
              dir='rtl'
            />
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setValue('difficulty', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select difficulty' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='BEGINNER'>Beginner</SelectItem>
                  <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
                  <SelectItem value='ADVANCED'>Advanced</SelectItem>
                  <SelectItem value='EXPERT'>Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='thumbnail'>Thumbnail URL</Label>
              <Input
                id='thumbnail'
                {...register('thumbnail')}
                placeholder='https://...'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <Input
                id='category'
                {...register('category')}
                placeholder='e.g. WEB_SECURITY'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() =>
            navigate(
              isEditMode ? ROUTES.COURSE_DETAIL(courseId!) : ROUTES.COURSES,
            )
          }>
          Cancel
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isEditMode ? 'Save Changes' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
