/**
 * P0/P1/P3: RegisterForm molecule 単体テスト
 *
 * P0: submitCooldown — 再送・登録ボタンが dispatch 直後 5 秒間 disabled になり、
 *     その後自動的に再有効化されること
 * P1: 暫定ロック中は登録ボタンが disabled になり、残り秒付きの案内が
 *     codeError 表示経路（コード入力の error）に出ること
 * P3: registerUser 失敗時に details.reason に応じた誘導が表示されること
 *
 * molecule は userSlice のストアシングルトンを直接購読するため、
 * テストから実ストアへ dispatch して状態を用意する。
 */
import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from '@/components/molecules/RegisterForm';
import { store } from '@/store';
import { restoreVerifyGuardState, registerUser } from '@/store/userSlice';
import { userApi } from '@/services/userApi';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
    toggleTheme: jest.fn(),
    isMobile: false,
    viewportWidth: 1920,
  }),
}));

jest.mock('@/services/userApi');

const VALID = {
  name: '张三',
  phone: '13800138000',
  email: 'test@example.com',
  code: '1234',
};

const BACKEND_MESSAGE = '验证码错误或已过期';
const MISMATCH_GUIDANCE = '验证码不正确，请重新输入';
const LOCK_GUIDANCE_PATTERN = /尝试次数过多/;

/**
 * 実ページ（components/pages/RegisterPage.tsx）と同じ遷移を再現するハーネス:
 * onSendCode 呼び出し後に showCodeInput を true にする（sendCode.fulfilled 相当）
 */
const RegisterFormHarness: React.FC<{
  onSendCode: jest.Mock;
  onSubmit: jest.Mock;
  errorAfterSubmit?: string;
}> = ({ onSendCode, onSubmit, errorAfterSubmit }) => {
  const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [error, setError] = React.useState('');
  return (
    <RegisterForm
      onSubmit={(data) => {
        onSubmit(data);
        if (errorAfterSubmit) {
          setError(errorAfterSubmit);
        }
      }}
      onSendCode={(phone, email) => {
        onSendCode(phone, email);
        setShowCodeInput(true);
      }}
      showCodeInput={showCodeInput}
      error={error}
    />
  );
};

const renderHarness = (errorAfterSubmit?: string) => {
  const onSendCode = jest.fn();
  const onSubmit = jest.fn();
  render(
    <RegisterFormHarness onSendCode={onSendCode} onSubmit={onSubmit} errorAfterSubmit={errorAfterSubmit} />
  );
  return { onSendCode, onSubmit };
};

const fillBasicFields = () => {
  fireEvent.change(screen.getByPlaceholderText('请输入您的姓名'), { target: { value: VALID.name } });
  fireEvent.change(screen.getByPlaceholderText('请输入手机号'), { target: { value: VALID.phone } });
  fireEvent.change(screen.getByPlaceholderText('请输入邮箱地址'), { target: { value: VALID.email } });
};

/** 第一段階（基本情報入力）からコード入力段階へ進む */
const goToCodeStep = async () => {
  fillBasicFields();
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '获取验证码' }));
    // RHF の非同期バリデーション完了まで act 内でフラッシュする
    for (let i = 0; i < 10; i += 1) {
      await Promise.resolve();
    }
  });
  expect(screen.getByPlaceholderText('请输入验证码')).toBeInTheDocument();
};

const fillCode = () => {
  fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: VALID.code } });
};

const resetGuardState = () => {
  act(() => {
    store.dispatch(restoreVerifyGuardState({ verifyAttempts: 0, lockoutUntil: null }));
  });
};

/**
 * 登録ボタンをクリックし、RHF（zodResolver）の非同期バリデーション完了まで
 * act 内でマイクロタスクをフラッシュする
 */
const clickRegisterButton = async () => {
  const registerButton = screen.getByRole('button', { name: '注册' });
  await act(async () => {
    fireEvent.click(registerButton);
    for (let i = 0; i < 10; i += 1) {
      await Promise.resolve();
    }
  });
  return registerButton;
};

