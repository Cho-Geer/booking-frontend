/**
 * 预约系统类型定义
 * 统一管理应用中的所有TypeScript类型定义
 * 
 * 注意：为了保持向后兼容，此文件重新导出所有类型
 * 建议新代码直接从对应模块导入类型
 */

import { ReactNode } from 'react';

// ==================== booking 模块类型 ====================
// enum 需要作为值导出，不能用 export type
export { BookingStatus } from './booking';
// 接口和类型使用 type 导出
export type { 
  BookingState, 
  AppointmentQuery, 
  AppointmentListResponse, 
  TimeSlot, 
  Booking, 
  Service, 
  CreateBookingRequest, 
  CreateBookingParams, 
  UpdateBookingParams, 
  GetAvailableSlotsParams 
} from './booking';

// ==================== user 模块类型 ====================
// enum 需要作为值导出
export { UserRole } from './user';
// 接口和类型使用 type 导出
export type { 
  User, 
  VerifyLoginRequest, 
  SendVerificationCodeRequest, 
  SendCodeParams, 
  VerifyCodeParams, 
  UserInfo, 
  VerifyResult, 
  SendCodeResult, 
  LogoutResult 
} from './user';

// ==================== ui 模块类型 ====================
export type { 
  ThemeType, 
  LanguageType, 
  NotificationType, 
  Notification, 
  ModalConfig, 
  BreadcrumbItem, 
  UIState, 
  UIContextType 
} from './ui';

// ==================== 通用类型 ====================
export type { ReactNode };

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
