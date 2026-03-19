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

const testConstants = {
  mockBookingId: '1',
  mockUserId: '1',
  mockServiceId: '1',
  mockDate: '2023-05-01',
  mockStartTime: '09:00',
  mockEndTime: '10:00',
};

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
    slotReferenceBookings: [],
    availableSlots: [],
    services: [],
    selectedDate: '2023-05-01',
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
      totalPages: 0,
    },
    filters: {},
  };

  describe('基础状态管理功能', () => {
    it('should handle initial state', () => {
      const result = bookingReducer(undefined, { type: 'unknown' });
      expect(result.bookings).toEqual([]);
      expect(result.availableSlots).toEqual([]);
      expect(result.selectedSlot).toBeNull();
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle setSelectedDate', () => {
      const actual = bookingReducer(initialState, setSelectedDate(testConstants.mockDate));
      expect(actual.selectedDate).toEqual(testConstants.mockDate);
    });

    it('should handle setSelectedSlot', () => {
      const actual = bookingReducer(initialState, setSelectedSlot(testData.mockSlot));
      expect(actual.selectedSlot).toEqual(testData.mockSlot);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: testData.mockError };
      const actual = bookingReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
    });

    it('should handle resetBookingState', () => {
      const stateWithBooking = {
        ...initialState,
        selectedSlot: testData.mockSlot,
        error: testData.mockError,
        success: true,
        creatingBooking: true,
      };

      const actual = bookingReducer(stateWithBooking, resetBookingState());
      expect(actual.selectedSlot).toBeNull();
      expect(actual.error).toBeNull();
      expect(actual.success).toBe(false);
      expect(actual.creatingBooking).toBe(false);
    });
  });

  describe('获取预约列表功能', () => {
    it('should handle getBookings pending state', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.bookingsLoading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle getBookings fulfilled state', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.fulfilled.type,
        payload: {
          items: testData.mockBookings,
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(actual.loading).toBe(false);
      expect(actual.bookingsLoading).toBe(false);
      expect(actual.bookings).toEqual(testData.mockBookings);
    });

    it('should handle getBookings rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.rejected.type,
        error: { message: 'Failed to fetch bookings' },
      });
      expect(actual.loading).toBe(false);
      expect(actual.bookingsLoading).toBe(false);
      expect(actual.error).toEqual('Failed to fetch bookings');
    });

    it('should handle empty bookings list', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.fulfilled.type,
        payload: {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
      expect(actual.bookings).toEqual([]);
      expect(actual.loading).toBe(false);
    });
  });

  describe('获取可用时间段功能', () => {
    it('should handle getAvailableSlots pending state', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.slotsLoading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle getAvailableSlots fulfilled state', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.fulfilled.type,
        payload: testData.mockSlots,
      });

      expect(actual.loading).toBe(false);
      expect(actual.slotsLoading).toBe(false);
      expect(actual.availableSlots).toEqual(testData.mockSlots);
    });

    it('should handle getAvailableSlots rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.rejected.type,
        error: { message: 'Failed to fetch available slots' },
      });
      expect(actual.loading).toBe(false);
      expect(actual.slotsLoading).toBe(false);
      expect(actual.error).toEqual('Failed to fetch available slots');
    });

    it('should handle empty available slots list', () => {
      const actual = bookingReducer(initialState, {
        type: getAvailableSlots.fulfilled.type,
        payload: [],
      });
      expect(actual.availableSlots).toEqual([]);
      expect(actual.loading).toBe(false);
    });
  });

  describe('创建预约功能', () => {
    it('should handle createBooking pending state', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.pending.type,
      });
      expect(actual.creatingBooking).toBe(true);
      expect(actual.error).toBeNull();
      expect(actual.success).toBe(false);
    });

    it('should handle createBooking fulfilled state', () => {
      const stateWithSlot = {
        ...initialState,
        selectedSlot: testData.mockSlot,
      };

      const actual = bookingReducer(stateWithSlot, {
        type: createBooking.fulfilled.type,
        payload: testData.mockBooking,
      });

      expect(actual.creatingBooking).toBe(false);
      expect(actual.success).toBe(true);
      expect(actual.bookings).toContainEqual(testData.mockBooking);
      expect(actual.selectedSlot).toBeNull();
    });

    it('should handle createBooking rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.rejected.type,
        error: { message: 'Failed to create booking' },
      });
      expect(actual.creatingBooking).toBe(false);
      expect(actual.success).toBe(false);
      expect(actual.error).toEqual('Failed to create booking');
    });
  });

  describe('取消预约功能', () => {
    it('should handle cancelBooking pending state', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle cancelBooking fulfilled state', () => {
      const stateWithBooking = {
        ...initialState,
        bookings: [testData.mockBooking],
      };

      const actual = bookingReducer(stateWithBooking, {
        type: cancelBooking.fulfilled.type,
        payload: { bookingId: testConstants.mockBookingId },
      });

      expect(actual.loading).toBe(false);
      expect(actual.bookings[0].status).toEqual('CANCELLED');
    });

    it('should handle cancelBooking rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.rejected.type,
        error: { message: 'Failed to cancel booking' },
      });
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual('Failed to cancel booking');
    });

    it('should handle empty bookings list when cancelling', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.fulfilled.type,
        payload: { bookingId: '999' },
      });
      expect(actual.bookings).toEqual([]);
      expect(actual.loading).toBe(false);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
