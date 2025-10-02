/**
 * Redux Store 配置文件
 * 负责管理应用的业务状态
 * 根据前端架构设计说明，业务状态（如用户信息、预约数据）应使用Redux Toolkit管理
 */
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { combineReducers } from 'redux';

// Reducers
import userReducer from './userSlice';
import bookingReducer from './bookingSlice';

// 组合所有reducer
const rootReducer = combineReducers({
  user: userReducer,
  booking: bookingReducer,
});

/**
 * Redux Store 配置
 */
export const store = configureStore({
  // 根reducer
  reducer: rootReducer,
  // 中间件配置
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // 添加性能监控中间件（仅在开发环境下启用）
      .concat(process.env.NODE_ENV === 'development' ? [] : []),
  // 开发工具配置
  devTools: process.env.NODE_ENV !== 'production',
  // 预加载状态（服务器端渲染时使用）
  preloadedState: undefined,
});

/**
 * 设置Redux监听器
 * 用于处理异步操作的生命周期事件
 */
setupListeners(store.dispatch);

/**
 * RootState类型定义
 * 所有reducer状态的联合类型
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch类型定义
 * 增强后的dispatch类型
 */
export type AppDispatch = typeof store.dispatch;

/**
 * 自定义ThunkAction类型
 * 用于创建类型安全的thunk操作
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

/**
 * 选择器Hook类型
 * 用于创建自定义的选择器Hook
 */
export type SelectorHook<T> = (state: RootState) => T;

/**
 * 获取Redux Store的当前状态
 * @returns RootState
 */
export const getStoreState = (): RootState => store.getState();

/**
 * 用于Redux Store的工具函数
 */
export const storeUtils = {
  /**
   * 重置Redux Store到初始状态
   * 注意：此操作会清空所有状态
   */
  resetStore: () => {
    // 这里可以实现重置逻辑
    // 例如：store.dispatch({ type: 'RESET_STORE' });
  },
  
  /**
   * 批量更新Redux状态
   * @param updates 包含多个action的数组
   */
  batchDispatch: (updates: Action<string>[]) => {
    updates.forEach((action) => store.dispatch(action));
  },
};