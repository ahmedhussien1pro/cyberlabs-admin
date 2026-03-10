// src/core/api/services/badges.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface BadgeItem {
  id: string;
  code: string;
  title: string;
  ar_title?: string;
  type: string;
  xpReward: number;
  pointsReward: number;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}

export const badgesService = {
  getAll: async (): Promise<BadgeItem[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: BadgeItem[] }>(
      API_ENDPOINTS.BADGES.LIST,
    );
    // handle { data: [...] } or [...] directly
    return (data as any)?.data ?? (data as unknown as BadgeItem[]);
  },
};
