import React from 'react';
import { motion } from 'framer-motion';
import { footerVariants } from './variants';

/**
 * 动画页脚属性
 */
interface AnimatedFooterProps {
  /** 页脚内容 */
  children: React.ReactNode;
  /** 类名 */
  className?: string;
  /** 元素 ID */
  id?: string;
  /** 是否启用动画 */
  animate?: boolean;
  /** 自定义动画变体 */
  variants?: typeof footerVariants;
  /** 自定义延迟（毫秒） */
  delay?: number;
}

/**
 * 原子组件：动画页脚
 * 
 * 提供统一的淡入动画效果
 * 
 * @component
 * @example
 * // 基本使用
 * <AnimatedFooter>
 *   <p>版权信息</p>
 * </AnimatedFooter>
 * 
 * @example
 * // 自定义延迟
 * <AnimatedFooter delay={0.8}>
 *   <p>版权信息</p>
 * </AnimatedFooter>
 */
const AnimatedFooter: React.FC<AnimatedFooterProps> = ({
  children,
  className = '',
  id,
  animate = true,
  variants = footerVariants,
  delay
}) => {
  if (!animate) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  // 如果有自定义延迟，创建新的变体
  const customVariants = delay
    ? {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { delay }
        }
      }
    : variants;

  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      animate="visible"
      variants={customVariants}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedFooter;
