import { Link, useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from '../components/course-form';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function CourseEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className='space-y-6'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
        <Link
          to={ROUTES.COURSES}
          className='transition-colors hover:text-foreground'
        >
          Courses
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <Link
          to={ROUTES.COURSE_DETAIL(id!)}
          className='transition-colors hover:text-foreground'
        >
          Detail
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>Edit</span>
      </nav>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Course</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Update course metadata and content
          </p>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-9 gap-2'
          onClick={() => navigate(ROUTES.COURSE_DETAIL(id!))}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
      </div>

      <CourseForm mode='edit' courseId={id} />
    </div>
  );
}
