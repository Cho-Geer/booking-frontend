/**
 * authService 单元测试
 * 测试认证服务的各项功能，包括发送验证码、验证验证码、获取当前用户信息和登出操作
 */
import { authService } from '@/services/authService';
import api from '@/services/api';

// Mock the api module
jest.mock('@/services/api');

/**
 * 模拟的API响应数据
 */
const mockResponses = {
  sendCodeSuccess: { success: true },
  verifyCodeSuccess: { token: 'token123', user: { id: '1', name: 'John' } },
  getUserSuccess: { id: '1', name: 'John', phone: '13800138000' },
  logoutSuccess: { success: true },
};

/**
 * 测试用例数据
 */
const testData = {
  validPhone: '13800138000',
  validCode: '123456',
  invalidPhone: 'invalid',
  invalidCode: '000000',
  apiError: new Error('API Error'),
  networkError: new Error('Network Error'),
};

describe('authService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('发送验证码功能', () => {
    it('✅ 正常情况下应使用正确参数调用api.post', async () => {
      api.post.mockResolvedValue({ data: mockResponses.sendCodeSuccess });

      const result = await authService.sendCode(testData.validPhone);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/send-code', { phone: testData.validPhone });
      expect(result).toEqual(mockResponses.sendCodeSuccess);
    });

    it('❌ 应正确处理API错误情况', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(authService.sendCode(testData.validPhone)).rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('❌ 应正确处理网络错误情况', async () => {
      api.post.mockRejectedValue(testData.networkError);

      await expect(authService.sendCode(testData.validPhone)).rejects.toThrow('Network Error');
    });

    it('🔄 应正确处理多次调用的情况', async () => {
      api.post.mockResolvedValue({ data: mockResponses.sendCodeSuccess });

      await authService.sendCode(testData.validPhone);
      await authService.sendCode(testData.validPhone);

      expect(api.post).toHaveBeenCalledTimes(2);
    });

    it('🧪 应正确处理不同电话号码参数', async () => {
      api.post.mockResolvedValue({ data: mockResponses.sendCodeSuccess });
      const anotherPhone = '13900139000';

      const result = await authService.sendCode(anotherPhone);

      expect(api.post).toHaveBeenCalledWith('/auth/send-code', { phone: anotherPhone });
      expect(result).toEqual(mockResponses.sendCodeSuccess);
    });
  });

  describe('验证验证码功能', () => {
    it('✅ 正常情况下应使用正确参数调用api.post并返回token和用户信息', async () => {
      api.post.mockResolvedValue({ data: mockResponses.verifyCodeSuccess });

      const result = await authService.verifyCode(testData.validPhone, testData.validCode);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/verify-code', {
        phone: testData.validPhone,
        code: testData.validCode
      });
      expect(result).toEqual(mockResponses.verifyCodeSuccess);
    });

    it('❌ 应正确处理验证失败的API错误', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(authService.verifyCode(testData.validPhone, testData.validCode))
        .rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('🔄 应正确处理多次验证调用', async () => {
      api.post.mockResolvedValue({ data: mockResponses.verifyCodeSuccess });

      await authService.verifyCode(testData.validPhone, testData.validCode);
      await authService.verifyCode(testData.validPhone, testData.invalidCode);

      expect(api.post).toHaveBeenCalledTimes(2);
    });

    it('🧪 应正确处理不同的验证码参数', async () => {
      api.post.mockResolvedValue({ data: mockResponses.verifyCodeSuccess });
      const anotherCode = '654321';

      const result = await authService.verifyCode(testData.validPhone, anotherCode);

      expect(api.post).toHaveBeenCalledWith('/auth/verify-code', {
        phone: testData.validPhone,
        code: anotherCode
      });
      expect(result).toEqual(mockResponses.verifyCodeSuccess);
    });
  });

  describe('获取当前用户功能', () => {
    it('✅ 正常情况下应调用正确的API端点并返回用户信息', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getUserSuccess });

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponses.getUserSuccess);
    });

    it('❌ 应正确处理获取用户失败的API错误', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(authService.getCurrentUser()).rejects.toThrow('API Error');
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('🔄 应正确处理多次获取用户信息调用', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getUserSuccess });

      await authService.getCurrentUser();
      await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('登出功能', () => {
    it('✅ 正常情况下应调用正确的API端点并返回成功结果', async () => {
      api.post.mockResolvedValue({ data: mockResponses.logoutSuccess });

      const result = await authService.logout();

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponses.logoutSuccess);
    });

    it('❌ 应正确处理登出失败的API错误', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(authService.logout()).rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('🔄 应正确处理多次登出调用', async () => {
      api.post.mockResolvedValue({ data: mockResponses.logoutSuccess });

      await authService.logout();
      await authService.logout();

      expect(api.post).toHaveBeenCalledTimes(2);
    });
  });

  // 清理所有mock，防止影响其他测试
  afterAll(() => {
    jest.restoreAllMocks();
  });
});