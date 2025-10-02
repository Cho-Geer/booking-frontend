import api from './api';
import { Booking, TimeSlot, CreateBookingRequest } from '../types';

/**
 * 预约服务
 */
export const bookingService = {
  /**
   * 获取当前用户的预约列表
   * @returns 预约列表
   */
  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get('/appointments');
    return response.data;
  },

  /**
   * 获取所有用户的预约列表（管理员）
   * @returns 预约列表
   */
  async getBookings(): Promise<Booking[]> {
    const response = await api.get('/appointments/all');
    return response.data;
  },

  /**
   * 获取指定日期的可用时间段
   * @param date - 日期 (YYYY-MM-DD)
   * @returns 可用时间段列表
   */
  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    const response = await api.get(`/appointments/available-slots?date=${date}`);
    return response.data;
  },

  /**
   * 创建预约
   * @param bookingData - 预约数据
   * @returns 创建的预约
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await api.post('/appointments', bookingData);
    return response.data;
  },

  /**
   * 取消预约
   * @param bookingId - 预约ID
   * @returns 取消结果
   */
  async cancelBooking(bookingId: string): Promise<{ success: boolean }> {
    const response = await api.patch(`/appointments/${bookingId}/cancel`);
    return response.data;
  },

  /**
   * 获取预约详情
   * @param bookingId - 预约ID
   * @returns 预约详情
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await api.get(`/appointments/${bookingId}`);
    return response.data;
  },
};