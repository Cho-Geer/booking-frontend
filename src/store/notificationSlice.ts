/**
 * Notification Slice - 通知管理
 * 管理用户通知列表和状态
 */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../services/notificationApi';
import { NotificationQuery } from '@/types';

/**
 * 通知类型
 */
export interface BackendNotification {
  id: string;
  userId: string;
  appointmentId: string | null;
  type: 'SMS' | 'EMAIL' | 'WECHAT' | 'PUSH';
  title: string;
  content: string;
  isRead: boolean;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  scheduledFor: string | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * 通知状态接口
 */
export interface NotificationState {
  notifications: BackendNotification[];
  unreadCount: number;
  loading: boolean;
  sending: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 初始状态
 */
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  sending: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

/**
 * 获取通知列表异步操作
 */
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (query?: NotificationQuery) => {
    return await notificationApi.getNotifications(query);
  }
);

/**
 * 获取未读数量异步操作
 */
export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async () => {
    return await notificationApi.getUnreadCount();
  }
);

/**
 * 标记通知为已读异步操作
 */
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string) => {
    await notificationApi.markAsRead(id);
    return id;
  }
);

/**
 * 标记所有通知为已读异步操作
 */
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async () => {
    await notificationApi.markAllAsRead();
    return true;
  }
);

/**
 * 发送通知异步操作
 */
export const sendNotification = createAsyncThunk(
  'notification/sendNotification',
  async (payload: {
    userId?: string;
    type: 'SMS' | 'EMAIL' | 'WECHAT' | 'PUSH';
    title: string;
    content: string;
    priority?: 'low' | 'medium' | 'high';
    data?: Record<string, unknown>;
    scheduledAt?: string;
  }) => {
    return await notificationApi.sendNotification(payload);
  }
);

/**
 * 广播系统通知异步操作
 */
export const broadcastNotification = createAsyncThunk(
  'notification/broadcastNotification',
  async (payload: {
    title: string;
    content: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    await notificationApi.broadcastNotification(payload);
  }
);

/**
 * 删除通知异步操作
 */
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id: string) => {
    await notificationApi.deleteNotification(id);
    return id;
  }
);

/**
 * Notification Slice
 */
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * 更新本地通知状态
     */
    updateLocalNotification: (state, action: PayloadAction<{ id: string; updates: Partial<BackendNotification> }>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...action.payload.updates };
      }
    },
  },
  extraReducers: (builder) => {
    // 获取通知列表
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取通知列表失败';
      });

    // 获取未读数量
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // 标记为已读
    builder
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          state.notifications[index].isRead = true;
          state.notifications[index].readAt = new Date().toISOString();
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '标记已读失败';
      });

    // 标记全部为已读
    builder
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(n => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '标记全部已读失败';
      });

    // 发送通知
    builder
      .addCase(sendNotification.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.sending = false;
        if (action.payload) {
          state.notifications.unshift(action.payload);
        }
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message || '发送通知失败';
      });

    // 广播通知
    builder
      .addCase(broadcastNotification.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(broadcastNotification.fulfilled, (state) => {
        state.sending = false;
      })
      .addCase(broadcastNotification.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message || '广播通知失败';
      });

    // 删除通知
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const deleted = state.notifications.find(n => n.id === action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        if (deleted && !deleted.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除通知失败';
      });
  },
});

export const { clearError, updateLocalNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
