import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PublishToggle } from '../components/publish-toggle';
import { ROUTES } from '@/shared/constants';
import { AlertCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => coursesService.delete(id!),
    onSuccess: () => {
      toast.success('Course deleted successfully');
      navigate(ROUTES.COURSES);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    },
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load course details.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!course) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Course not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.COURSES)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground">{course.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PublishToggle
            id={course.id}
            isPublished={course.isPublished}
            type="course"
            onSuccess={refetch}
          />
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Course Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Title</div>
              <div className="font-medium">{course.title}</div>
              {course.ar_title && (
                <div className="text-sm text-muted-foreground">{course.ar_title}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Slug</div>
              <div className="font-mono text-sm">{course.slug}</div>
            </div>
            {course.difficulty && (
              <div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
                <Badge>{course.difficulty}</Badge>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {course.description && (
              <div>
                <div className="text-sm text-muted-foreground">Description</div>
                <div className="text-sm">{course.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Enrollments</div>
              <div className="text-2xl font-bold">{course.enrollmentCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Labs</div>
              <div className="text-2xl font-bold">{course._count.courseLabs}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Reviews</div>
              <div className="text-2xl font-bold">{course._count.reviews}</div>
            </div>
            {course.averageRating && (
              <div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
                <div className="text-2xl font-bold">{course.averageRating.toFixed(1)} / 5</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Labs */}
      {course.courseLabs && course.courseLabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Labs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {course.courseLabs.map(({ lab }) => (
                <div key={lab.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{lab.title}</div>
                    <div className="text-sm text-muted-foreground">{lab.slug}</div>
                  </div>
                  {lab.difficulty && <Badge>{lab.difficulty}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
