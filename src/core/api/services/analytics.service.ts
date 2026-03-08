import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  AnalyticsOverview,
  GrowthTrends,
  EngagementMetrics,
  TopContent,
  ActivityEvent,
} from '@/core/types';

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const { data } = await apiClient.get<AnalyticsOverview>(
      API_ENDPOINTS.ADMIN_ANALYTICS.OVERVIEW
    );
    return data;
  },

  getGrowth: async (): Promise<GrowthTrends> => {
    const { data } = await apiClient.get<GrowthTrends>(API_ENDPOINTS.ADMIN_ANALYTICS.GROWTH);
    return data;
  },

  getEngagement: async (): Promise<EngagementMetrics> => {
    const { data } = await apiClient.get<EngagementMetrics>(
      API_ENDPOINTS.ADMIN_ANALYTICS.ENGAGEMENT
    );
    return data;
  },

  getTopContent: async (): Promise<TopContent> => {
    const { data } = await apiClient.get<TopContent>(API_ENDPOINTS.ADMIN_ANALYTICS.TOP_CONTENT);
    return data;
  },

  getRecentActivity: async (): Promise<ActivityEvent[]> => {
    const { data } = await apiClient.get<ActivityEvent[]>(
      API_ENDPOINTS.ADMIN_ANALYTICS.RECENT_ACTIVITY
    );
    return data;
  },
};
