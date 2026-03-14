import React from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import RichTextEditor from '@/components/atoms/RichTextEditor';
import Dropdown from '@/components/atoms/Dropdown';
import ConfirmModal from '@/components/atoms/ConfirmModal';
import BookingModalBase from '@/components/molecules/BookingModalBase';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Booking, Service, TimeSlot } from '@/types';
import { bookingService } from '@/services/bookingService';
import { useTheme } from '@/hooks/useTheme';
import { getTodayLocalDate, getMaxDate } from '@/utils/dateUtils';

interface BookingUpdatePayload {
  id: string;
  appointmentDate: string;
  timeSlotId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerWechat?: string;
  notes?: string;
}

interface TimeSlotOption extends TimeSlot {
  isPast: boolean;
  isBooked: boolean;
  isMyBooking: boolean;
  isCurrentBooking: boolean;
}

interface BookingUpdateModalProps {
  open: boolean;
  booking: Booking | null;
  services: Service[];
  onClose: () => void;
  onConfirm: (payload: BookingUpdatePayload) => Promise<void>;
  submitting?: boolean;
  updatingBooking: boolean;
}

const formSchema = z.object({
  customerName: z.string().min(1, '请输入姓名').max(20, '姓名不能超过20个字符'),
  customerPhone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  customerEmail: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  customerWechat: z.string().max(50, '微信号不能超过50个字符').optional(),
  notes: z.string().max(2000, '备注信息不能超过2000个字符').optional(),
});

