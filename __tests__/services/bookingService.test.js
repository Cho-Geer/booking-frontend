/**
 * bookingService 单元测试
 * 测试预约服务的各项功能，包括获取预约列表、可用时间段、创建预约、取消预约和获取单个预约详情等
 */
import { bookingService } from '@/services/bookingService';
import api from '@/services/api';

// Mock browser APIs
// 使用Object.defineProperty来安全地模拟localStorage和location
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'location', {
  value: {
    href: '',
    reload: jest.fn(),
  },
  writable: true,
  configurable: true,
});

// 确保window对象存在且包含必要的属性
Object.defineProperty(global, 'window', {
  value: {
    localStorage: global.localStorage,
    location: global.location,
  },
  writable: true,
  configurable: true,
});

// Mock the api module
jest.mock('@/services/api');

/**
 * 测试用例常量
 */
const testConstants = {
  mockDate: '2023-05-01',
  mockBookingId: 'booking123',
  mockServiceId: 'service123',
};

/**
 * 模拟的API响应数据
 */
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
    { startTime: '09:00', endTime: '10:00', available: true },
    { startTime: '10:00', endTime: '11:00', available: false },
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

/**
 * 测试用例数据
 */
const testData = {
  bookingData: {
    serviceId: testConstants.mockServiceId,
    date: testConstants.mockDate,
    startTime: '09:00',
    endTime: '10:00',
    notes: 'Test booking',
    customerName: '张三',
    customerPhone: '13800138000',
    customerEmail: 'zhangsan@example.com',
    customerWechat: 'zhangsan123',
  },
  minimalBookingData: {
    serviceId: testConstants.mockServiceId,
    date: testConstants.mockDate,
    startTime: '09:00',
    endTime: '10:00',
    customerName: '张三',
    customerPhone: '13800138000',
  },
  apiError: new Error('API Error'),
  networkError: new Error('Network Error'),
  invalidBookingId: 'invalid-booking-id',
  invalidDate: 'invalid-date',
};

