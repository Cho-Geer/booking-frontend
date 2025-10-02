import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { useUI } from '../../contexts/UIContext';

interface LoginFormProps {
  onSubmit: (phone: string, code: string) => void;
  onSendCode: (phone: string) => void;
  loading?: boolean;
  countdown?: number;
  error?: string;
}

// 使用Zod定义表单验证模式
const phoneSchema = z.string()
  .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
  .min(11, '手机号长度为11位')
  .max(11, '手机号长度为11位');

const codeSchema = z.string()
  .min(4, '验证码至少为4位')
  .max(8, '验证码最多为8位')
  .regex(/^\d+$/, '验证码只能包含数字');

const formSchema = z.object({
  phone: phoneSchema,
});

/**
 * 分子组件：登录表单
 * 使用React Hook Form + Zod实现表单验证
 * 
 * @component
 * @example
 * <LoginForm
 *   onSubmit={(phone, code) => handleSubmit(phone, code)}
 *   onSendCode={(phone) => handleSendCode(phone)}
 *   loading={loading}
 * />
 */
const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSendCode,
  loading = false,
  countdown = 0,
  error = ''
}) => {
  // 表单初始化 - 第一阶段：手机号输入
  const { register, handleSubmit: handlePhoneSubmit, formState: { errors }, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur', // 失焦时验证
  });

  const phone = watch('phone');
  const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState('');
  
  // 获取主题状态
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';

  // 处理发送验证码
  const handleSendCode = (data: z.infer<typeof formSchema>) => {
    // 使用Zod验证手机号格式
    const validationResult = phoneSchema.safeParse(data.phone);
    if (!validationResult.success) {
      return;
    }
    
    setShowCodeInput(true);
    onSendCode(data.phone);
    setCode('');
    setCodeError('');
  };

  // 验证验证码 - 修复ZodError的errors属性问题，使用issues属性
  const validateCode = (value: string): boolean => {
    const validationResult = codeSchema.safeParse(value);
    setCodeError(validationResult.success ? '' : validationResult.error.issues[0].message);
    return validationResult.success;
  };

  // 处理表单提交
  const handleFinalSubmit = (): void => {
    if (!validateCode(code)) return;
    if (!phone) return;
    
    onSubmit(phone, code);
  };

  // 重置表单当错误发生时
  useEffect(() => {
    if (error) {
      setShowCodeInput(false);
      setCode('');
      setCodeError('');
    }
  }, [error]);

  return (
    <div id="login-form-container" className="space-y-6">
      {/* 全局错误提示 */}
      {error && (
        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-error-dark' : 'text-red-600'}`}>
          {error}
        </p>
      )}

      {/* 手机号输入部分 */}
      {!showCodeInput ? (
        <form onSubmit={handlePhoneSubmit(handleSendCode)} className="space-y-4">
          <div id="phone-input-container" className="space-y-2">
            <Input
              label="手机号"
              type="tel"
              placeholder="请输入手机号"
              error={errors.phone?.message}
              fullWidth
              disabled={loading}
              {...register('phone')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading || !phone}
          >
            获取验证码
          </Button>
        </form>
      ) : (
        /* 验证码输入部分 */
        <div id="code-input-container" className="space-y-4">
          {/* 显示已输入的手机号 */}
          <div id="phone-display-container" className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              手机号
            </label>
            <p className={`px-3 py-2 rounded-md ${isDarkTheme ? 'bg-background-dark border-border-dark text-text-dark-primary' : 'bg-gray-50 border border-gray-200'}`}>
              {phone}
            </p>
          </div>

          {/* 验证码输入框 */}
          <div id="verification-code-container" className="space-y-2">
            <div id="code-input-with-button" className="flex space-x-3">
              <Input
                label="验证码"
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (e.target.value) {
                    validateCode(e.target.value);
                  } else {
                    setCodeError('');
                  }
                }}
                error={codeError}
                fullWidth
                disabled={loading || countdown > 0}
              />
              <Button
                variant={countdown > 0 ? 'secondary' : 'primary'}
                disabled={loading || countdown > 0 || !phone}
                onClick={() => {
                  const validationResult = phoneSchema.safeParse(phone);
                  if (validationResult.success) {
                    onSendCode(phone);
                    setCode('');
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

          {/* 登录按钮 */}
          <Button
            type="button"
            variant="primary"
            fullWidth
            isLoading={loading}
            onClick={handleFinalSubmit}
            disabled={loading || !phone || !code || !!codeError}
          >
            登录
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;