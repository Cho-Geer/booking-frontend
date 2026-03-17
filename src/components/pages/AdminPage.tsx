import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getBookings, updateBooking } from '@/store/bookingSlice';
import { useRouter } from 'next/router';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';
import BookingList from '@/components/organisms/BookingList';
import ServiceList from '@/components/organisms/ServiceList';
import UserList from '@/components/organisms/UserList';
import {
  CreateServicePayload,
  UpdateServicePayload,
} from '@/services/serviceApi';
import { Service, User } from '@/types';
import { ADMIN_TABS, DEFAULT_SERVICE_FORM, DEFAULT_USER_QUERY } from '@/constants';
import BookingDetailModal from '@/components/molecules/BookingDetailModal';
import { Booking, BookingStatus, AdminTab, ServiceRow } from '@/types';
import { setActiveTab, setEditingServiceId, setServiceForm, resetServiceForm, setBookingActionLoading } from '@/store/adminSlice';
import { fetchServices, createService, updateService, toggleServiceStatus } from '@/store/serviceSlice';
import { fetchAdminUsers } from '@/store/adminSlice';
import { isBookingExpired } from '@/utils/timeUtils';

/**
 * 管理控制台状态类型定义
 */
type AdminState = {
  activeTab: AdminTab;
  editingServiceId: string | null;
  serviceForm: CreateServicePayload;
  bookingActionLoading: boolean;
};

/**
 * 验证 URL 格式是否有效
 * @param url 待验证的 URL 字符串
 * @returns URL 是否有效
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 页面组件：管理员控制台
 * 提供预约、服务、用户的统一管理能力
 * 
 * @component
 */
const AdminBookingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { uiState, showInfo } = useUI();

  const { bookings, pagination, loading, error } = useSelector((state: RootState) => state.booking);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { 
    activeTab, 
    editingServiceId, 
    serviceForm, 
    bookingActionLoading,
    users,
    usersLoading,
    usersError,
  } = useSelector((state: RootState) => state.admin);
  
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    creating: servicesCreating,
    updating: servicesUpdating,
  } = useSelector((state: RootState) => state.service);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isUserDetailModalOpen , setIsUserDetailModalOpen] =  useState(false);

  // 加载服务列表
  useEffect(() => {
    dispatch(getBookings());
    dispatch(fetchAdminUsers({ ...DEFAULT_USER_QUERY }));
    dispatch(fetchServices());
  }, [dispatch]);

  // ActiveTab 切换时加载用户列表
  useEffect(() => {
    if (activeTab === 'users') {
      dispatch(fetchAdminUsers({ ...DEFAULT_USER_QUERY }));
      
    }
  }, [dispatch, activeTab]);
  useEffect(() => {
    if (activeTab === 'users') {
      dispatch(fetchAdminUsers({ ...DEFAULT_USER_QUERY }));
    }
  }, [activeTab]);

  /**
   * 重置服务表单
   */
  const handleResetServiceForm = () => {
    dispatch(resetServiceForm());
  };

  /**
   * 处理编辑服务
   * @param serviceItem 要编辑的服务
   */
  const handleEditService = (serviceItem: ServiceRow) => {
    dispatch(setEditingServiceId(serviceItem.id));
    dispatch(setServiceForm({
      name: serviceItem.name,
      imageUrl: serviceItem.imageUrl || '',
      description: serviceItem.description || '',
      price: (serviceItem.price || 0).toString(),
    }));
  };

  /**
   * 处理服务表单变化
   * @param key 表单字段
   * @param value 字段值
   */
  const handleServiceFormChange = (key: keyof CreateServicePayload, value: string | number | boolean) => {
    dispatch(setServiceForm({ [key]: value }));
  };

  /**
   * 提交服务表单
   */
  const submitService = async () => {
    if (!serviceForm.name) {
      return;
    }
    if (!serviceForm.imageUrl) {
      return;
    }
    if (!isValidUrl(serviceForm.imageUrl)) {
      return;
    }
    
    try {
      if (editingServiceId) {
        const updatePayload: UpdateServicePayload = {
          name: serviceForm.name,
          description: serviceForm.description,
          durationMinutes: Number(serviceForm.durationMinutes),
          price: Number(serviceForm.price),
          imageUrl: serviceForm.imageUrl,
          isActive: Boolean(serviceForm.isActive),
          // displayOrder: Number(serviceForm.displayOrder),
        };
        await dispatch(updateService({ id: editingServiceId, payload: updatePayload })).unwrap();
        showInfo('更新成功', '服务已更新');
      } else {
        await dispatch(createService({
          ...serviceForm,
          durationMinutes: Number(serviceForm.durationMinutes),
          price: Number(serviceForm.price),
          // displayOrder: Number(serviceForm.displayOrder),
        })).unwrap();
        showInfo('创建成功', '服务已创建');
      }
      dispatch(resetServiceForm());
      dispatch(fetchServices());
    } catch (error) {
      console.error('操作失败:', error);
      showInfo('操作失败', '请稍后重试');
    }
  };

  /**
   * 切换服务状态
   * @param serviceItem 服务项
   */
  const handleToggleServiceStatus = async (serviceItem: ServiceRow) => {
    try {
      await dispatch(toggleServiceStatus({ id: serviceItem.id, isActive: !serviceItem.isActive })).unwrap();
      showInfo('操作成功', `服务已${serviceItem.isActive ? '停用' : '启用'}`);
    } catch (error) {
      console.error('切换服务状态失败:', error);
      showInfo('操作失败', '请稍后重试');
    }
  };

  useEffect(() => {
    if (currentUser?.userType !== 'admin') {
      router.push('/');
    } else {
      setIsAdmin(true);
      dispatch(getBookings());
    }
  }, [currentUser, dispatch, router]);

  const bgColorClass = uiState.theme === 'dark' ? 'dark:bg-gray-900' : 'bg-gray-50';
  const textColorClass = uiState.theme === 'dark' ? 'dark:text-white' : 'text-gray-900';
  const cardBgClass = uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white';
  const mutedTextColorClass = uiState.theme === 'dark' ? 'dark:text-gray-400' : 'text-gray-500';
  const errorBoxClass = uiState.theme === 'dark' ? 'dark:bg-red-900 dark:border-red-700' : 'bg-red-50 border-red-200';

  const tabItems = useMemo(() => ADMIN_TABS, []);
  const memoBookings = useMemo(() => bookings, [bookings.map((booking) => booking.id)]);
  const memoPagination = useMemo(() => pagination, [pagination]);

  /**
   * 刷新全部数据
   */
  const refreshAll = () => {
    dispatch(getBookings());
    dispatch(fetchServices());
    dispatch(fetchAdminUsers({ ...DEFAULT_USER_QUERY }));
  };

  /**
   * 处理查看预约详情
   * @param bookingId 预约 ID
   */
  const handleViewBooking = (bookingId: string) => {
    // 从预约列表中找到对应 ID 的预约记录
    const booking = bookings.find(b => b.id === bookingId) || null;
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
    } else {
      showInfo('查看预约详情', `预约ID: ${bookingId}`);
    }
  };

  /**
   * 处理确认预约状态
   * @param bookingId 预约 ID
   */
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    dispatch(setBookingActionLoading(true));
    try {
      // 从预约列表中找到对应 ID 的预约记录
      const booking = bookings.find(b => b.id === bookingId) || null;
      if (booking) {
        // 检查预约时间是否已经过去        
        if (isBookingExpired(booking.appointmentDate, booking.startTime)) {
          showInfo('操作失败', '预约时间已经过去，无法更新状态');
        } else {
          // 更新预约状态
          dispatch(updateBooking({ id: bookingId, status })).unwrap();
          showInfo('更新成功', '预约状态已更新');
          // 刷新预约列表，传递当前的分页参数
          dispatch(getBookings({ page: pagination.page, limit: pagination.limit }));
        }
      }
    } catch (error) {
      console.error('更新预约状态失败:', error);
      showInfo('更新失败', '请稍后重试');
    } finally {
      dispatch(setBookingActionLoading(false));
    }
  }

  // 用戶管理
  /**
   * 处理查看用戶详情
   * @param recordId 
   */
  const handleViewUser = (recordId: string) => {
    setSelectedUser(recordId);
    setIsUserDetailModalOpen(true);
  }

  /**
   * 处理分页变化
   * @param page 页码
   * @param pageSize 每页数量
   */
  const handlePaginationChange = (page: number, pageSize: number) => {
    dispatch(getBookings({ page, limit: pageSize }));
  };

  if (!isAdmin) {
    return (
      <div className={`min-h-screen ${bgColorClass} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${textColorClass}`}>访问被拒绝</h1>
          <p className={mutedTextColorClass}>
            只有管理员可以访问此页面。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-bookings-container" className={`min-h-screen ${bgColorClass} flex flex-col`} style={{ height: '100vh' }}>
      <div id="admin-bookings-header" className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-6 bg-opacity-95" style={{ backgroundColor: uiState.theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${textColorClass}`}>管理控制台</h1>
          <Button
            variant="primary"
            onClick={refreshAll}
            disabled={loading || usersLoading || servicesLoading}
            isLoading={loading || usersLoading || servicesLoading}
          >
            刷新全部
          </Button>
        </div>
      </div>

      <div id="admin-bookings-tabs" className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 border-b" style={{ borderColor: uiState.theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          {tabItems.map((tabItem: typeof ADMIN_TABS[number]) => (
            <Button
              key={tabItem.key}
              variant={activeTab === tabItem.key ? 'primary' : 'secondary'}
              onClick={() => dispatch(setActiveTab(tabItem.key))}
            >
              {tabItem.label}
            </Button>
          ))}
        </div>
      </div>

      <div id="admin-bookings-content" className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {(error || usersError || servicesError) && (
            <div id="admin-console-error" className={`flex-shrink-0 ${errorBoxClass} border rounded-md p-4 mb-6`}>
              {error && <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{error}</p>}
              {usersError && <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{usersError}</p>}
              {servicesError && <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{servicesError}</p>}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {activeTab === 'bookings' && (
              <div className="h-full flex flex-col">
                <BookingList
                  title="预约管理"
                  bookings={memoBookings}
                  total= {memoPagination.total}
                  page= {memoPagination.page}
                  limit= {memoPagination.limit}
                  isLoading={loading}
                  isDeleting={bookingActionLoading}
                  onRefresh={() => dispatch(getBookings())}
                  onViewBooking={handleViewBooking}
                  onUpdateBookingStatus={handleUpdateBookingStatus}
                  onPaginationChange={handlePaginationChange}
                />
              </div>
            )}

            {activeTab === 'services' && (
              <div className="h-full flex flex-col gap-6">
                <Card className={`flex-shrink-0 p-6 ${cardBgClass}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      value={serviceForm.name}
                      onChange={(event) => handleServiceFormChange('name', event.target.value)}
                      placeholder="服务名称"
                      className={`px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      value={serviceForm.imageUrl}
                      onChange={(event) => handleServiceFormChange('imageUrl', event.target.value)}
                      placeholder="图片地址"
                      className={`px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="number"
                      value={serviceForm.durationMinutes}
                      onChange={(event) => handleServiceFormChange('durationMinutes', Number(event.target.value))}
                      placeholder="时长 (分钟)"
                      className={`px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(event) => handleServiceFormChange('price', Number(event.target.value))}
                      placeholder="价格"
                      className={`px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <div className="flex items-center gap-2">
                      <label className={textColorClass}>启用</label>
                      <input
                        type="checkbox"
                        checked={Boolean(serviceForm.isActive)}
                        onChange={(event) => handleServiceFormChange('isActive', event.target.checked)}
                      />
                    </div>
                    <textarea
                      value={serviceForm.description}
                      onChange={(event) => handleServiceFormChange('description', event.target.value)}
                      placeholder="服务描述"
                      className={`md:col-span-2 px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <div className="md:col-span-2 flex gap-2">
                      <Button variant="primary" onClick={submitService} isLoading={servicesCreating || servicesUpdating}>
                        {editingServiceId ? '更新服务' : '新增服务'}
                      </Button>
                      <Button variant="secondary" onClick={handleResetServiceForm} disabled={servicesCreating || servicesUpdating}>
                        重置
                      </Button>
                    </div>
                  </div>
                </Card>
                <div className="flex-1 overflow-hidden">
                  <ServiceList
                    services={services}
                    isLoading={servicesLoading}
                    isMutating={servicesCreating || servicesUpdating}
                    title="服务列表"
                    onRefresh={() => dispatch(fetchServices())}
                    onEditService={handleEditService}
                    onToggleServiceStatus={handleToggleServiceStatus}
                  />
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="h-full flex flex-col">
                <UserList
                  users={users}
                  total= {memoPagination.total}
                  page= {memoPagination.page}
                  limit= {memoPagination.limit}
                  isLoading={usersLoading}
                  title="用户列表"
                  onRefresh={() => dispatch(fetchAdminUsers({ ...DEFAULT_USER_QUERY }))}
                  onPaginationChange={handlePaginationChange}
                  onViewUser={handleViewUser}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 预约详情模态框 */}
      <BookingDetailModal
        open={isDetailModalOpen}
        booking={selectedBooking}
        onClose={() => setIsDetailModalOpen(false)}
        isAdmin={isAdmin}
      /> 
    </div>
  );
};

export default AdminBookingsPage;
