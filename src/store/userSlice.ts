import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../services/userApi';
import { LoginResponseDto } from '@/types';
import { RegisterFormData } from '@/components/molecules/RegisterForm';

/**
 * P3: 検証コード照合失敗の理由コード（バックエンド error.details.reason に対応）
 * 旧バックエンドは reason を返さないため undefined 許容（後方互換）
 */
export type VerifyFailReason = 'MISMATCH' | 'EXHAUSTED' | 'EXPIRED';

/**
 * P3: 照合系 thunk が rejectWithValue で運ぶエラーの標準形
 * （api.ts が正規化した業務メッセージ + error.details.reason）
 */
interface AuthRejection {
  message: string;
  reason?: VerifyFailReason;
}

/**
 * P1: 誤入力カウンタの暫定ロック開始閾値（3 回失敗でロック）
 */
export const VERIFY_ATTEMPTS_LOCK_THRESHOLD = 3;
/**
 * P1: 暫定ロックの基本秒数（閾値到達で 30 秒、以降 2 倍ずつの指数バックオフ）
 */
export const VERIFY_LOCKOUT_BASE_SECONDS = 30;
/**
 * P1: 暫定ロックの上限（15 分）
 */
export const VERIFY_LOCKOUT_MAX_MS = 15 * 60 * 1000;
/**
 * P1: localStorage 永続化キー（UIContext の 'app-theme' パターンに倣う）
 * 書き込みは reducer 内ではなくページの useEffect で行う（reducer は純粋に保つ）
 */
export const VERIFY_ATTEMPTS_STORAGE_KEY = 'auth-verify-attempts';
export const VERIFY_LOCKOUT_UNTIL_STORAGE_KEY = 'auth-lockout-until';

/**
 * バックエンドが返す reason 値を VerifyFailReason に正規化する
 * （未知の値・欠損は undefined = 旧バックエンド扱い）
 */
const normalizeVerifyReason = (reason: unknown): VerifyFailReason | undefined =>
  reason === 'MISMATCH' || reason === 'EXHAUSTED' || reason === 'EXPIRED' ? reason : undefined;

/**
 * api.ts が正規化したエラー（message + details）を rejectWithValue 用の形に変換する
 */
const toAuthRejection = (error: unknown, fallbackMessage: string): AuthRejection => {
  const err = error as { message?: string; details?: { reason?: unknown } };
  return {
    message: err?.message || fallbackMessage,
    reason: normalizeVerifyReason(err?.details?.reason),
  };
};

/**
 * 用户状态接口
 */
interface UserState {
  /** 当前登录用户 */
  currentUser: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    wechat?: string;
    avatar?: string;
    userType: 'customer' | 'admin';
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    /** 是否启用 Salesforce 静态操作员映射（P0-4・RULE-12・仅 profile 响应携带，登录响应无此字段） */
    mappingActive?: boolean;
    isVerified: boolean;
    lastLoginAt?: string;
  } | null;
  /** 登录状态 */
  isAuthenticated: boolean;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 验证码发送状态 */
  codeSent: boolean;
  showCodeInput: boolean;
  authInitialized: boolean;
  /** P1: 検証コード誤入力回数（verifyCode 失敗で +1、成功で 0 に戻る。pending/clearError ではクリアしない） */
  verifyAttempts: number;
  /** P1: 暫定ロックの解除時刻（エポックミリ秒。null はロックなし） */
  lockoutUntil: number | null;
  /** P3: 直近の照合失敗理由（バックエンド error.details.reason 由来。null は旧バックエンド＝区別不可） */
  lastVerifyFailReason: VerifyFailReason | null;
}

/**
 * 初始状态
 */
const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  codeSent: false,
  showCodeInput: false,
  authInitialized: false,
  verifyAttempts: 0,
  lockoutUntil: null,
  lastVerifyFailReason: null
};

/**
 * 用户注册异步操作
 * P3: 失敗時に api.ts が正規化した業務メッセージ + error.details.reason を rejectWithValue で伝達する
 */
export const registerUser = createAsyncThunk<
  LoginResponseDto,
  RegisterFormData,
  { rejectValue: AuthRejection }
>('user/register', async (data, { rejectWithValue }) => {
  try {
    const response = await userApi.register(data);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(toAuthRejection(error, '注册失败'));
  }
});

/**
 * 发送验证码异步操作
 * email 为可选参数：REGISTER 流程必须传入，LOGIN 流程不传（不会出现在请求 payload 中）
 */
export const sendCode = createAsyncThunk(
  'user/sendCode',
  async ({ phoneNumber, type, email }: { phoneNumber: string; type: 'login' | 'register'; email?: string }) => {
    const response = await userApi.sendCode(phoneNumber, type, email);
    return response;
  }
);

/**
 * 验证验证码并登录异步操作
 * P3: 失敗時に api.ts が正規化した業務メッセージ + error.details.reason を rejectWithValue で伝達する
 */
export const verifyCode = createAsyncThunk<
  LoginResponseDto,
  { phoneNumber: string; code: string },
  { rejectValue: AuthRejection }
>('user/verifyCode', async ({ phoneNumber, code }, { rejectWithValue }) => {
  try {
    const response = await userApi.verifyCode(phoneNumber, code);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(toAuthRejection(error, '验证码错误'));
  }
});

/**
 * 用户登出异步操作
 */
export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    await userApi.logout();
  }
);

