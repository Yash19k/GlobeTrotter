import apiClient from './api';
import type { AnalyticsSummaryResponse } from '@/types';

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummaryResponse> => {
    const { data } = await apiClient.get<AnalyticsSummaryResponse>('/analytics/summary/');
    return data;
  },
};
