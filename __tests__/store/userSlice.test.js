/**
 * userSlice 单元测试
 * 测试用户相关状态管理的各项功能，包括验证码发送、验证码验证、倒计时、用户登出等
 */
import userReducer, {
  sendCode,
  verifyCode,
  setCodeSent,
  setCountdown,
  decrementCountdown,
  logout,
  clearError
} from '@/store/userSlice';

/**
 * 测试用例常量
 */
const testConstants = {
  mockUserId: '1',
  mockUserPhone: '13800138000',
  mockToken: 'test-token',
  mockCountdown: 60,
  mockTestCountdown: 5,
};

/**
 * 测试用例数据
 */
const testData = {
  mockUser: {
    id: testConstants.mockUserId,
    phone: testConstants.mockUserPhone,
  },
  mockToken: testConstants.mockToken,
  mockError: 'Some error',
  mockSendCodeError: 'Failed to send code',
  mockVerifyCodeError: 'Invalid code',
};

// 模拟 authService
jest.mock('@/services/authService', () => ({
  authService: {
    sendCode: jest.fn(),
    verifyCode: jest.fn(),
  }
}));

describe('userSlice', () => {
  const initialState = {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    codeSent: false,
    countdown: 0,
  };

  describe('基础状态管理功能', () => {
    it('✅ 应正确处理初始状态', () => {
      expect(userReducer(undefined, {})).toEqual(initialState);
    });

    it('✅ 应正确设置验证码发送状态', () => {
      const actual = userReducer(initialState, setCodeSent(true));
      expect(actual.codeSent).toEqual(true);
    });

    it('✅ 应正确设置倒计时', () => {
      const actual = userReducer(initialState, setCountdown(testConstants.mockCountdown));
      expect(actual.countdown).toEqual(testConstants.mockCountdown);
    });

    it('✅ 应正确处理倒计时减一', () => {
      const stateWithCountdown = { ...initialState, countdown: testConstants.mockTestCountdown };
      const actual = userReducer(stateWithCountdown, decrementCountdown());
      expect(actual.countdown).toEqual(testConstants.mockTestCountdown - 1);
    });

    it('🧪 应确保倒计时不会小于0', () => {
      const stateWithZeroCountdown = { ...initialState, countdown: 0 };
      const actual = userReducer(stateWithZeroCountdown, decrementCountdown());
      expect(actual.countdown).toEqual(0);
    });

    it('✅ 应正确处理用户登出', () => {
      const stateWithUser = {
        ...initialState,
        currentUser: testData.mockUser,
        isAuthenticated: true,
      };
      
      const actual = userReducer(stateWithUser, logout());
      expect(actual.currentUser).toEqual(null);
      expect(actual.isAuthenticated).toEqual(false);
    });

    it('✅ 应正确清除错误状态', () => {
      const stateWithError = { ...initialState, error: testData.mockError };
      const actual = userReducer(stateWithError, clearError());
      expect(actual.error).toEqual(null);
    });
  });

  describe('验证码发送功能', () => {
    it('🔄 应正确处理发送验证码的pending状态', () => {
      const actual = userReducer(initialState, {
        type: sendCode.pending.type,
      });
      expect(actual.loading).toEqual(true);
      expect(actual.error).toEqual(null);
    });

    it('✅ 应正确处理发送验证码成功的fulfilled状态', () => {
      const actual = userReducer(initialState, {
        type: sendCode.fulfilled.type,
      });
      expect(actual.loading).toEqual(false);
      expect(actual.codeSent).toEqual(true);
      expect(actual.countdown).toEqual(testConstants.mockCountdown);
    });

    it('❌ 应正确处理发送验证码失败的rejected状态', () => {
      const actual = userReducer(initialState, {
        type: sendCode.rejected.type,
        error: { message: testData.mockSendCodeError },
      });
      expect(actual.loading).toEqual(false);
      expect(actual.error).toEqual(testData.mockSendCodeError);
    });

    it('🧪 应正确处理已认证用户发送验证码的情况', () => {
      const stateWithUser = {
        ...initialState,
        currentUser: testData.mockUser,
        isAuthenticated: true,
      };
      const actual = userReducer(stateWithUser, {
        type: sendCode.fulfilled.type,
      });
      expect(actual.loading).toEqual(false);
      expect(actual.codeSent).toEqual(true);
      expect(actual.currentUser).toEqual(testData.mockUser); // 用户信息应保持不变
    });
  });

  describe('验证码验证功能', () => {
    it('🔄 应正确处理验证验证码的pending状态', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.pending.type,
      });
      expect(actual.loading).toEqual(true);
      expect(actual.error).toEqual(null);
    });

    it('✅ 应正确处理验证验证码成功的fulfilled状态', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.fulfilled.type,
        payload: { user: testData.mockUser, token: testData.mockToken },
      });
      
      expect(actual.loading).toEqual(false);
      expect(actual.isAuthenticated).toEqual(true);
      expect(actual.currentUser).toEqual(testData.mockUser);
      expect(actual.codeSent).toEqual(false);
      expect(actual.countdown).toEqual(0);
    });

    it('❌ 应正确处理验证验证码失败的rejected状态', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.rejected.type,
        error: { message: testData.mockVerifyCodeError },
      });
      expect(actual.loading).toEqual(false);
      expect(actual.error).toEqual(testData.mockVerifyCodeError);
    });

    it('🧪 应正确处理已认证用户重新验证验证码的情况', () => {
      const initialUser = { id: '2', phone: '13900139000' };
      const stateWithUser = {
        ...initialState,
        currentUser: initialUser,
        isAuthenticated: true,
      };
      
      const actual = userReducer(stateWithUser, {
        type: verifyCode.fulfilled.type,
        payload: { user: testData.mockUser, token: testData.mockToken },
      });
      
      expect(actual.currentUser).toEqual(testData.mockUser); // 用户信息应被更新
      expect(actual.isAuthenticated).toEqual(true);
    });
  });

  // 清理所有mock，防止影响其他测试
  afterAll(() => {
    jest.restoreAllMocks();
  });
});