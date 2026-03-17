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

  // 如果已登录用户访问登录/注册页面，根据用户类型重定向
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    
    if (accessToken) {
        const decodedToken = decodeToken(accessToken);
        
        if (decodedToken) {
          if (decodedToken.role === 'ADMIN') {
            console.log('Admin user detected, redirecting to /admin/bookings');
            return NextResponse.redirect(new URL('/admin/bookings', request.url));
          } else {
            console.log('Regular user detected, redirecting to /bookings');
          }
        } else {
          // Token 解析失败，重定向到登录页面
          return createLoginRedirect(request, '登录已过期，请重新登录');
        }
      }
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
    '/admin/:path*',
    '/bookings/:path*',
    '/my-bookings/:path*',
  ],
};
