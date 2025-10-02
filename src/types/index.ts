/**
 * 预约系统类型定义
 * 统一管理应用中的所有TypeScript类型定义
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
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

/**
 * 可用时间段接口
 */
export interface TimeSlot {
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
  /** 服务ID */
  serviceId: string;
  /** 预约日期 */
  date: string;
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
  /** 服务名称（可选） */
  serviceName?: string;
}

/**
 * 用户实体接口
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户姓名 */
  name: string;
  /** 手机号（加密存储） */
  phone: string;
  /** 手机号哈希（用于查询） */
  phoneHash?: string;
  /** 邮箱（选填） */
  email?: string;
  /** 微信号（选填） */
  wechat?: string;
  /** 头像URL */
  avatar?: string;
  /** 是否已验证 */
  isVerified: boolean;
  /** 用户类型：customer, admin */
  userType: 'customer' | 'admin';
  /** 状态：active, inactive, blocked */
  status: 'active' | 'inactive' | 'blocked';
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 登录次数 */
  loginCount: number;
  /** 注册IP地址 */
  ipAddress?: string;
  /** 用户代理 */
  userAgent?: string;
  /** 角色 */
  role: UserRole;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
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
  duration: number;
  /** 价格 */
  price?: number;
  /** 是否可用 */
  available: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 创建预约请求接口
 */
export interface CreateBookingRequest {
  /** 服务ID */
  serviceId: string;
  /** 预约日期 */
  date: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 备注 */
  notes?: string;
}

/**
 * 验证登录请求接口
 */
export interface VerifyLoginRequest {
  /** 手机号 */
  phone: string;
  /** 验证码 */
  code: string;
}

/**
 * 创建预约请求接口
 */
export interface CreateBookingRequest {
  /** 服务ID */
  serviceId: string;
  /** 预约日期 */
  date: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 备注 */
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
 * 发送验证码请求接口
 */
export interface SendVerificationCodeRequest {
  /** 手机号 */
  phone: string;
}

/**
 * API响应通用接口
 */
export interface ApiResponse<T> {
  /** 状态码 */
  code: number;
  /** 消息 */
  message: string;
  /** 数据 */
  data: T;
  /** 是否成功 */
  success: boolean;
}