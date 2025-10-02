import React from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../contexts/UIContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'noBorder';
}

/**
 * 原子组件：卡片
 * 
 * @component
 * @example
 * // 默认卡片
 * <Card>
 *   <p>卡片内容</p>
 * </Card>
 * 
 * // 边框卡片
 * <Card variant="outlined">
 *   <p>卡片内容</p>
 * </Card>
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  // 基础样式 - 充分利用global.css中定义的CSS变量
  const baseClasses = 'rounded-lg shadow-md bg-card';
  
  // 不同变体的样式
  const variantClasses = {
    default: '',
    outlined: 'border border-border',
    noBorder: ''
  };
  
  // 合并所有样式 - 使用CSS变量定义的间距
  const classes = `${baseClasses} ${variantClasses[variant]} p-spacing-lg ${className}`;
  
  return (
    <motion.div 
      id="card-container"
      className={classes}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;