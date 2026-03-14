import React, { useState } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import Dropdown from '@/components/atoms/Dropdown';
import BookingDetailModal from '@/components/molecules/BookingDetailModal';
import BookingUpdateModal, { BookingUpdatePayload } from '@/components/molecules/BookingUpdateModal';
import BookingCreateModal from '@/components/molecules/BookingCreateModal';
import SuccessModal from '@/components/molecules/SuccessModal';
import BookingFilters from '@/components/molecules/BookingFilters';
import BookingCard from '@/components/molecules/BookingCard';
import Input from '@/components/atoms/Input';
import Pagination from '@/components/molecules/Pagination';
import { useUI } from '@/contexts/UIContext';
import { useTheme } from '@/hooks/useTheme';
import { Booking, TimeSlot, Service, AppointmentQuery, BookingStatus } from '@/types';
import { stripHtml } from '@/utils/htmlUtils';
import { formatDate, formatDateShort, formatTime, getTodayLocalDate, getMaxDate } from '@/utils/dateUtils';

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
  bookingsLoading?: boolean;
  error?: string;
  creatingBooking: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerWechat?: string;
  serviceId: string;
  serviceError?: string;
  services: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  onCreateBooking: () => void;
  onCancelCreating: () => void;
  onCancelBooking: (bookingId: string) => void;
  onUpdateBooking: (payload: BookingUpdatePayload) => Promise<void>;
  onNotesChange: (notes: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onCustomerWechatChange: (wechat: string) => void;
  onServiceIdChange: (serviceId: string) => void;
  onPageChange: (page: number) => void;
  onSearch: (query: AppointmentQuery) => void;
  notes: string;
  resetBookingState: () => void;
  showCreateSuccessModal: boolean;
  setShowCreateSuccessModal: (value: boolean) => void;
  showCancelSuccessModal: boolean;
  setShowCancelSuccessModal: (value: boolean) => void;
  bookingCreated: boolean;
  setBookingCreated: (value: boolean) => void;
  emailSent: boolean;
  setEmailSent: (value: boolean) => void;
  onConfirmBooking: () => void;
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
  bookingsLoading,
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
  onUpdateBooking,
  onNotesChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCustomerWechatChange,
  onServiceIdChange,
  onCreateBooking,
  onCancelCreating,
  resetBookingState,
  pagination,
  onPageChange,
  onSearch,
  showCreateSuccessModal,
  setShowCreateSuccessModal,
  showCancelSuccessModal,
  setShowCancelSuccessModal,
  bookingCreated,
  setBookingCreated,
  emailSent,
  setEmailSent,
  onConfirmBooking
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const startDateInputRef = React.useRef<HTMLInputElement | null>(null);
  const endDateInputRef = React.useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | ''>('');
  const [dateRange, setDateRange] = React.useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const isEndDateInvalid =
    !!dateRange.startDate &&
    !!dateRange.endDate &&
    dateRange.endDate < dateRange.startDate;

  const handleConfirmBooking = () => {
    onConfirmBooking();
  };

  // 搜索防抖
  React.useEffect(() => {
    if (isEndDateInvalid) return;
    const timer = setTimeout(() => {
      onSearch({ 
        keyword: searchTerm,
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, dateRange, isEndDateInvalid]);

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

  const handleStartDateInputClick = () => {
    const input = startDateInputRef.current;
    if (!input) return;
    if (input.disabled || input.readOnly) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
      }
    }
    input.focus();
  };

  const handleEndDateInputClick = () => {
    const input = endDateInputRef.current;
    if (!input) return;
    if (input.disabled || input.readOnly) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
      }
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
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [detailBooking, setDetailBooking] = React.useState<Booking | null>(null);
  const [updateBookingTarget, setUpdateBookingTarget] = React.useState<Booking | null>(null);
  const [updatingBooking, setUpdatingBooking] = React.useState(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = React.useState(false);

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

  const handleOpenDetail = (booking: Booking) => {
    setDetailBooking(booking);
    setShowDetailModal(true);
  };

  const handleOpenUpdate = (booking: Booking) => {
    setUpdateBookingTarget(booking);
    setShowUpdateModal(true);
    setShowDetailModal(false);
  };

  const handleConfirmUpdate = async (payload: BookingUpdatePayload) => {
    setUpdatingBooking(true);
    try {
      await onUpdateBooking(payload);
      setShowUpdateModal(false);
      setUpdateBookingTarget(null);
      setDetailBooking(null);
      setShowUpdateSuccessModal(true);
    } finally {
      setUpdatingBooking(false);
    }
  };

  return (
    <div id="booking-page-container" className={`h-[scal(100vh-16px)] py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto scorllbar-hide ${isDarkTheme ? 'bg-background-dark' : 'bg-gray-50'}`}>
      <div id="booking-content-container" className="max-w-7xl mx-auto">
        <h1 className={`text-4xl font-bold text-center mb-12 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} ${isMobile ? 'text-2xl' : ''}`}>预约服务</h1>
        
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
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4 ${isMobile ? 'text-base' : ''}`}>选择日期</h2>
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
                  isDarkTheme 
                    ? 'border-border-dark bg-background-dark text-text-dark-primary' 
                    : 'border-gray-300'
                }`}
              />
            </Card>

            <Card className={`relative z-40 rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4 ${isMobile ? 'text-base' : ''}`}>
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
              <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4 ${isMobile ? 'text-base' : ''}`}>
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
          </div>
          {/* 右侧：我的预约 */}
          <div id="booking-right-panel" className={`w-full lg:block`}>
            <Card className={`rounded-lg p-6 h-full overflow-hidden flex flex-col ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
                <div className={`mb-4 ${isMobile ? 'space-y-3' : 'flex justify-between items-center gap-3'}`}>
                  <h2 className={`text-lg font-medium whitespace-nowrap ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} ${isMobile ? 'text-base' : ''}`}>我的预约</h2>
                  <div className={`${isMobile ? 'w-full' : 'w-1/3 min-w-[112px]'} text-sm`}>
                    <Dropdown
                      items={[
                        { label: '全部状态', value: '' },
                        { label: '待确认', value: BookingStatus.PENDING },
                        { label: '已确认', value: BookingStatus.CONFIRMED },
                        { label: '已取消', value: BookingStatus.CANCELLED },
                        { label: '已完成', value: BookingStatus.COMPLETED },
                      ]}
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value as BookingStatus | '')}
                      buttonText="状态筛选"
                      className="w-full"
                    />
                  </div>
                </div>
                <BookingFilters
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  isEndDateInvalid={isEndDateInvalid}
                  startDateInputRef={startDateInputRef}
                  endDateInputRef={endDateInputRef}
                  onStartDateInputClick={handleStartDateInputClick}
                  onEndDateInputClick={handleEndDateInputClick}
                />

                <div className={`mb-4 pb-4 border-b ${isDarkTheme ? 'border-border-dark' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
                      共找到 {pagination.total} 条预约记录
                    </p>
                    {pagination.totalPages > 1 && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                      />
                    )}
                  </div>
                </div>

                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className={`${isDarkTheme ? 'text-text-dark-disabled' : 'text-gray-500'}`}>加载中...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>暂无预约记录</p>
                ) : (
                  <div id="booked-item" className="space-y-4 flex flex-col h-[46vh] overflow-y-auto scrollbar-hide">
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onOpenDetail={handleOpenDetail}
                        onOpenUpdate={handleOpenUpdate}
                        onCancelBooking={onCancelBooking}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
        </div>
        {/* 替代方案模态框 */}
        <Modal
          open={showAlternativeModal}
          title={conflictSlot ? `该时间段 (${formatTime(conflictSlot.startTime)}) 已被预约` : ''}
          onClose={() => setShowAlternativeModal(false)}
          footer={(
            <Button
              variant="ghost"
              onClick={() => setShowAlternativeModal(false)}
            >
              关闭
            </Button>
          )}
        >
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
        </Modal>
        <BookingDetailModal
          open={showDetailModal}
          booking={detailBooking}
          onClose={() => {
            setShowDetailModal(false);
            setDetailBooking(null);
          }}
          onUpdate={handleOpenUpdate}
        />
        <BookingCreateModal
          open={showBookingForm && !!selectedSlot}
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
          onClose={onCancelCreating}
          creatingBooking={creatingBooking}
          bookingCreated={bookingCreated}
          emailSent={emailSent}
          onConfirmBooking={handleConfirmBooking}
        />
        <BookingUpdateModal
          open={showUpdateModal}
          booking={updateBookingTarget}
          services={services}
          onClose={() => {
            setShowUpdateModal(false);
            setUpdateBookingTarget(null);
          }}
          onConfirm={handleConfirmUpdate}
          submitting={updatingBooking}
          updatingBooking={updatingBooking}
        />
        <SuccessModal
          open={showUpdateSuccessModal}
          title="更新成功"
          message="预约更新成功，已为您保存最新预约信息。<br />已发送邮件请确认。"
          onClose={() => setShowUpdateSuccessModal(false)}
        />
        <SuccessModal
          open={showCreateSuccessModal}
          title="创建成功"
          message="预约创建成功，已为您保存最新预约信息。<br />已发送邮件请确认。"
          onClose={() => setShowCreateSuccessModal(false)}
        />
        <SuccessModal
          open={showCancelSuccessModal}
          title="取消成功"
          message="预约取消成功，已为您更新预约状态。"
          onClose={() => setShowCancelSuccessModal(false)}
        />
      </div>
    </div>
  );
};

export default BookingPage;
