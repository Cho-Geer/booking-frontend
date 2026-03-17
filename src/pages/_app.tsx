import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';
import '../../public/global.css';
import { Provider } from 'react-redux';
import { store } from '../store';
import { UIProvider } from '../contexts/UIContext';
import dynamic from 'next/dynamic';
import { initializeAuth } from '@/store/userSlice';

// 动态导入PageWrapper以避免SSR问题
const PageWrapper = dynamic(
  () => import('../components/wrappers/PageWrapper'),
  { ssr: false }
);

/**
 * 自定义 App 组件
 * 用于全局包装应用，提供 Redux 和 UI 状态管理
 * 
 * @component
 * @param {AppProps} props - 组件属性
 * @param {React.ComponentType} props.Component - 页面组件
 * @param {any} props.pageProps - 页面属性
 * @param {Router} props.router - Next.js 路由对象
 * @returns {JSX.Element} 包装后的应用组件
 */
export default function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    store.dispatch(initializeAuth());
  }, []);

  // 性能监控配置 - 根据迁移文档阶段四的要求实现
  useReportWebVitals((metric) => {
    // 在控制台记录性能数据
    console.log('Web Vitals:', metric);
    
    // 在实际应用中，可以将性能数据发送到分析服务
    // 例如：sendToAnalytics(metric);
    // 这里只是一个示例实现
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // 模拟发送性能数据到服务器
      // 在生产环境中，这里应该使用实际的分析服务
      try {
        const performanceData = {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          entries: metric.entries,
          navigationType: metric.navigationType,
          route: router.pathname
        };
        
        // 这里只是一个示例，不实际发送请求
        console.log('性能数据:', performanceData);
      } catch (error) {
        console.error('发送性能数据失败:', error);
      }
    }
  });

  return (
    <UIProvider>
      <Provider store={store}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="预约系统 - 高效管理您的预约" />
          <title>预约系统</title>
        </Head>
        <PageWrapper Component={Component} pageProps={pageProps} router={router} />
      </Provider>
    </UIProvider>
  );
}
