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

// P1: 暫定ロックの残り秒を計算する（初回描画の遅延初期化と effect の tick の
// 両方で同じ計算を使い、ロジックを 1 箇所にまとめる）
const computeRemainingSeconds = (lockoutUntil: number | null): number => {
  if (lockoutUntil === null) return 0;
  const remainingMs = lockoutUntil - Date.now();
  return remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);
};

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  onSendCode: (phone: string, email: string) => void;
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
  .min(1, '请输入邮箱')
  .email('请输入有效的邮箱地址');

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
 *   onSendCode={(phone, email) => handleSendCode(phone, email)}
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
  const email = watch('email');
  const verificationCode = watch('verificationCode');
  // const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [codeError, setCodeError] = React.useState('');
  // P0: 提出冷却（再送・登録ボタンの「失敗直後の即時再試行連打」を 5 秒抑止する）
  const [submitCooldown, setSubmitCooldown] = React.useState(false);
  // P1: 暫定ロックの残り秒（表示用）
  // ストアスナップショットから遅延初期化し、復元済みロックが初回描画から反映されるようにする
  // （サーバー描画は window が無いため 0。クライアントのハイドレーション時はストアが
  // まだ初期状態＝ロックなしのため 0 で一致し、ハイドレーション不一致は発生しない）
  const [lockRemaining, setLockRemaining] = React.useState(() =>
    typeof window !== 'undefined' ? computeRemainingSeconds(getLockoutUntilSnapshot()) : 0
  );

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

    // 邮箱为必填项，发码前同样校验格式
    const emailValidationResult = emailSchema.safeParse(data.email);
    if (!emailValidationResult.success) {
      return;
    }

    // setShowCodeInput(true);
    onSendCode(data.phoneNumber, data.email);
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

    // P0: 登録リクエストの dispatch 時（submit）にクールダウンを開始する
    setSubmitCooldown(true);
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
      const remaining = computeRemainingSeconds(lockoutUntil);
      if (remaining === 0) {
        setLockRemaining(0);
        return;
      }
      setLockRemaining(remaining);
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
  // 優先順位: ロック案内 > ローカル検証エラー > 理由ガイダンス
  // （ローカルの Zod 検証エラーが古い案内の裏に隠れないようにする）
  const codeInputError = lockGuidance || codeError || reasonGuidance;

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

        {/* 邮箱输入（必填） */}
        <div id="email-input-container" className="space-y-2">
          <Input
            label="邮箱（必填）"
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
                error={errors.verificationCode?.message || codeInputError}
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
                isLoading={loading}
                disabled={loading || countdown > 0 || submitCooldown || !phone || !name || !!errors.email}
                onClick={() => {
                  const validationResult = phoneNumberSchema.safeParse(phone);
                  const emailValidationResult = emailSchema.safeParse(email);
                  if (validationResult.success && emailValidationResult.success) {
                    // P0: 再送リクエストの dispatch 時（onClick）にクールダウンを開始する
                    setSubmitCooldown(true);
                    onSendCode(phone, email);
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
            isLoading={loading}
            disabled={loading || !phone || !name || !email || !!errors.phoneNumber || !!errors.name || !!errors.email}
            onClick={() => {
              const validationResult = phoneNumberSchema.safeParse(phone);
              if (validationResult.success) {
                handleSendCode({ phoneNumber: phone, name, email } as z.infer<typeof formSchema>);
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
            disabled={loading || !phone || !name || !verificationCode || !!codeError || submitCooldown || lockRemaining > 0}
          >
            注册
          </Button>
        )}
      </form>
    </Card>
  );
};

export default RegisterForm;