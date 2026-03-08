import { useNavigate } from 'react-router-dom';
import { CourseForm } from '../components/course-form';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft } from 'lucide-react';

export default function CourseCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
          <p className="text-muted-foreground">Add a new course to the platform</p>
        </div>
      </div>

      <CourseForm />
    </div>
  );
}
