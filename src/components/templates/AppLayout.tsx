import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/compat/router';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import Spinner from '@/components/atoms/Spinner';
import ThemeToggle from '@/components/atoms/ThemeToggle';
import NotificationContainer from '@/components/molecules/NotificationContainer';
import { useUI } from '@/contexts/UIContext';


interface AppLayoutProps {
  children: ReactNode;
  isLoggedIn: boolean;
  onLogout: () => void;
  username?: string;
  userType?: string;
}

/**
 * 模板组件：应用布局
 * 提供应用的主布局结构，包括顶部导航栏和主要内容区域
 * 使用UIContext管理主题和其他UI状态
 * 
 * @component
 * @example
 * <AppLayout isLoggedIn={true} onLogout={() => console.log("logout")} username="John">
 *   <div>页面内容</div>
 * </AppLayout>
 */
const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  isLoggedIn, 
  onLogout,
  username,
  userType
}) => {
  const router = useRouter();
  const { uiState, toggleTheme, closeModal } = useUI();
  
  // 导航项配置
  const navItems = [
    { name: '首页', path: '/' },
    { name: '预约', path: '/bookings' },
  ];

  /**
   * 管理员导航项配置
   */
  const adminNavItems = [
    { name: '首页', path: '/' },
    { name: '管理控制台', path: '/admin/bookings' },
  ];

  // 根据主题设置背景色类名
  const bgColorClass = uiState.theme === 'dark' ? 'bg-background-dark' : 'bg-gray-50';

  // 根据用户类型选择导航项
  const userNavItems = (userType as string)?.toLowerCase() === 'admin' ? adminNavItems : navItems;

  return (
    <div id="app-layout-container" className={`h-screen ${bgColorClass}`}>
      {/* 顶部导航栏 */}
      <nav className={`fixed z-[9999] w-full shadow-sm border-b ${uiState.theme === 'dark' ? 'bg-background-dark text-text-dark-primary border-border-dark' : 'bg-white'}`}>
        <div id="nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="nav-content" className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className={`text-xl font-bold ${uiState.theme === 'dark' ? 'text-primary/90' : 'text-primary'}`}>预约系统</h1>
              </div>
              <div id="nav-items" className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {userNavItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === item.path
                        ? uiState.theme === 'dark' 
                          ? 'border-primary text-text-dark-primary' 
                          : 'border-primary text-gray-900'
                        : uiState.theme === 'dark'
                          ? 'border-transparent text-text-dark-secondary hover:border-primary/50 hover:text-text-dark-primary'
                          : 'border-transparent text-gray-500 hover:border-primary/50 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div id="nav-user-actions" className="flex items-center space-x-4">
              {/* 主题切换按钮 */}
              <ThemeToggle />
              
              {isLoggedIn ? (
                <div id="user-info-container" className="flex items-center space-x-4">
                  <span className={`text-sm ${uiState.theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}`}>欢迎, {username}</span>
                  <Button variant="ghost" onClick={onLogout}>
                    登出
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <Link href="/login">
                    <Button id='login-button' variant="primary">登录</Button>
                  </Link>
                  <Link href="/register">
                    <Button id='register-button' variant="primary">注册</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main>
        <div id="main-content-wrapper" className="py-6 pt-16">
          <div id="main-content-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>

      {/* 全局模态框 - 使用 UIContext 的 modal 状态 */}
      <Modal
        open={uiState.modal.open}
        title={uiState.modal.title}
        onClose={closeModal}
        footer={uiState.modal.footer}
        size={uiState.modal.width === undefined || typeof uiState.modal.width === 'string' ? undefined : uiState.modal.width >= 600 ? 'lg' : 'sm'}
      >
        {uiState.modal.content}
      </Modal>

      {/* 全局加载指示器 */}
      {uiState.loading && (
        <Spinner text="正在处理，请稍候..." global size="lg" />
      )}

      {/* 全局通知容器 - 显示所有通知消息 */}
      <NotificationContainer />
    </div>
  );
};

export default AppLayout;
