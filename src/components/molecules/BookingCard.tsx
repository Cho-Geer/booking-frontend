import React, { memo } from 'react';
import Button from '@/components/atoms/Button';
import { useTheme } from '@/hooks/useTheme';
import { Booking, BookingStatus } from '@/types';
import { stripHtml } from '@/utils/htmlUtils';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface BookingCardProps {
  booking: Booking;
  onOpenDetail: (booking: Booking) => void;
  onOpenUpdate: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

const getStatusStyle = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case BookingStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const getStatusName = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return '待确认';
    case BookingStatus.CONFIRMED:
      return '已确认';
    case BookingStatus.CANCELLED:
      return '已取消';
    case BookingStatus.COMPLETED:
      return '已完成';
    default:
      return status;
  }
};

const canShowUpdate = (status: BookingStatus) => {
  return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(status);
};

/**
 * 分子组件：预约卡片
 * 单个预约项的展示
 * 
 * @component
 */
const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onOpenDetail,
  onOpenUpdate,
  onCancelBooking
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  return (
    <div id={`booking-item-${booking.id}`} className={`rounded-md p-4 ${isDarkTheme ? 'bg-background-dark-200 border border-border-dark' : 'border border-gray-200'}`}>
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-start gap-4'}`}>
        <div className="min-w-0 flex-1">
          <p
            title={`${formatDate(booking.appointmentDate)} ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
            className={`font-medium truncate whitespace-nowrap ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}
          >
            {formatDate(booking.appointmentDate)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </p>
          {booking.notes && (
            <p
              title={`备注: ${stripHtml(booking.notes)}`}
              className={`text-sm mt-1 truncate ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}
            >
              备注: {stripHtml(booking.notes)}
            </p>
          )}
        </div>
        <div className={`${isMobile ? 'w-full' : 'shrink-0 min-w-[180px]'} flex flex-col items-end gap-3`}>
          <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
            {getStatusName(booking.status)}
          </span>
          <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-start w-full' : 'justify-end'}`}>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => onOpenDetail(booking)}
            >
              详细
            </Button>
            {canShowUpdate(booking.status) && (
              <Button
                size="xs"
                variant="warning"
                onClick={() => onOpenUpdate(booking)}
              >
                更新
              </Button>
            )}
            {['CONFIRMED', 'PENDING'].includes(booking.status) && (
              <Button
                size="xs"
                onClick={() => onCancelBooking(booking.id)}
              >
                取消预约
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BookingCard);
