/**
 * 服务列表组件
 * 基于 EntityList 组件的服务管理专用组件
 */
import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { FlagTriangleRight, MessageSquareOff, Cog } from 'lucide-react';
import EntityList from '../molecules/EntityList';
import { useUI } from '../../contexts/UIContext';
import { Service } from '../../types';
import Button from '../atoms/Button';
import { Space, Popconfirm } from 'antd';

/**
 * 服务列表组件属性接口
 */
interface ServiceListProps {
  /** 服务数据列表 */
  services?: Service[];
  total?: number;
  page?: number;
  limit?: number;
  /** 加载状态 */
  isLoading?: boolean;
  /** 操作加载状态 */
  isMutating?: boolean;
  /** 列表标题 */
  title?: string;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 编辑服务回调 */
  onEditService?: (service: Service) => void;
  /** 切换服务状态回调 */
  onToggleServiceStatus?: (service: Service) => Promise<void> | void;
  /** 查看服务详情回调 */
  onViewService?: (id: string) => void;
  /** 分页变更回调 */
  onPaginationChange?: (page: number, limit: number) => void;
}

/**
 * 服务列表组件
 * @param props 组件属性
 */
const ServiceList: React.FC<ServiceListProps> = ({
  services,
  total,
  page,
  limit,
  isLoading = false,
  isMutating = false,
  title = '服务列表',
  onRefresh,
  onPaginationChange,
  onEditService,
  onToggleServiceStatus,
  onViewService,
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';

  /**
   * 获取状态标签样式
   * @param isActive 是否启用
   * @returns 样式类名
   */
  const getStatusClasses = React.useCallback((isActive: boolean) => {
    if (isDarkTheme) {
      return isActive
        ? 'bg-green-500/20 text-green-800 border border-green-500/30'
        : 'bg-red-500/20 text-red-300 border border-red-500/30';
    }
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }, [isDarkTheme]);

  /**
   * 表格列配置
   */
  const columns: ColumnsType<Service> = React.useMemo(
    () => [
      {
        title: '服务名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 200,
        filterSearch: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text: string) => (
          <span className="font-medium">{text}</span>
        ),
      },
      {
        title: '时长 (分钟)',
        dataIndex: 'durationMinutes',
        key: 'durationMinutes',
        width: 120,
        sorter: (a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0),
        render: (duration: number) => (
          <span className="font-mono">{duration}</span>
        ),
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        sorter: (a, b) => {
          const priceA = a.price ?? 0;
          const priceB = b.price ?? 0;
          return priceA - priceB;
        },
        render: (price: number | null | undefined) => (
          <span>{price != null ? `¥${price}` : '-'}</span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 100,
        filters: [
          { text: '启用', value: true },
          { text: '停用', value: false },
        ],
        onFilter: (value, record) => record.isActive === value,
        render: (isActive: boolean) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(isActive)}`}
          >
            {isActive ? '启用' : '停用'}
          </span>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        sorter: (a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        },
        render: (date: string | null | undefined) => {
          if (!date) return '-';
          const d = new Date(date);
          if (isNaN(d.getTime())) return '-';
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
        width: 120,
        fixed: 'right',
        render: (_: unknown, record: Service) => (
          <Space size="small">
            <Popconfirm
              title="确定要更新服务这个状态吗？"
              description="變更預約狀態為「启用」"
              onConfirm={() => onToggleServiceStatus?.(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                variant="secondary"
                icon={<FlagTriangleRight size="16" color={ record.isActive ? "gray" : "black"}/>}
                disabled={!!record.isActive}
                size="xxs"
                title='启用'
              />
            </Popconfirm>
            <Popconfirm
              title="确定要更新这个服务状态吗？"
              description="變更預約狀態為「停用」"
              onConfirm={() => onToggleServiceStatus?.(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                variant="primary"
                icon={<MessageSquareOff size="16" color={ record.isActive ? "black" : "gray"}/>}
                disabled={!record.isActive}
                size="xxs"
                title='停用'
              />
            </Popconfirm>
            <Button
              variant="secondary"
              icon={<Cog size="16" color="black"/>}
              onClick={() => onEditService?.(record)}
              size="xxs"
              title='编辑'
            />
          </Space>
        ),
      }
    ],
    [isDarkTheme, getStatusClasses]
  );

  return (
    <EntityList<Service>
      data={services}
      total={total}
      page={page}
      limit={limit}
      isLoading={isLoading}
      isDeleting={isMutating}
      title={title}
      columns={columns}
      onRefresh={onRefresh}
      onPaginationChange={onPaginationChange}
      getItemId={(item) => item.id}
      emptyText="暂无服务记录"
      loadingText="加载中..."
      // customActions={customActions}
    />
  );
};

ServiceList.displayName = 'ServiceList';

export default ServiceList;
