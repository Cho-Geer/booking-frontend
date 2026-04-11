import { RoutePermissionsConfig, RouteRule } from '@/types/routePermissions';

export const routePermissions: RoutePermissionsConfig = [
  // 公开路径
  { pattern: '/login', roles: [], exact: true },
  { pattern: '/register', roles: [], exact: true },
  { pattern: '/account-disabled', roles: [], exact: true },
  { pattern: '/', roles: [], exact: true },

  // 管理员专属
  {
    pattern: '/admin',
    roles: ['admin'],
    redirectUnauthenticated: '/login',
    redirectForbidden: '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN',
  },
  {
    pattern: '/admin/*',
    roles: ['admin'],
    redirectUnauthenticated: '/login',
    redirectForbidden: '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN',
  },

  // 普通用户专属
  {
    pattern: '/bookings',
    roles: ['customer'],
    redirectUnauthenticated: '/login',
    redirectForbidden: '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN',
  },
  {
    pattern: '/bookings/*',
    roles: ['customer'],
    redirectUnauthenticated: '/login',
    redirectForbidden: '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN',
  },

  // 通用登录路由（如有）
  {
    pattern: '/my-bookings',
    roles: ['customer', 'admin'],
    redirectUnauthenticated: '/login',
  },
];

/** 查找匹配的权限规则 */
export function findRouteRule(pathname: string): RouteRule | undefined {
  return routePermissions.find((rule) => {
    if (rule.exact) return pathname === rule.pattern;
    if (rule.pattern.endsWith('/*')) {
      const base = rule.pattern.slice(0, -2);
      return pathname === base || pathname.startsWith(base + '/');
    }
    return pathname.startsWith(rule.pattern);
  });
}

/** 检查用户是否有权访问指定路径 */
export function hasRoutePermission(pathname: string, userRole: 'customer' | 'admin' | null): boolean {
  const rule = findRouteRule(pathname);
  if (!rule) return true;
  if (rule.roles.length === 0) return true;
  return userRole ? rule.roles.includes(userRole) : false;
}