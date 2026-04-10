import React from 'react';
import DateSelector from '@/components/molecules/DateSelector';
import ServiceSelector from '@/components/molecules/ServiceSelector';
import TimeSlotSection from '@/components/molecules/TimeSlotSection';
import { TimeSlot, Service } from '@/types';

interface TimeSlotForTable extends TimeSlot {
  isBooked: boolean;
  isMyBooking?: boolean;
  isOccupied?: boolean;
  isPast?: boolean;
}

interface BookingLeftPanelProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  resetBookingState: () => void;
  services: Service[];
  serviceId: string;
  onServiceIdChange: (serviceId: string) => void;
  serviceError?: string;
  availableSlots: TimeSlotForTable[];
  selectedSlot: TimeSlot | null;
  loading: boolean;
  onSlotClick: (slot: TimeSlotForTable) => void;
}

/**
 * 有机体组件：预约页面左侧面板
 * 包含日期选择、服务选择和时间段选择
 * 
 * @component
 */
const BookingLeftPanel: React.FC<BookingLeftPanelProps> = ({
  selectedDate,
  onDateChange,
  resetBookingState,
  services,
  serviceId,
  onServiceIdChange,
  serviceError,
  availableSlots,
  selectedSlot,
  loading,
  onSlotClick
}) => {
  return (
    <div className="space-y-6">
      {/* 日期选择 */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        resetBookingState={resetBookingState}
      />

      {/* 服务选择 */}
      <ServiceSelector
        services={services}
        serviceId={serviceId}
        onServiceIdChange={onServiceIdChange}
        serviceError={serviceError}
      />

      {/* 可用时间段 */}
      <TimeSlotSection
        selectedDate={selectedDate}
        slots={availableSlots}
        selectedSlot={selectedSlot}
        loading={loading}
        onSlotClick={onSlotClick}
      />
    </div>
  );
};

export default BookingLeftPanel;
