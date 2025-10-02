import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getBookings, 
  getAvailableSlots, 
  createBooking,
  setSelectedDate,
  setSelectedSlot
} from '../store/bookingSlice';
import { AppDispatch, RootState } from '../store';
import Button from '../components/atoms/Button';
import { TimeSlot } from '../types';
import { useUI } from '../contexts/UIContext';

/**
 * 预约页面组件
 */
const BookingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.isMobile;
  
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
  
  // 表单验证状态
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 手机号码建议列表
  const [phoneSuggestions, setPhoneSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 模拟手机号码建议数据
  const mockPhoneNumbers = [
    '18100000000',
    '13200000000',
    '18600000000',
    '13300000000',
    '18800000008'
  ];

  // 组件加载时获取预约列表
  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  // 日期改变时获取可用时间段
  useEffect(() => {
    dispatch(getAvailableSlots(selectedDate));
  }, [dispatch, selectedDate]);

  /**
   * 处理日期选择
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    dispatch(setSelectedDate(newDate));
    setShowBookingForm(false);
    dispatch(setSelectedSlot(null));
  };
  
  /**
   * 处理手机号码输入变化
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerPhone(value);
    
    // 当输入手机号时，显示建议列表
    if (value.length >= 3) {
      const filteredSuggestions = mockPhoneNumbers.filter(phone => 
        phone.startsWith(value)
      );
      setPhoneSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else if (value.length < 3) {
      setShowSuggestions(false);
    }
  };
  
  /**
   * 选择手机号码建议
   */
  const handleSelectPhoneSuggestion = (phone: string) => {
    setCustomerPhone(phone);
    setShowSuggestions(false);
  };
  
  // 点击外部关闭建议列表
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 先进行表单验证
    if (!validateForm()) {
      return;
    }
    
    if (!selectedSlot || !customerName || !customerPhone) return;

    const result = await dispatch(createBooking({
      serviceId: 'default-service', // 默认服务ID，实际应用中应该让用户选择
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: notes || undefined,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerWechat: customerWechat || undefined,
    }));

    if (createBooking.fulfilled.match(result)) {
      // 创建成功，重置表单
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
    }
  };

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  /**
   * 格式化时间显示
   */
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  /**
   * 获取状态显示样式
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return isDarkTheme ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'PENDING':
        return isDarkTheme ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return isDarkTheme ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return isDarkTheme ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
      default:
        return isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 获取状态中文名称
   */
  const getStatusName = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '已确认';
      case 'PENDING':
        return '待确认';
      case 'CANCELLED':
        return '已取消';
      case 'COMPLETED':
        return '已完成';
      default:
        return status;
    }
  };

  return (
    <div id="booking-page-container" className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDarkTheme ? 'bg-background-dark' : 'bg-gray-50'}`}>
      <div id="booking-content-container" className="max-w-7xl mx-auto">
          <h1 className={`text-4xl font-bold text-center mb-12 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} ${isMobile ? 'text-3xl' : ''}`}>预约服务</h1>
          
          {error && (
            <div id="error-message" className={`rounded-md p-4 mb-6 ${isDarkTheme ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 左右分栏布局 */}
        <div id="booking-layout" className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
          {/* 左侧：日期、时间段和我的预约 */}
          <div id="booking-left-panel" className="space-y-6">
            {/* 日期选择 */}
              <div id="date-selection-container" className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>选择咨询日期</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isDarkTheme ? 'bg-background-dark-200 text-text-dark-primary border border-border-dark' : 'border border-gray-300'}`}
              />
            </div>

            {/* 可用时间段 */}
              <div id="time-slots-container" className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
                {formatDate(selectedDate)} 可用时间段
              </h2>
              
              {loading ? (
                <div id="loading-indicator" className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className={`mt-2 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>加载中...</p>
                </div>
              ) : (
                <div id="time-slots-grid" className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                      variant={selectedSlot?.startTime === slot.startTime ? 'primary' : 'secondary'}
                      className={slot.available ? '' : 'opacity-50 cursor-not-allowed'}
                      size={isMobile ? 'md' : 'lg'}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* 我的预约 */}
              <div id="my-bookings-container" className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>我的预约</h2>
              
              {bookings.length === 0 ? (
                <p className={`text-center py-8 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>暂无预约记录</p>
              ) : (
                <div id="bookings-list" className="space-y-4">
                  {bookings.map((booking) => (
                    <div id={`booking-item-${booking.id}`} key={booking.id} className={`rounded-md p-4 ${isDarkTheme ? 'bg-background-dark-200 border border-border-dark' : 'border border-gray-200'}`}>
                      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-start'}`}>
                        <div>
                          <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
                            {formatDate(booking.date)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </p>
                          {booking.notes && (
                            <p className={`text-sm mt-1 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>备注: {booking.notes}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                          {getStatusName(booking.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预约表单 */}
            <div id="booking-right-panel" className="w-full">
            {showBookingForm && selectedSlot ? (
              <div id="booking-form-container" className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>填写个人信息</h2>
                <div id="booking-time-info" className="mb-4">
                    <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
                      预约时间: {formatDate(selectedDate)} {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </p>
                  </div>
                  <form onSubmit={handleCreateBooking}>
                    <div id="form-fields-container" className="space-y-5">
                    <div id="name-field-container">
                      <label htmlFor="customerName" className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-700'}`}>
                        姓名 *
                      </label>
                      <input
                        id="customerName"
                        type="text"
                        required
                        className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                          formErrors.name 
                            ? (isDarkTheme ? 'bg-red-900/20 border border-red-500 text-red-300 focus:ring-red-500' : 'bg-red-50 border border-red-500 text-red-700 focus:ring-red-500')
                            : (isDarkTheme ? 'bg-background-dark-200 text-text-dark-primary border border-border-dark focus:ring-primary' : 'border border-gray-300 focus:ring-primary')
                        }`}
                        placeholder="请输入您的姓名"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          // 实时验证
                          if (formErrors.name) {
                            validateForm();
                          }
                        }}
                      />
                      {formErrors.name && (
                        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`}>{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div id="phone-field-container" className="relative">
                      <label htmlFor="customerPhone" className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-700'}`}>
                        手机号码 *
                      </label>
                      <input
                        id="customerPhone"
                        type="tel"
                        required
                        className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                          formErrors.phone 
                            ? (isDarkTheme ? 'bg-red-900/20 border border-red-500 text-red-300 focus:ring-red-500' : 'bg-red-50 border border-red-500 text-red-700 focus:ring-red-500')
                            : (isDarkTheme ? 'bg-background-dark-200 text-text-dark-primary border border-border-dark focus:ring-primary' : 'border border-gray-300 focus:ring-primary')
                        }`}
                        placeholder="请输入您的手机号码"
                        value={customerPhone}
                        onChange={(e) => {
                          handlePhoneChange(e);
                          // 实时验证
                          if (formErrors.phone) {
                            validateForm();
                          }
                        }}
                      />
                      
                      {/* 手机号码建议列表 */}
                      {showSuggestions && customerPhone.length >= 3 && (
                        <div id="phone-suggestions-list" className={`absolute z-10 w-full mt-1 rounded-md shadow-lg overflow-hidden ${isDarkTheme ? 'bg-background-dark-100' : 'bg-white'}`}>
                          {phoneSuggestions.map((phone, index) => (
                            <div
                              key={index}
                              className={`px-4 py-2 text-sm cursor-pointer hover:bg-opacity-20 hover:bg-primary ${isDarkTheme ? 'text-text-dark-primary hover:bg-background-dark' : 'text-gray-700 hover:bg-gray-100'}`}
                              onClick={() => handleSelectPhoneSuggestion(phone)}
                            >
                              {phone}
                            </div>
                          ))}
                        </div>
                      )}
                      {formErrors.phone && (
                        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`}>{formErrors.phone}</p>
                      )}
                    </div>
                    
                    <div id="email-field-container">
                      <label htmlFor="customerEmail" className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-700'}`}>
                        电子邮箱（可选）
                      </label>
                      <input
                        id="customerEmail"
                        type="email"
                        className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                          formErrors.email 
                            ? (isDarkTheme ? 'bg-red-900/20 border border-red-500 text-red-300 focus:ring-red-500' : 'bg-red-50 border border-red-500 text-red-700 focus:ring-red-500')
                            : (isDarkTheme ? 'bg-background-dark-200 text-text-dark-primary border border-border-dark focus:ring-primary' : 'border border-gray-300 focus:ring-primary')
                        }`}
                        placeholder="请输入电子邮箱"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          // 实时验证
                          if (formErrors.email) {
                            validateForm();
                          }
                        }}
                      />
                      {formErrors.email && (
                        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`}>{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div id="wechat-field-container">
                      <label htmlFor="customerWechat" className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-700'}`}>
                        微信号（可选）
                      </label>
                      <input
                        id="customerWechat"
                        type="text"
                        className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isDarkTheme ? 'bg-background-dark-200 text-text-dark-primary border border-border-dark' : 'border border-gray-300'}`}
                        placeholder="请输入微信号"
                        value={customerWechat}
                        onChange={(e) => setCustomerWechat(e.target.value)}
                      />
                    </div>
                    
                    <div id="notes-field-container">
                      <label htmlFor="notes" className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-700'}`}>
                        备注信息（可选）
                      </label>
                      <textarea
                        id="notes"
                        rows={4}
                        className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isDarkTheme ? 'bg-background-dark-200 text-text-dark-primary border border-border-dark' : 'border border-gray-300'}`}
                        placeholder="请输入特殊需求或备注信息"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* 提交按钮 */}
                  <div id="submit-button-container" className="mt-8">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      isLoading={creatingBooking}
                      disabled={creatingBooking || !isFormValid || !selectedSlot}
                      fullWidth
                      className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingBooking ? '提交中...' : '提交预约'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div id="booking-placeholder" className={`rounded-lg p-6 flex items-center justify-center h-64 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
                <p className={`text-center ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
                  请先选择日期和时间段
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;