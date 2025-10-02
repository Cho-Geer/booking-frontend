import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/router';

/**
 * 管理员权限验证高阶组件
 * 包装需要管理员权限的页面组件，确保只有管理员用户才能访问
 * 
 * @param {React.ComponentType<P>} WrappedComponent - 需要管理员权限的组件
 * @returns {React.FC<P>} 包装后的组件
 */
export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithAdminAuth: React.FC<P> = (props) => {
    const router = useRouter();
    const { currentUser } = useSelector((state: RootState) => state.user);

    useEffect(() => {
      // 如果用户不是管理员，重定向到首页
      if (currentUser && currentUser.userType !== 'admin') {
        router.push('/');
      }
    }, [currentUser, router]);

    // 如果用户不是管理员，不渲染组件
    if (!currentUser || currentUser.userType !== 'admin') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // 设置显示名称，便于调试
  ComponentWithAdminAuth.displayName = `withAdmin(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithAdminAuth;
}