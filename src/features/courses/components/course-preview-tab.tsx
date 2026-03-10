// src/features/courses/components/course-preview-tab.tsx
// ✅ Admin Preview — platform-accurate (Hero + Card + Curriculum)
import type { AdminCourse } from '../types/admin-course.types';
import { useQuery } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { PlatformCurriculum } from './platform-curriculum';
import { PlatformCourseCard } from './platform-course-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye, Clock, Users, BookOpen, FlaskConical,
  GraduationCap, Tag, Star, Zap, Crown, Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreviewSection } from './platform-curriculum';

const COLOR_GRADIENTS: Record<string, string> = {
  emerald: 'from-emerald-900/40 to-emerald-900/10 border-emerald-500/20',
  blue:    'from-blue-900/40    to-blue-900/10    border-blue-500/20',
  violet:  'from-violet-900/40  to-violet-900/10  border-violet-500/20',
  orange:  'from-orange-900/40  to-orange-900/10  border-orange-500/20',
  rose:    'from-rose-900/40    to-rose-900/10    border-rose-500/20',
  cyan:    'from-cyan-900/40    to-cyan-900/10    border-cyan-500/20',
};

const COLOR_ACCENT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue:    'text-blue-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  cyan:    'text-cyan-400',
};

interface Props {
  course: AdminCourse;
}

