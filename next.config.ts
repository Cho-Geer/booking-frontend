import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* 基础配置，不包含不支持的选项 */
    /* 
   * 启用 React 的新 JSX 转换（默认已开启）
   * https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
   */
  reactStrictMode: true,
  
  // 配置图像优化
  images: {
    // 支持的远程图像域名配置
    remotePatterns: [
      // 示例配置，实际项目中需要根据需求添加
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**', // 允许所有路径
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // 允许所有路径
      },
      // 可以添加更多需要支持的远程域名
    ],
    
    // 支持的图像格式
    formats: ['image/avif', 'image/webp'],
    
    // 响应式设备尺寸（单位：像素）
    // 这些尺寸用于生成响应式图像的不同版本
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // 图像尺寸（单位：像素）
    // 用于小于视口宽度的图像
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: 'http://localhost:3001/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
