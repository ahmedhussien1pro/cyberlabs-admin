import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Users,
  Star,
  FlaskConical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ROUTES } from '@/shared/constants';
import { useNavigate } from 'react-router-dom';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesService.getById(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => coursesService.publish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course published successfully');
    },
    onError: () => {
      toast.error('Failed to publish course');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => coursesService.unpublish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course unpublished successfully');
    },
    onError: () => {
      toast.error('Failed to unpublish course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => coursesService.delete(id!),
    onSuccess: () => {
      toast.success('Course deleted successfully');
      navigate(ROUTES.COURSES);
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-12 w-64' />
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (!course) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground'>Course not found</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Link to={ROUTES.COURSES}>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Button>
            </Link>
            <h1 className='text-3xl font-bold tracking-tight'>
              {course.title}
            </h1>
            <p className='text-muted-foreground'>{course.slug}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Pencil className='h-4 w-4 mr-2' />
            Edit
          </Button>
          {course.isPublished ? (
            <Button
              variant='outline'
              size='sm'
              onClick={() => unpublishMutation.mutate()}
              disabled={unpublishMutation.isPending}>
              <EyeOff className='h-4 w-4 mr-2' />
              Unpublish
            </Button>
          ) : (
            <Button
              size='sm'
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}>
              <Eye className='h-4 w-4 mr-2' />
              Publish
            </Button>
          )}
          <Button
            variant='destructive'
            size='sm'
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}>
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Status
              </p>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Difficulty
              </p>
              <Badge variant='outline'>{course.difficulty}</Badge>
            </div>
            {course.ar_title && (
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Arabic Title
                </p>
                <div className='text-sm text-muted-foreground'>
                  {course.ar_title}
                </div>
              </div>
            )}
            <div>
              <p className='text-sm font-medium text-muted-foreground'>Slug</p>
              <div className='font-mono text-sm'>{course.slug}</div>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Created
              </p>
              <div className='text-sm'>
                {formatDistanceToNow(new Date(course.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Last Updated
              </p>
              <div className='text-sm'>
                {formatDistanceToNow(new Date(course.updatedAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>
              Description
            </p>
            <p className='text-sm'>{course.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <p className='text-sm font-medium text-muted-foreground'>
                Enrollments
              </p>
            </div>
            <div className='text-2xl font-bold'>
              {course.enrollmentCount ?? course._count?.enrollments ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <FlaskConical className='h-4 w-4 text-muted-foreground' />
              <p className='text-sm font-medium text-muted-foreground'>Labs</p>
            </div>
            <div className='text-2xl font-bold'>
              {course._count?.courseLabs ?? course._count?.labs ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 text-muted-foreground' />
              <p className='text-sm font-medium text-muted-foreground'>
                Reviews
              </p>
            </div>
            <div className='text-2xl font-bold'>
              {course._count?.reviews ?? 0}
            </div>
          </CardContent>
        </Card>
        {course.averageRating && (
          <Card>
            <CardContent className='p-6'>
              <p className='text-sm font-medium text-muted-foreground'>
                Average Rating
              </p>
              <div className='text-2xl font-bold'>
                {course.averageRating.toFixed(1)} / 5
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
