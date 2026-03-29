import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingApi } from '../services/bookingApi';
import { BookingStatus, TimeSlot, BookingState, AppointmentQuery, AppointmentListResponse } from '../types';
import { getTodayLocalDate } from '../utils/dateUtils';

/**
 * 初始状态
 */
const initialState: BookingState = {
  bookings: [],
  slotReferenceBookings: [],
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
  updateSuccess: false,
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
    const response = await bookingApi.getBookings(query || {});
    return response;
  }
);

/**
 * 获取指定日期所有预约（无分页）异步操作
 * 用于时段状态映射，不受分页影响
 */
export const getBookingsByDate = createAsyncThunk(
  'booking/getBookingsByDate',
  async (date: string) => {
    const response = await bookingApi.getBookingsByDate(date);
    return response;
  }
);

/**
 * 获取可用时间段异步操作
 */
// export const getAvailableSlots = createAsyncThunk(
//   'booking/getAvailableSlots',
//   async (date: string) => {
//     const response = await bookingApi.getAvailableSlots(date);
//     return response;
//   }
// );

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
    const response = await bookingApi.createBooking(bookingData);
    return response;
  }
);

/**
 * 取消预约异步操作
 */
export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (bookingId: string) => {
    const response = await bookingApi.cancelBooking(bookingId);
    return { bookingId, ...response };
  }
);

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async (
    payload: {
      id: string;
      appointmentDate?: string;
      timeSlotId?: string;
      serviceId?: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerWechat?: string;
      notes?: string;
      status?: BookingStatus;
    },
  ) => {
      const { id, ...bookingData } = payload;
      const response = await bookingApi.updateBooking(id, bookingData);
      return response;
  }
);

export const deleteBooking = createAsyncThunk(
  'booking/deleteBooking',
  async (bookingId: string) => {
    const response = await bookingApi.deleteBooking(bookingId);
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
      state.updateSuccess = false;
      state.creatingBooking = false;
    },
    /**
     * 清除更新成功状态
     */
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
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
      // 获取预约列表（带分页）
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
      // 获取指定日期所有预约（无分页，用于时段映射）
      .addCase(getBookingsByDate.pending, (state) => {
        state.loading = true;
        state.bookingsLoading = true;
        state.error = null;
      })
      .addCase(getBookingsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsLoading = false;
        // 写入独立的 slotReferenceBookings 字段，不影响分页数据
        state.slotReferenceBookings = action.payload.items;
      })
      .addCase(getBookingsByDate.rejected, (state, action) => {
        state.loading = false;
        state.bookingsLoading = false;
        state.error = action.error.message || '获取日期预约失败';
      })
      // 获取可用时间段
      // .addCase(getAvailableSlots.pending, (state) => {
      //   state.loading = true;
      //   state.slotsLoading = true;
      //   state.error = null;
      // })
      // .addCase(getAvailableSlots.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.slotsLoading = false;
      //   state.availableSlots = action.payload;
      // })
      // .addCase(getAvailableSlots.rejected, (state, action) => {
      //   state.loading = false;
      //   state.slotsLoading = false;
      //   state.error = action.error.message || '获取可用时间段失败';
      // })
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
        state.updateSuccess = true; // 设置更新成功标志
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新预约失败';
      })
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(b => b.id !== action.payload.bookingId);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除预约失败';
      });
  },
});

export const { setSelectedDate, setSelectedSlot, clearError, resetBookingState, setPage, setFilters, clearUpdateSuccess } = bookingSlice.actions;
export default bookingSlice.reducer;
