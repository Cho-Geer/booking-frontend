import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import FullScreenLoading from '@/components/atoms/FullScreenLoading';

const AdminBookingsPage = dynamic(
  () => import('@/components/pages/AdminPage'),
  { ssr: false }
);

/**
 * 管理员控制台页面路由
 * 
 * @returns 管理员控制台页面组件
 */
function AdminBookingsRoute() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 挂载前渲染全屏加载占位，避免出现空白主区域
    return <FullScreenLoading message="加载中..." />;
  }

  return <AdminBookingsPage />;
}

export default AdminBookingsRoute;
