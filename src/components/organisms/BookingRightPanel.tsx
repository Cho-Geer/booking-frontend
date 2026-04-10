import React from 'react';
import Card from '@/components/atoms/Card';
import BookingFilters from '@/components/molecules/BookingFilters';
import BookingCard from '@/components/molecules/BookingCard';
import Pagination from '@/components/molecules/Pagination';
import { useTheme } from '@/hooks/useTheme';
import { Booking, BookingStatus } from '@/types';

interface BookingRightPanelProps {
  bookings: Booking[];
  bookingsLoading?: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: BookingStatus | '';
  onStatusFilterChange: (status: BookingStatus | '') => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
  isEndDateInvalid: boolean;
  startDateInputRef: React.RefObject<HTMLInputElement | null>;
  endDateInputRef: React.RefObject<HTMLInputElement | null>;
  onStartDateInputClick: () => void;
  onEndDateInputClick: () => void;
  pagination: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
  };
  onPageChange: (page: number) => void;
  onOpenDetail: (booking: Booking) => void;
  onOpenUpdate: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

/**
 * 有机体组件：预约页面右侧面板
 * 包含预约列表、筛选和分页
 * 
 * @component
 */
const BookingRightPanel: React.FC<BookingRightPanelProps> = ({
  bookings,
  bookingsLoading,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  isEndDateInvalid,
  startDateInputRef,
  endDateInputRef,
  onStartDateInputClick,
  onEndDateInputClick,
  pagination,
  onPageChange,
  onOpenDetail,
  onOpenUpdate,
  onCancelBooking
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  return (
    <div className="w-full lg:block">
      <Card className={`rounded-lg p-6 h-full overflow-hidden flex flex-col ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
        <h2 className={`text-lg font-medium whitespace-nowrap ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} ${isMobile ? 'text-base' : ''}`}>我的预约</h2>
        
        <BookingFilters
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          isEndDateInvalid={isEndDateInvalid}
          startDateInputRef={startDateInputRef}
          endDateInputRef={endDateInputRef}
          onStartDateInputClick={onStartDateInputClick}
          onEndDateInputClick={onEndDateInputClick}
        />

        <div className={`mb-4 pb-4 border-b ${isDarkTheme ? 'border-border-dark' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
              共找到 {pagination.total} 条预约记录
            </p>
            {pagination.totalPages as number > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages as number}
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
          <div id="booked-item" data-testid="booking-list" className="space-y-4 flex flex-col h-[38rem] overflow-y-auto scrollbar-hide">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onOpenDetail={onOpenDetail}
                onOpenUpdate={onOpenUpdate}
                onCancelBooking={onCancelBooking}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingRightPanel;
