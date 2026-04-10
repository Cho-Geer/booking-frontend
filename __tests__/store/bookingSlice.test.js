/**
 * bookingSlice unit tests
 */
import bookingReducer, {
  getBookings,
  createBooking,
  cancelBooking,
  setSelectedDate,
  setSelectedSlot,
  clearError,
  resetBookingState,
} from '@/store/bookingSlice';
import { getAvailableSlots } from '@/store/slotTimeSlice';

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
    appointmentDate: testConstants.mockDate,
    startTime: testConstants.mockStartTime,
    endTime: testConstants.mockEndTime,
    timeSlotId: 'slot-1',
    appointmentNumber: 'AP-20230501-0001',
    customerName: 'Test User',
    customerPhone: '13800138000',
    confirmationSent: false,
    reminderSent: false,
    timeSlot: { slotTime: '09:00:00', durationMinutes: 60 },
    status: 'CONFIRMED',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z',
  },
  mockSlot: {
    id: 'slot-1',
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
      appointmentDate: testConstants.mockDate,
      startTime: testConstants.mockStartTime,
      endTime: testConstants.mockEndTime,
      timeSlotId: 'slot-1',
      appointmentNumber: 'AP-20230501-0001',
      customerName: 'Test User',
      customerPhone: '13800138000',
      confirmationSent: false,
      reminderSent: false,
      timeSlot: { slotTime: '09:00:00', durationMinutes: 60 },
      status: 'CONFIRMED',
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2023-05-01T00:00:00Z',
    },
  ],
  mockSlots: [
    { id: 'slot-1', startTime: testConstants.mockStartTime, endTime: testConstants.mockEndTime, available: true },
    { id: 'slot-2', startTime: '10:00', endTime: '11:00', available: false },
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

  describe('basic state management', () => {
    it('handles initial state', () => {
      const result = bookingReducer(undefined, { type: 'unknown' });
      expect(result.bookings).toEqual([]);
      expect(result.availableSlots).toEqual([]);
      expect(result.selectedSlot).toBeNull();
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('handles setSelectedDate', () => {
      const actual = bookingReducer(initialState, setSelectedDate(testConstants.mockDate));
      expect(actual.selectedDate).toEqual(testConstants.mockDate);
    });

    it('handles setSelectedSlot', () => {
      const actual = bookingReducer(initialState, setSelectedSlot(testData.mockSlot));
      expect(actual.selectedSlot).toEqual(testData.mockSlot);
    });

    it('handles clearError', () => {
      const stateWithError = { ...initialState, error: testData.mockError };
      const actual = bookingReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
    });

    it('handles resetBookingState', () => {
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

  describe('booking list', () => {
    it('handles getBookings pending state', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.bookingsLoading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('handles getBookings fulfilled state', () => {
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

    it('handles getBookings rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: getBookings.rejected.type,
        error: { message: 'Failed to fetch bookings' },
      });
      expect(actual.loading).toBe(false);
      expect(actual.bookingsLoading).toBe(false);
      expect(actual.error).toEqual('Failed to fetch bookings');
    });
  });

  describe('slot availability ownership', () => {
    it('ignores getAvailableSlots actions because slot state moved to slotTimeSlice', () => {
      const pendingState = bookingReducer(initialState, {
        type: getAvailableSlots.pending.type,
      });
      const fulfilledState = bookingReducer(initialState, {
        type: getAvailableSlots.fulfilled.type,
        payload: testData.mockSlots,
      });
      const rejectedState = bookingReducer(initialState, {
        type: getAvailableSlots.rejected.type,
        error: { message: 'Failed to fetch available slots' },
      });

      expect(pendingState).toEqual(initialState);
      expect(fulfilledState).toEqual(initialState);
      expect(rejectedState).toEqual(initialState);
    });
  });

  describe('create booking', () => {
    it('handles createBooking pending state', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.pending.type,
      });
      expect(actual.creatingBooking).toBe(true);
      expect(actual.error).toBeNull();
      expect(actual.success).toBe(false);
    });

    it('handles createBooking fulfilled state', () => {
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

    it('handles createBooking rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: createBooking.rejected.type,
        error: { message: 'Failed to create booking' },
      });
      expect(actual.creatingBooking).toBe(false);
      expect(actual.success).toBe(false);
      expect(actual.error).toEqual('Failed to create booking');
    });
  });

  describe('cancel booking', () => {
    it('handles cancelBooking pending state', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.pending.type,
      });
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('handles cancelBooking fulfilled state', () => {
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

    it('handles cancelBooking rejected state', () => {
      const actual = bookingReducer(initialState, {
        type: cancelBooking.rejected.type,
        error: { message: 'Failed to cancel booking' },
      });
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual('Failed to cancel booking');
    });
  });
});
