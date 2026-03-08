import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FlaskConical, TrendingUp, Award, Zap } from 'lucide-react';
import type { AnalyticsOverview, UserStats, CourseStats, LabStats } from '@/core/types';

interface StatsCardsProps {
  overview?: AnalyticsOverview;
  userStats?: UserStats;
  courseStats?: CourseStats;
  labStats?: LabStats;
}

export function StatsCards({ overview, userStats, courseStats, labStats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: overview?.users ?? 0,
      subtitle: `${userStats?.activeToday ?? 0} active today`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Courses',
      value: overview?.courses ?? 0,
      subtitle: `${courseStats?.published ?? 0} published`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Labs',
      value: overview?.labs ?? 0,
      subtitle: `${overview?.labCompletions ?? 0} completions`,
      icon: FlaskConical,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Total XP Earned',
      value: (overview?.totalXP ?? 0).toLocaleString(),
      subtitle: `${(overview?.totalPoints ?? 0).toLocaleString()} points`,
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
