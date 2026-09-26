import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/compat/router';
import { useDispatch, useSelector } from 'react-redux';
import RegisterPageOrganism from '@/components/organisms/RegisterPage';
import { registerUser, sendCode, clearError, setShowCodeInput, restoreVerifyGuardState, VERIFY_ATTEMPTS_STORAGE_KEY, VERIFY_LOCKOUT_UNTIL_STORAGE_KEY } from '@/store/userSlice';
import { AppDispatch, RootState } from '@/store';
import { RegisterFormData } from '@/components/molecules/RegisterForm';
import { useUI } from '@/contexts/UIContext';

/**
 * 页面组件：注册页面
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { setLoading } = useUI();
  
  // 清除错误信息当组件卸载或跳转时
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(setShowCodeInput(false));
    };
  }, [dispatch]);

  const { loading, error, currentUser, showCodeInput, verifyAttempts, lockoutUntil } = useSelector((state: RootState) => state.user);
  const [countdown, setCountdown] = useState(0);

  // P1: 復元完了フラグ（localStorage への初回永続化が復元前の旧値を書き込むのを防ぐ）
  const restoredRef = useRef(false);

  // P1: 試行回数・ロック状態を localStorage へ永続化する（reducer 内では書き込まない）
  // マウント直後の初回実行は復元前の値（attempts=0 / lockout=null）を閉じ込めるため、
  // 復元 effect が完了するまで（restoredRef が true になるまで）スキップする
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!restoredRef.current) return;
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
    // 復元ステップ完了後に永続化を解禁する（復元に失敗した場合も解禁してガードが沈黙しないようにする）
    restoredRef.current = true;
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
   * 处理用户注册
   */
  const handleRegister = (data: RegisterFormData) => {
    setLoading(true);
    dispatch(registerUser(data)).finally(() => {
      setLoading(false);
    });
  };

  /**
   * 处理发送验证码
   * 発码リクエストが成功した場合のみカウントダウンを開始する
   * （邮箱重複などの失敗時はコード入力欄・カウントダウン・登録ボタンの状態を一切変えない）
   */
  const handleSendCode = async (phoneNumber: string, email: string) => {
    const result = await dispatch(sendCode({ phoneNumber, type: 'register', email }));
    if (sendCode.fulfilled.match(result)) {
      setCountdown(60);
    }
  };

  return (
    <RegisterPageOrganism
      onSubmit={handleRegister}
      onSendCode={handleSendCode}
      loading={loading}
      countdown={countdown}
      showCodeInput={showCodeInput}
      error={error || undefined}
    />
  );
};

export default RegisterPage;