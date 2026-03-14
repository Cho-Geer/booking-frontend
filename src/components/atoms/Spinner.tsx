import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface SpinnerProps {
  /** 加载文本 */
  text?: string;
  /** 尺寸大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否为全局样式 */
  global?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 原子组件：加载指示器
 * 提供统一的加载动画效果，支持不同尺寸和全局模式
 * 
 * @component
 * @example
 * // 基础用法
 * <Spinner />
 * 
 * // 带文本
 * <Spinner text="加载中..." />
 * 
 * // 全局模式
 * <Spinner text="正在处理，请稍候..." global />
 */
const Spinner: React.FC<SpinnerProps> = ({
  text,
  size = 'md',
  global = false,
  className = ''
}) => {
  const { isDark: isDarkTheme } = useTheme();

  // 尺寸配置
  const sizeConfig = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // 颜色配置
  const borderColor = isDarkTheme ? 'border-white' : 'border-primary';

  if (global) {
    return (
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`animate-spin rounded-full ${sizeConfig[size]} border-b-2 ${borderColor}`}></div>
          {text && (
            <p className={`text-white text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${sizeConfig[size]} border-b-2 ${borderColor}`}></div>
      {text && (
        <span className={`ml-3 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Spinner;