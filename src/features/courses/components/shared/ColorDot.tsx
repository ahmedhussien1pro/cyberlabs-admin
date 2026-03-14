// src/features/courses/components/shared/ColorDot.tsx
// Inline color swatch used inside Select triggers.
import { cn } from '@/lib/utils';

const COLOR_BG: Record<string, string> = {
  EMERALD: 'bg-emerald-500', emerald: 'bg-emerald-500',
  BLUE:    'bg-blue-500',    blue:    'bg-blue-500',
  VIOLET:  'bg-violet-500',  violet:  'bg-violet-500',
  ROSE:    'bg-rose-500',    rose:    'bg-rose-500',
  ORANGE:  'bg-orange-500',  orange:  'bg-orange-500',
  CYAN:    'bg-cyan-500',    cyan:    'bg-cyan-500',
};

export function ColorDot({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3';
  return <span className={cn('rounded-full shrink-0', sz, COLOR_BG[color] ?? 'bg-zinc-500')} />;
}
