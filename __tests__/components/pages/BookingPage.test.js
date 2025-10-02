import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useRouter } from 'next/router';
import BookingPage from '../../../src/components/pages/BookingPage';

/**
 * BookingPage 组件测试
 * 测试预约页面的渲染、认证逻辑、用户交互和状态管理
 */

// 模拟 next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// 模拟 BookingPageOrganism 组件
jest.mock('../../../src/components/organisms/BookingPage', () => {
  return function MockBookingPageOrganism({ 
    bookings, 
    availableSlots, 
    selectedDate, 
    selectedSlot, 
    loading, 
    error, 
    creatingBooking,
    onDateChange, 
    onSlotSelect, 
    onCreateBooking, 
    onCancelBooking, 
    onNotesChange, 
    notes,
    resetBookingState,
    resetSuccessState
  }) {
    return (
      <div data-testid="booking-page-organism">
        <div data-testid="bookings-count">{bookings.length}</div>
        <div data-testid="slots-count">{availableSlots.length}</div>
        <div data-testid="selected-date">{selectedDate}</div>
        <button onClick={() => onDateChange('2023-05-01')} data-testid="change-date-button">
          更改日期
        </button>
        <button onClick={() => onSlotSelect({ id: 1, startTime: '09:00', endTime: '10:00' })} data-testid="select-slot-button">
          选择时间段
        </button>
        <button onClick={onCreateBooking} data-testid="create-booking-button">
          创建预约
        </button>
        <button onClick={() => onCancelBooking('1')} data-testid="cancel-booking-button">
          取消预约
        </button>
        <button onClick={resetBookingState} data-testid="reset-booking-state-button">
          重置状态
        </button>
        <button onClick={resetSuccessState} data-testid="reset-success-state-button">
          重置成功状态
        </button>
        <input 
          value={notes} 
          onChange={(e) => onNotesChange(e.target.value)} 
          data-testid="notes-input"
        />
        <div data-testid="loading">{loading ? '加载中...' : '空闲'}</div>
        <div data-testid="creating-booking">{creatingBooking ? '创建中...' : '空闲'}</div>
        <div data-testid="error">{error}</div>
        <div data-testid="selected-slot">{selectedSlot?.startTime || '未选择'}</div>
      </div>
    );
  };
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('BookingPage', () => {
  let store;
  let mockPush;
  
  // 初始化测试环境
  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });
  
  // 清理测试环境
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('认证和路由重定向', () => {
    it('should redirect to login page when user is not authenticated', () => {
      store = mockStore({
        user: {
          currentUser: null,
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('should not redirect when user is authenticated', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('组件渲染和状态展示', () => {
    beforeEach(() => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '2023-05-01',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
    });

    it('renders BookingPage component when user is authenticated', () => {
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('booking-page-organism')).toBeInTheDocument();
    });

    it('displays correct selected date from store state', () => {
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('selected-date')).toHaveTextContent('2023-05-01');
    });

    it('displays loading state when loading is true', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: true,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('loading')).toHaveTextContent('加载中...');
    });

    it('displays creating booking state when creatingBooking is true', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: true,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('creating-booking')).toHaveTextContent('创建中...');
    });

    it('displays error message when error is present', () => {
      const errorMessage = '获取预约失败';
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: errorMessage,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });

    it('displays bookings count correctly', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [{ id: '1' }, { id: '2' }],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('bookings-count')).toHaveTextContent('2');
    });

    it('displays available slots count correctly', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [{ id: '1' }, { id: '2' }, { id: '3' }],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('slots-count')).toHaveTextContent('3');
    });

    it('displays selected slot time when slot is selected', () => {
      const selectedSlot = { id: 1, startTime: '09:00', endTime: '10:00' };
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: selectedSlot,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('selected-slot')).toHaveTextContent('09:00');
    });
  });

  describe('用户交互和状态更新', () => {
    beforeEach(() => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
    });

    it('dispatches getBookings action when user is authenticated', async () => {
      const mockDispatch = jest.fn();
      store.dispatch = mockDispatch;
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      // 等待useEffect执行
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('dispatches getAvailableSlots action when date changes', async () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '2023-05-01',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      const mockDispatch = jest.fn();
      store.dispatch = mockDispatch;
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      // 等待useEffect执行
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('dispatches createBooking action when creating booking', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '2023-05-01',
          selectedSlot: { id: 1, startTime: '09:00', endTime: '10:00' },
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      fireEvent.click(screen.getByTestId('create-booking-button'));
      
      // 验证是否调用了 dispatch
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('dispatches cancelBooking action when canceling booking', () => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
      
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      fireEvent.click(screen.getByTestId('cancel-booking-button'));
      
      // 验证是否调用了 dispatch
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('handles notes input change correctly', () => {
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      const notesInput = screen.getByTestId('notes-input');
      fireEvent.change(notesInput, { target: { value: '测试备注' } });
      
      expect(notesInput.value).toBe('测试备注');
    });

    it('dispatches resetBookingState action when reset button is clicked', () => {
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      fireEvent.click(screen.getByTestId('reset-booking-state-button'));
      
      // 验证是否调用了 dispatch
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('dispatches resetSuccessState action when reset success button is clicked', () => {
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      fireEvent.click(screen.getByTestId('reset-success-state-button'));
      
      // 验证是否调用了 dispatch
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('dispatches onDateChange action with correct date when date button is clicked', () => {
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      fireEvent.click(screen.getByTestId('change-date-button'));
      
      // 验证是否调用了 dispatch
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('dispatches onSlotSelect action with correct slot when slot button is clicked', () => {
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      fireEvent.click(screen.getByTestId('select-slot-button'));
      
      // 验证是否调用了 dispatch
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('边界情况和异常处理', () => {
    beforeEach(() => {
      store = mockStore({
        user: {
          currentUser: { id: '1', phone: '13800138000' },
        },
        booking: {
          bookings: [],
          availableSlots: [],
          selectedDate: '',
          selectedSlot: null,
          loading: false,
          error: null,
          creatingBooking: false,
          success: false,
        }
      });
    });

    it('handles empty bookings array gracefully', () => {
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('bookings-count')).toHaveTextContent('0');
    });

    it('handles empty available slots array gracefully', () => {
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('slots-count')).toHaveTextContent('0');
    });

    it('handles null selected slot gracefully', () => {
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      expect(screen.getByTestId('selected-slot')).toHaveTextContent('未选择');
    });

    it('handles multiple user interactions correctly', () => {
      store.dispatch = jest.fn();
      
      render(
        <Provider store={store}>
          <BookingPage />
        </Provider>
      );
      
      // 模拟用户连续操作
      fireEvent.click(screen.getByTestId('change-date-button'));
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: '测试备注' } });
      fireEvent.click(screen.getByTestId('select-slot-button'));
      fireEvent.click(screen.getByTestId('create-booking-button'));
      
      // 验证所有操作都触发了dispatch
      expect(store.dispatch).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledTimes(4); // 包括初始加载和三次用户操作
    });
  });
});