/**
 * 日期时间工具函数
 * 统一管理项目中所有日期和时间格式化逻辑
 */

/**
 * 格式化日期显示
 * @param dateString 日期字符串 (YYYY-MM-DD 或 YYYY-MM-DDTHH:mm:ss)
 * @returns 格式化后的中文日期字符串 (如: 2024年1月15日 星期一)
 */
export const formatDate = (dateString: string): string => {
  const normalized = dateString.includes('T') ? dateString.slice(0, 10) : dateString;
  const [year, month, day] = normalized.split('-').map(Number);
  const parsedDate = Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)
    ? new Date(dateString)
    : new Date(year, month - 1, day);
  return parsedDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

/**
 * 格式化短日期格式
 * @param dateString 日期字符串
 * @returns 短格式日期 (YYYY/MM/DD)
 */
export const formatDateShort = (dateString: string): string => {
  return dateString.replace(/-/g, '/');
};

/**
 * 格式化时间显示
 * @param timeString 时间字符串 (HH:mm:ss 或 HH:mm)
 * @returns 格式化后的时间字符串 (如: 09:00)
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

/**
 * 获取当前本地日期
 * @returns 当前日期字符串 (YYYY-MM-DD)
 */
export const getTodayLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取最大可选日期（当前日期 + 2个月）
 * @returns 最大日期字符串 (YYYY-MM-DD)
 */
export const getMaxDate = (): string => {
  const now = new Date();
  now.setMonth(now.getMonth() + 2);
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 计算结束时间
 * @param startTime 开始时间 (HH:mm:ss)
 * @param durationMinutes 持续时间（分钟）
 * @returns 结束时间 (HH:mm)
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};
