import React from 'react';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import RichTextEditor from '../atoms/RichTextEditor';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TimeSlot } from '../../types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { useTheme } from '@/hooks/useTheme';

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
  bookingCreated: boolean;
  emailSent: boolean;
  onConfirmBooking: () => void;
}

const formSchema = z.object({
  customerName: z.string().min(2, '姓名至少需要 2 个字符').max(20, '姓名不能超过 20 个字符'),
  customerPhone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  customerEmail: z.string().email('请输入正确的邮箱').optional().or(z.literal('')),
  customerWechat: z.string().max(50, '微信号不能超过 50 个字符').optional(),
  notes: z.string().max(2000, '备注信息不能超过 2000 个字符').optional(),
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
  creatingBooking,
  bookingCreated,
  emailSent,
  onConfirmBooking
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

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

  React.useEffect(() => {
    if (open) {
      setValue('customerName', customerName || '', { shouldValidate: false });
      setValue('customerPhone', customerPhone || '', { shouldValidate: false });
      setValue('customerEmail', customerEmail || '', { shouldValidate: false });
      setValue('customerWechat', customerWechat || '', { shouldValidate: false });
      setValue('notes', notes || '', { shouldValidate: false });
    }
  }, [open, customerName, customerPhone, customerEmail, customerWechat, notes, setValue]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onCustomerNameChange(data.customerName);
    onCustomerPhoneChange(data.customerPhone);
    onCustomerEmailChange(data.customerEmail || '');
    onCustomerWechatChange(data.customerWechat || '');
    onNotesChange(data.notes || '');
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = () => {
    setShowConfirmDialog(false);
    onConfirmBooking();
  };

  const handleCancelBooking = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Modal
        open={open}
        title="确认预约"
        onClose={onClose}
        size={isMobile ? "md" : "lg"}
        cardClassName={`${isMobile ? 'min-h-[70vh]' : 'min-h-[78vh]'} flex flex-col relative`}
        closeButtonVariant="secondary"
        closeButtonText="取消"
        headerActions={
          <Button
            variant="warning"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={Object.keys(errors).length > 0 || creatingBooking || bookingCreated}
          >
            {bookingCreated ? '已创建' : creatingBooking ? '创建中...' : '确认'}
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
              预约时间：{selectedDate ? formatDate(selectedDate) : ''} {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : ''}
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
          
          {bookingCreated && emailSent && (
            <div className={`${isDarkTheme ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'} border rounded-md p-3`}>
              <p className={`text-sm ${isDarkTheme ? 'text-green-400' : 'text-green-800'}`}>
                ✓ 已发送邮件
              </p>
            </div>
          )}
        </div>
        
        {creatingBooking && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white text-sm">正在创建预约...</p>
            </div>
          </div>
        )}
      </Modal>
      
      <Modal
        open={showConfirmDialog}
        title="确认预约"
        onClose={handleCancelBooking}
        size="sm"
        showCloseButton={false}
        footer={(
          <div className="flex gap-3 justify-end">
            <Button
              variant="warning"
              size="sm"
              onClick={handleConfirmBooking}
            >
              确认
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancelBooking}
            >
              取消
            </Button>
          </div>
        )}
      >
        <p className={`${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
          请确认您的预约信息无误，点击"确认"后将开始创建预约。
        </p>
      </Modal>
    </>
  );
};

export default BookingCreateModal;
