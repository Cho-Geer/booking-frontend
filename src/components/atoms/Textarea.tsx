import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * 原子组件：文本域
 * 
 * @component
 * @example
 * // 基础文本域
 * <Textarea placeholder="请输入内容" />
 * 
 * // 带标签和错误提示的文本域
 * <Textarea label="备注" error="输入内容不符合要求" />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      fullWidth = false,
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
        setClientId(`textarea-${Math.floor(Math.random() * 1000000)}`);
      }
    }, [propId]);
    
    const textareaId = propId || clientId || `textarea-fallback`;
    
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
      <div id="textarea-container" className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium mb-1 text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${classes} px-3 py-2`}
          {...props}
        />
        {error && (
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} id={`${textareaId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;