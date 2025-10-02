import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const DAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function BookingCalendar({ selectedDate, onDateSelect }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // 获取当月第一天是星期几
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // 获取当月有多少天
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 获取上个月的天数
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const dateToCheck = new Date(year, month, day);
    today.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };
  
  const handleDateClick = (day: number) => {
    if (isPastDate(day)) return;
    const date = new Date(year, month, day);
    onDateSelect(date);
  };
  
  // 生成日历格子
  const calendarDays = [];
  
  // 上个月的尾部天数
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push(
      <motion.button
        key={`prev-${day}`}
        className="h-10 w-10 text-sm text-text-muted hover:bg-muted/50 rounded-lg transition-all duration-200 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const date = new Date(year, month - 1, day);
          onDateSelect(date);
        }}
      >
        {day}
      </motion.button>
    );
  }
  
  // 当月的天数
  for (let day = 1; day <= daysInMonth; day++) {
    const isDisabled = isPastDate(day);
    const isSelectedDay = isSelected(day);
    const isTodayDay = isToday(day);
    
    calendarDays.push(
      <motion.button
        key={day}
        className={`h-10 w-10 text-sm rounded-lg transition-all duration-200 flex items-center justify-center font-medium relative ${
          isSelectedDay
            ? "bg-gradient-to-r from-primary to-primary-600 text-primary-foreground shadow-lg ring-2 ring-primary/30"
            : isTodayDay
            ? "bg-card border-2 border-primary text-primary font-semibold"
            : isDisabled
            ? "text-text-muted/50 cursor-not-allowed"
            : "text-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30"
        }`}
        disabled={isDisabled}
        onClick={() => handleDateClick(day)}
        whileHover={!isDisabled ? { scale: 1.1 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: day * 0.01 }}
      >
        {day}
        {isSelectedDay && (
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
    );
  }
  
  // 下个月的开头天数
  const totalCells = 42; // 6行 * 7列
  const remainingCells = totalCells - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push(
      <motion.button
        key={`next-${day}`}
        className="h-10 w-10 text-sm text-text-muted hover:bg-muted/50 rounded-lg transition-all duration-200 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const date = new Date(year, month + 1, day);
          onDateSelect(date);
        }}
      >
        {day}
      </motion.button>
    );
  }
  
  return (
    <Card className="w-full bg-card/90 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">选择咨询日期</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevMonth}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-lg font-semibold min-w-[120px] text-center text-foreground">
                {year}年{MONTHS[month]}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextMonth}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day) => (
                <div 
                  key={day} 
                  className="h-10 flex items-center justify-center text-sm font-medium text-text-secondary"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays}
            </div>
            
            {/* 日期选择说明 */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-sm text-text-secondary space-y-2">
                <div className="font-medium text-foreground">日期选择说明：</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-600 rounded"></div>
                    <span>已选择日期</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-card border-2 border-primary rounded"></div>
                    <span>今天</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-text-muted/20 rounded"></div>
                    <span>过往日期</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-card border border-border rounded"></div>
                    <span>可选日期</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}