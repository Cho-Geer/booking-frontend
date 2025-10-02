/**
 * bookingSlice 单元测试
 * 测试预约相关状态管理的各项功能，包括预约列表、可用时间段、日期选择、预约创建等
 */
import bookingReducer, {
  getBookings,
  getAvailableSlots,
  createBooking,
  cancelBooking,
  setSelectedDate,
  setSelectedSlot,
  clearError,
  resetBookingState
} from '@/store/bookingSlice';

/**
 * 测试用例常量
 */
const testConstants = {
  mockBookingId: '1',
  mockUserId: '1',
  mockServiceId: '1',
  mockDate: '2023-05-01',
  mockStartTime: '09:00',
  mockEndTime: '10:00',
};

/**
 * 测试用例数据
 */
const testData = {
  mockBooking: {
    id: testConstants.mockBookingId,
    userId: testConstants.mockUserId,
    serviceId: testConstants.mockServiceId,
    date: testConstants.mockDate,
    startTime: testConstants.mockStartTime,
    endTime: testConstants.mockEndTime,
    status: 'CONFIRMED',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z',
  },
  mockSlot: {
    startTime: testConstants.mockStartTime,
    endTime: testConstants.mockEndTime,
    available: true,
  },
  mockError: 'Some error',
  mockBookings: [
    {
      id: testConstants.mockBookingId,
      userId: testConstants.mockUserId,
      serviceId: testConstants.mockServiceId,
      date: testConstants.mockDate,
      startTime: testConstants.mockStartTime,
      endTime: testConstants.mockEndTime,
      status: 'CONFIRMED',
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2023-05-01T00:00:00Z',
    }
  ],
  mockSlots: [
    { startTime: testConstants.mockStartTime, endTime: testConstants.mockEndTime, available: true },
    { startTime: '10:00', endTime: '11:00', available: false },
  ],
};

