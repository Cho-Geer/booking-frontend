import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import MyBookingsPageOrganism from '@/components/organisms/MyBookingsPage';
import { getBookings, cancelBooking, updateBooking } from '@/store/bookingSlice';
import { fetchServicesForUsers } from '@/store/serviceSlice';
import { withAuth } from '@/components/hoc/withAuth';

/**
 * 页面组件：我的预约
 * 
 * @component
 */
const MyBookingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading: bookingLoading, error: bookingError } = useSelector((state: RootState) => state.booking);
  const { services, loading: serviceLoading, error: serviceError } = useSelector((state: RootState) => state.service); 
  
  // 获取预约列表（withAuth已确保用户已登录）
  useEffect(() => {
    dispatch(getBookings());
    dispatch(fetchServicesForUsers());
  }, [dispatch]);

  /**
   * 处理取消预约
   */
  const handleCancelBooking = (bookingId: string) => {
    dispatch(cancelBooking(bookingId));
  };

  const handleUpdateBooking = async (payload: {
    id: string;
    appointmentDate: string;
    timeSlotId: string;
    serviceId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerWechat?: string;
    notes?: string;
  }) => {
    const result = await dispatch(updateBooking(payload));
    if (updateBooking.fulfilled.match(result)) {
      dispatch(getBookings());
      return;
    }
    throw new Error(result.error.message || '更新预约失败');
  };

  return (
    <MyBookingsPageOrganism
      bookings={bookings}
      services={services}
      loading={bookingLoading || serviceLoading}
      error={bookingError || serviceError || undefined}
      onCancelBooking={handleCancelBooking}
      onUpdateBooking={handleUpdateBooking}
    />
  );
};

// 使用withAuth高阶组件包装，确保需要认证才能访问
export default withAuth(MyBookingsPage);
