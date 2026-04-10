/**
 * dateUtils 单元测试
 */
import {
  formatDate,
  formatDateShort,
  formatTime,
  getTodayLocalDate,
  getMaxDate,
  calculateEndTime,
} from '@/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('should handle ISO date string with time', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toContain('2024');
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBeDefined();
    });
  });

  describe('formatDateShort', () => {
    it('should convert date to short format', () => {
      const result = formatDateShort('2024-01-15');
      expect(result).toEqual('2024/01/15');
    });
  });

  describe('formatTime', () => {
    it('should format time with seconds', () => {
      const result = formatTime('09:30:45');
      expect(result).toEqual('09:30');
    });

    it('should format time without seconds', () => {
      const result = formatTime('09:30');
      expect(result).toEqual('09:30');
    });
  });

  describe('getTodayLocalDate', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = getTodayLocalDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getMaxDate', () => {
    it('should return date approximately 2 months from now', () => {
      const result = getMaxDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const today = new Date();
      const maxDate = new Date(result);
      const diffMonths = (maxDate.getFullYear() - today.getFullYear()) * 12 + (maxDate.getMonth() - today.getMonth());
      expect(diffMonths).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateEndTime', () => {
    it('should calculate end time correctly for 60 minutes', () => {
      const result = calculateEndTime('09:00:00', 60);
      expect(result).toEqual('10:00');
    });

    it('should calculate end time correctly for 30 minutes', () => {
      const result = calculateEndTime('09:00:00', 30);
      expect(result).toEqual('09:30');
    });

    it('should calculate end time correctly for 90 minutes', () => {
      const result = calculateEndTime('09:00:00', 90);
      expect(result).toEqual('10:30');
    });

    it('should handle time crossing midnight', () => {
      const result = calculateEndTime('23:30:00', 60);
      expect(result).toEqual('00:30');
    });

    it('should handle 45 minutes duration', () => {
      const result = calculateEndTime('14:15:00', 45);
      expect(result).toEqual('15:00');
    });
  });
});