export function CoursePlatformPreviewTab({ course }: Props) {
  const { data: curriculumData, isLoading } = useQuery({
    queryKey: ['admin', 'curriculum', course.slug],
    queryFn: () => adminCoursesApi.getCurriculum(course.slug),
  });

  const gradient = COLOR_GRADIENTS[course.color?.toLowerCase()] ?? COLOR_GRADIENTS.blue;
  const accent   = COLOR_ACCENT[course.color?.toLowerCase()]    ?? COLOR_ACCENT.blue;

  // Map curriculum topics → PreviewSection[]
  const sections: PreviewSection[] = (curriculumData?.topics ?? []).map((t: any) => ({
    id:       t.id    ?? String(Math.random()),
    title:    t.title ?? (typeof t.title === 'object' ? (t.title as any).en : t.title),
    ar_title: t.ar_title ?? (typeof t.title === 'object' ? (t.title as any).ar : undefined),
    description: t.description ?? null,
    order:    t.order,
    lessons:  Array.isArray(t.lessons)  ? t.lessons  : undefined,
    elements: Array.isArray(t.elements) ? t.elements : undefined,
  }));

  const accessIcon =
    course.access === 'FREE'    ? <Unlock  className='h-3 w-3' /> :
    course.access === 'PRO'     ? <Zap     className='h-3 w-3' /> :
                                  <Crown   className='h-3 w-3' />;

  return (
    <div className='space-y-8'>
      {/* ── Admin Banner ── */}
      <div className='flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2'>
        <Eye className='h-4 w-4 text-yellow-400 shrink-0' />
        <p className='text-xs text-yellow-300'>
          Admin Preview — shows how this course appears on the platform. Unsaved edits are not reflected until saved.
        </p>
        <Badge variant='outline' className='ml-auto shrink-0 border-yellow-500/40 text-yellow-400 text-xs'>
          {course.state}
        </Badge>
      </div>

      {/* ── Hero Section (Platform Accurate) ── */}
      <div className={cn('rounded-2xl border bg-gradient-to-br p-6 md:p-8 space-y-5', gradient)}>
        <div className='flex flex-col md:flex-row items-start gap-5'>
          {/* Thumbnail */}
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className='h-28 w-40 rounded-xl object-cover shrink-0 shadow-lg'
            />
          ) : (
            <div className={cn('flex h-28 w-40 shrink-0 items-center justify-center rounded-xl bg-muted/40 border border-border/30')}>
              <BookOpen className={cn('h-10 w-10', accent)} />
            </div>
          )}

          <div className='space-y-3 min-w-0 flex-1'>
            {/* Badges row */}
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className='gap-1 text-xs'>{accessIcon} {course.access}</Badge>
              <Badge variant='outline' className='text-xs'>{course.difficulty}</Badge>
              <Badge variant='outline' className='text-xs'>{course.category?.replace(/_/g, ' ')}</Badge>
              {course.contentType && (
                <Badge variant='outline' className='text-xs'>{course.contentType}</Badge>
              )}
              {course.isNew && (
                <Badge className='bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs'>🆕 NEW</Badge>
              )}
              {course.isFeatured && (
                <Badge className='bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs'>
                  <Star className='h-3 w-3 mr-1' />FEATURED
                </Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className='text-2xl font-bold leading-tight'>{course.title}</h1>
              {course.ar_title && (
                <p className='text-base text-muted-foreground mt-1' dir='rtl'>{course.ar_title}</p>
              )}
            </div>

            {/* Description */}
            {course.description && (
              <p className='text-sm text-muted-foreground leading-relaxed max-w-2xl'>
                {course.description}
              </p>
            )}

            {/* Stats row */}
            <div className='flex flex-wrap gap-4 text-xs text-muted-foreground pt-1'>
              {course.estimatedHours != null && (
                <span className='flex items-center gap-1'>
                  <Clock className='h-3.5 w-3.5' />
                  {course.estimatedHours}h
                </span>
              )}
              <span className='flex items-center gap-1'>
                <Users className='h-3.5 w-3.5' />
                {course.enrollmentCount ?? 0} enrolled
              </span>
              <span className='flex items-center gap-1'>
                <BookOpen className='h-3.5 w-3.5' />
                {curriculumData?.totalTopics ?? course.totalTopics ?? 0} topics
              </span>
              {(course.labSlugs?.length ?? 0) > 0 && (
                <span className='flex items-center gap-1'>
                  <FlaskConical className='h-3.5 w-3.5' />
                  {course.labSlugs?.length} labs
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {(course.tags?.length ?? 0) > 0 && (
          <div className='flex flex-wrap gap-1.5 pt-1 border-t border-border/20'>
            <Tag className='h-3.5 w-3.5 text-muted-foreground/60 mt-0.5' />
            {course.tags.map((tag) => (
              <Badge key={tag} variant='outline' className='text-[10px] opacity-70'>{tag}</Badge>
            ))}
          </div>
        )}

        {/* Skills */}
        {(course.skills?.length ?? 0) > 0 && (
          <div className='space-y-1.5 pt-1 border-t border-border/20'>
            <p className='text-xs font-semibold text-muted-foreground flex items-center gap-1'>
              <GraduationCap className='h-3.5 w-3.5' /> Skills you'll gain
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {course.skills.map((skill) => (
                <Badge key={skill} variant='secondary' className='text-xs'>{skill}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Card Preview ── */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
          Card Preview (as seen in course listing)
        </h3>
        <div className='max-w-xs'>
          <PlatformCourseCard course={course as any} />
        </div>
      </div>

      {/* ── Curriculum Preview ── */}
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
        ) : sections.length > 0 ? (
          <PlatformCurriculum
            sections={sections}
            estimatedHours={course.estimatedHours ?? null}
          />
        ) : (
          <div className='rounded-xl border border-border/40 bg-muted/20 p-6 text-center'>
            <BookOpen className='h-8 w-8 text-muted-foreground/40 mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>No curriculum data yet.</p>
            <p className='text-xs text-muted-foreground/60 mt-1'>Add topics in the Curriculum tab to see them here.</p>
          </div>
        )}
      </div>

      {/* ── Labs Preview ── */}
      {(course.labSlugs?.length ?? 0) > 0 && (
        <div>
          <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
            Labs in this Course
          </h3>
          <div className='grid gap-2 sm:grid-cols-2'>
            {course.labSlugs.map((slug) => (
              <div
                key={slug}
                className='flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3'
              >
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                  <FlaskConical className={cn('h-4 w-4', accent)} />
                </div>
                <div className='min-w-0'>
                  <p className='text-sm font-medium font-mono truncate'>{slug}</p>
                  <p className='text-xs text-muted-foreground'>Lab</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
