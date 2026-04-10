import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * 原子组件：输入框
 * 
 * @component
 * @example
 * // 基础输入框
 * <Input placeholder="请输入内容" />
 * 
 * // 带标签和错误提示的输入框
 * <Input label="邮箱" error="邮箱格式不正确" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
      label,
      error,
      fullWidth = true,
      className = '',
      id: propId,
      ...props
    },
    ref
  ) => {
    // 使用useState和useEffect解决hydration不匹配问题
    const [clientId, setClientId] = useState(propId);
    const { theme } = useTheme();
    
    // 在客户端渲染后生成ID，避免SSR和客户端ID不匹配
    useEffect(() => {
      if (!propId) {
        // 使用更简单的随机数生成方法
        setClientId(`input-${Math.floor(Math.random() * 1000000)}`);
      }
    }, [propId]);
    
    const inputId = propId || clientId || `input-fallback`;

    // 根据主题选择基础样式
    const baseClasses = theme === 'dark'
      ? 'block w-full rounded-md border-border-dark bg-background-dark text-text-dark-primary shadow-sm focus:border-primary focus:ring-primary sm:text-sm'
      : 'block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm';
    
    // 错误状态样式
    const errorClasses = error 
      ? theme === 'dark'
        ? 'border-red-500 text-red-400 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
        : 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : '';
    
    // 宽度样式
    const widthClass = fullWidth ? 'w-full' : '';
    
    // 合并所有样式
    const classes = `${baseClasses} ${errorClasses} ${widthClass} ${className}`;
    
    return (
      <div id="input-container" className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1 text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={classes}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error" id={`${inputId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;