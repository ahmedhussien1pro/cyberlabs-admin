import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  MapPin,
  BookOpen,
  FlaskConical,
  Lock,
  Clock,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import type { PathModule } from '@/core/types/api.types';

export default function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('paths');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: path, isLoading } = useQuery({
    queryKey: PATHS_QUERY_KEYS.detail(id!),
    queryFn: () => pathsService.getById(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      path?.isPublished ? pathsService.unpublish(id!) : pathsService.publish(id!),
    onSuccess: () => {
      toast.success(
        path?.isPublished ? t('messages.unpublishSuccess') : t('messages.publishSuccess'),
      );
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => pathsService.delete(id!),
    onSuccess: () => {
      toast.success(t('messages.deleteSuccess'));
      navigate(ROUTES.PATHS);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-muted-foreground">{t('messages.loading')}</p>
      </div>
    );
  }

  if (!path) return null;

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PATHS)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('title')}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => publishMutation.mutate()}>
            {path.isPublished ? (
              <><EyeOff className="mr-2 h-4 w-4" />{t('actions.unpublish')}</>
            ) : (
              <><Globe className="mr-2 h-4 w-4" />{t('actions.publish')}</>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.PATH_EDIT(path.id)}>
              <Pencil className="mr-2 h-4 w-4" />{t('actions.edit')}
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}
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
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => deleteMutation.mutate()}
                >
                  {t('actions.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Path Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {path.thumbnail ? (
              <img
                src={path.thumbnail}
                alt={path.title}
                className="h-24 w-24 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{path.title}</h1>
                <Badge variant={path.isPublished ? 'default' : 'secondary'}>
                  {path.isPublished ? t('filters.published') : t('filters.unpublished')}
                </Badge>
              </div>
              {path.ar_title && (
                <p className="text-sm text-muted-foreground" dir="rtl">{path.ar_title}</p>
              )}
              {path.description && (
                <p className="text-sm text-muted-foreground">{path.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {path._count.enrollments} {t('enrollments')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {t('modulesCount', { count: path._count.modules })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle>{t('modules.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {path.modules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('modules.empty')}</p>
          ) : (
            <div className="space-y-3">
              {path.modules.map((module: PathModule, idx: number) => (
                <div
                  key={module.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary flex-shrink-0">
                    {module.type === 'COURSE' ? (
                      <BookOpen className="h-5 w-5 text-primary" />
                    ) : (
                      <FlaskConical className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {module.course?.title ?? module.lab?.title ?? module.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Badge variant="outline" className="text-xs py-0">
                        {t(`modules.type.${module.type}`)}
                      </Badge>
                      {module.estimatedHours > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t('modules.estimatedHours', { hours: module.estimatedHours })}
                        </span>
                      )}
                    </div>
                  </div>
                  {module.isLocked && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      {t('modules.locked')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