const BookingUpdateModal: React.FC<BookingUpdateModalProps> = ({
  open,
  booking,
  services,
  onClose,
  onConfirm,
  submitting = false,
  updatingBooking = false,
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();
  const [selectedDate, setSelectedDate] = React.useState('');
  const [serviceId, setServiceId] = React.useState('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = React.useState('');
  const [slotOptions, setSlotOptions] = React.useState<TimeSlotOption[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [slotLoading, setSlotLoading] = React.useState(false);
  const [slotError, setSlotError] = React.useState('');
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    getValues,
    formState: { errors: formErrors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerWechat: '',
      notes: '',
    },
  });

  const normalizeDate = React.useCallback((dateValue: string) => {
    return dateValue.includes('T') ? dateValue.slice(0, 10) : dateValue;
  }, []);

  React.useEffect(() => {
    if (!booking || !open) return;
    const normalizedDate = normalizeDate(booking.appointmentDate);
    reset({
      customerName: booking.customerName || '',
      customerPhone: booking.customerPhone || '',
      customerEmail: booking.customerEmail || '',
      customerWechat: booking.customerWechat || '',
      notes: booking.notes || '',
    });
    setSelectedDate(normalizedDate);
    setServiceId(booking.service?.id || '');
    setSelectedTimeSlotId(booking.timeSlotId);
    setErrors({});
    setSlotError('');
  }, [booking, open, normalizeDate, reset]);

  React.useEffect(() => {
    if (!booking || !open || !selectedDate) return;
    let active = true;
    const fetchSlots = async () => {
      setSlotLoading(true);
      setSlotError('');
      try {
        const [slots, myBookings] = await Promise.all([
          bookingService.getAvailableSlots(selectedDate),
          bookingService.getBookings(),
        ]);
        if (!active) return;
        const today = getTodayLocalDate();
        const now = new Date();
        const currentDate = normalizeDate(booking.appointmentDate);
        const isCurrentDate = selectedDate === currentDate;
        const myBookedSlotIds = new Set(
          myBookings.items
            .filter((item) => normalizeDate(item.appointmentDate) === selectedDate)
            .filter((item) => ['PENDING', 'CONFIRMED'].includes(item.status))
            .map((item) => item.timeSlotId)
        );
        const mapped = slots.map((slot) => {
          let isPast = false;
          if (selectedDate === today) {
            const [hours, minutes] = slot.startTime.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);
            isPast = now > slotTime;
          }
          const isCurrentBooking = isCurrentDate && slot.id === booking.timeSlotId;
          const isMyBooking = isCurrentBooking || myBookedSlotIds.has(slot.id);
          return {
            ...slot,
            isPast,
            isBooked: !slot.available,
            isMyBooking,
            isCurrentBooking,
          };
        });
        setSlotOptions(mapped);
      } catch (error: unknown) {
        if (!active) return;
        const message = error instanceof Error ? error.message : '获取可用时间段失败';
        setSlotError(message);
        setSlotOptions([]);
      } finally {
        if (active) {
          setSlotLoading(false);
        }
      }
    };
    fetchSlots();
    return () => {
      active = false;
    };
  }, [booking, getTodayLocalDate, normalizeDate, open, selectedDate]);

  if (!booking) return null;

  const initialDate = normalizeDate(booking.appointmentDate);

  const validateBasicFields = () => {
    const nextErrors: Record<string, string> = {};
    if (!selectedDate) {
      nextErrors.appointmentDate = '请选择预约日期';
    }
    if (!serviceId) {
      nextErrors.serviceId = '请选择服务类型';
    }
    if (!selectedTimeSlotId) {
      nextErrors.timeSlotId = '请选择时间段';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleDateInputClick = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
  };

  const handleConfirm = async (data: z.infer<typeof formSchema>) => {
    if (!validateBasicFields()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    const isValid = await trigger();
    if (!isValid || !validateBasicFields()) return;
    
    setShowConfirmModal(false);
    const data = getValues();
    await onConfirm({
      id: booking!.id,
      appointmentDate: selectedDate,
      timeSlotId: selectedTimeSlotId,
      serviceId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail?.trim() || undefined,
      customerWechat: data.customerWechat?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    });
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <BookingModalBase
        open={open}
        title="更新预约"
        onClose={onClose}
        headerActions={(
          <Button 
            variant="warning" 
            size="sm" 
            onClick={handleSubmit(handleConfirm)} 
            isLoading={submitting}
            disabled={submitting || updatingBooking}
          >
            {updatingBooking ? '更新中...' : '确认'}
          </Button>
        )}
      >
      <div className="flex h-full flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={`mb-1 block text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
              预约日期
            </label>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              onClick={handleDateInputClick}
              onKeyDown={(event) => event.preventDefault()}
              onPaste={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()}
              min={getTodayLocalDate()}
              max={getMaxDate()}
              className={`block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary ${
                isDarkTheme
                  ? 'border-border-dark bg-background-dark text-text-dark-primary'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
            {errors.appointmentDate && <p className="mt-1 text-sm text-red-500">{errors.appointmentDate}</p>}
          </div>
          <div>
            <label className={`mb-1 block text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
              服务类型
            </label>
            <Dropdown
              items={[
                { label: '选择服务类型', value: '', disabled: true },
                ...services.map((service) => ({ label: service.name, value: service.id })),
              ]}
              value={serviceId}
              onChange={setServiceId}
              buttonText="选择服务类型"
              className="w-full"
            />
            {errors.serviceId && <p className="mt-1 text-sm text-red-500">{errors.serviceId}</p>}
          </div>
        </div>

        <div>
          <p className={`mb-2 text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>可用时间段</p>
          {slotLoading ? (
            <p className={`${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>加载中...</p>
          ) : slotError ? (
            <p className="text-red-500">{slotError}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slotOptions.map((slot) => {
                const disabled = (!slot.isCurrentBooking && slot.isBooked) || slot.isPast;
                const selected = selectedTimeSlotId === slot.id;
                return (
                  <Button
                    key={slot.id}
                    onClick={() => setSelectedTimeSlotId(slot.id)}
                    disabled={disabled}
                    variant={
                      slot.isCurrentBooking
                        ? 'warning'
                        : selected
                          ? 'primary'
                          : slot.isMyBooking
                          ? 'warning'
                          : slot.isBooked
                            ? 'primary'
                            : 'secondary'
                    }
                    className={`h-auto py-1 min-h-[48px] px-1 ${
                      slot.isPast && !slot.isCurrentBooking && !slot.isBooked
                        ? isDarkTheme
                          ? '!bg-gray-800 !text-gray-600'
                          : '!bg-gray-200 !text-gray-400'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium">{slot.startTime} - {slot.endTime}</span>
                      {slot.isCurrentBooking && (
                        <span className="text-[10px] mt-0.5 opacity-90">(当前预约)</span>
                      )}
                      {!slot.isCurrentBooking && slot.isMyBooking && (
                        <span className="text-[10px] mt-0.5 opacity-90">(已预约)</span>
                      )}
                      {!slot.isMyBooking && slot.isBooked && (
                        <span className="text-[10px] mt-0.5 opacity-90">(已满)</span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
          {errors.timeSlotId && <p className="mt-1 text-sm text-red-500">{errors.timeSlotId}</p>}
        </div>

        <div className={`h-px ${isDarkTheme ? 'bg-border-dark' : 'bg-gray-200'}`} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="姓名（必填）"
            error={formErrors.customerName?.message}
            fullWidth
            {...register('customerName')}
          />
          <Input
            label="手机号（必填）"
            error={formErrors.customerPhone?.message}
            fullWidth
            {...register('customerPhone')}
          />
          <Input
            label="邮箱（选填）"
            error={formErrors.customerEmail?.message}
            fullWidth
            {...register('customerEmail')}
          />
          <Input
            label="微信（选填）"
            fullWidth
            error={formErrors.customerWechat?.message}
            {...register('customerWechat')}
          />
        </div>

        <div className="md:h-[clamp(20rem,30vh,25rem)] flex flex-col min-h-0 overflow-hidden">
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="备注（可选）"
                error={formErrors.notes?.message}
                fullWidth
                editorHeightClass="h-full"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="请输入特殊需求或备注信息"
              />
            )}
          />
        </div>
      </div>
    </BookingModalBase>
    
    <ConfirmModal
      open={showConfirmModal}
      title="更新预约"
      message="请确认是否要更新此预约？"
      confirmText="确认"
      cancelText="取消"
      onConfirm={handleConfirmUpdate}
      onCancel={handleCancelUpdate}
      isLoading={updatingBooking}
    />
    </>
  );
};

export type { BookingUpdatePayload };
export default BookingUpdateModal;
