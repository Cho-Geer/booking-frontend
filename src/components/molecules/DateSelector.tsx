import React, { memo } from 'react';
import Card from '@/components/atoms/Card';
import { useTheme } from '@/hooks/useTheme';
import { getTodayLocalDate, getMaxDate } from '@/utils/dateUtils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  resetBookingState: () => void;
}

/**
 * 分子组件：日期选择器
 * 日期输入框及验证逻辑
 * 
 * @component
 */
const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  resetBookingState
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();
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

  return (
    <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
      <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4 ${isMobile ? 'text-base' : ''}`}>选择日期</h2>
      <input
        data-testid="booking-date-input"
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
  );
};

export default memo(DateSelector);
