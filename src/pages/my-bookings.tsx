import React from 'react';
import MyBookingsPage from '@/components/pages/MyBookingsPage';
import withAuth from '@/components/hoc/withAuth';

/**
 * 我的预约页面路由
 * 
 * @returns 我的预约页面组件
 */
function MyBookingsRoute() {
  return <MyBookingsPage />;
}

export default withAuth(MyBookingsRoute);