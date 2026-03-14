/**
 * 通用实体列表组件
 * 基于 BookingList.tsx 提取的通用列表组件
 * 支持配置化展示不同实体的列表
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Table, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Trash2, Eye, Edit3 } from 'lucide-react';
import Button from '../atoms/Button';
import { useUI } from '../../contexts/UIContext';

/**
 * 通用实体列表组件属性接口
 * @template T 实体类型
 */
interface EntityListProps<T> {
  /** 实体数据列表 */
  data?: T[];
  /** 加载状态 */
  isLoading?: boolean;
  /** 删除操作加载状态 */
  isDeleting?: boolean;
  /** 列表标题 */
  title?: string;
  /** 表格列配置 */
  columns: ColumnsType<T>;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 删除实体回调 */
  onDelete?: (id: string) => Promise<void> | void;
  /** 查看实体详情回调 */
  onView?: (id: string) => void;
  /** 编辑实体回调 */
  onEdit?: (item: T) => void;
  /** 是否显示删除操作 */
  showDeleteAction?: boolean;
  /** 是否显示编辑操作 */
  showEditAction?: boolean;
  /** 是否显示查看操作 */
  showViewAction?: boolean;
  /** 获取实体ID的方法 */
  getItemId: (item: T) => string;
  /** 空数据提示文本 */
  emptyText?: string;
  /** 加载中提示文本 */
  loadingText?: string;
  /** 自定义操作列 */
  customActions?: (item: T) => React.ReactNode;
}

/**
 * 通用实体列表组件
 * @param props 组件属性
 * @template T 实体类型
 */
const EntityList = <T extends object>({
  data: externalData,
  isLoading = false,
  isDeleting = false,
  title = '实体列表',
  columns,
  onRefresh,
  onDelete,
  onView,
  onEdit,
  showDeleteAction = true,
  showEditAction = false,
  showViewAction = true,
  getItemId,
  emptyText = '暂无数据记录',
  loadingText = '加载中...',
  customActions,
}: EntityListProps<T>) => {
  const { uiState, showSuccess, showError } = useUI();
  const isDarkTheme = uiState.theme === 'dark';

  /**
   * 处理删除操作
   * @param item 要删除的实体
   */
  const handleDelete = React.useCallback(async (item: T) => {
    if (!onDelete) return;
    
    try {
      await Promise.resolve(onDelete(getItemId(item)));
      showSuccess('删除成功');
    } catch (error) {
      showError('删除失败', error instanceof Error ? error.message : '未知错误');
    }
  }, [onDelete, getItemId, showSuccess, showError]);

  /**
   * 处理查看操作
   * @param item 要查看的实体
   */
  const handleView = React.useCallback((item: T) => {
    if (onView) {
      onView(getItemId(item));
    }
  }, [onView, getItemId]);

  /**
   * 处理编辑操作
   * @param item 要编辑的实体
   */
  const handleEdit = React.useCallback((item: T) => {
    if (onEdit) {
      onEdit(item);
    }
  }, [onEdit]);

  /**
   * 合并用户配置的列和操作列
   */
  const mergedColumns: ColumnsType<T> = React.useMemo(() => {
    const result = [...columns];
    
    // 添加操作列
    if (showViewAction || showEditAction || showDeleteAction || customActions) {
      result.push({
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right',
        render: (_: unknown, record: T) => (
          <Space size="middle">
            {customActions ? (
              customActions(record)
            ) : (
              <>
                {showViewAction && (
                  <Button
                    variant="ghost"
                    icon={Eye}
                    onClick={() => handleView(record)}
                    size="sm"
                  >
                    查看
                  </Button>
                )}
                {showEditAction && (
                  <Button
                    variant="secondary"
                    icon={Edit3}
                    onClick={() => handleEdit(record)}
                    size="sm"
                  >
                    编辑
                  </Button>
                )}
                {showDeleteAction && onDelete && (
                  <Popconfirm
                    title="确定要删除吗？"
                    description="删除后将无法恢复"
                    onConfirm={() => handleDelete(record)}
                    okText="确定"
                    cancelText="取消"
                    disabled={isDeleting}
                  >
                    <Button
                      variant="danger"
                      icon={Trash2}
                      isLoading={isDeleting}
                      size="sm"
                    >
                      删除
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}
          </Space>
        ),
      });
    }
    
    return result;
  }, [columns, showViewAction, showEditAction, showDeleteAction, customActions, isDeleting, handleView, handleEdit, handleDelete, onDelete]);

  return (
    <motion.div
      id="entity-list-container"
      className={`entity-list-container p-4 rounded-lg shadow-sm ${isDarkTheme ? 'bg-background-dark' : 'bg-white'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div id="entity-list-header" className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-800'}`}>
          {title}
        </h2>
        {onRefresh && (
          <Button
            variant="primary"
            onClick={onRefresh}
            isLoading={isLoading}
          >
            刷新列表
          </Button>
        )}
      </div>

      <Table
        columns={mergedColumns}
        dataSource={externalData}
        rowKey={getItemId}
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        className={`entity-table ${isDarkTheme ? 'bg-background-dark-200' : ''}`}
        locale={{
          emptyText: isLoading ? loadingText : emptyText,
          filterConfirm: '确定',
          filterReset: '重置',
        }}
        scroll={{ x: 'max-content' }}
      />
    </motion.div>
  );
};

EntityList.displayName = 'EntityList';

export default EntityList;
