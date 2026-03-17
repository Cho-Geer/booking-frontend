/**
 * Booking API - 预约管理接口
 * 对应 bookingSlice.ts
 */
import api from './api';
import { Booking, TimeSlot, CreateBookingRequest, Service, AppointmentQuery, AppointmentListResponse, BookingStatus } from '../types';

const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

export const bookingApi = {
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
   * @param query - 查询参数
   * @returns 预约列表响应
   */
  async getBookings(query: AppointmentQuery = {}): Promise<AppointmentListResponse> {
    const response = await api.get('/bookings/all', { params: query });
    const data = response.data.data || response.data;
    
    if (Array.isArray(data)) {
      const items = data.map((item: any) => ({
        ...item,
        startTime: item.timeSlot?.slotTime?.split(':').slice(0, 2).join(':') || '',
        endTime: item.timeSlot ? calculateEndTime(item.timeSlot.slotTime, item.timeSlot.durationMinutes) : '',
      }));
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length,
        totalPages: 1
      };
    }

    return {
      ...data,
      items: data.items.map((item: any) => ({
        ...item,
        startTime: item.timeSlot?.slotTime?.split(':').slice(0, 2).join(':') || '',
        endTime: item.timeSlot ? calculateEndTime(item.timeSlot.slotTime, item.timeSlot.durationMinutes) : '',
      }))
    };
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
    const slots = response.data.data || response.data || [];
    return slots.map((slot: { id: string; slotTime: string; durationMinutes: number; isAvailable: boolean }) => ({
      id: slot.id,
      startTime: slot.slotTime.split(':').slice(0, 2).join(':'),
      endTime: calculateEndTime(slot.slotTime, slot.durationMinutes),
      available: slot.isAvailable
    }));
  },

  /**
   * 创建预约
   * @param bookingData - 预约数据
   * @returns 创建的预约
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await api.post('/bookings', bookingData);
    return {
      ...response.data.data, 
      startTime: response.data.data.timeSlot.slotTime.split(':').slice(0, 2).join(':'),
      endTime: calculateEndTime(response.data.data.timeSlot.slotTime, response.data.data.timeSlot.durationMinutes),
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
   * 更新预约
   * @param bookingId - 预约ID
   * @param bookingData - 预约数据
   * @returns 更新后的预约
   */
  async updateBooking(
    bookingId: string,
    bookingData: {
      appointmentDate?: string;
      timeSlotId?: string;
      serviceId?: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerWechat?: string;
      notes?: string;
      status?: BookingStatus
    }
  ): Promise<Booking> {
    const response = await api.patch(`/bookings/${bookingId}`, bookingData);
    const payload = response.data?.data ?? response.data;
    return {
      ...payload,
      serviceName: payload.service?.name || payload.serviceName,
      startTime: payload.timeSlot?.slotTime?.split(':').slice(0, 2).join(':') || payload.startTime,
      endTime: payload.timeSlot?.slotTime
        ? calculateEndTime(payload.timeSlot.slotTime, payload.timeSlot.durationMinutes)
        : payload.endTime,
    };
  },

  /**
   * 获取预约详情
   * @param bookingId - 预约ID
   * @returns 预约详情
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data?.data || response.data;
  },

  /**
   * 删除预约
   * @param bookingId - 预约ID
   * @returns 删除结果
   */
  async deleteBooking(bookingId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * 更新预约状态
   * @param bookingId - 预约ID
   * @param status - 新状态
   * @returns 更新结果
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<{ success: boolean }> {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },
};
