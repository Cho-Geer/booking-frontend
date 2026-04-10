/**
 * 用户列表组件
 * 基于 EntityList 组件的用户管理专用组件
 */
import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import EntityList from '../molecules/EntityList';
import { useUI } from '../../contexts/UIContext';
import Button from '../atoms/Button';
import { User, Shield, Cog, FlagTriangleRight, MessageSquareOff, ShieldOff } from 'lucide-react';
import { Space } from 'antd';
import { User as AdminUser } from '@/types';
import { Popconfirm } from 'antd';
import UserEditPopover from '../molecules/UserEditPopover';


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
  onToggleUserStatus?: (user: AdminUser, status: string) => void;
  /** ユーザータイプ更新回调 */
  onUpdateUserType?: (userId: string, userType: 'customer' | 'admin') => Promise<void>;
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
  onEditUser,
  onToggleUserStatus,
  onUpdateUserType,
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
          return 'bg-green-500/20 text-green-800 border border-green-500/30';
        case 'inactive':
          return 'bg-yellow-500/20 text-yellow-800 border border-yellow-500/30';
        case 'blocked':
          return 'bg-red-500/20 text-red-800 border border-red-500/30';
        default:
          return 'bg-gray-500/20 text-gray-800 border border-gray-500/30';
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
        width: 'w-max',
        filterSearch: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
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
        width: 'w-max',
        filterSearch: true,
        render: (text: string) => (
          <span className="font-mono">{text}</span>
        ),
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 'w-max',
        sorter: (a, b) => a.email?.localeCompare(b.email || '') || 0 as number,
        render: (text: string, record: AdminUser) => (
          <span className="font-mono">{record.email}</span>
        ),
      },
      {
        title: '用户类型',
        dataIndex: 'userType',
        key: 'userType',
        width: 'w-max',
        filters: [
          { text: '管理员', value: 'ADMIN' },
          { text: '普通用户', value: 'USER' },
        ],
        onFilter: (value, record) => record.userType.toUpperCase() === String(value).toUpperCase(),
        sorter: (a, b) => a.userType.localeCompare(b.userType),
        render: (userType: string) => getUserTypeText(userType),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 'w-max',
        filters: [
          { text: 'active', value: 'ACTIVE' },
          { text: 'inactive', value: 'INACTIVE' },
          { text: 'blocked', value: 'BLOCKED' },
        ],
        onFilter: (value, record) => record.status.toUpperCase() === String(value).toUpperCase(),
        sorter: (a, b) => a.status.localeCompare(b.status),
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
        width: 'w-max',
        filters: [
          { text: '是', value: true },
          { text: '否', value: false },
        ],
        onFilter: (value, record) => record.isVerified === value,
        sorter: (a, b) => Number(b.isVerified) - Number(a.isVerified),
        render: (isVerified: boolean) => (
          isVerified ? '是' : '否'
        ),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 'w-max',
        sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
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
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 'w-max',
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
          <Space size="small">
            <Popconfirm
              title="确定要更新用户状态吗？"
              description="變更用戶狀態為「ACTIVE」"
              onConfirm={() => onToggleUserStatus?.(record, 'ACTIVE')}
              okText="确定"
              cancelText="取消"
            >
              <Button
                variant="secondary"
                icon={<FlagTriangleRight size="16" color={ record.status.toLowerCase() === 'active' ? "gray" : "black"}/>}
                disabled={record.status.toLowerCase() === 'active'}
                size="xxs"
                title='ACTIVE'
              />
            </Popconfirm>
            <Popconfirm
              title={<><div>该用户将导致：</div><div>1. 用户令牌失效</div><div>2. 相关预约被取消</div>确定继续？</>}
              description={`變更用戶狀態為\n\r「INACTIVE」`}
              onConfirm={() => onToggleUserStatus?.(record, 'INACTIVE')}
              okText="确定"
              cancelText="取消"
            >
              <Button
                variant="primary"
                icon={<ShieldOff size="16" color={ record.status.toLowerCase() === 'inactive' ? "gray" : "black"}/>}
                disabled={record.status.toLowerCase() === 'inactive'}
                size="xxs"
                title='INACTIVE'
              />
            </Popconfirm>
            <Popconfirm
              title={<><div>该用户将导致：</div><div>1. 用户令牌失效</div><div>2. 相关预约被取消</div>确定继续？</>}
              description="變更用戶狀態為「BLOCKED」"
              onConfirm={() => onToggleUserStatus?.(record, 'BLOCKED')}
              okText="确定"
              cancelText="取消"
            >
              <Button
                variant="primary"
                icon={<MessageSquareOff size="16" color={ record.status.toLowerCase() === 'blocked' ? "gray" : "black"}/>}
                disabled={record.status.toLowerCase() === 'blocked'}
                size="xxs"
                title='BLOCKED'
              />
            </Popconfirm>
            {onUpdateUserType && (
              <UserEditPopover
                user={record}
                onUpdateUserType={onUpdateUserType}
              >
                <Button
                  variant="secondary"
                  icon={<Cog size="16" color="black"/>}
                  size="xxs"
                  title='编辑用户类型'
                />
              </UserEditPopover>
            )}
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
      onEdit={onEditUser}
      getItemId={(item) => (item as AdminUser).id}
      emptyText="暂无用户记录"
      loadingText="加载中..."
    />
  );
};

UserList.displayName = 'UserList';

export default UserList;
