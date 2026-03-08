import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { TopContent } from '@/core/types';
import { TrendingUp, BookOpen, FlaskConical } from 'lucide-react';

interface TopContentTableProps {
  data?: TopContent;
}

export function TopContentTable({ data }: TopContentTableProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
      case 'INTERMEDIATE':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
      case 'ADVANCED':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Content
        </CardTitle>
        <CardDescription>Most popular courses and labs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top Courses */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Top Courses
            </div>
            <div className="space-y-2">
              {data.courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">{course.title}</div>
                    {course.difficulty && (
                      <Badge variant="outline" className={`mt-1 ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{course.enrollmentCount}</div>
                    <div className="text-xs text-muted-foreground">enrollments</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Labs */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <FlaskConical className="h-4 w-4" />
              Top Labs
            </div>
            <div className="space-y-2">
              {data.labs.slice(0, 5).map((lab) => (
                <div
                  key={lab.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">{lab.title}</div>
                    {lab.difficulty && (
                      <Badge variant="outline" className={`mt-1 ${getDifficultyColor(lab.difficulty)}`}>
                        {lab.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{lab.completions}</div>
                    <div className="text-xs text-muted-foreground">completions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
