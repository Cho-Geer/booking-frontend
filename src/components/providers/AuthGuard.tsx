import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/compat/router';
import { RootState, AppDispatch } from '@/store';
import { setAuthEventHandler } from '@/utils/authEvents';
import { setNavigate } from '@/utils/navigation';
import { findRouteRule, hasRoutePermission } from '@/config/routePermissions';
import { logoutUser } from '@/store/userSlice';

const PUBLIC_PATHS = ['/login', '/register', '/account-disabled'];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, authInitialized } = useSelector((state: RootState) => state.user);
  const pathname = router?.pathname || '';
  const userRole = currentUser?.userType ?? null;

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

    if (userRole && PUBLIC_PATHS.includes(pathname) && pathname !== '/account-disabled') {
      const target = userRole === 'admin' ? '/admin/bookings' : '/bookings';
      router.replace(target);
    }
  }, [authInitialized, userRole, pathname, router]);

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

  if (currentUser && isRoot) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  if (!authInitialized && !isPublic && !isRoot) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  if (!currentUser && !isPublic && !isRoot) {
    return null;
  }
  return <>{children}</>;
};