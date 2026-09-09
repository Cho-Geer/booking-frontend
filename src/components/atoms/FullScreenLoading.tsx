import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface FullScreenLoadingProps {
  /** 主提示文本 */
  message?: string;
  /** 次要提示文本 */
  subMessage?: string;
}

/**
 * 原子组件：全屏加载遮罩
 * 无状态的纯展示组件，覆盖整个视口并提供加载动画与可选文案。
 * 不感知认证、路由与数据获取逻辑。
 *
 * @component
 * @example
 * // 仅展示动画
 * <FullScreenLoading />
 *
 * // 带文案
 * <FullScreenLoading message="加载中..." />
 */
const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ message, subMessage }) => {
  const { isDark: isDarkTheme } = useTheme();

  const borderColor = isDarkTheme ? 'border-white' : 'border-primary';
  const textColor = isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900';
  const subTextColor = isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500';

  return (
    <div
      id="full-screen-loading"
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${borderColor}`}
          role="status"
          aria-label="loading"
        ></div>
        {message && <p className={`text-lg font-medium ${textColor}`}>{message}</p>}
        {subMessage && <p className={`text-sm ${subTextColor}`}>{subMessage}</p>}
      </div>
    </div>
  );
};

export default FullScreenLoading;
