import { useNavigate } from 'react-router-dom';
import { LabForm } from '../components/lab-form';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft } from 'lucide-react';

export default function LabCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.LABS)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Lab</h1>
          <p className="text-muted-foreground">Add a new lab to the platform</p>
        </div>
      </div>

      <LabForm />
    </div>
  );
}
