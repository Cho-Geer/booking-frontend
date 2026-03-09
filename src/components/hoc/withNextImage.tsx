import React, { ComponentType, JSX } from 'react';
import Image from '../atoms/Image';

/**
 * 用于迁移的高阶组件，将普通图像组件或img标签包装为优化的Next.js Image组件
 * 提供平滑的过渡路径，帮助现有项目逐步迁移到优化的图像加载方案
 */
interface WithNextImageOptions {
  /**
   * 是否启用懒加载
   * @default true
   */
  enableLazyLoad?: boolean;
  /**
   * 是否启用模糊占位符
   * @default true
   */
  enableBlurPlaceholder?: boolean;
  /**
   * 自定义的低分辨率模糊占位符数据URL
   */
  blurDataUrl?: string;
  /**
   * 自定义图像尺寸映射，用于在没有明确尺寸时提供默认值
   */
  sizeMap?: Record<string, { width: number; height: number }>;
}

/**
 * 将普通图像组件或React元素转换为优化的Next.js Image组件
 * 
 * @param WrappedComponent 要包装的原始图像组件或元素
 * @param options 配置选项
 * @returns 包装后的组件
 * 
 * @example
 * ```tsx
 * // 包装一个自定义图像组件
 * const OptimizedCustomImage = withNextImage(CustomImage, {
 *   enableLazyLoad: true,
 *   enableBlurPlaceholder: true
 * });
 * 
 * // 使用包装后的组件
 * <OptimizedCustomImage src="/image.jpg" alt="示例" />
 * ```
 */
function withNextImage(
  WrappedComponent: ComponentType<any> | keyof JSX.IntrinsicElements,
  options: WithNextImageOptions = {}
): ComponentType<any> {
  const {
    enableLazyLoad = true,
    enableBlurPlaceholder = true,
    blurDataUrl,
    sizeMap = {}
  } = options;

  // 创建包装组件
  const NextImageWrapper: ComponentType<any> = (props) => {
    // 从props中提取相关属性
    const { src, alt, width, height, className, style, ...restProps } = props;

    // 如果提供了尺寸，使用它们；否则尝试从sizeMap中查找
    let imageWidth = width;
    let imageHeight = height;

    if (!imageWidth || !imageHeight && src && typeof src === 'string') {
      // 尝试从sizeMap中查找尺寸
      for (const [key, size] of Object.entries(sizeMap)) {
        if (src.includes(key)) {
          imageWidth = size.width;
          imageHeight = size.height;
          break;
        }
      }
    }

    // 检查是否有必要的属性
    if (!src || !alt) {
      console.warn('withNextImage: src and alt props are required for optimal image rendering');
    }

    // 如果没有明确的尺寸，设置默认值以避免布局偏移
    if (!imageWidth) imageWidth = 400;
    if (!imageHeight) imageHeight = 300;

    return (
      <Image
        src={src}
        alt={alt || 'Image'}
        width={imageWidth}
        height={imageHeight}
        className={className}
        style={style}
        lazyLoad={enableLazyLoad}
        placeholderType={enableBlurPlaceholder ? 'blur' : 'empty'}
        blurDataUrl={blurDataUrl}
        {...restProps}
      />
    );
  };

  // 保持原始组件的displayName以便调试
  NextImageWrapper.displayName = `withNextImage(${getDisplayName(WrappedComponent)})`;

  return NextImageWrapper;
}

/**
 * 获取组件的displayName
 */
function getDisplayName(component: ComponentType<any> | keyof JSX.IntrinsicElements): string {
  if (typeof component === 'string') {
    return component;
  }
  return component.displayName || component.name || 'Component';
}

export default withNextImage;
