/**
 * bookingService 单元测试
 */
import { bookingService } from '@/services/bookingService';
import api from '@/services/api';

jest.mock('@/services/api');

const testConstants = {
  mockDate: '2023-05-01',
  mockBookingId: 'booking123',
  mockServiceId: 'service123',
};

const mockResponses = {
  getBookingsSuccess: [
    {
      id: '1',
      userId: 'user1',
      serviceId: 'service1',
      date: testConstants.mockDate,
      startTime: '09:00',
      endTime: '10:00',
      status: 'CONFIRMED',
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2023-05-01T00:00:00Z',
    }
  ],
  getAvailableSlotsSuccess: [
    { id: '1', slotTime: '09:00:00', durationMinutes: 60, isAvailable: true },
    { id: '2', slotTime: '10:00:00', durationMinutes: 60, isAvailable: false },
  ],
  createBookingSuccess: {
    id: testConstants.mockBookingId,
    serviceId: testConstants.mockServiceId,
    date: testConstants.mockDate,
    startTime: '09:00',
    endTime: '10:00',
    notes: 'Test booking',
    customerName: '张三',
    customerPhone: '13800138000',
    customerEmail: 'zhangsan@example.com',
    customerWechat: 'zhangsan123',
    userId: 'user1',
    status: 'CONFIRMED',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z',
    timeSlot: { slotTime: '09:00:00', durationMinutes: 60 },
  },
  cancelBookingSuccess: { success: true },
  getBookingByIdSuccess: {
    id: testConstants.mockBookingId,
    userId: 'user1',
    serviceId: testConstants.mockServiceId,
    date: testConstants.mockDate,
    startTime: '09:00',
    endTime: '10:00',
    status: 'CONFIRMED',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z',
  },
};

describe('bookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyBookings', () => {
    it('should call correct API endpoint', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingsSuccess });

      const result = await bookingService.getMyBookings();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/bookings');
      expect(result).toEqual(mockResponses.getBookingsSuccess);
    });

    it('should handle API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await expect(bookingService.getMyBookings()).rejects.toThrow('API Error');
    });
  });

  describe('getAvailableSlots', () => {
    it('should call correct API endpoint and return transformed slots', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getAvailableSlotsSuccess });

      const result = await bookingService.getAvailableSlots(testConstants.mockDate);

      expect(api.get).toHaveBeenCalledWith('/bookings/available-slots', { params: { date: testConstants.mockDate } });
      expect(result).toHaveLength(2);
      expect(result[0].startTime).toEqual('09:00');
      expect(result[0].endTime).toEqual('10:00');
    });

    it('should handle API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await expect(bookingService.getAvailableSlots(testConstants.mockDate)).rejects.toThrow('API Error');
    });
  });

  describe('createBooking', () => {
    it('should call correct API endpoint and return booking', async () => {
      const bookingData = {
        timeSlotId: '1',
        appointmentDate: testConstants.mockDate,
        userId: 'user1',
        customerName: '张三',
        customerPhone: '13800138000',
        serviceId: testConstants.mockServiceId,
        serviceName: 'Test Service',
      };

      api.post.mockResolvedValue({ data: { data: mockResponses.createBookingSuccess } });

      const result = await bookingService.createBooking(bookingData);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result.startTime).toEqual('09:00');
    });

    it('should handle API error', async () => {
      api.post.mockRejectedValue(new Error('API Error'));

      const bookingData = {
        timeSlotId: '1',
        appointmentDate: testConstants.mockDate,
        userId: 'user1',
        customerName: '张三',
        customerPhone: '13800138000',
        serviceId: testConstants.mockServiceId,
        serviceName: 'Test Service',
      };

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow('API Error');
    });
  });

  describe('cancelBooking', () => {
    it('should call correct API endpoint', async () => {
      api.patch.mockResolvedValue({ data: mockResponses.cancelBookingSuccess });

      const result = await bookingService.cancelBooking(testConstants.mockBookingId);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith(`/bookings/${testConstants.mockBookingId}/cancel`);
      expect(result).toEqual(mockResponses.cancelBookingSuccess);
    });

    it('should handle API error', async () => {
      api.patch.mockRejectedValue(new Error('API Error'));

      await expect(bookingService.cancelBooking(testConstants.mockBookingId)).rejects.toThrow('API Error');
    });
  });

  describe('getBookingById', () => {
    it('should call correct API endpoint', async () => {
      api.get.mockResolvedValue({ data: { data: mockResponses.getBookingByIdSuccess } });

      const result = await bookingService.getBookingById(testConstants.mockBookingId);

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(`/bookings/${testConstants.mockBookingId}`);
    });

    it('should handle API error', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await expect(bookingService.getBookingById(testConstants.mockBookingId)).rejects.toThrow('API Error');
    });
  });

  describe('calculateEndTime', () => {
    it('should calculate end time correctly', () => {
      const result = bookingService.calculateEndTime('09:00:00', 60);
      expect(result).toEqual('10:00');
    });

    it('should handle 30 minute duration', () => {
      const result = bookingService.calculateEndTime('09:00:00', 30);
      expect(result).toEqual('09:30');
    });

    it('should handle duration crossing midnight', () => {
      const result = bookingService.calculateEndTime('23:30:00', 60);
      expect(result).toEqual('00:30');
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
