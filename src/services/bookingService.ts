import api from './api';
import { Booking, TimeSlot, CreateBookingRequest, Service } from '../types';

/**
 * 预约服务
 */
export const bookingService = {
  /**
   * 获取所有服务列表
   * @returns 服务列表
   */
  async getServices(): Promise<Service[]> {
    const response = await api.get('/services');
    return response.data.data;
  },

  /**
   * 获取当前用户的预约列表
   * @returns 预约列表
   */
  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings');
    return response.data;
  },

  /**
   * 获取所有用户的预约列表（管理员）
   * @returns 预约列表
   */
  async getBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/all');
    return response.data.data.items.map((item: { timeSlot: { slotTime: string; durationMinutes: number } }) => ({
      ...item,
      startTime: item.timeSlot.slotTime.split(':').slice(0, 2).join(':'), // 转换为 HH:MM 格式
      endTime: this.calculateEndTime(item.timeSlot.slotTime, item.timeSlot.durationMinutes),
    }));
  },

  /**
   * 获取指定日期的可用时间段
   * @param date - 日期 (YYYY-MM-DD)
   * @returns 可用时间段列表
   */
  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    const response = await api.get('/bookings/available-slots', {
      params: { date }
    });
    // 转换后端响应格式为前端期望的格式
    const slots = response.data.data || response.data || [];
    return slots.map((slot: { id: string; slotTime: string; durationMinutes: number; isAvailable: boolean }) => ({
      id: slot.id,
      startTime: slot.slotTime.split(':').slice(0, 2).join(':'), // 转换为 HH:MM 格式
      endTime: this.calculateEndTime(slot.slotTime, slot.durationMinutes),
      available: slot.isAvailable
    }));
  },

  /**
   * 计算结束时间
   * @param startTime - 开始时间 (HH:mm:ss)
   * @param durationMinutes - 持续时间（分钟）
   * @returns 结束时间 (HH:mm)
   */
  calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  },

  /**
   * 创建预约
   * @param bookingData - 预约数据
   * @returns 创建的预约
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await api.post('/bookings', bookingData);
    return {...response.data.data, 
      startTime: response.data.data.timeSlot.slotTime.split(':').slice(0, 2).join(':'), // 转换为 HH:MM 格式
      endTime: this.calculateEndTime(response.data.data.timeSlot.slotTime, response.data.data.timeSlot.durationMinutes),
    };
  },

  /**
   * 取消预约
   * @param bookingId - 预约ID
   * @returns 取消结果
   */
  async cancelBooking(bookingId: string): Promise<{ success: boolean }> {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  /**
   * 获取预约详情
   * @param bookingId - 预约ID
   * @returns 预约详情
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },
};