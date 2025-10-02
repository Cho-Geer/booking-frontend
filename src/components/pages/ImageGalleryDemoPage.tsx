import React from 'react';
import Image from '../atoms/Image';
import withNextImage from '../hoc/withNextImage';

/**
 * Image组件演示页面
 * 展示如何使用优化的Next.js Image组件在不同场景下的应用
 */
const ImageGalleryDemoPage: React.FC = () => {
  // 示例：使用withNextImage包装一个简单的img标签
  const OptimizedImgTag = withNextImage('img', {
    enableLazyLoad: true,
    enableBlurPlaceholder: true,
    sizeMap: {
      'placeholder': { width: 300, height: 200 }
    }
  });

  // 低分辨率占位符数据URL（10x10的灰色渐变SVG）
  const blurPlaceholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+CjxmaWx0ZXIgaWQ9Im5vaXNlIj4KPGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjA1IiBudW1PY3RhdmVzPSIyIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIi8+CjwvZmlsdGVyPgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Image组件演示</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">基本用法</h2>
          <div className="space-y-4">
            {/* 本地图像 - 从public目录加载 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">本地图像</h3>
              <Image
                src="/next.svg"
                alt="Next.js Logo"
                width={300}
                height={100}
                className="mx-auto"
                placeholderType="empty" // 对于SVG图像，使用empty占位符
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                从public目录加载的SVG图像，自动优化
              </p>
            </div>
            
            {/* 远程图像 - 需要在next.config.ts中配置remotePatterns */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">远程图像</h3>
              <Image
                src="https://picsum.photos/300/200"
                alt="远程示例图像"
                width={300}
                height={200}
                className="mx-auto object-cover"
                placeholderType="blur"
                blurDataUrl={blurPlaceholder}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                远程图像，带模糊占位符（实际使用时需配置next.config.ts）
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">高级特性</h2>
          <div className="space-y-4">
            {/* 响应式图像 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">响应式图像</h3>
              <Image
                src="/globe.svg"
                alt="响应式地球图标"
                width={400}
                height={400}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{
                  width: '100%',
                  height: 'auto',
                }}
                className="mx-auto"
                placeholderType="empty" // 对于SVG图像，使用empty占位符
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                响应式SVG图像，根据视口大小自动调整
              </p>
            </div>
            
            {/* 懒加载图像 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">懒加载图像</h3>
              <Image
                src="/window.svg"
                alt="窗口图标"
                width={200}
                height={200}
                className="mx-auto"
                lazyLoad={true}
                placeholderType="empty" // 对于SVG图像，使用empty占位符
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                懒加载SVG图像，仅在进入视口时加载
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">迁移示例</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">使用withNextImage高阶组件</h3>
          
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">优化普通img标签</h4>
            <div className="flex flex-wrap gap-4">
              {/* 使用withNextImage包装的img标签 */}
              <OptimizedImgTag 
                src="/file.svg"
                alt="文件图标"
                className="w-32 h-32 object-contain"
              />
              <OptimizedImgTag 
                src="/vercel.svg"
                alt="Vercel图标"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <h4 className="text-md font-medium mb-2">代码示例：</h4>
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`// 导入高阶组件
import withNextImage from 'components/hoc/withNextImage';

// 包装普通img标签
const OptimizedImgTag = withNextImage('img', {
  enableLazyLoad: true,
  enableBlurPlaceholder: true,
  sizeMap: {
    'placeholder': { width: 300, height: 200 }
  }
});

// 使用优化后的组件
<OptimizedImgTag 
  src="/file.svg"
  alt="文件图标"
  className="w-32 h-32 object-contain"
/>`}
            </pre>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">错误处理</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">图像加载失败处理</h3>
          
          {/* 错误处理示例 - 无效的图像URL */}
          <div className="flex justify-center">
            <Image
              src="/non-existent-image.jpg"
              alt="不存在的图像"
              width={300}
              height={200}
              className="object-cover"
              fallback={
                <div className="bg-gray-200 dark:bg-gray-700 w-full h-full rounded flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">图像加载失败</span>
                </div>
              }
            />
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 mt-4 rounded">
            <h4 className="text-md font-medium mb-2">代码示例：</h4>
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`<Image
  src="/non-existent-image.jpg"
  alt="不存在的图像"
  width={300}
  height={200}
  className="object-cover"
  fallback={
    <div className="bg-gray-200 dark:bg-gray-700 w-full h-full rounded flex items-center justify-center">
      <span className="text-gray-500 dark:text-gray-400">图像加载失败</span>
    </div>
  }
/>`}
            </pre>
          </div>
        </div>
      </section>
      
      <footer className="text-center text-gray-500 text-sm">
        <p>Image组件演示页面 - 展示Next.js图像优化的最佳实践</p>
        <p className="mt-2">更多详情请查看文档: docs/integration/01-Image组件集成指南.md</p>
      </footer>
    </div>
  );
};

export default ImageGalleryDemoPage;
