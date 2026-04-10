/**
 * Notification API - 通知管理接口
 * 对应 notificationSlice.ts
 */
import api from './api';
import { NotificationQuery } from '@/types';
 
const resolvePayload = <T>(response: { data: unknown }): T => {
  return response.data as T;
};

export interface Notification {
  id: string;
  userId: string;
  appointmentId: string | null;
  type: 'SMS' | 'EMAIL' | 'WECHAT' | 'PUSH';
  title: string;
  content: string;
  isRead: boolean;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  scheduledFor: string | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse{
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendNotificationPayload {
  userId?: string;
  type: 'SMS' | 'EMAIL' | 'WECHAT' | 'PUSH';
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
  scheduledAt?: string;
}

export interface BroadcastPayload {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
}

export const notificationApi = {
  /**
   * 获取通知列表
   * @param query 查询参数
   * @returns 通知列表
   */
  async getNotifications(query: NotificationQuery = {}): Promise<NotificationListResponse> {
    const response = await api.get('/notifications', { params: query });
    return response.data.data || response.data;
  },

  /**
   * 获取未读通知数量
   * @returns 未读数量
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    const data = resolvePayload<{ count: number }>(response);
    return data.count || 0;
  },

  /**
   * 标记通知为已读
   * @param id 通知ID
   * @returns 标记结果
   */
  async markAsRead(id: string): Promise<{ success: boolean }> {
    const response = await api.put(`/notifications/${id}/read`);
    return resolvePayload<{ success: boolean }>(response);
  },

  /**
   * 标记所有通知为已读
   * @returns 标记结果
   */
  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.put('/notifications/read-all');
    return resolvePayload<{ success: boolean }>(response);
  },

  /**
   * 发送通知
   * @param payload 通知内容
   * @returns 发送结果
   */
  async sendNotification(payload: SendNotificationPayload): Promise<Notification> {
    const response = await api.post('/notifications', payload);
    return resolvePayload<Notification>(response);
  },

  /**
   * 广播系统通知
   * @param payload 广播内容
   * @returns 广播结果
   */
  async broadcastNotification(payload: BroadcastPayload): Promise<{ success: boolean }> {
    const response = await api.post('/notifications/broadcast', payload);
    return resolvePayload<{ success: boolean }>(response);
  },

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 删除结果
   */
  async deleteNotification(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/notifications/${id}`);
    return resolvePayload<{ success: boolean }>(response);
  },
};
