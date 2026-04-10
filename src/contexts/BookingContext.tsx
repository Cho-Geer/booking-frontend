/**
 * Booking Context - 管理预约页面的UI状态
 * 根据前端架构设计说明，UI状态应使用React Context管理
 * 业务状态使用Redux管理
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BookingStatus } from '@/types';

/**
 * Booking UI状态接口
 */
export interface BookingUIState {
  searchTerm: string;
  statusFilter: BookingStatus | '';
  dateRange: { startDate: string; endDate: string };
  showUpdateSuccessModal: boolean;
}

/**
 * Booking UI上下文接口
 */
export interface BookingContextType {
  uiState: BookingUIState;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: BookingStatus | '') => void;
  setDateRange: (range: { startDate: string; endDate: string }) => void;
  setShowUpdateSuccessModal: (show: boolean) => void;
  resetFilters: () => void;
  isEndDateInvalid: boolean;
}

/**
 * 初始状态
 */
const initialState: BookingUIState = {
  searchTerm: '',
  statusFilter: '',
  dateRange: { startDate: '', endDate: '' },
  showUpdateSuccessModal: false,
};

/**
 * Booking上下文创建
 */
const BookingContext = createContext<BookingContextType | undefined>(undefined);

/**
 * Booking UI Provider组件 - 提供预约页面UI状态管理功能
 * @param children 子组件
 */
export function BookingUIProvider({ children }: { children: ReactNode }) {
  const [uiState, setUiState] = useState<BookingUIState>(initialState);

  /**
   * 设置搜索关键词
   */
  const setSearchTerm = useCallback((searchTerm: string) => {
    setUiState(prev => ({ ...prev, searchTerm }));
  }, []);

  /**
   * 设置状态筛选
   */
  const setStatusFilter = useCallback((statusFilter: BookingStatus | '') => {
    setUiState(prev => ({ ...prev, statusFilter }));
  }, []);

  /**
   * 设置日期范围
   */
  const setDateRange = useCallback((dateRange: { startDate: string; endDate: string }) => {
    setUiState(prev => ({ ...prev, dateRange }));
  }, []);

  /**
   * 设置更新成功弹窗显示状态
   */
  const setShowUpdateSuccessModal = useCallback((showUpdateSuccessModal: boolean) => {
    setUiState(prev => ({ ...prev, showUpdateSuccessModal }));
  }, []);

  /**
   * 重置筛选条件
   */
  const resetFilters = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      searchTerm: '',
      statusFilter: '',
      dateRange: { startDate: '', endDate: '' },
    }));
  }, []);

  /**
   * 结束日期是否无效（早于开始日期）
   */
  const isEndDateInvalid = 
    !!uiState.dateRange.startDate &&
    !!uiState.dateRange.endDate &&
    uiState.dateRange.endDate < uiState.dateRange.startDate;

  const contextValue: BookingContextType = {
    uiState,
    setSearchTerm,
    setStatusFilter,
    setDateRange,
    setShowUpdateSuccessModal,
    resetFilters,
    isEndDateInvalid,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

/**
 * Booking UI Hook - 用于访问预约UI状态和方法
 * @throws 当在BookingUIProvider外部使用时抛出错误
 * @returns Booking UI上下文对象
 */
export function useBookingUI() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingUI must be used within a BookingUIProvider');
  }
  return context;
}

/**
 * 安全的Booking UI Hook - 在BookingUIProvider外部使用时返回默认值
 * @returns Booking UI上下文对象或默认值
 */
export function useBookingUISafe() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    const defaultState: BookingUIState = {
      searchTerm: '',
      statusFilter: '',
      dateRange: { startDate: '', endDate: '' },
      showUpdateSuccessModal: false,
    };
    return {
      uiState: defaultState,
      setSearchTerm: () => {},
      setStatusFilter: () => {},
      setDateRange: () => {},
      setShowUpdateSuccessModal: () => {},
      resetFilters: () => {},
      isEndDateInvalid: false,
    } as BookingContextType;
  }
  return context;
}
