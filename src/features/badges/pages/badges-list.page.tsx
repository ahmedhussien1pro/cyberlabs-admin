import { useQuery } from '@tanstack/react-query';
import { badgesService } from '@/core/api/services';
import type { BadgeItem } from '@/core/api/services';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Award,
  Trophy,
  Zap,
  Star,
  FlaskConical,
  BookOpen,
  AlertCircle,
  Layers,
} from 'lucide-react';

// ── Badge type → accent colour ────────────────────────────────────────
const TYPE_META: Record<
  string,
  { label: string; icon: React.ElementType; colour: string }
> = {
  LAB: {
    label: 'Lab',
    icon: FlaskConical,
    colour: 'bg-purple-500/10 text-purple-500',
  },
  COURSE: {
    label: 'Course',
    icon: BookOpen,
    colour: 'bg-blue-500/10 text-blue-500',
  },
  PATH: {
    label: 'Path',
    icon: Layers,
    colour: 'bg-green-500/10 text-green-500',
  },
  STREAK: {
    label: 'Streak',
    icon: Star,
    colour: 'bg-orange-500/10 text-orange-500',
  },
  SPECIAL: {
    label: 'Special',
    icon: Trophy,
    colour: 'bg-yellow-500/10 text-yellow-500',
  },
};

const DEFAULT_META = {
  label: 'Other',
  icon: Award,
  colour: 'bg-muted text-muted-foreground',
};

// ── Badge card ────────────────────────────────────────────────────────
function BadgeCard({ badge }: { badge: BadgeItem }) {
  const meta = TYPE_META[badge.type?.toUpperCase()] ?? DEFAULT_META;
  const Icon = meta.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      <div className={`h-1 w-full ${meta.colour.split(' ')[0]}`} />
      <CardContent className="pt-5 pb-4">
        <div className="flex flex-col items-center text-center gap-3">
          {/* Icon circle */}
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center ${meta.colour.replace('text-', 'text-').split(' ').join(' ')}`}
          >
            {badge.imageUrl ? (
              <img
                src={badge.imageUrl}
                alt={badge.title}
                className="h-9 w-9 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Icon className="h-7 w-7" />
            )}
          </div>

          {/* Title */}
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm leading-tight">{badge.title}</h3>
            {badge.ar_title && (
              <p className="text-xs text-muted-foreground" dir="rtl">
                {badge.ar_title}
              </p>
            )}
            {badge.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {badge.description}
              </p>
            )}
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {badge.xpReward > 0 && (
              <Badge variant="secondary" className="text-xs gap-1 px-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                {badge.xpReward} XP
              </Badge>
            )}
            {badge.pointsReward > 0 && (
              <Badge variant="outline" className="text-xs gap-1 px-2">
                <Star className="h-3 w-3 text-blue-500" />
                {badge.pointsReward} pts
              </Badge>
            )}
          </div>

          {/* Type tag */}
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-wide font-medium ${meta.colour}`}
          >
            {meta.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function BadgesListPage() {
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: badgesService.getAll,
    staleTime: 1000 * 60 * 10,
  });

  // Group by type
  const grouped = badges
    ? badges.reduce<Record<string, BadgeItem[]>>((acc, b) => {
        const key = b.type?.toUpperCase() ?? 'OTHER';
        if (!acc[key]) acc[key] = [];
        acc[key].push(b);
        return acc;
      }, {})
    : {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
          <p className="text-muted-foreground mt-1">
            Platform achievement badges catalog
          </p>
        </div>
        {badges && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Award className="h-3.5 w-3.5 mr-1" />
            {badges.length} badges
          </Badge>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load badges. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Empty */}
      {!isLoading && !error && badges?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Trophy className="h-14 w-14 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No badges configured yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Badges are awarded automatically based on user activity.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grouped sections */}
      {!isLoading &&
        !error &&
        Object.entries(grouped).map(([type, items]) => {
          const meta = TYPE_META[type] ?? DEFAULT_META;
          const Icon = meta.icon;
          return (
            <section key={type} className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{meta.label} Badges</h2>
                <Badge variant="outline" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
