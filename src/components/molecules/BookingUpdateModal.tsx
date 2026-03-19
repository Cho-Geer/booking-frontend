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
import { useAppDispatch, useAppSelector } from '@/store';
import { getAvailableSlots, getBookings } from '@/store/bookingSlice';
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
  const dispatch = useAppDispatch();
  // Select available slots and bookings list from Redux store
  const availableSlots = useAppSelector((state) => state.booking.availableSlots);
  const bookings = useAppSelector((state) => state.booking.bookings);
  const slotsLoading = useAppSelector((state) => state.booking.slotsLoading);
  const bookingsLoading = useAppSelector((state) => state.booking.bookingsLoading);
  // 不使用 state.booking.error：该全局错误可能包含与时间段无关的错误（如更新预约失败），
  // 展示在时间段区域会误导用户。时间段加载错误均取自本地 slotError 状态。

  const [selectedDate, setSelectedDate] = React.useState('');
  const [serviceId, setServiceId] = React.useState('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = React.useState('');
  const [slotOptions, setSlotOptions] = React.useState<TimeSlotOption[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [slotError, setSlotError] = React.useState('');
  const [serviceStatusError, setServiceStatusError] = React.useState('');
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
    setServiceStatusError('');
    
    // Check if the selected service is active
    if (booking.service?.id) {
      const selectedService = services.find(s => s.id === booking.service?.id);
      if (selectedService && !selectedService.isActive) {
        setServiceStatusError(`服务 "${selectedService.name}" 已被禁用，无法更新预约`);
      }
    }
  }, [booking, open, normalizeDate, reset, services]);

  React.useEffect(() => {
    if (!booking || !open || !selectedDate) return;
    let active = true;
    const fetchSlots = async () => {
      setSlotError('');
      try {
        // Dispatch both Redux thunks in parallel; results are stored in the Redux store
        await Promise.all([
          dispatch(getAvailableSlots(selectedDate)),
          dispatch(getBookings()),
        ]);
      } catch (error: unknown) {
        if (!active) return;
        const message = error instanceof Error ? error.message : '获取可用时间段失败';
        setSlotError(message);
        setSlotOptions([]);
      }
    };
    fetchSlots();
    return () => {
      active = false;
    };
  }, [booking, dispatch, open, selectedDate]);

  /**
   * Derive slotOptions whenever Redux store data (availableSlots / bookings) or
   * the selected date changes. This keeps all the mapping logic intact while
   * reading from the Redux store instead of local state populated by bookingService.
   */
  React.useEffect(() => {
    if (!booking || !open || !selectedDate) return;
    const today = getTodayLocalDate();
    const now = new Date();
    const currentDate = normalizeDate(booking.appointmentDate);
    const isCurrentDate = selectedDate === currentDate;
    // Identify time slots that the current user has already booked on this date
    const myBookedSlotIds = new Set(
      bookings
        .filter((item) => normalizeDate(item.appointmentDate) === selectedDate)
        .filter((item) => ['PENDING', 'CONFIRMED'].includes(item.status))
        .map((item) => item.timeSlotId)
    );
    const mapped = availableSlots.map((slot) => {
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
  }, [availableSlots, booking, bookings, normalizeDate, open, selectedDate]);

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
    
    // Validate service status
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService && !selectedService.isActive) {
      setServiceStatusError(`服务 "${selectedService.name}" 已被禁用，无法更新预约`);
      return false;
    } else {
      setServiceStatusError('');
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
    try {
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
    } catch (error) {
      // 上层（BookingPage organism）已通过 showError 展示错误提示，
      // 此处仅停止错误传播，避免 Next.js 展示 Runtime Error 覆盖层
      console.error('预约更新操作失败:', error);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <BookingModalBase
        open={open}
        title={
          <div className="flex flex-col gap-2">
            <span>更新预约</span>
            {serviceStatusError && (
              <span className="text-sm text-error-light">{serviceStatusError}</span>
            )}
          </div>
        }
        onClose={onClose}
        headerActions={(
          <Button 
            variant="warning" 
            size="sm" 
            onClick={handleSubmit(handleConfirm)} 
            isLoading={submitting}
            disabled={submitting || updatingBooking || !!serviceStatusError}
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
              服务类型（仅显示可用服务）
            </label>
            <Dropdown
              items={[
                { label: '选择服务类型', value: '', disabled: true },
                ...services.filter(s => s.isActive).map((service) => ({ label: service.name, value: service.id })),
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
          {(slotsLoading || bookingsLoading) ? (
            <p className={`${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>加载中...</p>
          ) : slotError ? (
            // 仅展示时间段加载自身的错误，不展示全局 booking state.error
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
