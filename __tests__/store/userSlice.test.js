/**
 * userSlice unit tests
 */
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  sendCode,
  verifyCode,
  registerUser,
  logout,
  logoutUser,
  clearError,
  setShowCodeInput,
  restoreVerifyGuardState,
} from '@/store/userSlice';
import { userApi } from '@/services/userApi';

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
    verifyAttempts: 0,
    lockoutUntil: null,
    lastVerifyFailReason: null,
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
      expect(result.verifyAttempts).toBe(0);
      expect(result.lockoutUntil).toBeNull();
      expect(result.lastVerifyFailReason).toBeNull();
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
      expect(actual.codeSent).toBe(false);
      expect(actual.error).toEqual(testData.mockSendCodeError);
    });
  });

  describe('sendCode（発码失敗時の状態遷移）', () => {
    const makeStore = () => configureStore({ reducer: { user: userReducer } });
    const sendCodeArgs = {
      phoneNumber: testConstants.mockUserPhone,
      type: 'register',
      email: 'existing@example.com',
    };

    it('backend の業務エラーメッセージが error に入り、コード入力欄は開かない', async () => {
      const store = makeStore();
      const businessError = '邮箱 existing@example.com 已存在';
      userApi.sendCode.mockRejectedValueOnce(new Error(businessError));

      const result = await store.dispatch(sendCode(sendCodeArgs));

      expect(sendCode.rejected.match(result)).toBe(true);
      expect(result.error.message).toBe(businessError);

      const state = store.getState().user;
      expect(state.error).toBe(businessError);
      expect(state.showCodeInput).toBe(false);
      expect(state.codeSent).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('成功時のみ showCodeInput / codeSent が true になる', async () => {
      const store = makeStore();
      userApi.sendCode.mockResolvedValueOnce(null);

      const result = await store.dispatch(sendCode(sendCodeArgs));

      expect(sendCode.fulfilled.match(result)).toBe(true);

      const state = store.getState().user;
      expect(state.error).toBeNull();
      expect(state.showCodeInput).toBe(true);
      expect(state.codeSent).toBe(true);
      expect(state.loading).toBe(false);
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

  describe('P1: verifyAttempts / lockoutUntil（ブルートフォースガード）', () => {
    const NOW = 1000000000000;

    const makeRejectedAction = () => ({
      type: verifyCode.rejected.type,
      error: { message: testData.mockVerifyCodeError },
    });

    const rejectTimes = (times) => {
      let state = { ...initialState };
      for (let i = 0; i < times; i += 1) {
        state = userReducer(state, makeRejectedAction());
      }
      return state;
    };

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('verifyCode rejected のたびに verifyAttempts が +1 される（閾値未満ではロックなし）', () => {
      let state = userReducer({ ...initialState }, makeRejectedAction());
      expect(state.verifyAttempts).toBe(1);
      expect(state.lockoutUntil).toBeNull();

      state = userReducer(state, makeRejectedAction());
      expect(state.verifyAttempts).toBe(2);
      expect(state.lockoutUntil).toBeNull();
    });

    it('閾値（3 回）到達で lockoutUntil に 30 秒後の時刻が設定される', () => {
      const state = rejectTimes(3);
      expect(state.verifyAttempts).toBe(3);
      expect(state.lockoutUntil).toBe(NOW + 30 * 1000);
    });

    it('4 回目の失敗でバックオフが 60 秒に伸びる（指数バックオフ）', () => {
      const state = rejectTimes(4);
      expect(state.verifyAttempts).toBe(4);
      expect(state.lockoutUntil).toBe(NOW + 60 * 1000);
    });

    it('バックオフは 15 分で頭打ちになる', () => {
      const state = rejectTimes(8);
      expect(state.verifyAttempts).toBe(8);
      expect(state.lockoutUntil).toBe(NOW + 15 * 60 * 1000);
    });

    it('verifyCode fulfilled でカウンタ・ロック・失敗理由がリセットされる', () => {
      const lockedState = rejectTimes(3);
      const actual = userReducer(lockedState, {
        type: verifyCode.fulfilled.type,
        payload: { user: testData.mockUser },
      });
      expect(actual.verifyAttempts).toBe(0);
      expect(actual.lockoutUntil).toBeNull();
      expect(actual.lastVerifyFailReason).toBeNull();
    });

    it('verifyCode pending では試行回数・ロックがクリアされない', () => {
      const lockedState = rejectTimes(3);
      const actual = userReducer(lockedState, { type: verifyCode.pending.type });
      expect(actual.verifyAttempts).toBe(3);
      expect(actual.lockoutUntil).toBe(NOW + 30 * 1000);
    });

    it('sendCode pending でも試行回数・ロックがクリアされない', () => {
      const lockedState = rejectTimes(3);
      const actual = userReducer(lockedState, { type: sendCode.pending.type });
      expect(actual.verifyAttempts).toBe(3);
      expect(actual.lockoutUntil).toBe(NOW + 30 * 1000);
    });

    it('clearError でも試行回数・ロックがクリアされない', () => {
      const lockedState = rejectTimes(3);
      const actual = userReducer(lockedState, clearError());
      expect(actual.verifyAttempts).toBe(3);
      expect(actual.lockoutUntil).toBe(NOW + 30 * 1000);
    });

    it('restoreVerifyGuardState で永続化された状態を復元できる', () => {
      const actual = userReducer(
        { ...initialState },
        restoreVerifyGuardState({ verifyAttempts: 5, lockoutUntil: NOW + 120000 })
      );
      expect(actual.verifyAttempts).toBe(5);
      expect(actual.lockoutUntil).toBe(NOW + 120000);
    });
  });

  describe('P3: details.reason の伝達（api → thunk → slice）', () => {
    const makeStore = () => configureStore({ reducer: { user: userReducer } });
    const verifyArgs = { phoneNumber: testConstants.mockUserPhone, code: '000000' };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('EXPIRED の reason が lastVerifyFailReason に入り、メッセージは業務メッセージのまま', async () => {
      const store = makeStore();
      const backendError = Object.assign(new Error('验证码错误或已过期'), {
        details: { reason: 'EXPIRED' },
      });
      userApi.verifyCode.mockRejectedValueOnce(backendError);

      const result = await store.dispatch(verifyCode(verifyArgs));

      expect(verifyCode.rejected.match(result)).toBe(true);
      const state = store.getState().user;
      expect(state.error).toBe('验证码错误或已过期');
      expect(state.lastVerifyFailReason).toBe('EXPIRED');
      expect(state.verifyAttempts).toBe(1);
    });

    it('reason がない旧バックエンドでは lastVerifyFailReason は null のまま（後方互換）', async () => {
      const store = makeStore();
      userApi.verifyCode.mockRejectedValueOnce(new Error('验证码错误或已过期'));

      await store.dispatch(verifyCode(verifyArgs));

      const state = store.getState().user;
      expect(state.error).toBe('验证码错误或已过期');
      expect(state.lastVerifyFailReason).toBeNull();
    });

    it('未知の reason 値は無視される', async () => {
      const store = makeStore();
      const backendError = Object.assign(new Error('验证码错误或已过期'), {
        details: { reason: 'SOMETHING_ELSE' },
      });
      userApi.verifyCode.mockRejectedValueOnce(backendError);

      await store.dispatch(verifyCode(verifyArgs));

      expect(store.getState().user.lastVerifyFailReason).toBeNull();
    });

    it('registerUser rejected の reason も lastVerifyFailReason に入る（照合カウンタには影響しない）', async () => {
      const store = makeStore();
      const backendError = Object.assign(new Error('验证码错误或已过期'), {
        details: { reason: 'MISMATCH' },
      });
      userApi.register.mockRejectedValueOnce(backendError);

      await store.dispatch(
        registerUser({
          name: 'Test User',
          phoneNumber: testConstants.mockUserPhone,
          email: 'test@example.com',
          verificationCode: '000000',
        })
      );

      const state = store.getState().user;
      expect(state.error).toBe('验证码错误或已过期');
      expect(state.lastVerifyFailReason).toBe('MISMATCH');
      expect(state.verifyAttempts).toBe(0);
    });

    it('sendCode fulfilled（コード再取得）で失敗理由ガイダンスが解消される', async () => {
      const store = makeStore();
      const backendError = Object.assign(new Error('验证码错误或已过期'), {
        details: { reason: 'EXHAUSTED' },
      });
      userApi.verifyCode.mockRejectedValueOnce(backendError);
      await store.dispatch(verifyCode(verifyArgs));
      expect(store.getState().user.lastVerifyFailReason).toBe('EXHAUSTED');

      userApi.sendCode.mockResolvedValueOnce(null);
      await store.dispatch(sendCode({ phoneNumber: testConstants.mockUserPhone, type: 'login' }));

      expect(store.getState().user.lastVerifyFailReason).toBeNull();
    });
  });

  describe('P3: logoutUser でも lastVerifyFailReason をクリアする（sync logout との対称性）', () => {
    it('logoutUser fulfilled で lastVerifyFailReason がクリアされる', () => {
      const stateWithReason = {
        ...initialState,
        isAuthenticated: true,
        lastVerifyFailReason: 'MISMATCH',
      };
      const actual = userReducer(stateWithReason, { type: logoutUser.fulfilled.type });
      expect(actual.currentUser).toBeNull();
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.authInitialized).toBe(true);
      expect(actual.lastVerifyFailReason).toBeNull();
    });

    it('logoutUser rejected でも lastVerifyFailReason がクリアされる', () => {
      const stateWithReason = {
        ...initialState,
        isAuthenticated: true,
        lastVerifyFailReason: 'EXPIRED',
      };
      const actual = userReducer(stateWithReason, {
        type: logoutUser.rejected.type,
        error: { message: 'logout failed' },
      });
      expect(actual.currentUser).toBeNull();
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.lastVerifyFailReason).toBeNull();
    });
  });
});
