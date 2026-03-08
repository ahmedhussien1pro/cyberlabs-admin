import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { labsService } from '@/core/api/services';
import { LabForm } from '../components/lab-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function LabEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: lab,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lab', id],
    queryFn: () => labsService.getById(id!),
    enabled: !!id,
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate(ROUTES.LAB_DETAIL(id!))}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Edit Lab</h1>
          <p className='text-muted-foreground'>
            {lab?.title ?? 'Loading lab...'}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className='space-y-4'>
          <Skeleton className='h-48' />
          <Skeleton className='h-48' />
        </div>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Failed to load lab data. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {lab && <LabForm initialData={lab} labId={id} />}
    </div>
  );
}
