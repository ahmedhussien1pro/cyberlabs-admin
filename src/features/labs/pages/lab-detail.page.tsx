import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { labsService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PublishToggle } from '../../courses/components/publish-toggle';
import { FlagAnswerField } from '../components/flag-answer-field';
import { ROUTES } from '@/shared/constants';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import { AlertCircle, ArrowLeft, Edit, Trash2, Clock, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** Safely render solution which may be a string or a structured object */
function SolutionCard({ solution, t }: { solution: unknown; t: (k: string) => string }) {
  if (!solution) return null;

  // Plain string
  if (typeof solution === 'string') {
    return (
      <Card>
        <CardHeader><CardTitle>{t('solutionLabel')}</CardTitle></CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-4 rounded-lg">{solution}</pre>
        </CardContent>
      </Card>
    );
  }

  // Structured object: { fix, steps, context, exploitation, vulnerableCode, ... }
  if (typeof solution === 'object') {
    const obj = solution as Record<string, unknown>;
    const sections = Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (sections.length === 0) return null;

    return (
      <Card>
        <CardHeader><CardTitle>{t('solutionLabel')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {sections.map(([key, value]) => (
            <div key={key}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              {Array.isArray(value) ? (
                <ol className="list-decimal list-inside space-y-1">
                  {(value as unknown[]).map((item, i) => (
                    <li key={i} className="text-sm">{String(item)}</li>
                  ))}
                </ol>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-3 rounded-lg">
                  {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default function LabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t } = useTranslation('labs');
  const { locale } = useLocale();

  const { data: lab, isLoading, error, refetch } = useQuery({
    queryKey: ['labs', 'detail', id],
    queryFn: () => labsService.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => labsService.delete(id!),
    onSuccess: () => {
      toast.success(t('deletedMsg', { title: lab?.title ?? '' }));
      navigate(ROUTES.LABS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('failedStatus'));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('failedLoad')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lab) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('labNotFound')}</AlertDescription>
      </Alert>
    );
  }

  const displayTitle = locale === 'ar' && lab.ar_title ? lab.ar_title : lab.title;
  const displayDescription = locale === 'ar' && lab.ar_description ? lab.ar_description : lab.description;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.LABS)} title={t('backToLabs')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {displayTitle}
            </h1>
            {locale === 'ar' && lab.title && (
              <p className="text-xs text-muted-foreground" dir="ltr">{lab.title}</p>
            )}
            <p className="text-muted-foreground font-mono text-sm">{lab.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PublishToggle id={lab.id} isPublished={lab.isPublished} type="lab" onSuccess={refetch} />
          <Button variant="outline" onClick={() => navigate(ROUTES.LAB_EDIT(id!))}>
            <Edit className="me-2 h-4 w-4" /> {t('edit')}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="me-2 h-4 w-4" /> {t('delete')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lab Info */}
        <Card>
          <CardHeader><CardTitle>{t('labInfo')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">{t('titleLabel')}</div>
              <div className="font-medium">{lab.title}</div>
              {lab.ar_title && (
                <div className="text-sm text-muted-foreground mt-0.5" dir="rtl">{lab.ar_title}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('slugLabel')}</div>
              <div className="font-mono text-sm">{lab.slug}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {lab.difficulty && <Badge>{t(lab.difficulty as any, { defaultValue: lab.difficulty })}</Badge>}
              {lab.category && <Badge variant="outline">{t(lab.category as any, { defaultValue: lab.category })}</Badge>}
              {lab.executionMode && <Badge variant="secondary">{t(lab.executionMode as any, { defaultValue: lab.executionMode })}</Badge>}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('statusLabel')}</div>
              <Badge variant={lab.isPublished ? 'default' : 'secondary'}>
                {lab.isPublished ? t('statusPublished') : t('statusDraft')}
              </Badge>
            </div>
            {displayDescription && (
              <div>
                <div className="text-sm text-muted-foreground">{t('descriptionLabel')}</div>
                <div className="text-sm leading-relaxed" dir={locale === 'ar' && lab.ar_description ? 'rtl' : 'ltr'}>
                  {displayDescription}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader><CardTitle>{t('configuration')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {lab.xpReward != null && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t('xpReward')}</div>
                    <div className="font-semibold">{lab.xpReward}</div>
                  </div>
                </div>
              )}
              {lab.pointsReward != null && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t('points')}</div>
                    <div className="font-semibold">{lab.pointsReward}</div>
                  </div>
                </div>
              )}
              {lab.duration != null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t('duration')}</div>
                    <div className="font-semibold">{lab.duration} min</div>
                  </div>
                </div>
              )}
              {lab.maxAttempts != null && (
                <div>
                  <div className="text-xs text-muted-foreground">{t('maxAttempts')}</div>
                  <div className="font-semibold">{lab.maxAttempts}</div>
                </div>
              )}
              {lab.timeLimit != null && (
                <div>
                  <div className="text-xs text-muted-foreground">{t('timeLimit')}</div>
                  <div className="font-semibold">{lab.timeLimit}s</div>
                </div>
              )}
            </div>
            {lab.skills && lab.skills.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">{t('skills')}</div>
                <div className="flex flex-wrap gap-1">
                  {lab.skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                </div>
              </div>
            )}
            {lab.dockerImage && (
              <div>
                <div className="text-sm text-muted-foreground">{t('dockerImageLabel')}</div>
                <div className="font-mono text-sm break-all">{lab.dockerImage}</div>
              </div>
            )}
            {lab.resources && lab.resources.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t('resourcesLabel')}</div>
                <ul className="space-y-0.5">
                  {lab.resources.map((r, i) => (
                    <li key={i}>
                      <a href={r} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline break-all">{r}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader><CardTitle>{t('statistics')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{lab._count?.submissions ?? 0}</div>
              <div className="text-sm text-muted-foreground">{t('subCount')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{lab._count?.usersProgress ?? 0}</div>
              <div className="text-sm text-muted-foreground">{t('inProgressCount')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{lab._count?.instances ?? 0}</div>
              <div className="text-sm text-muted-foreground">{t('activeInstances')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{lab.hints?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground">{t('hints')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {lab.flagAnswer && <FlagAnswerField flagAnswer={lab.flagAnswer} />}

      <SolutionCard solution={(lab as any).solution} t={t} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle', { title: lab.title })}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
