// src/features/courses/pages/courses-list.page.tsx
// Step 1 — List Page: يعرض الكورسات بنفس الكارد من الـ frontend + AdminOverlay
import { useState }      from 'react';
import { useNavigate }   from 'react-router-dom';
import { useQuery }      from '@tanstack/react-query';
import {
  BookOpen, Plus, Globe, EyeOff, Clock, AlertCircle,
  LayoutGrid, List, ChevronLeft, ChevronRight, Search, FileJson,
} from 'lucide-react';
import { Card }          from '@/components/ui/card';
import { Button }        from '@/components/ui/button';
import { Input }         from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton }      from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn }            from '@/lib/utils';
import { coursesApi }    from '../services/courses.api';
import { CourseCard }    from '../components/course-card';
import { CoursesTable }  from '../components/courses-table';
import { ROUTES }        from '@/shared/constants';
import type { CourseState } from '../types/course.types';

const STAT_CARDS = [
  { key: 'total'      as const, label: 'Total',       icon: BookOpen,  color: 'text-primary',     bg: 'bg-primary/10 border-primary/20'         },
  { key: 'published'  as const, label: 'Published',   icon: Globe,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'draft'      as const, label: 'Draft',        icon: EyeOff,    color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
  { key: 'comingSoon' as const, label: 'Coming Soon', icon: Clock,     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
];

type StateFilter = CourseState | 'all';
type DiffFilter  = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export default function CoursesListPage() {
  const navigate = useNavigate();
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [diff,        setDiff]        = useState<DiffFilter>('ALL');
  const [state,       setState]       = useState<StateFilter>('all');
  const [view,        setView]        = useState<'grid' | 'table'>('grid');
  const limit = 20;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['courses', 'stats'],
    queryFn:  coursesApi.getStats,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['courses', 'list', page, search, diff, state],
    queryFn:  () => coursesApi.list({
      page,
      limit,
      search:     search || undefined,
      difficulty: diff !== 'ALL' ? diff : undefined,
      state,
    }),
  });

  if (error) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Failed to load courses. Please try again.</AlertDescription>
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
          <p className='mt-1 text-sm text-muted-foreground'>Manage and publish platform courses</p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='outline' size='sm' className='h-9 gap-2'
            onClick={() => navigate('/courses/import')}>
            <FileJson className='h-4 w-4' />
            <span className='hidden sm:inline'>Import JSON</span>
          </Button>
          <Button size='sm' className='h-9 gap-2'
            onClick={() => navigate(ROUTES.COURSE_CREATE)}>
            <Plus className='h-4 w-4' /> New Course
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className='h-24 rounded-xl' />)
          : STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
              <Card key={key} className='flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors'>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-xs text-muted-foreground'>{label}</p>
                  <p className='mt-0.5 text-2xl font-bold leading-none'>{stats?.[key] ?? 0}</p>
                </div>
              </Card>
            ))}
      </div>

      {/* ── Filters ── */}
      <div className='flex items-center gap-2 flex-wrap'>
        <div className='relative flex-1 min-w-[180px]'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search courses...'
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className='h-9 pl-9 bg-background'
          />
        </div>
        <Select value={state} onValueChange={(v) => { setState(v as StateFilter); setPage(1); }}>
          <SelectTrigger className='h-9 w-36 bg-background'><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='PUBLISHED'>Published</SelectItem>
            <SelectItem value='DRAFT'>Draft</SelectItem>
            <SelectItem value='COMING_SOON'>Coming Soon</SelectItem>
          </SelectContent>
        </Select>
        <Select value={diff} onValueChange={(v) => { setDiff(v as DiffFilter); setPage(1); }}>
          <SelectTrigger className='h-9 w-36 bg-background'><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Levels</SelectItem>
            <SelectItem value='BEGINNER'>Beginner</SelectItem>
            <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
            <SelectItem value='ADVANCED'>Advanced</SelectItem>
            <SelectItem value='EXPERT'>Expert</SelectItem>
          </SelectContent>
        </Select>
        <div className='flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5'>
          <Button variant={view === 'grid' ? 'default' : 'ghost'} size='sm'
            className='h-8 w-8 p-0' onClick={() => setView('grid')}>
            <LayoutGrid className='h-3.5 w-3.5' />
          </Button>
          <Button variant={view === 'table' ? 'default' : 'ghost'} size='sm'
            className='h-8 w-8 p-0' onClick={() => setView('table')}>
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
              <p className='font-medium'>No courses found</p>
              <p className='text-sm text-muted-foreground'>Adjust filters or create a new course.</p>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {(data?.data ?? []).map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className='flex items-center justify-between border-t pt-4'>
              <p className='text-xs text-muted-foreground'>
                Showing <span className='font-semibold text-foreground'>{(page - 1) * limit + 1}–{Math.min(page * limit, data.meta.total)}</span> of{' '}
                <span className='font-semibold text-foreground'>{data.meta.total}</span>
              </p>
              <div className='flex items-center gap-1'>
                <Button variant='outline' size='sm' className='h-8 gap-1 px-3 text-xs'
                  onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  <ChevronLeft className='h-3.5 w-3.5' /> Prev
                </Button>
                <div className='flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary'>
                  {page}
                </div>
                <Button variant='outline' size='sm' className='h-8 gap-1 px-3 text-xs'
                  onClick={() => setPage((p) => p + 1)} disabled={page === data.meta.totalPages}>
                  Next <ChevronRight className='h-3.5 w-3.5' />
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
