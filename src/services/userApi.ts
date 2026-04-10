/**
 * User API - 用户认证接口
 * 对应 userSlice.ts
 */
import { LoginResponseDto, User } from '@/types';
import api from './api';
import { RegisterFormData } from '@/components/molecules/RegisterForm';

const resolvePayload = <T>(response: { data: unknown }): T => {
  return response.data as T;
};

export const userApi = {
  /**
   * 用户注册
   * @param data - 注册表单数据
   * @returns 注册结果
   */
  async register(data: RegisterFormData): Promise<LoginResponseDto> {
    const response = await api.post('/auth/register', {
      name: data.name,
      phoneNumber: data.phoneNumber,
      verificationCode: data.verificationCode,
      email: data.email,
    });
    return resolvePayload<LoginResponseDto>(response);
  },

  /**
   * 发送验证码
   * @param phoneNumber - 手机号
   * @param type - 验证码类型
   * @returns 发送结果
   */
  async sendCode(phoneNumber: string, type: 'login' | 'register') {
    const response = await api.post('/auth/send-verification-code', { phoneNumber, type });
    return resolvePayload(response);
  },

  /**
   * 验证验证码并登录
   * @param phoneNumber - 手机号
   * @param code - 验证码
   * @returns 登录结果
   */
  async verifyCode(phoneNumber: string, code: string) {
    const response = await api.post('/auth/login', { phoneNumber, verificationCode: code });
    return resolvePayload<LoginResponseDto>(response);
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<User>{
    const response = await api.get('/auth/profile', {});
    return resolvePayload<User>(response);
  },

  /**
   * 登出
   * @returns 登出结果
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return resolvePayload(response);
    } catch (error) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * 切换用户状态
   * @param id - 用户 ID
   * @param status - 新的用户状态
   * @returns 更新后的用户信息
   */
  async toggleUserStatus(id: string, status: string): Promise<User> {
    const response = await api.put(`/users/${id}/status`, { status });
    return resolvePayload<User>(response);
  },
};
