import api from './api';
import { RegisterFormData } from '@/components/molecules/RegisterForm';

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户注册
   * @param data - 注册表单数据
   * @returns 注册结果，包含token和用户信息
   */
  async register(data: RegisterFormData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * 发送验证码
   * @param phone - 手机号
   * @returns 发送结果
   */
  async sendCode(phone: string) {
    const response = await api.post('/auth/send-code', { phone });
    return response.data;
  },

  /**
   * 验证验证码并登录
   * @param phone - 手机号
   * @param code - 验证码
   * @returns 登录结果，包含token和用户信息
   */
  async verifyCode(phone: string, code: string) {
    const response = await api.post('/auth/verify-code', { phone, code });
    return response.data;
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * 登出
   * @returns 登出结果
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};