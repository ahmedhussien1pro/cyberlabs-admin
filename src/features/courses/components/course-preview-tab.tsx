// src/features/courses/components/course-preview-tab.tsx
import type { AdminCourse } from '../types/admin-course.types';
import { useQuery } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { PlatformCurriculum } from './platform-curriculum';
import { PlatformCourseCard } from './platform-course-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Clock, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_GRADIENTS: Record<string, string> = {
  emerald: 'from-emerald-900/40 to-emerald-900/10 border-emerald-500/20',
  blue: 'from-blue-900/40 to-blue-900/10 border-blue-500/20',
  violet: 'from-violet-900/40 to-violet-900/10 border-violet-500/20',
  orange: 'from-orange-900/40 to-orange-900/10 border-orange-500/20',
  rose: 'from-rose-900/40 to-rose-900/10 border-rose-500/20',
  cyan: 'from-cyan-900/40 to-cyan-900/10 border-cyan-500/20',
};

interface Props {
  course: AdminCourse;
}

export function CoursePlatformPreviewTab({ course }: Props) {
  const { data: curriculumData, isLoading } = useQuery({
    queryKey: ['admin', 'curriculum', course.slug],
    queryFn: () => adminCoursesApi.getCurriculum(course.slug),
  });

  const gradient = COLOR_GRADIENTS[course.color] ?? COLOR_GRADIENTS.blue;

  return (
    <div className='space-y-6'>
      {/* Admin Preview Banner */}
      <div className='flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2'>
        <Eye className='h-4 w-4 text-yellow-400 shrink-0' />
        <p className='text-xs text-yellow-300'>
          Admin Preview — This shows how the course appears on the platform.
          Unsaved edits are not reflected until saved.
        </p>
        <Badge
          variant='outline'
          className='ml-auto shrink-0 border-yellow-500/40 text-yellow-400 text-xs'>
          {course.state}
        </Badge>
      </div>

      {/* Platform-Accurate Hero Section */}
      <div
        className={cn(
          'rounded-xl border bg-gradient-to-br p-6 space-y-4',
          gradient,
        )}>
        <div className='flex items-start gap-4'>
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className='h-20 w-20 rounded-lg object-cover shrink-0'
            />
          )}
          <div className='space-y-2 min-w-0'>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className='text-xs'>
                {course.access}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {course.difficulty}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {course.category.replace(/_/g, ' ')}
              </Badge>
              {course.isNew && (
                <Badge className='bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs'>
                  NEW
                </Badge>
              )}
              {course.isFeatured && (
                <Badge className='bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs'>
                  FEATURED
                </Badge>
              )}
            </div>
            <h1 className='text-xl font-bold'>{course.title}</h1>
            {course.ar_title && (
              <p className='text-sm text-muted-foreground' dir='rtl'>
                {course.ar_title}
              </p>
            )}
            <p className='text-sm text-muted-foreground'>
              {course.description}
            </p>
            <div className='flex flex-wrap gap-4 text-xs text-muted-foreground pt-1'>
              <span className='flex items-center gap-1'>
                <Clock className='h-3.5 w-3.5' />
                {course.estimatedHours}h
              </span>
              <span className='flex items-center gap-1'>
                <Users className='h-3.5 w-3.5' />
                {course.enrollmentCount} enrolled
              </span>
              <span className='flex items-center gap-1'>
                <BookOpen className='h-3.5 w-3.5' />
                {course.totalTopics} topics
              </span>
            </div>
          </div>
        </div>

        {course.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {course.tags.map((tag) => (
              <Badge key={tag} variant='outline' className='text-xs opacity-70'>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Course Card Preview */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
          Card Preview (as seen in course listing)
        </h3>
        <div className='max-w-xs'>
          <PlatformCourseCard course={course as any} />
        </div>
      </div>

      {/* Curriculum Preview */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
          Curriculum Preview ({curriculumData?.totalTopics ?? 0} topics)
        </h3>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-12 rounded-lg' />
            ))}
          </div>
        ) : (
          <PlatformCurriculum
            topics={curriculumData?.topics ?? []}
            courseId={course.id}
          />
        )}
      </div>
    </div>
  );
}
