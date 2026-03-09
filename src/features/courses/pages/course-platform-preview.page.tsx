// src/features/courses/pages/course-platform-preview.page.tsx
// شكل طبق الأصل course-detail-page.tsx من المنصة — بانر Admin فوق
// ⚠️ يستخدم admin endpoint فقط — لا يكلم public API عشان يشتغل مع unpublished courses
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { coursesService } from '@/core/api/services';
import {
  PlatformCurriculum,
  type PreviewSection,
} from '../components/platform-curriculum';
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
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; border: string; badge: string }> =
  {
    EMERALD: { bg: 'from-emerald-600/20 to-emerald-950/60', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
    BLUE:    { bg: 'from-blue-600/20 to-blue-950/60',       border: 'border-blue-500/30',    badge: 'bg-blue-500/20 text-blue-300' },
    VIOLET:  { bg: 'from-violet-600/20 to-violet-950/60',   border: 'border-violet-500/30',  badge: 'bg-violet-500/20 text-violet-300' },
    ORANGE:  { bg: 'from-orange-600/20 to-orange-950/60',   border: 'border-orange-500/30',  badge: 'bg-orange-500/20 text-orange-300' },
    ROSE:    { bg: 'from-rose-600/20 to-rose-950/60',       border: 'border-rose-500/30',    badge: 'bg-rose-500/20 text-rose-300' },
    CYAN:    { bg: 'from-cyan-600/20 to-cyan-950/60',       border: 'border-cyan-500/30',    badge: 'bg-cyan-500/20 text-cyan-300' },
  };

const ACCESS = {
  FREE:    { label: 'Free',    icon: Globe },
  PRO:     { label: 'Pro',     icon: Zap },
  PREMIUM: { label: 'Premium', icon: Star },
} as Record<string, { label: string; icon: React.ElementType }>;

const DIFF: Record<string, string> = {
  BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PreviewSkeleton() {
  return (
    <div className='mx-auto max-w-4xl space-y-5 px-4 py-8'>
      <Skeleton className='h-64 rounded-2xl' />
      <Skeleton className='h-8 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <Skeleton className='h-20 rounded-xl' />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className='flex gap-4'>
          <Skeleton className='h-[50px] w-[50px] shrink-0 rounded-full' />
          <Skeleton className='h-16 flex-1 rounded-xl' />
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CoursePlatformPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  // ── Admin endpoint only ─────────────────────────────────────────────────────
  // لا نكلم public API — يشتغل مع published وunpublished على حد سواء
  const { data: course, isLoading } = useQuery({
    queryKey: ['admin-course-preview', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  const c = course as any;

  // ── Build PreviewSection[] ─────────────────────────────────────────────────
  // أولوية 1: c.topics  → فيها elements: CourseElement[] (لو الـ admin endpoint بيرجّعها)
  // أولوية 2: c.sections → فيها lessons[] (flat list)
  const sections: PreviewSection[] = (() => {
    // ── topics مع elements (rich content) ──
    const rawTopics: any[] = c?.topics ?? [];
    if (rawTopics.length > 0) {
      return rawTopics.map((t: any) => ({
        id: String(t.id),
        title:
          typeof t.title === 'string'
            ? t.title
            : (lang === 'ar' ? t.title?.ar ?? t.title?.en : t.title?.en) ?? '',
        ar_title:
          typeof t.title === 'string' ? null : (t.title?.ar ?? null),
        order: t.order,
        elements: t.elements ?? [],
      }));
    }

    // ── sections مع lessons (flat) ──
    return ((c?.sections ?? []) as any[]).map((s) => ({
      id: String(s.id),
      title: s.title,
      ar_title: s.ar_title ?? null,
      order: s.order,
      lessons: ((s.lessons ?? []) as any[]).map((l) => ({
        id: l.id,
        title: l.title,
        ar_title: l.ar_title ?? null,
        type: l.type,
        duration: l.duration ?? null,
        order: l.order,
        isPublished: l.isPublished,
      })),
    }));
  })();

  const colors = COLOR_MAP[c?.color?.toUpperCase() ?? 'BLUE'] ?? COLOR_MAP['BLUE'];
  const access = c?.access ?? 'FREE';
  const AccessIcon = ACCESS[access]?.icon ?? Globe;

  const totalItems = sections.reduce(
    (sum, s) => sum + (s.elements?.length ?? s.lessons?.length ?? 0),
    0,
  );

  const longDesc =
    lang === 'ar'
      ? (c?.ar_longDescription ?? c?.longDescription ?? '')
      : (c?.longDescription ?? '');

  return (
    <div className='min-h-screen bg-background'>
      {/* ── Admin Banner (sticky) ── */}
      <div className='sticky top-0 z-50 flex items-center justify-between border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 backdrop-blur-sm'>
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
        <PreviewSkeleton />
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
          {/* ════ HERO — نفس CourseDetailHero من المنصة ════ */}
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
                      alt={c.title ?? ''}
                      className='h-full w-full object-cover opacity-80'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <BookOpen className='h-16 w-16 opacity-20' />
                    </div>
                  )}
                  <div className='absolute right-3 top-3'>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', colors.badge)}>
                      {ACCESS[access]?.label ?? access}
                    </span>
                  </div>
                  <div className='absolute left-3 top-3 flex flex-col gap-1'>
                    {c.isNew && (
                      <span className='rounded-full bg-yellow-500/80 px-2 py-0.5 text-xs font-bold text-black'>
                        NEW
                      </span>
                    )}
                    {c.isFeatured && (
                      <span className='rounded-full bg-purple-500/80 px-2 py-0.5 text-xs font-bold text-white'>
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className='flex-1 space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    {c.category && (
                      <Badge variant='outline' className='text-xs'>{c.category}</Badge>
                    )}
                    {c.difficulty && (
                      <Badge variant='secondary' className='text-xs'>
                        {DIFF[c.difficulty] ?? c.difficulty}
                      </Badge>
                    )}
                    {c.contentType && (
                      <Badge variant='outline' className='text-xs'>{c.contentType}</Badge>
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

                  {/* Stats — نفس course-detail-page */}
                  <div className='flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground'>
                    {(c.estimatedHours ?? 0) > 0 && (
                      <span className='flex items-center gap-1.5'>
                        <Clock className='h-4 w-4' />{c.estimatedHours}h
                      </span>
                    )}
                    <span className='flex items-center gap-1.5'>
                      <Layers className='h-4 w-4' />{sections.length} sections
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <BookOpen className='h-4 w-4' />{totalItems} lessons
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <BarChart2 className='h-4 w-4' />
                      {DIFF[c.difficulty] ?? c.difficulty}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <AccessIcon className='h-4 w-4' />
                      {ACCESS[access]?.label ?? access}
                    </span>
                    {(c._count?.enrollments ?? 0) > 0 && (
                      <span className='flex items-center gap-1.5'>
                        <Users className='h-4 w-4' />{c._count.enrollments} enrolled
                      </span>
                    )}
                    {c.averageRating != null && (
                      <span className='flex items-center gap-1.5'>
                        ⭐ {Number(c.averageRating).toFixed(1)}
                        {c.reviewCount != null && (
                          <span className='text-muted-foreground/60'>
                            &nbsp;({c.reviewCount})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Instructor */}
                  {c.instructor && (
                    <div className='flex items-center gap-2 pt-1'>
                      {c.instructor.avatarUrl ? (
                        <img src={c.instructor.avatarUrl} alt='' className='h-7 w-7 rounded-full object-cover' />
                      ) : (
                        <div className='flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold'>
                          {c.instructor.name?.[0] ?? '?'}
                        </div>
                      )}
                      <span className='text-sm text-muted-foreground'>{c.instructor.name}</span>
                    </div>
                  )}

                  {/* Enroll button (disabled) */}
                  <div className='flex items-center gap-3 pt-2'>
                    <Button size='lg' disabled className='cursor-not-allowed gap-2 rounded-xl opacity-60'>
                      <Lock className='h-4 w-4' />Enroll Now
                    </Button>
                    <GraduationCap className='h-4 w-4 text-muted-foreground' />
                    <span className='text-xs italic text-muted-foreground'>
                      Preview only — enrollment disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════ CONTENT ════ */}
          <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* longDescription */}
            {longDesc && (
              <div className='rounded-xl border border-border/40 bg-muted/20 p-5'>
                <p
                  className='text-sm leading-7 text-foreground/70'
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {longDesc}
                </p>
              </div>
            )}

            {/* Curriculum — PlatformCurriculum مع CourseElementRenderer لو في elements */}
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
