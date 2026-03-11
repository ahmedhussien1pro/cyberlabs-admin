// src/features/courses/pages/course-edit.page.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { coursesApi } from '../services/courses.api';
import { ROUTES } from '@/shared/constants';
import { CardInfoTab } from '../components/edit-tabs/card-info-tab';
import { HeroInfoTab } from '../components/edit-tabs/hero-info-tab';
import { CurriculumPlatformEditor } from '../components/curriculum-platform-editor';
import { CoursePlatformPreviewTab } from '../components/course-preview-tab';
import type { Course } from '../types/course.types';
import type { AdminCourse } from '../types/admin-course.types';

// Course and AdminCourse are structurally identical — safe cast
function toAdminCourse(c: Course): AdminCourse {
  return c as unknown as AdminCourse;
}

export default function CourseEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('card');

  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', 'detail', slug],
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-96 w-full rounded-xl' />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Course not found: <code className='font-mono text-xs'>{slug}</code>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* ── Header ── */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='sm'
          className='gap-2'
          onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <div className='flex-1 min-w-0'>
          <h1 className='text-xl font-bold truncate'>{course.title}</h1>
          <p className='text-xs text-muted-foreground font-mono'>
            {course.slug}
          </p>
        </div>
        <span
          className={[
            'rounded-full px-3 py-1 text-xs font-semibold border',
            course.state === 'PUBLISHED'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : course.state === 'COMING_SOON'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
          ].join(' ')}>
          {course.state.replace('_', ' ')}
        </span>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className='grid w-full grid-cols-4 max-w-lg'>
          <TabsTrigger value='card'>Card Info</TabsTrigger>
          <TabsTrigger value='hero'>Hero Info</TabsTrigger>
          <TabsTrigger value='curriculum'>Curriculum</TabsTrigger>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
        </TabsList>

        <TabsContent value='card' className='mt-6'>
          <CardInfoTab course={course} onSaved={refetch} />
        </TabsContent>

        <TabsContent value='hero' className='mt-6'>
          <HeroInfoTab course={course} onSaved={refetch} />
        </TabsContent>

        <TabsContent value='curriculum' className='mt-6'>
          <CurriculumPlatformEditor
            courseId={course.id}
            courseSlug={course.slug}
          />
        </TabsContent>

        <TabsContent value='preview' className='mt-6'>
          <CoursePlatformPreviewTab course={toAdminCourse(course)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
