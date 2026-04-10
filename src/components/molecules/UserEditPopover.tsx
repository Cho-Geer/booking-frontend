/**
 * ユーザー編集ポップオーバーコンポーネント
 * ユーザータイプを変更するための Popover コンポーネント
 */
import React, { useState } from 'react';
import { Popover, Select, Button, Space } from 'antd';
import { useUI } from '@/contexts/UIContext';
import { User } from '@/types';

interface UserEditPopoverProps {
  /** 編集対象のユーザー */
  user: User;
  /** ユーザータイプ更新コールバック */
  onUpdateUserType: (userId: string, userType: 'customer' | 'admin') => Promise<void>;
  /** children（トリガーボタン） */
  children: React.ReactNode;
}

/**
 * ユーザー編集ポップオーバーコンポーネント
 * @param props コンポーネントプロパティ
 */
const UserEditPopover: React.FC<UserEditPopoverProps> = ({
  user,
  onUpdateUserType,
  children,
}) => {
  const { uiState, showSuccess, showError, showWarning } = useUI();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'admin'>(user.userType);

  const isDarkTheme = uiState.theme === 'dark';

  /**
   * 确定按钮点击时的处理
   */
  const handleConfirm = async () => {
    if (selectedUserType.toLowerCase() === user.userType.toLowerCase()) {
      showWarning('无变更', '用户类型未发生变更');
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onUpdateUserType(user.id, selectedUserType);
      showSuccess(
        '更新成功', 
        `用户 ${user.name} 的类型已变更为${selectedUserType === 'admin' ? '管理员' : '普通用户'}。\n已发送邮件通知。`
      );
      setOpen(false);
    } catch (error) {
      console.error('更新用户类型失败:', error);
      showError(
        '更新失败', 
        `用户类型更新失败：${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消按钮点击时的处理
   */
  const handleCancel = () => {
    setSelectedUserType(user.userType);
    setOpen(false);
  };

  /**
   * Popover 打开时的初始化
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSelectedUserType(user.userType);
    }
    setOpen(newOpen);
  };

  // カスタムスタイル（ダークモード対応）
  const root = {
      backgroundColor: '#1f2937',
      border: `1px solid ${isDarkTheme ? '#374151' : '#e5e7eb'}`,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)' ,
      fontWeight: 'bold',
    } as React.CSSProperties

  return (
    <Popover
      content={
        <div className="p-2" style={{ minWidth: '250px' }}>
          <div className="mb-3">
            <div className={`text-sm font-bold mb-2 text-gray-800`}>
              用户类型变更
            </div>
            <div className={`text-xs mb-3 text-gray-500`}>
              {user.name} ({user.email || user.phone})
            </div>
            
            <Select
              value={selectedUserType}
              onChange={(value: 'customer' | 'admin') => setSelectedUserType(value)}
              className="w-full"
              disabled={loading}
              options={[
                { label: '普通用户', value: 'customer' },
                { label: '管理员', value: 'admin' },
              ]}
              size="middle"
            />
          </div>
          
          <Space className="w-full justify-end gap-2">
            <Button
              onClick={handleCancel}
              disabled={loading}
              size="small"
              variant="filled"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              loading={loading}
              size="small"
              variant="dashed"
            >
              确定
            </Button>
          </Space>
        </div>
      }
      title={null}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      styles={{root,}}
      arrow={false}
    >
      {children}
    </Popover>
  );
};

export default UserEditPopover;
