import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getBookings } from '@/store/bookingSlice';
import { useRouter } from 'next/router';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';
import { withAuth } from '@/components/hoc/withAuth';
import { withAdmin } from '@/components/hoc/withAdmin';
import BookingList from '@/components/organisms/BookingList';
import {
  adminConsoleService,
  AdminUser,
  CreateAdminServicePayload,
  UpdateAdminServicePayload,
} from '@/services/adminConsoleService';
import { Service } from '@/types';
import { bookingService } from '@/services/bookingService';

type AdminTab = 'bookings' | 'services' | 'users';

type ServiceRow = Service & {
  imageUrl?: string;
  displayOrder?: number | null;
};

const AdminBookingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { uiState } = useUI();

  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceMutationLoading, setServiceMutationLoading] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<CreateAdminServicePayload>({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    imageUrl: '',
    isActive: true,
    displayOrder: 1,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [bookingActionLoading, setBookingActionLoading] = useState(false);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await adminConsoleService.getUsers({ page: 1, limit: 20 });
      setUsers(response.items);
    } catch (loadError) {
      setUsersError(loadError instanceof Error ? loadError.message : '加载用户失败');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadServices = async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const response = await adminConsoleService.getServices();
      setServices(response as ServiceRow[]);
    } catch (loadError) {
      setServicesError(loadError instanceof Error ? loadError.message : '加载服务失败');
    } finally {
      setServicesLoading(false);
    }
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceForm({
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      imageUrl: '',
      isActive: true,
      displayOrder: 1,
    });
  };

  const handleEditService = (serviceItem: ServiceRow) => {
    setEditingServiceId(serviceItem.id);
    setServiceForm({
      name: serviceItem.name,
      description: serviceItem.description || '',
      durationMinutes: serviceItem.durationMinutes,
      price: serviceItem.price || 0,
      imageUrl: serviceItem.imageUrl || '',
      isActive: serviceItem.isActive,
      displayOrder: serviceItem.displayOrder || 1,
    });
  };

  const handleServiceFormChange = (key: keyof CreateAdminServicePayload, value: string | number | boolean) => {
    setServiceForm((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const submitService = async () => {
    if (!serviceForm.name || !serviceForm.imageUrl) {
      setServicesError('服务名称和图片地址不能为空');
      return;
    }
    setServiceMutationLoading(true);
    setServicesError(null);
    try {
      if (editingServiceId) {
        const updatePayload: UpdateAdminServicePayload = {
          name: serviceForm.name,
          description: serviceForm.description,
          durationMinutes: Number(serviceForm.durationMinutes),
          price: Number(serviceForm.price),
          imageUrl: serviceForm.imageUrl,
          isActive: Boolean(serviceForm.isActive),
          displayOrder: Number(serviceForm.displayOrder),
        };
        await adminConsoleService.updateService(editingServiceId, updatePayload);
      } else {
        await adminConsoleService.createService({
          ...serviceForm,
          durationMinutes: Number(serviceForm.durationMinutes),
          price: Number(serviceForm.price),
          displayOrder: Number(serviceForm.displayOrder),
        });
      }
      await loadServices();
      resetServiceForm();
    } catch (mutationError) {
      setServicesError(mutationError instanceof Error ? mutationError.message : '服务保存失败');
    } finally {
      setServiceMutationLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceItem: ServiceRow) => {
    setServiceMutationLoading(true);
    setServicesError(null);
    try {
      await adminConsoleService.toggleServiceStatus(serviceItem.id, !serviceItem.isActive);
      await loadServices();
    } catch (mutationError) {
      setServicesError(mutationError instanceof Error ? mutationError.message : '服务状态更新失败');
    } finally {
      setServiceMutationLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.userType !== 'admin') {
      router.push('/');
    } else {
      setIsAdmin(true);
      dispatch(getBookings());
      loadUsers();
      loadServices();
    }
  }, [currentUser, dispatch, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserTypeText = (userType: string) => {
    if (userType === 'ADMIN' || userType === 'admin') {
      return '管理员';
    }
    return '普通用户';
  };

  const bgColorClass = uiState.theme === 'dark' ? 'dark:bg-gray-900' : 'bg-gray-50';
  const textColorClass = uiState.theme === 'dark' ? 'dark:text-white' : 'text-gray-900';
  const cardBgClass = uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white';
  const mutedTextColorClass = uiState.theme === 'dark' ? 'dark:text-gray-400' : 'text-gray-500';
  const errorBoxClass = uiState.theme === 'dark' ? 'dark:bg-red-900 dark:border-red-700' : 'bg-red-50 border-red-200';

  const tabItems = useMemo(
    () => [
      { key: 'bookings' as AdminTab, label: '预约管理' },
      { key: 'services' as AdminTab, label: '服务管理' },
      { key: 'users' as AdminTab, label: '用户管理' },
    ],
    []
  );

  const refreshAll = () => {
    dispatch(getBookings());
    loadUsers();
    loadServices();
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookingActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      dispatch(getBookings());
    } finally {
      setBookingActionLoading(false);
    }
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
    <div id="admin-bookings-container" className={`min-h-screen ${bgColorClass} py-8`}>
      <div id="admin-bookings-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="admin-bookings-header" className="flex justify-between items-center mb-8">
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

        <div className="mb-6 flex flex-wrap gap-2">
          {tabItems.map((tabItem) => (
            <Button
              key={tabItem.key}
              variant={activeTab === tabItem.key ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tabItem.key)}
            >
              {tabItem.label}
            </Button>
          ))}
        </div>

        {(error || usersError || servicesError) && (
          <div id="admin-console-error" className={`${errorBoxClass} border rounded-md p-4 mb-6`}>
            {error && <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{error}</p>}
            {usersError && <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{usersError}</p>}
            {servicesError && <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{servicesError}</p>}
          </div>
        )}

        {activeTab === 'bookings' && (
          <BookingList
            title="预约管理"
            bookings={bookings}
            isLoading={loading}
            isDeleting={bookingActionLoading}
            onRefresh={() => dispatch(getBookings())}
            onDeleteBooking={handleCancelBooking}
          />
        )}

        {activeTab === 'services' && (
          <Card className={`p-6 ${cardBgClass}`}>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
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
                placeholder="时长(分钟)"
                className={`px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="number"
                value={serviceForm.price}
                onChange={(event) => handleServiceFormChange('price', Number(event.target.value))}
                placeholder="价格"
                className={`px-3 py-2 rounded border ${uiState.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="number"
                value={serviceForm.displayOrder}
                onChange={(event) => handleServiceFormChange('displayOrder', Number(event.target.value))}
                placeholder="显示顺序"
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
                <Button variant="primary" onClick={submitService} isLoading={serviceMutationLoading}>
                  {editingServiceId ? '更新服务' : '新增服务'}
                </Button>
                <Button variant="secondary" onClick={resetServiceForm} disabled={serviceMutationLoading}>
                  重置
                </Button>
              </div>
            </div>
            <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>服务列表</h2>
            {servicesLoading ? (
              <p className={mutedTextColorClass}>加载中...</p>
            ) : services.length === 0 ? (
              <p className={mutedTextColorClass}>暂无服务记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={uiState.theme === 'dark' ? 'dark:bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">服务名称</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">时长(分钟)</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">价格</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">状态</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">操作</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white'}`}>
                    {services.map((serviceItem) => (
                      <tr key={serviceItem.id}>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{serviceItem.name}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{serviceItem.durationMinutes}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{serviceItem.price ?? '-'}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{serviceItem.isActive ? '启用' : '停用'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => handleEditService(serviceItem)} disabled={serviceMutationLoading}>
                              编辑
                            </Button>
                            <Button
                              variant={serviceItem.isActive ? 'danger' : 'primary'}
                              onClick={() => toggleServiceStatus(serviceItem)}
                              disabled={serviceMutationLoading}
                            >
                              {serviceItem.isActive ? '停用' : '启用'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'users' && (
          <Card className={`p-6 ${cardBgClass}`}>
            <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>用户列表</h2>
            {usersLoading ? (
              <p className={mutedTextColorClass}>加载中...</p>
            ) : users.length === 0 ? (
              <p className={mutedTextColorClass}>暂无用户记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={uiState.theme === 'dark' ? 'dark:bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">姓名</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">手机号</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">用户类型</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">状态</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">已验证</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">创建时间</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white'}`}>
                    {users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{userItem.name}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{userItem.phone}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{getUserTypeText(userItem.userType)}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{userItem.status}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{userItem.isVerified ? '是' : '否'}</td>
                        <td className={`px-4 py-3 text-sm ${textColorClass}`}>{formatDate(userItem.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default withAuth(withAdmin(AdminBookingsPage));
