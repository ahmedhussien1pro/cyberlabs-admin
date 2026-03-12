// src/features/courses/constants/course-colors.ts
// Single source of truth for all course color maps.
// All color keys are lowercase (use `color.toLowerCase()` before lookup).

export const FALLBACK_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue:    'from-blue-950    to-blue-900    border-blue-800/50',
  violet:  'from-violet-950  to-violet-900  border-violet-800/50',
  orange:  'from-orange-950  to-orange-900  border-orange-800/50',
  rose:    'from-rose-950    to-rose-900    border-rose-800/50',
  cyan:    'from-cyan-950    to-cyan-900    border-cyan-800/50',
};

export const FALLBACK_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue:    'text-blue-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  cyan:    'text-cyan-400',
};

export const HOVER_RING: Record<string, string> = {
  emerald: 'hover:ring-emerald-500/30',
  blue:    'hover:ring-blue-500/30',
  violet:  'hover:ring-violet-500/30',
  orange:  'hover:ring-orange-500/30',
  rose:    'hover:ring-rose-500/30',
  cyan:    'hover:ring-cyan-500/30',
};

export const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};

export const STATE_DOT: Record<string, string> = {
  PUBLISHED:   'bg-emerald-400',
  DRAFT:       'bg-zinc-400',
  COMING_SOON: 'bg-yellow-400',
};
