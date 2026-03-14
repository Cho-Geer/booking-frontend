import React, { useEffect, useMemo, useState, useReducer } from 'react';
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
import ServiceList from '@/components/organisms/ServiceList';
import UserList from '@/components/organisms/UserList';
import {
  CreateAdminServicePayload,
  UpdateAdminServicePayload,
} from '@/services/adminConsoleService';
import { Service } from '@/types';
import { bookingService } from '@/services/bookingService';
import {
  useAdminServices,
  useAdminUsers,
  useCreateAdminService,
  useUpdateAdminService,
  useToggleServiceStatus,
} from '@/services/adminConsoleApi';
import {
  ADMIN_TABS,
  DEFAULT_SERVICE_FORM,
  DEFAULT_USER_QUERY,
} from '@/constants/admin';

type AdminTab = 'bookings' | 'services' | 'users';

type ServiceRow = Service & {
  imageUrl?: string;
  displayOrder?: number | null;
};

/**
 * 管理控制台状态类型定义
 */
type AdminState = {
  activeTab: AdminTab;
  editingServiceId: string | null;
  serviceForm: CreateAdminServicePayload;
  bookingActionLoading: boolean;
};

/**
 * 管理控制台动作类型定义
 */
type AdminAction =
  | { type: 'SET_ACTIVE_TAB'; payload: AdminTab }
  | { type: 'SET_EDITING_SERVICE'; payload: string | null }
  | { type: 'UPDATE_SERVICE_FORM'; payload: Partial<CreateAdminServicePayload> }
  | { type: 'RESET_SERVICE_FORM' }
  | { type: 'SET_BOOKING_ACTION_LOADING'; payload: boolean };

/**
 * 管理控制台状态 reducer 函数
 * @param state 当前状态
 * @param action 动作对象
 * @returns 新状态
 */
const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_EDITING_SERVICE':
      return { ...state, editingServiceId: action.payload };
    case 'UPDATE_SERVICE_FORM':
      return { ...state, serviceForm: { ...state.serviceForm, ...action.payload } };
    case 'RESET_SERVICE_FORM':
      return { ...state, editingServiceId: null, serviceForm: DEFAULT_SERVICE_FORM };
    case 'SET_BOOKING_ACTION_LOADING':
      return { ...state, bookingActionLoading: action.payload };
    default:
      return state;
  }
};

/**
 * 管理控制台初始状态
 */
const initialAdminState: AdminState = {
  activeTab: 'bookings',
  editingServiceId: null,
  serviceForm: DEFAULT_SERVICE_FORM,
  bookingActionLoading: false,
};

const isServiceRowArray = (data: unknown): data is ServiceRow[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'name' in item
  );
};

const AdminBookingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { uiState } = useUI();

  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [adminState, adminDispatch] = useReducer(adminReducer, initialAdminState);
  const { activeTab, editingServiceId, serviceForm, bookingActionLoading } = adminState;

  const servicesQuery = useAdminServices();
  const usersQuery = useAdminUsers(DEFAULT_USER_QUERY);
  const createServiceMutation = useCreateAdminService();
  const updateServiceMutation = useUpdateAdminService();
  const toggleServiceStatusMutation = useToggleServiceStatus();

  const services = isServiceRowArray(servicesQuery.data) ? servicesQuery.data : [];
  const servicesLoading = servicesQuery.isLoading;
  const servicesError = servicesQuery.error ? String(servicesQuery.error) : null;
  
  if (servicesQuery.data && !isServiceRowArray(servicesQuery.data)) {
    console.error('Invalid services data format:', servicesQuery.data);
  }
  const users = usersQuery.data?.items || [];
  const usersLoading = usersQuery.isLoading;
  const usersError = usersQuery.error ? String(usersQuery.error) : null;
  const serviceMutationLoading = 
    createServiceMutation.isPending || 
    updateServiceMutation.isPending || 
    toggleServiceStatusMutation.isPending;

  const resetServiceForm = () => {
    adminDispatch({ type: 'RESET_SERVICE_FORM' });
  };

  const handleEditService = (serviceItem: ServiceRow) => {
    adminDispatch({ type: 'SET_EDITING_SERVICE', payload: serviceItem.id });
    adminDispatch({
      type: 'UPDATE_SERVICE_FORM',
      payload: {
        name: serviceItem.name,
        description: serviceItem.description || '',
        durationMinutes: serviceItem.durationMinutes,
        price: serviceItem.price || 0,
        imageUrl: serviceItem.imageUrl || '',
        isActive: serviceItem.isActive,
        displayOrder: serviceItem.displayOrder || 1,
      },
    });
  };

  const handleServiceFormChange = (key: keyof CreateAdminServicePayload, value: string | number | boolean) => {
    adminDispatch({ type: 'UPDATE_SERVICE_FORM', payload: { [key]: value } });
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

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
      updateServiceMutation.mutate({ id: editingServiceId, payload: updatePayload });
    } else {
      createServiceMutation.mutate({
        ...serviceForm,
        durationMinutes: Number(serviceForm.durationMinutes),
        price: Number(serviceForm.price),
        displayOrder: Number(serviceForm.displayOrder),
      });
    }
    resetServiceForm();
  };

  const toggleServiceStatus = (serviceItem: ServiceRow) => {
    toggleServiceStatusMutation.mutate({ id: serviceItem.id, isActive: !serviceItem.isActive });
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

  const refreshAll = () => {
    dispatch(getBookings());
    servicesQuery.refetch();
    usersQuery.refetch();
  };

  const handleCancelBooking = async (bookingId: string) => {
    adminDispatch({ type: 'SET_BOOKING_ACTION_LOADING', payload: true });
    try {
      await bookingService.cancelBooking(bookingId);
      dispatch(getBookings());
    } finally {
      adminDispatch({ type: 'SET_BOOKING_ACTION_LOADING', payload: false });
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
              onClick={() => adminDispatch({ type: 'SET_ACTIVE_TAB', payload: tabItem.key })}
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
                  bookings={bookings}
                  isLoading={loading}
                  isDeleting={bookingActionLoading}
                  onRefresh={() => dispatch(getBookings())}
                  onDeleteBooking={handleCancelBooking}
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
                </Card>
                <div className="flex-1 overflow-hidden">
                  <ServiceList
                    services={services}
                    isLoading={servicesLoading}
                    isMutating={serviceMutationLoading}
                    title="服务列表"
                    onRefresh={() => servicesQuery.refetch()}
                    onEditService={handleEditService}
                    onToggleServiceStatus={toggleServiceStatus}
                  />
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="h-full flex flex-col">
                <UserList
                  users={users}
                  isLoading={usersLoading}
                  title="用户列表"
                  onRefresh={() => usersQuery.refetch()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(withAdmin(AdminBookingsPage));
