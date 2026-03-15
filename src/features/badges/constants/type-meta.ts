// src/features/badges/constants/type-meta.ts
import {
  Award, Trophy, Layers, Star, FlaskConical, BookOpen,
} from 'lucide-react';

export const BADGE_TYPE_META: Record<
  string,
  { label: string; icon: React.ElementType; colour: string }
> = {
  LAB:     { label: 'Lab',     icon: FlaskConical, colour: 'bg-purple-500/10 text-purple-500' },
  COURSE:  { label: 'Course',  icon: BookOpen,     colour: 'bg-blue-500/10 text-blue-500'    },
  PATH:    { label: 'Path',    icon: Layers,       colour: 'bg-green-500/10 text-green-500'  },
  STREAK:  { label: 'Streak',  icon: Star,         colour: 'bg-orange-500/10 text-orange-500'},
  SPECIAL: { label: 'Special', icon: Trophy,       colour: 'bg-yellow-500/10 text-yellow-500'},
};

export const DEFAULT_BADGE_META = {
  label: 'Other',
  icon: Award,
  colour: 'bg-muted text-muted-foreground',
};

export const BADGE_TYPE_KEYS = Object.keys(BADGE_TYPE_META) as Array<keyof typeof BADGE_TYPE_META>;
