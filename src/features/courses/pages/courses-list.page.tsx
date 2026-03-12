// src/features/courses/pages/courses-list.page.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Plus, Globe, EyeOff, Clock, AlertCircle,
  LayoutGrid, List, ChevronLeft, ChevronRight, Search, FileJson, RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CourseAdminCard } from '../components/course-admin-card';
import { CoursesTable } from '../components/courses-table';
import { ROUTES } from '@/shared/constants';
import type { CourseState } from '../types/admin-course.types';

const STAT_CARDS = [
  { key: 'total'      as const, labelKey: 'stats.total',      icon: BookOpen, color: 'text-primary',     bg: 'bg-primary/10 border-primary/20'         },
  { key: 'published'  as const, labelKey: 'stats.published',  icon: Globe,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'draft'      as const, labelKey: 'stats.draft',      icon: EyeOff,   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
  { key: 'comingSoon' as const, labelKey: 'stats.comingSoon', icon: Clock,    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
];

type StateFilter = CourseState | 'all';
type DiffFilter  = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export default function CoursesListPage() {
  const { t } = useTranslation('courses');
  const navigate = useNavigate();
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [diff,   setDiff]   = useState<DiffFilter>('ALL');
  const [state,  setState]  = useState<StateFilter>('all');
  const [view,   setView]   = useState<'grid' | 'table'>('grid');
  const limit = 20;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'courses', 'stats'],
    queryFn: adminCoursesApi.getStats,
    staleTime: 30_000,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'courses', 'list', page, search, diff, state],
    queryFn: () => adminCoursesApi.list({
      page,
      limit,
      search: search || undefined,
      difficulty: diff !== 'ALL' ? diff : undefined,
      // 'all' is NOT sent — API receives no state param = all courses
      state: state !== 'all' ? state : undefined,
    }),
    staleTime: 10_000,
    retry: 1,
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }, [],
  );
  const handleStateChange = useCallback(
    (v: string) => { setState(v as StateFilter); setPage(1); }, [],
  );
  const handleDiffChange = useCallback(
    (v: string) => { setDiff(v as DiffFilter); setPage(1); }, [],
  );

  if (error) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <div className='flex flex-col items-center gap-4 max-w-md w-full'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' aria-hidden='true' />
            <AlertDescription>{t('errors.loadFailed')}</AlertDescription>
          </Alert>
          <Button variant='outline' onClick={() => refetch()} className='gap-2'>
            <RefreshCw className='h-4 w-4' aria-hidden='true' /> {t('actions.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{t('subtitle')}</p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='outline' size='sm' className='h-9 gap-2'
            onClick={() => navigate('/courses/import')}>
            <FileJson className='h-4 w-4' aria-hidden='true' />
            <span className='hidden sm:inline'>{t('importJson')}</span>
          </Button>
          <Button size='sm' className='h-9 gap-2'
            onClick={() => navigate(ROUTES.COURSE_CREATE)}>
            <Plus className='h-4 w-4' aria-hidden='true' /> {t('newCourse')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-24 rounded-xl' />
            ))
          : STAT_CARDS.map(({ key, labelKey, icon: Icon, color, bg }) => (
              <Card key={key} className='flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors'>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', bg)}>
                  <Icon className={cn('h-5 w-5', color)} aria-hidden='true' />
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-xs text-muted-foreground'>{t(labelKey)}</p>
                  <p className='mt-0.5 text-2xl font-bold leading-none'>{stats?.[key] ?? 0}</p>
                </div>
              </Card>
            ))}
      </div>

      {/* Filters */}
      <div className='flex items-center gap-2 flex-wrap'>
        <div className='relative flex-1 min-w-[180px]'>
          <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' aria-hidden='true' />
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            onChange={handleSearchChange}
            className='h-9 ps-9 bg-background'
            aria-label={t('filters.searchPlaceholder')}
          />
        </div>

        {/* State filter — 3 real values + all */}
        <Select value={state} onValueChange={handleStateChange}>
          <SelectTrigger className='h-9 w-40 bg-background' aria-label={t('filters.allStatuses')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('state.all')}</SelectItem>
            <SelectItem value='PUBLISHED'>{t('state.PUBLISHED')}</SelectItem>
            <SelectItem value='DRAFT'>{t('state.DRAFT')}</SelectItem>
            <SelectItem value='COMING_SOON'>{t('state.COMING_SOON')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Difficulty filter */}
        <Select value={diff} onValueChange={handleDiffChange}>
          <SelectTrigger className='h-9 w-36 bg-background' aria-label={t('filters.allDifficulties')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('difficulty.ALL')}</SelectItem>
            <SelectItem value='BEGINNER'>{t('difficulty.BEGINNER')}</SelectItem>
            <SelectItem value='INTERMEDIATE'>{t('difficulty.INTERMEDIATE')}</SelectItem>
            <SelectItem value='ADVANCED'>{t('difficulty.ADVANCED')}</SelectItem>
            <SelectItem value='EXPERT'>{t('difficulty.EXPERT')}</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className='flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5'
          role='group' aria-label='View mode'>
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'} size='sm'
            aria-label={t('filters.gridView')} aria-pressed={view === 'grid'}
            className='h-8 w-8 p-0' onClick={() => setView('grid')}>
            <LayoutGrid className='h-3.5 w-3.5' aria-hidden='true' />
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'ghost'} size='sm'
            aria-label={t('filters.tableView')} aria-pressed={view === 'table'}
            className='h-8 w-8 p-0' onClick={() => setView('table')}>
            <List className='h-3.5 w-3.5' aria-hidden='true' />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        view === 'grid' ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-80 rounded-2xl' />
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
      ) : view === 'grid' ? (
        <>
          {(data?.data ?? []).length === 0 ? (
            <Card className='flex flex-col items-center justify-center gap-3 p-16 text-center'>
              <BookOpen className='h-8 w-8 text-muted-foreground' aria-hidden='true' />
              <p className='font-medium'>{t('table.noResults')}</p>
              <p className='text-sm text-muted-foreground'>{t('table.noResultsHint')}</p>
              <Button size='sm' className='mt-2 gap-2' onClick={() => navigate(ROUTES.COURSE_CREATE)}>
                <Plus className='h-4 w-4' aria-hidden='true' /> {t('newCourse')}
              </Button>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {(data?.data ?? []).map((course, i) => (
                <CourseAdminCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className='flex items-center justify-between border-t pt-4'>
              <p className='text-xs text-muted-foreground'>
                {(page - 1) * limit + 1}–{Math.min(page * limit, data.meta.total)}{' '}
                {t('table.of')}{' '}
                <span className='font-semibold text-foreground'>{data.meta.total}</span>
              </p>
              <div className='flex items-center gap-1'>
                <Button variant='outline' size='sm' aria-label={t('table.prevPage')}
                  className='h-8 gap-1 px-3 text-xs'
                  onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  <ChevronLeft className='h-3.5 w-3.5' aria-hidden='true' /> {t('table.page')}
                </Button>
                <div className='flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary'>
                  {page}
                </div>
                <Button variant='outline' size='sm' aria-label={t('table.nextPage')}
                  className='h-8 gap-1 px-3 text-xs'
                  onClick={() => setPage((p) => p + 1)} disabled={page === data.meta.totalPages}>
                  {t('table.nextPage')} <ChevronRight className='h-3.5 w-3.5' aria-hidden='true' />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <CoursesTable
          data={data?.data ?? []}
          meta={data?.meta}
          page={page}
          onPageChange={setPage}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
