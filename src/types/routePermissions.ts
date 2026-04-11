import { UserType } from './user';

export interface RouteRule {
  pattern: string;                // 路由模式，支持 '/*' 通配
  roles: UserType[];              // 允许访问的角色，[] 表示公开
  redirectUnauthenticated?: string;
  redirectForbidden?: string;
  exact?: boolean;
}

export type RoutePermissionsConfig = RouteRule[];