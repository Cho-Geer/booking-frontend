import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 按钮点击事件 */
  onClick?: () => void;
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否全宽 */
  fullWidth?: boolean;
  /** 是否加载中 */
  isLoading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 原子组件：带动画效果的按钮
 * 使用Framer Motion实现按钮的悬停和点击动画效果
 * 
 * @component
 * @example
 * <AnimatedButton variant="primary" onClick={() => console.log("clicked")}>
 *   点击我
 * </AnimatedButton>
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  isLoading = false,
  className = ''
}) => {
  // 按钮样式映射
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  // 尺寸样式映射
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // 禁用样式
  const disabledStyles = disabled || isLoading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  // 完整的按钮样式
  const buttonStyles = [
    'inline-flex items-center border border-transparent font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    variantStyles[variant],
    sizeStyles[size],
    disabledStyles,
    fullWidth ? 'w-full justify-center' : '',
    className
  ].join(' ');

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonStyles}
      type="button"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </>
      ) : children}
    </motion.button>
  );
};

export default AnimatedButton;