/**
 * UI Context - 管理应用的UI状态
 * 根据前端架构设计说明，UI状态（如主题、侧边栏状态）应使用React Context管理
 */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/compat/router';
import { ThemeType, LanguageType, Notification, ModalConfig, BreadcrumbItem, UIState, UIContextType } from '@/types';

/**
 * 初始UI状态
 */
const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: false,
  notifications: [],
  modal: {
    open: false,
    width: 520,
    centered: false,
    closable: true,
    maskClosable: true,
  },
  loading: false,
  language: 'zh-CN',
  breadcrumbs: [],
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
};

/**
 * UI上下文创建
 */
const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * UI Provider组件 - 提供UI状态管理功能
 * @param children 子组件
 */
export function UIProvider({ children }: { children: ReactNode }) {
  const [uiState, setUiState] = useState<UIState>(initialState);
  const router = useRouter();

  /**
   * 检测系统主题
   */
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  /**
   * 应用主题到文档
   */
  const applyThemeToDocument = useCallback((theme: ThemeType) => {
    if (typeof document === 'undefined') return;

    // 移除所有主题类
    document.documentElement.classList.remove('scheme-light', 'scheme-dark');
    document.documentElement.classList.remove('dark');

    // 根据主题类型设置类名
    const actualTheme = theme === 'system' ? getSystemTheme() : theme;
    
    // 添加Tailwind标准的dark类名和自定义的scheme-类名以保持兼容性
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.classList.add(`scheme-${actualTheme}`);

    // 保存主题设置到localStorage
    try {
      localStorage.setItem('app-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [getSystemTheme]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (uiState.theme === 'system') {
        applyThemeToDocument('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [uiState.theme, applyThemeToDocument]);

  /**
   * 监听视口变化
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setUiState(prev => ({
        ...prev,
        isMobile,
        viewportWidth: window.innerWidth,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 更新主题
   */
  const setTheme = useCallback((theme: ThemeType) => {
    setUiState(prev => ({ ...prev, theme }));
    applyThemeToDocument(theme);
  }, [applyThemeToDocument]);

  /**
   * 初始化时加载保存的主题设置
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('app-theme') as ThemeType | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, [setTheme]);

  /**
   * 切换主题 - 修复类型错误，直接设置新主题而不是传递函数
   */
  const toggleTheme = useCallback(() => {
    // 直接根据当前主题计算新主题
    const newTheme = uiState.theme === 'light' ? 'dark' : uiState.theme === 'dark' ? 'light' : 'light';
    setTheme(newTheme);
  }, [uiState.theme, setTheme]);

  /**
   * 设置侧边栏状态
   */
  const setSidebarOpen = useCallback((sidebarOpen: boolean) => {
    setUiState(prev => ({ ...prev, sidebarOpen }));
  }, []);

  /**
   * 切换侧边栏
   */
  const toggleSidebar = useCallback(() => {
    setUiState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  /**
   * 移除通知 - 先定义removeNotification以避免使用前未定义的问题
   */
  const removeNotification = useCallback((id: string) => {
    setUiState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  /**
   * 清除所有通知
   */
  const clearNotifications = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  /**
   * 添加通知
   */
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      // 确保duration有默认值，避免undefined
      duration: notification.duration ?? 4.5,
    };

    setUiState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification],
    }));

    // 设置自动关闭
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration * 1000);
    }
    
    return newNotification.id;
  }, [removeNotification]);

  /**
   * 显示成功通知
   * @param message 通知消息
   * @param description 通知描述
   * @param duration 持续时间（秒）
   * @returns 通知ID
   */
  const showSuccess = useCallback((message: string, description?: string, duration: number = 3) => {
    return addNotification({
      type: 'success',
      message,
      description,
      duration,
    });
  }, [addNotification]);

  /**
   * 显示错误通知
   * @param message 通知消息
   * @param description 通知描述
   * @param duration 持续时间（秒）
   * @returns 通知ID
   */
  const showError = useCallback((message: string, description?: string, duration: number = 5) => {
    return addNotification({
      type: 'error',
      message,
      description,
      duration,
    });
  }, [addNotification]);

  /**
   * 显示警告通知
   * @param message 通知消息
   * @param description 通知描述
   * @param duration 持续时间（秒）
   * @returns 通知ID
   */
  const showWarning = useCallback((message: string, description?: string, duration: number = 4) => {
    return addNotification({
      type: 'warning',
      message,
      description,
      duration,
    });
  }, [addNotification]);

  /**
   * 显示信息通知
   * @param message 通知消息
   * @param description 通知描述
   * @param duration 持续时间（秒）
   * @returns 通知ID
   */
  const showInfo = useCallback((message: string, description?: string, duration: number = 3) => {
    return addNotification({
      type: 'info',
      message,
      description,
      duration,
    });
  }, [addNotification]);

  /**
   * 设置模态框配置
   */
  const setModal = useCallback((config: Partial<ModalConfig>) => {
    setUiState(prev => ({
      ...prev,
      modal: { ...prev.modal, ...config },
    }));
  }, []);

  /**
   * 打开模态框
   */
  const openModal = useCallback((config: Omit<ModalConfig, 'open'>) => {
    setModal({ ...config, open: true });
  }, [setModal]);

  /**
   * 关闭模态框
   */
  const closeModal = useCallback(() => {
    setModal({ open: false });
  }, [setModal]);

  /**
   * 设置加载状态
   */
  const setLoading = useCallback((loading: boolean) => {
    setUiState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * 设置语言
   */
  const setLanguage = useCallback((language: LanguageType) => {
    setUiState(prev => ({ ...prev, language }));
    // 保存语言设置到localStorage
    try {
      localStorage.setItem('app-language', language);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
    // 可以在这里添加路由语言切换逻辑
    if (language !== 'auto' && router && language !== router.locale) {
    }
  }, [router]);

  /**
   * 设置面包屑导航
   */
  const setBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    setUiState(prev => ({ ...prev, breadcrumbs }));
  }, []);

  /**
   * 添加面包屑项
   */
  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    setUiState(prev => ({
      ...prev,
      breadcrumbs: [...prev.breadcrumbs, breadcrumb],
    }));
  }, []);

  // 在组件挂载时应用初始主题
  useEffect(() => {
    applyThemeToDocument(uiState.theme);
  }, [uiState.theme, applyThemeToDocument]);

  const contextValue: UIContextType = {
    uiState,
    setTheme,
    toggleTheme,
    setSidebarOpen,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setModal,
    openModal,
    closeModal,
    setLoading,
    setLanguage,
    setBreadcrumbs,
    addBreadcrumb,
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}

/**
 * UI Hook - 用于访问UI状态和方法
 * @throws 当在UIProvider外部使用时抛出错误
 * @returns UI上下文对象
 */
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

/**
 * 安全的UI Hook - 在UIProvider外部使用时返回默认值
 * @returns UI上下文对象或默认值
 */
export function useUISafe() {
  const context = useContext(UIContext);
  if (context === undefined) {
    // 返回默认值，避免在服务器端渲染时出错
    return {
      uiState: initialState,
      setTheme: () => {},
      toggleTheme: () => {},
      setSidebarOpen: () => {},
      toggleSidebar: () => {},
      addNotification: () => 'default-id',
      removeNotification: () => {},
      clearNotifications: () => {},
      setModal: () => {},
      openModal: () => {},
      closeModal: () => {},
      setLoading: () => {},
      setLanguage: () => {},
      setBreadcrumbs: () => {},
      addBreadcrumb: () => {},
      showSuccess: () => 'default-id',
      showError: () => 'default-id',
      showWarning: () => 'default-id',
      showInfo: () => 'default-id',
    } as UIContextType;
  }
  return context;
}