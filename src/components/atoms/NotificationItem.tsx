/**
 * 原子组件：通知项
 * 用于显示单个通知消息
 * 
 * @component
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Notification } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

/**
 * 通知项组件
 * @param notification 通知数据
 * @param onClose 关闭回调
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const { isDark: isDarkTheme } = useTheme();
  
  // 根据通知类型设置图标和样式
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // 根据主题设置背景色
  const bgColorClass = isDarkTheme
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const textColorClass = isDarkTheme
    ? 'text-text-dark-primary'
    : 'text-gray-900';

  const descriptionColorClass = isDarkTheme
    ? 'text-text-dark-secondary'
    : 'text-gray-500';

  // 自动关闭定时器
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onClose]);

  // 处理手动关闭
  const handleClose = () => {
    onClose(notification.id);
  };

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 rounded-lg border p-4 shadow-lg
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl
        ${bgColorClass}
        animate-slide-in-right
      `}
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {/* 图标 */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {notification.message && (
          <p className={`text-sm font-semibold ${textColorClass}`}>
            {notification.message}
          </p>
        )}
        {notification.description && (
          <p className={`mt-1 text-sm ${descriptionColorClass}`}>
            {notification.description}
          </p>
        )}
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className={`
          flex-shrink-0 p-1 rounded-md
          transition-colors duration-200
          ${isDarkTheme 
            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}
        `}
        aria-label="关闭通知"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationItem;
