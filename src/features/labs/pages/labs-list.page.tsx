// src/features/labs/pages/labs-list.page.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { labsService } from '@/core/api/services';
import { LabAdminCard } from '../components/lab-admin-card';
import { LabFilters } from '../components/lab-filters';
import { LabsTable } from '../components/labs-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  FlaskConical,
  Plus,
  Globe,
  EyeOff,
  Trophy,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Languages,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';
import { useLabsT, useLocale } from '@/hooks/use-locale';
import type { SortOption } from '../components/lab-filters';
import type { LabListItem } from '@/core/types';

export default function LabsListPage() {
  const navigate = useNavigate();
  const t = useLabsT();
  const { locale, setLocale, isRTL } = useLocale();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [executionModeFilter, setExecutionModeFilter] = useState('ALL');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sort, setSort] = useState<SortOption>('newest');
  const limit = 20;

  // ── Fetch all labs (no server-side enum filters to avoid 400) ─────────────
  // Only pass isPublished (boolean) and search (string) — both safe params.
  // All enum filters (difficulty, category, executionMode) are client-side.
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['labs', 'stats'],
    queryFn: labsService.getStats,
  });

  const {
    data: labsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['labs', 'list', page, search, publishedFilter],
    queryFn: () =>
      labsService.getAll({
        page,
        limit,
        search: search || undefined,
        isPublished:
          publishedFilter === 'all'
            ? undefined
            : publishedFilter === 'published',
      }),
    staleTime: 30_000,
  });

  // ── Client-side filtering for difficulty / category / executionMode ───────
  const filteredLabs = useMemo(() => {
    let items: LabListItem[] = labsData?.data ?? [];

    if (difficultyFilter !== 'ALL') {
      items = items.filter((l) => l.difficulty === difficultyFilter);
    }
    if (categoryFilter !== 'ALL') {
      items = items.filter((l) => l.category === categoryFilter);
    }
    if (executionModeFilter !== 'ALL') {
      items = items.filter((l) => l.executionMode === executionModeFilter);
    }

    // ── Sorting ───────────────────────────────────────────────────────────
    switch (sort) {
      case 'oldest':
        items = [...items].sort(
          (a, b) =>
            new Date((a as any).createdAt ?? 0).getTime() -
            new Date((b as any).createdAt ?? 0).getTime(),
        );
        break;
      case 'title_asc':
        items = [...items].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        items = [...items].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'submissions':
        items = [...items].sort(
          (a, b) => (b._count?.submissions ?? 0) - (a._count?.submissions ?? 0),
        );
        break;
      case 'newest':
      default:
        items = [...items].sort(
          (a, b) =>
            new Date((b as any).createdAt ?? 0).getTime() -
            new Date((a as any).createdAt ?? 0).getTime(),
        );
        break;
    }

    return items;
  }, [labsData, difficultyFilter, categoryFilter, executionModeFilter, sort]);

  const resetFilters = () => {
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load labs. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const STAT_CARDS = [
    { key: 'total' as const, label: t.totalLabs, icon: FlaskConical, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { key: 'published' as const, label: t.published, icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 'unpublished' as const, label: t.unpublished, icon: EyeOff, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { key: 'totalCompletions' as const, label: t.completions, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Locale toggle */}
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2"
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Languages className="h-4 w-4" />
            {locale === 'en' ? 'عربي' : 'EN'}
          </Button>
          <Button
            size="sm"
            className="h-9 gap-2"
            onClick={() => navigate(ROUTES.LAB_CREATE)}
          >
            <Plus className="h-4 w-4" /> {t.newLab}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
              <Card
                key={key}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-2xl font-bold leading-none">
                    {key === 'unpublished'
                      ? stats ? stats.total - stats.published : 0
                      : ((stats as any)?.[key] ?? 0)}
                  </p>
                </div>
              </Card>
            ))}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <LabFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); resetFilters(); }}
            difficultyFilter={difficultyFilter}
            onDifficultyFilterChange={(v) => { setDifficultyFilter(v); resetFilters(); }}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(v) => { setCategoryFilter(v); resetFilters(); }}
            executionModeFilter={executionModeFilter}
            onExecutionModeFilterChange={(v) => { setExecutionModeFilter(v); resetFilters(); }}
            publishedFilter={publishedFilter}
            onPublishedFilterChange={(v) => { setPublishedFilter(v); resetFilters(); }}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 self-start">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <LabsTable
          data={filteredLabs}
          meta={labsData?.meta}
          page={page}
          onPageChange={setPage}
          onRefetch={refetch}
        />
      ) : (
        <>
          {filteredLabs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-medium">{t.noLabs}</p>
              <p className="text-sm text-muted-foreground">{t.noLabsHint}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLabs.map((lab, i) => (
                <LabAdminCard key={lab.id} lab={lab} index={i} />
              ))}
            </div>
          )}

          {labsData?.meta && labsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground">
                {t.showing}{' '}
                <span className="font-semibold text-foreground">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, labsData.meta.total)}
                </span>{' '}
                {t.of}{' '}
                <span className="font-semibold text-foreground">
                  {labsData.meta.total}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-3 text-xs"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> {t.prev}
                </Button>
                <div className="flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary">
                  {page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-3 text-xs"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === labsData.meta.totalPages}
                >
                  {t.next} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
