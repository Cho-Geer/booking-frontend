/**
 * 预约系统类型定义
 * 统一管理应用中的所有TypeScript类型定义
 */

import { ReactNode } from "react";

/**
 * 管理控制台 Tab 类型定义
 */
export type AdminTab = 'bookings' | 'services' | 'users';

/**
 * 服务行数据类型定义
 */
export type ServiceRow = Service & {
  imageUrl?: string;
  displayOrder?: number | null;
};

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

export interface ServiceQuery {
  page?: number;
  limit?: number;
  name?: BookingStatus;
  description?: string;
  durationMinutes?: number;
  price?: number;
  categoryId?: string;
  isActive?: string;
  displayOrder?: number;
}

export interface ServiceListResponse {
  items: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationQuery {
  userId?: string;
  type?: string[];
  isRead?: boolean;
  limit?: number;
  offset?: number;
  page?: number;
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
  customerName: string;          // 预约时姓名
  customerPhone: string;        // 预约时手机号（加密）
  customerEmail?: string;       // 预约时邮箱/** 客户微信（选填） */
  customerWechat?: string;    // 预约时微信
  /** 服务类型 */
  serviceId?: string;          // 服务ID
  serviceName?: string;        // 服务类型
  service?: {
    id: string;
    name: string;
    durationMinutes: number;
  };
  
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

export interface AdminUsersQuery {
  name?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userType?: 'customer' | 'admin';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * 登出结果类型
 */
export interface LogoutResult {
  success: boolean;
  message: string;
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
 * 验证登录请求接口
 */
export interface VerifyLoginRequest {
  /** 手机号 */
  phone: string;
  /** 验证码 */
  code: string;
}

/**
 * 发送验证码请求接口
 */
export interface SendVerificationCodeRequest {
  /** 手机号 */
  phone: string;
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
 * 发送验证码的参数类型
 */
export interface SendCodeParams {
  phone: string;
}

/**
 * 验证验证码的参数类型
 */
export interface VerifyCodeParams {
  phone: string;
  code: string;
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  phone: string;
  name?: string;
  userType?: string;
}

/**
 * 验证结果类型
 */
export interface VerifyResult {
  user: UserInfo;
  token: string;
}

/**
 * 发送验证码结果类型
 */
export interface SendCodeResult {
  success: boolean;
  message: string;
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

// 主題
/**
 * 主题类型定义
 */
export type ThemeType = 'light' | 'dark' | 'system';

/**
 * 语言类型定义
 */
export type LanguageType = 'zh-CN' | 'en-US' | 'auto';

/**
 * 通知类型定义
 */
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

/**
 * 通知实体定义
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  key?: string;
}

/**
 * 模态框配置定义
 */
export interface ModalConfig {
  open: boolean;
  title?: string;
  content?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

/**
 * 面包屑项定义
 */
export interface BreadcrumbItem {
  title: string;
  path: string;
  icon?: ReactNode;
}

/**
 * 分页参数定义
 */
export interface Pagination {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
}

/**
 * UI状态接口
 */
export interface UIState {
  // 主题状态
  theme: ThemeType;
  // 侧边栏状态
  sidebarOpen: boolean;
  // 通知列表
  notifications: Notification[];
  // 模态框配置
  modal: ModalConfig;
  // 全局加载状态
  loading: boolean;
  // 语言设置
  language: LanguageType;
  // 面包屑导航
  breadcrumbs: BreadcrumbItem[];
  // 移动设备视图
  isMobile: boolean;
  // 视口宽度
  viewportWidth: number;
}

/**
 * UI上下文类型定义
 */
export interface UIContextType {
  uiState: UIState;
  // 主题相关方法
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  // 侧边栏相关方法
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  // 通知相关方法
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  // 便捷通知方法
  showSuccess: (message: string, description?: string, duration?: number) => string;
  showError: (message: string, description?: string, duration?: number) => string;
  showWarning: (message: string, description?: string, duration?: number) => string;
  showInfo: (message: string, description?: string, duration?: number) => string;
  // 模态框相关方法
  setModal: (config: Partial<ModalConfig>) => void;
  openModal: (config: Omit<ModalConfig, 'open'>) => void;
  closeModal: () => void;
  // 加载状态相关方法
  setLoading: (loading: boolean) => void;
  // 语言相关方法
  setLanguage: (language: LanguageType) => void;
  // 面包屑相关方法
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
}
