/**
 * 基于TanStack Query的预约API服务
 * 负责处理预约相关的所有API调用
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { AxiosError } from 'axios';

/**
 * 预约相关的API端点 - 标准化为appointments路径
 */
const BOOKING_ENDPOINTS = {
  GET_BOOKINGS: '/appointments',
  GET_BOOKING: '/appointments/{id}',
  CREATE_BOOKING: '/appointments',
  UPDATE_BOOKING: '/appointments/{id}',
  DELETE_BOOKING: '/appointments/{id}',
  GET_AVAILABLE_SLOTS: '/appointments/available-slots',
};

/**
 * 预约状态枚举
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * 预约数据类型
 */
export interface Booking {
  id: string;
  /** 预约编号 (AP-yyyymmdd-0001格式) */
  appointmentNumber: string;
  /** 用户ID */
  userId: string;
  /** 服务ID */
  serviceId: string;
  /** 服务名称 */
  serviceName: string;
  /** 预约日期 */
  date: string; // ISO日期格式
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 状态 */
  status: BookingStatus;
  /** 备注 */
  notes?: string;
  
  /** 用户信息快照（预约时的用户信息） */
  customerName: string;          // 预约时姓名
  customerPhone: string;        // 预约时手机号（加密）
  customerEmail?: string;       // 预约时邮箱
  customerWechat?: string;    // 预约时微信
  
  /** 系统信息 */
  ipAddress?: string;           // 预约IP
  userAgent?: string;           // 用户代理
  confirmationSent: boolean;    // 是否发送确认通知
  reminderSent: boolean;        // 是否发送提醒通知
  
  /** 时间记录 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 确认时间 */
  confirmedAt?: string;
  /** 取消时间 */
  cancelledAt?: string;
  /** 完成时间 */
  completedAt?: string;
}

/**
 * 创建预约的参数类型
 */
export interface CreateBookingParams {
  serviceId: string;
  date: string;
  timeSlot: string;
  notes?: string;
  /** 预约人姓名 */
  customerName: string;
  /** 预约人手机号 */
  customerPhone: string;
  /** 预约人邮箱（选填） */
  customerEmail?: string;
  /** 预约人微信（选填） */
  customerWechat?: string;
}

/**
 * 更新预约的参数类型
 */
export interface UpdateBookingParams {
  id: string;
  date?: string;
  timeSlot?: string;
  status?: BookingStatus;
  notes?: string;
}

/**
 * 获取可用时间段的参数类型
 */
export interface GetAvailableSlotsParams {
  serviceId: string;
  date: string;
}

/**
 * 时间段类型
 */
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/**
 * 获取预约列表API调用
 * @returns 预约列表
 */
const getBookingsApi = async (): Promise<Booking[]> => {
  const response = await api.get(BOOKING_ENDPOINTS.GET_BOOKINGS);
  return response.data as Booking[];
};

/**
 * 获取单个预约API调用
 * @param id 预约ID
 * @returns 预约详情
 */
const getBookingApi = async (id: string): Promise<Booking> => {
  const response = await api.get(BOOKING_ENDPOINTS.GET_BOOKING.replace('{id}', id));
  return response.data as Booking;
};

/**
 * 创建预约API调用
 * @param params 创建预约参数
 * @returns 创建的预约
 */
const createBookingApi = async (params: CreateBookingParams): Promise<Booking> => {
  const response = await api.post(BOOKING_ENDPOINTS.CREATE_BOOKING, params);
  return response.data as Booking;
};

/**
 * 更新预约API调用
 * @param params 更新预约参数
 * @returns 更新后的预约
 */
const updateBookingApi = async (params: UpdateBookingParams): Promise<Booking> => {
  const { id, ...updateData } = params;
  const response = await api.put(BOOKING_ENDPOINTS.UPDATE_BOOKING.replace('{id}', id), updateData);
  return response.data as Booking;
};

/**
 * 删除预约API调用
 * @param id 预约ID
 * @returns 删除结果
 */
const deleteBookingApi = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete(BOOKING_ENDPOINTS.DELETE_BOOKING.replace('{id}', id));
  return response.data;
};

/**
 * 获取可用时间段API调用
 * @param params 获取可用时间段参数
 * @returns 时间段列表
 */
