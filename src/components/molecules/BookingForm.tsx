import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import Textarea from '../atoms/Textarea';
import { useUI } from '../../contexts/UIContext';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingFormProps {
  selectedDate: string;
  selectedSlot: TimeSlot | null;
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
  onCancel: () => void;
  creatingBooking: boolean;
}

// 使用Zod定义表单验证模式
const formSchema = z.object({
  customerName: z.string().min(1, '请输入姓名').max(20, '姓名不能超过20个字符'),
  customerPhone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  customerEmail: z.string().email('请输入正确的邮箱').optional().or(z.literal('')),
  customerWechat: z.string().max(50, '微信号不能超过50个字符').optional(),
  notes: z.string().max(200, '备注信息不能超过200个字符').optional(),
});

/**
 * 分子组件：预约表单
 * 使用React Hook Form + Zod实现表单验证
 * 
 * @component
 * @example
 * <BookingForm 
 *   selectedDate="2023-06-01"
 *   selectedSlot={{ startTime: "09:00", endTime: "10:00", available: true }}
 *   notes=""
 *   onNotesChange={(notes) => console.log(notes)}
 *   onSubmit={() => console.log("submit")}
 *   onCancel={() => console.log("cancel")}
 *   creatingBooking={false}
 * /
 */
const BookingForm: React.FC<BookingFormProps> = ({
  selectedDate,
  selectedSlot,
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
  onCancel,
  creatingBooking
}) => {
  // 获取主题状态
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';

  // 表单初始化
  const { 
    handleSubmit, 
    setValue, 
    register,
    formState: { errors } 
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur', // 失焦时验证
    defaultValues: {
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      customerWechat: customerWechat || '',
      notes: notes || ''
    }
  });

  // 当外部属性变化时，同步到表单
  React.useEffect(() => {
    setValue('customerName', customerName || '', { shouldValidate: false });
    setValue('customerPhone', customerPhone || '', { shouldValidate: false });
    setValue('customerEmail', customerEmail || '', { shouldValidate: false });
    setValue('customerWechat', customerWechat || '', { shouldValidate: false });
    setValue('notes', notes || '', { shouldValidate: false });
  }, [customerName, customerPhone, customerEmail, customerWechat, notes, setValue]);

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string): string => {
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
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // 表单提交处理
  const handleFormSubmit = (data: z.infer<typeof formSchema>): void => {
    onCustomerNameChange(data.customerName);
    onCustomerPhoneChange(data.customerPhone);
    onCustomerEmailChange(data.customerEmail || '');
    onCustomerWechatChange(data.customerWechat || '');
    onNotesChange(data.notes || '');
    onSubmit();
  };

  return (
    <Card className="p-6">
      <h2 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>确认预约</h2>
      <div id="booking-time-info" className="mb-4">
        <p className={`text-sm ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
          预约时间: {formatDate(selectedDate)} {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : ''}
        </p>
      </div>
      
      {/* 客户信息表单 */}
      <div id="customer-info-form" className="space-y-4 mb-6">
        <Input
          id="customerName"
          type="text"
          label="姓名 <span className='text-red-500'>*</span>"
          placeholder="请输入您的姓名"
          error={errors.customerName?.message}
          fullWidth
          {...register('customerName')}
          onChange={(e) => {
            onCustomerNameChange(e.target.value);
            setValue('customerName', e.target.value);
          }}
        />
        
        <Input
          id="customerPhone"
          type="tel"
          label="手机号 <span className='text-red-500'>*</span>"
          placeholder="请输入您的手机号"
          error={errors.customerPhone?.message}
          fullWidth
          {...register('customerPhone')}
          onChange={(e) => {
            onCustomerPhoneChange(e.target.value);
            setValue('customerPhone', e.target.value);
          }}
        />
        
        <Input
          id="customerEmail"
          type="email"
          label="邮箱（选填）"
          placeholder="请输入您的邮箱"
          error={errors.customerEmail?.message}
          fullWidth
          {...register('customerEmail')}
          onChange={(e) => {
            onCustomerEmailChange(e.target.value);
            setValue('customerEmail', e.target.value);
          }}
        />
        
        <Input
          id="customerWechat"
          type="text"
          label="微信（选填）"
          placeholder="请输入您的微信号"
          error={errors.customerWechat?.message}
          fullWidth
          {...register('customerWechat')}
          onChange={(e) => {
            onCustomerWechatChange(e.target.value);
            setValue('customerWechat', e.target.value);
          }}
        />
      </div>
      
      <Textarea
        id="notes"
        label="备注（可选）"
        rows={3}
        placeholder="请输入特殊需求或备注信息"
        error={errors.notes?.message}
        fullWidth
        value={notes}
        onChange={(e) => {
          onNotesChange(e.target.value);
          setValue('notes', e.target.value);
        }}
      />
      <div id="form-spacing" className="mt-4" />
      <div id="form-actions" className="flex space-x-4">
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          fullWidth
          isLoading={creatingBooking}
          disabled={Object.keys(errors).length > 0}
        >
          {creatingBooking ? '创建中...' : '确认预约'}
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          fullWidth
        >
          取消
        </Button>
      </div>
    </Card>
  );
};

export default BookingForm;