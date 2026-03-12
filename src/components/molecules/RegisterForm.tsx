import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import { useUI } from '../../contexts/UIContext';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  onSendCode: (phone: string) => void;
  loading?: boolean;
  countdown?: number;
  showCodeInput?: boolean;
  error?: string;
}

export interface RegisterFormData {
  name: string;
  phoneNumber: string;
  email?: string;
  verificationCode: string;
}

// 使用Zod定义表单验证模式
const nameSchema = z.string()
  .min(2, '姓名至少2个字符')
  .max(50, '姓名最多50个字符');

const phoneNumberSchema = z.string()
  .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
  .min(11, '手机号长度为11位')
  .max(11, '手机号长度为11位');

const emailSchema = z.string()
  .email('请输入有效的邮箱地址')
  .or(z.literal(''))
  .optional();

const verificationCodeSchema = z.string()
  .min(4, '验证码至少为4位')
  .max(8, '验证码最多为8位')
  .regex(/^\d+$/, '验证码只能包含数字');

const formSchema = z.object({
  name: nameSchema,
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  verificationCode: verificationCodeSchema,
});

/**
 * 分子组件：注册表单
 * 使用React Hook Form + Zod实现表单验证
 * 遵循UI设计系统规范中的表单输入组件规范
 * 
 * @component
 * @example
 * <RegisterForm
 *   onSubmit={(data) => handleRegister(data)}
 *   onSendCode={(phone) => handleSendCode(phone)}
 *   loading={loading}
 *   countdown={countdown}
 * />
 */
const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSendCode,
  loading = false,
  countdown = 0,
  showCodeInput = false,
  error = ''
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur', // 失焦时验证
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      verificationCode: '',
    },
  });

  const phone = watch('phoneNumber');
  const name = watch('name');
  const verificationCode = watch('verificationCode');
  // const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [codeError, setCodeError] = React.useState('');
  
  // 获取主题状态
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.viewportWidth < 768;

  // 处理发送验证码
  const handleSendCode = (data: z.infer<typeof formSchema>) => {
    // 使用Zod验证手机号格式
    const validationResult = phoneNumberSchema.safeParse(data.phoneNumber);
    if (!validationResult.success) {
      return;
    }
    
    // setShowCodeInput(true);
    onSendCode(data.phoneNumber);
    setValue('verificationCode', '');
    setCodeError('');
  };

  // 验证验证码
  const validateCode = (value: string): boolean => {
    const validationResult = verificationCodeSchema.safeParse(value);
    setCodeError(validationResult.success ? '' : validationResult.error.issues[0].message);
    return validationResult.success;
  };

  // 处理表单提交
  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    if (!validateCode(data.verificationCode)) return;
    onSubmit(data);
  };

  // 重置表单当错误发生时
  useEffect(() => {
    if (error) {
      // setShowCodeInput(false);
      setValue('verificationCode', '');
      setCodeError('');
    }
  }, [error, setValue]);

  return (
    <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
      <h2 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>注册账号</h2>
      {error && (
        <div className={`${isDarkTheme ? 'bg-error-dark border-error-dark' : 'bg-red-50 border-red-200'} border rounded-md p-3 mb-4`}>
          <p className={`text-sm ${isDarkTheme ? 'text-white-600' : 'text-red-900'}`}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* 姓名输入 */}
        <div id="name-input-container" className="space-y-2">
          <Input
            label="姓名"
            type="text"
            placeholder="请输入您的姓名"
            error={errors.name?.message}
            fullWidth
            disabled={loading}
            {...register('name')}
          />
        </div>

        {/* 手机号输入 */}
        <div id="phone-input-container" className="space-y-2">
          <Input
            label="手机号"
            type="tel"
            placeholder="请输入手机号"
            error={errors.phoneNumber?.message}
            fullWidth
            disabled={loading}
            {...register('phoneNumber')}
          />
        </div>

        {/* 邮箱输入（可选） */}
        <div id="email-input-container" className="space-y-2">
          <Input
            label="邮箱（选填）"
            type="email"
            placeholder="请输入邮箱地址"
            error={errors.email?.message}
            fullWidth
            disabled={loading}
            {...register('email')}
          />
        </div>

        {/* 验证码输入部分 */}
        {showCodeInput ? (
          <div id="verification-code-container" className="space-y-2">
            <div id="code-input-with-button" className={`${isMobile ? 'flex flex-col items-start space-y-3' : 'flex flex-row items-end space-x-3'}`}>
              <Input
                label="验证码"
                type="text"
                placeholder="请输入验证码"
                error={errors.verificationCode?.message || codeError}
                fullWidth
                disabled={loading}
                {...register('verificationCode', {
                  onChange: (e) => {
                    if (e.target.value) {
                      validateCode(e.target.value);
                    } else {
                      setCodeError('');
                    }
                  }
                })}
              />
              <Button
                variant={countdown > 0 ? 'secondary' : 'primary'}
                disabled={loading || countdown > 0 || !phone || !name}
                onClick={() => {
                  const validationResult = phoneNumberSchema.safeParse(phone);
                  if (validationResult.success) {
                    onSendCode(phone);
                    setValue('verificationCode', '');
                    setCodeError('');
                  }
                }}
                size="md"
                className="whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={loading || !phone || !name || !!errors.phoneNumber || !!errors.name || !!errors.email}
            onClick={() => {
              const validationResult = phoneNumberSchema.safeParse(phone);
              if (validationResult.success) {
                handleSendCode({ phoneNumber: phone, name } as z.infer<typeof formSchema>);
              }
            }}
          >
            获取验证码
          </Button>
        )}

        {/* 注册按钮 */}
        {showCodeInput && (
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading || !phone || !name || !verificationCode || !!codeError}
          >
            注册
          </Button>
        )}
      </form>
    </Card>
  );
};

export default RegisterForm;