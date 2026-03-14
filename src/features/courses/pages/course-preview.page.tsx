// src/features/courses/pages/course-preview.page.tsx
// Standalone admin preview — same content as course-detail-page but without
// MainLayout (no Navbar / Footer). Accessible at /preview/courses/:slug
// inside cyberlabs-admin without any extra auth requirements (AdminGate
// already protects the whole admin app).
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/core/api/client';
import { CourseCurriculum } from '../components/course-curriculum';
import { CourseDetailHero } from '../components/course-detail-hero';
import { CourseLabsSection } from '../components/course-labs-section';
import { useCourse } from '../hooks/use-course';

export default function CoursePreviewPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { i18n, t } = useTranslation('courses');
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const { data: course, isLoading, isError } = useCourse(slug);

  const { data: labsData } = useQuery<{ labs: any[] }>({
    queryKey: ['courses', slug, 'labs'],
    queryFn: () =>
      apiClient.get(`/courses/${slug}/labs`).then((r: any) => r?.data ?? r),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    placeholderData: { labs: [] },
  });
  const hasLabs = (labsData?.labs?.length ?? 0) > 0;

  // ── Preview banner ────────────────────────────────────────────────────────
  const PreviewBanner = () => (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-500/95 backdrop-blur px-4 py-2 text-black text-sm font-semibold shadow">
      <span>👁 Admin Preview Mode — this page is not visible to users</span>
      <button
        className="rounded border border-black/20 px-3 py-0.5 text-xs hover:bg-black/10"
        onClick={() => window.close()}>
        Close Preview
      </button>
    </div>
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <PreviewBanner />
        <CoursePreviewSkeleton />
      </div>
    );

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-background">
        <PreviewBanner />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <p className="font-semibold">
            {t('detail.notFound', 'Course not found')}
          </p>
          <Link to="/courses">
            <Button variant="outline" size="sm">
              {t('detail.backToList', 'All Courses')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const longDesc =
    lang === 'ar' ? course.ar_longDescription : course.longDescription;

  return (
    <div className="min-h-screen bg-background">
      <PreviewBanner />

      <CourseDetailHero
        course={course}
        // Preview: show as enrolled+no-progress so all sections are visible
        enrolled={true}
        enrolling={false}
        progress={0}
        done={0}
        fav={false}
        isPro={true}
        hasLabs={hasLabs}
        onEnroll={() => {}}
        onToggleFav={() => {}}
        onContinue={() => {}}
        onGoToLabs={() =>
          document
            .getElementById('course-labs-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      />

      <div className="container mx-auto px-4 py-10">
        {longDesc && (
          <div className="mb-8 p-5 rounded-xl border border-border/40 bg-muted/20">
            <p className="text-sm text-foreground/70 leading-7">{longDesc}</p>
          </div>
        )}
        <CourseCurriculum
          course={course}
          isEnrolled={true}
          hasLabs={hasLabs}
        />
        <CourseLabsSection courseSlug={slug} courseId={course.id} />
      </div>
    </div>
  );
}

function CoursePreviewSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Skeleton className="h-4 w-28 mb-8" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <div className="grid sm:grid-cols-2 gap-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 overflow-hidden">
          <Skeleton className="h-44 w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
