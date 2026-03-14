import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CoursePlatformPreviewTab } from '../components/edit-tabs/course-preview-tab';

export default function CoursePreviewPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'course-preview-page', slug],
    queryFn: () => adminCoursesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className='min-h-screen bg-background'>
      {/* ── Content ── */}
      {isLoading && (
        <div className='flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading preview…</span>
        </div>
      )}

      {(isError || (!isLoading && !course)) && (
        <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
          <Shield className='h-12 w-12 text-muted-foreground' />
          <p className='font-semibold'>Course not found</p>
          <Link to='/courses'>
            <Button variant='outline' size='sm'>
              Back to Courses
            </Button>
          </Link>
        </div>
      )}

      {course && <CoursePlatformPreviewTab course={course} />}
    </div>
  );
}
