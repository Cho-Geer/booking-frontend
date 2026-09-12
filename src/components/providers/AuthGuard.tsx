import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/compat/router';
import { RootState, AppDispatch } from '@/store';
import { setAuthEventHandler } from '@/utils/authEvents';
import { setNavigate } from '@/utils/navigation';
import { findRouteRule, hasRoutePermission } from '@/config/routePermissions';
import { logoutUser, logout } from '@/store/userSlice';
import FullScreenLoading from '@/components/atoms/FullScreenLoading';

const PUBLIC_PATHS = ['/login', '/register', '/account-disabled'];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, authInitialized } = useSelector((state: RootState) => state.user);
  const pathname = router?.pathname || '';
  const userRole = currentUser?.userType ?? null;

  // middleware 重定向标记（error=invalid_token）＝服务器已判定未认证。
  // 以服务器判定为准清除本地 redux 会话（cookie 为 HttpOnly，客户端无法直接感知其丢失），
  // 防止已失效的本地会话与守卫自动跳转形成 /login⇄受保护页 的乒乓循环。
  const serverRejected = router?.query?.error === 'invalid_token';
  const markerHandled = React.useRef(false);

  useEffect(() => {
    if (!serverRejected) {
      markerHandled.current = false;
      return;
    }
    if (markerHandled.current) return;
    markerHandled.current = true;
    if (currentUser) {
      dispatch(logout());
    }
    // 剥离 URL 中的标记，避免误清紧随其后的重新登录
    router?.replace({ pathname: '/login', query: {} });
  }, [serverRejected, currentUser, dispatch, router]);

  // 注册导航函数
  React.useEffect(() => {
    setNavigate((url: string) => {
      if (router && router.pathname !== url) router.replace(url);
    });
  }, [router]);

  // 强制登出并跳转账户禁用页（双向角色变更均触发）
  const forceLogoutAndRedirect = useCallback(async (reason: string) => {
    try {
      await dispatch(logoutUser()).unwrap();   // 清除 HttpOnly cookies
    } catch {}
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
    router?.replace(`/account-disabled?reason=${reason}`);
  }, [dispatch, router]);

  // 实时角色校验（双向拦截）
  useEffect(() => {
    if (!authInitialized || !router || !userRole) return;
    if (!hasRoutePermission(pathname, userRole)) {
      forceLogoutAndRedirect('ROLE_CHANGED_FROM_ADMIN');
    }
  }, [authInitialized, userRole, pathname, forceLogoutAndRedirect, router]);

  // 初始路由保护（基于配置）
  useEffect(() => {
    if (!authInitialized || !router) return;
    const rule = findRouteRule(pathname);
    if (!rule) return;
    const requiresAuth = rule.roles.length > 0;

    if (requiresAuth && !userRole) {
      const redirectTo = rule.redirectUnauthenticated || '/login';
      if (pathname !== redirectTo) router.replace(redirectTo);
      return;
    }

    if (userRole && requiresAuth && !rule.roles.includes(userRole)) {
      const redirectTo = rule.redirectForbidden || '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN';
      if (pathname !== redirectTo) router.replace(redirectTo);
      return;
    }

    if (userRole && !serverRejected && (PUBLIC_PATHS.includes(pathname) || pathname === '/') && pathname !== '/account-disabled') {
      const target = userRole === 'admin' ? '/admin/bookings' : '/bookings';
      router.replace(target);
    }
  }, [authInitialized, userRole, pathname, router, serverRejected]);

  // 认证事件处理（API 拦截器驱动）
  useEffect(() => {
    setAuthEventHandler((type, payload) => {
      const reason = payload?.reason || '';
      switch (type) {
        case 'UNAUTHORIZED':
        case 'CSRF_VALIDATION_FAILED':
        case 'FORCE_LOGOUT':
          router?.replace('/login');
          break;
        case 'ACCOUNT_DISABLED':
          router?.replace(`/account-disabled?reason=${reason || 'INACTIVE'}`);
          break;
        case 'ROLE_CHANGED_FROM_ADMIN':
        case 'ROLE_UPGRADED_TO_ADMIN':
          forceLogoutAndRedirect(type);
          break;
      }
    });
  }, [router, forceLogoutAndRedirect]);

  // 渲染决策
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isRoot = pathname === '/';

  const isRedirectPending =
    !!currentUser && !serverRejected && PUBLIC_PATHS.includes(pathname) && pathname !== '/account-disabled';
  if (isRedirectPending) {
    return <FullScreenLoading message="正在进入系统..." />;
  }

  if (currentUser && isRoot) {
    return <FullScreenLoading message="正在验证身份..." />;
  }
  if (!authInitialized && !isPublic && !isRoot) {
    return <FullScreenLoading message="初始化中..." />;
  }
  if (!currentUser && !isPublic && !isRoot) {
    return null;
  }
  return <>{children}</>;
};