import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 中间件函数
 * 用于路由保护、认证检查和请求处理
 * 根据迁移文档阶段四的要求实现
 */
export function middleware(request: NextRequest) {
  // 获取当前路径
  const { pathname } = request.nextUrl;
  
  // 获取认证token
  // 在Next.js中间件中，我们使用cookies而不是localStorage
  // 修正：使用 access_token 或 refresh_token 判断认证状态
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  // 公开路径列表 - 不需要认证的路径
  const publicPaths = [
    '/login',
    '/register',
    '/demo-ui',
    '/image-gallery',
    // API路由通常也应该被检查，但这取决于具体需求
    // '/api/' 前缀的路径在中间件中会被自动忽略
  ];

  // 检查当前路径是否为公开路径
  // 修正：根路径 '/' 特殊处理，避免 startsWith('/') 匹配所有路径
  const isPublicPath = pathname === '/' || publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // 保护管理后台路由
  if (pathname.startsWith('/admin') && !isAuthenticated) {
    // 重定向到登录页，并保留原始路径作为回调
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 保护需要认证的用户路由
  if (!isPublicPath && !isAuthenticated) {
    // 重定向到登录页，并保留原始路径作为回调
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录用户访问登录/注册页面，重定向到预约页
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/bookings', request.url));
  }

  // 添加安全头部
  const response = NextResponse.next();
  
  // 设置内容安全策略(CSP) - 基本配置
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';"
  );

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
  // 匹配所有路径，除了静态文件和API路由
  matcher: [
    /*
     * 匹配所有以这些路径开头的请求：
     * - / (根路径)
     * - /login
     * - /register
     * - /admin
     * - /bookings
     * - /my-bookings
     * 排除静态文件（_next）和API路由
     */
    '/((?!_next/|api/|v1/|favicon.ico|public/).*)',
  ],
};
