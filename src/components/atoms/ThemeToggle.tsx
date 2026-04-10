import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { Sun, Moon } from 'lucide-react';

/**
 * 主题切换按钮组件
 * 用于切换应用的主题模式（浅色/深色）
 * 
 * @component
 * @returns {JSX.Element} 主题切换按钮
 */
const ThemeToggle: React.FC = () => {
  const { uiState, toggleTheme } = useUI();

  return (
    <button
      id="theme-toggle-button"
      onClick={toggleTheme}
      className={`p-2 rounded-full ${uiState.theme === 'dark' ? 'bg-background-dark text-text-dark-secondary hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      aria-label="切换主题模式"
      title="切换主题模式"
    >
      {uiState.theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;