describe('bookingService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('获取预约列表功能', () => {
    it('✅ 正常情况下应调用正确API端点并返回预约列表', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingsSuccess });

      const result = await bookingService.getBookings();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/appointments/all');
      expect(result).toEqual(mockResponses.getBookingsSuccess);
    });

    it('❌ 应正确处理API错误情况', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(bookingService.getBookings()).rejects.toThrow('API Error');
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('❌ 应正确处理网络错误情况', async () => {
      api.get.mockRejectedValue(testData.networkError);

      await expect(bookingService.getBookings()).rejects.toThrow('Network Error');
    });

    it('🔄 应正确处理多次调用的情况', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingsSuccess });

      await bookingService.getBookings();
      await bookingService.getBookings();

      expect(api.get).toHaveBeenCalledTimes(2);
    });

    it('🧪 应正确处理空预约列表的情况', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await bookingService.getBookings();

      expect(result).toEqual([]);
    });
  });

  describe('获取可用时间段功能', () => {
    it('✅ 正常情况下应调用正确API端点并返回可用时间段', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getAvailableSlotsSuccess });

      const result = await bookingService.getAvailableSlots(testConstants.mockDate);

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(`/appointments/available-slots?date=${testConstants.mockDate}`);
      expect(result).toEqual(mockResponses.getAvailableSlotsSuccess);
    });

    it('❌ 应正确处理API错误情况', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(bookingService.getAvailableSlots(testConstants.mockDate)).rejects.toThrow('API Error');
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('🧪 应正确处理不同日期参数', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getAvailableSlotsSuccess });
      const anotherDate = '2023-05-02';

      const result = await bookingService.getAvailableSlots(anotherDate);

      expect(api.get).toHaveBeenCalledWith(`/appointments/available-slots?date=${anotherDate}`);
      expect(result).toEqual(mockResponses.getAvailableSlotsSuccess);
    });

    it('❌ 应正确处理无效日期参数', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(bookingService.getAvailableSlots(testData.invalidDate)).rejects.toThrow('API Error');
    });
  });

  describe('创建预约功能', () => {
    it('✅ 正常情况下应调用正确API端点并返回创建的预约', async () => {
      api.post.mockResolvedValue({ data: mockResponses.createBookingSuccess });

      const result = await bookingService.createBooking(testData.bookingData);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/appointments', testData.bookingData);
      expect(result).toEqual(mockResponses.createBookingSuccess);
    });

    it('❌ 应正确处理API错误情况', async () => {
      api.post.mockRejectedValue(testData.apiError);

      await expect(bookingService.createBooking(testData.minimalBookingData)).rejects.toThrow('API Error');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('🧪 应正确处理最小化预约数据', async () => {
      api.post.mockResolvedValue({ data: mockResponses.createBookingSuccess });

      const result = await bookingService.createBooking(testData.minimalBookingData);

      expect(api.post).toHaveBeenCalledWith('/appointments', testData.minimalBookingData);
      expect(result).toEqual(mockResponses.createBookingSuccess);
    });

    it('🔄 应正确处理多次创建预约调用', async () => {
      api.post.mockResolvedValue({ data: mockResponses.createBookingSuccess });

      await bookingService.createBooking(testData.bookingData);
      await bookingService.createBooking(testData.minimalBookingData);

      expect(api.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('取消预约功能', () => {
    it('✅ 正常情况下应调用正确API端点并返回成功结果', async () => {
      api.patch.mockResolvedValue({ data: mockResponses.cancelBookingSuccess });

      const result = await bookingService.cancelBooking(testConstants.mockBookingId);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith(`/appointments/${testConstants.mockBookingId}/cancel`);
      expect(result).toEqual(mockResponses.cancelBookingSuccess);
    });

    it('❌ 应正确处理API错误情况', async () => {
      api.patch.mockRejectedValue(testData.apiError);

      await expect(bookingService.cancelBooking(testConstants.mockBookingId)).rejects.toThrow('API Error');
      expect(api.patch).toHaveBeenCalledTimes(1);
    });

    it('❌ 应正确处理无效预约ID', async () => {
      api.patch.mockRejectedValue(testData.apiError);

      await expect(bookingService.cancelBooking(testData.invalidBookingId)).rejects.toThrow('API Error');
    });

    it('🔄 应正确处理多次取消预约调用', async () => {
      api.patch.mockResolvedValue({ data: mockResponses.cancelBookingSuccess });

      await bookingService.cancelBooking(testConstants.mockBookingId);
      await bookingService.cancelBooking(testConstants.mockBookingId);

      expect(api.patch).toHaveBeenCalledTimes(2);
    });
  });

  describe('获取单个预约详情功能', () => {
    it('✅ 正常情况下应调用正确API端点并返回预约详情', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingByIdSuccess });

      const result = await bookingService.getBookingById(testConstants.mockBookingId);

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(`/appointments/${testConstants.mockBookingId}`);
      expect(result).toEqual(mockResponses.getBookingByIdSuccess);
    });

    it('❌ 应正确处理API错误情况', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(bookingService.getBookingById(testConstants.mockBookingId)).rejects.toThrow('API Error');
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('❌ 应正确处理无效预约ID', async () => {
      api.get.mockRejectedValue(testData.apiError);

      await expect(bookingService.getBookingById(testData.invalidBookingId)).rejects.toThrow('API Error');
    });

    it('🔄 应正确处理多次获取预约详情调用', async () => {
      api.get.mockResolvedValue({ data: mockResponses.getBookingByIdSuccess });

      await bookingService.getBookingById(testConstants.mockBookingId);
      await bookingService.getBookingById(testConstants.mockBookingId);

      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  // 清理所有定时器和mock，解决worker进程未正常退出的问题
  afterAll(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });
});