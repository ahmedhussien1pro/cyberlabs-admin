// src/features/courses/pages/course-detail.page.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CourseSectionsEditor } from '../components/course-sections-editor';
import { CourseLabsPanel } from '../components/course-labs-panel';
import { CoursePlatformPreviewTab } from '../components/course-preview-tab';
import { CourseMetadataForm } from '../components/course-metadata-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  Eye,
  Pencil,
  Globe,
  FileEdit,
  Loader2,
  Users,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'curriculum' | 'labs' | 'preview';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: Pencil },
  { key: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { key: 'labs', label: 'Labs', icon: FlaskConical },
  { key: 'preview', label: 'Preview', icon: Eye },
];

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'courses', 'detail', id],
    queryFn: () => adminCoursesApi.getById(id!),
    enabled: !!id,
  });

  const course = (data as any)?.data ?? data;

  const { mutate: togglePublish, isPending: isToggling } = useMutation({
    mutationFn: (action: 'publish' | 'unpublish') =>
      action === 'publish'
        ? adminCoursesApi.publish(id!)
        : adminCoursesApi.unpublish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course state updated');
    },
    onError: () => toast.error('Failed to update state'),
  });

  if (isLoading)
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );

  if (error || !course)
    return (
      <div className='flex flex-col items-center justify-center gap-4 p-12 text-center'>
        <div className='rounded-full bg-destructive/10 p-4'>
          <FileEdit className='h-8 w-8 text-destructive' />
        </div>
        <p className='text-lg font-semibold'>Course not found</p>
        <Button
          variant='outline'
          onClick={() => navigate(-1)}
          className='gap-2'>
          <ArrowLeft className='h-4 w-4' /> Go Back
        </Button>
      </div>
    );

  const isPublished = course.isPublished ?? false;
  const enrollments = course._count?.enrollments ?? 0;
  const sectionsCount = course._count?.sections ?? 0;

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 flex-wrap'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1 className='text-xl font-bold'>{course.title}</h1>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs font-semibold',
                  isPublished
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
                )}>
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground font-mono mt-0.5'>
              /courses/{course.slug}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5'
            onClick={() => navigate(`/courses/${course.slug ?? id}/edit`)}>
            <Pencil className='h-3.5 w-3.5' /> Edit Metadata
          </Button>
          {isPublished ? (
            <Button
              size='sm'
              variant='outline'
              className='gap-1.5 text-zinc-400 border-zinc-500/40'
              disabled={isToggling}
              onClick={() => togglePublish('unpublish')}>
              {isToggling ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <FileEdit className='h-3.5 w-3.5' />
              )}
              Unpublish
            </Button>
          ) : (
            <Button
              size='sm'
              className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white'
              disabled={isToggling}
              onClick={() => togglePublish('publish')}>
              {isToggling ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <Globe className='h-3.5 w-3.5' />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {[
          { label: 'Enrollments', value: enrollments, icon: Users },
          { label: 'Sections', value: sectionsCount, icon: Layers },
          { label: 'Level', value: course.level ?? '—', icon: BookOpen },
          { label: 'Access', value: course.access ?? '—', icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className='rounded-lg border bg-card px-4 py-3 flex items-center gap-3'>
            <div className='rounded-md bg-primary/10 p-2'>
              <Icon className='h-4 w-4 text-primary' />
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>{label}</p>
              <p className='text-sm font-semibold'>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='flex gap-1 border-b border-border/50 overflow-x-auto'>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}>
            <Icon className='h-3.5 w-3.5' />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <CourseMetadataForm course={course} />}
        {activeTab === 'curriculum' && <CourseSectionsEditor courseId={id!} />}
        {activeTab === 'labs' && <CourseLabsPanel courseId={id!} />}
        {activeTab === 'preview' && (
          <CoursePlatformPreviewTab course={course} />
        )}
      </div>
    </div>
  );
}
