import React from 'react';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import RichTextEditor from '../atoms/RichTextEditor';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUI } from '../../contexts/UIContext';
import { TimeSlot } from '../../types';

interface BookingCreateModalProps {
  open: boolean;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  error?: string;
  notes: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerWechat?: string;
  onNotesChange: (notes: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onCustomerWechatChange: (wechat: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  creatingBooking: boolean;
}

const formSchema = z.object({
  customerName: z.string().min(2, '姓名至少需要2个字符').max(20, '姓名不能超过20个字符'),
  customerPhone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  customerEmail: z.string().email('请输入正确的邮箱').optional().or(z.literal('')),
  customerWechat: z.string().max(50, '微信号不能超过50个字符').optional(),
  notes: z.string().max(2000, '备注信息不能超过2000个字符').optional(),
});

/**
 * 分子组件：预约创建弹窗
 * 
 * @component
 */
const BookingCreateModal: React.FC<BookingCreateModalProps> = ({
  open,
  selectedDate,
  selectedSlot,
  error,
  notes,
  customerName,
  customerPhone,
  customerEmail,
  customerWechat,
  onNotesChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCustomerWechatChange,
  onSubmit,
  onClose,
  creatingBooking
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.isMobile;

  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: { errors }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      customerWechat: customerWechat || '',
      notes: notes || ''
    }
  });

  // 当弹窗打开或props变化时，同步数据到表单
  React.useEffect(() => {
    if (open) {
      setValue('customerName', customerName || '', { shouldValidate: false });
      setValue('customerPhone', customerPhone || '', { shouldValidate: false });
      setValue('customerEmail', customerEmail || '', { shouldValidate: false });
      setValue('customerWechat', customerWechat || '', { shouldValidate: false });
      setValue('notes', notes || '', { shouldValidate: false });
    }
  }, [open, customerName, customerPhone, customerEmail, customerWechat, notes, setValue]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // 提交前同步最新数据到父组件
    onCustomerNameChange(data.customerName);
    onCustomerPhoneChange(data.customerPhone);
    onCustomerEmailChange(data.customerEmail || '');
    onCustomerWechatChange(data.customerWechat || '');
    onNotesChange(data.notes || '');
    onSubmit();
  };

  return (
    <Modal
      open={open}
      title="确认预约"
      onClose={onClose}
      size={isMobile ? "md" : "lg"}
      cardClassName={`${isMobile ? 'min-h-[70vh]' : 'min-h-[78vh]'} flex flex-col`}
      closeButtonVariant="secondary"
      closeButtonText="取消"
      headerActions={
        <Button
          variant="warning"
          size="sm"
          onClick={handleSubmit(handleFormSubmit)}
          isLoading={creatingBooking}
          disabled={Object.keys(errors).length > 0}
        >
          {creatingBooking ? '创建中...' : '确认'}
        </Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {error && (
          <div className={`${isDarkTheme ? 'bg-error-dark border-error-dark' : 'bg-red-50 border-red-200'} border rounded-md p-3 mb-4`}>
            <p className={`text-sm ${isDarkTheme ? 'text-white-600' : 'text-red-900'}`}>{error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
            预约时间: {selectedDate ? formatDate(selectedDate) : ''} {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : ''}
          </p>
        </div>

        <div className="flex flex-1 min-h-0 h-full flex-col gap-4">
          <Input
            label="姓名（必填）"
            placeholder="Alice"
            error={errors.customerName?.message}
            fullWidth
            {...register('customerName')}
            onChange={(e) => {
              register('customerName').onChange(e);
              onCustomerNameChange(e.target.value);
            }}
          />
          
          <Input
            label="手机号（必填）"
            placeholder="18100000000"
            error={errors.customerPhone?.message}
            fullWidth
            {...register('customerPhone')}
            onChange={(e) => {
              register('customerPhone').onChange(e);
              onCustomerPhoneChange(e.target.value);
            }}
          />
          
          <Input
            label="邮箱（选填）"
            placeholder="请输入您的邮箱"
            error={errors.customerEmail?.message}
            fullWidth
            {...register('customerEmail')}
            onChange={(e) => {
              register('customerEmail').onChange(e);
              onCustomerEmailChange(e.target.value);
            }}
          />
          
          <Input
            label="微信（选填）"
            placeholder="请输入您的微信号"
            error={errors.customerWechat?.message}
            fullWidth
            {...register('customerWechat')}
            onChange={(e) => {
              register('customerWechat').onChange(e);
              onCustomerWechatChange(e.target.value);
            }}
          />

          <div className="md:h-[clamp(35rem,30vh,35rem)] flex flex-col min-h-0 overflow-hidden">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  label="备注（可选）"
                  error={errors.notes?.message}
                  fullWidth
                  editorHeightClass="h-full"
                  value={field.value || ''}
                  onChange={(val) => {
                    field.onChange(val);
                    onNotesChange(val);
                  }}
                  placeholder="请输入特殊需求或备注信息"
                />
              )}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingCreateModal;
