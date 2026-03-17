/**
 * SlotTime API - 时间段管理接口
 * 对应 slotTimeSlice.ts
 */
import api from './api';
import { TimeSlot } from '../types';

const resolvePayload = <T>(response: { data: unknown }): T => {
  const payload = response.data as { data?: T };
  return payload.data as T;
};

export interface CreateTimeSlotPayload {
  slotTime: string;
  durationMinutes: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateTimeSlotPayload {
  slotTime?: string;
  durationMinutes?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface BlockDatePayload {
  blockedDate: string;
  timeSlotId?: string;
  reason?: string;
}

export const slotTimeApi = {
  /**
   * 获取时间段列表
   * @returns 时间段列表
   */
  async getTimeSlots(): Promise<TimeSlot[]> {
    const response = await api.get('/time-slots');
    return resolvePayload<TimeSlot[]>(response) || [];
  },

  /**
   * 创建时间段
   * @param payload 创建时间段的参数
   * @returns 创建的时间段
   */
  async createTimeSlot(payload: CreateTimeSlotPayload): Promise<TimeSlot> {
    const response = await api.post('/time-slots', payload);
    return resolvePayload<TimeSlot>(response);
  },

  /**
   * 更新时间段
   * @param id 时间段 ID
   * @param payload 更新时间段的参数
   * @returns 更新时间段
   */
  async updateTimeSlot(id: string, payload: UpdateTimeSlotPayload): Promise<TimeSlot> {
    const response = await api.patch(`/time-slots/${id}`, payload);
    return resolvePayload<TimeSlot>(response);
  },

  /**
   * 删除时间段
   * @param id 时间段 ID
   * @returns 删除结果
   */
  async deleteTimeSlot(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/time-slots/${id}`);
    return resolvePayload<{ success: boolean }>(response);
  },

  /**
   * 屏蔽日期
   * @param payload 屏蔽日期的参数
   * @returns 屏蔽结果
   */
  async blockDate(payload: BlockDatePayload): Promise<{ id: string }> {
    const response = await api.post('/time-slots/block', payload);
    return resolvePayload<{ id: string }>(response);
  },

  /**
   * 取消屏蔽日期
   * @param id 屏蔽记录 ID
   * @returns 取消屏蔽结果
   */
  async unblockDate(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/time-slots/block/${id}`);
    return resolvePayload<{ success: boolean }>(response);
  },
};
