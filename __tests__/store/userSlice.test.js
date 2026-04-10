/**
 * userSlice unit tests
 */
import userReducer, {
  sendCode,
  verifyCode,
  logout,
  clearError,
  setShowCodeInput,
} from '@/store/userSlice';

jest.mock('@/services/userApi');

const testConstants = {
  mockUserId: '1',
  mockUserPhone: '13800138000',
};

const testData = {
  mockUser: {
    id: testConstants.mockUserId,
    name: 'Test User',
    phoneNumber: testConstants.mockUserPhone,
    role: 'USER',
    status: 'ACTIVE',
  },
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

  describe('basic state management', () => {
    it('handles initial state', () => {
      const result = userReducer(undefined, { type: 'unknown' });
      expect(result.currentUser).toBeNull();
      expect(result.isAuthenticated).toBe(false);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.codeSent).toBe(false);
      expect(result.showCodeInput).toBe(false);
      expect(result.authInitialized).toBe(false);
    });

    it('handles setShowCodeInput', () => {
      const actual = userReducer(initialState, setShowCodeInput(true));
      expect(actual.showCodeInput).toEqual(true);
    });

    it('handles logout', () => {
      const stateWithUser = {
        ...initialState,
        currentUser: {
          id: testConstants.mockUserId,
          phone: testConstants.mockUserPhone,
          name: 'Test User',
          userType: 'customer',
          status: 'ACTIVE',
          isVerified: true,
        },
        isAuthenticated: true,
      };

      const actual = userReducer(stateWithUser, logout());
      expect(actual.currentUser).toEqual(null);
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.authInitialized).toBe(true);
    });

    it('handles clearError', () => {
      const stateWithError = { ...initialState, error: testData.mockError };
      const actual = userReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
    });
  });

  describe('sendCode', () => {
    it('handles pending state', () => {
      const actual = userReducer(initialState, {
        type: sendCode.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('handles fulfilled state', () => {
      const actual = userReducer(initialState, {
        type: sendCode.fulfilled.type,
      });
      expect(actual.loading).toBe(false);
      expect(actual.showCodeInput).toBe(true);
      expect(actual.codeSent).toBe(true);
    });

    it('handles rejected state', () => {
      const actual = userReducer(initialState, {
        type: sendCode.rejected.type,
        error: { message: testData.mockSendCodeError },
      });
      expect(actual.loading).toBe(false);
      expect(actual.showCodeInput).toBe(false);
      expect(actual.error).toEqual(testData.mockSendCodeError);
    });
  });

  describe('verifyCode', () => {
    it('handles pending state', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('handles fulfilled state with the current API payload shape', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.fulfilled.type,
        payload: { user: testData.mockUser },
      });

      expect(actual.loading).toBe(false);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.currentUser).toEqual({
        ...testData.mockUser,
        phone: testData.mockUser.phoneNumber,
        userType: 'customer',
        isVerified: true,
      });
      expect(actual.codeSent).toBe(false);
      expect(actual.showCodeInput).toBe(false);
      expect(actual.authInitialized).toBe(true);
    });

    it('handles rejected state', () => {
      const actual = userReducer(initialState, {
        type: verifyCode.rejected.type,
        error: { message: testData.mockVerifyCodeError },
      });
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual(testData.mockVerifyCodeError);
    });
  });
});
