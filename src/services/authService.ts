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
    const response = await api.post('/auth/register', {
    name: data.name,
    phoneNumber: data.phoneNumber,
    verificationCode: data.verificationCode,
    email: data.email,
  });
    return response.data;
  },

  /**
   * 发送验证码
   * @param phone - 手机号
   * @param type - 验证码类型
   * @returns 发送结果
   */
  async sendCode(phoneNumber: string, type: 'login' | 'register') {
    const response = await api.post('/auth/send-verification-code', { phoneNumber, type });
    return response.data;
  },

  /**
   * 验证验证码并登录
   * @param phoneNumber - 手机号
   * @param code - 验证码
   * @returns 登录结果，包含token和用户信息
   */
  async verifyCode(phoneNumber: string, code: string) {
    const response = await api.post('/auth/login', { phoneNumber, verificationCode: code });
    return response.data;
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser() {
    const response = await api.get('/auth/profile', {
      // headers: {
      //   'X-Skip-Auth-Redirect': 'true',
      // },
    });
    return response.data;
  },

  /**
   * 登出
   * @returns 登出结果
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      // 清除本地存储的用户信息
      localStorage.removeItem('user');
      // 清除其他相关存储
      sessionStorage.removeItem('user');
      return response.data;
    } catch (error) {
      // 即使后端失败，也清除本地状态
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      throw error;
    }
  },
};
