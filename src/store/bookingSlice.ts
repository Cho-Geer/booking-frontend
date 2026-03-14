import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../services/bookingService';
import { BookingStatus, TimeSlot, BookingState, AppointmentQuery, AppointmentListResponse } from '../types';
import { getTodayLocalDate } from '../utils/dateUtils';

/**
 * 初始状态
 */
const initialState: BookingState = {
  bookings: [],
  availableSlots: [],
  services: [],
  selectedDate: getTodayLocalDate(),
  selectedSlot: null,
  loading: false,
  slotsLoading: false,
  bookingsLoading: false,
  error: null,
  creatingBooking: false,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {}
};

/**
 * 获取用户预约列表异步操作
 */
export const getBookings = createAsyncThunk(
  'booking/getBookings',
  async (query?: AppointmentQuery) => {
    const response = await bookingService.getBookings(query || {});
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
 * 获取服务列表异步操作
 */
export const getServices = createAsyncThunk(
  'booking/getServices',
  async () => {
    const response = await bookingService.getServices();
    return response;
  }
);

/**
 * 创建预约异步操作
 */
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: {
    appointmentDate: string;
    timeSlotId: string;
    userId: string;
    notes?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerWechat?: string;
    serviceId: string;
    serviceName: string;
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

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async (payload: {
    id: string;
    appointmentDate: string;
    timeSlotId: string;
    serviceId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerWechat?: string;
    notes?: string;
  }) => {
    const { id, ...bookingData } = payload;
    const response = await bookingService.updateBooking(id, bookingData);
    return response;
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
    /**
     * 设置分页
     */
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    /**
     * 设置筛选条件
     */
    setFilters: (state, action: PayloadAction<AppointmentQuery>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // 重置页码
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取预约列表
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.bookingsLoading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsLoading = false;
        state.bookings = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.bookingsLoading = false;
        state.error = action.error.message || '获取预约列表失败';
      })
      // 获取可用时间段
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.slotsLoading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slotsLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.slotsLoading = false;
        state.error = action.error.message || '获取可用时间段失败';
      })
      // 获取服务列表
      .addCase(getServices.pending, (state) => {
        // state.loading = true; // 可选：是否需要全屏loading
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.services = action.payload;
      })
      .addCase(getServices.rejected, (state, action) => {
        state.error = action.error.message || '获取服务列表失败';
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
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新预约失败';
      });
  },
});

export const { setSelectedDate, setSelectedSlot, clearError, resetBookingState, setPage, setFilters } = bookingSlice.actions;
export default bookingSlice.reducer;
