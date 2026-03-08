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
import type { CreatePathRequest } from '@/core/types/api.types';

export default function PathCreatePage() {
  const { t } = useTranslation('paths');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePathRequest) => pathsService.create(data),
    onSuccess: (created) => {
      toast.success(t('messages.createSuccess'));
      queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all });
      navigate(ROUTES.PATH_DETAIL(created.id));
    },
    onError: () => toast.error('Failed to create path'),
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
        onSubmit={(data) => mutation.mutate(data as CreatePathRequest)}
        isSubmitting={mutation.isPending}
        submitLabel={mutation.isPending ? t('actions.creating') : t('actions.save')}
      />
    </div>
  );
}
