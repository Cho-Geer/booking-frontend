/**
 * UI相关类型定义
 * 集中管理所有与UI状态相关的类型
 */

import { ReactNode } from 'react';

// 确保 Notification 类型与 UINotification 一致
type Notification = UINotification;

/**
 * 主题类型定义
 */
export type ThemeType = 'light' | 'dark' | 'system';

/**
 * 语言类型定义
 */
export type LanguageType = 'zh-CN' | 'en-US' | 'auto';

/**
 * 通知类型定义
 */
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

/**
 * UI 通知实体定义
 */
export interface UINotification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  key?: string;
}

/**
 * 模态框配置定义
 */
export interface ModalConfig {
  open: boolean;
  title?: string;
  content?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

/**
 * 面包屑项定义
 */
export interface BreadcrumbItem {
  title: string;
  path: string;
  icon?: ReactNode;
}

/**
 * UI状态接口
 */
export interface UIState {
  // 主题状态
  theme: ThemeType;
  // 侧边栏状态
  sidebarOpen: boolean;
  // 通知列表
  notifications: UINotification[];
  // 模态框配置
  modal: ModalConfig;
  // 全局加载状态
  loading: boolean;
  // 语言设置
  language: LanguageType;
  // 面包屑导航
  breadcrumbs: BreadcrumbItem[];
  // 移动设备视图
  isMobile: boolean;
  // 视口宽度
  viewportWidth: number;
}

/**
 * UI上下文类型定义
 */
export interface UIContextType {
  uiState: UIState;
  // 主题相关方法
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  // 侧边栏相关方法
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  // 通知相关方法
  addNotification: (notification: Omit<UINotification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  // 便捷通知方法
  showSuccess: (message: string, description?: string, duration?: number) => string;
  showError: (message: string, description?: string, duration?: number) => string;
  showWarning: (message: string, description?: string, duration?: number) => string;
  showInfo: (message: string, description?: string, duration?: number) => string;
  // 模态框相关方法
  setModal: (config: Partial<ModalConfig>) => void;
  openModal: (config: Omit<ModalConfig, 'open'>) => void;
  closeModal: () => void;
  // 加载状态相关方法
  setLoading: (loading: boolean) => void;
  // 语言相关方法
  setLanguage: (language: LanguageType) => void;
  // 面包屑相关方法
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
}
