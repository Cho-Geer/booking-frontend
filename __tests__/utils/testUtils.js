import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import mockStore from './mockStore';

// 创建一个自定义的 render 函数，包含所有必要的上下文
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = mockStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// 模拟 router hook
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
};

// 模拟 router hook
export const useRouterMock = () => mockRouter;

// 重置所有模拟
export const resetAllMocks = () => {
  jest.clearAllMocks();
};

describe('testUtils', () => {
  it('should export renderWithProviders function', () => {
    expect(renderWithProviders).toBeDefined();
  });
  
  it('should export mockRouter object', () => {
    expect(mockRouter).toBeDefined();
  });
  
  it('should export useRouterMock function', () => {
    expect(useRouterMock).toBeDefined();
  });
  
  it('should export resetAllMocks function', () => {
    expect(resetAllMocks).toBeDefined();
  });
});