describe('bookingSlice', () => {
  const initialState = {
    bookings: [],
    availableSlots: [],
    selectedDate: new Date().toISOString().split('T')[0],
    selectedSlot: null,
    loading: false,
    error: null,
    creatingBooking: false,
    success: false,
  };

  describe('基础状态管理功能', () => {
    it('✅ 应正确处理初始状态', () => {
      expect(bookingReducer(undefined, {})).toEqual(initialState);
    });

    it('✅ 应正确设置选中日期', () => {
      const actual = bookingReducer(initialState, setSelectedDate(testConstants.mockDate));
      expect(actual.selectedDate).toEqual(testConstants.mockDate);
    });

    it('✅ 应正确设置选中时间段', () => {
      const actual = bookingReducer(initialState, setSelectedSlot(testData.mockSlot));
      expect(actual.selectedSlot).toEqual(testData.mockSlot);
    });

    it('✅ 应正确清除错误状态', () => {
      const stateWithError = { ...initialState, error: testData.mockError };
      const actual = bookingReducer(stateWithError, clearError());
      expect(actual.error).toEqual(null);
    });

    it('✅ 应正确重置预约状态', () => {
      const stateWithBooking = {
        ...initialState,
        selectedSlot: testData.mockSlot,
        error: testData.mockError,
        success: true,
        creatingBooking: true,
      };
      
      const actual = bookingReducer(stateWithBooking, resetBookingState());
      expect(actual.selectedSlot).toEqual(null);
      expect(actual.error).toEqual(null);
      expect(actual.success).toEqual(false);
      expect(actual.creatingBooking).toEqual(false);
    });
  }

  describe('获取预约列表功能', () => {
    it('🔄 应正确处理获取预约列表的pending状态', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.pending.type,
      });
      expect(actual.loading).toEqual(true);
      expect(actual.error).toEqual(null);
    });

    it('✅ 应正确处理获取预约列表成功的fulfilled状态', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.fulfilled.type,
        payload: testData.mockBookings,
      });
      
      expect(actual.loading).toEqual(false);
      expect(actual.bookings).toEqual(testData.mockBookings);
    });

    it('❌ 应正确处理获取预约列表失败的rejected状态', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.rejected.type,
        error: { message: 'Failed to fetch bookings' },
      });
      expect(actual.loading).toEqual(false);
      expect(actual.error).toEqual('Failed to fetch bookings');
    });

    it('🧪 应正确处理空预约列表的情况', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.fulfilled.type,
        payload: [],
      });
      expect(actual.bookings).toEqual([]);
      expect(actual.loading).toEqual(false);
    });
  });

  describe('获取可用时间段功能', () => {
    it('🔄 应正确处理获取可用时间段的pending状态', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.pending.type,
      });
      expect(actual.loading).toEqual(true);
      expect(actual.error).toEqual(null);
    });

    it('✅ 应正确处理获取可用时间段成功的fulfilled状态', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.fulfilled.type,
        payload: testData.mockSlots,
      });
      
      expect(actual.loading).toEqual(false);
      expect(actual.availableSlots).toEqual(testData.mockSlots);
    });

    it('❌ 应正确处理获取可用时间段失败的rejected状态', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.rejected.type,
        error: { message: 'Failed to fetch available slots' },
      });
      expect(actual.loading).toEqual(false);
      expect(actual.error).toEqual('Failed to fetch available slots');
    });

    it('🧪 应正确处理空可用时间段列表的情况', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.fulfilled.type,
        payload: [],
      });
      expect(actual.availableSlots).toEqual([]);
      expect(actual.loading).toEqual(false);
    });
  });

  describe('创建预约功能', () => {
    it('🔄 应正确处理创建预约的pending状态', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.pending.type,
      });
      expect(actual.creatingBooking).toEqual(true);
      expect(actual.error).toEqual(null);
      expect(actual.success).toEqual(false);
    });

    it('✅ 应正确处理创建预约成功的fulfilled状态', () => {
      const stateWithSlot = {
        ...initialState,
        selectedSlot: testData.mockSlot,
      };
      
      const actual = bookingReducer(stateWithSlot, {
        type: createBooking.fulfilled.type,
        payload: testData.mockBooking,
      });
      
      expect(actual.creatingBooking).toEqual(false);
      expect(actual.success).toEqual(true);
      expect(actual.bookings).toContainEqual(testData.mockBooking);
      expect(actual.selectedSlot).toEqual(null);
    });

    it('❌ 应正确处理创建预约失败的rejected状态', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.rejected.type,
        error: { message: 'Failed to create booking' },
      });
      expect(actual.creatingBooking).toEqual(false);
      expect(actual.success).toEqual(false);
      expect(actual.error).toEqual('Failed to create booking');
    });

    it('🧪 应正确处理没有选中时间段时创建预约的情况', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.fulfilled.type,
        payload: testData.mockBooking,
      });
      expect(actual.bookings).toContainEqual(testData.mockBooking);
      expect(actual.selectedSlot).toEqual(null);
    });
  });

  describe('取消预约功能', () => {
    it('🔄 应正确处理取消预约的pending状态', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.pending.type,
      });
      expect(actual.loading).toEqual(true);
      expect(actual.error).toEqual(null);
    });

    it('✅ 应正确处理取消预约成功的fulfilled状态', () => {
      const stateWithBooking = {
        ...initialState,
        bookings: [testData.mockBooking],
      };
      
      const actual = bookingReducer(stateWithBooking, {
        type: cancelBooking.fulfilled.type,
        payload: { bookingId: testConstants.mockBookingId },
      });
      
      expect(actual.loading).toEqual(false);
      expect(actual.bookings[0].status).toEqual('CANCELLED');
    });

    it('❌ 应正确处理取消预约失败的rejected状态', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.rejected.type,
        error: { message: 'Failed to cancel booking' },
      });
      expect(actual.loading).toEqual(false);
      expect(actual.error).toEqual('Failed to cancel booking');
    });

    it('🧪 应正确处理预约列表为空时取消预约的情况', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.fulfilled.type,
        payload: { bookingId: '999' },
      });
      expect(actual.bookings).toEqual([]);
      expect(actual.loading).toEqual(false);
    });
  });

  // 清理所有mock，防止影响其他测试
  afterAll(() => {
    jest.restoreAllMocks();
  });
});