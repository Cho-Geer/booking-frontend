import React, { memo } from 'react';
import Button from '@/components/atoms/Button';
import { useTheme } from '@/hooks/useTheme';
import { formatTime } from '@/utils/dateUtils';
import { TimeSlot } from '@/types';

interface TimeSlotForTable extends TimeSlot {
  isBooked: boolean;
  isMyBooking?: boolean;
  isOccupied?: boolean;
  isPast?: boolean;
}

interface TimeSlotGridProps {
  slots: TimeSlotForTable[];
  selectedSlot: TimeSlot | null;
  loading: boolean;
  onSlotClick: (slot: TimeSlotForTable) => void;
}

/**
 * 分子组件：时间段网格
 * 时间段按钮网格渲染
 * 
 * @component
 */
const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedSlot,
  loading,
  onSlotClick
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  if (loading) {
    return (
      <div id="booking-page-loading" className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className={`${isDarkTheme ? 'text-text-dark-disabled' : 'text-gray-500'}`}>加载中...</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {slots.map((slot, index) => (
        <Button
          key={index}
          onClick={() => onSlotClick(slot)}
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
  );
};

export default memo(TimeSlotGrid);
