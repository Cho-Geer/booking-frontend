import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { RegisterFormData } from '@/components/molecules/RegisterForm';

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
    isVerified: boolean;
    lastLoginAt?: string;
    loginCount: number;
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
  authInitialized: false
};

/**
 * 用户注册异步操作
 */
export const registerUser = createAsyncThunk(
  'user/register',
  async (data: RegisterFormData) => {
    const response = await authService.register(data);
    return response;
  }
);

/**
 * 发送验证码异步操作
 */
export const sendCode = createAsyncThunk(
  'user/sendCode',
  async ({ phoneNumber, type }: { phoneNumber: string; type: 'login' | 'register' }) => {
    const response = await authService.sendCode(phoneNumber, type);
    return response;
  }
);

/**
 * 验证验证码并登录异步操作
 */
export const verifyCode = createAsyncThunk(
  'user/verifyCode',
  async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
    const response = await authService.verifyCode(phoneNumber, code);
    return response;
  }
);

/**
 * 用户登出异步操作
 */
export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    await authService.logout();
  }
);

export const initializeAuth = createAsyncThunk(
  'user/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch {
      return rejectWithValue(null);
    }
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
     */
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.authInitialized = true;
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
        state.currentUser = action.payload.data.user;
        state.authInitialized = true;
        // 登录成功后，重置验证码输入框状态
        state.showCodeInput = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '注册失败';
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
        state.currentUser = action.payload.data.user;
        state.codeSent = false;
        state.authInitialized = true;
        // 登录成功后，重置验证码输入框状态
        state.showCodeInput = false;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '验证码错误';
      })
      // 登出
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.authInitialized = true;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.authInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.authInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.authInitialized = true;
      });
  },
});

export const { setShowCodeInput, logout, clearError } = userSlice.actions;
export default userSlice.reducer;
