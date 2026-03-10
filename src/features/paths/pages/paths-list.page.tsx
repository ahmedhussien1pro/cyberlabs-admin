// src/features/paths/pages/paths-list.page.tsx
// CMS Phase 3: Rebuilt with PathAdminCard grid view
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, MapPin, Globe, EyeOff, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PathAdminCard } from '../components/path-admin-card';
import { pathsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import { cn } from '@/lib/utils';

const STAT_CARDS = [
  { key: 'total'       as const, label: 'Total Paths', icon: MapPin,  color: 'text-primary',     bg: 'bg-primary/10 border-primary/20' },
  { key: 'published'   as const, label: 'Published',   icon: Globe,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'unpublished' as const, label: 'Unpublished', icon: EyeOff,  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
];

export default function PathsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 20;

  const params = {
    page,
    limit,
    search: search || undefined,
    isPublished: filter === 'all' ? undefined : filter === 'published',
  };

  const { data: stats } = useQuery({
    queryKey: PATHS_QUERY_KEYS.stats,
    queryFn: () => pathsService.getStats(),
  });

  const { data, isLoading } = useQuery({
    queryKey: PATHS_QUERY_KEYS.list(params),
    queryFn: () => pathsService.getAll(params),
  });

  const paths = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Learning Paths</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Manage and publish learning paths</p>
        </div>
        <Button size='sm' className='h-9 gap-2 shrink-0' onClick={() => navigate(ROUTES.PATH_CREATE)}>
          <Plus className='h-4 w-4' /> New Path
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-3'>
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className='flex items-center gap-4 p-4 transition-colors hover:bg-muted/30'>
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

      {/* Filters + View Toggle */}
      <div className='flex items-center gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search paths...'
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className='pl-9 h-9 bg-background'
          />
        </div>
        <div className='flex gap-1.5'>
          {(['all', 'published', 'unpublished'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size='sm'
              className='h-9 capitalize'
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f}
            </Button>
          ))}
        </div>
        <div className='flex shrink-0 items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 ml-auto'>
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size='sm' className='h-8 w-8 p-0' onClick={() => setViewMode('grid')}>
            <LayoutGrid className='h-3.5 w-3.5' />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size='sm' className='h-8 w-8 p-0' onClick={() => setViewMode('list')}>
            <List className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className='h-72 rounded-xl' />)}
        </div>
      ) : paths.length === 0 ? (
        <Card className='flex flex-col items-center justify-center gap-3 p-16 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
            <MapPin className='h-5 w-5 text-muted-foreground' />
          </div>
          <p className='font-medium'>No paths found</p>
          <p className='text-sm text-muted-foreground'>Try adjusting your filters or create a new path.</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {paths.map((path, i) => (
            <PathAdminCard key={path.id} path={path} index={i} />
          ))}
        </div>
      ) : (
        <div className='space-y-2'>
          {paths.map((path) => (
            <div
              key={path.id}
              className='group relative flex items-center gap-4 rounded-lg border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors'
            >
              <PathAdminOverlayPlaceholder />
              <div className='relative w-16 h-10 shrink-0 overflow-hidden rounded bg-muted'>
                {path.thumbnail ? (
                  <img src={path.thumbnail} alt={path.title} className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-primary/10'>
                    <MapPin className='h-4 w-4 text-primary/60' />
                  </div>
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium text-sm'>{path.title}</p>
                {path.ar_title && <p className='truncate text-xs text-muted-foreground' dir='rtl'>{path.ar_title}</p>}
              </div>
              <div className='hidden sm:flex items-center gap-3 text-xs text-muted-foreground'>
                <span>{path._count?.modules ?? 0} modules</span>
                <span>{path._count?.enrollments ?? 0} enrolled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className='flex items-center justify-between border-t pt-4'>
          <p className='text-xs text-muted-foreground'>
            Showing <span className='font-semibold text-foreground'>{(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)}</span> of <span className='font-semibold text-foreground'>{meta.total}</span>
          </p>
          <div className='flex items-center gap-1'>
            <Button variant='outline' size='sm' className='h-8 gap-1 px-3 text-xs' onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              <ChevronLeft className='h-3.5 w-3.5' /> Prev
            </Button>
            <div className='flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary'>{page}</div>
            <Button variant='outline' size='sm' className='h-8 gap-1 px-3 text-xs' onClick={() => setPage((p) => p + 1)} disabled={page === meta.totalPages}>
              Next <ChevronRight className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PathAdminOverlayPlaceholder() {
  return null;
}
