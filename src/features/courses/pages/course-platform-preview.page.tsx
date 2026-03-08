// src/features/courses/pages/course-platform-preview.page.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { PlatformCurriculum } from '../components/platform-curriculum';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Shield,
  Clock,
  Layers,
  BookOpen,
  BarChart2,
  Zap,
  Star,
  Users,
  AlertTriangle,
  Globe,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string }> =
  {
    EMERALD: {
      bg: 'from-emerald-600/20 to-emerald-950/60',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
    BLUE: {
      bg: 'from-blue-600/20 to-blue-950/60',
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/20 text-blue-300',
    },
    VIOLET: {
      bg: 'from-violet-600/20 to-violet-950/60',
      border: 'border-violet-500/30',
      badge: 'bg-violet-500/20 text-violet-300',
    },
    ORANGE: {
      bg: 'from-orange-600/20 to-orange-950/60',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/20 text-orange-300',
    },
    ROSE: {
      bg: 'from-rose-600/20 to-rose-950/60',
      border: 'border-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300',
    },
    CYAN: {
      bg: 'from-cyan-600/20 to-cyan-950/60',
      border: 'border-cyan-500/30',
      badge: 'bg-cyan-500/20 text-cyan-300',
    },
  };

const ACCESS = {
  FREE: { label: 'Free', icon: Globe },
  PRO: { label: 'Pro', icon: Zap },
  PREMIUM: { label: 'Premium', icon: Star },
} as Record<string, { label: string; icon: React.ElementType }>;

const DIFF: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function CoursePlatformPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  const c = course as any;
  const colors = COLOR_MAP[c?.color ?? 'BLUE'] ?? COLOR_MAP['BLUE'];
  const access = c?.access ?? 'FREE';
  const sections = c?.sections ?? [];
  const totalLessons = sections.reduce(
    (s: number, sec: any) => s + (sec.lessons ?? sec.elements ?? []).length,
    0,
  );

  return (
    <div className='min-h-screen bg-background'>
      {/* ── Admin Banner ── */}
      <div className='sticky top-0 z-50 flex items-center justify-between border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5'>
        <div className='flex items-center gap-2'>
          <Shield className='h-4 w-4 shrink-0 text-yellow-400' />
          <span className='text-xs font-bold text-yellow-300'>
            Admin Preview Mode
          </span>
          <span className='hidden text-xs text-yellow-400/70 sm:inline'>
            — This is how learners see the course on CyberLabs
          </span>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 text-xs text-yellow-300 hover:bg-yellow-500/20 hover:text-yellow-200'
          onClick={() => navigate(-1)}>
          <ArrowLeft className='h-3.5 w-3.5' />
          Back to Admin
        </Button>
      </div>

      {isLoading ? (
        <div className='mx-auto max-w-4xl space-y-5 px-4 py-8'>
          <Skeleton className='h-64 rounded-2xl' />
          <Skeleton className='h-8 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex gap-4'>
              <Skeleton className='h-[50px] w-[50px] shrink-0 rounded-full' />
              <Skeleton className='h-16 flex-1 rounded-xl' />
            </div>
          ))}
        </div>
      ) : !course ? (
        <div className='flex flex-col items-center justify-center gap-3 py-32'>
          <AlertTriangle className='h-8 w-8 text-muted-foreground' />
          <p className='text-muted-foreground'>Course not found</p>
          <Button variant='outline' size='sm' onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          {/* ── Hero ── */}
          <div
            className={cn(
              'relative w-full border-b bg-gradient-to-br',
              colors.bg,
              colors.border,
            )}>
            <div className='mx-auto max-w-4xl px-4 py-10'>
              <div className='flex flex-col gap-6 md:flex-row md:items-start md:gap-8'>
                {/* Thumbnail */}
                <div className='relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30 md:h-52 md:w-80'>
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt=''
                      className='h-full w-full object-cover opacity-80'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <BookOpen className='h-16 w-16 opacity-20' />
                    </div>
                  )}
                  <div className='absolute right-3 top-3'>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold',
                        colors.badge,
                      )}>
                      {ACCESS[access]?.label ?? access}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className='flex-1 space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    {c.isNew && (
                      <Badge className='border-yellow-500/30 bg-yellow-500/20 text-yellow-300 text-xs'>
                        NEW
                      </Badge>
                    )}
                    {c.isFeatured && (
                      <Badge className='border-purple-500/30 bg-purple-500/20 text-purple-300 text-xs'>
                        ⭐ Featured
                      </Badge>
                    )}
                    {c.category && (
                      <Badge variant='outline' className='text-xs'>
                        {c.category}
                      </Badge>
                    )}
                  </div>

                  <h1 className='text-2xl font-bold leading-tight md:text-3xl'>
                    {c.title ?? c.landingData?.title?.en}
                  </h1>

                  {(c.ar_title ?? c.landingData?.title?.ar) && (
                    <p className='text-base text-muted-foreground' dir='rtl'>
                      {c.ar_title ?? c.landingData?.title?.ar}
                    </p>
                  )}

                  {(c.description ?? c.landingData?.description?.en) && (
                    <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
                      {c.description ?? c.landingData?.description?.en}
                    </p>
                  )}

                  <div className='flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground'>
                    <span className='flex items-center gap-1.5'>
                      <Clock className='h-4 w-4' />
                      {c.estimatedHours ?? 0}h
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <Layers className='h-4 w-4' />
                      {sections.length} sections
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <BookOpen className='h-4 w-4' />
                      {totalLessons} lessons
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <BarChart2 className='h-4 w-4' />
                      {DIFF[c.difficulty] ?? c.difficulty}
                    </span>
                    {c._count?.enrollments != null && (
                      <span className='flex items-center gap-1.5'>
                        <Users className='h-4 w-4' />
                        {c._count.enrollments} enrolled
                      </span>
                    )}
                  </div>

                  <div className='flex items-center gap-3 pt-2'>
                    <Button
                      size='lg'
                      disabled
                      className='cursor-not-allowed gap-2 rounded-xl opacity-60'>
                      <Lock className='h-4 w-4' />
                      Enroll Now
                    </Button>
                    <span className='text-xs italic text-muted-foreground'>
                      (Preview only)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Curriculum ── */}
          <div className='mx-auto max-w-4xl px-4 py-10'>
            <PlatformCurriculum
              sections={sections}
              estimatedHours={c.estimatedHours}
            />
          </div>
        </>
      )}
    </div>
  );
}
