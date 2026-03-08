import { Link, useNavigate } from 'react-router-dom';
import { CourseForm } from '../components/course-form';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function CourseCreatePage() {
  const navigate = useNavigate();

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
        <span className='font-medium text-foreground'>New Course</span>
      </nav>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Create Course</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Add a new course to the platform
          </p>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-9 gap-2'
          onClick={() => navigate(ROUTES.COURSES)}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
      </div>

      <CourseForm />
    </div>
  );
}
