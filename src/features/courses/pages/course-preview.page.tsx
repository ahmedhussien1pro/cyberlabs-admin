// src/features/courses/pages/course-preview.page.tsx
// Standalone admin preview — opens at /preview/courses/:slug
// Uses CoursePlatformPreviewTab which is already built in cyberlabs-admin.
// No imports from cyberlabs-frontend are needed.
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CoursePlatformPreviewTab } from '../components/course-preview-tab';

export default function CoursePreviewPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['admin', 'course-preview-page', slug],
    queryFn: () => adminCoursesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className='min-h-screen bg-background'>
      {/* ── Preview banner ── */}
      <div className='sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-500/95 backdrop-blur px-4 py-2 text-black text-sm font-semibold shadow'>
        <span>👁 Admin Preview Mode — not visible to users</span>
        <button
          className='rounded border border-black/20 px-3 py-0.5 text-xs hover:bg-black/10'
          onClick={() => window.close()}
        >
          Close Preview
        </button>
      </div>

      {/* ── Content ── */}
      <div className='container mx-auto px-4 py-6'>
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
              <Button variant='outline' size='sm'>Back to Courses</Button>
            </Link>
          </div>
        )}

        {course && <CoursePlatformPreviewTab course={course} />}
      </div>
    </div>
  );
}
