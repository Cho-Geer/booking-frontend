// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// 定义 JWT payload 类型
interface JwtPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  exp?: number;
  iat?: number;
}

/**
 * 解析 JWT token 并提取用户角色
 */
function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * 清除认证相关的 cookies
 */
function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('csrf_token');
  return response;
}

/**
 * 创建重定向到登录页面的响应
 */
function createLoginRedirect(request: NextRequest, errorMessage?: string, redirectPath?: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  
  if (redirectPath) {
    loginUrl.searchParams.set('redirect', redirectPath);
  }
  
  if (errorMessage) {
    loginUrl.searchParams.set('error', 'invalid_token');
    loginUrl.searchParams.set('message', errorMessage);
  }
  
  const response = NextResponse.redirect(loginUrl);
  return clearAuthCookies(response);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  // 公开路径：始终允许访问，不进行认证拦截
  const publicPaths = [
    '/login',
    '/register',
    '/demo-ui',
    '/image-gallery',
    '/account-disabled',
  ];

  const isPublicPath = pathname === '/' || publicPaths.some(p => 
    pathname === p || pathname.startsWith(`${p}/`)
  );

  // 1. 保护管理后台路由：未认证则拒绝
  if (pathname.startsWith('/admin') && !isAuthenticated) {
    return createLoginRedirect(request, undefined, pathname);
  }

  // 2. 保护其他非公开路由：未认证则跳转登录
  if (!isPublicPath && !isAuthenticated) {
    return createLoginRedirect(request, undefined, pathname);
  }

  // 3. 特殊处理：已登录用户访问 /login、/register、/account-disabled 时
  //    **核心修改：不再进行角色重定向**，只处理特殊参数场景，并统一放行。
  if ((pathname === '/login' || pathname === '/register' || pathname === '/account-disabled') && isAuthenticated) {
    const searchParams = request.nextUrl.searchParams;
    
    // 处理 CSRF 错误、账户禁用后跳转、角色变更等特殊情况（保留原有逻辑）
    const isCsrfError = searchParams.get('csrf_error') === 'true';
    const isFromDisabledPage = searchParams.get('cleared_from_disabled_page') === 'true';
    const isRoleChanged = searchParams.get('role_changed') === 'true' || 
                          searchParams.get('reason') === 'ROLE_CHANGED_FROM_ADMIN' ||
                          searchParams.get('reason') === 'ROLE_UPGRADED_TO_ADMIN';

    if (isCsrfError || isFromDisabledPage || isRoleChanged) {
      // 这些场景需要清除 cookies 并允许访问登录页（原有逻辑）
      const response = NextResponse.next();
      clearAuthCookies(response);
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }

    // 对于普通的已登录用户访问 /login 等页面：
    // 不再进行角色重定向，直接放行，由客户端路由守卫 (AuthGuard) 统一处理跳转。
    // 这样可以彻底避免 Middleware 与客户端守卫之间的乒乓重定向。
    const response = NextResponse.next();
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  // 4. 添加安全头部并放行
  const response = NextResponse.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/account-disabled',
    '/admin/:path*',
    '/bookings/:path*',
    '/my-bookings/:path*',
  ],
};