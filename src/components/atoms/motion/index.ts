/**
 * Motion 组件统一导出
 * 
 * 提供通用的动画组件和动画变体，消除重复代码
 */

// 动画组件
export { default as AnimatedPage } from './AnimatedPage';
export { default as AnimatedHeader } from './AnimatedHeader';
export { default as AnimatedFooter } from './AnimatedFooter';

// 动画变体
export {
  pageTransitionVariants,
  innerContainerVariants,
  headerVariants,
  footerVariants,
  cardVariants,
  buttonVariants,
  loadingSpinnerVariants
} from './variants';
