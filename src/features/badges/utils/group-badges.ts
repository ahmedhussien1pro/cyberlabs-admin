// src/features/badges/utils/group-badges.ts
import type { BadgeItem } from '@/core/api/services';

export function groupBadgesByType(badges: BadgeItem[]): Record<string, BadgeItem[]> {
  return badges.reduce<Record<string, BadgeItem[]>>((acc, b) => {
    const key = b.type?.toUpperCase() ?? 'OTHER';
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});
}
