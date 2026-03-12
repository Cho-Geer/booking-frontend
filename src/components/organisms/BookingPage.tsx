import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import BookingForm from '@/components/molecules/BookingForm';
import Button from '@/components/atoms/Button';
import Dropdown from '@/components/atoms/Dropdown';
import { useUI } from '@/contexts/UIContext';
import { Booking, TimeSlot, Service } from '@/types';

interface TimeSlotForTable extends TimeSlot {
  isBooked: boolean;
  isMyBooking?: boolean;
  isOccupied?: boolean;
  isPast?: boolean;
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
  serviceId: string;
  serviceError?: string;
  services: Service[];
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
  onServiceIdChange: (serviceId: string) => void;
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
  serviceId,
  serviceError,
  services,
  notes,
  onDateChange,
  onSlotSelect,
  onCancelBooking,
  onNotesChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCustomerWechatChange,
  onServiceIdChange,
  onCreateBooking,
  onCancelCreating,
  resetBookingState
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.isMobile;
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);

  /**
   * 处理日期选择
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onDateChange(newDate);
    resetBookingState();
  };

  const handleDateInputClick = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
  };

  /**
   * 处理时间段选择
   */
  const handleSlotSelect = (slot: TimeSlot) => {
    onSlotSelect(slot);
  };
  
  const [showAlternativeModal, setShowAlternativeModal] = React.useState(false);
  const [alternativeSlots, setAlternativeSlots] = React.useState<TimeSlot[]>([]);
  const [conflictSlot, setConflictSlot] = React.useState<TimeSlot | null>(null);

  // 监听时间段选择，如果是已占用（他人预约）的时间段，显示替代方案
  const handleSlotClick = (slot: TimeSlotForTable) => {
    if (slot.isOccupied) {
      // 查找当前日期的可用时间段作为替代方案
      // 实际项目中可能需要调用专门的API获取"推荐"的替代方案（如临近时间点）
      const alternatives = availableSlots
        .filter(s => !s.isBooked && s.id !== slot.id && !s.isPast)
        .slice(0, 3); // 取前3个可用时间段
      
      setConflictSlot(slot);
      setAlternativeSlots(alternatives);
      setShowAlternativeModal(true);
    } else {
      onSlotSelect(slot);
    }
  };

  const handleAlternativeSelect = (slot: TimeSlot) => {
    setShowAlternativeModal(false);
    onSlotSelect(slot);
  };

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string) => {
    const normalized = dateString.includes('T') ? dateString.slice(0, 10) : dateString;
    const [year, month, day] = normalized.split('-').map(Number);
    const parsedDate = Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)
      ? new Date(dateString)
      : new Date(year, month - 1, day);
    return parsedDate.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateShort = (dateString: string) => dateString.replace(/-/g, '/');

  const getTodayLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    const now = new Date();
    now.setMonth(now.getMonth() + 2);
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
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
            <Card className={`relative z-40 rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4`}>选择日期</h2>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={handleDateInputClick}
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                min={getTodayLocalDate()}
                max={getMaxDate()}
                lang="zh-CN"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  uiState.theme === 'dark' 
                    ? 'border-border-dark bg-background-dark text-text-dark-primary' 
                    : 'border-gray-300'
                }`}
              />
            </Card>

            <Card className={`relative z-40 rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4`}>
                服务类型（必填）
              </h2>
              <Dropdown
                items={[
                  { label: "选择服务类型", value: "", disabled: true },
                  ...services.map(s => ({ label: s.name, value: s.id }))
                ]}
                value={serviceId}
                onChange={(value) => onServiceIdChange(value)}
                buttonText="选择服务类型"
                className="w-full"
              />
              {serviceError && (
                <p className={`mt-1 text-sm ${isDarkTheme ? 'text-error-light' : 'text-red-600'}`}>
                  {serviceError}
                </p>
              )}
            </Card>

            {/* 可用时间段 */}
            <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4`}>
                {formatDateShort(selectedDate)} 可用时间段
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
                      onClick={() => handleSlotClick(slot as TimeSlotForTable)}
                      disabled={(slot.isBooked && !slot.isOccupied) || (!slot.isBooked && slot.isPast)}
                      variant={
                        selectedSlot?.startTime === slot.startTime 
                          ? 'primary' 
                          : slot.isMyBooking 
                            ? 'warning' 
                            : slot.isBooked 
                              ? 'primary' 
                              : 'secondary'
                      }
                      fullWidth
                      className={`h-auto py-2 min-h-[64px] ${
                        !slot.isBooked && slot.isPast 
                          ? isDarkTheme 
                            ? '!bg-gray-800 !text-gray-600' 
                            : '!bg-gray-200 !text-gray-400' 
                          : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                        {/* 状態がある場合のみ表示（空きの場合はプレースホルダーなし） */}
                        {slot.isMyBooking && (
                          <span className="text-xs mt-1">(已预约)</span>
                        )}
                        {slot.isOccupied && (
                          <span className="text-xs mt-1">(已满)</span>
                        )}
                      </div>
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
                  error={error}
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
        {/* 替代方案模态框 */}
        {showAlternativeModal && conflictSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className={`w-full max-w-md rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
                该时间段 ({formatTime(conflictSlot.startTime)}) 已被预约
              </h3>
              <p className={`mb-6 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
                为您推荐以下临近的可用时间段：
              </p>
              
              <div className="space-y-3">
                {alternativeSlots.length > 0 ? (
                  alternativeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAlternativeSelect(slot)}
                      variant="secondary"
                      fullWidth
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Button>
                  ))
                ) : (
                  <p className={`text-center py-4 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>
                    暂无其他可用时间段，请尝试选择其他日期。
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowAlternativeModal(false)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
