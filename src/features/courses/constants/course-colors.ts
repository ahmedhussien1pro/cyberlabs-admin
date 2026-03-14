// src/features/courses/constants/course-colors.ts
// Single source of truth for ALL course color maps.
// All color keys are LOWERCASE — use `color.toLowerCase()` before lookup.

// ── Hero / MatrixRain hex colors ────────────────────────────────────────────
export const MATRIX_COLOR: Record<string, string> = {
  emerald: '#10b981',
  blue:    '#3b82f6',
  violet:  '#8b5cf6',
  rose:    '#f43f5e',
  orange:  '#f97316',
  cyan:    '#06b6d4',
};

// ── Top stripe (3-px border) ────────────────────────────────────────────────
export const STRIPE: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  violet:  'bg-violet-500',
  rose:    'bg-rose-500',
  orange:  'bg-orange-500',
  cyan:    'bg-cyan-500',
};

// ── Bloom glow blob ─────────────────────────────────────────────────────────
export const BLOOM: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  violet:  'bg-violet-500',
  rose:    'bg-rose-500',
  orange:  'bg-orange-500',
  cyan:    'bg-cyan-500',
};

// ── Icon / text color ───────────────────────────────────────────────────────
export const TEXT_COLOR: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue:    'text-blue-400',
  violet:  'text-violet-400',
  rose:    'text-rose-400',
  orange:  'text-orange-400',
  cyan:    'text-cyan-400',
};

// ── Fallback card thumbnail bg gradient ─────────────────────────────────────
export const FALLBACK_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue:    'from-blue-950    to-blue-900    border-blue-800/50',
  violet:  'from-violet-950  to-violet-900  border-violet-800/50',
  orange:  'from-orange-950  to-orange-900  border-orange-800/50',
  rose:    'from-rose-950    to-rose-900    border-rose-800/50',
  cyan:    'from-cyan-950    to-cyan-900    border-cyan-800/50',
};

// ── Fallback text color ─────────────────────────────────────────────────────
export const FALLBACK_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue:    'text-blue-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  cyan:    'text-cyan-400',
};

// ── Card hover ring ─────────────────────────────────────────────────────────
export const HOVER_RING: Record<string, string> = {
  emerald: 'hover:ring-emerald-500/30',
  blue:    'hover:ring-blue-500/30',
  violet:  'hover:ring-violet-500/30',
  orange:  'hover:ring-orange-500/30',
  rose:    'hover:ring-rose-500/30',
  cyan:    'hover:ring-cyan-500/30',
};

// ── Access badge styling ────────────────────────────────────────────────────
export const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};

// ── State dot colors ────────────────────────────────────────────────────────
export const STATE_DOT: Record<string, string> = {
  PUBLISHED:   'bg-emerald-400',
  DRAFT:       'bg-zinc-400',
  COMING_SOON: 'bg-yellow-400',
};
