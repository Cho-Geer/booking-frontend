/**
 * htmlUtils 单元测试
 */
import {
  stripHtml,
  sanitizeHtml,
} from '@/utils/htmlUtils';

describe('htmlUtils', () => {
  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      const result = stripHtml('<p>Hello <strong>World</strong></p>');
      expect(result).toEqual('Hello World');
    });

    it('should return empty string for null/undefined', () => {
      expect(stripHtml('')).toEqual('');
      expect(stripHtml(null as any)).toEqual('');
      expect(stripHtml(undefined as any)).toEqual('');
    });

    it('should handle text without HTML tags', () => {
      const result = stripHtml('Plain Text');
      expect(result).toEqual('Plain Text');
    });
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML and remove dangerous tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script><p>Safe text</p>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe text');
    });

    it('should add target blank to links', () => {
      const result = sanitizeHtml('<a href="https://example.com">Link</a>');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeHtml('')).toEqual('');
      expect(sanitizeHtml(null as any)).toEqual('');
    });
  });
});
