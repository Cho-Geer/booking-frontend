/**
 * userApi 单元测试
 * 测试认证服务的各项功能，包括发送验证码、验证验证码、获取当前用户信息和登出操作
 */
import { userApi } from '@/services/userApi';
import api from '@/services/api';

jest.mock('@/services/api');

const mockResponses = {
  sendCodeSuccess: { success: true },
  verifyCodeSuccess: { token: 'token123', user: { id: '1', name: 'John' } },
  getUserSuccess: { id: '1', name: 'John', phone: '13800138000' },
  logoutSuccess: { success: true },
};

const testData = {
  validPhone: '13800138000',
  validCode: '123456',
  invalidPhone: 'invalid',
  invalidCode: '000000',
  apiError: new Error('API Error'),
  networkError: new Error('Network Error'),
};

describe('userApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('发送验证码功能', () => {
    it('should call api.post with correct parameters for sending code', async () => {
      api.post.mockResolvedValue({ data: mockResponses.sendCodeSuccess });

      const result = await userApi.sendCode(testData.validPhone, 'login');

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/send-verification-code', { phoneNumber: testData.validPhone, type: 'login' });
      expect(result).toEqual(mockResponses.sendCodeSuccess);
    });

    it('should handle API error when sending code', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(userApi.sendCode(testData.validPhone, 'login')).rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('should handle network error when sending code', async () => {
      api.post.mockRejectedValue(testData.networkError);

      await expect(userApi.sendCode(testData.validPhone, 'login')).rejects.toThrow('Network Error');
    });

    it('should handle multiple send code calls', async () => {
      api.post.mockResolvedValue({ data: mockResponses.sendCodeSuccess });

      await userApi.sendCode(testData.validPhone, 'login');
      await userApi.sendCode(testData.validPhone, 'login');

      expect(api.post).toHaveBeenCalledTimes(2);
    });

    it('should handle different phone parameters', async () => {
      api.post.mockResolvedValue({ data: mockResponses.sendCodeSuccess });
      const anotherPhone = '13900139000';

      const result = await userApi.sendCode(anotherPhone, 'register');

      expect(api.post).toHaveBeenCalledWith('/auth/send-verification-code', { phoneNumber: anotherPhone, type: 'register' });
      expect(result).toEqual(mockResponses.sendCodeSuccess);
    });
  });

  describe('验证验证码功能', () => {
    it('should call api.post with correct parameters for verifying code', async () => {
      api.post.mockResolvedValue({ data: mockResponses.verifyCodeSuccess });

      const result = await userApi.verifyCode(testData.validPhone, testData.validCode);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        phoneNumber: testData.validPhone,
        verificationCode: testData.validCode
      });
      expect(result).toEqual(mockResponses.verifyCodeSuccess);
    });

    it('should handle verification API error', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(userApi.verifyCode(testData.validPhone, testData.validCode))
        .rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple verification calls', async () => {
      api.post.mockResolvedValue({ data: mockResponses.verifyCodeSuccess });

      await userApi.verifyCode(testData.validPhone, testData.validCode);
      await userApi.verifyCode(testData.validPhone, testData.invalidCode);

      expect(api.post).toHaveBeenCalledTimes(2);
    });

    it('should handle different verification code parameters', async () => {
      api.post.mockResolvedValue({ data: mockResponses.verifyCodeSuccess });
      const anotherCode = '654321';

      const result = await userApi.verifyCode(testData.validPhone, anotherCode);

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        phoneNumber: testData.validPhone,
        verificationCode: anotherCode
      });
      expect(result).toEqual(mockResponses.verifyCodeSuccess);
    });
  });

  describe('获取当前用户功能', () => {
    it('should call correct API endpoint and return user info', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getUserSuccess });

      const result = await userApi.getCurrentUser();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/auth/profile', {});
      expect(result).toEqual(mockResponses.getUserSuccess);
    });

    it('should handle get user API error', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(userApi.getCurrentUser()).rejects.toThrow('API Error');
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple get user calls', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getUserSuccess });

      await userApi.getCurrentUser();
      await userApi.getCurrentUser();

      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('登出功能', () => {
    it('should call correct API endpoint for logout', async () => {
      api.post.mockResolvedValue({ data: mockResponses.logoutSuccess });

      const result = await userApi.logout();

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponses.logoutSuccess);
    });

    it('should handle logout API error', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(userApi.logout()).rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple logout calls', async () => {
      api.post.mockResolvedValue({ data: mockResponses.logoutSuccess });

      await userApi.logout();
      await userApi.logout();

      expect(api.post).toHaveBeenCalledTimes(2);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
