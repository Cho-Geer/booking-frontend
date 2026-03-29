/**
 * 用户相关类型定义
 * 集中管理所有与用户业务相关的类型
 */

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export type UserType = 'customer' | 'admin';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

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
  userType: UserType;
  /** 状态：active, inactive, blocked */
  status: UserStatus;
  /** 最后登录时间 */
  lastLoginAt?: string;
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
 * 登出结果类型
 */
export interface LogoutResult {
  success: boolean;
  message: string;
}

export interface AdminUsersQuery {
  name?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userType?: UserType;
  email?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
    status: string;
  };
}
