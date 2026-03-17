/**
 * 用户列表组件
 * 基于 EntityList 组件的用户管理专用组件
 */
import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import EntityList from '../molecules/EntityList';
import { useUI } from '../../contexts/UIContext';
import Button from '../atoms/Button';
import { User, Shield, Eye } from 'lucide-react';
import { Space } from 'antd';
import { User as AdminUser } from '@/types';

/**
 * 用户列表组件属性接口
 */
interface UserListProps {
  /** 用户数据列表 */
  users?: AdminUser[];
  total?: number;
  page?: number;
  limit?: number;
  /** 加载状态 */
  isLoading?: boolean;
  /** 列表标题 */
  title?: string;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 查看用户详情回调 */
  onViewUser?: (id: string) => void;
  /** 编辑用户回调 */
  onEditUser?: (user: AdminUser) => void;
  /** 删除用户回调 */
  onDeleteUser?: (id: string) => Promise<void> | void;
  /** 分页变更回调 */
  onPaginationChange?: (page: number, limit: number) => void;
  /** 删除操作加载状态 */
  isDeleting?: boolean;
}

/**
 * 用户列表组件
 * @param props 组件属性
 */
const UserList: React.FC<UserListProps> = ({
  users,
  total,
  page,
  limit,
  isLoading = false,
  title = '用户列表',
  onRefresh,
  onPaginationChange,
  onViewUser,
  onEditUser,
  onDeleteUser,
  isDeleting = false,
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';

  /**
   * 获取用户类型文本
   * @param userType 用户类型
   * @returns 用户类型显示文本
   */
  const getUserTypeText = (userType: string) => {
    if (userType === 'ADMIN' || userType === 'admin') {
      return '管理员';
    }
    return '普通用户';
  };

  /**
   * 获取状态标签样式
   * @param status 用户状态
   * @returns 样式类名
   */
  const getStatusClasses = React.useCallback((status: string) => {
    const lowerStatus = status.toLowerCase();
    if (isDarkTheme) {
      switch (lowerStatus) {
        case 'active':
          return 'bg-green-500/20 text-green-300 border border-green-500/30';
        case 'inactive':
          return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        case 'blocked':
          return 'bg-red-500/20 text-red-300 border border-red-500/30';
        default:
          return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      }
    }
    switch (lowerStatus) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [isDarkTheme]);

  /**
   * 获取用户类型图标样式
   * @param userType 用户类型
   * @returns 图标组件
   */
  const getUserTypeIcon = React.useCallback((userType: string) => {
    if (userType === 'ADMIN' || userType === 'admin') {
      return <Shield className="w-4 h-4 inline mr-1" />;
    }
    return <User className="w-4 h-4 inline mr-1" />;
  }, []);

  /**
   * 表格列配置
   */
  const columns: ColumnsType<AdminUser> = React.useMemo(
    () => [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 120,
        render: (text: string, record: AdminUser) => (
          <span className="font-medium flex items-center">
            {getUserTypeIcon(record.userType)}
            {text}
          </span>
        ),
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        key: 'phone',
        width: 140,
        render: (text: string) => (
          <span className="font-mono">{text}</span>
        ),
      },
      {
        title: '用户类型',
        dataIndex: 'userType',
        key: 'userType',
        width: 100,
        render: (userType: string) => getUserTypeText(userType),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(status)}`}
          >
            {status}
          </span>
        ),
      },
      {
        title: '已验证',
        dataIndex: 'isVerified',
        key: 'isVerified',
        width: 100,
        render: (isVerified: boolean) => (
          isVerified ? '是' : '否'
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (date: string) => {
          const d = new Date(date);
          return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 'w-max',
        fixed: 'right',
        render: (_: unknown, record: AdminUser) => (
          <Space size="middle">
            <Button
              variant="ghost"
              icon={<Eye />}
              onClick={() => {onViewUser?.(record.id)}}
              size="sm"
              title='查看'
            />
            <Button
              variant="secondary"
              onClick={() => onEditUser?.(record)}
              size="sm"
              title='编辑'
            />
          </Space>
        ),
      }
    ],
    [isDarkTheme, getStatusClasses, getUserTypeIcon]
  );

  return (
    <EntityList<AdminUser>
      data={users}
      total={total}
      page={page}
      limit={limit}
      isLoading={isLoading}
      isDeleting={isDeleting}
      title={title}
      columns={columns}
      onRefresh={onRefresh}
      onPaginationChange={onPaginationChange}
      // onDelete={onDeleteUser}
      onView={onViewUser}
      onEdit={onEditUser}
      getItemId={(item) => (item as AdminUser).id}
      emptyText="暂无用户记录"
      loadingText="加载中..."
    />
  );
};

UserList.displayName = 'UserList';

export default UserList;
