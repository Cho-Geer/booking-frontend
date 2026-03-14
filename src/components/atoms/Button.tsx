import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon | ReactElement;
  iconPosition?: 'left' | 'right';
}

/**
 * 原子组件：按钮
 * 支持Lucide React和Heroicons图标
 * 
 * @component
 * @example
 * // 主要按钮
 * <Button variant="primary">主要按钮</Button>
 * 
 * // 带图标的按钮
 * <Button variant="primary" icon={Search}>搜索</Button>
 * 
 * // 次要按钮
 * <Button variant="secondary">次要按钮</Button>
 * 
 * // 危险按钮
 * <Button variant="danger">危险按钮</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled = false,
      className = '',
      icon,
      iconPosition = 'left',
      ...restProps
    } = props;
    const { isDark: isDarkTheme } = useTheme();
    
    // 基础样式 - 遵循设计系统规范
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // 变体样式 - 使用Tailwind配置中定义的颜色
    const variantClasses = {
      primary: isDarkTheme
        ? 'bg-primary text-white hover:bg-primary/80 focus:ring-primary'
        : 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
      secondary: isDarkTheme
        ? 'bg-secondary text-white hover:bg-secondary/80 focus:ring-secondary'
        : 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
      warning: isDarkTheme
        ? 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500'
        : 'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-500',
      danger: isDarkTheme
        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: isDarkTheme
        ? 'text-text-dark-primary hover:bg-background-dark-200 focus:ring-primary'
        : 'text-gray-700 hover:bg-gray-100 focus:ring-primary'
    };
    
    // 尺寸样式 - 使用CSS变量中定义的间距和字体大小
    const sizeClasses = {
      xxs: 'px-1.5 py-0 text-[10px] h-6',
      xs: 'px-2 py-0.5 text-xs h-7',
      sm: 'px-spacing-md py-spacing-sm text-text-sm h-9',
      md: 'px-spacing-lg py-spacing-sm text-text-base h-10',
      lg: 'px-6 py-spacing-md text-text-lg h-12'
    };
    
    // 禁用状态样式 - 使用CSS变量中的语义化变量
    const disabledClasses = (disabled || isLoading) 
      ? 'opacity-90 cursor-not-allowed'
      : '';
    
    // 全宽样式
    const widthClass = fullWidth ? 'w-full justify-center' : '';
    
    // 图标间距样式
    const iconSpacingClasses = icon && children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';
    
    // 合并所有样式
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabledClasses,
      widthClass,
      className
    ].join(' ');
    
    // 创建按钮props，确保isLoading不直接传递给DOM
    const buttonProps = {
      ...restProps,
      disabled: disabled || isLoading
    };
    
    // 渲染图标
    const renderIcon = () => {
      if (!icon) return null;
      
      if (typeof icon === 'function') {
        // Lucide React图标组件
        const IconComponent = icon;
        return <IconComponent className={`h-4 w-4 ${iconSpacingClasses}`} />;
      } else {
        // Heroicons图标或其他React元素
        return React.cloneElement(icon, {
          className: `${icon.props?.className || ''} ${iconSpacingClasses}`
        });
      }
    };
    
    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        className={classes}
        {...buttonProps}
      >
        {isLoading && (
          <motion.div
            id="button-loading-spinner"
            className={`h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${iconSpacingClasses}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {iconPosition === 'left' && !isLoading && renderIcon()}
        {children}
        {iconPosition === 'right' && !isLoading && renderIcon()}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
