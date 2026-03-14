// src/features/courses/components/edit-tabs/course-preview-tab.tsx
// Full platform preview: hero + curriculum + labs.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Clock, Users, Crown, Unlock, Shield,
  FlaskConical, Heart, Rocket, ChevronDown,
  Star, Gem, CheckCircle2,
} from 'lucide-react';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn }       from '@/lib/utils';
import { MatrixRain } from '@/shared/components/common/matrix-rain';
// ✅ Unified imports — from feature barrels
import { MATRIX_COLOR, STRIPE, BLOOM, TEXT_COLOR, FALLBACK_BG, ACCESS_BADGE } from '../../constants/course-colors';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { AdminCourse, CurriculumTopic } from '../../types';
import { Stat } from '../shared/Stat';
import CourseElementRenderer from '../CourseElementRenderer';

const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock, PRO: Crown, PREMIUM: Gem,
};

// ─ helpers ──────────────────────────────────────────────────────────────────────────
function normalizeTitleField(raw: unknown): { en: string; ar: string } {
  if (!raw) return { en: '', ar: '' };
  if (typeof raw === 'string') return { en: raw, ar: '' };
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>;
    if (typeof r['en'] === 'string' || typeof r['ar'] === 'string')
      return { en: String(r['en'] ?? ''), ar: String(r['ar'] ?? '') };
    if (r['title']) return normalizeTitleField(r['title']);
  }
  return { en: '', ar: '' };
}

function normalizeTopic(raw: unknown, idx: number): CurriculumTopic {
  const t = (raw ?? {}) as Record<string, unknown>;
  return {
    id:       String(t['id'] ?? `topic-${idx}`),
    title:    normalizeTitleField(t['title']),
    elements: Array.isArray(t['elements']) ? t['elements'] : [],
  };
}

// ─ Curriculum Skeleton ────────────────────────────────────────────────────────────────
function CurriculumSkeleton() {
  return (
    <div className='space-y-3'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='flex gap-4'>
          <Skeleton className='h-[50px] w-[50px] rounded-full shrink-0' />
          <Skeleton className='flex-1 h-16 rounded-xl' />
        </div>
      ))}
    </div>
  );
}

// ─ Topic Row ───────────────────────────────────────────────────────────────────────────
function TopicRow({
  topic, idx, total, isOpen, onToggle, lang,
}: {
  topic: CurriculumTopic; idx: number; total: number;
  isOpen: boolean; onToggle: () => void; lang: 'en' | 'ar';
}) {
  const num    = String(idx + 1).padStart(2, '0');
  const isLast = idx === total - 1;
  const title  = lang === 'ar'
    ? topic.title.ar || topic.title.en || 'Untitled Topic'
    : topic.title.en || topic.title.ar || 'Untitled Topic';

  return (
    <li id={`topic-row-${idx}`} className='relative flex gap-4'>
      <div className='relative flex shrink-0 flex-col items-center'>
        <div className={cn(
          'relative z-10 flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
          isOpen
            ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20'
            : 'border-border/60 bg-muted/50 text-muted-foreground',
        )}>
          <span className='font-black'>{num}</span>
        </div>
        {!isLast && <div className='mt-1 min-h-[16px] w-px flex-1 bg-border/30' />}
      </div>

      <div className={cn(
        'mb-2 min-w-0 flex-1 rounded-xl border bg-card transition-all duration-300',
        isOpen ? 'border-primary/30 shadow-sm' : 'cursor-pointer border-border/50 hover:border-border',
      )}>
        <button type='button' onClick={onToggle} className='flex w-full items-center gap-3 px-4 py-3.5 text-start'>
          <span className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
            isOpen ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground',
          )}>
            <BookOpen className='h-4 w-4' />
          </span>
          <div className='min-w-0 flex-1'>
            <span className={cn(
              'inline-flex rounded-full border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide mb-0.5',
              isOpen ? 'border-primary/25 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground',
            )}>TOPIC {num}</span>
            <p className='text-sm font-semibold leading-snug text-foreground'>{title}</p>
          </div>
          <div className='flex shrink-0 items-center gap-1.5'>
            <Badge variant='outline' className='text-xs'>{topic.elements.length} el</Badge>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200 ms-1',
              isOpen && 'rotate-180',
            )} />
          </div>
        </button>
        {isOpen && (
          <div className='border-t border-border/40 px-5 pb-5 pt-4 space-y-4'>
            {topic.elements.length === 0
              ? <p className='text-sm italic text-muted-foreground'>No content yet.</p>
              : <CourseElementRenderer elements={topic.elements} lang={lang} />}
          </div>
        )}
      </div>
    </li>
  );
}

