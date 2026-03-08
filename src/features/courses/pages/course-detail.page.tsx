import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Eye, EyeOff, Users, Star,
  BookOpen, Pencil, Trash2, AlertTriangle,
} from 'lucide-react';
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
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ROUTES } from '@/shared/constants';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => coursesService.publish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast.success('Course published successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to publish course');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => coursesService.unpublish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast.success('Course unpublished successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to unpublish course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => coursesService.delete(id!),
    onSuccess: () => {
      toast.success('Course deleted successfully');
      navigate(ROUTES.COURSES);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Cannot delete — course has active enrollments');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={ROUTES.COURSES}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground font-mono text-sm">{course.slug}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Edit Button */}
          <Link to={ROUTES.COURSE_EDIT(id!)}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          {/* Publish / Unpublish */}
          {course.isPublished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unpublishMutation.mutate()}
              disabled={unpublishMutation.isPending}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}

          {/* Delete with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Course
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete{' '}
                  <strong>{course.title}</strong>? This action cannot be undone.
                  {(course._count?.enrollments ?? 0) > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      ⚠ This course has {course._count?.enrollments} active enrollments and cannot be deleted.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending || (course._count?.enrollments ?? 0) > 0}
                >
                  Delete Course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.state ?? (course.isPublished ? 'Published' : 'Draft')}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>
            {course.ar_title && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Arabic Title</p>
                <div className="text-sm" dir="rtl">{course.ar_title}</div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <div className="font-mono text-sm">{course.slug}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <div className="text-sm">
                {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <div className="text-sm">
                {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
              </div>
            </div>
            {course.instructor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instructor</p>
                <div className="text-sm">{course.instructor.name}</div>
              </div>
            )}
          </div>
          {course.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{course.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Enrollments</p>
            </div>
            <div className="text-2xl font-bold">
              {course.enrollmentCount ?? course._count?.enrollments ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Sections</p>
            </div>
            <div className="text-2xl font-bold">
              {/* sections is the correct field — courseLabs/labs removed */}
              {course._count?.sections ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Lessons</p>
            </div>
            <div className="text-2xl font-bold">
              {course._count?.lessons ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Reviews</p>
            </div>
            <div className="text-2xl font-bold">
              {course._count?.reviews ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
