/**
 * 服务列表组件
 * 基于 EntityList 组件的服务管理专用组件
 */
import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Power, ZapOff } from 'lucide-react';
import EntityList from '../molecules/EntityList';
import { useUI } from '../../contexts/UIContext';
import { Service } from '../../types';
import Button from '../atoms/Button';
import { Space } from 'antd';

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
        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
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
        render: (text: string) => (
          <span className="font-medium">{text}</span>
        ),
      },
      {
        title: '时长(分钟)',
        dataIndex: 'durationMinutes',
        key: 'durationMinutes',
        width: 120,
        render: (duration: number) => (
          <span className="font-mono">{duration}</span>
        ),
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        render: (price: number | undefined) => (
          <span>{price !== undefined ? `¥${price}` : '-'}</span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 100,
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
        render: (_: unknown, record: Service) => (
          <Space size="middle">
            <Button
              variant="secondary"
              onClick={() => onEditService?.(record)}
              size="sm"
              title='编辑'
            />
          </Space>
        ),
      }
    ],
    [isDarkTheme, getStatusClasses]
  );

  /**
   * 自定义操作列
   * @param service 服务实体
   * @returns 操作按钮组
   */
  const customActions = (service: Service) => (
    <>
      {onViewService && (
        <Button
          variant="ghost"
          onClick={() => onViewService(service.id)}
          size="sm"
        >
          查看
        </Button>
      )}
      {onEditService && (
        <Button
          variant="secondary"
          onClick={() => onEditService(service)}
          isLoading={isMutating}
          size="sm"
        >
          编辑
        </Button>
      )}
      {onToggleServiceStatus && (
        <Button
          variant={service.isActive ? 'danger' : 'primary'}
          icon={service.isActive ? ZapOff : Power}
          onClick={() => onToggleServiceStatus(service)}
          isLoading={isMutating}
          size="sm"
        >
          {service.isActive ? '停用' : '启用'}
        </Button>
      )}
    </>
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
      customActions={customActions}
    />
  );
};

ServiceList.displayName = 'ServiceList';

export default ServiceList;
