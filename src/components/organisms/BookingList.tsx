/**
 * 预约列表组件
 * 展示如何使用TanStack Query进行数据获取和UI Context进行状态管理
 */
import React from 'react';
import { useBookings, useDeleteBooking, bookingApiUtils, BookingStatus } from '../../services/bookingApi';
import { useUI } from '../../contexts/UIContext';
import { useTheme } from '@/hooks/useTheme';
import { Button, Table, Tag, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
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
  const { isDark: isDarkTheme } = useTheme();
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

  React.useEffect(() => {
    setLoading(isLoading || isDeleting);
  }, [isLoading, isDeleting, setLoading]);

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
        showSuccess('预约删除成功');
      } catch (error) {
        showError('预约删除失败', error instanceof Error ? error.message : '未知错误');
      }
      return;
    }

    deleteBooking(id, {
      onSuccess: () => {
        showSuccess('预约删除成功');
      },
      onError: (error) => {
        showError('预约删除失败', error instanceof Error ? error.message : '未知错误');
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
        // 根据状态设置不同的标签颜色
        if (isDarkTheme) {
          // 深色主题下使用我们自定义的标签样式
          const statusClasses = {
            [BookingStatus.PENDING]: 'bg-warning-dark text-warning-light',
            [BookingStatus.CONFIRMED]: 'bg-secondary-dark text-secondary-light',
            [BookingStatus.CANCELLED]: 'bg-error-dark text-error-light',
            [BookingStatus.COMPLETED]: 'bg-info-dark text-info-light',
          };
          
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
              {bookingApiUtils.getStatusText(status)}
            </span>
          );
        }
        
        // 浅色主题下使用Ant Design的Tag颜色类型
        const colorMap: Record<BookingStatus, 'blue' | 'green' | 'orange' | 'red'> = {
          [BookingStatus.PENDING]: 'orange',
          [BookingStatus.CONFIRMED]: 'green',
          [BookingStatus.CANCELLED]: 'red',
          [BookingStatus.COMPLETED]: 'blue',
        };
        
        return (
          <Tag color={colorMap[status]}>
            {bookingApiUtils.getStatusText(status)}
          </Tag>
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
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewBooking(record.id)}
            loading={uiState.loading}
          >
            查看
          </Button>
          {showDeleteAction && (
            <Popconfirm
              title="确定要删除这个预约吗？"
              description="删除后将无法恢复"
              onConfirm={() => handleDeleteBooking(record.id)}
              okText="确定"
              cancelText="取消"
              disabled={isDeleting}
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                loading={isDeleting}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div id="booking-list-container" className={`booking-list-container p-4 rounded-lg shadow-sm ${isDarkTheme ? 'bg-background-dark' : 'bg-white'}`}>
      <div id="booking-list-header" className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-800'}`}>{title}</h2>
        <Button 
          type="primary"
          onClick={refreshBookings}
          loading={isLoading}
          className="bg-primary hover:bg-primary/90"
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
    </div>
  );
};

export default BookingList;
