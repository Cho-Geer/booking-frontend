/**
 * userSlice 单元测试
 * 测试用户相关状态管理的各项功能，包括验证码发送、验证码验证、用户登出等
 */
import userReducer, {
  sendCode,
  verifyCode,
  logout,
  clearError,
  setShowCodeInput
} from '@/store/userSlice';

jest.mock('@/services/userApi');

const testConstants = {
  mockUserId: '1',
  mockUserPhone: '13800138000',
  mockToken: 'test-token',
};

const testData = {
  mockUser: {
    id: testConstants.mockUserId,
    phone: testConstants.mockUserPhone,
    name: 'Test User',
    userType: 'customer',
  },
  mockToken: testConstants.mockToken,
  mockError: 'Some error',
  mockSendCodeError: 'Failed to send code',
  mockVerifyCodeError: 'Invalid code',
};

describe('userSlice', () => {
  const initialState = {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    codeSent: false,
    showCodeInput: false,
    authInitialized: false,
  };

  describe('基础状态管理功能', () => {
    it('should handle initial state', () => {
      const result = userReducer(undefined, { type: 'unknown' });
      expect(result.currentUser).toBeNull();
      expect(result.isAuthenticated).toBe(false);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.codeSent).toBe(false);
      expect(result.showCodeInput).toBe(false);
      expect(result.authInitialized).toBe(false);
    });

    it('should handle setShowCodeInput', () => {
      const actual = userReducer(initialState, setShowCodeInput(true));
      expect(actual.showCodeInput).toEqual(true);
    });

    it('should handle logout (local state)', () => {
      const stateWithUser = {
        ...initialState,
        currentUser: testData.mockUser,
        isAuthenticated: true,
      };

      const actual = userReducer(stateWithUser, logout());
      expect(actual.currentUser).toEqual(null);
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.authInitialized).toBe(true);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: testData.mockError };
      const actual = userReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
    });
  });

  describe('验证码发送功能', () => {
    it('should handle sendCode pending state', () => {
      const actual = userReducer(initialState, {
        type: sendCode.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle sendCode fulfilled state', () => {
      const actual = userReducer(initialState, {
        type: sendCode.fulfilled.type,
      });
      expect(actual.loading).toBe(false);
      expect(actual.showCodeInput).toBe(true);
      expect(actual.codeSent).toBe(true);
    });

    it('should handle sendCode rejected state', () => {
      const actual = userReducer(initialState, {
        type: sendCode.rejected.type,
        error: { message: testData.mockSendCodeError },
      });
      expect(actual.loading).toBe(false);
      expect(actual.showCodeInput).toBe(false);
      expect(actual.error).toEqual(testData.mockSendCodeError);
    });
  });

  describe('验证码验证功能', () => {
    it('should handle verifyCode pending state', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle verifyCode fulfilled state', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.fulfilled.type,
        payload: { data: { user: testData.mockUser, token: testData.mockToken } },
      });

      expect(actual.loading).toBe(false);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.currentUser).toBeDefined();
      expect(actual.codeSent).toBe(false);
      expect(actual.showCodeInput).toBe(false);
      expect(actual.authInitialized).toBe(true);
    });

    it('should handle verifyCode rejected state', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.rejected.type,
        error: { message: testData.mockVerifyCodeError },
      });
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual(testData.mockVerifyCodeError);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
