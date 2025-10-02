import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import BookingForm from '@/components/molecules/BookingForm';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingPageProps {
  bookings: Booking[];
  availableSlots: TimeSlot[];
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  loading: boolean;
  error?: string;
  creatingBooking: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerWechat?: string;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  onCreateBooking: () => void;
  onCancelBooking: (bookingId: string) => void;
  onNotesChange: (notes: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onCustomerWechatChange: (wechat: string) => void;
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
  loading,
  error,
  creatingBooking,
  customerName,
  customerPhone,
  customerEmail,
  customerWechat,
  onDateChange,
  onSlotSelect,
  onCreateBooking,
  onCancelBooking,
  onNotesChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCustomerWechatChange,
  notes,
  resetBookingState
}) => {
  const { uiState } = useUI();
  const [showBookingForm, setShowBookingForm] = useState(false);

  /**
   * 处理日期选择
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onDateChange(newDate);
    setShowBookingForm(false);
    resetBookingState();
  };

  /**
   * 处理时间段选择
   */
  const handleSlotSelect = (slot: TimeSlot) => {
    onSlotSelect(slot);
    setShowBookingForm(true);
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
        return uiState.theme === 'dark' 
          ? 'bg-success-dark text-success-light' 
          : 'bg-green-100 text-green-800';
      case 'PENDING':
        return uiState.theme === 'dark' 
          ? 'bg-warning-dark text-warning-light' 
          : 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return uiState.theme === 'dark' 
          ? 'bg-error-dark text-error-light' 
          : 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return uiState.theme === 'dark' 
          ? 'bg-info-dark text-info-light' 
          : 'bg-blue-100 text-blue-800';
      default:
        return uiState.theme === 'dark' 
          ? 'bg-background-dark-200 text-text-dark-secondary' 
          : 'bg-gray-100 text-gray-800';
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

  // 根据主题设置背景色类名
  const bgColorClass = uiState.theme === 'dark' ? 'bg-background-dark' : 'bg-gray-50';
  const textColorClass = uiState.theme === 'dark' ? 'text-text-dark-primary' : 'text-gray-900';
  const borderColorClass = uiState.theme === 'dark' ? 'border-border-dark' : 'border-gray-200';
  const cardBgClass = uiState.theme === 'dark' ? 'bg-background-dark-200' : 'bg-white';

  return (
    <div id="booking-page-container" className={`min-h-screen ${bgColorClass} py-8`}>
      <div id="booking-page-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${textColorClass} mb-8`}>预约服务</h1>
        
        {error && (
          <div id="booking-page-error" className={`${uiState.theme === 'dark' ? 'bg-error-dark border-error-dark' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-6`}>
            <p className={uiState.theme === 'dark' ? 'text-error-light' : 'text-red-800'}>{error}</p>
          </div>
        )}

        {/* 日期选择 */}
        <Card className={`p-6 mb-6 ${cardBgClass}`}>
          <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>选择日期</h2>
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
        <Card className={`p-6 mb-6 ${cardBgClass}`}>
          <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>
            {formatDate(selectedDate)} 可用时间段
          </h2>
          
          {loading ? (
            <div id="booking-page-loading" className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className={uiState.theme === 'dark' ? 'text-text-dark-disabled' : 'text-gray-500'}>加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableSlots.map((slot, index) => (
                <Button
                  key={index}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  variant={selectedSlot?.startTime === slot.startTime ? 'primary' : slot.available ? 'secondary' : 'ghost'}
                  fullWidth
                >
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Button>
              ))}
            </div>
          )}
        </Card>

        {/* 预约表单 */}
        {showBookingForm && selectedSlot && (
          <BookingForm
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            notes={notes}
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            customerWechat={customerWechat}
            onNotesChange={onNotesChange}
            onCustomerNameChange={onCustomerNameChange}
            onCustomerPhoneChange={onCustomerPhoneChange}
            onCustomerEmailChange={onCustomerEmailChange}
            onCustomerWechatChange={onCustomerWechatChange}
            onSubmit={onCreateBooking}
            onCancel={() => {
              setShowBookingForm(false);
              resetBookingState();
            }}
            creatingBooking={creatingBooking}
          />
        )}

        {/* 我的预约 */}
        <Card className={`p-6 ${cardBgClass}`}>
          <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>我的预约</h2>
          
          {bookings.length === 0 ? (
            <p className={uiState.theme === 'dark' ? 'dark:text-gray-400' : 'text-gray-500'}>暂无预约记录</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div id={`booking-item-${booking.id}`} key={booking.id} className={`${borderColorClass} rounded-md p-4 ${uiState.theme === 'dark' ? 'dark:border' : 'border'}`}>
                  <div className="flex justify-between items-start">
                  <div>
                  <p className={`font-medium ${uiState.theme === 'dark' ? 'text-text-dark-primary' : 'text-gray-900'}`}>
                  {formatDate(booking.date)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                  {booking.notes && (
                  <p className={`text-sm mt-1 ${uiState.theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-600'}`}>备注: {booking.notes}</p>
                  )}
                  </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                      {getStatusName(booking.status)}
                    </span>
                  </div>
                  {booking.status === 'CONFIRMED' && (
                    <div className="mt-3">
                      <Button
                        variant="danger"
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
  );
};

export default BookingPage;