import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getBookings, 
  getAvailableSlots, 
  createBooking,
  setSelectedDate,
  setSelectedSlot,
  resetBookingState,
  cancelBooking
} from '@/store/bookingSlice';
import { AppDispatch, RootState } from '@/store';
import { TimeSlot, Booking } from '@/types';
import BookingPageOrganism from '@/components/organisms/BookingPage';
import { useUI } from '@/contexts/UIContext';

/**
 * 页面组件：预约页面
 * 集成预约功能的页面组件，处理预约逻辑和状态管理
 * 
 * @component
 */
interface BookingPageProps {
  /** 服务端渲染时传递的初始预约数据 */
  initialData?: Booking[];
  /** 是否为服务端渲染 */
  isSSR?: boolean;
  /** 服务端获取数据时的错误信息 */
  error?: string;
}

/**
 * 可用时间段表项接口
 * 继承TimeSlot接口，添加是否已预约属性
 */
interface AvailableSlotsForTable extends TimeSlot {
  isBooked: boolean;
}

/**
 * 预约页面组件
 */
const BookingPage: React.FC<BookingPageProps> = ({ initialData = [], isSSR = false, error: serverError }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useUI();
  const { currentUser } = useSelector((state: RootState) => state.user);
  // 从Redux store获取状态
  const {
    bookings, 
    availableSlots, 
    selectedDate, 
    selectedSlot, 
    loading, 
    error, 
    creatingBooking 
  } = useSelector((state: RootState) => state.booking);

  // 本地状态
  const [notes, setNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customerName, setCustomerName] = useState('Alice'); // 设置默认值
  const [customerPhone, setCustomerPhone] = useState('18100000000'); // 设置默认值
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWechat, setCustomerWechat] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [slots, setSlots] = useState<AvailableSlotsForTable[]>([]);

    // 表单验证状态
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // 初始化状态，如果有服务端数据则使用它
  useEffect(() => {
    // 如果是服务端渲染且有初始数据，直接设置到store中
    if (isSSR && initialData && Array.isArray(initialData) && initialData.length > 0) {
      dispatch({ type: 'booking/getBookings/fulfilled', payload: initialData });
    } else if (!isSSR) {
      // 客户端渲染时获取数据
      dispatch(getBookings());
    }
  }, [dispatch, isSSR]);

  // 如果有服务端错误，设置到store中
  useEffect(() => {
    if (isSSR && serverError) {
      dispatch({ type: 'booking/getBookings/rejected', error: { message: serverError } });
    }
  }, [dispatch, isSSR, serverError]);

  // 预约状态更新时更新slots状态
  useEffect(() => {
    if(availableSlots.length > 0){
      setSlots(availableSlots.map(slot => ({
        ...slot,
        isBooked: bookings.some(booking => 
          booking.timeSlotId === slot.id 
          && ['CONFIRMED', 'PENDING'].includes(booking.status)
          && selectedDate === booking.appointmentDate.slice(0, 10)
        )
      })));
    }
  }, [bookings, availableSlots, selectedDate]);

  // 日期改变时获取可用时间段
  useEffect(() => {
    dispatch(getAvailableSlots(selectedDate));
  }, [dispatch, selectedDate]);

  /**
   * 处理日期选择
   */
  const handleDateChange = (newDate: string) => {
    dispatch(setSelectedDate(newDate));
    setShowBookingForm(false);
    dispatch(setSelectedSlot(null));
  };
  
  /**
   * 处理手机号码输入变化
   */
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
  };

  /**
   * 处理时间段选择
   * @param slot - 选中的时间段
   */
  const handleSlotSelect = (slot: TimeSlot) => {
    dispatch(setSelectedSlot(slot));
    setShowBookingForm(true);
  };

  // 表单验证函数
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!serviceName) {
      errors.serviceName = '请选择服务类型';
    }
    
    if (!customerName.trim()) {
      errors.name = '请输入姓名';
    } else if (customerName.trim().length < 2) {
      errors.name = '姓名至少需要2个字符';
    }
    
    if (!customerPhone.trim()) {
      errors.phone = '请输入手机号码';
    } else if (!/^1[3-9]\d{9}$/.test(customerPhone.trim())) {
      errors.phone = '请输入有效的手机号码';
    }
    
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
  };

  /**
   * 处理创建预约
   */
  const handleCreateBooking = async () => {
    // 先进行表单验证
    if (!validateForm()) return;
    if (!selectedSlot || !customerName || !customerPhone) return;

    const result = await dispatch(createBooking({
      timeSlotId: selectedSlot.id,
      userId: currentUser?.id || '',
      appointmentDate: selectedDate,
      notes: notes || undefined,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerWechat: customerWechat || undefined,
      serviceName,
    }));

    if (createBooking.fulfilled.match(result)) {
      // 创建成功，重置表单
      setNotes('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerWechat('');
      setServiceName('');
      setShowBookingForm(false);
      dispatch(setSelectedSlot(null));
      setFormErrors({});
      setIsFormValid(false);
      // 重新获取预约列表和可用时间段
      dispatch(getBookings());
      dispatch(getAvailableSlots(selectedDate));
      showSuccess('预约创建成功');
      return;
    }

    showError('预约创建失败', result.error.message || '请稍后重试');
  };

  /**
   * 处理重置预约状态
   */
  const handleResetBookingState = () => {
    dispatch(resetBookingState());
  };

  /**
   * 处理取消预约
   */
  const handleCancelBooking = async (id: string) => {
    // if (!selectedSlot || !customerName || !customerPhone) return;

    const result = await dispatch(cancelBooking(id));
    if (cancelBooking.fulfilled.match(result)) {
      // 取消成功，重置表单
      setNotes('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerWechat('');
      setShowBookingForm(false);
      dispatch(setSelectedSlot(null));
      setFormErrors({});
      setIsFormValid(false);
      // 重新获取预约列表和可用时间段
      dispatch(getBookings());
      dispatch(getAvailableSlots(selectedDate));
      showSuccess('预约取消成功');
      return;
    }

    showError('预约取消失败', result.error.message || '请稍后重试');
  };

  /**
   * 处理备注变化
   */
  const handleNotesChange = async (note: string) => {
    setNotes(note);
  }

  /**
   * 处理客户姓名变化
   */
  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name);
  }

  /**
   * 处理客户邮箱变化
   */
  const handleCustomerEmailChange = (email: string) => {
    setCustomerEmail(email);
  }

  /**
   * 处理客户微信变化
   */
  const handleCustomerWechatChange = (wechat: string) => {
    setCustomerWechat(wechat);
  }

  /**
   * 处理服务类型变化
   */
  const handleServiceNameChange = (serviceName: string) => {
    setServiceName(serviceName);
  }

  /**
   * 处理取消创建预约
   */
  const handleCancelCreating = () => {
    setShowBookingForm(false);
    setServiceName('');
    dispatch(resetBookingState());
  }
  
  return (<BookingPageOrganism 
      loading={loading}
      error={error || undefined}
      bookings={bookings || []}
      availableSlots={slots || []}
      selectedDate={selectedDate || ''}
      selectedSlot={selectedSlot || null}
      showBookingForm={showBookingForm}
      creatingBooking={creatingBooking}
      customerName={customerName || ''}
      customerPhone={customerPhone || ''}
      customerEmail={customerEmail || ''}
      customerWechat={customerWechat || ''}
      serviceName={serviceName || ''}
      notes={notes || ''}
      onDateChange={handleDateChange}
      onSlotSelect={handleSlotSelect}
      onNotesChange={handleNotesChange}
      onCustomerNameChange={handleCustomerNameChange}
      onCustomerPhoneChange={handlePhoneChange}
      onCustomerEmailChange={handleCustomerEmailChange}
      onCustomerWechatChange={handleCustomerWechatChange}
      onServiceNameChange={handleServiceNameChange}
      onCancelCreating={handleCancelCreating}
      onCreateBooking={handleCreateBooking}
      onCancelBooking={handleCancelBooking}
      resetBookingState={handleResetBookingState}
  />);
};

export default BookingPage;
