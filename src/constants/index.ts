/**
 * 管理控制台配置常量
 * 集中管理管理员页面的配置项
 */

/**
 * Tab 配置
 */
export const ADMIN_TABS = [
  { key: 'bookings' as const, label: '预约管理' },
  { key: 'services' as const, label: '服务管理' },
  { key: 'users' as const, label: '用户管理' },
];

/**
 * 服务表单默认值
 */
export const DEFAULT_SERVICE_FORM = {
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
  imageUrl: '',
  isActive: true,
  displayOrder: 1,
} as const;

/**
 * 用户列表默认查询参数
 */
export const DEFAULT_USER_QUERY = {
  page: 1,
  limit: 20,
} as const;

/**
 * React Query 缓存时间配置（毫秒）
 */
export const QUERY_STALE_TIME = {
  services: 5 * 60 * 1000,
  users: 5 * 60 * 1000,
} as const;
