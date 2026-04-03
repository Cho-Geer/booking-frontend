/**
 * bookingApi unit tests
 */
import { bookingApi } from '@/services/bookingApi';
import api from '@/services/api';
import { calculateEndTime } from '@/utils';

jest.mock('@/services/api');

const testConstants = {
  mockDate: '2023-05-01',
  mockBookingId: 'booking123',
  mockServiceId: 'service123',
};

const mockResponses = {
  getBookingsSuccess: {
    items: [
      {
        id: '1',
        appointmentNumber: 'AP-20230501-0001',
        userId: 'user1',
        timeSlotId: 'slot1',
        appointmentDate: testConstants.mockDate,
        status: 'CONFIRMED',
        customerName: 'Test User',
        customerPhone: '13800138000',
        confirmationSent: false,
        reminderSent: false,
        createdAt: '2023-05-01T00:00:00Z',
        updatedAt: '2023-05-01T00:00:00Z',
        timeSlot: { slotTime: '09:00:00', durationMinutes: 60 },
      },
    ],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
  getAvailableSlotsSuccess: [
    { id: '1', slotTime: '09:00:00', durationMinutes: 60, isAvailable: true },
    { id: '2', slotTime: '10:00:00', durationMinutes: 60, isAvailable: false },
  ],
  createBookingSuccess: {
    id: testConstants.mockBookingId,
    appointmentNumber: 'AP-20230501-0002',
    userId: 'user1',
    timeSlotId: '1',
    appointmentDate: testConstants.mockDate,
    notes: 'Test booking',
    customerName: 'Test User',
    customerPhone: '13800138000',
    customerEmail: 'zhangsan@example.com',
    customerWechat: 'zhangsan123',
    serviceId: testConstants.mockServiceId,
    serviceName: 'Test Service',
    status: 'CONFIRMED',
    confirmationSent: false,
    reminderSent: false,
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z',
    timeSlot: { slotTime: '09:00:00', durationMinutes: 60 },
  },
  cancelBookingSuccess: { success: true },
  getBookingByIdSuccess: {
    id: testConstants.mockBookingId,
    appointmentNumber: 'AP-20230501-0003',
    userId: 'user1',
    timeSlotId: '1',
    appointmentDate: testConstants.mockDate,
    status: 'CONFIRMED',
    customerName: 'Test User',
    customerPhone: '13800138000',
    confirmationSent: false,
    reminderSent: false,
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z',
  },
};

describe('bookingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookings', () => {
    it('calls the admin bookings endpoint and maps slot times', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingsSuccess });

      const result = await bookingApi.getBookings();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/bookings/all', { params: {} });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].startTime).toEqual('09:00');
      expect(result.items[0].endTime).toEqual('10:00');
    });

    it('propagates API errors', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await expect(bookingApi.getBookings()).rejects.toThrow('API Error');
    });
  });

  describe('createBooking', () => {
    it('calls the booking endpoint and returns the enriched booking', async () => {
      const bookingData = {
        timeSlotId: '1',
        appointmentDate: testConstants.mockDate,
        userId: 'user1',
        customerName: 'Test User',
        customerPhone: '13800138000',
        serviceId: testConstants.mockServiceId,
        serviceName: 'Test Service',
      };

      api.post.mockResolvedValue({ data: mockResponses.createBookingSuccess });

      const result = await bookingApi.createBooking(bookingData);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result.startTime).toEqual('09:00');
      expect(result.endTime).toEqual('10:00');
    });

    it('propagates API errors', async () => {
      api.post.mockRejectedValue(new Error('API Error'));

      const bookingData = {
        timeSlotId: '1',
        appointmentDate: testConstants.mockDate,
        userId: 'user1',
        customerName: 'Test User',
        customerPhone: '13800138000',
        serviceId: testConstants.mockServiceId,
        serviceName: 'Test Service',
      };

      await expect(bookingApi.createBooking(bookingData)).rejects.toThrow('API Error');
    });
  });

  describe('cancelBooking', () => {
    it('calls the cancel endpoint', async () => {
      api.patch.mockResolvedValue({ data: mockResponses.cancelBookingSuccess });

      const result = await bookingApi.cancelBooking(testConstants.mockBookingId);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith(`/bookings/${testConstants.mockBookingId}/cancel`);
      expect(result).toEqual(mockResponses.cancelBookingSuccess);
    });

    it('propagates API errors', async () => {
      api.patch.mockRejectedValue(new Error('API Error'));

      await expect(bookingApi.cancelBooking(testConstants.mockBookingId)).rejects.toThrow('API Error');
    });
  });

  describe('getBookingById', () => {
    it('calls the detail endpoint', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingByIdSuccess });

      await bookingApi.getBookingById(testConstants.mockBookingId);

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(`/bookings/${testConstants.mockBookingId}`);
    });

    it('propagates API errors', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await expect(bookingApi.getBookingById(testConstants.mockBookingId)).rejects.toThrow('API Error');
    });
  });

  describe('calculateEndTime', () => {
    it('calculates end time correctly', () => {
      expect(calculateEndTime('09:00:00', 60)).toEqual('10:00');
    });

    it('handles 30 minute duration', () => {
      expect(calculateEndTime('09:00:00', 30)).toEqual('09:30');
    });

    it('handles duration crossing midnight', () => {
      expect(calculateEndTime('23:30:00', 60)).toEqual('00:30');
    });
  });
});
