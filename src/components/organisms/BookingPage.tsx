import React from 'react';
import BookingDetailModal from '@/components/molecules/BookingDetailModal';
import BookingUpdateModal, { BookingUpdatePayload } from '@/components/molecules/BookingUpdateModal';
import BookingCreateModal from '@/components/molecules/BookingCreateModal';
import AlternativeSlotsModal from '@/components/molecules/AlternativeSlotsModal';
import BookingLeftPanel from '@/components/organisms/BookingLeftPanel';
import BookingRightPanel from '@/components/organisms/BookingRightPanel';
import { useTheme } from '@/hooks/useTheme';
import { useBookingModals } from '@/hooks/useBookingModals';
import { useBookingUI } from '@/contexts/BookingContext';
import { useUI } from '@/contexts/UIContext';
import { Booking, TimeSlot, Service, AppointmentQuery } from '@/types';

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
  bookingCreated,
  emailSent,
  onConfirmBooking
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();
  const startDateInputRef = React.useRef<HTMLInputElement | null>(null);
  const endDateInputRef = React.useRef<HTMLInputElement | null>(null);
  
  // 使用BookingContext管理UI状态
  const { 
    uiState: { searchTerm, statusFilter, dateRange },
    setSearchTerm,
    setStatusFilter,
    setDateRange,
    isEndDateInvalid
  } = useBookingUI();

  const {
    showDetailModal,
    detailBooking,
    handleOpenDetail,
    handleCloseDetailModal,
    showUpdateModal,
    updateBookingTarget,
    updatingBooking,
    handleOpenUpdate,
    handleCloseUpdateModal,
    setUpdatingBooking,
    showAlternativeModal,
    alternativeSlots,
    conflictSlot,
    handleOpenAlternativeModal,
    handleCloseAlternativeModal,
    handleAlternativeSelect
  } = useBookingModals(availableSlots, onSlotSelect);

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
  }, [searchTerm, statusFilter, dateRange, isEndDateInvalid, onSearch]);

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

  // Handle slot click with alternative slots logic
  const handleSlotClick = (slot: TimeSlotForTable) => {
    if (slot.isOccupied) {
      const alternatives = availableSlots
        .filter(s => !s.isBooked && s.id !== slot.id && !s.isPast)
        .slice(0, 3);
      handleOpenAlternativeModal(slot, alternatives);
    } else {
      onSlotSelect(slot);
    }
  };

  // 使用UIContext的openModal统一管理弹窗
  const { openModal } = useUI();

  const handleConfirmUpdate = async (payload: BookingUpdatePayload) => {
    setUpdatingBooking(true);
    try {
      await onUpdateBooking(payload);
      handleCloseUpdateModal();
      handleCloseDetailModal();
      openModal({
        title: '更新成功',
        content: '预约更新成功，已为您保存最新预约信息。已发送邮件请确认。',
        width: 400
      });
    } catch (error) {
      console.error('更新预约失败:', error);
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
          <div id="booking-left-panel">
            <BookingLeftPanel
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              resetBookingState={resetBookingState}
              services={services}
              serviceId={serviceId}
              onServiceIdChange={onServiceIdChange}
              serviceError={serviceError}
              availableSlots={availableSlots}
              selectedSlot={selectedSlot}
              loading={loading}
              onSlotClick={handleSlotClick}
            />
          </div>
          {/* 右侧：我的预约 */}
          <div id="booking-right-panel">
            <BookingRightPanel
              bookings={bookings}
              bookingsLoading={bookingsLoading}
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
              pagination={pagination}
              onPageChange={onPageChange}
              onOpenDetail={handleOpenDetail}
              onOpenUpdate={handleOpenUpdate}
              onCancelBooking={onCancelBooking}
            />
          </div>
        </div>
        {/* 替代方案模态框 */}
        <AlternativeSlotsModal
          open={showAlternativeModal}
          conflictSlot={conflictSlot}
          alternativeSlots={alternativeSlots}
          onClose={handleCloseAlternativeModal}
          onAlternativeSelect={handleAlternativeSelect}
        />
        <BookingDetailModal
          open={showDetailModal}
          booking={detailBooking}
          onClose={handleCloseDetailModal}
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
          onClose={handleCloseUpdateModal}
          onConfirm={handleConfirmUpdate}
          submitting={updatingBooking}
          updatingBooking={updatingBooking}
        />
      </div>
    </div>
  );
};

export default BookingPage;
