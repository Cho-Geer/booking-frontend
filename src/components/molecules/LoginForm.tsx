import React, { useEffect, useSyncExternalStore } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import { useTheme } from '@/hooks/useTheme';
import { getStoreState, store } from '@/store';
import type { VerifyFailReason } from '@/store/userSlice';

// P1/P3: userSlice の暫定ロック・照合失敗理由をストアシングルトンから購読する
// （organisms の props 契約は本対応のスコープ外のため、props 経由ではなく直接購読する）
const subscribeToUserStore = (onStoreChange: () => void) => store.subscribe(onStoreChange);
const getLockoutUntilSnapshot = () => getStoreState().user.lockoutUntil;
const getServerLockoutUntilSnapshot = (): number | null => null;
const getVerifyFailReasonSnapshot = () => getStoreState().user.lastVerifyFailReason;
const getServerVerifyFailReasonSnapshot = (): VerifyFailReason | null => null;

interface LoginFormProps {
  onSubmit: (phoneNumber: string, code: string) => void;
  onSendCode: (phoneNumber: string, type: 'login') => void;
  loading?: boolean;
  countdown?: number;
  showCodeInput: boolean;
  error?: string;
}

// 使用Zod定义表单验证模式
const phoneNumberSchema = z.string()
  .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
  .min(11, '手机号长度为11位')
  .max(11, '手机号长度为11位');

const codeSchema = z.string()
  .min(4, '验证码至少为4位')
  .max(8, '验证码最多为8位')
  .regex(/^\d+$/, '验证码只能包含数字');

const formSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

/**
 * 分子组件：登录表单
 * 使用React Hook Form + Zod实现表单验证
 * 
 * @component
 * @example
 * <LoginForm
 *   onSubmit={(phoneNumber, code) => handleSubmit(phoneNumber, code)}
 *   onSendCode={(phoneNumber) => handleSendCode(phoneNumber)}
 *   loading={loading}
 * />
 */
