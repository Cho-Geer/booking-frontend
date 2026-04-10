import React from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import { useTheme } from '@/hooks/useTheme';
import { useUI } from '@/contexts/UIContext';
import { Booking, Service } from '@/types';
import BookingDetailModal from '@/components/molecules/BookingDetailModal';
import BookingUpdateModal, { BookingUpdatePayload } from '@/components/molecules/BookingUpdateModal';
import { stripHtml } from '@/utils/htmlUtils';

interface MyBookingsPageProps {
  bookings: Booking[];
  services: Service[];
  loading: boolean;
  error?: string;
  onCancelBooking: (bookingId: string) => void;
  onUpdateBooking: (payload: BookingUpdatePayload) => Promise<void>;
}

/**
 * 有机体组件：我的预约页面
 * 使用UIContext管理主题和其他UI状态
 * 
 * @component
 * @example
 * <MyBookingsPage 
 *   bookings={[]}
 *   loading={false}
 *   onCancelBooking={(id) => console.log(id)}
 * />
 */
const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  services,
  loading,
  error,
  onCancelBooking,
  onUpdateBooking
}) => {
  const { isDark: isDarkTheme } = useTheme();
  const { openModal } = useUI();
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);

  const [detailBooking, setDetailBooking] = React.useState<Booking | null>(null);
  const [updateBookingTarget, setUpdateBookingTarget] = React.useState<Booking | null>(null);
  const [updatingBooking, setUpdatingBooking] = React.useState(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = React.useState(false);

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
    if (isDarkTheme) {
      switch (status) {
        case 'CONFIRMED':
          return 'bg-secondary-dark text-secondary-light';
        case 'PENDING':
          return 'bg-warning-dark text-warning-light';
        case 'CANCELLED':
          return 'bg-error-dark text-error-light';
        case 'COMPLETED':
          return 'bg-info-dark text-info-light';
        default:
          return 'bg-gray-700 text-gray-200';
      }
    }
    
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
  const bgColorClass = isDarkTheme ? 'bg-background-dark' : 'bg-gray-50';
  const textColorClass = isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900';
  const borderColorClass = isDarkTheme ? 'border-border-dark' : 'border-gray-200';
  const cardBgClass = isDarkTheme ? 'bg-background-dark-200' : 'bg-white';

  const canShowUpdate = (status: string) => status === 'PENDING';

  const handleOpenDetail = (booking: Booking) => {
    setDetailBooking(booking);
    // setShowDetailModal(true);
  };

  const handleOpenUpdate = (booking: Booking) => {
    setUpdateBookingTarget(booking);
    setShowUpdateModal(true);
    // setShowDetailModal(false);
  };

  const handleConfirmUpdate = async (payload: BookingUpdatePayload) => {
    setUpdatingBooking(true);
    try {
      await onUpdateBooking(payload);
      setShowUpdateModal(false);
      setUpdateBookingTarget(null);
      setDetailBooking(null);
      openModal({
        title: '更新成功',
        content: '预约更新成功，已为您保存最新预约信息。已发送邮件请确认',
        width: 400
      });
    } finally {
      setUpdatingBooking(false);
    }
  };

  return (
    <div id="my-bookings-page-container" className={`min-h-screen ${bgColorClass} py-8`}>
      <div id="my-bookings-content-wrapper" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${textColorClass} mb-8`}>我的预约</h1>
        
        {error && (
          <div id="my-bookings-error-message" className={`${isDarkTheme ? 'bg-error-dark border-error-dark/30' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-6`}>
            <p className={isDarkTheme ? 'text-error-light' : 'text-red-800'}>{error}</p>
          </div>
        )}

        <Card className={`p-6 ${cardBgClass}`}>
          <h2 className={`text-lg font-medium ${textColorClass} mb-4`}>预约列表</h2>
          
          {loading ? (
            <div id="my-bookings-loading" className="text-center py-8">
              <div id="my-bookings-loading-spinner" className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className={isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}>加载中...</p>
            </div>
          ) : bookings.length === 0 ? (
            <p className={isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}>暂无预约记录</p>
          ) : (
            <div id="bookings-list-container" className="space-y-4">
              {bookings.map((booking) => (
                <div id={`booking-item-${booking.id}`} key={booking.id} className={`${borderColorClass} rounded-md p-4 ${isDarkTheme ? 'dark:border' : 'border'}`}>
                  <div id={`booking-item-header-${booking.id}`} className="flex justify-between items-start">
                    <div id={`booking-item-details-${booking.id}`} className="min-w-0">
                      <p className={`font-medium ${textColorClass}`}>
                        {formatDate(booking.appointmentDate)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                      {booking.notes && (
                        <p
                          title={`备注: ${stripHtml(booking.notes)}`}
                          className={`text-sm mt-1 truncate ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}
                        >
                          备注: {stripHtml(booking.notes)}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                      {getStatusName(booking.status)}
                    </span>
                  </div>
                  <div id={`booking-item-actions-${booking.id}`} className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDetail(booking)}
                    >
                      详细
                    </Button>
                    {canShowUpdate(booking.status) && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleOpenUpdate(booking)}
                      >
                        更新
                      </Button>
                    )}
                    {['CONFIRMED', 'PENDING'].includes(booking.status) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onCancelBooking(booking.id)}
                      >
                        取消预约
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <BookingDetailModal
        open={false}
        booking={detailBooking}
        onClose={() => {
          // setShowDetailModal(false);
          setDetailBooking(null);
        }}
        onUpdate={handleOpenUpdate}
      />
      <BookingUpdateModal
        open={showUpdateModal}
        booking={updateBookingTarget}
        services={services}
        onClose={() => {
          setShowUpdateModal(false);
          setUpdateBookingTarget(null);
        }}
        onConfirm={handleConfirmUpdate}
        submitting={updatingBooking}
        updatingBooking={updatingBooking}
      />
      <Modal
        open={showUpdateSuccessModal}
        title="更新成功"
        onClose={() => setShowUpdateSuccessModal(false)}
        showCloseButton={false}
        size="sm"
        footer={(
          <Button size="sm" variant="secondary" onClick={() => setShowUpdateSuccessModal(false)}>
            关闭
          </Button>
        )}
      >
        <p className={`${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
          预约更新成功，已为您保存最新预约信息。
        </p>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
