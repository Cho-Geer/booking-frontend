import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

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
    return null; // 构建时不渲染任何内容
  }

  return <AdminBookingsPage />;
}

export default AdminBookingsRoute;
