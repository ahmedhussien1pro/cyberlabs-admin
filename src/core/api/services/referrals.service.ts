// src/core/api/services/referrals.service.ts
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export interface ReferralLink {
  id: string;
  label: string;
  slug: string;
  source: string;
  targetUserId?: string;
  targetUserName?: string;
  clicks: number;
  registrations: number;
  url: string;
  createdAt: string;
}

export interface ReferralStats {
  totalLinks: number;
  totalClicks: number;
  totalRegistrations: number;
  bySource: { source: string; clicks: number; registrations: number }[];
}

function unwrap<T>(res: any): T {
  const payload = res?.data ?? res;
  return (payload?.data ?? payload) as T;
}

export const referralsService = {
  getAll: async (): Promise<ReferralLink[]> => {
    const res = await apiClient.get(ENDPOINTS.REFERRALS.LIST);
    const payload = unwrap<any>(res);
    return Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
  },

  create: async (data: {
    label: string;
    slug: string;
    source: string;
    targetUserId?: string;
    targetUserName?: string;
  }): Promise<ReferralLink> => {
    const res = await apiClient.post(ENDPOINTS.REFERRALS.CREATE, data);
    return unwrap<ReferralLink>(res);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.REFERRALS.DELETE(id));
  },

  getStats: async (): Promise<ReferralStats> => {
    const res = await apiClient.get(ENDPOINTS.REFERRALS.STATS);
    return unwrap<ReferralStats>(res);
  },
};