export const initializeAuth = createAsyncThunk(
  'user/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      
      // For HttpOnly cookies, we can't check their existence via document.cookie
      // Instead, we'll attempt to fetch user data and let the API interceptor handle token refresh
      // The axios interceptor will automatically handle 401 responses and refresh tokens when needed
      
      console.log('Attempting to fetch current user data...');
      const response = await userApi.getCurrentUser();
      console.log('User data fetched successfully:', response);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      console.log('Authentication initialization failed:', {
        status: err?.response?.status,
        message: err?.message,
        timestamp: new Date().toISOString()
      });
      return rejectWithValue(null);
    }
  }
);

/**
 * 切换用户状态异步操作
 */
export const toggleUserStatus = createAsyncThunk(
  'user/toggleUserStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await userApi.toggleUserStatus(id, status);
    return response;
  }
);

/**
 * 用户Slice
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * 设置是否显示验证码输入框
     */
    setShowCodeInput: (state, action: PayloadAction<boolean>) => {
      state.showCodeInput = action.payload;
    },
    /**
     * 登出 (仅清除本地状态)
     * P3: 最後の照合失敗理由（表示用ガイダンス）のみクリアする
     * （verifyAttempts / lockoutUntil は不正防止のためログイン状態に依存せず保持する）
     */
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.authInitialized = true;
      state.lastVerifyFailReason = null;
    },
    /**
     * P1: localStorage から復元した試行回数・ロック状態を反映する
     * （呼び出しはページの useEffect からのみ。永続化の書き込みも reducer 外で行う）
     */
    restoreVerifyGuardState: (
      state,
      action: PayloadAction<{ verifyAttempts: number; lockoutUntil: number | null }>
    ) => {
      state.verifyAttempts = action.payload.verifyAttempts;
      state.lockoutUntil = action.payload.lockoutUntil;
    },
    /**
     * 清除错误信息
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 用户注册
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = {
          ...action.payload.user,
          status: action.payload.user.status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
          phone: action.payload.user.phoneNumber,
          userType: action.payload.user.role === 'ADMIN' ? 'admin' : 'customer',
          isVerified: action.payload.user.status === 'ACTIVE',
        };
        state.authInitialized = true;
        state.showCodeInput = false;
        // P3: 登録成功で失敗理由ガイダンスを解消
        state.lastVerifyFailReason = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        // P3: rejectWithValue ペイロード（業務メッセージ + reason）を優先
        // （reason が無い旧バックエンドではメッセージのみで後方互換を維持）
        state.error = action.payload?.message || action.error.message || '注册失败';
        state.lastVerifyFailReason = action.payload?.reason ?? null;
      })
      // 发送验证码
      .addCase(sendCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCode.fulfilled, (state) => {
        state.loading = false;
        state.showCodeInput = true;
        state.codeSent = true;
        // P3: コードを再取得した時点で古い失敗理由ガイダンスは無効
        state.lastVerifyFailReason = null;
      })
      .addCase(sendCode.rejected, (state, action) => {
        state.loading = false;
        state.showCodeInput = false;
        // 现在 action.error.message 已经是具体的业务错误信息了（如"手机号未注册"）
        // 不需要再在这里做判断
        state.error = action.error.message || '发送验证码失败';
      })
      // 验证验证码
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = {
          ...action.payload.user,
          status: action.payload.user.status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
          phone: action.payload.user.phoneNumber,
          userType: action.payload.user.role === 'ADMIN' ? 'admin' : 'customer',
          isVerified: action.payload.user.status === 'ACTIVE',
        };
        state.codeSent = false;
        state.authInitialized = true;
        state.showCodeInput = false;
        // P1: 照合成功でカウンタ・ロックを初期値へ戻す
        state.verifyAttempts = 0;
        state.lockoutUntil = null;
        state.lastVerifyFailReason = null;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        // P3: rejectWithValue ペイロード（業務メッセージ + reason）を優先
        // （reason が無い旧バックエンドではメッセージのみで後方互換を維持）
        state.error = action.payload?.message || action.error.message || '验证码错误';
        state.lastVerifyFailReason = action.payload?.reason ?? null;
        // P1: 誤入力カウンタは失敗時にのみ加算する
        // （verifyCode/sendCode の pending・clearError はこのフィールドに触れない）
        state.verifyAttempts += 1;
        if (state.verifyAttempts >= VERIFY_ATTEMPTS_LOCK_THRESHOLD) {
          // 指数バックオフ: 3 回目 30 秒 → 4 回目 60 秒 → ...（上限 15 分）
          const backoffMs =
            VERIFY_LOCKOUT_BASE_SECONDS * 1000 * 2 ** (state.verifyAttempts - VERIFY_ATTEMPTS_LOCK_THRESHOLD);
          state.lockoutUntil = Date.now() + Math.min(backoffMs, VERIFY_LOCKOUT_MAX_MS);
        }
      })
      // 登出
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.authInitialized = true;
      })
      // 登出
      .addCase(logoutUser.rejected, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.authInitialized = true;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.authInitialized = false;
        state.loading = true;
        console.log('Authentication initialization started');
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.currentUser = {
          ...action.payload,
          status: action.payload.status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
          isVerified: action.payload.status === 'ACTIVE',
          userType: action.payload?.role === 'ADMIN' ? 'admin' : 'customer',
        };
        state.isAuthenticated = true;
        state.authInitialized = true;
        state.loading = false;
        console.log('Authentication initialization completed (authenticated)');
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.authInitialized = true;
        state.loading = false;
        console.log('Authentication initialization completed (unauthenticated)');
      })
      // 切换用户状态
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        // 如果当前用户是被更新的用户，更新 currentUser
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = {
            ...state.currentUser,
            status: action.payload.status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
          };
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '切换用户状态失败';
      });
  },
});

export const { setShowCodeInput, logout, clearError, restoreVerifyGuardState } = userSlice.actions;
export default userSlice.reducer;
