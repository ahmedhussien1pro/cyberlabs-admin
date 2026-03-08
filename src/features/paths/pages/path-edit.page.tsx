import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pathsService } from '@/core/api/services';
import { ROUTES } from '@/shared/constants';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import { PathForm } from '../components/path-form';
import type { UpdatePathRequest } from '@/core/types/api.types';

export default function PathEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('paths');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: path, isLoading } = useQuery({
    queryKey: PATHS_QUERY_KEYS.detail(id!),
    queryFn: () => pathsService.getById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdatePathRequest) => pathsService.update(id!, data),
    onSuccess: () => {
      toast.success(t('messages.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
      navigate(ROUTES.PATH_DETAIL(id!));
    },
    onError: () => toast.error('Failed to update path'),
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PATH_DETAIL(id!))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('pathDetails')}
        </Button>
        <h1 className="text-2xl font-bold">{t('editPath')}</h1>
      </div>
      <PathForm
        defaultValues={{
          title: path.title,
          ar_title: path.ar_title,
          slug: path.slug,
          description: path.description,
          ar_description: path.ar_description,
          thumbnail: path.thumbnail,
          isPublished: path.isPublished,
        }}
        onSubmit={(data) => mutation.mutate(data as UpdatePathRequest)}
        isSubmitting={mutation.isPending}
        submitLabel={mutation.isPending ? t('actions.saving') : t('actions.save')}
      />
    </div>
  );
}
