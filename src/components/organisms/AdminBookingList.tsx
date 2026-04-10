/**
 * 预约列表组件
 * 展示如何使用TanStack Query进行数据获取和UI Context进行状态管理
 */
'use client'
import React from 'react';
import { Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FlagTriangleRight, Disc, MessageSquareOff } from 'lucide-react';
import { BookingStatus, Booking } from '@/types';
import { formatBookingDate } from '@/utils/timeUtils';
import { useUI } from '@/contexts/UIContext';
import { Button } from '@/components/atoms';
import EntityList from '../molecules/EntityList';

/**
 * 预约列表组件
 * @param props 组件属性
 * @param props.onViewBooking 查看预约详情回调
 */
type BookingListProps = {
  bookings?: Booking[];
  total?: number;
  page?: number;
  limit?: number;
  isLoading?: boolean;
  isDeleting?: boolean;
  title?: string;
  onRefresh?: () => void;
  onDeleteBooking?: (id: string) => Promise<void> | void;
  onViewBooking?: (id: string) => void;
  onUpdateBookingStatus?: (id: string, status: BookingStatus) => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  showDeleteAction?: boolean;
};

const BookingList: React.FC<BookingListProps> = ({
  bookings: externalBookings,
  total: externalTotal,
  page: externalPage,
  limit: externalLimit,
  isLoading: externalLoading,
  isDeleting: externalDeleting,
  title = '预约管理',
  onRefresh,
  onViewBooking,
  onUpdateBookingStatus,
  onPaginationChange,
}) => {

  const columns: ColumnsType<Booking> = [
    {
      title: '预约编号',
      dataIndex: 'appointmentNumber',
      key: 'appointmentNumber',
      ellipsis: true,
      width: 140,
      filterSearch: true,
      render: (text, record) => (
        <span
          className="text-primary font-medium hover:underline cursor-pointer"
          onClick={() => onViewBooking?.(record.id)}
        >
          {text}
        </span>
      ),
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
      filterSearch: true,
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: '客户电话',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 140,
      filterSearch: true,
      render: (text) => <span className="font-mono">{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '待确认', value: 'PENDING' },
        { text: '已确认', value: 'CONFIRMED' },
        { text: '已取消', value: 'CANCELLED' },
        { text: '已完成', value: 'COMPLETED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        // 状态样式（直接用字符串匹配，避免枚举报错）
        const statusClasses = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          CONFIRMED: 'bg-green-100 text-green-800',
          CANCELLED: 'bg-red-100 text-red-800',
          COMPLETED: 'bg-blue-100 text-blue-800',
        };

        // 状态文字
        const statusText = {
          PENDING: '待确认',
          CONFIRMED: '已确认',
          CANCELLED: '已取消',
          COMPLETED: '已完成',
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as BookingStatus]}`}>
            {statusText[status as BookingStatus]}
          </span>
        );
      },
    },
    // ======================
    // ✅ 修复：服务名称（嵌套对象写法）
    // ======================
    {
      title: '服务名称',
      dataIndex: ['service', 'name'], // ✅ 正确写法！
      key: 'serviceName',
      width: 150,
      ellipsis: true,
      filterSearch: true,
      sorter: (a, b) => {
        const nameA = a.service?.name || '';
        const nameB = b.service?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: '预约日期',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      width: 120,
      sorter: (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(),
      render: (text) => formatBookingDate(text),
    },
    {
      title: '时间段',
      key: 'timeSlot',
      width: 140,
      render: (_, record) => {
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text) => formatBookingDate(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 'w-max',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="确定要更新这个预约状态吗？"
            description="變更預約狀態為「已確認」"
            onConfirm={() => onUpdateBookingStatus?.(record.id, BookingStatus.CONFIRMED)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              variant={record.status === 'CONFIRMED' ? "danger" : "secondary"}
              disabled={record.status === 'CONFIRMED'}
              icon={<FlagTriangleRight size="16" color={record.status === 'CONFIRMED' ? "gray" : "black"}/>}
              size="xxs"
              title="已確認"
            />
          </Popconfirm>
          <Popconfirm
            title="确定要更新这个预约状态吗？"
            description="變更預約狀態為「待確認」"
            onConfirm={() => onUpdateBookingStatus?.(record.id, BookingStatus.PENDING)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              variant={record.status === BookingStatus.PENDING ? "danger" : "secondary"}
              disabled={record.status === BookingStatus.PENDING}
              icon={<Disc size="16" color={record.status === BookingStatus.PENDING ? "gray" : "black"}/>}
              size="xxs"
              title="待確認"
            />
          </Popconfirm>
          <Popconfirm
            title="确定要取消这个预约吗？"
            description="變更預約狀態為「已取消」"
            onConfirm={() => onUpdateBookingStatus?.(record.id, BookingStatus.CANCELLED)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              variant={record.status === BookingStatus.CANCELLED ? "danger" : "primary"}
              disabled={record.status === BookingStatus.CANCELLED}
              icon={<MessageSquareOff size="16" color={record.status === BookingStatus.CANCELLED ? "gray" : "black"}/>} 
              size="xxs" 
              title="已取消" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { uiState, setLoading } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const useExternalData = Array.isArray(externalBookings);

  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    limit: 10
  });

  const isLoading = externalLoading ?? false;
  const isDeleting = externalDeleting ?? false;

  const loading = React.useMemo(() => {
    return isLoading || isDeleting;
  }, [isLoading, isDeleting]);

  React.useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  React.useEffect(() => {
      setPagination({
        total: externalTotal || 0,
        page: externalPage || 1,
        limit: externalLimit || 10
      });
  }, [useExternalData, externalTotal, externalPage, externalLimit]);
  
  return (
    <EntityList<Booking>
      data={externalBookings}
      total={externalTotal}
      page={externalPage}
      limit={externalLimit}
      isLoading={externalLoading}
      isDeleting={externalDeleting}
      title={title}
      columns={columns}
      onRefresh={onRefresh}
      onPaginationChange={onPaginationChange}
      getItemId={(item) => (item as Booking).id}
      emptyText="暂无预约记录"
      loadingText="加载中..."
    />
  );
};

BookingList.displayName = 'BookingList';

export default BookingList;
