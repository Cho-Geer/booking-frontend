import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import BookingForm from '@/components/molecules/BookingForm';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';
import { Booking, TimeSlot } from '@/types';

interface TimeSlotForTable extends TimeSlot {
  isBooked: boolean;
}

interface BookingPageProps {
  bookings: Booking[];
  availableSlots: TimeSlotForTable[];
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  showBookingForm: boolean;
  loading: boolean;
  error?: string;
  creatingBooking: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerWechat?: string;
  serviceName: string;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  onCreateBooking: () => void;
  onCancelCreating: () => void;
  onCancelBooking: (bookingId: string) => void;
  onNotesChange: (notes: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onCustomerWechatChange: (wechat: string) => void;
  onServiceNameChange: (serviceName: string) => void;
  notes: string;
  resetBookingState: () => void;
}

/**
 * 有机体组件：预约页面
 * 使用UIContext管理主题和其他UI状态
 * 
 * @component
 * @example
 * <BookingPage 
 *   bookings={[]}
 *   availableSlots={[]}
 *   selectedDate="2023-06-01"
 *   selectedSlot={null}
 *   loading={false}
 *   creatingBooking={false}
 *   onDateChange={(date) => console.log(date)}
 *   onSlotSelect={(slot) => console.log(slot)}
 *   onCreateBooking={() => console.log("create")}
 *   onCancelBooking={(id) => console.log(id)}
 *   onNotesChange={(notes) => console.log(notes)}
 *   notes=""
 *   resetBookingState={() => console.log("reset")}
 * />
 */
const BookingPage: React.FC<BookingPageProps> = ({
  bookings,
  availableSlots,
  selectedDate,
  selectedSlot,
  showBookingForm,
  loading,
  error,
  creatingBooking,
  customerName,
  customerPhone,
  customerEmail,
  customerWechat,
  serviceName,
  notes,
  onDateChange,
  onSlotSelect,
  onCancelBooking,
  onNotesChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCustomerWechatChange,
  onServiceNameChange,
  onCreateBooking,
  onCancelCreating,
  resetBookingState
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.isMobile;

  /**
   * 处理日期选择
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onDateChange(newDate);
    resetBookingState();
  };

  /**
   * 处理时间段选择
   */
  const handleSlotSelect = (slot: TimeSlot) => {
    onSlotSelect(slot);
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
          <div id="booking-page-error" className={`${isDarkTheme ? 'bg-error-dark border-error-dark' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-6`}>
            <p className={`${isDarkTheme ? 'text-white-600' : 'text-red-900'}`}>{error}</p>
          </div>
        )}

        {/* 左右分栏布局 */}
        <div id="booking-layout" className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
          {/* 左侧：日期、时间段和我的预约 */}
          <div id="booking-left-panel" className="space-y-6">

            {/* 日期选择 */}
            <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4`}>选择日期</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  uiState.theme === 'dark' 
                    ? 'border-border-dark bg-background-dark text-text-dark-primary' 
                    : 'border-gray-300'
                }`}
              />
            </Card>

            {/* 可用时间段 */}
            <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4`}>
                {formatDate(selectedDate)} 可用时间段
              </h2>
              
              {loading ? (
                <div id="booking-page-loading" className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className={`${isDarkTheme ? 'text-text-dark-disabled' : 'text-gray-500'}`}>加载中...</p>
                </div>
              ) : (
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  { availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={slot.isBooked}
                      variant={selectedSlot?.startTime === slot.startTime || slot.isBooked ? 'primary' : 'secondary'}
                      fullWidth
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
              {/* 预约表单 */}
              {showBookingForm && selectedSlot ? (
                <BookingForm
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  notes={notes}
                  customerName={customerName}
                  customerPhone={customerPhone}
                  customerEmail={customerEmail}
                  customerWechat={customerWechat}
                  serviceName={serviceName}
                  onNotesChange={onNotesChange}
                  onCustomerNameChange={onCustomerNameChange}
                  onCustomerPhoneChange={onCustomerPhoneChange}
                  onCustomerEmailChange={onCustomerEmailChange}
                  onCustomerWechatChange={onCustomerWechatChange}
                  onServiceNameChange={onServiceNameChange}
                  onSubmit={onCreateBooking}
                  onCancel={() => {onCancelCreating()}}
                  creatingBooking={creatingBooking}
                />
              ) : (
                <div id="booking-placeholder" className={`rounded-lg p-6 flex items-center justify-center h-64 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
                  <p className={`text-center ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
                    请先选择日期和时间段
                  </p>
                </div>
              )}
          </div>
          {/* 右侧：预约表单 */}
          {/* 我的预约 */}
          <div id="booking-right-panel" className="w-full">
            <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
                <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4`}>我的预约</h2>
                
                {bookings.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>暂无预约记录</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div id={`booking-item-${booking.id}`} key={booking.id} className={`rounded-md p-4 ${isDarkTheme ? 'bg-background-dark-200 border border-border-dark' : 'border border-gray-200'}`}>
                        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-start'}`}>
                        <div>
                        <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
                          {formatDate(booking.appointmentDate)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                        {booking.notes && (
                        <p className={`text-sm mt-1 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>备注: {booking.notes}</p>
                        )}
                        </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                            {getStatusName(booking.status)}
                          </span>
                        </div>
                        { ['CONFIRMED', 'PENDING'].includes(booking.status) && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={() => onCancelBooking(booking.id)}
                            >
                              取消预约
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;