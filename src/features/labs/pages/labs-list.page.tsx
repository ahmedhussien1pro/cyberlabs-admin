import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { labsService } from '@/core/api/services';
import { LabsTable } from '../components/labs-table';
import { LabFilters } from '../components/lab-filters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FlaskConical, Plus } from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import type { Difficulty, Category, LabExecutionMode } from '@/core/types';

export default function LabsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [executionModeFilter, setExecutionModeFilter] = useState<LabExecutionMode | 'ALL'>('ALL');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const limit = 20;

  const { data: stats } = useQuery({
    queryKey: ['labs', 'stats'],
    queryFn: labsService.getStats,
  });

  const {
    data: labsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['labs', 'list', page, search, difficultyFilter, categoryFilter, executionModeFilter, publishedFilter],
    queryFn: () =>
      labsService.getAll({
        page,
        limit,
        search: search || undefined,
        difficulty: difficultyFilter !== 'ALL' ? difficultyFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        executionMode: executionModeFilter !== 'ALL' ? executionModeFilter : undefined,
        isPublished: publishedFilter === 'all' ? undefined : publishedFilter === 'published',
      }),
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load labs. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Labs</h1>
          <p className="text-muted-foreground">Manage platform labs</p>
        </div>
        <Button onClick={() => navigate(ROUTES.LAB_CREATE)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Lab
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats ? (
          [
            { label: 'Total Labs', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Beginner', value: stats.byDifficulty.BEGINNER },
            { label: 'Completions', value: stats.totalCompletions },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <FlaskConical className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      {/* Filters */}
      <LabFilters
        search={search}
        onSearchChange={setSearch}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={setDifficultyFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        executionModeFilter={executionModeFilter}
        onExecutionModeFilterChange={setExecutionModeFilter}
        publishedFilter={publishedFilter}
        onPublishedFilterChange={setPublishedFilter}
      />

      {/* Table */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </Card>
      ) : (
        <LabsTable
          data={labsData?.data ?? []}
          meta={labsData?.meta}
          page={page}
          onPageChange={setPage}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
