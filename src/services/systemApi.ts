/**
 * System API - システム管理インターフェース
 * 対応: adminSlice.ts
 */
import api from './api';

const resolvePayload = <T>(response: { data: unknown }): T => {
  const payload = response.data as { data?: T };
  return payload.data as T;
};

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AppointmentStatistics {
  today: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  week: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  month: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  servicePopularity: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
  }>;
  revenue: {
    today: number;
    week: number;
    month: number;
  };
}

export const systemApi = {
  /**
   * 運営統計を取得
   * @returns 予約統計データ
   */
  async getStatistics(): Promise<AppointmentStatistics> {
    const response = await api.get('/system/reports/statistics');
    return resolvePayload<AppointmentStatistics>(response);
  },

  /**
   * アクティビティログを取得
   * @param query クエリパラメータ
   * @returns アクティビティログリスト
   */
  async getActivityLogs(query?: { page?: number; limit?: number }): Promise<{
    items: ActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await api.get('/system/logs/activity', { params: query });
    const payload = resolvePayload<{
      items: ActivityLog[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }>(response);

    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: payload.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    }

    return {
      items: payload.items || [],
      total: payload.total || 0,
      page: payload.page || 1,
      limit: payload.limit || 10,
      totalPages: payload.totalPages || Math.ceil((payload.total || 0) / (payload.limit || 10)),
    };
  },

  /**
   * システムログを取得
   * @param query クエリパラメータ
   * @returns システムログリスト
   */
  async getSystemLogs(query?: { page?: number; limit?: number; level?: string }): Promise<{
    items: SystemLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await api.get('/system/logs', { params: query });
    const payload = resolvePayload<{
      items: SystemLog[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }>(response);

    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: payload.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    }

    return {
      items: payload.items || [],
      total: payload.total || 0,
      page: payload.page || 1,
      limit: payload.limit || 10,
      totalPages: payload.totalPages || Math.ceil((payload.total || 0) / (payload.limit || 10)),
    };
  },
};