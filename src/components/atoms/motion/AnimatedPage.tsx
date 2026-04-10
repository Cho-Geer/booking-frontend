import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants, innerContainerVariants } from './variants';

/**
 * 动画页面容器属性
 */
interface AnimatedPageProps {
  /** 页面内容 */
  children: React.ReactNode;
  /** 外层容器类名 */
  containerClassName?: string;
  /** 内层容器类名 */
  innerClassName?: string;
  /** 外层容器 ID */
  containerId?: string;
  /** 内层容器 ID */
  innerId?: string;
  /** 是否启用外层容器动画 */
  animateContainer?: boolean;
  /** 是否启用内层容器动画 */
  animateInner?: boolean;
  /** 自定义外层动画变体 */
  containerVariants?: typeof pageTransitionVariants;
  /** 自定义内层动画变体 */
  innerVariants?: typeof innerContainerVariants;
}

/**
 * 原子组件：动画页面容器
 * 
 * 提供统一的页面级动画效果，包括：
 * - 外层容器：淡入动画
 * - 内层容器：上滑 + 淡入动画
 * 
 * @component
 * @example
 * // 基本使用
 * <AnimatedPage>
 *   <YourContent />
 * </AnimatedPage>
 * 
 * @example
 * // 自定义类名
 * <AnimatedPage
 *   containerClassName="min-h-screen"
 *   innerClassName="max-w-md"
 * >
 *   <YourContent />
 * </AnimatedPage>
 */
const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  containerClassName = '',
  innerClassName = '',
  containerId,
  innerId,
  animateContainer = true,
  animateInner = true,
  containerVariants = pageTransitionVariants,
  innerVariants = innerContainerVariants
}) => {
  if (!animateContainer && !animateInner) {
    return (
      <div id={containerId} className={containerClassName}>
        <div id={innerId} className={innerClassName}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id={containerId}
      className={containerClassName}
      initial={animateContainer ? 'hidden' : false}
      animate={animateContainer ? 'visible' : 'visible'}
      variants={animateContainer ? containerVariants : undefined}
    >
      <motion.div
        id={innerId}
        className={innerClassName}
        initial={animateInner ? 'hidden' : false}
        animate={animateInner ? 'visible' : 'visible'}
        variants={animateInner ? innerVariants : undefined}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedPage;
