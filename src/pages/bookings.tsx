import React from 'react';
import BookingPage from '@/components/pages/BookingPage';
import { Booking } from '../types';
import withAuth from '@/components/hoc/withAuth';

interface BookingsRouteProps {
  initialBookings: Booking[];
  isServerRendered: boolean;
  error?: string;
}

/**
 * 预约页面路由
 * 
 * @param initialBookings 服务端获取的初始预约数据
 * @param isServerRendered 是否为服务端渲染
 * @param error 错误信息（如果有）
 * @returns 预约页面组件
 */
function BookingsRoute({ initialBookings, isServerRendered, error }: BookingsRouteProps) {
  return <BookingPage initialData={initialBookings} isSSR={isServerRendered} error={error} />;
}

export default withAuth(BookingsRoute);