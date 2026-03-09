import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GrowthTrends } from '@/core/types';

interface GrowthChartProps {
  data: GrowthTrends;
}

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

function fmtMonth(m: string): string {
  const [year, month] = m.split('-');
  return `${MONTHS[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

export function GrowthChart({ data }: GrowthChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const allMonths = Array.from(
    new Set([
      ...data.users.map((d) => d.month),
      ...data.enrollments.map((d) => d.month),
    ]),
  ).sort();

  const chartData = allMonths.map((month) => ({
    month,
    users:       data.users.find((d) => d.month === month)?.count ?? 0,
    enrollments: data.enrollments.find((d) => d.month === month)?.count ?? 0,
  }));

  if (!chartData.length) {
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

  // SVG dimensions
  const W = 600;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const n = chartData.length;

  const maxVal = Math.max(
    ...chartData.flatMap((d) => [d.users, d.enrollments]),
    1,
  );

  const xOf = (i: number) =>
    PAD.left + (n > 1 ? (i / (n - 1)) * iW : iW / 2);
  const yOf = (v: number) => PAD.top + iH - (v / maxVal) * iH;

  const ptStr = (k: 'users' | 'enrollments') =>
    chartData.map((d, i) => `${xOf(i)},${yOf(d[k])}`).join(' ');

  const areaStr = (k: 'users' | 'enrollments') =>
    `${xOf(0)},${PAD.top + iH} ${ptStr(k)} ${xOf(n - 1)},${PAD.top + iH}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) =>
    Math.round(p * maxVal),
  );

  const hovered = hoveredIdx !== null ? chartData[hoveredIdx] : null;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <CardTitle>Growth Trends (Last 12 Months)</CardTitle>
          <div className='flex gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <span className='inline-block h-2 w-4 rounded-full bg-indigo-500' />
              New Users
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='inline-block h-2 w-4 rounded-full bg-emerald-500' />
              Enrollments
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='relative select-none'>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className='w-full h-auto overflow-visible'
          >
            {/* Horizontal grid lines + Y-axis labels */}
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  y1={yOf(t)}
                  x2={PAD.left + iW}
                  y2={yOf(t)}
                  stroke='currentColor'
                  strokeOpacity='0.06'
                  strokeWidth='1'
                />
                <text
                  x={PAD.left - 8}
                  y={yOf(t) + 4}
                  textAnchor='end'
                  fontSize='9'
                  fill='currentColor'
                  opacity='0.4'
                >
                  {t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}
                </text>
              </g>
            ))}

            {/* Area fills */}
            <polygon
              points={areaStr('enrollments')}
              fill='#10b981'
              fillOpacity='0.08'
            />
            <polygon
              points={areaStr('users')}
              fill='#6366f1'
              fillOpacity='0.08'
            />

            {/* Lines */}
            <polyline
              points={ptStr('enrollments')}
              fill='none'
              stroke='#10b981'
              strokeWidth='2.5'
              strokeLinejoin='round'
              strokeLinecap='round'
            />
            <polyline
              points={ptStr('users')}
              fill='none'
              stroke='#6366f1'
              strokeWidth='2.5'
              strokeLinejoin='round'
              strokeLinecap='round'
            />

            {/* Hover vertical guide */}
            {hoveredIdx !== null && (
              <line
                x1={xOf(hoveredIdx)}
                y1={PAD.top}
                x2={xOf(hoveredIdx)}
                y2={PAD.top + iH}
                stroke='currentColor'
                strokeOpacity='0.2'
                strokeWidth='1'
                strokeDasharray='3 2'
              />
            )}

            {/* Data points + invisible wide hit-areas */}
            {chartData.map((d, i) => (
              <g key={d.month}>
                {/* Users dot */}
                <circle
                  cx={xOf(i)}
                  cy={yOf(d.users)}
                  r={hoveredIdx === i ? 5 : 3}
                  fill='#6366f1'
                  className='transition-all duration-100'
                />
                {/* Enrollments dot */}
                <circle
                  cx={xOf(i)}
                  cy={yOf(d.enrollments)}
                  r={hoveredIdx === i ? 5 : 3}
                  fill='#10b981'
                  className='transition-all duration-100'
                />
                {/* Wide transparent hover target */}
                <rect
                  x={xOf(i) - 16}
                  y={PAD.top}
                  width={32}
                  height={iH}
                  fill='transparent'
                  className='cursor-crosshair'
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            ))}

            {/* X-axis month labels */}
            {chartData.map((d, i) => {
              if (n > 8 && i % 2 !== 0) return null;
              return (
                <text
                  key={d.month}
                  x={xOf(i)}
                  y={H - 4}
                  textAnchor='middle'
                  fontSize='9'
                  fill='currentColor'
                  opacity='0.45'
                >
                  {fmtMonth(d.month)}
                </text>
              );
            })}
          </svg>

          {/* Floating tooltip */}
          {hovered !== null && hoveredIdx !== null && (
            <div
              className={
                'absolute top-2 pointer-events-none z-10 ' +
                'bg-popover border rounded-lg shadow-lg px-3 py-2 text-xs min-w-[130px]'
              }
              style={{
                left: `${(xOf(hoveredIdx) / W) * 100}%`,
                transform:
                  hoveredIdx > n / 2
                    ? 'translateX(-115%)'
                    : 'translateX(8px)',
              }}
            >
              <p className='font-semibold mb-2 text-foreground'>
                {fmtMonth(hovered.month)}
              </p>
              <div className='space-y-1'>
                <div className='flex justify-between gap-4'>
                  <span className='flex items-center gap-1'>
                    <span className='inline-block h-2 w-2 rounded-full bg-indigo-500' />
                    <span className='text-muted-foreground'>Users</span>
                  </span>
                  <span className='font-bold text-foreground'>
                    {hovered.users.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between gap-4'>
                  <span className='flex items-center gap-1'>
                    <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
                    <span className='text-muted-foreground'>Enrollments</span>
                  </span>
                  <span className='font-bold text-foreground'>
                    {hovered.enrollments.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
