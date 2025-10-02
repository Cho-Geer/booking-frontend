/**
 * 预约列表组件
 * 展示如何使用TanStack Query进行数据获取和UI Context进行状态管理
 */
import React from 'react';
import { useBookings, useDeleteBooking, bookingApiUtils, BookingStatus } from '../../services/bookingApi';
import { useUI } from '../../contexts/UIContext';
import { Button, Table, Tag, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Booking } from '../../types';

/**
 * 预约列表组件
 * @param props 组件属性
 * @param props.onViewBooking 查看预约详情回调
 */
const BookingList: React.FC<{
  onViewBooking?: (id: string) => void;
}> = ({ onViewBooking }) => {
  // 使用UI上下文获取状态管理和通知方法
  const { uiState, setLoading, showSuccess, showError, showInfo } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  
  // 使用TanStack Query Hook获取预约列表
  const { 
    data: bookings, 
    isLoading: isLoadingBookings, 
    refetch: refetchBookings,
    isError: isBookingsError,
    error: bookingsError
  } = useBookings();
  
  // 使用TanStack Query Hook进行删除预约操作 - useMutation返回的是isPending而不是isLoading
  const {
    mutate: deleteBooking,
    isPending: isDeletingBooking
  } = useDeleteBooking();

  // 监听预约列表加载状态并更新全局加载状态
  React.useEffect(() => {
    setLoading(isLoadingBookings || isDeletingBooking);
  }, [isLoadingBookings, isDeletingBooking, setLoading]);

  // 确保bookings类型安全的辅助函数
  const getSafeBookings = () => {
    if (!bookings || !Array.isArray(bookings)) return [];
    return bookings;
  };

  // 监听预约列表错误并显示错误通知
  React.useEffect(() => {
    if (isBookingsError && bookingsError) {
      showError('获取预约列表失败', bookingsError instanceof Error ? bookingsError.message : '未知错误');
    }
  }, [isBookingsError, bookingsError, showError]);

  /**
   * 处理删除预约
   * @param id 预约ID
   */
  const handleDeleteBooking = (id: string) => {
    deleteBooking(id, {
      onSuccess: () => {
        showSuccess('预约删除成功');
      },
      onError: (error) => {
        showError('预约删除失败', error instanceof Error ? error.message : '未知错误');
      }
    });
  };

  /**
   * 处理查看预约详情
   * @param id 预约ID
   */
  const handleViewBooking = (id: string) => {
    if (onViewBooking) {
      onViewBooking(id);
    } else {
      showInfo('查看预约详情', `预约ID: ${id}`);
    }
  };

  // 表格列定义 - 使用Booking类型
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
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => bookingApiUtils.formatBookingDate(text),
    },
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
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
          <Popconfirm
            title="确定要删除这个预约吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDeleteBooking(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={isDeletingBooking}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              loading={isDeletingBooking}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div id="booking-list-container" className={`booking-list-container p-4 rounded-lg shadow-sm ${isDarkTheme ? 'bg-background-dark' : 'bg-white'}`}>
      <div id="booking-list-header" className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-800'}`}>我的预约</h2>
        <Button 
          type="primary"
          onClick={() => refetchBookings()}
          loading={isLoadingBookings}
          className="bg-primary hover:bg-primary/90"
        >
          刷新列表
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={getSafeBookings()}
        rowKey="id"
        loading={isLoadingBookings}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        className={`booking-table ${isDarkTheme ? 'bg-background-dark-200' : ''}`}
        locale={{
          emptyText: isLoadingBookings ? '加载中...' : '暂无预约记录',
          filterConfirm: '确定',
          filterReset: '重置',
          // 移除不支持的emptyFilterText属性
        }}
      />
    </div>
  );
};

export default BookingList;