import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { CourseForm } from '../components/course-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function CourseEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate(ROUTES.COURSE_DETAIL(id!))}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Edit Course</h1>
          <p className='text-muted-foreground'>
            {course?.title ?? 'Loading course...'}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className='space-y-4'>
          <Skeleton className='h-48' />
          <Skeleton className='h-32' />
        </div>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Failed to load course data. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {course && <CourseForm initialData={course} courseId={id} />}
    </div>
  );
}
