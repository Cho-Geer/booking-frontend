import React from 'react';
import { motion } from 'framer-motion';

/**
 * 通用页面容器动画配置
 */
export const pageTransitionVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

/**
 * 通用内层容器动画配置
 */
export const innerContainerVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { delay: 0.3 }
  }
};

/**
 * 通用标题动画配置
 */
export const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { delay: 0.2 }
  }
};

/**
 * 通用页脚动画配置
 */
export const footerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delay: 0.5 }
  }
};

/**
 * 通用卡片动画配置
 */
export const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

/**
 * 通用按钮动画配置
 */
export const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

/**
 * 通用加载动画配置
 */
export const loadingSpinnerVariants = {
  rotate: {
    from: 0,
    to: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  }
};
