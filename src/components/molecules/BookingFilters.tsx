import React from 'react';
import Input from '@/components/atoms/Input';
import Dropdown from '@/components/atoms/Dropdown';
import { useTheme } from '@/hooks/useTheme';
import { BookingStatus } from '@/types';

interface BookingFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: BookingStatus | '';
  onStatusFilterChange: (value: BookingStatus | '') => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
  isEndDateInvalid: boolean;
  startDateInputRef?: React.RefObject<HTMLInputElement | null>;
  endDateInputRef?: React.RefObject<HTMLInputElement | null>;
  onStartDateInputClick?: () => void;
  onEndDateInputClick?: () => void;
}

/**
 * 分子组件：预约筛选栏
 * 搜索框、状态筛选、日期范围筛选
 * 
 * @component
 */
const BookingFilters: React.FC<BookingFiltersProps> = ({
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
  onEndDateInputClick
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({ ...dateRange, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({ ...dateRange, endDate: e.target.value });
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜索预约（姓名、手机号、备注...）"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="h-11 text-xs"
            fullWidth
          />
        </div>
        <div className="w-1/3 min-w-[112px] text-sm">
          <Dropdown
            items={[
              { label: '全部状态', value: '' },
              { label: '待确认', value: BookingStatus.PENDING },
              { label: '已确认', value: BookingStatus.CONFIRMED },
              { label: '已取消', value: BookingStatus.CANCELLED },
              { label: '已完成', value: BookingStatus.COMPLETED },
            ]}
            value={statusFilter}
            onChange={(value) => onStatusFilterChange(value as BookingStatus | '')}
            buttonText="状态筛选"
            className="w-full"
          />
        </div>
      </div>
      {isMobile ? (
        <div className="space-y-2">
          <div>
            <input
              ref={startDateInputRef}
              type="date"
              value={dateRange.startDate}
              onChange={handleStartDateChange}
              onClick={onStartDateInputClick}
              onFocus={onStartDateInputClick}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              className={`block w-full h-11 rounded-md border px-3 text-xs focus:outline-none focus:ring-primary focus:border-primary ${
                isDarkTheme
                  ? 'border-border-dark bg-background-dark text-text-dark-primary'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="开始日期"
            />
          </div>
          <span className={`self-center ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>-</span>
          <div>
            <input
              ref={endDateInputRef}
              type="date"
              value={dateRange.endDate}
              onChange={handleEndDateChange}
              onClick={onEndDateInputClick}
              onFocus={onEndDateInputClick}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              className={`block w-full h-11 rounded-md border px-3 text-xs focus:outline-none focus:ring-primary focus:border-primary ${
                isEndDateInvalid
                  ? 'border-red-500 text-red-500'
                  : isDarkTheme
                    ? 'border-border-dark bg-background-dark text-text-dark-primary'
                    : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="结束日期"
            />
            {isEndDateInvalid && (
              <p className="mt-1 text-xs text-red-500">结束日期不能早于开始日期</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={startDateInputRef}
              type="date"
              value={dateRange.startDate}
              onChange={handleStartDateChange}
              onClick={onStartDateInputClick}
              onFocus={onStartDateInputClick}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              className={`block w-full h-11 rounded-md border px-3 text-xs focus:outline-none focus:ring-primary focus:border-primary ${
                isDarkTheme
                  ? 'border-border-dark bg-background-dark text-text-dark-primary'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="开始日期"
            />
          </div>
          <span className={`self-center ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>-</span>
          <div className="flex-1">
            <input
              ref={endDateInputRef}
              type="date"
              value={dateRange.endDate}
              onChange={handleEndDateChange}
              onClick={onEndDateInputClick}
              onFocus={onEndDateInputClick}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              className={`block w-full h-11 rounded-md border px-3 text-xs focus:outline-none focus:ring-primary focus:border-primary ${
                isEndDateInvalid
                  ? 'border-red-500 text-red-500'
                  : isDarkTheme
                    ? 'border-border-dark bg-background-dark text-text-dark-primary'
                    : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="结束日期"
            />
            {isEndDateInvalid && (
              <p className="mt-1 text-xs text-red-500">结束日期不能早于开始日期</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFilters;
