/**
 * 预约列表组件
 * 展示如何使用TanStack Query进行数据获取和UI Context进行状态管理
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useBookings, useDeleteBooking, bookingApiUtils, BookingStatus } from '../../services/bookingApi';
import { useUI } from '../../contexts/UIContext';
import { Table, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Trash2, Eye } from 'lucide-react';
import Button from '../atoms/Button';
import { Booking } from '../../types';

/**
 * 预约列表组件
 * @param props 组件属性
 * @param props.onViewBooking 查看预约详情回调
 */
type BookingListProps = {
  bookings?: Booking[];
  isLoading?: boolean;
  isDeleting?: boolean;
  title?: string;
  onRefresh?: () => void;
  onDeleteBooking?: (id: string) => Promise<void> | void;
  onViewBooking?: (id: string) => void;
  showDeleteAction?: boolean;
};

const BookingList: React.FC<BookingListProps> = ({
  bookings: externalBookings,
  isLoading: externalLoading,
  isDeleting: externalDeleting,
  title = '我的预约',
  onRefresh,
  onDeleteBooking,
  onViewBooking,
  showDeleteAction = true,
}) => {
  const { uiState, setLoading, showSuccess, showError, showInfo } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const useExternalData = Array.isArray(externalBookings);

  const { 
    data: queryBookings, 
    isLoading: isLoadingBookings, 
    refetch: refetchBookings,
    isError: isBookingsError,
    error: bookingsError
  } = useBookings({
    enabled: !useExternalData,
  });

  const {
    mutate: deleteBooking,
    isPending: isDeletingBooking
  } = useDeleteBooking();

  const isLoading = externalLoading ?? isLoadingBookings;
  const isDeleting = externalDeleting ?? isDeletingBooking;

  const loading = React.useMemo(() => {
    return isLoading || isDeleting;
  }, [isLoading, isDeleting]);

  React.useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const tableBookings = React.useMemo(() => {
    if (useExternalData) {
      return externalBookings || [];
    }
    if (!queryBookings || !Array.isArray(queryBookings)) {
      return [];
    }
    return queryBookings;
  }, [useExternalData, externalBookings, queryBookings]);

  React.useEffect(() => {
    if (isBookingsError && bookingsError) {
      showError('获取预约列表失败', bookingsError instanceof Error ? bookingsError.message : '未知错误');
    }
  }, [isBookingsError, bookingsError, showError]);

  const refreshBookings = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    refetchBookings();
  };

  const handleDeleteBooking = async (id: string) => {
    if (onDeleteBooking) {
      try {
        await Promise.resolve(onDeleteBooking(id));
        showSuccess('预约取消成功');
      } catch (error) {
        showError('预约取消失败', error instanceof Error ? error.message : '未知错误');
      }
      return;
    }

    deleteBooking(id, {
      onSuccess: () => {
        showSuccess('预约取消成功');
      },
      onError: (error) => {
        showError('预约取消失败', error instanceof Error ? error.message : '未知错误');
      },
    });
  };

  const handleViewBooking = (id: string) => {
    if (onViewBooking) {
      onViewBooking(id);
    } else {
      showInfo('查看预约详情', `预约ID: ${id}`);
    }
  };

  const columns: ColumnsType<Booking> = [
    {
      title: '预约编号',
      dataIndex: 'appointmentNumber',
      key: 'appointmentNumber',
      ellipsis: true,
      render: (text: string, record: Booking) => (
        <span className="text-primary font-medium hover:underline cursor-pointer" onClick={() => handleViewBooking(record.id)}>
          {text}
        </span>
      ),
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '客户电话',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      render: (text: string) => (
        <span className="font-mono">{text}</span>
      ),
    },
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: '预约日期',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (text: string) => bookingApiUtils.formatBookingDate(text),
    },
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      render: (_: unknown, record: Booking) => {
        if (record.startTime && record.endTime) {
          return `${record.startTime} - ${record.endTime}`;
        }
        if (record.timeSlot?.slotTime) {
          return record.timeSlot.slotTime.slice(0, 5);
        }
        return '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: BookingStatus) => {
        // 使用统一的标签样式，在深色和浅色主题下保持一致
        const statusClasses = {
          [BookingStatus.PENDING]: isDarkTheme 
            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
            : 'bg-yellow-100 text-yellow-800',
          [BookingStatus.CONFIRMED]: isDarkTheme 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-green-100 text-green-800',
          [BookingStatus.CANCELLED]: isDarkTheme 
            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
            : 'bg-red-100 text-red-800',
          [BookingStatus.COMPLETED]: isDarkTheme 
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
            : 'bg-blue-100 text-blue-800',
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
            {bookingApiUtils.getStatusText(status)}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => bookingApiUtils.formatBookingDate(text),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Booking) => (
        <Space size="middle">
          <Button 
            variant="ghost" 
            icon={Eye} 
            onClick={() => handleViewBooking(record.id)}
            isLoading={uiState.loading}
            size="sm"
          >
            查看
          </Button>
          {showDeleteAction && (
            <Popconfirm
              title="确定要取消这个预约吗？"
              description="取消后将无法恢复"
              onConfirm={() => handleDeleteBooking(record.id)}
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
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <motion.div 
      id="booking-list-container" 
      className={`booking-list-container p-4 rounded-lg shadow-sm ${isDarkTheme ? 'bg-background-dark' : 'bg-white'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div id="booking-list-header" className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-800'}`}>{title}</h2>
        <Button 
          variant="primary"
          onClick={refreshBookings}
          isLoading={isLoading}
        >
          刷新列表
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={tableBookings}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        className={`booking-table ${isDarkTheme ? 'bg-background-dark-200' : ''}`}
        locale={{
          emptyText: isLoading ? '加载中...' : '暂无预约记录',
          filterConfirm: '确定',
          filterReset: '重置',
        }}
      />
    </motion.div>
  );
};

export default BookingList;
