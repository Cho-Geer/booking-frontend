import React from 'react';
import Card from '@/components/atoms/Card';
import TimeSlotGrid from '@/components/molecules/TimeSlotGrid';
import { useTheme } from '@/hooks/useTheme';
import { TimeSlot } from '@/types';
import { formatDateShort } from '@/utils/dateUtils';

interface TimeSlotForTable extends TimeSlot {
  isBooked: boolean;
  isMyBooking?: boolean;
  isOccupied?: boolean;
  isPast?: boolean;
}

interface TimeSlotSectionProps {
  selectedDate: string;
  slots: TimeSlotForTable[];
  selectedSlot: TimeSlot | null;
  loading: boolean;
  onSlotClick: (slot: TimeSlotForTable) => void;
}

/**
 * 分子组件：时间段选择区域
 * 包含时间段标题和时间段网格
 * 
 * @component
 */
const TimeSlotSection: React.FC<TimeSlotSectionProps> = ({
  selectedDate,
  slots,
  selectedSlot,
  loading,
  onSlotClick
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  return (
    <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
      <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4 ${isMobile ? 'text-base' : ''}`}>
        {formatDateShort(selectedDate)} 可用时间段
      </h2>
      <TimeSlotGrid
        slots={slots}
        selectedSlot={selectedSlot}
        loading={loading}
        onSlotClick={(slot) => onSlotClick(slot as TimeSlotForTable)}
      />
    </Card>
  );
};

export default TimeSlotSection;
