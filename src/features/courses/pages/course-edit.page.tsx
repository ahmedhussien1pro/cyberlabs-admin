import { useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from '../components/course-form';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft } from 'lucide-react';

export default function CourseEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
            Update course metadata and content
          </p>
        </div>
      </div>
      <CourseForm mode='edit' courseId={id} />
    </div>
  );
}
