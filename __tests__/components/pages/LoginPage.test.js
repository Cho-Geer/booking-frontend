import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useRouter } from 'next/router';
import LoginPage from '@/components/pages/LoginPage';

/**
 * LoginPage组件测试
 * 测试覆盖范围：
 * 1. 认证和路由重定向
 * 2. 组件渲染和状态展示
 * 3. 用户交互和状态更新
 * 4. 边界情况和异常处理
 */

// 模拟 next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// 模拟 LoginPageOrganism 组件
jest.mock('@/components/organisms/LoginPage', () => {
  return function MockLoginPageOrganism({
    onSendCode,
    onVerifyCode,
    loading,
    codeSent,
    countdown,
    error,
    phone,
    verificationCode,
    onPhoneChange,
    onCodeChange
  }) {
    return (
      <div data-testid="login-page-organism">
        <input
          data-testid="phone-input"
          value={phone || ''}
          onChange={(e) => onPhoneChange && onPhoneChange(e.target.value)}
          placeholder="请输入手机号"
        />
        <input
          data-testid="code-input"
          value={verificationCode || ''}
          onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
          placeholder="请输入验证码"
        />
        <button
          onClick={() => onSendCode && onSendCode('13800138000')}
          data-testid="send-code-button"
          disabled={loading}
        >
          发送验证码
        </button>
        <button
          onClick={() => onVerifyCode && onVerifyCode('13800138000', '123456')}
          data-testid="verify-code-button"
          disabled={loading}
        >
          验证验证码
        </button>
        <button
          onClick={() => onSendCode && onSendCode('13800138000')}
          data-testid="resend-code-button"
          disabled={countdown > 0}
        >
          重新发送
        </button>
        <div data-testid="loading">{loading ? '加载中...' : '空闲'}</div>
        <div data-testid="code-sent">{codeSent ? '已发送' : '未发送'}</div>
        <div data-testid="countdown">{countdown}</div>
        <div data-testid="error" className={error ? 'error-visible' : ''}>{error}</div>
      </div>
    );
  };
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

/**
 * 登录页面组件测试套件
 */
describe('LoginPage', () => {
  let store;
  let mockPush;
  let mockDispatch;

  /**
   * 测试前的初始化设置
   */
  beforeEach(() => {
    mockPush = jest.fn();
    mockDispatch = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  /**
   * 测试后的清理工作
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 创建模拟Redux store
   * @param {Object} state - 初始状态
   * @returns {Object} 配置好的mock store
   */
  const createMockStore = (state = {}) => {
    return mockStore({
      user: {
        loading: false,
        error: null,
        codeSent: false,
        user: null,
        ...state,
      },
    });
  };

  /**
   * 认证和路由重定向测试组
   */
  describe('认证和路由重定向', () => {
    test('当用户已认证时，应该重定向到/bookings页面', () => {
      store = createMockStore({
        currentUser: { id: 1, phone: '13800138000' },
      });

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/bookings');
    });

    test('当用户未认证时，不应该进行重定向', () => {
      store = createMockStore();

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });

    test('当用户认证信息为空字符串时，不应该重定向', () => {
      store = createMockStore({
        currentUser: '',
      });

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  /**
   * 组件渲染和状态展示测试组
   */
  describe('组件渲染和状态展示', () => {
    test('应该正确渲染LoginPage组件和其子组件', () => {
      store = createMockStore();

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(screen.getByTestId('login-page-organism')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('code-input')).toBeInTheDocument();
      expect(screen.getByTestId('send-code-button')).toBeInTheDocument();
      expect(screen.getByTestId('verify-code-button')).toBeInTheDocument();
    });

    test('应该正确显示初始状态', () => {
      store = createMockStore();

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('空闲');
      expect(screen.getByTestId('code-sent')).toHaveTextContent('未发送');
      expect(screen.getByTestId('countdown')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).not.toHaveClass('error-visible');
    });

    test('应该正确显示加载状态', () => {
      store = createMockStore({
        loading: true,
      });

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('加载中...');
      expect(screen.getByTestId('send-code-button')).toBeDisabled();
      expect(screen.getByTestId('verify-code-button')).toBeDisabled();
    });

    test('应该正确显示错误信息', () => {
      const errorMessage = '验证码错误，请重新输入';
      store = createMockStore({
        error: errorMessage,
      });

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('error')).toHaveClass('error-visible');
    });
  });

  /**
   * 用户交互和状态更新测试组
   */
  describe('用户交互和状态更新', () => {
    test('点击发送验证码按钮时应该调用dispatch', () => {
      store = createMockStore();
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      fireEvent.click(screen.getByTestId('send-code-button'));

      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    test('点击验证验证码按钮时应该调用dispatch', () => {
      store = createMockStore();
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      fireEvent.click(screen.getByTestId('verify-code-button'));

      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    test('倒计时功能应该正常工作', async () => {
      jest.useFakeTimers();
      store = createMockStore();

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      // 初始状态
      expect(screen.getByTestId('countdown')).toHaveTextContent('0');

      // 发送验证码
      fireEvent.click(screen.getByTestId('send-code-button'));

      // 检查倒计时是否开始
      expect(screen.getByTestId('countdown')).toHaveTextContent('60');
      expect(screen.getByTestId('resend-code-button')).toBeDisabled();

      // 快进时间并使用act包装
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // 等待下一个事件循环以确保状态更新
      await waitFor(() => {
        expect(screen.getByTestId('countdown')).toHaveTextContent('59');
      });

      // 快进到倒计时结束
      act(() => {
        jest.advanceTimersByTime(59000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('countdown')).toHaveTextContent('0');
        expect(screen.getByTestId('resend-code-button')).not.toBeDisabled();
      });

      jest.useRealTimers();
    });

    test('在不同状态下，按钮状态应该正确变化', async () => {
      store = createMockStore();

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      // 初始状态：发送按钮可用
      expect(screen.getByTestId('send-code-button')).not.toBeDisabled();
      expect(screen.getByTestId('verify-code-button')).not.toBeDisabled();
      expect(screen.getByTestId('resend-code-button')).not.toBeDisabled();
    });
  });

  /**
   * 边界情况和异常处理测试组
   */
  describe('边界情况和异常处理', () => {
    test('当store为undefined时应该正常渲染', () => {
      store = mockStore({});

      expect(() => {
        render(
          <Provider store={store}>
            <LoginPage />
          </Provider>
        );
      }).not.toThrow();
    });

    test('当user状态为undefined时应该正常渲染', () => {
      store = mockStore({
        user: undefined,
      });

      expect(() => {
        render(
          <Provider store={store}>
            <LoginPage />
          </Provider>
        );
      }).not.toThrow();
    });

    test('当倒计时为负数时应该显示为0', () => {
      store = createMockStore({
        countdown: -5,
      });

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      expect(screen.getByTestId('countdown')).toHaveTextContent('0');
    });

    test('当发送验证码按钮被多次点击时应该多次调用dispatch', () => {
      store = createMockStore();
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );

      fireEvent.click(screen.getByTestId('send-code-button'));
      fireEvent.click(screen.getByTestId('send-code-button'));
      fireEvent.click(screen.getByTestId('send-code-button'));

      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
  });
});