import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TopContent } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';

interface TopContentTableProps {
  data?: TopContent;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case 'BEGINNER':
      return 'text-green-600';
    case 'INTERMEDIATE':
      return 'text-yellow-600';
    case 'ADVANCED':
      return 'text-orange-600';
    case 'EXPERT':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export function TopContentTable({ data }: TopContentTableProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Courses */}
        {data.courses && data.courses.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium">Most Enrolled Courses</h3>
            <div className="space-y-3">
              {data.courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{course.title}</p>
                    {course.difficulty && (
                      <Badge variant="outline" className={`mt-1 ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{course.enrollments}</div>
                    <div className="text-xs text-muted-foreground">enrollments</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Labs */}
        {data.labs && data.labs.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium">Most Attempted Labs</h3>
            <div className="space-y-3">
              {data.labs.slice(0, 5).map((lab) => (
                <div key={lab.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{lab.title}</p>
                    {lab.difficulty && (
                      <Badge variant="outline" className={`mt-1 ${getDifficultyColor(lab.difficulty)}`}>
                        {lab.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{lab.attempts}</div>
                    <div className="text-xs text-muted-foreground">attempts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
