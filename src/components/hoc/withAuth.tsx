import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '@/store';

/**
 * 认证保护高阶组件
 * 包装需要认证的页面组件，自动处理未认证用户的重定向
 * 
 * @param WrappedComponent - 需要认证的页面组件
 * @returns 包装后的组件
 */
export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { currentUser } = useSelector((state: RootState) => state.user);

    useEffect(() => {
      // 如果用户未登录，重定向到登录页
      if (!currentUser) {
        router.push('/login');
      }
    }, [currentUser, router]);

    // 如果用户未登录，不渲染组件
    if (!currentUser) {
      return null;
    }

    // 渲染包装组件
    return <WrappedComponent {...props} />;
  };
}

export default withAuth;