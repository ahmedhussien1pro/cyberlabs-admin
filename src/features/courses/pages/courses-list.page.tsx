import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '@/core/api/services';
import { CoursesTable } from '../components/courses-table';
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
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
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

  const handlePublishedChange = (val: 'all' | 'published' | 'unpublished') => {
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

      {/* ── Filters ── */}
      <CourseFilters
        search={search}
        onSearchChange={handleSearchChange}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={handleDifficultyChange}
        publishedFilter={publishedFilter}
        onPublishedFilterChange={handlePublishedChange}
      />

      {/* ── Table ── */}
      {isLoading ? (
        <Card className='p-6'>
          <div className='space-y-3'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-14 rounded-lg' />
            ))}
          </div>
        </Card>
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
