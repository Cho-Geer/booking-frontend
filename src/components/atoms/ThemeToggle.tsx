import React from 'react';
import { useUI } from '@/contexts/UIContext';

/**
 * 主题切换按钮组件
 * 用于切换应用的主题模式（浅色/深色）
 * 
 * @component
 * @returns {JSX.Element} 主题切换按钮
 */
const ThemeToggle: React.FC = () => {
  const { uiState, setTheme } = useUI();

  /**
   * 切换主题模式
   */
  const toggleTheme = () => {
    setTheme(uiState.theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className={`p-2 rounded-md transition-colors ${uiState.theme === 'dark' ? 'bg-background-dark-200' : 'bg-gray-200'}`}
    >
      {uiState.theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;