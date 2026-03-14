// src/features/courses/pages/courses-list.page.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Plus, Globe, EyeOff, Clock, AlertCircle,
  LayoutGrid, List, ChevronLeft, ChevronRight,
  ChevronFirst, ChevronLast, Search, RefreshCw,
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
import { NewCourseDialog } from '../components/new-course-dialog';
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

// ── Smart Pagination ─────────────────────────────────────────────────────────
function Pagination({
  page, totalPages, total, limit, onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const { t } = useTranslation('courses');
  if (totalPages <= 1) return null;

  // Build page number buttons — always show first/last + up to 5 around current
  const pages: (number | '...')[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (
      (i === page - delta - 1 && page - delta > 2) ||
      (i === page + delta + 1 && page + delta < totalPages - 1)
    ) {
      pages.push('...');
    }
  }

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className='flex flex-col items-center gap-3 border-t pt-5 sm:flex-row sm:justify-between'>
      <p className='text-xs text-muted-foreground'>
        <span className='font-semibold text-foreground'>{from}</span>–<span className='font-semibold text-foreground'>{to}</span>
        {' '}{t('table.of')}{' '}
        <span className='font-semibold text-foreground'>{total}</span>
        {' '}{t('table.results', 'results')}
      </p>
      <div className='flex items-center gap-1'>
        <Button variant='outline' size='sm' className='h-8 w-8 p-0' onClick={() => onPage(1)} disabled={page === 1}>
          <ChevronFirst className='h-3.5 w-3.5' />
        </Button>
        <Button variant='outline' size='sm' className='h-8 w-8 p-0' onClick={() => onPage(page - 1)} disabled={page === 1}>
          <ChevronLeft className='h-3.5 w-3.5' />
        </Button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className='px-1 text-sm text-muted-foreground select-none'>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={cn(
                'h-8 min-w-[2rem] rounded-md border px-2 text-xs font-medium transition-colors',
                p === page
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              {p}
            </button>
          )
        )}
        <Button variant='outline' size='sm' className='h-8 w-8 p-0' onClick={() => onPage(page + 1)} disabled={page === totalPages}>
          <ChevronRight className='h-3.5 w-3.5' />
        </Button>
        <Button variant='outline' size='sm' className='h-8 w-8 p-0' onClick={() => onPage(totalPages)} disabled={page === totalPages}>
          <ChevronLast className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesListPage() {
  const { t } = useTranslation('courses');
  const navigate = useNavigate();
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [diff,      setDiff]      = useState<DiffFilter>('ALL');
  const [state,     setState]     = useState<StateFilter>('all');
  const [view,      setView]      = useState<'grid' | 'table'>('grid');
  const [newDialog, setNewDialog] = useState(false);
  const limit = 20;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'courses', 'stats'],
    queryFn:  adminCoursesApi.getStats,
    staleTime: 0,
    gcTime:    0,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'courses', 'list', page, search, diff, state],
    queryFn: () => adminCoursesApi.list({
      page, limit,
      search:     search || undefined,
      difficulty: diff !== 'ALL' ? diff : undefined,
      state:      state !== 'all' ? state : undefined,
    }),
    staleTime: 10_000,
    retry: 1,
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }, [],
  );
  const handleStateChange = useCallback((v: string) => { setState(v as StateFilter); setPage(1); }, []);
  const handleDiffChange  = useCallback((v: string) => { setDiff(v as DiffFilter); setPage(1); }, []);

  if (error) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <div className='flex flex-col items-center gap-4 max-w-md w-full'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{t('errors.loadFailed')}</AlertDescription>
          </Alert>
          <Button variant='outline' onClick={() => refetch()} className='gap-2'>
            <RefreshCw className='h-4 w-4' /> {t('actions.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* ── Header ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{t('subtitle')}</p>
        </div>
        {/* Single "Add Course" button → opens dialog */}
        <Button size='sm' className='h-9 gap-2 shrink-0' onClick={() => setNewDialog(true)}>
          <Plus className='h-4 w-4' /> {t('newCourse')}
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className='h-24 rounded-xl' />)
          : STAT_CARDS.map(({ key, labelKey, icon: Icon, color, bg }) => (
              <Card
                key={key}
                className={cn(
                  'flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors',
                  state === key.replace('comingSoon', 'COMING_SOON').toUpperCase() && 'ring-1 ring-primary/30',
                )}
                onClick={() => {
                  const map: Record<string, StateFilter> = {
                    total: 'all', published: 'PUBLISHED', draft: 'DRAFT', comingSoon: 'COMING_SOON',
                  };
                  setState(map[key]); setPage(1);
                }}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-xs text-muted-foreground'>{t(labelKey)}</p>
                  <p className='mt-0.5 text-2xl font-bold leading-none'>{stats?.[key] ?? 0}</p>
                </div>
              </Card>
            ))}
      </div>

      {/* ── Filters ── */}
      <div className='flex items-center gap-2 flex-wrap'>
        <div className='relative flex-1 min-w-[180px]'>
          <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            onChange={handleSearchChange}
            className='h-9 ps-9 bg-background'
          />
        </div>
        <Select value={state} onValueChange={handleStateChange}>
          <SelectTrigger className='h-9 w-40 bg-background'><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('state.all')}</SelectItem>
            <SelectItem value='PUBLISHED'>{t('state.PUBLISHED')}</SelectItem>
            <SelectItem value='DRAFT'>{t('state.DRAFT')}</SelectItem>
            <SelectItem value='COMING_SOON'>{t('state.COMING_SOON')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={diff} onValueChange={handleDiffChange}>
          <SelectTrigger className='h-9 w-36 bg-background'><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('difficulty.ALL')}</SelectItem>
            <SelectItem value='BEGINNER'>{t('difficulty.BEGINNER')}</SelectItem>
            <SelectItem value='INTERMEDIATE'>{t('difficulty.INTERMEDIATE')}</SelectItem>
            <SelectItem value='ADVANCED'>{t('difficulty.ADVANCED')}</SelectItem>
            <SelectItem value='EXPERT'>{t('difficulty.EXPERT')}</SelectItem>
          </SelectContent>
        </Select>
        <div className='flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5' role='group'>
          <Button variant={view === 'grid'  ? 'default' : 'ghost'} size='sm' className='h-8 w-8 p-0' onClick={() => setView('grid')}>
            <LayoutGrid className='h-3.5 w-3.5' />
          </Button>
          <Button variant={view === 'table' ? 'default' : 'ghost'} size='sm' className='h-8 w-8 p-0' onClick={() => setView('table')}>
            <List className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        view === 'grid' ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className='h-80 rounded-2xl' />)}
          </div>
        ) : (
          <Card className='p-6'>
            <div className='space-y-3'>
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className='h-14 rounded-lg' />)}
            </div>
          </Card>
        )
      ) : view === 'grid' ? (
        <>
          {(data?.data ?? []).length === 0 ? (
            <Card className='flex flex-col items-center justify-center gap-3 p-16 text-center'>
              <BookOpen className='h-8 w-8 text-muted-foreground' />
              <p className='font-medium'>{t('table.noResults')}</p>
              <p className='text-sm text-muted-foreground'>{t('table.noResultsHint')}</p>
              <Button size='sm' className='mt-2 gap-2' onClick={() => setNewDialog(true)}>
                <Plus className='h-4 w-4' /> {t('newCourse')}
              </Button>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {(data?.data ?? []).map((course, i) => (
                <CourseAdminCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
          {data?.meta && (
            <Pagination
              page={page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={limit}
              onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}
        </>
      ) : (
        <CoursesTable
          data={data?.data ?? []}
          meta={data?.meta}
          page={page}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onRefetch={refetch}
        />
      )}

      {/* ── New Course Dialog ── */}
      <NewCourseDialog open={newDialog} onClose={() => setNewDialog(false)} />
    </div>
  );
}
