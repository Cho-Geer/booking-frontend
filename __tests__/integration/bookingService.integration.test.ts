import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { bookingService } from '@/services/bookingService';
import { Booking, TimeSlot, CreateBookingRequest } from '@/types';

/**
 * bookingService 集成测试
 * 使用TestContainers启动模拟API服务器，测试真实的API调用流程
 */
describe('bookingService 集成测试', () => {
  let container: StartedTestContainer;
  let mockServerUrl: string;

  // 设置全局localStorage模拟
  beforeAll(() => {
    // Mock browser APIs
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  /**
   * 启动TestContainers容器
   */
  beforeAll(async () => {
    // 使用TestContainers启动一个模拟的API服务器容器
    container = await new GenericContainer('stoplight/prism')
      .withExposedPorts(4010)
      .withCommand(['mock', '-h', '0.0.0.0', '/app/openapi.yml'])
      .withBindMounts([
        {
          source: '/home/zhaoge/trae-cn/practise/booking-system/booking-frontend/__tests__/integration/openapi.yml',
          target: '/app/openapi.yml',
          mode: 'ro'
        }
      ])
      .start();

    mockServerUrl = `http://${container.getHost()}:${container.getMappedPort(4010)}`;
    
    // 覆盖API基础URL，指向测试容器
    process.env.NEXT_PUBLIC_API_URL = mockServerUrl;
    
    // 重置modules以应用新的环境变量
    jest.resetModules();
  });

  /**
   * 清理测试环境
   */
  afterAll(async () => {
    // 停止测试容器
    if (container) {
      await container.stop();
    }
    
    // 清理环境变量
    delete process.env.NEXT_PUBLIC_API_URL;
    
    // 清理所有定时器
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  beforeEach(() => {
    // 设置认证token
    (localStorage.getItem as jest.Mock).mockReturnValue('test-token');
  });

  describe('getBookings - 获取所有预约', () => {
    it('should fetch all bookings successfully from mock server', async () => {
      // 由于我们使用Prism模拟服务器，它会根据OpenAPI规范返回模拟数据
      const result = await bookingService.getBookings();
      
      // 验证响应
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // 验证返回的预约数据结构
      if (result.length > 0) {
        const firstBooking = result[0];
        expect(firstBooking).toHaveProperty('id');
        expect(firstBooking).toHaveProperty('userId');
        expect(firstBooking).toHaveProperty('serviceId');
        expect(firstBooking).toHaveProperty('date');
        expect(firstBooking).toHaveProperty('startTime');
        expect(firstBooking).toHaveProperty('endTime');
        expect(firstBooking).toHaveProperty('status');
      }
    });
  });

  describe('getMyBookings - 获取当前用户预约', () => {
    it('should fetch current user bookings successfully from mock server', async () => {
      // 调用服务方法
      const result = await bookingService.getMyBookings();
      
      // 验证响应
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // 验证返回的预约数据结构
      if (result.length > 0) {
        const firstBooking = result[0];
        expect(firstBooking).toHaveProperty('id');
        expect(firstBooking).toHaveProperty('userId');
      }
    });
  });

  describe('getAvailableSlots - 获取可用时间段', () => {
    it('should fetch available time slots successfully from mock server', async () => {
      const mockDate = '2023-05-01';
      
      // 调用服务方法
      const result = await bookingService.getAvailableSlots(mockDate);
      
      // 验证响应
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // 验证返回的时间段数据结构
      if (result.length > 0) {
        const firstSlot = result[0];
        expect(firstSlot).toHaveProperty('startTime');
        expect(firstSlot).toHaveProperty('endTime');
        expect(firstSlot).toHaveProperty('available');
        expect(typeof firstSlot.available).toBe('boolean');
      }
    });

    it('should handle invalid date format gracefully', async () => {
      const invalidDate = 'invalid-date-format';
      
      // 调用服务方法，期望抛出错误
      await expect(bookingService.getAvailableSlots(invalidDate))
        .rejects.toThrow();
    });
  });

  describe('createBooking - 创建预约', () => {
    it('should create booking successfully via mock server', async () => {
      const mockBookingData: CreateBookingRequest = {
        serviceId: 'service1',
        date: '2023-05-01',
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Integration test booking',
        customerName: 'Test User',
        customerPhone: '13800138000',
        customerEmail: 'test@example.com',
        customerWechat: 'test_wechat'
      };
      
      // 调用服务方法
      const result = await bookingService.createBooking(mockBookingData);
      
      // 验证响应
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.serviceId).toBe(mockBookingData.serviceId);
      expect(result.date).toBe(mockBookingData.date);
      expect(result.startTime).toBe(mockBookingData.startTime);
      expect(result.endTime).toBe(mockBookingData.endTime);
    });

    it('should handle missing required fields in booking data', async () => {
      // 创建缺少必需字段的预约数据
      const incompleteBookingData = {
        // 缺少serviceId
        date: '2023-05-01',
        startTime: '09:00',
        // 缺少endTime
      };
      
      // 调用服务方法，期望抛出错误
      await expect(bookingService.createBooking(incompleteBookingData as any))
        .rejects.toThrow();
    });
  });

  describe('cancelBooking - 取消预约', () => {
    it('should cancel booking successfully via mock server', async () => {
      const mockBookingId = 'appointment1';
      
      // 调用服务方法
      const result = await bookingService.cancelBooking(mockBookingId);
      
      // 验证响应
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });

    it('should handle cancellation of non-existent booking', async () => {
      const nonExistentBookingId = 'non-existent-booking';
      
      // 调用服务方法，期望抛出错误
      await expect(bookingService.cancelBooking(nonExistentBookingId))
        .rejects.toThrow();
    });
  });

  describe('getBookingById - 获取预约详情', () => {
    it('should fetch booking details successfully from mock server', async () => {
      const mockBookingId = 'appointment1';
      
      // 调用服务方法
      const result = await bookingService.getBookingById(mockBookingId);
      
      // 验证响应
      expect(result).toBeDefined();
      expect(result.id).toBe(mockBookingId);
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('serviceId');
      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('status');
    });

    it('should handle fetching non-existent booking details', async () => {
      const nonExistentBookingId = 'non-existent-booking';
      
      // 调用服务方法，期望抛出错误
      await expect(bookingService.getBookingById(nonExistentBookingId))
        .rejects.toThrow();
    });
  });

  describe('API错误处理和边界情况', () => {
    beforeEach(() => {
      // 模拟未授权场景
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
    });

    it('should handle unauthorized access when token is missing', async () => {
      // 在未授权情况下调用需要认证的端点
      await expect(bookingService.getBookings())
        .rejects.toThrow();
    });

    it('should handle server errors gracefully', async () => {
      // 修改基础URL指向不存在的服务器以模拟网络错误
      const originalBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = 'http://non-existent-server:9999';
      
      // 重置modules以应用新的环境变量
      jest.resetModules();
      
      // 重新导入服务
      const { bookingService: refreshedBookingService } = await import('@/services/bookingService');
      
      // 调用服务方法，期望抛出网络相关错误
      await expect(refreshedBookingService.getBookings())
        .rejects.toThrow();
      
      // 恢复原始基础URL
      process.env.NEXT_PUBLIC_API_URL = originalBaseUrl;
      jest.resetModules();
    });
  });
});