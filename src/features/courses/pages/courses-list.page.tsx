// src/features/courses/pages/courses-list.page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '@/core/api/services';
import { CoursesTable } from '../components/courses-table';
import { CourseAdminCard } from '../components/course-admin-card';
import { CourseFilters } from '../components/course-filters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Plus,
  FileJson,
  Globe,
  EyeOff,
  Star,
  AlertCircle,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';
import type { Difficulty } from '@/core/types';

const STAT_CARDS = [
  {
    key: 'total' as const,
    label: 'Total Courses',
    icon: BookOpen,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    key: 'published' as const,
    label: 'Published',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'unpublished' as const,
    label: 'Draft',
    icon: EyeOff,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    key: 'featured' as const,
    label: 'Featured',
    icon: Star,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
];

export default function CoursesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>(
    'ALL',
  );
  const [publishedFilter, setPublishedFilter] = useState<
    'all' | 'published' | 'unpublished'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const limit = 20;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['courses', 'stats'],
    queryFn: coursesService.getStats,
  });

  const {
    data: coursesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', 'list', page, search, difficultyFilter, publishedFilter],
    queryFn: () =>
      coursesService.getAll({
        page,
        limit,
        search: search || undefined,
        difficulty: difficultyFilter !== 'ALL' ? difficultyFilter : undefined,
        isPublished:
          publishedFilter === 'all'
            ? undefined
            : publishedFilter === 'published',
      }),
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleDifficultyChange = (val: Difficulty | 'ALL') => {
    setDifficultyFilter(val);
    setPage(1);
  };
  const handlePublishedChange = (
    val: 'all' | 'published' | 'unpublished',
  ) => {
    setPublishedFilter(val);
    setPage(1);
  };

  if (error) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Failed to load courses. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* ── Header ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Courses</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage and publish platform courses
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-9 gap-2'
            onClick={() => navigate(ROUTES.COURSE_IMPORT)}
          >
            <FileJson className='h-4 w-4' />
            <span className='hidden sm:inline'>Import JSON</span>
            <span className='sm:hidden'>Import</span>
          </Button>
          <Button
            size='sm'
            className='h-9 gap-2'
            onClick={() => navigate(ROUTES.COURSE_CREATE)}
          >
            <Plus className='h-4 w-4' />
            New Course
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-24 rounded-xl' />
            ))
          : STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
              <Card
                key={key}
                className='flex items-center gap-4 p-4 transition-colors hover:bg-muted/30'
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                    bg,
                  )}
                >
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-xs text-muted-foreground'>
                    {label}
                  </p>
                  <p className='mt-0.5 text-2xl font-bold leading-none'>
                    {stats?.[key] ?? 0}
                  </p>
                </div>
              </Card>
            ))}
      </div>

      {/* ── Filters + View Toggle ── */}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <CourseFilters
            search={search}
            onSearchChange={handleSearchChange}
            difficultyFilter={difficultyFilter}
            onDifficultyFilterChange={handleDifficultyChange}
            publishedFilter={publishedFilter}
            onPublishedFilterChange={handlePublishedChange}
          />
        </div>
        {/* View mode toggle */}
        <div className='flex shrink-0 items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => setViewMode('grid')}
            title='Grid view'
          >
            <LayoutGrid className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => setViewMode('table')}
            title='Table view'
          >
            <List className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-72 rounded-xl' />
            ))}
          </div>
        ) : (
          <Card className='p-6'>
            <div className='space-y-3'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className='h-14 rounded-lg' />
              ))}
            </div>
          </Card>
        )
      ) : viewMode === 'grid' ? (
        <>
          {/* Grid */}
          {(coursesData?.data ?? []).length === 0 ? (
            <Card className='flex flex-col items-center justify-center gap-3 p-16 text-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                <BookOpen className='h-5 w-5 text-muted-foreground' />
              </div>
              <p className='font-medium'>No courses found</p>
              <p className='text-sm text-muted-foreground'>
                Try adjusting your filters or create a new course.
              </p>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {(coursesData?.data ?? []).map((course) => (
                <CourseAdminCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Grid pagination */}
          {coursesData?.meta && coursesData.meta.totalPages > 1 && (
            <div className='flex items-center justify-between border-t pt-4'>
              <p className='text-xs text-muted-foreground'>
                Showing{' '}
                <span className='font-semibold text-foreground'>
                  {(page - 1) * limit + 1}–
                  {Math.min(page * limit, coursesData.meta.total)}
                </span>{' '}
                of{' '}
                <span className='font-semibold text-foreground'>
                  {coursesData.meta.total}
                </span>
              </p>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1 px-3 text-xs'
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className='h-3.5 w-3.5' />
                  Prev
                </Button>
                <div className='flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary'>
                  {page}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1 px-3 text-xs'
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === coursesData.meta.totalPages}
                >
                  Next
                  <ChevronRight className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <CoursesTable
          data={coursesData?.data ?? []}
          meta={coursesData?.meta}
          page={page}
          onPageChange={setPage}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
