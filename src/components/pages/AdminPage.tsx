import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getBookings, updateBooking, clearError } from '@/store/bookingSlice';
import { useRouter } from 'next/router';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';
import BookingList from '@/components/organisms/AdminBookingList';
import ServiceList from '@/components/organisms/AdminServiceList';
import UserList from '@/components/organisms/AdminUserList';
import {
  CreateServicePayload,
  UpdateServicePayload,
} from '@/services/serviceApi';
import { Service, User } from '@/types';
import { ADMIN_TABS, DEFAULT_SERVICE_FORM, DEFAULT_USER_QUERY } from '@/constants';
import BookingDetailModal from '@/components/molecules/BookingDetailModal';
import { Booking, BookingStatus, AdminTab, ServiceRow } from '@/types';
import { setActiveTab, setEditingServiceId, setServiceForm, resetServiceForm, setBookingActionLoading, setGlobalRefreshLoading, setGlobalErrorMessage, clearGlobalErrorMessage } from '@/store/adminSlice';
import { fetchServices, createService, updateService, toggleServiceStatus } from '@/store/serviceSlice';
import { fetchAdminUsers, toggleUserStatus as toggleUserStatusAction, updateUserType as updateUserTypeAction } from '@/store/adminSlice';
import { clearUpdateSuccess } from '@/store/bookingSlice';
import { isBookingExpired } from '@/utils/timeUtils';
import Spinner from '@/components/atoms/Spinner';

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
  const { uiState, showInfo, showSuccess, showWarning, showError } = useUI();

  const { bookings, pagination, loading, error, updateSuccess } = useSelector((state: RootState) => state.booking);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { 
    activeTab, 
    editingServiceId, 
    serviceForm, 
    bookingActionLoading,
    globalRefreshLoading,
    globalErrorMessage,
    users,
    usersPagination,
    usersLoading,
    usersError,
  } = useSelector((state: RootState) => state.admin);
  
  const {
    services,
    pagination: servicesPagination,
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
    dispatch(fetchAdminUsers());
    dispatch(fetchServices());
  }, [dispatch]);

  // ActiveTab 切换时加载用户列表 - 已移除，避免重复刷新
  // ページネーション状態を保持するため、タブ切り替え時に再取得しない
    
  /**
   * タブ切り替え時にグローバルエラーメッセージをクリア
   */
  useEffect(() => {
    dispatch(clearGlobalErrorMessage());
    dispatch(clearError());
  }, [activeTab]);
   
  /**
   * 监听预约更新成功状态并显示通知
   */
  useEffect(() => {
    if (updateSuccess) {
      showSuccess('更新成功', '预约状态已更新');
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch, showSuccess]);

  /**
   * 重置服务表单
   */
  const handleResetServiceForm = () => {
    dispatch(resetServiceForm());
  };

  /**
   * 处理编辑服务 - サービスのステータスを変更する 启用/停用
   * @param serviceItem 要编辑的服务
   */
  const handleEditService = (serviceItem: ServiceRow) => {
    dispatch(setEditingServiceId(serviceItem.id));
    dispatch(setServiceForm({
      name: serviceItem.name,
      imageUrl: serviceItem.imageUrl || '',
      description: serviceItem.description || '',
      price: (serviceItem.price || '').toString(),
      durationMinutes: serviceItem.durationMinutes,
      isActive: serviceItem.isActive,
    }));
  };

  /**
   * 处理服务表单变化
   * @param key 表单字段
   * @param value 字段值
   */
  const handleServiceFormChange = (key: keyof CreateServicePayload, value: string | number | boolean) => {
    if (key === 'durationMinutes') {
      dispatch(setServiceForm({ [key]: Number(30) }));
    } else {
      dispatch(setServiceForm({ [key]: value }));
    }
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
          durationMinutes: Number(30),
          price: Number(serviceForm.price),
          imageUrl: serviceForm.imageUrl,
          isActive: Boolean(serviceForm.isActive),
          // displayOrder: Number(serviceForm.displayOrder),
        };
        await dispatch(updateService({ id: editingServiceId, payload: updatePayload })).unwrap();
        showSuccess('更新成功', '服务已更新');
      } else {
        await dispatch(createService({
          ...serviceForm,
          durationMinutes: Number(30),
          price: Number(serviceForm.price),
          // displayOrder: Number(serviceForm.displayOrder),
        })).unwrap();
        showSuccess('创建成功', '服务已创建');
      }
      dispatch(resetServiceForm());
      dispatch(fetchServices());
    } catch (error) {
      console.error('操作失败:', error);
      showError('操作失败', '请稍后重试');
    }
  };

  /**
   * 切换服务状态
   * @param serviceItem 服务项
   */
  const handleToggleServiceStatus = async (serviceItem: ServiceRow) => {
    try {
      await dispatch(toggleServiceStatus({ id: serviceItem.id, isActive: !serviceItem.isActive })).unwrap();
      
      // 服务禁用时预约被取消的通知
      if (!serviceItem.isActive) {
        showSuccess('操作成功', '服务已启用');
      } else {
        // 服务被禁用时，显示相关预约取消通知
        showWarning('操作完成', '服务已被禁用。相关预约已自动取消，邮件已发送。');
      }
      
      // 获取最新数据（初始化分页）
      await Promise.all([
        dispatch(getBookings({ page: 1, limit: 10 })).unwrap(),
        dispatch(fetchServices({ page: 1, limit: 10 })).unwrap(),
        dispatch(fetchAdminUsers({ page: 1, limit: 10 })).unwrap(),
      ]);
    } catch (error) {
      console.error('切换服务状态失败:', error);
      showError('操作失败', '请稍后重试');
    }
  };

  // 记录是否已经执行过重定向，防止重复重定向
  const hasRedirected = React.useRef(false);
  
  useEffect(() => {
    // 如果已经重定向过，不再处理
    if (hasRedirected.current) return;
    
    if (currentUser?.userType !== 'admin') {
      // 非管理员用户，清除认证数据并重定向到账户禁用页面
      if (typeof window !== 'undefined') {
        // 标记已重定向
        hasRedirected.current = true;
        
        // 清除浏览器存储
        sessionStorage.clear();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        
        // 存储账户禁用原因（角色变更）
        sessionStorage.setItem('accountDisabledReason', 'ROLE_CHANGED_FROM_ADMIN');
        
        // 重定向到账户禁用页面，使用 window.location.href 确保完全刷新
        window.location.href = '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN';
      }
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
   * 刷新全部数据（ページネーション初期化）
   */
  const refreshAll = async () => {
    // 设置全局加载状态
    dispatch(setGlobalRefreshLoading(true));
    try {
      // 并行执行所有刷新操作，并初始化ページネーション（page=1, limit=10）
      await Promise.all([
        dispatch(getBookings({ page: 1, limit: 10 })).unwrap(),
        dispatch(fetchServices({ page: 1, limit: 10 })).unwrap(),
        dispatch(fetchAdminUsers({ page: 1, limit: 10 })).unwrap(),
      ]);
    } catch (error) {
      console.error('刷新全部数据失败:', error);
      showError('刷新失败', '请稍后重试');
    } finally {
      // 清除全局加载状态
      dispatch(setGlobalRefreshLoading(false));
    }
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
    // 从预约列表中找到对应 ID 的预约记录
    const booking = bookings.find(b => b.id === bookingId) || null;
    try {
      if (booking) {
        // 检查预约时间是否已经过去        
        if (isBookingExpired(booking.appointmentDate, booking.startTime)) {
          showWarning('操作失败', '预约时间已经过去，无法更新状态');
          dispatch(setBookingActionLoading(false));
          return;
        }
        // 更新预约状态
        await dispatch(updateBooking({ id: bookingId, status })).unwrap();
        // 刷新预约列表，传递当前的分页参数
        dispatch(getBookings({ page: pagination.page, limit: pagination.limit }));
      }
    } catch (error) {
      console.error('更新预约状态失败:', error);
      console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
        
      // サービスが無効化されている場合のエラーハンドリング
      const errorMessage = (error as Error).name === 'Error' ? (error as Error).message : '';
      if (errorMessage.includes('服务已被禁用') || 
          errorMessage.includes('サービスが無効化されている') || 
          errorMessage.includes('无法更新')) {
        // 1. ポップアップ通知（詳細メッセージ + 予約番号）
        showWarning('更新不可', `相关服务已被禁用，无法更新预约。\n预约编号：${booking?.appointmentNumber || '不明'}`);
        
        // 2. グローバルエラーメッセージ（予約番号付き）
        dispatch(setGlobalErrorMessage(`预约 ${booking?.appointmentNumber || '不明'} 更新失败：相关服务已被禁用`));
      } else {
        showError('更新失败', '请稍后重试');
      }
    } finally {
      dispatch(setBookingActionLoading(false));
    }
  };

  // 用戶管理
  const handleToggleUserStatus = async (user: User, newStatus: string) => {
    dispatch(setBookingActionLoading(true));
    try {
      // ユーザー状態を更新
      await dispatch(toggleUserStatusAction({ id: user.id, status: newStatus })).unwrap();
      
      // 成功通知
      const statusMap: Record<string, string> = {
        'ACTIVE': '启用',
        'INACTIVE': '停用',
        'BLOCKED': '封禁',
      };
      showSuccess('状态更新成功', `用户 ${user.name} 已${statusMap[newStatus] || '更新'}`);
      
    } catch (error) {
      console.error('更新用户状态失败:', error);
      showError('更新失败', '请稍后重试');
    } finally {
      dispatch(setBookingActionLoading(false));
    }
  };

  /**
   * 处理查看用戶详情
   * @param recordId 
   */
  const handleViewUser = (recordId: string) => {
    setSelectedUser(recordId);
    setIsUserDetailModalOpen(true);
  };

  /**
   * 更新用户类型的处理程序
   * @param userId 用户 ID
   * @param userType 新的用户类型
   */
  const handleUpdateUserType = async (userId: string, userType: 'customer' | 'admin') => {
    dispatch(setBookingActionLoading(true));
    try {
      // 分发 Redux action
      await dispatch(updateUserTypeAction({ id: userId, userType: userType.toUpperCase() as 'CUSTOMER' | 'ADMIN' })).unwrap();
      
      // 成功通知（已发送邮件）
      showSuccess(
        '更新成功',
        `用户类型已更新。\n由于角色变更，令牌可能会失效，相关预约可能会被取消。`
      );
    } catch (error) {
      console.error('更新用户类型失败:', error);
      showError(
        '更新失败',
        `用户类型更新失败：${error instanceof Error ? error.message : '未知错误'}`
      );
      throw error; // 用于 UserEditPopover 的错误处理
    } finally {
      dispatch(setBookingActionLoading(false));
    }
  };

  /**
   * 处理分页变化（预约管理）
   * @param page 页码
   * @param pageSize 每页数量
   */
  const handlePaginationChange = (page: number, pageSize: number) => {
    dispatch(getBookings({ page, limit: pageSize }));
  };

  /**
   * 处理分页变化（服务管理）
   * @param page 页码
   * @param pageSize 每页数量
   */
  const handleServicesPaginationChange = (page: number, pageSize: number) => {
    dispatch(fetchServices({ page, limit: pageSize }));
  };

  /**
   * 处理分页变化（用户管理）
   * @param page 页码
   * @param pageSize 每页数量
   */
  const handleUsersPaginationChange = (page: number, pageSize: number) => {
    dispatch(fetchAdminUsers({ page, limit: pageSize }));
  };

  /**
   * 刷新服务列表（ページネーション初期化）
   */
  const refreshServices = async () => {
    dispatch(setGlobalRefreshLoading(true));
    try {
      // ページネーションを初期化（page=1, limit=10）
      await dispatch(fetchServices({ page: 1, limit: 10 })).unwrap();
      showSuccess('刷新成功', '服务列表已刷新');
    } catch (error) {
      console.error('刷新服务列表失败:', error);
      showError('刷新失败', '请稍后重试');
    } finally {
      dispatch(setGlobalRefreshLoading(false));
    }
  };

  /**
   * 刷新用户列表（ページネーション初期化）
   */
  const refreshUsers = async () => {
    dispatch(setGlobalRefreshLoading(true));
    try {
      // ページネーションを初期化（page=1, limit=10）
      await dispatch(fetchAdminUsers({ page: 1, limit: 10 })).unwrap();
      showSuccess('刷新成功', '用户列表已刷新');
    } catch (error) {
      console.error('刷新用户列表失败:', error);
      showError('刷新失败', '请稍后重试');
    } finally {
      dispatch(setGlobalRefreshLoading(false));
    }
  };

  /**
   * 刷新预约列表（ページネーション初期化）
   */
  const refreshBookings = async () => {
    dispatch(setGlobalRefreshLoading(true));
    try {
      // ページネーションを初期化（page=1, limit=10）
      await dispatch(getBookings({ page: 1, limit: 10 })).unwrap();
      showSuccess('刷新成功', '预约列表已刷新');
    } catch (error) {
      console.error('刷新预约列表失败:', error);
      showError('刷新失败', '请稍后重试');
    } finally {
      dispatch(setGlobalRefreshLoading(false));
    }
  };

  // 非管理员用户不显示任何内容，useEffect 会处理重定向
  if (!isAdmin) {
    return null; // 不渲染任何内容，等待重定向
  }

  return (
    <div id="admin-bookings-container" className={`h-[scal(100vh-16px)] py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto scorllbar-hide ${bgColorClass} flex flex-col`}>
      <div id="admin-bookings-header" className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-6 bg-opacity-95" style={{ backgroundColor: uiState.theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${textColorClass}`}>管理控制台</h1>
          <Button
            variant="primary"
            onClick={refreshAll}
            isLoading={globalRefreshLoading}
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
                  onRefresh={refreshBookings}
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
                      value={30}
                      readOnly={true}
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
                    {!editingServiceId && <div className="md:col-span-2 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={serviceForm.isActive} 
                        onChange={(event) => handleServiceFormChange('isActive', event.target.checked)} 
                        className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600"
                      />
                      <span className={textColorClass}>启用服务</span>
                    </div>}
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
                    total={servicesPagination.total}
                    page={servicesPagination.page}
                    limit={servicesPagination.limit}
                    isLoading={servicesLoading}
                    isMutating={servicesCreating || servicesUpdating}
                    title="服务列表"
                    onRefresh={refreshServices}
                    onPaginationChange={handleServicesPaginationChange}
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
                  total={usersPagination.total}
                  page={usersPagination.page}
                  limit={usersPagination.limit}
                  isLoading={usersLoading}
                  title="用户列表"
                  onRefresh={refreshUsers}
                  onPaginationChange={handleUsersPaginationChange}
                  onViewUser={handleViewUser}
                  onToggleUserStatus={handleToggleUserStatus}
                  onUpdateUserType={handleUpdateUserType}
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
