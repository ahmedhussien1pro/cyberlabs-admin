// src/core/api/services/notifications.service.ts
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface BroadcastPayload {
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  /** If provided, send only to this user. If omitted, broadcast to all. */
  userId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  sentAt: string;
  recipientCount: number;
  sentBy?: { name: string; email: string };
  targetUser?: { id: string; name: string; email: string } | null;
}

export const notificationsService = {
  broadcast: async (
    payload: BroadcastPayload,
  ): Promise<{ success: boolean; recipientCount: number }> => {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATIONS.BROADCAST, payload);
    return res.data?.data ?? res.data;
  },

  getHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Notification[]; total: number }> => {
    const res = await apiClient.get(ENDPOINTS.NOTIFICATIONS.HISTORY, { params });
    const payload = res.data?.data ?? res.data;
    if (Array.isArray(payload)) return { data: payload, total: payload.length };
    return payload;
  },
};
