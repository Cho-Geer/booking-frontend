/**
 * 分子组件：通知容器
 * 用于管理和显示所有通知消息
 * 
 * @component
 */
import React from 'react';
import { useUI } from '@/contexts/UIContext';
import NotificationItem from '../atoms/NotificationItem';

/**
 * 通知容器组件
 * 显示在页面右上角，自动管理通知的显示和消失
 */
const NotificationContainer: React.FC = () => {
  const { uiState, removeNotification } = useUI();
  const { notifications } = uiState;

  // 移动端：全宽显示，最多显示 3 条
  // 桌面端：固定宽度，最多显示 5 条
  const maxNotifications = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 5;
  
  // 只显示最新的 N 条通知
  const visibleNotifications = notifications.slice(-maxNotifications);

  return (
    <>
      {/* 全局样式定义 - 动画效果 */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-slide-out-right {
          animation: slideOutRight 0.3s ease-out forwards;
        }
      `}</style>

      {/* 
        通知容器位置：
        - 固定在右上角
        - 在导航栏下方（导航栏 z-index: 9999）
        - z-index: 10000（高于内容，低于模态框）
      */}
      <div
        className="fixed top-20 right-4 z-[10000] space-y-2 pointer-events-none"
        aria-live="polite"
        aria-label="通知"
      >
        {/* 
          通知列表
          每个通知都可以独立交互（pointer-events-auto）
        */}
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
          >
            <NotificationItem
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationContainer;
