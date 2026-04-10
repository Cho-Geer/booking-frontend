/**
 * Admin API - 运营管理接口
 * 对应 adminSlice.ts
 */
import api from './api';
import { User } from '../types';
import { Pagination, AdminUsersQuery } from '@/types';

const resolvePayload = <T>(response: { data: unknown }): T => {
  return response.data as T;
};

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

export const adminApi = {
  /**
   * 获取用户列表
   * @param query 查询参数
   * @returns 用户列表响应
   */
  async getUsers(query: {}, pagination: Pagination): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await api.get('/users', {
      params: {
        ...query,
        page: pagination.page,
        limit: pagination.limit,
      },
    });
    const payload = resolvePayload<{
      items: User[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }>(response);
    const items = payload.items as User[] || [];
    const total = typeof payload.total === 'number' ? payload.total : items.length;
    const currentPage = typeof payload.page === 'number' ? payload.page : pagination.page;
    const currentLimit = typeof payload.limit === 'number' ? payload.limit : pagination.limit;
    const totalPages = Math.max(1, Math.ceil(total / currentLimit));
    
    return {
      items,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
    };
  },

  /**
   * 获取运营统计
   * @returns 预约统计
   */
  async getStatistics(): Promise<AppointmentStatistics> {
    const response = await api.get('/system/reports/statistics');
    return resolvePayload<AppointmentStatistics>(response);
  },

  /**
   * 获取活动日志
   * @param query 查询参数
   * @returns 活动日志列表
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
   * 获取系统日志
   * @param query 查询参数
   * @returns 系统日志列表
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

  /**
   * 切换用户状态
   * @param id 用户 ID
   * @param status 新的用户状态
   * @returns 更新后的用户信息
   */
  async toggleUserStatus(id: string, status: string) {
    const response = await api.put(`/users/${id}/status`, { status });
    return resolvePayload(response);
  },

  /**
   * 更新用户类型
   * @param id 用户 ID
   * @param userType 新的用户类型
   * @returns 更新后的用户信息
   */
  async updateUserType(id: string, userType: 'CUSTOMER' | 'ADMIN') {
    const response = await api.put(`/users/${id}`, { userType });
    return resolvePayload(response);
  },
};
