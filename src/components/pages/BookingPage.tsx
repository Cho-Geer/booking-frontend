import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getBookings, 
  getAvailableSlots, 
  createBooking,
  getServices,
  setSelectedDate,
  setSelectedSlot,
  resetBookingState,
  cancelBooking,
  updateBooking,
  setPage,
  setFilters
} from '@/store/bookingSlice';
import { AppDispatch, RootState } from '@/store';
import { TimeSlot, Booking, AppointmentQuery } from '@/types';
import BookingPageOrganism from '@/components/organisms/BookingPage';
import { useUI } from '@/contexts/UIContext';
import { bookingService } from '@/services/bookingService';

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
  isMyBooking: boolean;
  isOccupied?: boolean;
  isPast?: boolean;
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
    services,
    selectedDate, 
    selectedSlot, 
    loading,
    slotsLoading,
    bookingsLoading,
    error, 
    creatingBooking,
    pagination,
    filters
  } = useSelector((state: RootState) => state.booking);

  // 本地状态
  const [notes, setNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customerName, setCustomerName] = useState('Alice'); // 设置默认值
  const [customerPhone, setCustomerPhone] = useState('18100000000'); // 设置默认值
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWechat, setCustomerWechat] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [slots, setSlots] = useState<AvailableSlotsForTable[]>([]);
  const [slotReferenceBookings, setSlotReferenceBookings] = useState<Booking[]>([]);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);

    // 表单验证状态
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const serviceError = formErrors.serviceId;
  const displayError = serviceError || error || undefined;

  // 初始化状态，如果有服务端数据则使用它
  useEffect(() => {
    // 如果是服务端渲染且有初始数据，直接设置到store中
    if (isSSR && initialData && Array.isArray(initialData) && initialData.length > 0) {
      dispatch({ type: 'booking/getBookings/fulfilled', payload: { items: initialData, total: initialData.length, page: 1, limit: initialData.length, totalPages: 1 } });
    } else if (!isSSR) {
      // 客户端渲染时获取数据
      dispatch(getBookings({ ...filters, page: pagination.page, limit: pagination.limit }));
    }
  }, [dispatch, isSSR, pagination.page, pagination.limit, filters]);

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page));
  }, [dispatch]);

  // 处理搜索
  const handleSearch = useCallback((query: AppointmentQuery) => {
    dispatch(setFilters(query));
  }, [dispatch]);

  // 如果有服务端错误，设置到store中
  useEffect(() => {
    if (isSSR && serverError) {
      dispatch({ type: 'booking/getBookings/rejected', error: { message: serverError } });
    }
  }, [dispatch, isSSR, serverError]);

  // 获取服务列表
  useEffect(() => {
    dispatch(getServices());
  }, [dispatch]);

  const loadSlotReferenceBookings = useCallback(async (date: string) => {
    try {
      const response = await bookingService.getBookings({
        page: 1,
        limit: 200,
        startDate: date,
        endDate: date
      });
      setSlotReferenceBookings(response.items);
    } catch {
      setSlotReferenceBookings([]);
    }
  }, []);

  useEffect(() => {
    loadSlotReferenceBookings(selectedDate);
  }, [loadSlotReferenceBookings, selectedDate]);

  // 预约状态更新时更新slots状态
  useEffect(() => {
    if(availableSlots.length > 0){
      setSlots(availableSlots.map(slot => {
        // 检查当前用户是否有预约
        const myBooking = slotReferenceBookings.find(booking => 
          booking.timeSlotId === slot.id 
          && ['CONFIRMED', 'PENDING'].includes(booking.status)
          && selectedDate === booking.appointmentDate.slice(0, 10)
        );

        // 检查该时间段是否被占用（已被预约且不是当前用户的预约）
        // 如果API返回available为false，且不是我的预约，那就是被别人预约了
        const isOccupied = !slot.available && !myBooking;

        // 检查是否为过去的时间段
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        let isPast = false;
        // 只有当选中日期是今天时才检查具体时间
        if (selectedDate === todayString) {
          const [slotHours, slotMinutes] = slot.startTime.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(slotHours, slotMinutes, 0, 0);
          
          if (now > slotTime) {
            isPast = true;
          }
        }

        return {
          ...slot,
          // 如果API返回available为false，或者当前用户有预约，则视为已预约
          // 注意：available字段来自后端getAvailability接口，已经包含了所有用户的预约情况
          isBooked: !slot.available || !!myBooking,
          isMyBooking: !!myBooking,
          isOccupied,
          isPast
        };
      }));
    }
  }, [slotReferenceBookings, availableSlots, selectedDate]);

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
    
    if (!serviceId) {
      errors.serviceId = '请选择服务类型';
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

  const refreshBookingsAfterMutation = async () => {
    const currentPage = Math.max(1, pagination.page);
    const result = await dispatch(
      getBookings({ ...filters, page: currentPage, limit: pagination.limit })
    ).unwrap();

    if (result.totalPages === 0 && result.page !== 1) {
      dispatch(setPage(1));
      await dispatch(getBookings({ ...filters, page: 1, limit: pagination.limit }));
      return;
    }

    if (result.totalPages > 0 && result.page > result.totalPages) {
      dispatch(setPage(result.totalPages));
      await dispatch(getBookings({ ...filters, page: result.totalPages, limit: pagination.limit }));
    }
  };

  /**
   * 处理创建预约
   */
  const handleCreateBooking = async () => {
    // 先进行表单验证
    if (!validateForm()) return;
    if (!selectedSlot || !customerName || !customerPhone) return;

    // 查找选中的服务名称
    const selectedService = services.find(s => s.id === serviceId);
    const serviceName = selectedService ? selectedService.name : 'Unknown Service';

    const result = await dispatch(createBooking({
      timeSlotId: selectedSlot.id,
      userId: currentUser?.id || '',
      appointmentDate: selectedDate,
      notes: notes || undefined,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerWechat: customerWechat || undefined,
      serviceId,
      serviceName,
    }));

    if (createBooking.fulfilled.match(result)) {
      // 创建成功，重置表单
      setNotes('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerWechat('');
      setServiceId('');
      setShowBookingForm(false);
      dispatch(setSelectedSlot(null));
      setFormErrors({});
      setIsFormValid(false);
      // 重新获取预约列表和可用时间段
      await refreshBookingsAfterMutation();
      dispatch(getAvailableSlots(selectedDate));
      loadSlotReferenceBookings(selectedDate);
      setShowCreateSuccessModal(true);
      return;
    }

    if (result.error.message === "时间段已满") {
      showError(result.error.message || '请选择其他时间段');
      setSlots((previousSlots) => previousSlots.map(slot => {
        if (slot.id === selectedSlot.id) {
          return {
            ...slot,
            isBooked: true,
            isMyBooking: false,
            isOccupied: true
          };
        } else {
          return slot;
        }
      }));
      dispatch(setSelectedSlot(null));
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
      await refreshBookingsAfterMutation();
      dispatch(getAvailableSlots(selectedDate));
      loadSlotReferenceBookings(selectedDate);
      setShowCancelSuccessModal(true);
      return;
    }

    showError('预约取消失败', result.error.message || '请稍后重试');
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
      await refreshBookingsAfterMutation();
      dispatch(getAvailableSlots(selectedDate));
      loadSlotReferenceBookings(selectedDate);
      showSuccess('预约更新成功');
      return;
    }
    showError('预约更新失败', result.error.message || '请稍后重试');
    throw new Error(result.error.message || '预约更新失败');
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
  const handleServiceIdChange = (serviceId: string) => {
    setServiceId(serviceId);
    setFormErrors((prev) => {
      if (!prev.serviceId) return prev;
      const { serviceId: _removed, ...rest } = prev;
      return rest;
    });
  }

  /**
   * 处理取消创建预约
   */
  const handleCancelCreating = () => {
    setShowBookingForm(false);
    setServiceId('');
    dispatch(resetBookingState());
  }
  
  return (<BookingPageOrganism 
      loading={slotsLoading} // 左側パネル用には slotsLoading を渡す
      bookingsLoading={bookingsLoading} // 右側パネル用には bookingsLoading を渡す（Organism側で対応必要）
      error={displayError}
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
      serviceId={serviceId || ''}
      serviceError={serviceError}
      services={services || []}
      notes={notes || ''}
      onDateChange={handleDateChange}
      onSlotSelect={handleSlotSelect}
      onNotesChange={handleNotesChange}
      onCustomerNameChange={handleCustomerNameChange}
      onCustomerPhoneChange={handlePhoneChange}
      onCustomerEmailChange={handleCustomerEmailChange}
      onCustomerWechatChange={handleCustomerWechatChange}
      onServiceIdChange={handleServiceIdChange}
      onCancelCreating={handleCancelCreating}
      onCreateBooking={handleCreateBooking}
      onCancelBooking={handleCancelBooking}
      onUpdateBooking={handleUpdateBooking}
      resetBookingState={handleResetBookingState}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      showCreateSuccessModal={showCreateSuccessModal}
      setShowCreateSuccessModal={setShowCreateSuccessModal}
      showCancelSuccessModal={showCancelSuccessModal}
      setShowCancelSuccessModal={setShowCancelSuccessModal}
  />);
};

export default BookingPage;
