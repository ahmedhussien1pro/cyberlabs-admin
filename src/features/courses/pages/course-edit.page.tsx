// src/features/courses/pages/course-edit.page.tsx
// Full edit page: 3 tabs — Card Info | Hero Info | Curriculum Editor
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, LayoutDashboard, Image as ImageIcon,
  BookOpen, Loader2, Globe, EyeOff, Copy, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CourseCardInfoTab } from '../components/edit-tabs/course-card-info-tab';
import { CourseHeroInfoTab } from '../components/edit-tabs/course-hero-info-tab';
import { CurriculumPlatformEditor } from '../components/curriculum-platform-editor';

type EditTab = 'card' | 'hero' | 'curriculum';

const TABS: { key: EditTab; label: string; icon: React.ElementType }[] = [
  { key: 'card',       label: 'Card Info',         icon: LayoutDashboard },
  { key: 'hero',       label: 'Hero Info',          icon: ImageIcon       },
  { key: 'curriculum', label: 'Curriculum Editor',  icon: BookOpen        },
];

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EditTab>('card');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'courses', 'detail', id],
    queryFn: () => adminCoursesApi.getById(id!),
    enabled: !!id,
  });

  const course = (data as any)?.data ?? data;

  const { mutate: togglePublish, isPending: isToggling } = useMutation({
    mutationFn: (action: 'publish' | 'unpublish') =>
      action === 'publish' ? adminCoursesApi.publish(id!) : adminCoursesApi.unpublish(id!),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(updated.isPublished ? 'Course published ✅' : 'Course unpublished');
    },
    onError: () => toast.error('Failed to update publish state'),
  });

  const { mutate: duplicate, isPending: isDuplicating } = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(id!),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course duplicated — opening new course');
      navigate(`/courses/${newCourse.id}`);
    },
    onError: () => toast.error('Failed to duplicate course'),
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: () => adminCoursesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course deleted');
      navigate('/courses');
    },
    onError: () => toast.error('Failed to delete course'),
  });

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 p-12 text-center'>
        <p className='text-lg font-semibold'>Course not found</p>
        <Button variant='outline' onClick={() => navigate('/courses')} className='gap-2'>
          <ArrowLeft className='h-4 w-4' /> Back to Courses
        </Button>
      </div>
    );
  }

  const isPublished = course.isPublished ?? false;

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Header ── */}
      <div className='flex items-start justify-between gap-4 flex-wrap'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/courses')}>
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

        {/* Action buttons */}
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Preview */}
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 h-9'
            onClick={() => {
              const base = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:5173';
              window.open(`${base}/courses/${course.slug}`, '_blank');
            }}>
            <Globe className='h-3.5 w-3.5' /> Preview
          </Button>

          {/* Duplicate */}
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 h-9'
            disabled={isDuplicating}
            onClick={() => duplicate()}>
            {isDuplicating ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Copy className='h-3.5 w-3.5' />}
            Duplicate
          </Button>

          {/* Publish toggle */}
          {isPublished ? (
            <Button
              size='sm'
              variant='outline'
              className='gap-1.5 h-9 text-zinc-400 border-zinc-500/40'
              disabled={isToggling}
              onClick={() => togglePublish('unpublish')}>
              {isToggling ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <EyeOff className='h-3.5 w-3.5' />}
              Unpublish
            </Button>
          ) : (
            <Button
              size='sm'
              className='gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white'
              disabled={isToggling}
              onClick={() => togglePublish('publish')}>
              {isToggling ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Globe className='h-3.5 w-3.5' />}
              Publish
            </Button>
          )}

          {/* Delete */}
          <Button
            size='sm'
            variant='destructive'
            className='gap-1.5 h-9'
            disabled={isDeleting}
            onClick={() => {
              if (confirm(`Delete "${course.title}"? This cannot be undone.`)) {
                deleteCourse();
              }
            }}>
            {isDeleting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
            Delete
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
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

      {/* ── Tab Content ── */}
      <div>
        {activeTab === 'card'       && <CourseCardInfoTab course={course} />}
        {activeTab === 'hero'       && <CourseHeroInfoTab course={course} />}
        {activeTab === 'curriculum' && (
          <CurriculumPlatformEditor courseId={course.id} courseSlug={course.slug} />
        )}
      </div>
    </div>
  );
}
