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
    return data?.data ?? (data as unknown as BadgeItem[]);
  },
};
