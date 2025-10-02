/**
 * 基于TanStack Query的认证API服务
 * 负责处理用户认证相关的所有API调用
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { AxiosError } from 'axios';

/**
 * 认证相关的API端点
 */
const AUTH_ENDPOINTS = {
  SEND_CODE: '/auth/send-code',
  VERIFY_CODE: '/auth/verify-code',
  GET_CURRENT_USER: '/auth/me',
  LOGOUT: '/auth/logout',
};

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
 * 发送验证码API调用
 * @param params 发送验证码参数
 * @returns 发送结果
 */
const sendCodeApi = async (params: SendCodeParams): Promise<SendCodeResult> => {
  const response = await api.post(AUTH_ENDPOINTS.SEND_CODE, params);
  return response.data as SendCodeResult;
};

/**
 * 验证验证码API调用
 * @param params 验证验证码参数
 * @returns 验证结果
 */
const verifyCodeApi = async (params: VerifyCodeParams): Promise<VerifyResult> => {
  const response = await api.post(AUTH_ENDPOINTS.VERIFY_CODE, params);
  return response.data as VerifyResult;
};

/**
 * 获取当前用户信息API调用
 * @returns 用户信息
 */
const getCurrentUserApi = async (): Promise<UserInfo> => {
  const response = await api.get(AUTH_ENDPOINTS.GET_CURRENT_USER);
  return response.data as UserInfo;
};

/**
 * 登出结果类型
 */
export interface LogoutResult {
  success: boolean;
  message: string;
}

/**
 * 登出API调用
 * @returns 登出结果
 */
const logoutApi = async (): Promise<LogoutResult> => {
  const response = await api.post(AUTH_ENDPOINTS.LOGOUT);
  return response.data as LogoutResult;
};

/**
 * 使用发送验证码的Hook
 * @returns 发送验证码的mutation钩子
 */
export const useSendCode = () => {
  return useMutation({
    mutationFn: sendCodeApi,
    onSuccess: () => {
      // 可以在这里添加成功后的逻辑
      console.log('验证码发送成功');
    },
    onError: (error: AxiosError) => {
      // 可以在这里添加错误处理逻辑
      console.error('验证码发送失败:', error);
    },
  });
};

/**
 * 使用验证验证码的Hook
 * @returns 验证验证码的mutation钩子
 */
export const useVerifyCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: verifyCodeApi,
    onSuccess: (data) => {
      // 保存token
      localStorage.setItem('token', data.token);
      // 更新用户信息缓存
      queryClient.setQueryData(['currentUser'], data.user);
      // 可以在这里添加成功后的逻辑
      console.log('登录成功');
    },
    onError: (error: AxiosError) => {
      // 可以在这里添加错误处理逻辑
      console.error('登录失败:', error);
    },
  });
};

/**
 * 使用当前用户信息的Hook
 * @returns 当前用户信息的query钩子
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserApi,
    // 缓存时间（默认5分钟）
    staleTime: 5 * 60 * 1000,
    // 只有在用户已登录时才会自动刷新
    refetchOnWindowFocus: false,
    // 禁用自动重试，因为认证错误通常需要用户操作
    retry: false,
    // 只有在有token的情况下才执行查询
    enabled: !!localStorage.getItem('token'),
  });
};

/**
 * 使用登出的Hook
 * @returns 登出的mutation钩子
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // 清除token
      localStorage.removeItem('token');
      // 清除用户信息缓存
      queryClient.removeQueries({
        queryKey: ['currentUser'],
      });
      // 可以在这里添加成功后的逻辑
      console.log('登出成功');
    },
    onError: (error: AxiosError) => {
      // 可以在这里添加错误处理逻辑
      console.error('登出失败:', error);
    },
  });
};

/**
 * 认证API工具函数
 */
export const authApiUtils = {
  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * 获取存储的token
   * @returns token字符串或null
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  /**
   * 清除认证信息
   */
  clearAuthInfo: (): void => {
    localStorage.removeItem('token');
  },
};