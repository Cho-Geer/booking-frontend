import React from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import { Booking } from '@/types';
import { useUI } from '@/contexts/UIContext';
import { sanitizeHtml } from '@/utils/htmlUtils';

interface BookingDetailModalProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onUpdate?: (booking: Booking) => void;
  isAdmin?: boolean;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  open,
  booking,
  onClose,
  onUpdate,
  isAdmin = false,
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.isMobile;

  if (!booking) return null;

  const canUpdate = !isAdmin && booking.status === 'PENDING';

  const statusName = (() => {
    switch (booking.status) {
      case 'PENDING':
        return '待确认';
      case 'CONFIRMED':
        return '已确认';
      case 'CANCELLED':
        return '已取消';
      case 'COMPLETED':
        return '已完成';
      default:
        return booking.status;
    }
  })();

  const dateText = (() => {
    const normalized = booking.appointmentDate.includes('T')
      ? booking.appointmentDate.slice(0, 10)
      : booking.appointmentDate;
    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  })();

  return (
    <Modal
      open={open}
      title="预约详情"
      onClose={onClose}
      size={isMobile ? "sm" : "md"}
      closeButtonVariant="secondary"
      headerActions={canUpdate && onUpdate ? (
        <Button variant="warning" size="sm" onClick={() => onUpdate(booking)}>
          更新
        </Button>
      ) : null}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>状态</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{statusName}</p>
          </div>
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>服务类型</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{booking.serviceName || booking.service?.name || '-'}</p>
          </div>
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>预约日期</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{dateText}</p>
          </div>
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>时间段</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{booking.startTime} - {booking.endTime}</p>
          </div>
        </div>

        <div className={`h-px ${isDarkTheme ? 'bg-border-dark' : 'bg-gray-200'}`} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>姓名（必填）</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{booking.customerName || '-'}</p>
          </div>
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>手机号（必填）</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{booking.customerPhone || '-'}</p>
          </div>
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>邮箱（选填）</p>
            <p className={`font-medium break-all ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{booking.customerEmail || '-'}</p>
          </div>
          <div>
            <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>微信（选填）</p>
            <p className={`font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>{booking.customerWechat || '-'}</p>
          </div>
        </div>

        <div>
          <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>备注（可选）</p>
          <div className={`mt-1 rounded-md border p-3 max-h-64 overflow-y-auto ${isDarkTheme ? 'border-border-dark bg-background-dark-200 text-text-dark-primary' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
            {booking.notes ? (
              <div 
                className="rich-text-content overflow-x-auto break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-500 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(booking.notes) }} 
              />
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
