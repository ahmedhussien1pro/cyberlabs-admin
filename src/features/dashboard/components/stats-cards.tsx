import { StatsCard } from './stats-card';
import type { UserStats, CourseStats, LabStats } from '@/core/types';
import { Users, BookOpen, FlaskConical, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  userStats?: UserStats;
  courseStats?: CourseStats;
  labStats?: LabStats;
  isLoading: boolean;
}

export function StatsCards({
  userStats,
  courseStats,
  isLoading,
}: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={userStats?.total ?? 0}
        icon={Users}
      />
      <StatsCard
        title="Active Users"
        value={userStats?.active ?? 0}
        icon={TrendingUp}
      />
      <StatsCard
        title="Total Courses"
        value={courseStats?.total ?? 0}
        icon={BookOpen}
      />
      <StatsCard
        title="Published Courses"
        value={courseStats?.published ?? 0}
        icon={FlaskConical}
      />
    </div>
  );
}
