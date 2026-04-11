import { useRouter } from 'next/compat/router';
import React from 'react';

type NavigateFn = (url: string) => void;

let navigateFn: NavigateFn | null = null;

export const setNavigate = (fn: NavigateFn) => {
  navigateFn = fn;
};

export const navigate = (url: string) => {
  if (navigateFn) {
    navigateFn(url);
  } else {
    // 降级：仅在开发环境或守卫未挂载时使用
    window.location.href = url;
  }
};

// React Hook 版本，用于在组件中注册导航函数
export const useRegisterNavigate = () => {
  const router = useRouter();
  
  React.useEffect(() => {
    setNavigate((url: string) => {
      if (router && router.pathname !== url) {
        router.replace(url);
      }
    });
  }, [router]);
};