import React from 'react';
import NextImage, { ImageProps } from 'next/image';

/**
 * 优化的Image组件，基于Next.js Image组件实现
 * 提供自动图像优化、响应式布局、懒加载和错误处理等高级特性
 */
interface OptimizedImageProps extends Omit<ImageProps, 'loader' | 'unoptimized'> {
  /**
   * 控制图像是否应该在视口中可见时才加载
   * @default true
   */
  lazyLoad?: boolean;
  /**
   * 定义加载状态时的占位符类型
   * 'blur' - 显示模糊的低分辨率占位符
   * 'empty' - 显示空占位符
   * @default 'blur'
   */
  placeholderType?: 'blur' | 'empty';
  /**
   * 用于模糊占位符的低分辨率图像数据URL
   */
  blurDataUrl?: string;
  /**
   * 自定义图像加载错误时显示的内容
   */
  fallback?: React.ReactNode;
}

/**
 * 优化的图片组件，封装了Next.js的Image组件，提供更好的性能和用户体验
 * 
 * @example
 * ```tsx
 * <Image
 *   src="/logo.png"
 *   alt="公司Logo"
 *   width={200}
 *   height={100}
 *   className="object-contain"
 * />
 * ```
 * 
 * @example
 * ```tsx
 * <Image
 *   src="https://example.com/photo.jpg"
 *   alt="风景照片"
 *   width={800}
 *   height={600}
 *   lazyLoad={true}
 *   placeholderType="blur"
 *   blurDataUrl="data:image/svg+xml;base64,..."
 * />
 * ```
 */
const Image: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  lazyLoad = true,
  placeholderType = 'blur',
  blurDataUrl,
  fallback,
  ...rest
}) => {
  // 处理图像加载错误的状态
  const [hasError, setHasError] = React.useState(false);

  // 对于远程图像，需要确保添加到next.config.js的images.remotePatterns中
  // 这里使用Next.js的自动优化，无需自定义loader

  // 如果图像加载出错，显示回退内容
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // 如果图像加载出错且没有提供回退内容，显示一个简单的错误占位符
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className || ''}`}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-500 dark:text-gray-400">图像加载失败</span>
      </div>
    );
  }

  // 处理SVG图像和缺少blurDataUrl的情况
  // Next.js的blur占位符功能对SVG图像支持有限
  // 当使用SVG图像或没有提供blurDataUrl时，自动禁用blur占位符
  const effectivePlaceholderType = (
    placeholderType === 'blur' && 
    blurDataUrl && 
    !src.toString().endsWith('.svg')
  ) ? 'blur' : 'empty';

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={lazyLoad ? 'lazy' : 'eager'}
      placeholder={effectivePlaceholderType}
      blurDataURL={blurDataUrl}
      onError={() => setHasError(true)}
      // 启用自动图像优化
      unoptimized={false}
      // 支持现代图像格式
      priority={!lazyLoad}
      {...rest}
    />
  );
};

export default Image;
