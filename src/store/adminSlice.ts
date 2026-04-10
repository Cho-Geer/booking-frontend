/**
 * Admin Slice - 运营管理
 * 管理后台的用户列表、运营统计、系统日志、活动日志等
 */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../services/adminApi';
import { systemApi } from '../services/systemApi';
import { User, AdminUsersQuery, Pagination, UserType, UserRole, UserStatus } from '../types';

/**
 * 预约统计数据
 */
export interface AppointmentStatistics {
  today: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  week: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  month: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  servicePopularity: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
  }>;
  revenue: {
    today: number;
    week: number;
    month: number;
  };
}

/**
 * 活动日志
 */
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/**
 * 系统日志
 */
export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * 服务表单状态
 */
export interface ServiceForm {
  name: string;
  imageUrl: string;
  description: string;
  price: string;
  durationMinutes?: number;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * 管理员状态接口
 */
export interface AdminState {
  // 标签页
  activeTab: string;
  // 服务表单状态
  editingServiceId: string | null;
  serviceForm: ServiceForm;
  // 预约操作加载状态
  bookingActionLoading: boolean;
  // 全局刷新加载状态
  globalRefreshLoading: boolean;
  // 用户列表（管理员）
  users: User[];
  globalErrorMessage: string | null;
  usersPagination: Pagination;
  usersLoading: boolean;
  usersError: string | null;
  // 运营统计
  statistics: AppointmentStatistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;
  // 活动日志
  activityLogs: ActivityLog[];
  activityLogsPagination: Pagination;
  activityLogsLoading: boolean;
  activityLogsError: string | null;
  // 系统日志
  systemLogs: SystemLog[];
  systemLogsPagination: Pagination;
  systemLogsLoading: boolean;
  systemLogsError: string | null;
  // 通用
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: AdminState = {
  activeTab: 'bookings',
  editingServiceId: null,
  serviceForm: {
    name: '',
    imageUrl: '',
    description: '',
    price: '',
    durationMinutes: 30,
    isActive: false,
  },
  bookingActionLoading: false,
  globalRefreshLoading: false, // 全局刷新加载状态
  globalErrorMessage: null as string | null, // 全局错误消息（带预约编号）
  users: [],
  usersPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  usersLoading: false,
  usersError: null,
  statistics: null,
  statisticsLoading: false,
  statisticsError: null,
  activityLogs: [],
  activityLogsPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  activityLogsLoading: false,
  activityLogsError: null,
  systemLogs: [],
  systemLogsPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  systemLogsLoading: false,
  systemLogsError: null,
  error: null,
};

/**
 * 获取用户列表异步操作（管理员）
 */
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (query?: AdminUsersQuery) => {
    const pagination: Pagination = {
      page: query?.page || 1,
      limit: query?.limit || 10,
    };
    const apiQuery = {
      name: query?.name,
      phone: query?.phone,
      email: query?.email,
      status: query?.status,
      userType: query?.userType,
      startDate: query?.startDate,
      endDate: query?.endDate,
    };
    const response = await adminApi.getUsers(apiQuery, pagination);
    return response;
  }
);

/**
 * 切换用户状态异步操作
 */
export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ id, status }: { id: string; status: string }): Promise<any> => {
    const response = await adminApi.toggleUserStatus(id, status);
    return response;
  }
);

/**
 * 更新用户类型异步操作
 */
export const updateUserType = createAsyncThunk(
  'admin/updateUserType',
  async ({ id, userType }: { id: string; userType: 'CUSTOMER' | 'ADMIN' }): Promise<any> => {
    const response = await adminApi.updateUserType(id, userType);
    return response;
  }
);

/**
 * 获取运营统计异步操作
 */
export const fetchStatistics = createAsyncThunk(
  'admin/fetchStatistics',
  async () => {
    const response = await systemApi.getStatistics();
    return response;
  }
);

/**
 * 获取活动日志异步操作
 */
export const fetchActivityLogs = createAsyncThunk(
  'admin/fetchActivityLogs',
  async (query?: { page?: number; limit?: number }) => {
    const response = await systemApi.getActivityLogs(query);
    return response;
  }
);

/**
 * 获取系统日志异步操作
 */
export const fetchSystemLogs = createAsyncThunk(
  'admin/fetchSystemLogs',
  async (query?: { page?: number; limit?: number; level?: string }) => {
    const response = await systemApi.getSystemLogs(query);
    return response;
  }
);

