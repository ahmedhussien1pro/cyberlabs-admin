import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { labsService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import { useTranslation } from 'react-i18next';
import type { Lab } from '@/core/types';
import { useState } from 'react';

interface LabFormProps {
  initialData?: Partial<Lab>;
  labId?: string;
}

type FormValues = {
  title: string;
  slug?: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  category?: string;
  difficulty?: string;
  executionMode?: string;
  flagAnswer?: string;
  solution?: string;
  xpReward?: number;
  pointsReward?: number;
  duration?: number;
  maxAttempts?: number;
  timeLimit?: number;
  dockerImage?: string;
  // text-area versions for arrays
  skillsText?: string;
  hintsText?: string;
  resourcesText?: string;
};

function arrToText(arr?: string[]): string {
  return arr?.join('\n') ?? '';
}
function textToArr(text?: string): string[] {
  return (text ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
}

export function LabForm({ initialData, labId }: LabFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!labId;
  const [error, setError] = useState('');
  const { t } = useTranslation('labs');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    defaultValues: initialData ? {
      title: initialData.title ?? '',
      slug: initialData.slug ?? '',
      ar_title: initialData.ar_title ?? '',
      description: initialData.description ?? '',
      ar_description: initialData.ar_description ?? '',
      category: initialData.category ?? '',
      difficulty: initialData.difficulty ?? '',
      executionMode: initialData.executionMode ?? '',
      flagAnswer: initialData.flagAnswer ?? '',
      solution: (initialData as any).solution ?? '',
      xpReward: initialData.xpReward,
      pointsReward: initialData.pointsReward,
      duration: initialData.duration,
      maxAttempts: initialData.maxAttempts,
      timeLimit: initialData.timeLimit,
      dockerImage: initialData.dockerImage ?? '',
      skillsText: arrToText(initialData.skills),
      hintsText: arrToText(initialData.hints),
      resourcesText: arrToText(initialData.resources),
    } : {
      skillsText: '', hintsText: '', resourcesText: '',
    },
  });

  const difficulty = watch('difficulty');
  const category = watch('category');
  const executionMode = watch('executionMode');

  const buildPayload = (data: FormValues) => ({
    title: data.title,
    ...(data.slug && !isEditMode ? { slug: data.slug } : {}),
    ar_title: data.ar_title || undefined,
    description: data.description || undefined,
    ar_description: data.ar_description || undefined,
    category: (data.category as any) || undefined,
    difficulty: (data.difficulty as any) || undefined,
    executionMode: (data.executionMode as any) || undefined,
    flagAnswer: data.flagAnswer || undefined,
    solution: data.solution || undefined,
    xpReward: data.xpReward || undefined,
    pointsReward: data.pointsReward || undefined,
    duration: data.duration || undefined,
    maxAttempts: data.maxAttempts || undefined,
    timeLimit: data.timeLimit || undefined,
    dockerImage: data.dockerImage || undefined,
    skills: textToArr(data.skillsText),
    hints: textToArr(data.hintsText),
    resources: textToArr(data.resourcesText),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => labsService.create(payload),
    onSuccess: (data) => {
      toast.success(t('createLab'));
      navigate(ROUTES.LAB_DETAIL(data.id));
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? t('failedSave')),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => labsService.update(labId!, payload),
    onSuccess: (data) => {
      toast.success(t('saveChanges'));
      queryClient.invalidateQueries({ queryKey: ['labs', 'detail', labId] });
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      navigate(ROUTES.LAB_DETAIL(data.id));
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? t('failedSave')),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormValues) => {
    setError('');
    const payload = buildPayload(data);
    if (isEditMode) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Basic Information ───────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>{t('basicInfo')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register('title', { required: t('titleRequired') })} placeholder="SQL Injection Basics" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar_title">{t('arTitleLabelForm')}</Label>
              <Input id="ar_title" {...register('ar_title')} placeholder="أساسيات حقن SQL" dir="rtl" />
            </div>
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register('slug', { pattern: { value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: t('slugHint') } })}
                placeholder="sql-injection-basics"
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Lab description..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ar_description">{t('arDescriptionLabelForm')}</Label>
            <Textarea id="ar_description" {...register('ar_description')} placeholder="وصف المعمل..." rows={3} dir="rtl" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('difficultyLabel')}</Label>
              <Select value={difficulty} onValueChange={(v) => setValue('difficulty', v)}>
                <SelectTrigger><SelectValue placeholder={t('selectDifficulty')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">{t('BEGINNER')}</SelectItem>
                  <SelectItem value="INTERMEDIATE">{t('INTERMEDIATE')}</SelectItem>
                  <SelectItem value="ADVANCED">{t('ADVANCED')}</SelectItem>
                  <SelectItem value="EXPERT">{t('EXPERT')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('categoryLabel')}</Label>
              <Select value={category} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB_SECURITY">{t('WEB_SECURITY')}</SelectItem>
                  <SelectItem value="NETWORK_SECURITY">{t('NETWORK_SECURITY')}</SelectItem>
                  <SelectItem value="CRYPTOGRAPHY">{t('CRYPTOGRAPHY')}</SelectItem>
                  <SelectItem value="FORENSICS">{t('FORENSICS')}</SelectItem>
                  <SelectItem value="REVERSE_ENGINEERING">{t('REVERSE_ENGINEERING')}</SelectItem>
                  <SelectItem value="BINARY_EXPLOITATION">{t('BINARY_EXPLOITATION')}</SelectItem>
                  <SelectItem value="OSINT">{t('OSINT')}</SelectItem>
                  <SelectItem value="MISC">{t('MISC')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('executionModeLabel')}</Label>
              <Select value={executionMode} onValueChange={(v) => setValue('executionMode', v)}>
                <SelectTrigger><SelectValue placeholder={t('selectMode')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRONTEND">{t('FRONTEND')}</SelectItem>
                  <SelectItem value="SHARED_BACKEND">{t('SHARED_BACKEND')}</SelectItem>
                  <SelectItem value="DOCKER">{t('DOCKER')}</SelectItem>
                  <SelectItem value="BROWSER">{t('BROWSER')}</SelectItem>
                  <SelectItem value="STATIC">{t('STATIC')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Configuration ───────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>{t('configSection')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="xpReward">{t('xpRewardLabel')}</Label>
              <Input id="xpReward" type="number" {...register('xpReward', { valueAsNumber: true })} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsReward">{t('pointsRewardLabel')}</Label>
              <Input id="pointsReward" type="number" {...register('pointsReward', { valueAsNumber: true })} placeholder="50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{t('durationLabel')}</Label>
              <Input id="duration" type="number" {...register('duration', { valueAsNumber: true })} placeholder="30" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">{t('maxAttemptsLabel')}</Label>
              <Input id="maxAttempts" type="number" {...register('maxAttempts', { valueAsNumber: true })} placeholder="5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeLimit">{t('timeLimitLabel')}</Label>
              <Input id="timeLimit" type="number" {...register('timeLimit', { valueAsNumber: true })} placeholder="3600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Advanced Metadata ───────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>{t('advancedSection')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skillsText">{t('skillsLabel')}</Label>
            <Textarea
              id="skillsText"
              {...register('skillsText')}
              placeholder={t('skillsPlaceholder')}
              rows={3}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintsText">{t('hintsLabel')}</Label>
            <Textarea
              id="hintsText"
              {...register('hintsText')}
              placeholder={t('hintsPlaceholder')}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resourcesText">{t('resourcesLabel2')}</Label>
            <Textarea
              id="resourcesText"
              {...register('resourcesText')}
              placeholder={t('resourcesPlaceholder')}
              rows={2}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dockerImage">{t('dockerImageLabel2')}</Label>
            <Input
              id="dockerImage"
              {...register('dockerImage')}
              placeholder={t('dockerImagePlaceholder')}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution">{t('solutionLabelForm')}</Label>
            <Textarea
              id="solution"
              {...register('solution')}
              placeholder={t('solutionPlaceholder')}
              rows={5}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Flag Answer ─────────────────────────────────────── */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-400">
            <Shield className="h-5 w-5" />
            {t('flagSection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-amber-500/50">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 dark:text-amber-400">
              {t('flagSecureNote')}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="flagAnswer">{t('flagLabel')}</Label>
            <Input id="flagAnswer" {...register('flagAnswer')} placeholder={t('flagPlaceholder')} className="font-mono" />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(isEditMode ? ROUTES.LAB_DETAIL(labId!) : ROUTES.LABS)}>
          {t('cancelBtn')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isEditMode ? t('saveChanges') : t('createLab')}
        </Button>
      </div>
    </form>
  );
}
