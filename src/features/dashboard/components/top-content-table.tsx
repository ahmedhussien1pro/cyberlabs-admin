import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, FlaskConical } from 'lucide-react';
import type { TopContent } from '@/core/types';

interface TopContentTableProps {
  data?: TopContent;
}

function diffColor(d?: string): string {
  switch ((d ?? '').toUpperCase()) {
    case 'BEGINNER':     return 'text-green-600  border-green-200  dark:border-green-800';
    case 'INTERMEDIATE': return 'text-yellow-600 border-yellow-200 dark:border-yellow-800';
    case 'ADVANCED':     return 'text-orange-600 border-orange-200 dark:border-orange-800';
    case 'EXPERT':       return 'text-red-600    border-red-200    dark:border-red-800';
    default:             return 'text-muted-foreground';
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
          <Skeleton className='h-64' />
        </CardContent>
      </Card>
    );
  }

  const maxEnroll = Math.max(
    ...(data.courses?.map((c) => c.enrollmentCount) ?? [1]),
    1,
  );
  const maxCompl = Math.max(
    ...(data.labs?.map((l) => l.completions) ?? [1]),
    1,
  );

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle>Top Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='courses'>
          <TabsList className='w-full mb-4'>
            <TabsTrigger value='courses' className='flex-1 gap-2'>
              <BookOpen className='h-3.5 w-3.5' />
              Courses
            </TabsTrigger>
            <TabsTrigger value='labs' className='flex-1 gap-2'>
              <FlaskConical className='h-3.5 w-3.5' />
              Labs
            </TabsTrigger>
          </TabsList>

          {/* ── Courses Tab ── */}
          <TabsContent value='courses' className='mt-0 space-y-3'>
            {data.courses?.length === 0 && (
              <p className='text-sm text-muted-foreground text-center py-6'>
                No course data yet
              </p>
            )}
            {data.courses?.slice(0, 8).map((course, idx) => (
              <div key={course.id}>
                <div className='flex items-center justify-between mb-1 gap-2'>
                  <div className='flex items-center gap-2 min-w-0 flex-1'>
                    <span className='text-xs font-bold text-muted-foreground w-5 shrink-0'>
                      #{idx + 1}
                    </span>
                    <span className='text-sm font-medium truncate'>
                      {course.title}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    {course.difficulty && (
                      <Badge
                        variant='outline'
                        className={`text-[10px] px-1.5 py-0 ${
                          diffColor(course.difficulty)
                        }`}
                      >
                        {course.difficulty}
                      </Badge>
                    )}
                    <span className='text-sm font-bold tabular-nums'>
                      {course.enrollmentCount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-indigo-500 rounded-full transition-all duration-500'
                    style={{
                      width: `${(course.enrollmentCount / maxEnroll) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ── Labs Tab ── */}
          <TabsContent value='labs' className='mt-0 space-y-3'>
            {data.labs?.length === 0 && (
              <p className='text-sm text-muted-foreground text-center py-6'>
                No lab data yet
              </p>
            )}
            {data.labs?.slice(0, 8).map((lab, idx) => (
              <div key={lab.id}>
                <div className='flex items-center justify-between mb-1 gap-2'>
                  <div className='flex items-center gap-2 min-w-0 flex-1'>
                    <span className='text-xs font-bold text-muted-foreground w-5 shrink-0'>
                      #{idx + 1}
                    </span>
                    <span className='text-sm font-medium truncate'>
                      {lab.title}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    {lab.difficulty && (
                      <Badge
                        variant='outline'
                        className={`text-[10px] px-1.5 py-0 ${
                          diffColor(lab.difficulty)
                        }`}
                      >
                        {lab.difficulty}
                      </Badge>
                    )}
                    <span className='text-sm font-bold tabular-nums'>
                      {lab.completions.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                    style={{
                      width: `${(lab.completions / maxCompl) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