const getAvailableSlotsApi = async (params: GetAvailableSlotsParams): Promise<TimeSlot[]> => {
  const response = await api.get(BOOKING_ENDPOINTS.GET_AVAILABLE_SLOTS, {
    params,
  });
  return response.data as TimeSlot[];
};

/**
 * 使用预约列表的Hook
 * @param options 额外的查询选项
 * @returns 预约列表的query钩子
 */
export const useBookings = (options?: Partial<Record<string, unknown>>) => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getBookingsApi,
    // 缓存时间（默认5分钟）
    staleTime: 5 * 60 * 1000,
    // 在窗口重新获得焦点时刷新
    refetchOnWindowFocus: true,
    // 重试次数
    retry: 3,
    ...options,
  });
};

/**
 * 使用单个预约的Hook
 * @param id 预约ID
 * @param options 额外的查询选项
 * @returns 单个预约的query钩子
 */
export const useBooking = (id: string, options?: Partial<Record<string, unknown>>) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingApi(id),
    // 缓存时间（默认5分钟）
    staleTime: 5 * 60 * 1000,
    // 只有在有ID时才执行查询
    enabled: !!id,
    ...options,
  });
};

/**
 * 使用创建预约的Hook
 * @returns 创建预约的mutation钩子
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBookingApi,
    onSuccess: () => {
      // 使预约列表无效，以便重新获取最新数据
      queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
      // 可以在这里添加成功后的逻辑
      console.log('预约创建成功');
    },
    onError: (error: AxiosError) => {
      // 可以在这里添加错误处理逻辑
      console.error('预约创建失败:', error);
    },
  });
};

/**
 * 使用更新预约的Hook
 * @returns 更新预约的mutation钩子
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateBookingApi,
    onSuccess: (updatedBooking) => {
      // 使相关预约查询无效，以便重新获取最新数据
      queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
      queryClient.invalidateQueries({
        queryKey: ['booking', updatedBooking.id],
      });
      // 可以在这里添加成功后的逻辑
      console.log(`预约ID: ${updatedBooking.id} 更新成功`);
    },
    onError: (error: AxiosError) => {
      // 可以在这里添加错误处理逻辑
      console.error('预约更新失败:', error);
    },
  });
};

/**
 * 使用删除预约的Hook
 * @returns 删除预约的mutation钩子
 */
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBookingApi,
    onSuccess: (_, variables) => {
      // 使预约列表无效，以便重新获取最新数据
      queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
      // 从缓存中移除特定预约
      queryClient.removeQueries({
        queryKey: ['booking', variables],
      });
      // 可以在这里添加成功后的逻辑
      console.log(`预约ID: ${variables} 删除成功`);
    },
    onError: (error: AxiosError) => {
      // 可以在这里添加错误处理逻辑
      console.error('预约删除失败:', error);
    },
  });
};

/**
 * 使用可用时间段的Hook
 * @param params 获取可用时间段参数
 * @param options 额外的查询选项
 * @returns 可用时间段的query钩子
 */
export const useAvailableSlots = (params: GetAvailableSlotsParams, options?: Partial<Record<string, unknown>>) => {
  return useQuery({
    queryKey: ['availableSlots', params.serviceId, params.date],
    queryFn: () => getAvailableSlotsApi(params),
    // 缓存时间（默认1分钟）
    staleTime: 1 * 60 * 1000,
    // 只有在有必要的参数时才执行查询
    enabled: !!params.serviceId && !!params.date,
    ...options,
  });
};

/**
 * 预约API工具函数
 */
export const bookingApiUtils = {
  /**
   * 格式化预约日期
   * @param date 日期字符串
   * @returns 格式化后的日期
   */
  formatBookingDate: (date: string): string => {
    try {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      console.error('日期格式化失败:', error);
      return date;
    }
  },
  
  /**
   * 获取预约状态的显示文本
   * @param status 预约状态
   * @returns 状态显示文本
   */
  getStatusText: (status: BookingStatus): string => {
    const statusMap: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: '待确认',
      [BookingStatus.CONFIRMED]: '已确认',
      [BookingStatus.CANCELLED]: '已取消',
      [BookingStatus.COMPLETED]: '已完成',
    };
    return statusMap[status] || status;
  },
};