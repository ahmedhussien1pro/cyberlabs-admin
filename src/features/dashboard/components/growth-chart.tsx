import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { GrowthTrends } from '@/core/types';

interface GrowthChartProps {
  data: GrowthTrends;
}

export function GrowthChart({ data }: GrowthChartProps) {
  // Merge users and enrollments arrays into a single chart dataset keyed by month
  const allMonths = Array.from(
    new Set([
      ...data.users.map((d) => d.month),
      ...data.enrollments.map((d) => d.month),
    ]),
  ).sort();

  const chartData = allMonths.map((month) => ({
    month,
    users: data.users.find((d) => d.month === month)?.count ?? 0,
    enrollments: data.enrollments.find((d) => d.month === month)?.count ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground text-center py-8'>
            No growth data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trends (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='month'
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => {
                const [year, month] = v.split('-');
                return `${month}/${year.slice(2)}`;
              }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip labelFormatter={(label) => `Month: ${label}`} />
            <Legend />
            <Line
              type='monotone'
              dataKey='users'
              stroke='#6366f1'
              strokeWidth={2}
              dot={false}
              name='New Users'
            />
            <Line
              type='monotone'
              dataKey='enrollments'
              stroke='#22c55e'
              strokeWidth={2}
              dot={false}
              name='Enrollments'
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
