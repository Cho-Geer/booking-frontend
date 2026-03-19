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
 * @param token JWT token 字符串
 * @returns 用户角色，如果解析失败则返回 null
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
 * @param response NextResponse 对象
 * @returns 清除 cookies 后的 NextResponse 对象
 */
function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}

/**
 * 创建重定向到登录页面的响应
 * @param request NextRequest 对象
 * @param errorMessage 错误信息
 * @param redirectPath 重定向路径
 * @returns NextResponse 对象
 */
function createLoginRedirect(request: NextRequest, errorMessage?: string, redirectPath?: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  
  // 添加重定向路径
  if (redirectPath) {
    loginUrl.searchParams.set('redirect', redirectPath);
  }
  
  // 添加错误信息
  if (errorMessage) {
    loginUrl.searchParams.set('error', 'invalid_token');
    loginUrl.searchParams.set('message', errorMessage);
  }
  
  const response = NextResponse.redirect(loginUrl);
  return clearAuthCookies(response);
}

/**
 * Next.js 中间件函数
 * 用于路由保护、认证检查和请求处理
 */
export function middleware(request: NextRequest) {

  console.log('Middleware request::::::', request.method, request.url);
  // 获取当前路径
  const { pathname } = request.nextUrl;
  
  // 获取认证token
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  // 公开路径列表 - 不需要认证的路径
  const publicPaths = [
    '/login',
    '/register',
    '/demo-ui',
    '/image-gallery',
    '/account-disabled', // 账户禁用错误页面
  ];

  // 检查当前路径是否为公开路径
  const isPublicPath = pathname === '/' || publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // 保护管理后台路由
  if (pathname.startsWith('/admin') && !isAuthenticated) {
    // 重定向到登录页，并保留原始路径作为回调
    return createLoginRedirect(request, undefined, pathname);
  }

  // 保护需要认证的用户路由
  if (!isPublicPath && !isAuthenticated) {
    // 重定向到登录页，并保留原始路径作为回调
    return createLoginRedirect(request, undefined, pathname);
  }

  // 如果已登录用户访问登录/注册/账户禁用页面，根据用户类型重定向
  if ((pathname === '/login' || pathname === '/register' || pathname === '/account-disabled') && isAuthenticated) {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    
    // 特殊情况 1: CSRF 错误后跳转到登录页，允许访问登录页而不重定向
    // 这样可以显示错误信息并让用户重新登录
    const isCsrfError = searchParams.get('csrf_error') === 'true';
    
    if (isCsrfError && pathname === '/login') {
      // CSRF 错误后的特殊处理：清除 cookies 并允许访问登录页
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('csrf_token');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }
    
    // 特殊情况 2: 从 account-disabled 页面导航到登录页或首页
    // 通过查询参数 cleared_from_disabled_page 识别
    const isFromDisabledPage = searchParams.get('cleared_from_disabled_page') === 'true';
    
    if (isFromDisabledPage && (pathname === '/login' || pathname === '/')) {
      // 允许从禁用页面导航到登录页或首页，同时清除 cookies
      // 不再检查 token 角色，直接允许访问
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('csrf_token');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }
    
    // 特殊情况 3: ROLE_CHANGED_FROM_ADMIN 用户导航到登录页
    // 即使有 token 也不进行角色检查，直接清除 cookies 并允许访问登录页
    const isRoleChanged = searchParams.get('role_changed') === 'true' || 
                          searchParams.get('reason') === 'ROLE_CHANGED_FROM_ADMIN';
    
    if (isRoleChanged && pathname === '/login') {
      // 角色变更后的特殊处理：清除所有 cookies 并允许访问登录页
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('csrf_token');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }
    
    if (accessToken) {
        const decodedToken = decodeToken(accessToken);
        
        if (decodedToken) {
          // 检查用户状态是否为 ACTIVE
          // 如果用户状态不是 ACTIVE（INACTIVE 或 BLOCKED），允许访问 account-disabled 页面
          if (pathname === '/account-disabled') {
            // 允许 INACTIVE/BLOCKED 用户访问错误页面，不进行重定向
            const response = NextResponse.next();
            response.headers.set('X-XSS-Protection', '1; mode=block');
            response.headers.set('X-Frame-Options', 'SAMEORIGIN');
            response.headers.set('X-Content-Type-Options', 'nosniff');
            return response;
          }
          
          if (decodedToken.role === 'ADMIN') {
            console.log('Admin user detected, redirecting to /admin/bookings');
            return NextResponse.redirect(new URL('/admin/bookings', request.url));
          } else {
            // 普通用户尝试访问管理后台，清除 tokens 并重定向到账户禁用页面
            console.log('Regular user attempting to access admin panel, clearing tokens and redirecting to /account-disabled');
            const response = NextResponse.redirect(new URL('/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN', request.url));
            // 清除所有认证 cookies
            response.cookies.delete('access_token');
            response.cookies.delete('refresh_token');
            response.cookies.delete('csrf_token');
            return response;
          }
        } else {
          // Token 解析失败，重定向到登录页面
          return createLoginRedirect(request, '登录已过期，请重新登录');
        }
      }
    // 注意：这里不处理 CSRF 验证失败的情况，因为那是客户端 JavaScript 层面的处理
    // 中间件无法访问 sessionStorage，所以无法检测 csrfValidationFailed 标志
    return NextResponse.redirect(new URL('/bookings', request.url));
  }

  // 添加安全头部
  const response = NextResponse.next();
  
  // 设置X-XSS-Protection头部
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 设置X-Frame-Options头部
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // 设置X-Content-Type-Options头部
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

/**
 * 中间件配置
 * 定义中间件适用的路径模式
 */
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/account-disabled', // 账户禁用错误页面
    '/admin/:path*',
    '/bookings/:path*',
    '/my-bookings/:path*',
  ],
};