// ═══ CoursePlatformPreviewTab ════════════════════════════════════════════════════════════════
export function CoursePlatformPreviewTab({ course }: { course: AdminCourse }) {
  const { i18n } = useTranslation();
  const lang  = i18n.language === 'ar' ? 'ar' : 'en';
  const isAr  = lang === 'ar';
  const [openId, setOpenId] = useState<string | null>(null);

  const col        = (course.color ?? 'blue').toLowerCase();
  const matrixHex  = MATRIX_COLOR[col] ?? '#3b82f6';
  const textCls    = TEXT_COLOR[col]   ?? 'text-blue-400';
  const imgSrc     = course.image ?? course.thumbnail;
  const comingSoon = course.state === 'COMING_SOON';
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;
  const title      = isAr ? course.ar_title || course.title : course.title;
  const desc       = isAr ? course.ar_description || course.description : course.description;
  const avgRating  = (course as any).averageRating ?? 0;
  const reviewCount = (course as any).reviewCount ?? 0;

  const { data: curriculumData, isLoading: currLoading } = useQuery({
    queryKey:  ['admin', 'curriculum-preview', course.id],
    queryFn:   () => adminCoursesApi.getCurriculum(course.slug),
    staleTime: 1000 * 60 * 5,
  });

  const { data: labsList } = useQuery<any[]>({
    queryKey: ['admin', 'course-labs-list', course.id],
    queryFn: async () => {
      try {
        const { adminApiClient } = await import('@/core/api/admin-client');
        const res = await adminApiClient.get(`/admin/courses/${course.id}/labs`);
        const d = res?.data ?? res;
        return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
      } catch { return []; }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!course.id,
  });

  const labsCount = labsList?.length ?? 0;
  const topics: CurriculumTopic[] = ((curriculumData as any)?.topics ?? [])
    .map((t: unknown, i: number) => normalizeTopic(t, i));

  return (
    <div className='w-full space-y-0 rounded-2xl overflow-hidden border border-border/50 bg-background' dir={isAr ? 'rtl' : 'ltr'}>

      {/* ━━━ HERO ━━━ */}
      <section className='relative overflow-hidden border-b border-white/8 bg-zinc-950'>
        <div className={cn('absolute inset-x-0 top-0 z-[3] h-[3px]', STRIPE[col] ?? 'bg-blue-500')} />
        <MatrixRain color={matrixHex} opacity={0.07} speed={6} />
        <div aria-hidden className={cn(
          'pointer-events-none absolute -start-20 -top-10 z-[2] h-56 w-56 rounded-full blur-3xl opacity-[0.12]',
          BLOOM[col] ?? 'bg-blue-500',
        )} />

        <div className='container relative z-[4] mx-auto px-4'>
          <div className='py-6'>
            <nav className='mb-4 flex items-center gap-1 text-[11px] text-white/35'>
              <span>{isAr ? 'الكورسات' : 'Courses'}</span>
              <span className='mx-1 text-white/20'>/</span>
              <span className='truncate text-white/65'>{title}</span>
            </nav>

            <div className='flex items-start gap-4'>
              {/* Thumbnail */}
              <div className='hidden sm:block shrink-0'>
                <div className='h-14 w-14 overflow-hidden rounded-2xl ring-1 ring-white/10'>
                  {imgSrc ? (
                    <img src={imgSrc} alt={title ?? ''} className='h-full w-full object-cover' />
                  ) : (
                    <div className={cn(
                      'h-full w-full flex items-center justify-center bg-gradient-to-br border border-white/10',
                      FALLBACK_BG[col] ?? 'from-zinc-900 to-zinc-800',
                    )}>
                      <p className={cn('text-[9px] font-black text-center px-1.5 leading-tight', textCls)}>
                        {title?.slice(0, 12)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='flex flex-wrap items-center gap-1.5'>
                  <Badge variant='outline' className={cn('rounded-full text-[11px] font-bold gap-1', ACCESS_BADGE[course.access ?? 'FREE'] ?? ACCESS_BADGE.FREE)}>
                    <AccessIcon className='h-2.5 w-2.5' /> {course.access ?? 'FREE'}
                  </Badge>
                  {course.difficulty && (
                    <Badge variant='outline' className='rounded-full border-white/20 text-[11px] text-white/65 gap-1'>
                      <Shield className='h-2.5 w-2.5' />
                      {isAr ? (course as any).ar_difficulty || course.difficulty : course.difficulty}
                    </Badge>
                  )}
                  {course.category && (
                    <Badge variant='outline' className='rounded-full border-white/15 text-[11px] text-white/50'>
                      {isAr
                        ? (course as any).ar_category || course.category
                        : course.category.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {course.isNew && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                      {isAr ? 'جديد' : 'New'}
                    </span>
                  )}
                  {comingSoon && (
                    <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-600/80 px-2 py-0.5 text-[10px] font-bold text-white'>
                      <Clock className='h-2.5 w-2.5' /> {isAr ? 'قريباً' : 'Coming Soon'}
                    </span>
                  )}
                </div>
                <h1 className='text-xl font-black leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl'>
                  {title || <span className='opacity-30 italic'>{isAr ? 'عنوان الكورس' : 'Course Title'}</span>}
                </h1>
                {desc && <p className='mt-2 max-w-2xl text-sm leading-relaxed text-white/60'>{desc}</p>}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 py-3'>
            <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5'>
              {(course.totalTopics ?? 0) > 0 && (
                <Stat icon={<BookOpen className='h-3.5 w-3.5' />} value={course.totalTopics} label={isAr ? 'موضوع' : 'Topics'} textClass={textCls} />
              )}
              {(course.estimatedHours ?? 0) > 0 && (
                <Stat icon={<Clock className='h-3.5 w-3.5' />} value={`${course.estimatedHours}h`} label='est.' textClass={textCls} />
              )}
              <div className='flex items-center gap-1.5 text-xs'>
                <span className={textCls}><FlaskConical className='h-3.5 w-3.5' /></span>
                <span className='font-bold text-white'>{labsCount > 0 ? labsCount : 'Labs'}</span>
                {labsCount > 0 && <span className='text-white/45'>{isAr ? 'مختبر' : 'Labs'}</span>}
              </div>
              {(course.enrollmentCount ?? 0) > 0 && (
                <Stat icon={<Users className='h-3.5 w-3.5' />} value={(course.enrollmentCount ?? 0).toLocaleString()} label={isAr ? 'مسجل' : 'enrolled'} textClass={textCls} />
              )}
              {avgRating > 0 && (
                <div className='flex items-center gap-1.5 text-xs'>
                  <Star className='h-3.5 w-3.5 fill-yellow-500 text-yellow-500' />
                  <span className='font-bold text-white'>{avgRating}</span>
                  {reviewCount > 0 && <span className='text-white/45'>({reviewCount})</span>}
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <button className='flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/50 cursor-default'>
                <Heart className='h-3.5 w-3.5' /> {isAr ? 'حفظ' : 'Save'}
              </button>
              <button className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white cursor-default',
                comingSoon ? 'border border-white/15 bg-white/5 text-white/50' : 'bg-primary',
              )}>
                {comingSoon
                  ? <><Clock className='h-3.5 w-3.5' /> {isAr ? 'قريباً' : 'Coming Soon'}</>
                  : <><Rocket className='h-3.5 w-3.5' /> {isAr ? 'ابدأ مجاناً' : 'Start Free'}</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Long description ━━━ */}
      {(isAr ? course.ar_longDescription : course.longDescription) && (
        <div className='px-6 pt-8'>
          <div className='mb-8 p-5 rounded-xl border border-border/40 bg-muted/20'>
            <p className='text-sm text-foreground/70 leading-7'>
              {isAr ? course.ar_longDescription : course.longDescription}
            </p>
          </div>
        </div>
      )}

      {/* ━━━ CURRICULUM ━━━ */}
      <div id='course-curriculum' className='px-6 pb-10 pt-6 space-y-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-xl font-bold tracking-tight sm:text-2xl'>
              {isAr ? 'المنهج الدراسي' : 'Course Curriculum'}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {topics.length} {isAr ? 'موضوع · اتبع الترتيب لأفضل نتيجة' : 'Topics · Follow the order for best results'}
            </p>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            <span>{isAr ? 'تقدمك' : 'Your progress'} (0/{topics.length})</span>
            <div className='w-32 h-1.5 rounded-full bg-muted overflow-hidden'>
              <div className='h-full rounded-full bg-primary' style={{ width: '0%' }} />
            </div>
            <span className='font-semibold'>0%</span>
            <span className='text-muted-foreground/60'>est. {course.estimatedHours ?? 0}h</span>
          </div>
        </div>

        {currLoading ? (
          <CurriculumSkeleton />
        ) : topics.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-16 text-center border border-dashed rounded-xl text-muted-foreground'>
            <BookOpen className='h-8 w-8 opacity-30' />
            <p className='text-sm'>{isAr ? 'لا يوجد محتوى بعد.' : 'No topics yet.'}</p>
          </div>
        ) : (
          <div className='relative'>
            <div aria-hidden className='absolute top-5 bottom-5 start-[25px] w-px bg-border/40' />
            <ol className='space-y-2'>
              {topics.map((topic, idx) => (
                <TopicRow
                  key={topic.id} topic={topic} idx={idx} total={topics.length}
                  isOpen={openId === topic.id}
                  onToggle={() => setOpenId((p) => (p === topic.id ? null : topic.id))}
                  lang={lang}
                />
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* ━━━ LABS ━━━ */}
      <div id='course-labs-section' className='px-6 pb-8'>
        {labsCount > 0 ? (
          <div className='rounded-xl border border-border/40 bg-muted/10 p-5'>
            <div className='flex items-center gap-2 mb-4'>
              <FlaskConical className={cn('h-5 w-5', textCls)} />
              <h3 className='font-semibold text-base'>{isAr ? 'المختبرات المضمنة' : 'Labs Included'}</h3>
              <Badge variant='outline' className='text-xs'>{labsCount}</Badge>
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              {labsList?.map((lab: any, i: number) => (
                <div key={lab.id ?? i} className='flex items-center gap-2 rounded-lg border border-border/40 bg-card px-3 py-2'>
                  <FlaskConical className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                  <span className='text-sm text-foreground/80 truncate'>{lab.title ?? lab.name ?? `Lab ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground/50 border border-dashed rounded-xl'>
            <FlaskConical className='h-4 w-4' />
            <span className='text-sm'>{isAr ? 'لا يوجد مختبرات' : 'No Labs Available'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
