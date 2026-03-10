// src/core/api/services/notifications.service.ts
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface BroadcastPayload {
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  sentAt: string;
  recipientCount: number;
  sentBy?: { name: string; email: string };
}

export const notificationsService = {
  broadcast: async (payload: BroadcastPayload): Promise<{ success: boolean; recipientCount: number }> => {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATIONS.BROADCAST, payload);
    return res.data;
  },

  getHistory: async (params?: { page?: number; limit?: number }): Promise<{ data: Notification[]; total: number }> => {
    const res = await apiClient.get(ENDPOINTS.NOTIFICATIONS.HISTORY, { params });
    return res.data;
  },
};