describe('RegisterForm (P0: submitCooldown)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetGuardState();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('再送ボタンは dispatch 直後に 5 秒間 disabled になり、その後再有効化される', async () => {
    renderHarness();
    await goToCodeStep();

    const resendButton = screen.getByRole('button', { name: '发送验证码' });
    expect(resendButton).not.toBeDisabled();

    // 再送ボタンには type 指定がなく form を submit するため（既存挙動）、
    // RHF の非同期バリデーション完了まで act 内でフラッシュする
    await act(async () => {
      fireEvent.click(resendButton);
      for (let i = 0; i < 10; i += 1) {
        await Promise.resolve();
      }
    });
    expect(resendButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(resendButton).not.toBeDisabled();
  });

  it('登録（注册）ボタンは dispatch 直後に 5 秒間 disabled になり、その後再有効化される', async () => {
    const { onSubmit } = renderHarness();
    await goToCodeStep();

    fillCode();
    const registerButton = await clickRegisterButton();
    expect(onSubmit).toHaveBeenCalled();
    expect(registerButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(registerButton).not.toBeDisabled();
  });
});

describe('RegisterForm (P1: 暫定ロック)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetGuardState();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ロック中は登録ボタンが disabled になり残り秒の案内が表示され、解除されると再有効化される', async () => {
    act(() => {
      store.dispatch(restoreVerifyGuardState({ verifyAttempts: 3, lockoutUntil: Date.now() + 30000 }));
    });
    renderHarness();
    await goToCodeStep();

    expect(screen.getByText(LOCK_GUIDANCE_PATTERN)).toBeInTheDocument();

    fillCode();
    const registerButton = screen.getByRole('button', { name: '注册' });
    expect(registerButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(registerButton).not.toBeDisabled();
    expect(screen.queryByText(LOCK_GUIDANCE_PATTERN)).not.toBeInTheDocument();
  });

  it('マウント前にアクティブなロックを復元済みの場合、初期描画から残り秒案内が出て登録ボタンが disabled になる', () => {
    act(() => {
      store.dispatch(restoreVerifyGuardState({ verifyAttempts: 3, lockoutUntil: Date.now() + 30000 }));
    });
    // コード入力段階を直接描画し、インタラクション・タイマー進行より前の初期描画を検証する
    // （lockRemaining がストアスナップショットから遅延初期化されることを保証する回帰テスト）
    render(<RegisterForm onSendCode={jest.fn()} onSubmit={jest.fn()} showCodeInput countdown={0} />);

    fillBasicFields();
    fillCode();

    expect(screen.getByText(LOCK_GUIDANCE_PATTERN)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '注册' })).toBeDisabled();
  });
});

describe('RegisterForm (P3: details.reason ガイダンス)', () => {
  beforeEach(() => {
    resetGuardState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('登録失敗（MISMATCH）のとき再入力への誘導が表示される', async () => {
    const { onSubmit } = renderHarness(BACKEND_MESSAGE);
    await goToCodeStep();

    jest
      .mocked(userApi.register)
      .mockRejectedValueOnce(Object.assign(new Error(BACKEND_MESSAGE), { details: { reason: 'MISMATCH' } }));

    fillCode();
    await clickRegisterButton();

    // ページ（RegisterPage handleRegister）と同じく registerUser thunk を dispatch して失敗を再現
    await act(async () => {
      await store.dispatch(
        registerUser({
          name: VALID.name,
          phoneNumber: VALID.phone,
          email: VALID.email,
          verificationCode: VALID.code,
        })
      );
    });

    expect(onSubmit).toHaveBeenCalled();
    expect(screen.getByText(MISMATCH_GUIDANCE)).toBeInTheDocument();
    expect(screen.getByText(BACKEND_MESSAGE)).toBeInTheDocument();
  });

  it('reason がない旧バックエンドでは誘導なしでメッセージ表示のみ（後方互換）', async () => {
    renderHarness(BACKEND_MESSAGE);
    await goToCodeStep();

    jest.mocked(userApi.register).mockRejectedValueOnce(new Error(BACKEND_MESSAGE));

    fillCode();
    await clickRegisterButton();

    await act(async () => {
      await store.dispatch(
        registerUser({
          name: VALID.name,
          phoneNumber: VALID.phone,
          email: VALID.email,
          verificationCode: VALID.code,
        })
      );
    });

    expect(screen.queryByText(MISMATCH_GUIDANCE)).not.toBeInTheDocument();
    expect(screen.getByText(BACKEND_MESSAGE)).toBeInTheDocument();
  });
});
