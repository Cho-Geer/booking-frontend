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
    const { currentUser, authInitialized } = useSelector((state: RootState) => state.user);

    useEffect(() => {
      if (authInitialized && !currentUser) {
        router.push('/login');
      }
    }, [authInitialized, currentUser, router]);

    if (!authInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!currentUser) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuth;
