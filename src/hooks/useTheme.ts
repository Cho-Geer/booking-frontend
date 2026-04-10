/**
 * Theme Hook - 统一管理主题状态
 * 提供主题相关的便捷访问方法
 */
import { useUI } from '@/contexts/UIContext';

/**
 * 主题Hook - 返回主题相关的状态和方法
 * @returns 主题状态对象
 * 
 * @example
 * const { isDark, theme, toggleTheme } = useTheme();
 */
export const useTheme = () => {
  const { uiState, toggleTheme } = useUI();
  
  return {
    /** 是否为深色主题 */
    isDark: uiState.theme === 'dark',
    /** 当前主题类型 */
    theme: uiState.theme,
    /** 切换主题方法 */
    toggleTheme,
    /** 是否为移动端视图 */
    isMobile: uiState.isMobile,
    /** 视口宽度 */
    viewportWidth: uiState.viewportWidth,
  };
};

export default useTheme;
