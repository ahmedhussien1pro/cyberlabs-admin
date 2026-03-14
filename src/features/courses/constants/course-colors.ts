// src/features/courses/constants/course-colors.ts
// Single source of truth for all color-keyed maps used across admin cards,
// list rows, MatrixRain, and detail pages.

/** Hex values used by MatrixRain / canvas-based effects */
export const MATRIX_COLOR: Record<string, string> = {
  blue:    '#3b82f6',
  emerald: '#10b981',
  violet:  '#8b5cf6',
  orange:  '#f97316',
  rose:    '#f43f5e',
  cyan:    '#06b6d4',
};

/** Gradient stripe shown behind card thumbnail (fallback bg) */
export const STRIPE: Record<string, string> = {
  blue:    'from-blue-900/60    via-blue-800/30    to-transparent',
  emerald: 'from-emerald-900/60 via-emerald-800/30 to-transparent',
  violet:  'from-violet-900/60  via-violet-800/30  to-transparent',
  orange:  'from-orange-900/60  via-orange-800/30  to-transparent',
  rose:    'from-rose-900/60    via-rose-800/30    to-transparent',
  cyan:    'from-cyan-900/60    via-cyan-800/30    to-transparent',
};

/** Bloom / glow ring behind card on hover */
export const BLOOM: Record<string, string> = {
  blue:    'shadow-blue-500/20',
  emerald: 'shadow-emerald-500/20',
  violet:  'shadow-violet-500/20',
  orange:  'shadow-orange-500/20',
  rose:    'shadow-rose-500/20',
  cyan:    'shadow-cyan-500/20',
};

/** Foreground text color class for each color key */
export const TEXT_COLOR: Record<string, string> = {
  blue:    'text-blue-400',
  emerald: 'text-emerald-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  cyan:    'text-cyan-400',
};

/** Border-based ring on hover */
export const HOVER_RING: Record<string, string> = {
  blue:    'hover:ring-blue-500/30',
  emerald: 'hover:ring-emerald-500/30',
  violet:  'hover:ring-violet-500/30',
  orange:  'hover:ring-orange-500/30',
  rose:    'hover:ring-rose-500/30',
  cyan:    'hover:ring-cyan-500/30',
};

/** Gradient + border fallback background (no thumbnail) */
export const FALLBACK_BG: Record<string, string> = {
  blue:    'from-blue-950    to-blue-900    border-blue-800/60',
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/60',
  violet:  'from-violet-950  to-violet-900  border-violet-800/60',
  orange:  'from-orange-950  to-orange-900  border-orange-800/60',
  rose:    'from-rose-950    to-rose-900    border-rose-800/60',
  cyan:    'from-cyan-950    to-cyan-900    border-cyan-800/60',
};

/** Text color for fallback title inside thumbnail area */
export const FALLBACK_TEXT: Record<string, string> = {
  blue:    'text-blue-300',
  emerald: 'text-emerald-300',
  violet:  'text-violet-300',
  orange:  'text-orange-300',
  rose:    'text-rose-300',
  cyan:    'text-cyan-300',
};

/** Badge classes for access level */
export const ACCESS_BADGE: Record<string, string> = {
  FREE:    'text-zinc-400   border-zinc-500/30   bg-zinc-500/10',
  PRO:     'text-blue-400   border-blue-500/30   bg-blue-500/10',
  PREMIUM: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
};

/** Dot indicator for course state */
export const STATE_DOT: Record<string, string> = {
  PUBLISHED:   'bg-emerald-400',
  DRAFT:       'bg-zinc-400',
  COMING_SOON: 'bg-blue-400',
};

/** Full background pill for state badge */
export const STATE_BADGE: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  DRAFT:       'bg-zinc-500/10    border-zinc-500/30    text-zinc-400',
  COMING_SOON: 'bg-blue-500/10    border-blue-500/30    text-blue-400',
};
