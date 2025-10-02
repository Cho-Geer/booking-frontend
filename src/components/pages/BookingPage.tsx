import { useDispatch, useSelector } from 'react-redux';
import BookingPageOrganism from '@/components/organisms/BookingPage';
import {
  getBookings,
  getAvailableSlots,
  createBooking,
  cancelBooking,
  resetBookingState as resetBookingSliceState,
  setSelectedSlot
} from '@/store/bookingSlice';
import { AppDispatch, RootState } from '@/store';
import { TimeSlot } from '@/types';
import { withAuth } from '@/components/hoc/withAuth';
import { useState, useEffect } from 'react';

/**
 * 页面组件：预约页面
 * 集成预约功能的页面组件，处理预约逻辑和状态管理
 * 
 * @component
 */
interface BookingPageProps {
  /** 服务端渲染时传递的初始预约数据 */
  initialData?: any[];
  /** 是否为服务端渲染 */
  isSSR?: boolean;
  /** 服务端获取数据时的错误信息 */
  error?: string;
}

const BookingPage: React.FC<BookingPageProps> = ({ initialData, isSSR = false, error: serverError }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    bookings,
    availableSlots,
    selectedDate,
    selectedSlot,
    loading,
    error,
    creatingBooking,
    success
  } = useSelector((state: RootState) => state.booking);
  
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWechat, setCustomerWechat] = useState('');

  // 初始化状态，如果有服务端数据则使用它
  useEffect(() => {
    // 如果是服务端渲染且有初始数据，直接设置到store中
    if (isSSR && initialData && initialData.length > 0) {
      dispatch({ type: 'booking/getBookings/fulfilled', payload: initialData });
    } else if (!isSSR) {
      // 客户端渲染时获取数据
      dispatch(getBookings());
    }
  }, [dispatch, initialData, isSSR]);

  // 如果有服务端错误，设置到store中
  useEffect(() => {
    if (isSSR && serverError) {
      dispatch({ type: 'booking/getBookings/rejected', error: { message: serverError } });
    }
  }, [dispatch, isSSR, serverError]);

  // 日期变更时获取可用时间段
  useEffect(() => {
    if (selectedDate) {
      dispatch(getAvailableSlots(selectedDate));
    }
  }, [selectedDate, dispatch]);

  // 预约成功后重置状态并刷新预约列表
  useEffect(() => {
    if (success) {
      dispatch(getBookings());
      dispatch(resetBookingSliceState());
      setNotes('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerWechat('');
    }
  }, [success, dispatch]);

  /**
   * 处理日期变更
   */
  const handleDateChange = (date: string) => {
    dispatch(getAvailableSlots(date));
  };

  /**
   * 处理时间段选择
   * @param slot - 选中的时间段
   */
  const handleSlotSelect = (slot: TimeSlot) => {
    dispatch(setSelectedSlot(slot));
  };

  /**
   * 处理创建预约
   */
  const handleCreateBooking = () => {
    if (selectedSlot && currentUser && customerName && customerPhone) {
      dispatch(createBooking({
        serviceId: 'default-service', // 默认服务ID，实际应用中应该让用户选择
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes,
        customerName,
        customerPhone,
        customerEmail,
        customerWechat
      }));
    }
  };

  /**
   * 处理取消预约
   */
  const handleCancelBooking = (bookingId: string) => {
    dispatch(cancelBooking(bookingId));
  };

  /**
   * 重置预约状态
   */
  const resetBookingState = () => {
    dispatch(resetBookingSliceState());
    setNotes('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerWechat('');
  };

  return (
    <BookingPageOrganism
      bookings={bookings}
      availableSlots={availableSlots}
      selectedDate={selectedDate}
      selectedSlot={selectedSlot}
      loading={loading}
      error={error || undefined}
      creatingBooking={creatingBooking}
      customerName={customerName}
      customerPhone={customerPhone}
      customerEmail={customerEmail}
      customerWechat={customerWechat}
      onDateChange={handleDateChange}
      onSlotSelect={handleSlotSelect}
      onCreateBooking={handleCreateBooking}
      onCancelBooking={handleCancelBooking}
      onNotesChange={setNotes}
      onCustomerNameChange={setCustomerName}
      onCustomerPhoneChange={setCustomerPhone}
      onCustomerEmailChange={setCustomerEmail}
      onCustomerWechatChange={setCustomerWechat}
      notes={notes}
      resetBookingState={resetBookingState}
    />
  );
};

// 使用withAuth高阶组件包装，确保需要认证才能访问
export default withAuth(BookingPage);