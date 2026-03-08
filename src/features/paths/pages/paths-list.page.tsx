import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Search, Eye, Pencil, Trash2, MapPin, Globe, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { pathsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import type { LearningPathListItem } from '@/core/types/api.types';

export default function PathsListPage() {
  const { t } = useTranslation('paths');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  const params = {
    page,
    limit: 20,
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

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      published ? pathsService.unpublish(id) : pathsService.publish(id),
    onSuccess: (_, vars) => {
      toast.success(vars.published ? t('messages.unpublishSuccess') : t('messages.publishSuccess'));
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
    },
    onError: () => toast.error(t('messages.updateSuccess')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pathsService.delete(id),
    onSuccess: () => {
      toast.success(t('messages.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
    },
    onError: () => toast.error(t('messages.deleteConfirm')),
  });

  const paths = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => navigate(ROUTES.PATH_CREATE)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newPath')}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('stats.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('stats.published')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('stats.unpublished')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.unpublished}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('placeholders.search')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'unpublished'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {t(`filters.${f}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">{t('messages.loading')}</p>
            </div>
          ) : paths.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <MapPin className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{t('messages.noResults')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {paths.map((path: LearningPathListItem) => (
                <div
                  key={path.id}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {path.thumbnail ? (
                      <img
                        src={path.thumbnail}
                        alt={path.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{path.title}</p>
                      {path.ar_title && (
                        <p className="text-xs text-muted-foreground">{path.ar_title}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {t('modulesCount', { count: path._count.modules })}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {path._count.enrollments} {t('enrollments')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={path.isPublished ? 'default' : 'secondary'}>
                      {path.isPublished ? t('filters.published') : t('filters.unpublished')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={path.isPublished ? t('actions.unpublish') : t('actions.publish')}
                      onClick={() =>
                        publishMutation.mutate({ id: path.id, published: path.isPublished })
                      }
                    >
                      {path.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={ROUTES.PATH_DETAIL(path.id)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={ROUTES.PATH_EDIT(path.id)}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('messages.deleteConfirm')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('messages.deleteWarning')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(path.id)}
                          >
                            {t('actions.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {meta.total} {t('title').toLowerCase()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span className="flex items-center text-sm px-2">
              {page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
