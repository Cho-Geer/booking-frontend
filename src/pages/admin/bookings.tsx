import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getBookings } from '@/store/bookingSlice';
import { useRouter } from 'next/router';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { useUI } from '@/contexts/UIContext';
import { withAuth } from '@/components/hoc/withAuth';
import { withAdmin } from '@/components/hoc/withAdmin';

/**
 * 页面组件：管理员预约管理
 * 
 * @component
 */
const AdminBookingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { uiState } = useUI();
  
  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 检查用户是否为管理员（withAuth已确保用户已登录）
  useEffect(() => {
    if (currentUser?.userType !== 'admin') {
      // 如果不是管理员，重定向到首页
      router.push('/');
    } else {
      setIsAdmin(true);
      dispatch(getBookings());
    }
  }, [currentUser, dispatch, router]);

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  /**
   * 格式化时间显示
   */
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  /**
   * 获取状态显示样式
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return uiState.theme === 'dark' 
          ? 'dark:bg-green-900 dark:text-green-200' 
          : 'bg-green-100 text-green-800';
      case 'PENDING':
        return uiState.theme === 'dark' 
          ? 'dark:bg-yellow-900 dark:text-yellow-200' 
          : 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return uiState.theme === 'dark' 
          ? 'dark:bg-red-900 dark:text-red-200' 
          : 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return uiState.theme === 'dark' 
          ? 'dark:bg-blue-900 dark:text-blue-200' 
          : 'bg-blue-100 text-blue-800';
      default:
        return uiState.theme === 'dark' 
          ? 'dark:bg-gray-700 dark:text-gray-200' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 获取状态中文名称
   */
  const getStatusName = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '已确认';
      case 'PENDING':
        return '待确认';
      case 'CANCELLED':
        return '已取消';
      case 'COMPLETED':
        return '已完成';
      default:
        return status;
    }
  };

  // 根据主题设置背景色类名
  const bgColorClass = uiState.theme === 'dark' ? 'dark:bg-gray-900' : 'bg-gray-50';
  const textColorClass = uiState.theme === 'dark' ? 'dark:text-white' : 'text-gray-900';
  const cardBgClass = uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white';

  if (!isAdmin) {
    return (
      <div className={`min-h-screen ${bgColorClass} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${textColorClass}`}>访问被拒绝</h1>
          <p className={uiState.theme === 'dark' ? 'dark:text-gray-400' : 'text-gray-500'}>
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
          <h1 className={`text-3xl font-bold ${textColorClass}`}>预约管理</h1>
          <Button
            variant="primary"
            onClick={() => dispatch(getBookings())}
            disabled={loading}
            isLoading={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </Button>
        </div>
        
        {error && (
          <div id="admin-bookings-error" className={`${uiState.theme === 'dark' ? 'dark:bg-red-900 dark:border-red-700' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-6`}>
            <p className={uiState.theme === 'dark' ? 'dark:text-red-200' : 'text-red-800'}>{error}</p>
          </div>
        )}

        <Card className={`p-6 ${cardBgClass}`}>
          <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>所有预约</h2>
          
          {loading ? (
            <div id="admin-bookings-loading" className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className={uiState.theme === 'dark' ? 'dark:text-gray-400' : 'text-gray-500'}>加载中...</p>
            </div>
          ) : bookings.length === 0 ? (
            <p className={uiState.theme === 'dark' ? 'dark:text-gray-400' : 'text-gray-500'}>暂无预约记录</p>
          ) : (
            <div id="admin-bookings-table-container" className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={uiState.theme === 'dark' ? 'dark:bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      用户ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      日期
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      时间
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      状态
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${uiState.theme === 'dark' ? 'dark:bg-gray-800' : 'bg-white'}`}>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${uiState.theme === 'dark' ? 'dark:text-gray-300' : 'text-gray-500'}`}>
                        {booking.userId}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textColorClass}`}>
                        {formatDate(booking.appointmentDate)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                          {getStatusName(booking.status)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${uiState.theme === 'dark' ? 'dark:text-gray-300' : 'text-gray-500'}`}>
                        {booking.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// 使用withAuth确保已登录，再用withAdmin确保是管理员
export default withAuth(withAdmin(AdminBookingsPage));