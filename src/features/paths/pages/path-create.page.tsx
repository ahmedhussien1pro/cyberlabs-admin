// src/features/paths/pages/path-create.page.tsx
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pathsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import { PathForm } from '../components/path-form';
import type { PathFormValues } from '../components/path-form';
import type { CreatePathRequest } from '@/core/types/api.types';

function splitCsv(s?: string): string[] {
  if (!s?.trim()) return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function formToRequest(data: PathFormValues): CreatePathRequest {
  return {
    title:              data.title,
    slug:               data.slug,
    ar_title:           data.ar_title || undefined,
    description:        data.description || undefined,
    ar_description:     data.ar_description || undefined,
    longDescription:    data.longDescription || undefined,
    ar_longDescription: data.ar_longDescription || undefined,
    iconName:           (data.iconName as any) || 'shield',
    color:              (data.color as any) || 'BLUE',
    thumbnail:          data.thumbnail || undefined,
    difficulty:         (data.difficulty as any) || 'BEGINNER',
    estimatedHours:     data.estimatedHours || undefined,
    order:              data.order || undefined,
    tags:               splitCsv(data.tags),
    skills:             splitCsv(data.skills),
    prerequisites:      splitCsv(data.prerequisites),
    isPublished:        data.isPublished ?? false,
    isFeatured:         data.isFeatured ?? false,
    isNew:              data.isNew ?? false,
    isComingSoon:       data.isComingSoon ?? false,
  };
}

export default function PathCreatePage() {
  const { t } = useTranslation('paths');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: PathFormValues) => pathsService.create(formToRequest(data)),
    onSuccess: (created) => {
      toast.success(t('messages.createSuccess'));
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
      navigate(ROUTES.PATH_DETAIL(created.id));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create path';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PATHS)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('title')}
        </Button>
        <h1 className="text-2xl font-bold">{t('newPath')}</h1>
      </div>
      <PathForm
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        submitLabel={mutation.isPending ? t('actions.creating') : t('actions.save')}
      />
    </div>
  );
}
