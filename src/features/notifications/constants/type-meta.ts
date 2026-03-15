// src/features/notifications/constants/type-meta.ts
import { Info, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export const TYPE_KEYS = ['INFO', 'SUCCESS', 'WARNING', 'ALERT'] as const;
export type NotifType = (typeof TYPE_KEYS)[number];

export const TYPE_META: Record<
  NotifType,
  { icon: React.ElementType; color: string; iconColor: string; bg: string }
> = {
  INFO: {
    icon: Info,
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    iconColor: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  SUCCESS: {
    icon: CheckCircle2,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    iconColor: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  ALERT: {
    icon: Zap,
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    iconColor: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
};
