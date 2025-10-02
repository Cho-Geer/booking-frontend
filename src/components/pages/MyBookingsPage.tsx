import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import MyBookingsPageOrganism from '@/components/organisms/MyBookingsPage';
import { getBookings, cancelBooking } from '@/store/bookingSlice';
import { withAuth } from '@/components/hoc/withAuth';

/**
 * 页面组件：我的预约
 * 
 * @component
 */
const MyBookingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  
  // 获取预约列表（withAuth已确保用户已登录）
  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  /**
   * 处理取消预约
   */
  const handleCancelBooking = (bookingId: string) => {
    dispatch(cancelBooking(bookingId));
  };

  return (
    <MyBookingsPageOrganism
      bookings={bookings}
      loading={loading}
      error={error || undefined}
      onCancelBooking={handleCancelBooking}
    />
  );
};

// 使用withAuth高阶组件包装，确保需要认证才能访问
export default withAuth(MyBookingsPage);