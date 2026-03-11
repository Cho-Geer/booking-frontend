import React from 'react';
// import type { GetServerSideProps } from 'next';
import BookingPage from '@/components/pages/BookingPage';
// import { bookingService } from '../services/bookingService';
import { Booking } from '../types';

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
export default function BookingsRoute({ initialBookings, isServerRendered, error }: BookingsRouteProps) {
  return <BookingPage initialData={initialBookings} isSSR={isServerRendered} error={error} />;
}

// /**
//  * 预约页面的服务端数据获取函数
//  * @param context 包含请求和响应信息的上下文对象
//  * @returns 页面所需的属性数据
//  */
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     // 服务端获取预约数据
//     // 在实际应用中，这里应该根据用户角色决定使用getMyBookings还是getBookings
//     const bookings = await bookingService.getBookings();
//     return {
//       props: {
//         initialBookings: bookings,
//         isServerRendered: true,
//       },
//     };
//   } catch (error) {
//     console.error('服务端获取预约数据失败:', error);
//     return {
//       props: {
//         initialBookings: [],
//         isServerRendered: true,
//         error: '获取数据失败',
//       },
//     };
//   }
// };