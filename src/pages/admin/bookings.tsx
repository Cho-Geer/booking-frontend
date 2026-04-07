import dynamic from 'next/dynamic';

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
  return <AdminBookingsPage />;
}

export default AdminBookingsRoute;
