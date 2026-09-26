import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router';
import { useDispatch, useSelector } from 'react-redux';
import LoginPageOrganism from '@/components/organisms/LoginPage';
import { sendCode, verifyCode, clearError, setShowCodeInput, restoreVerifyGuardState, VERIFY_ATTEMPTS_STORAGE_KEY, VERIFY_LOCKOUT_UNTIL_STORAGE_KEY } from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';
import { useUI } from '@/contexts/UIContext';

/**
 * 页面组件：登录页面
 * 集成登录功能的页面组件，处理登录逻辑和状态管理
 * 
 * @component
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, currentUser, showCodeInput, verifyAttempts, lockoutUntil } = useSelector((state: RootState) => state.user);
  const { setLoading } = useUI();

  const [countdown, setCountdown] = useState(0);

  // P1: マウント時に localStorage から試行回数・ロック状態を復元する
  // （クライアント側限定・SSR セーフ。期限切れのロックは復元せず null に正規化する）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawAttempts = window.localStorage.getItem(VERIFY_ATTEMPTS_STORAGE_KEY);
      const rawLockout = window.localStorage.getItem(VERIFY_LOCKOUT_UNTIL_STORAGE_KEY);
      const attempts = rawAttempts === null ? 0 : Math.max(0, Math.floor(Number(rawAttempts)) || 0);
      const lockout = rawLockout === null ? null : Number(rawLockout);
      dispatch(restoreVerifyGuardState({
        verifyAttempts: attempts,
        lockoutUntil: lockout !== null && Number.isFinite(lockout) && lockout > Date.now() ? lockout : null,
      }));
    } catch (restoreError) {
      console.warn('Failed to restore verify guard state from localStorage:', restoreError);
    }
  }, [dispatch]);

  // P1: 試行回数・ロック状態を localStorage へ永続化する（reducer 内では書き込まない）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(VERIFY_ATTEMPTS_STORAGE_KEY, String(verifyAttempts));
      if (lockoutUntil === null) {
        window.localStorage.removeItem(VERIFY_LOCKOUT_UNTIL_STORAGE_KEY);
      } else {
        window.localStorage.setItem(VERIFY_LOCKOUT_UNTIL_STORAGE_KEY, String(lockoutUntil));
      }
    } catch (persistError) {
      console.warn('Failed to persist verify guard state to localStorage:', persistError);
    }
  }, [verifyAttempts, lockoutUntil]);

  // 清除错误信息当组件卸载或跳转时
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(setShowCodeInput(false));
    };
  }, [dispatch]);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  /**
   * 发送验证码
   */
  const handleSendCode = async (phoneNumber: string, type: 'login') => {
    const result = await dispatch(sendCode({ phoneNumber, type }));
    if (sendCode.fulfilled.match(result)) {
      setCountdown(60);
    }
  };

  /**
   * 验证验证码
   */
  const handleVerifyCode = (phoneNumber: string, code: string) => {
    setLoading(true);
    dispatch(verifyCode({ phoneNumber, code })).finally(() => {
      setLoading(false);
    });
  };

  return (
    <LoginPageOrganism
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
      loading={loading}
      countdown={countdown}
      showCodeInput={showCodeInput}
      error={error || undefined}
    />
  );
};

export default LoginPage;