import { useRef } from 'react';
import type { AdminCourse } from '../types/admin-course.types';
import { useQuery } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { PlatformCurriculum } from './platform-curriculum';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  ExternalLink,
  Clock,
  Users,
  BookOpen,
  FlaskConical,
  Shield,
  Unlock,
  Crown,
  Zap,
  Star,
  Tag,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreviewSection } from './platform-curriculum';

// ── exact same color maps as frontend course-detail-hero ──────────────
const MATRIX_COLOR: Record<string, string> = {
  emerald: '#10b981',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  orange: '#f97316',
  cyan: '#06b6d4',
};
const STRIPE_CLASS: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
};
const BLOOM_CLASS: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
};
const TEXT_COLOR: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  rose: 'text-rose-400',
  orange: 'text-orange-400',
  cyan: 'text-cyan-400',
};
const FALLBACK_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900',
  blue: 'from-blue-950 to-blue-900',
  violet: 'from-violet-950 to-violet-900',
  orange: 'from-orange-950 to-orange-900',
  rose: 'from-rose-950 to-rose-900',
  cyan: 'from-cyan-950 to-cyan-900',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  PREMIUM: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
};

// ─── Inline MatrixRain (canvas-based) ────────────────────────────────
function MatrixRainCanvas({
  color = '#3b82f6',
  opacity = 0.07,
}: {
  color?: string;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Static SVG noise pattern as lightweight alternative
  return (
    <div
      className='pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.07]'
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          ${color}15 2px,
          ${color}15 4px
        )`,
      }}
    />
  );
}

// ─── Preview Hero (exact copy of frontend CourseDetailHero layout) ───
function PreviewHero({
  course,
  topicCount,
}: {
  course: AdminCourse;
  topicCount: number;
}) {
  const col = (course.color ?? 'blue').toLowerCase();
  const imgSrc = course.image ?? course.thumbnail;
  const stripeClass = STRIPE_CLASS[col] ?? 'bg-blue-500';
  const bloomClass = BLOOM_CLASS[col] ?? 'bg-blue-500';
  const textColor = TEXT_COLOR[col] ?? 'text-blue-400';
  const fallbackBg = FALLBACK_BG[col] ?? 'from-blue-950 to-blue-900';
  const accessBadge = ACCESS_BADGE[course.access] ?? ACCESS_BADGE.FREE;

  const comingSoon = course.state === 'COMING_SOON';
  const statusBadge = course.isNew
    ? { label: 'New', cls: 'bg-amber-500 text-white' }
    : comingSoon
      ? {
          label: 'Coming Soon',
          cls: 'bg-zinc-600/80 border border-white/10 text-white',
        }
      : null;

  return (
    <section className='relative overflow-hidden border-b border-white/8 bg-zinc-950'>
      {/* Top stripe */}
      <div
        className={cn('absolute inset-x-0 top-0 z-[3] h-[3px]', stripeClass)}
      />

      {/* Matrix pattern */}
      <MatrixRainCanvas color={MATRIX_COLOR[col]} opacity={0.07} />

      {/* Bloom */}
      <div
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute -start-20 -top-10 z-[1]',
          'h-56 w-56 rounded-full blur-3xl opacity-[0.12]',
          bloomClass,
        )}
      />

      <div className='container relative z-[2] mx-auto px-4'>
        <div className='py-6'>
          {/* Breadcrumb */}
          <nav className='mb-4 flex items-center gap-1 text-[11px] text-white/35'>
            <span className='transition-colors hover:text-white/70'>
              Courses
            </span>
            <ChevronRight className='h-3 w-3 shrink-0' />
            <span className='truncate text-white/65'>{course.title}</span>
          </nav>

          {/* Main row */}
          <div className='flex flex-col gap-5 min-w-0'>
            <div className='flex items-start gap-4'>
              {/* Icon/Thumbnail */}
              <div className='hidden sm:block shrink-0'>
                <div className='h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10'>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={course.title ?? ''}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div
                      className={cn(
                        'h-full w-full flex items-center justify-center bg-gradient-to-br border',
                        fallbackBg,
                        'border-white/10',
                      )}>
                      <p
                        className={cn(
                          'text-[10px] font-black text-center px-1.5 leading-tight',
                          textColor,
                        )}>
                        {course.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text block */}
              <div className='min-w-0 flex-1 space-y-2'>
                {/* Badges */}
                <div className='flex flex-wrap items-center gap-1.5'>
                  <Badge
                    variant='outline'
                    className={cn(
                      'rounded-full text-[11px] font-bold gap-1',
                      accessBadge,
                    )}>
                    {course.access === 'FREE' ? (
                      <Unlock className='h-2.5 w-2.5' />
                    ) : (
                      <Crown className='h-2.5 w-2.5' />
                    )}
                    {course.access}
                  </Badge>
                  <Badge
                    variant='outline'
                    className='rounded-full border-white/20 text-[11px] text-white/65 gap-1'>
                    <Shield className='h-2.5 w-2.5' /> {course.difficulty}
                  </Badge>
                  <Badge
                    variant='outline'
                    className='rounded-full border-white/15 text-[11px] text-white/50'>
                    {course.category?.replace(/_/g, ' ')}
                  </Badge>
                  {statusBadge && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        statusBadge.cls,
                      )}>
                      {statusBadge.label}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className='text-xl font-black leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl'>
                  {course.title}
                </h1>

                {/* AR Title */}
                {course.ar_title && (
                  <p className='text-base text-white/50' dir='rtl'>
                    {course.ar_title}
                  </p>
                )}

                {/* Description */}
                {course.description && (
                  <p className='mt-2 max-w-2xl text-sm leading-relaxed text-white/60'>
                    {course.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — stats + CTA */}
        <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 py-3'>
          {/* Stats */}
          <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5'>
            <div className='flex items-center gap-1.5 text-xs'>
              <span className={textColor}>
                <BookOpen className='h-3.5 w-3.5' />
              </span>
              <span className='font-bold text-white'>{topicCount}</span>
              <span className='text-white/45'>Topics</span>
            </div>
            {course.estimatedHours != null && (
              <div className='flex items-center gap-1.5 text-xs'>
                <span className={textColor}>
                  <Clock className='h-3.5 w-3.5' />
                </span>
                <span className='font-bold text-white'>
                  {course.estimatedHours}h
                </span>
                <span className='text-white/45'>est.</span>
              </div>
            )}
            {(course.enrollmentCount ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <span className={textColor}>
                  <Users className='h-3.5 w-3.5' />
                </span>
                <span className='font-bold text-white'>
                  {course.enrollmentCount?.toLocaleString()}
                </span>
                <span className='text-white/45'>enrolled</span>
              </div>
            )}
            {(course.labSlugs?.length ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <span className={textColor}>
                  <FlaskConical className='h-3.5 w-3.5' />
                </span>
                <span className='font-bold text-white'>
                  {course.labSlugs?.length}
                </span>
                <span className='text-white/45'>Labs</span>
              </div>
            )}
            {(course.averageRating ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <Star className='h-3.5 w-3.5 fill-yellow-500 text-yellow-500' />
                <span className='font-bold text-white'>
                  {course.averageRating}
                </span>
                <span className='text-white/45'>({course.reviewCount})</span>
              </div>
            )}
          </div>

          {/* Fake CTA */}
          <div className='flex items-center gap-2'>
            <button className='flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/50'>
              Save
            </button>
            {comingSoon ? (
              <div className='flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/50'>
                <Clock className='h-3.5 w-3.5' /> Coming Soon
              </div>
            ) : (
              <button className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground'>
                {course.access === 'FREE' ? (
                  <>
                    <Zap className='h-3.5 w-3.5' /> Start Free{' '}
                    <ChevronRight className='h-3.5 w-3.5' />
                  </>
                ) : (
                  <>
                    <Crown className='h-3.5 w-3.5' /> Upgrade to {course.access}{' '}
                    <ChevronRight className='h-3.5 w-3.5' />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Long Description section ─────────────────────────────────────────
function LongDescSection({ text }: { text: string }) {
  return (
    <div className='mb-8 p-5 rounded-xl border border-border/40 bg-muted/20'>
      <p className='text-sm text-foreground/70 leading-7'>{text}</p>
    </div>
  );
}

// ─── Skills & Tags section ────────────────────────────────────────────
function MetaSection({ course }: { course: AdminCourse }) {
  const hasSkills = (course.skills?.length ?? 0) > 0;
  const hasTags = (course.tags?.length ?? 0) > 0;
  if (!hasSkills && !hasTags) return null;
  return (
    <div className='space-y-4 mb-8'>
      {hasSkills && (
        <div className='space-y-2'>
          <p className='text-sm font-semibold flex items-center gap-2'>
            <GraduationCap className='h-4 w-4 text-muted-foreground' /> Skills
            you'll gain
          </p>
          <div className='flex flex-wrap gap-2'>
            {course.skills.map((s) => (
              <Badge key={s} variant='secondary' className='text-xs'>
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {hasTags && (
        <div className='flex flex-wrap items-center gap-2'>
          <Tag className='h-3.5 w-3.5 text-muted-foreground/60' />
          {course.tags.map((t) => (
            <Badge key={t} variant='outline' className='text-[10px] opacity-70'>
              {t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Labs section ────────────────────────────────────────────────────
function LabsSection({ course }: { course: AdminCourse }) {
  const col = (course.color ?? 'blue').toLowerCase();
  const accent = TEXT_COLOR[col] ?? 'text-blue-400';
  if ((course.labSlugs?.length ?? 0) === 0) return null;
  return (
    <div id='course-labs-section' className='mt-10'>
      <h2 className='text-xl font-bold mb-4'>Labs in this Course</h2>
      <div className='grid gap-3 sm:grid-cols-2'>
        {course.labSlugs.map((slug) => (
          <div
            key={slug}
            className='flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
              <FlaskConical className={cn('h-5 w-5', accent)} />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-medium font-mono truncate'>{slug}</p>
              <p className='text-xs text-muted-foreground'>Lab</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Open Preview Window ─────────────────────────────────────────────
function buildPreviewHTML(course: AdminCourse, curriculumData: any): string {
  // This renders as a full standalone HTML page injected into a new window
  const sections: PreviewSection[] = (curriculumData?.topics ?? []).map(
    (t: any) => ({
      id: t.id ?? String(Math.random()),
      title:
        typeof t.title === 'object' ? (t.title?.en ?? '') : (t.title ?? ''),
      ar_title: typeof t.title === 'object' ? t.title?.ar : t.ar_title,
      order: t.order,
      elements: Array.isArray(t.elements) ? t.elements : [],
    }),
  );

  return JSON.stringify({ course, sections });
}

// ─── Main Component ──────────────────────────────────────────────────
interface Props {
  course: AdminCourse;
}

export function CoursePlatformPreviewTab({ course }: Props) {
  const { data: curriculumData, isLoading } = useQuery({
    queryKey: ['admin', 'curriculum', course.slug],
    queryFn: () => adminCoursesApi.getCurriculum(course.slug),
  });

  // Map curriculum topics → PreviewSection[]
  const sections: PreviewSection[] = (curriculumData?.topics ?? []).map(
    (t: any) => ({
      id: t.id ?? String(Math.random()),
      title:
        typeof t.title === 'object' ? (t.title?.en ?? '') : (t.title ?? ''),
      ar_title: typeof t.title === 'object' ? t.title?.ar : t.ar_title,
      order: t.order,
      elements: Array.isArray(t.elements) ? t.elements : [],
    }),
  );

  const topicCount = sections.length;

  const handleOpenPreviewWindow = () => {
    const win = window.open(
      '',
      '_blank',
      'width=1280,height=900,scrollbars=yes,resizable=yes',
    );
    if (!win) return;

    const col = (course.color ?? 'blue').toLowerCase();
    const matrixColor = MATRIX_COLOR[col] ?? '#3b82f6';
    const stripeColor =
      {
        emerald: '#10b981',
        blue: '#3b82f6',
        violet: '#8b5cf6',
        rose: '#f43f5e',
        orange: '#f97316',
        cyan: '#06b6d4',
      }[col] ?? '#3b82f6';
    const imgSrc = course.image ?? course.thumbnail ?? '';
    const fallbackBg =
      {
        emerald: '#0a2e1e',
        blue: '#0a1628',
        violet: '#1a0a2e',
        orange: '#2e1a0a',
        rose: '#2e0a14',
        cyan: '#0a2228',
      }[col] ?? '#0a1628';
    const accentColor =
      {
        emerald: '#10b981',
        blue: '#3b82f6',
        violet: '#8b5cf6',
        rose: '#f43f5e',
        orange: '#f97316',
        cyan: '#06b6d4',
      }[col] ?? '#3b82f6';

    const sectionsHTML = sections
      .map((s, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const elCount = s.elements?.length ?? 0;
        return `
        <li style="position:relative;display:flex;gap:16px;margin-bottom:8px;">
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:50px;height:50px;border-radius:50%;border:2px solid ${accentColor}40;background:${accentColor}15;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:${accentColor};flex-shrink:0;">${num}</div>
            ${idx < sections.length - 1 ? `<div style="width:1px;flex:1;min-height:16px;background:${accentColor}20;margin-top:4px;"></div>` : ''}
          </div>
          <div style="flex:1;min-width:0;margin-bottom:8px;border-radius:12px;border:1px solid ${accentColor}30;background:#0d0d0d;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;">
              <div style="width:32px;height:32px;border-radius:8px;border:1px solid ${accentColor}30;background:${accentColor}10;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="margin-bottom:2px;"><span style="font-size:9px;font-weight:700;border:1px solid ${accentColor}25;background:${accentColor}10;color:${accentColor};border-radius:99px;padding:1px 6px;text-transform:uppercase;letter-spacing:0.05em;">TOPIC ${num}</span></div>
                <p style="font-size:14px;font-weight:600;color:#f4f4f5;margin:0;">${s.title}</p>
                ${s.ar_title ? `<p style="font-size:11px;color:#71717a;margin:2px 0 0;direction:rtl;">${s.ar_title}</p>` : ''}
              </div>
              <span style="font-size:11px;border:1px solid #3f3f46;border-radius:6px;padding:2px 8px;color:#71717a;flex-shrink:0;">${elCount} element${elCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </li>`;
      })
      .join('');

    const accessColor =
      { FREE: '#10b981', PRO: '#3b82f6', PREMIUM: '#8b5cf6' }[course.access] ??
      '#10b981';
    const accessIcon = course.access === 'FREE' ? '🔓' : '👑';

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview: ${course.title} — CyberLabs Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
    .badge { display: inline-flex; align-items: center; gap: 4px; border-radius: 99px; padding: 2px 8px; font-size: 11px; font-weight: 700; border: 1px solid; }
    .stat { display: flex; align-items: center; gap: 6px; font-size: 12px; }
    .stat-val { font-weight: 700; color: #f4f4f5; }
    .stat-lbl { color: rgba(255,255,255,0.45); }
    .btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 6px 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }
    ::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: #18181b; } ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
  </style>
</head>
<body>

<!-- ADMIN BANNER -->
<div style="background:rgba(245,158,11,0.1);border-bottom:1px solid rgba(245,158,11,0.3);padding:8px 16px;display:flex;align-items:center;gap:8px;font-size:12px;color:#fbbf24;position:sticky;top:0;z-index:100;backdrop-filter:blur(8px);">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  Admin Preview — exact platform view (read-only)
  <span style="margin-left:auto;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:6px;padding:1px 8px;font-size:11px;">${course.state}</span>
</div>

<!-- HERO -->
<section style="position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.08);background:#09090b;">
  <!-- Top stripe -->
  <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${stripeColor};"></div>
  <!-- Matrix lines -->
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,${matrixColor}15 2px,${matrixColor}15 4px);opacity:0.07;pointer-events:none;"></div>
  <!-- Bloom -->
  <div style="position:absolute;left:-80px;top:-40px;width:224px;height:224px;border-radius:50%;filter:blur(48px);background:${stripeColor};opacity:0.12;pointer-events:none;"></div>

  <div class="container" style="position:relative;z-index:2;">
    <div style="padding:24px 0 0;">
      <!-- Breadcrumb -->
      <nav style="margin-bottom:16px;display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,0.35);">
        <span>Courses</span>
        <span>›</span>
        <span style="color:rgba(255,255,255,0.65);">${course.title}</span>
      </nav>

      <!-- Icon + Text row -->
      <div style="display:flex;align-items:flex-start;gap:16px;">
        <!-- Thumbnail -->
        <div style="width:56px;height:56px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;">
          ${
            imgSrc
              ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="" />`
              : `<div style="width:100%;height:100%;background:linear-gradient(135deg,${fallbackBg},${fallbackBg}cc);display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;font-weight:900;color:${accentColor};text-align:center;padding:4px;">${course.title}</span></div>`
          }
        </div>
        <!-- Text -->
        <div style="flex:1;min-width:0;">
          <!-- Badges -->
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
            <span class="badge" style="border-color:${accessColor}40;color:${accessColor};background:${accessColor}10;">${accessIcon} ${course.access}</span>
            <span class="badge" style="border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.65);">${course.difficulty}</span>
            <span class="badge" style="border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);">${(course.category ?? '').replace(/_/g, ' ')}</span>
            ${course.isNew ? '<span class="badge" style="background:#f59e0b;border-color:#f59e0b;color:white;">New</span>' : ''}
            ${course.state === 'COMING_SOON' ? '<span class="badge" style="background:rgba(82,82,91,0.8);border-color:rgba(255,255,255,0.1);color:white;">Coming Soon</span>' : ''}
          </div>
          <!-- Title -->
          <h1 style="font-size:clamp(20px,3vw,30px);font-weight:900;color:#fff;line-height:1.2;margin-bottom:4px;">${course.title}</h1>
          ${course.ar_title ? `<p style="font-size:14px;color:rgba(255,255,255,0.5);direction:rtl;margin-bottom:4px;">${course.ar_title}</p>` : ''}
          ${course.description ? `<p style="font-size:13px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:600px;margin-top:8px;">${course.description}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid rgba(255,255,255,0.1);padding:12px 0;margin-top:16px;">
      <div style="display:flex;flex-wrap:wrap;gap:20px;">
        <div class="stat"><span style="color:${accentColor};"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span><span class="stat-val">${topicCount}</span><span class="stat-lbl">Topics</span></div>
        ${course.estimatedHours != null ? `<div class="stat"><span style="color:${accentColor};">⏱</span><span class="stat-val">${course.estimatedHours}h</span><span class="stat-lbl">est.</span></div>` : ''}
        ${(course.enrollmentCount ?? 0) > 0 ? `<div class="stat"><span style="color:${accentColor};">👥</span><span class="stat-val">${(course.enrollmentCount ?? 0).toLocaleString()}</span><span class="stat-lbl">enrolled</span></div>` : ''}
        ${(course.labSlugs?.length ?? 0) > 0 ? `<div class="stat"><span style="color:${accentColor};">🧪</span><span class="stat-val">${course.labSlugs?.length}</span><span class="stat-lbl">Labs</span></div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn" style="border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);">Save</button>
        <button class="btn" style="background:${accentColor};color:#fff;">
          ${course.access === 'FREE' ? '⚡ Start Free →' : `👑 Upgrade to ${course.access} →`}
        </button>
      </div>
    </div>
  </div>
</section>

<!-- CONTENT -->
<div class="container" style="padding-top:40px;padding-bottom:80px;">

  ${
    course.longDescription
      ? `
  <div style="margin-bottom:32px;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);">
    <p style="font-size:13px;line-height:1.75;color:rgba(244,244,245,0.7);">${course.longDescription}</p>
  </div>`
      : ''
  }

  ${
    (course.skills?.length ?? 0) > 0
      ? `
  <div style="margin-bottom:32px;">
    <p style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;margin-bottom:8px;">🎓 Skills you'll gain</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${course.skills.map((s) => `<span style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:3px 10px;font-size:12px;">${s}</span>`).join('')}
    </div>
  </div>`
      : ''
  }

  <!-- CURRICULUM -->
  <div style="margin-bottom:32px;">
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:24px;">
      <div>
        <h2 style="font-size:22px;font-weight:700;">Course Curriculum</h2>
        <p style="font-size:13px;color:#71717a;margin-top:4px;">${topicCount} Topics · Follow the order for best results</p>
      </div>
      <div style="display:flex;align-items:center;gap:16px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.03);padding:10px 16px;">
        <div style="text-align:right;">
          <p style="font-size:11px;color:#71717a;">Your progress (0/${topicCount})</p>
          <p style="font-size:18px;font-weight:900;line-height:1;">0%</p>
        </div>
        <div style="width:96px;height:8px;border-radius:99px;background:rgba(255,255,255,0.1);"><div style="width:0%;height:100%;border-radius:99px;background:${accentColor};"></div></div>
        ${course.estimatedHours != null ? `<div style="text-align:right;"><p style="font-size:11px;color:#71717a;">est. time</p><p style="font-size:18px;font-weight:900;line-height:1;">${course.estimatedHours}h</p></div>` : ''}
      </div>
    </div>

    ${
      sections.length === 0
        ? '<p style="font-size:13px;color:#71717a;font-style:italic;padding:16px 0;">Curriculum not available yet.</p>'
        : `<div style="position:relative;"><div style="position:absolute;top:20px;bottom:20px;left:25px;width:1px;background:rgba(255,255,255,0.08);"></div><ol style="list-style:none;">${sectionsHTML}</ol></div>`
    }
  </div>

  ${
    (course.labSlugs?.length ?? 0) > 0
      ? `
  <div id="course-labs-section" style="margin-top:40px;">
    <h2 style="font-size:22px;font-weight:700;margin-bottom:16px;">Labs in this Course</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
      ${course.labSlugs
        .map(
          (slug) => `
      <div style="display:flex;align-items:center;gap:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);padding:12px 16px;">
        <div style="width:36px;height:36px;border-radius:8px;background:${accentColor}10;display:flex;align-items:center;justify-content:center;flex-shrink:0;">🧪</div>
        <div><p style="font-size:13px;font-weight:500;font-family:monospace;">${slug}</p><p style="font-size:11px;color:#71717a;">Lab</p></div>
      </div>`,
        )
        .join('')}
    </div>
  </div>`
      : ''
  }

</div>
</body>
</html>`);
    win.document.close();
  };

  return (
    <div className='space-y-8'>
      {/* ── Admin Banner ── */}
      <div className='flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2'>
        <Eye className='h-4 w-4 text-yellow-400 shrink-0' />
        <p className='text-xs text-yellow-300'>
          هذا preview دقيق لكيفية ظهور الكورس على المنصة. اضغط &quot;Open in New
          Window&quot; لمشاهدة العرض الكامل.
        </p>
        <Badge
          variant='outline'
          className='ml-auto shrink-0 border-yellow-500/40 text-yellow-400 text-xs'>
          {course.state}
        </Badge>
      </div>

      {/* ── Open Preview Button ── */}
      <div className='flex justify-center'>
        <Button
          size='lg'
          className='gap-2.5 min-w-[220px] font-semibold'
          onClick={handleOpenPreviewWindow}>
          <ExternalLink className='h-5 w-5' />
          Open Preview Window
        </Button>
      </div>

      {/* ── Inline Hero Preview (same tab) ── */}
      <div className='overflow-hidden rounded-2xl border border-border/50'>
        <PreviewHero course={course} topicCount={sections.length} />
      </div>

      {/* ── Curriculum Preview ── */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4'>
          Curriculum Preview ({curriculumData?.totalTopics ?? sections.length}{' '}
          topics)
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
            <p className='text-sm text-muted-foreground'>
              No curriculum data yet.
            </p>
            <p className='text-xs text-muted-foreground/60 mt-1'>
              Add topics in the Content Writer tab to see them here.
            </p>
          </div>
        )}
      </div>

      {/* ── Labs ── */}
      {(course.labSlugs?.length ?? 0) > 0 && <LabsSection course={course} />}

      {/* ── Skills & Tags ── */}
      <MetaSection course={course} />
    </div>
  );
}