/**
 * Admin Slice
 */
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    /**
     * 设置活跃标签
     */
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
      state.globalErrorMessage = null;
    },
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
      state.usersError = null;
      state.statisticsError = null;
      state.activityLogsError = null;
      state.systemLogsError = null;
      state.globalErrorMessage = null;
    },
    /**
     * 设置编辑服务ID
     */
    setEditingServiceId: (state, action: PayloadAction<string | null>) => {
      state.editingServiceId = action.payload;
    },
    /**
     * 设置服务表单
     */
    setServiceForm: (state, action: PayloadAction<Partial<ServiceForm>>) => {
      state.serviceForm = {
        ...state.serviceForm,
        ...action.payload,
      };
    },
    /**
     * 重置服务表单
     */
    resetServiceForm: (state) => {
      state.serviceForm = initialState.serviceForm;
      state.editingServiceId = null;
    },
    /**
     * 设置预约操作加载状态
     */
    setBookingActionLoading: (state, action: PayloadAction<boolean>) => {
      state.bookingActionLoading = action.payload;
    },
    /**
     * 设置全局刷新加载状态
     */
    setGlobalRefreshLoading: (state, action: PayloadAction<boolean>) => {
      state.globalRefreshLoading = action.payload;
    },
    /**
     * 设置全局错误消息
     */
    setGlobalErrorMessage: (state, action: PayloadAction<string>) => {
      state.globalErrorMessage = action.payload;
    },
    /**
     * 清除全局错误消息
     */
    clearGlobalErrorMessage: (state) => {
      state.globalErrorMessage = null;
    }
  },
  extraReducers: (builder) => {
    // 获取用户列表
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action: PayloadAction<{ items: User[]; page: number; limit: number; total: number; totalPages: number }>) => {
        state.usersLoading = false;
        const data = action.payload;
        state.users = data.items || [];
        state.usersPagination = {
          page: data.page || 1,
          limit: data.limit || 10,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        };
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.error.message || '获取用户列表失败';
      });

    // 获取运营统计
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action: PayloadAction<AppointmentStatistics>) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.error.message || '获取运营统计失败';
      });

    // 获取活动日志
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.activityLogsLoading = true;
        state.activityLogsError = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action: PayloadAction<{ items: ActivityLog[]; page: number; limit: number; total: number; totalPages: number } | ActivityLog[]>) => {
        state.activityLogsLoading = false;
        const data = action.payload;
        state.activityLogs = (data as { items: ActivityLog[]; page: number; limit: number; total: number; totalPages: number }).items as ActivityLog[] || data || [] as ActivityLog[];
        if (!Array.isArray(data)) {
          state.activityLogsPagination = {
            page: data.page || 1,
            limit: data.limit || 10,
            total: data.total || 0,
            totalPages: data.totalPages || 0,
          };
        }
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.activityLogsLoading = false;
        state.activityLogsError = action.error.message || '获取活动日志失败';
      });

    // 获取系统日志
    builder
      .addCase(fetchSystemLogs.pending, (state) => {
        state.systemLogsLoading = true;
        state.systemLogsError = null;
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action: PayloadAction<{ items: SystemLog[]; page: number; limit: number; total: number; totalPages: number } | SystemLog[]>) => {
        state.systemLogsLoading = false;
        const data = action.payload;
        state.systemLogs = (data as { items: SystemLog[]; page: number; limit: number; total: number; totalPages: number }).items as SystemLog[] || data || [] as SystemLog[];
        if (!Array.isArray(data)) {
          state.systemLogsPagination = {
            page: data.page || 1,
            limit: data.limit || 10,
            total: data.total || 0,
            totalPages: data.totalPages || 0,
          };
        }
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.systemLogsLoading = false;
        state.systemLogsError = action.error.message || '获取系统日志失败';
      });
    
    // 切换用户状态
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.bookingActionLoading = true;
        state.usersError = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<{ id: string; status: string; userType: UserType }>) => {
        state.bookingActionLoading = false;
        // ユーザーリストを更新
        const updatedUser = action.payload;
        state.users = state.users.map(user => 
          user.id === updatedUser.id ? { ...user, status: updatedUser.status as UserStatus, userType: updatedUser.userType.toLowerCase() as UserType || user.userType } : user
        );
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.bookingActionLoading = false;
        state.usersError = action.error.message || '切换用户状态失败';
      });

    // 更新用户类型
    builder
      .addCase(updateUserType.pending, (state) => {
        state.bookingActionLoading = true;
        state.usersError = null;
      })
      .addCase(updateUserType.fulfilled, (state, action: PayloadAction<{ id: string; userType: UserType; role?: string }>) => {
        state.bookingActionLoading = false;
        // ユーザーリストを更新
        const updatedUser = action.payload;
        state.users = state.users.map(user => 
          user.id === updatedUser.id ? { ...user, userType: updatedUser.userType.toLowerCase() as UserType, role: updatedUser.role as UserRole || user.role } : user
        );
      })
      .addCase(updateUserType.rejected, (state, action) => {
        state.bookingActionLoading = false;
        state.usersError = action.error.message || '更新用户类型失败';
      });
  },
});

export const { setActiveTab, clearError, setEditingServiceId, setServiceForm, resetServiceForm, setBookingActionLoading, setGlobalRefreshLoading, setGlobalErrorMessage, clearGlobalErrorMessage } = adminSlice.actions;
export default adminSlice.reducer;
