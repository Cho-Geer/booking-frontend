/**
 * timeUtils 单元测试
 */
import {
  isBookingExpired,
  formatBookingDate,
} from '@/utils/timeUtils';

describe('timeUtils', () => {
  describe('isBookingExpired', () => {
    it('should return true for past bookings', () => {
      const pastDate = '2020-01-01';
      const pastTime = '00:00';
      const result = isBookingExpired(pastDate, pastTime);
      expect(result).toBe(true);
    });

    it('should return false for future bookings', () => {
      const futureDate = '2099-12-31';
      const futureTime = '23:59';
      const result = isBookingExpired(futureDate, futureTime);
      expect(result).toBe(false);
    });
  });

  describe('formatBookingDate', () => {
    it('should format date string to YYYY-MM-DD', () => {
      const result = formatBookingDate('2024-01-15T10:30:00Z');
      expect(result).toEqual('2024-01-15');
    });

    it('should handle undefined input', () => {
      const result = formatBookingDate(undefined);
      expect(result).toEqual('-');
    });

    it('should handle date string without time', () => {
      const result = formatBookingDate('2024-01-15');
      expect(result).toEqual('2024-01-15');
    });
  });
});
