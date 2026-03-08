import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GrowthTrends } from '@/core/types';

interface GrowthChartProps {
  data: GrowthTrends;
}

/**
 * Pure CSS/HTML growth chart — no external chart library required.
 * Renders the last 12 months of user registrations and enrollments
 * as a simple normalised bar chart.
 */
export function GrowthChart({ data }: GrowthChartProps) {
  // Merge months from both arrays
  const allMonths = Array.from(
    new Set([
      ...data.users.map((d) => d.month),
      ...data.enrollments.map((d) => d.month),
    ])
  ).sort();

  const chartData = allMonths.map((month) => ({
    month,
    users: data.users.find((d) => d.month === month)?.count ?? 0,
    enrollments: data.enrollments.find((d) => d.month === month)?.count ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Growth Trends</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No growth data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.users, d.enrollments)),
    1
  );

  const formatMonth = (m: string) => {
    const [year, month] = m.split('-');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trends (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />
            New Users
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            Enrollments
          </span>
        </div>

        {/* Chart area */}
        <div className="flex items-end gap-1 h-40">
          {chartData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
              {/* Bars */}
              <div className="w-full flex gap-px items-end h-32">
                <div
                  className="flex-1 bg-indigo-500 rounded-t transition-all"
                  style={{ height: `${(d.users / maxValue) * 100}%`, minHeight: d.users > 0 ? '2px' : '0' }}
                  title={`Users: ${d.users}`}
                />
                <div
                  className="flex-1 bg-emerald-500 rounded-t transition-all"
                  style={{ height: `${(d.enrollments / maxValue) * 100}%`, minHeight: d.enrollments > 0 ? '2px' : '0' }}
                  title={`Enrollments: ${d.enrollments}`}
                />
              </div>
              {/* Month label */}
              <span className="text-[9px] text-muted-foreground rotate-45 origin-left mt-1 whitespace-nowrap">
                {formatMonth(d.month)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
