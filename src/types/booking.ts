/**
 * 预约相关类型定义
 * 集中管理所有与预约业务相关的类型
 */

/**
 * 预约状态枚举
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

/**
 * 预约状态接口
 */
export interface BookingState {
  /** 用户的预约列表 */
  bookings: Booking[];
  /** 可用时间段 */
  availableSlots: TimeSlot[];
  /** 当前选中的日期 */
  selectedDate: string;
  /** 当前选中的时间段 */
  selectedSlot: TimeSlot | null;
  /** 加载状态 */
  loading: boolean;
  /** 可用时间段加载状态 */
  slotsLoading: boolean;
  /** 预约列表加载状态 */
  bookingsLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 创建预约的加载状态 */
  creatingBooking: boolean;
  /** 成功状态 */
  success: boolean;
  /** 服务列表 */
  services: Service[];
  /** 列表分页信息 */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  /** 列表筛选条件 */
  filters: AppointmentQuery;
}

/**
 * 预约查询参数接口
 */
export interface AppointmentQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
  timeSlotId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

/**
 * 预约列表响应接口
 */
export interface AppointmentListResponse {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 可用时间段接口
 */
export interface TimeSlot {
  /** 时间段ID */
  id: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 是否可用 */
  available: boolean;
}

/**
 * 预约实体接口
 */
export interface Booking {
  /** 预约ID */
  id: string;
  /** 预约编号 (AP-yyyymmdd-0001格式) */
  appointmentNumber: string;
  /** 用户ID */
  userId: string;
  /** 时间段ID */
  timeSlotId: string;
  startTime: string;
  endTime: string;
  /** 预约日期 */
  appointmentDate: string;
  /** 状态 */
  status: BookingStatus;
  /** 备注 */
  notes?: string;
  timeSlot: {
    slotTime: string,
    durationMinutes: number;
  },
  /** 用户信息快照（预约时的用户信息） */
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerWechat?: string;
  /** 服务类型 */
  serviceId?: string;
  serviceName?: string;
  service?: {
    id: string;
    name: string;
    durationMinutes: number;
  };
  
  /** 系统信息 */
  ipAddress?: string;
  userAgent?: string;
  confirmationSent: boolean;
  reminderSent: boolean;
  
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
 * 服务实体接口
 */
export interface Service {
  /** 服务ID */
  id: string;
  /** 服务名称 */
  name: string;
  /** 服务描述 */
  description?: string;
  /** 服务时长（分钟） */
  durationMinutes: number;
  /** 价格 */
  price?: number;
  /** 是否可用 */
  isActive: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 创建预约请求接口
 */
export interface CreateBookingRequest {
  /** 时间段ID */
  timeSlotId: string;
  /** 预约日期 */
  appointmentDate: string;
  /** 用户ID */
  userId: string;
  /** 客户姓名 */
  customerName: string;
  /** 客户手机号 */
  customerPhone: string;
  /** 客户邮箱（选填） */
  customerEmail?: string;
  /** 客户微信（选填） */
  customerWechat?: string;
  /** 服务ID */
  serviceId?: string;
  /** 服务类型 */
  serviceName: string;
  /** 备注 */
  notes?: string;
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
