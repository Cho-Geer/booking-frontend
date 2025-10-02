import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../services/bookingService';
import { BookingStatus, TimeSlot, Booking } from '../types';

/**
 * 预约状态接口
 */
interface BookingState {
  /** 用户的预约列表 */
  bookings: Booking[];
  /** 可用时间段 */
  availableSlots: TimeSlot[];
  /** 当前选中的日期 */
  selectedDate: string;
  /** 当前选中的时间段 */
  selectedSlot: TimeSlot | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 创建预约的加载状态 */
  creatingBooking: boolean;
  /** 操作成功状态 */
  success: boolean;
}

/**
 * 初始状态
 */
const initialState: BookingState = {
  bookings: [],
  availableSlots: [],
  selectedDate: new Date().toISOString().split('T')[0],
  selectedSlot: null,
  loading: false,
  error: null,
  creatingBooking: false,
  success: false
};

/**
 * 获取用户预约列表异步操作
 */
export const getBookings = createAsyncThunk(
  'booking/getBookings',
  async () => {
    const response = await bookingService.getBookings();
    return response;
  }
);

/**
 * 获取可用时间段异步操作
 */
export const getAvailableSlots = createAsyncThunk(
  'booking/getAvailableSlots',
  async (date: string) => {
    const response = await bookingService.getAvailableSlots(date);
    return response;
  }
);

/**
 * 创建预约异步操作
 */
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: {
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerWechat?: string;
  }) => {
    const response = await bookingService.createBooking(bookingData);
    return response;
  }
);

/**
 * 取消预约异步操作
 */
export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (bookingId: string) => {
    const response = await bookingService.cancelBooking(bookingId);
    return { bookingId, ...response };
  }
);

/**
 * 预约Slice
 */
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    /**
     * 设置选中的日期
     */
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    /**
     * 设置选中的时间段
     */
    setSelectedSlot: (state, action: PayloadAction<TimeSlot | null>) => {
      state.selectedSlot = action.payload;
    },
    /**
     * 清除错误信息
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * 重置预约状态
     */
    resetBookingState: (state) => {
      state.selectedSlot = null;
      state.error = null;
      state.success = false;
      state.creatingBooking = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取预约列表
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取预约列表失败';
      })
      // 获取可用时间段
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取可用时间段失败';
      })
      // 创建预约
      .addCase(createBooking.pending, (state) => {
        state.creatingBooking = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creatingBooking = false;
        state.success = true;
        state.bookings.unshift(action.payload);
        state.selectedSlot = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creatingBooking = false;
        state.success = false;
        state.error = action.error.message || '创建预约失败';
      })
      // 取消预约
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.bookingId);
        if (index !== -1) {
          state.bookings[index].status = BookingStatus.CANCELLED;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '取消预约失败';
      });
  },
});

export const { setSelectedDate, setSelectedSlot, clearError, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;