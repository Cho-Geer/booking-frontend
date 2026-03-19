/**
 * SlotTime Slice - 时间段管理
 * 管理可预约时间段和屏蔽时段
 */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { slotTimeApi } from '../services/slotTimeApi';
import { TimeSlot } from '../types';

/**
 * 屏蔽时段类型
 */
export interface BlockedTimeSlot {
  id: string;
  blockedDate: string;
  timeSlotId: string | null;
  reason: string | null;
  blockedBy: string | null;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

/**
 * 时间段状态接口
 */
export interface SlotTimeState {
  timeSlots: TimeSlot[];
  blockedSlots: BlockedTimeSlot[];
  loading: boolean;
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: SlotTimeState = {
  timeSlots: [],
  blockedSlots: [],
  loading: false,
  error: null,
};

/**
 * 获取时间段列表异步操作
 */
export const fetchTimeSlots = createAsyncThunk(
  'slotTime/fetchTimeSlots',
  async () => {
    return await slotTimeApi.getTimeSlots();
  }
);

/**
 * 创建时间段异步操作
 */
export const createTimeSlot = createAsyncThunk(
  'slotTime/createTimeSlot',
  async (payload: { slotTime: string; durationMinutes: number; isActive?: boolean; displayOrder?: number }) => {
    return await slotTimeApi.createTimeSlot(payload);
  }
);

/**
 * 更新时间段异步操作
 */
export const updateTimeSlot = createAsyncThunk(
  'slotTime/updateTimeSlot',
  async ({ id, payload }: { id: string; payload: Partial<{ slotTime: string; durationMinutes: number; isActive: boolean; displayOrder: number }> }) => {
    return await slotTimeApi.updateTimeSlot(id, payload);
  }
);

/**
 * 删除时间段异步操作
 */
export const deleteTimeSlot = createAsyncThunk(
  'slotTime/deleteTimeSlot',
  async (id: string) => {
    await slotTimeApi.deleteTimeSlot(id);
    return id;
  }
);

/**
 * 屏蔽日期异步操作
 */
export const blockDate = createAsyncThunk(
  'slotTime/blockDate',
  async (payload: { blockedDate: string; timeSlotId?: string; reason?: string }) => {
    return await slotTimeApi.blockDate(payload);
  }
);

/**
 * 取消屏蔽日期异步操作
 */
export const unblockDate = createAsyncThunk(
  'slotTime/unblockDate',
  async (id: string) => {
    await slotTimeApi.unblockDate(id);
    return id;
  }
);

/**
 * SlotTime Slice
 */
const slotTimeSlice = createSlice({
  name: 'slotTime',
  initialState,
  reducers: {
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取时间段列表
    builder
      .addCase(fetchTimeSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.timeSlots = action.payload;
      })
      .addCase(fetchTimeSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取时间段列表失败';
      });

    // 创建时间段
    builder
      .addCase(createTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.timeSlots.unshift(action.payload);
      })
      .addCase(createTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建时间段失败';
      });

    // 更新时间段
    builder
      .addCase(updateTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timeSlots.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.timeSlots[index] = action.payload;
        }
      })
      .addCase(updateTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新时间段失败';
      });

    // 删除时间段
    builder
      .addCase(deleteTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.timeSlots = state.timeSlots.filter(s => s.id !== action.payload);
      })
      .addCase(deleteTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除时间段失败';
      });

    // 屏蔽日期
    builder
      .addCase(blockDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockDate.fulfilled, (state, action) => {
        state.loading = false;
        state.blockedSlots.unshift(...state.blockedSlots.filter(s => s.id === action.payload.id));
      })
      .addCase(blockDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '屏蔽日期失败';
      });

    // 取消屏蔽日期
    builder
      .addCase(unblockDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unblockDate.fulfilled, (state, action) => {
        state.loading = false;
        state.blockedSlots = state.blockedSlots.filter(s => s.id !== action.payload);
      })
      .addCase(unblockDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '取消屏蔽日期失败';
      });
  },
});

export const { clearError } = slotTimeSlice.actions;
export default slotTimeSlice.reducer;
