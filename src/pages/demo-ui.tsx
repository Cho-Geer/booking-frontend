import React from 'react';
import AppLayout from '@/components/templates/AppLayout';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';

/**
 * UI Context演示页面
 * 用于测试UIContext的功能，包括主题切换和侧边栏控制
 * 
 * @component
 */
const UIDemoPage: React.FC = () => {
  const { uiState, setSidebarOpen } = useUI();
  
  // 实现切换侧边栏的功能
  const toggleSidebar = () => {
    setSidebarOpen(!uiState.sidebarOpen);
  };

  return (
    <AppLayout isLoggedIn={true} onLogout={() => console.log('logout')} username="测试用户">
      <div id="demo-page-container" className="p-6">
        <h1 className={`text-2xl font-bold mb-6 ${uiState.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          UI Context演示
        </h1>
        
        <div id="demo-grid" className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* 侧边栏信息卡片 */}
          <div id="sidebar-status-card" className={`p-6 rounded-lg shadow ${uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${uiState.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              侧边栏状态
            </h2>
            <p className={`mb-4 ${uiState.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              侧边栏开启: <span className="font-mono">{uiState.sidebarOpen ? '是' : '否'}</span>
            </p>
            <Button variant="secondary" onClick={toggleSidebar}>
              切换侧边栏
            </Button>
          </div>
        </div>
        
        {/* 使用说明 */}
        <div id="usage-instructions-card" className={`mt-8 p-6 rounded-lg shadow ${uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${uiState.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            使用说明
          </h2>
          <ul className={`list-disc pl-5 space-y-2 ${uiState.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>点击上方&quot;切换侧边栏&quot;按钮可切换侧边栏状态</li>
            </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default UIDemoPage;