const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSendCode,
  loading = false,
  countdown = 0,
  showCodeInput = false,
  error = ''
}) => {
  // 表单初始化 - 第一阶段：手机号输入
  const { register, handleSubmit: handlePhoneSubmit, formState: { errors }, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur', // 失焦时验证
  });

  const phoneNumber = watch('phoneNumber');
  // const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState('');
  // P0: 提出冷却（再送・照合ボタンの「失敗直後の即時再試行連打」を 5 秒抑止する）
  const [submitCooldown, setSubmitCooldown] = React.useState(false);
  // P1: 暫定ロックの残り秒（表示用）
  const [lockRemaining, setLockRemaining] = React.useState(0);

  // P1/P3: 暫定ロック時刻・照合失敗理由をストアから購読
  const lockoutUntil = useSyncExternalStore(
    subscribeToUserStore,
    getLockoutUntilSnapshot,
    getServerLockoutUntilSnapshot
  );
  const verifyFailReason = useSyncExternalStore(
    subscribeToUserStore,
    getVerifyFailReasonSnapshot,
    getServerVerifyFailReasonSnapshot
  );
  
  // 获取主题状态
  const { isDark: isDarkTheme, isMobile } = useTheme();

  // 处理发送验证码
  const handleSendCode = (data: z.infer<typeof formSchema>) => {
    // 使用Zod验证手机号格式
    const validationResult = phoneNumberSchema.safeParse(data.phoneNumber);
    if (!validationResult.success) {
      return;
    }
    
    onSendCode(data.phoneNumber, 'login');
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
    if (!phoneNumber) return;

    // P0: 照合リクエストの dispatch 時（onClick）にクールダウンを開始する
    setSubmitCooldown(true);
    onSubmit(phoneNumber, code);
  };

  // 重置表单当错误发生时
  useEffect(() => {
    if (error) {
      setCode('');
      setCodeError('');
    }
  }, [error]);

  // P0: 提出冷却は 5 秒で解除（既存 countdown と同じ useEffect + setTimeout 連鎖パターン）
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (submitCooldown) {
      timer = setTimeout(() => setSubmitCooldown(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [submitCooldown]);

  // P1: 暫定ロックの残り秒を 1 秒ごとに更新する（同様に setTimeout 連鎖パターン）
  useEffect(() => {
    if (lockoutUntil === null) {
      setLockRemaining(0);
      return;
    }
    let timer: NodeJS.Timeout | undefined;
    const tick = () => {
      const remainingMs = lockoutUntil - Date.now();
      if (remainingMs <= 0) {
        setLockRemaining(0);
        return;
      }
      setLockRemaining(Math.ceil(remainingMs / 1000));
      timer = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(timer);
  }, [lockoutUntil]);

  // P1: ロック中の案内（残り秒付き）。codeError 表示経路（Input の error）で見せる
  const lockGuidance = lockRemaining > 0 ? `尝试次数过多，请等待 ${lockRemaining} 秒后再试` : '';
  // P3: 失敗理由に応じた誘導（直前の失敗エラーが表示されている間のみ）
  // EXPIRED / EXHAUSTED は再取得（再送ボタン）へ、MISMATCH は再入力へ誘導する
  // reason が無い旧バックエンドでは空文字＝メッセージ表示のみで後方互換を維持する
  const reasonGuidance = error
    ? (verifyFailReason === 'EXPIRED' || verifyFailReason === 'EXHAUSTED'
        ? '验证码已失效，请点击「发送验证码」重新获取'
        : verifyFailReason === 'MISMATCH'
          ? '验证码不正确，请重新输入'
          : '')
    : '';
  const codeInputError = lockGuidance || reasonGuidance || codeError;

  return (
    <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
      <h2 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>登录账号</h2>
      {error && (
        <div className={`${isDarkTheme ? 'bg-error-dark border-error-dark' : 'bg-red-50 border-red-200'} border rounded-md p-3 mb-4`}>
          <p className={`text-sm ${isDarkTheme ? 'text-white-600' : 'text-red-900'}`}>{error}</p>
        </div>
      )}

      {/* 手机号输入部分 */}
      {!showCodeInput ? (
        <form onSubmit={handlePhoneSubmit(handleSendCode)} className="space-y-4">
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading || !phoneNumber}
          >
            获取验证码
          </Button>
        </form>
      ) : (
        /* 验证码输入部分 */
        <div id="code-input-container" className="space-y-4">
          {/* 显示已输入的手机号 */}
          <div id="phone-display-container" className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-700'}`}>
              手机号
            </label>
            <p className={`px-3 py-2 rounded-md ${isDarkTheme ? 'bg-background-dark border-border-dark text-text-dark-primary' : 'bg-gray-50 border border-gray-200'}`}>
              {phoneNumber}
            </p>
          </div>

          {/* 验证码输入框 */}
          <div id="verification-code-container" className="space-y-2">
              <div id="code-input-with-button" className={`${isMobile ? 'flex flex-col items-start space-y-3' : 'flex flex-row items-end space-x-3'}`}>
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
                error={codeInputError}
                fullWidth
                disabled={loading}
              />
              <Button
                variant={countdown > 0 ? 'secondary' : 'primary'}
                isLoading={loading}
                disabled={loading || countdown > 0 || submitCooldown || !phoneNumber}
                onClick={() => {
                  const validationResult = phoneNumberSchema.safeParse(phoneNumber);
                  if (validationResult.success) {
                    // P0: 再送リクエストの dispatch 時（onClick）にクールダウンを開始する
                    setSubmitCooldown(true);
                    onSendCode(phoneNumber, 'login');
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
            disabled={loading || !phoneNumber || !code || !!codeError || submitCooldown || lockRemaining > 0}
          >
            登录
          </Button>
        </div>
      )}
    </Card>
  );
};

export default LoginForm;