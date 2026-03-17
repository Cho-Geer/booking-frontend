/**
 * 通用实体列表组件
 * 基于 BookingList.tsx 提取的通用列表组件
 * 支持配置化展示不同实体的列表
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Table, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Trash2, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/atoms';
import { useUI } from '../../contexts/UIContext';
import { object } from 'zod';
import { BookingStatus } from '@/types';

/**
 * 通用实体列表组件属性接口
 * @template T 实体类型
 */
interface EntityListProps<T extends object> {
  /** 实体数据列表 */
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
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
  onEditStatus?: (itemId: string, bookingStatus: BookingStatus) => void;
  onPaginationChange?: (page: number, limit: number) => void;
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

type EntityListComponent = <T extends object>(props: EntityListProps<T>) => ReactNode;

/**
 * 通用实体列表组件
 * @param props 组件属性
 * @template T 实体类型
 */
const EntityListImp: EntityListComponent = <T extends object>({
  data: externalData,
  isLoading = false,
  title = '实体列表',
  total,
  page,
  limit,
  columns,
  onRefresh,
  onDelete,
  onView,
  onEdit,
  onPaginationChange,
  getItemId,
  emptyText = '暂无数据记录',
  loadingText = '加载中...',
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
        columns={columns}
        dataSource={externalData}
        rowKey={getItemId}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: onPaginationChange || undefined,
        }}
        className={`booking-table ${isDarkTheme ? 'bg-gray-100' : ''}`}
        locale={{
          emptyText: isLoading ? loadingText : emptyText,
          filterConfirm: '确定',
          filterReset: '重置',
        }}
        scroll={{ x: 'max-content', y: '50vh' }}
      />
    </motion.div>
  );
};

// 4. 使用 React.memo 并指定类型
const EntityList = React.memo(EntityListImp) as EntityListComponent;
export default EntityList;
