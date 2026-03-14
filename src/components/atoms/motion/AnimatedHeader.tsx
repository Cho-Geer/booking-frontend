import React from 'react';
import { motion } from 'framer-motion';
import { headerVariants } from './variants';

/**
 * 动画标题属性
 */
interface AnimatedHeaderProps {
  /** 标题内容 */
  children: React.ReactNode;
  /** 类名 */
  className?: string;
  /** 元素 ID */
  id?: string;
  /** 是否启用动画 */
  animate?: boolean;
  /** 自定义动画变体 */
  variants?: typeof headerVariants;
  /** 自定义初始状态 */
  initial?: 'hidden' | false;
  /** 自定义动画状态 */
  animateState?: 'visible' | false;
}

/**
 * 原子组件：动画标题
 * 
 * 提供统一的上滑 + 淡入动画效果
 * 
 * @component
 * @example
 * // 基本使用
 * <AnimatedHeader>
 *   <h1>页面标题</h1>
 * </AnimatedHeader>
 * 
 * @example
 * // 自定义延迟
 * <AnimatedHeader
 *   variants={{
 *     hidden: { y: -20, opacity: 0 },
 *     visible: { y: 0, opacity: 1, transition: { delay: 0.5 } }
 *   }}
 * >
 *   <h1>页面标题</h1>
 * </AnimatedHeader>
 */
const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  children,
  className = '',
  id,
  animate = true,
  variants = headerVariants,
  initial = 'hidden',
  animateState = 'visible'
}) => {
  if (!animate) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={className}
      initial={initial}
      animate={animateState}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedHeader;
