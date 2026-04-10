import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';

import { useTheme } from '@/hooks/useTheme';

type IconElementProps = {
  className?: string;
};

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon | ReactElement<IconElementProps>;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
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

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

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
      : 'text-gray-700 hover:bg-gray-100 focus:ring-primary',
  };

  const sizeClasses = {
    xxs: 'px-1.5 py-0 text-[10px] h-6',
    xs: 'px-2 py-0.5 text-xs h-7',
    sm: 'px-spacing-md py-spacing-sm text-text-sm h-9',
    md: 'px-spacing-lg py-spacing-sm text-text-base h-10',
    lg: 'px-6 py-spacing-md text-text-lg h-12',
  };

  const disabledClasses = disabled || isLoading ? 'opacity-90 cursor-not-allowed' : '';
  const widthClass = fullWidth ? 'w-full justify-center' : '';
  const iconSpacingClasses = icon && children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    widthClass,
    className,
  ].join(' ');

  const buttonProps = {
    ...restProps,
    disabled: disabled || isLoading,
  };

  const renderIcon = () => {
    if (!icon) {
      return null;
    }

    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <IconComponent className={`h-4 w-4 ${iconSpacingClasses}`} />;
    }

    if (React.isValidElement<IconElementProps>(icon)) {
      return React.cloneElement(icon, {
        className: `${icon.props.className || ''} ${iconSpacingClasses}`.trim(),
      });
    }

    return null;
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
});

Button.displayName = 'Button';

export default Button;
