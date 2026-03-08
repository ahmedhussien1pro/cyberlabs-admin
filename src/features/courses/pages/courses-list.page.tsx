import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '@/core/api/services';
import { CoursesTable } from '../components/courses-table';
import { CourseFilters } from '../components/course-filters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BookOpen, Plus } from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import type { Difficulty } from '@/core/types';

export default function CoursesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const limit = 20;

  const { data: stats } = useQuery({
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
          publishedFilter === 'all' ? undefined : publishedFilter === 'published',
      }),
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load courses. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage platform courses</p>
        </div>
        <Button onClick={() => navigate(ROUTES.COURSE_CREATE)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats ? (
          [
            { label: 'Total Courses', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Unpublished', value: stats.unpublished },
            // featured replaces totalEnrollments which was never in the backend response
            { label: 'Featured', value: stats.featured },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      {/* Filters */}
      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={setDifficultyFilter}
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
