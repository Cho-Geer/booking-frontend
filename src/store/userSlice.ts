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
    status: 'active' | 'inactive' | 'blocked';
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
  /** 验证码倒计时 */
  countdown: number;
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
  countdown: 0,
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
  async (phone: string) => {
    const response = await authService.sendCode(phone);
    return response;
  }
);

/**
 * 验证验证码并登录异步操作
 */
export const verifyCode = createAsyncThunk(
  'user/verifyCode',
  async ({ phone, code }: { phone: string; code: string }) => {
    const response = await authService.verifyCode(phone, code);
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
     * 设置验证码发送状态
     */
    setCodeSent: (state, action: PayloadAction<boolean>) => {
      state.codeSent = action.payload;
    },
    /**
     * 设置倒计时
     */
    setCountdown: (state, action: PayloadAction<number>) => {
      state.countdown = action.payload;
    },
    /**
     * 递减倒计时
     */
    decrementCountdown: (state) => {
      if (state.countdown > 0) {
        state.countdown -= 1;
      }
    },
    /**
     * 登出
     */
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
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
        state.currentUser = action.payload.user;
        // 保存token
        localStorage.setItem('token', action.payload.token);
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
        state.codeSent = true;
        state.countdown = 60;
      })
      .addCase(sendCode.rejected, (state, action) => {
        state.loading = false;
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
        state.currentUser = action.payload.user;
        state.codeSent = false;
        state.countdown = 0;
        // 保存token
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '验证码错误';
      });
  },
});

export const { setCodeSent, setCountdown, decrementCountdown, logout, clearError } = userSlice.actions;
export default userSlice.reducer;