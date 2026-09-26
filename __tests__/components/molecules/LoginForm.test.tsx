/**
 * P0/P1/P3: LoginForm molecule 単体テスト
 *
 * P0: submitCooldown — 再送・照合ボタンが dispatch 直後 5 秒間 disabled になり、
 *     その後自動的に再有効化されること
 * P1: 暫定ロック中は照合ボタンが disabled になり、残り秒付きの案内が
 *     codeError 表示経路（コード入力の error）に出ること
 * P3: details.reason に応じた誘導メッセージが表示されること
 *     （reason がない旧バックエンドではメッセージのみ＝後方互換）
 *
 * molecule は userSlice のストアシングルトンを直接購読するため、
 * テストから実ストアへ dispatch して状態を用意する。
 */
import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '@/components/molecules/LoginForm';
import { store } from '@/store';
import { restoreVerifyGuardState, verifyCode } from '@/store/userSlice';
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

const VALID_PHONE = '13800138000';
const VALID_CODE = '1234';

const EXPIRED_GUIDANCE = '验证码已失效，请点击「发送验证码」重新获取';
const MISMATCH_GUIDANCE = '验证码不正确，请重新输入';
const BACKEND_MESSAGE = '验证码错误或已过期';

/**
 * 実ページ（components/pages/LoginPage.tsx）と同じ遷移を再現するハーネス:
 * - onSendCode 呼び出し後に showCodeInput を true にする（sendCode.fulfilled 相当）
 * - onSubmit 呼び出し後に error props を表示する（slice error → error props 相当）
 */
const LoginFormHarness: React.FC<{
  onSendCode: jest.Mock;
  onSubmit: jest.Mock;
  errorAfterSubmit?: string;
}> = ({ onSendCode, onSubmit, errorAfterSubmit }) => {
  const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [error, setError] = React.useState('');
  return (
    <LoginForm
      onSubmit={(phoneNumber, code) => {
        onSubmit(phoneNumber, code);
        if (errorAfterSubmit) {
          setError(errorAfterSubmit);
        }
      }}
      onSendCode={(phoneNumber, type) => {
        onSendCode(phoneNumber, type);
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
  render(<LoginFormHarness onSendCode={onSendCode} onSubmit={onSubmit} errorAfterSubmit={errorAfterSubmit} />);
  return { onSendCode, onSubmit };
};

/** 第一段階（手机号入力）からコード入力段階へ進む */
const goToCodeStep = async () => {
  fireEvent.change(screen.getByPlaceholderText('请输入手机号'), { target: { value: VALID_PHONE } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '获取验证码' }));
    // RHF の非同期バリデーション完了まで act 内でフラッシュする
    for (let i = 0; i < 10; i += 1) {
      await Promise.resolve();
    }
  });
  expect(screen.getByPlaceholderText('请输入验证码')).toBeInTheDocument();
};

const resetGuardState = () => {
  act(() => {
    store.dispatch(restoreVerifyGuardState({ verifyAttempts: 0, lockoutUntil: null }));
  });
};

describe('LoginForm (P0: submitCooldown)', () => {
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

    fireEvent.click(resendButton);
    expect(resendButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(4999);
    });
    expect(resendButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(resendButton).not.toBeDisabled();
  });

  it('照合（登录）ボタンは dispatch 直後に 5 秒間 disabled になり、その後再有効化される', async () => {
    renderHarness();
    await goToCodeStep();

    fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: VALID_CODE } });
    const loginButton = screen.getByRole('button', { name: '登录' });
    expect(loginButton).not.toBeDisabled();

    fireEvent.click(loginButton);
    expect(loginButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(loginButton).not.toBeDisabled();
  });

  it('送信成功後の 60 秒再送待機（countdown props）は従来どおり disabled を維持する（回帰）', () => {
    render(<LoginForm onSendCode={jest.fn()} onSubmit={jest.fn()} showCodeInput countdown={60} />);
    expect(screen.getByRole('button', { name: '60秒后重发' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '60秒后重发' }).textContent).toBe('60秒后重发');
  });
});

describe('LoginForm (P1: 暫定ロック)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetGuardState();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ロック中は照合ボタンが disabled になり残り秒の案内が表示され、解除されると再有効化される', async () => {
    act(() => {
      store.dispatch(restoreVerifyGuardState({ verifyAttempts: 3, lockoutUntil: Date.now() + 30000 }));
    });
    renderHarness();
    await goToCodeStep();

    // 残り秒付きのロック案内が codeError 表示経路（コード入力の error）に出る
    expect(screen.getByText(/尝试次数过多/)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: VALID_CODE } });
    const loginButton = screen.getByRole('button', { name: '登录' });
    expect(loginButton).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(loginButton).not.toBeDisabled();
    expect(screen.queryByText(/尝试次数过多/)).not.toBeInTheDocument();
  });

  it('マウント前にアクティブなロックを復元済みの場合、初期描画から残り秒案内が出て照合ボタンが disabled になる', () => {
    act(() => {
      store.dispatch(restoreVerifyGuardState({ verifyAttempts: 3, lockoutUntil: Date.now() + 30000 }));
    });
    // コード入力段階を直接描画し、インタラクション・タイマー進行より前の初期描画を検証する
    // （lockRemaining がストアスナップショットから遅延初期化されることを保証する回帰テスト）
    render(<LoginForm onSendCode={jest.fn()} onSubmit={jest.fn()} showCodeInput countdown={0} />);

    expect(screen.getByText(/尝试次数过多/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeDisabled();
  });
});

describe('LoginForm (P3: details.reason ガイダンス)', () => {
  beforeEach(() => {
    resetGuardState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('EXPIRED のとき再取得（再送）への誘導が表示される', async () => {
    const { onSubmit } = renderHarness(BACKEND_MESSAGE);
    await goToCodeStep();

    jest
      .mocked(userApi.verifyCode)
      .mockRejectedValueOnce(Object.assign(new Error(BACKEND_MESSAGE), { details: { reason: 'EXPIRED' } }));

    fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: VALID_CODE } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    // ページ（LoginPage handleVerifyCode）と同じく verifyCode thunk を dispatch して失敗を再現
    await act(async () => {
      await store.dispatch(verifyCode({ phoneNumber: VALID_PHONE, code: VALID_CODE }));
    });

    expect(onSubmit).toHaveBeenCalled();
    expect(screen.getByText(EXPIRED_GUIDANCE)).toBeInTheDocument();
    expect(screen.getByText(BACKEND_MESSAGE)).toBeInTheDocument();
  });

  it('MISMATCH のとき再入力への誘導が表示される', async () => {
    renderHarness(BACKEND_MESSAGE);
    await goToCodeStep();

    jest
      .mocked(userApi.verifyCode)
      .mockRejectedValueOnce(Object.assign(new Error(BACKEND_MESSAGE), { details: { reason: 'MISMATCH' } }));

    fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: VALID_CODE } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await act(async () => {
      await store.dispatch(verifyCode({ phoneNumber: VALID_PHONE, code: VALID_CODE }));
    });

    expect(screen.getByText(MISMATCH_GUIDANCE)).toBeInTheDocument();
  });

  it('reason がない旧バックエンドでは誘導なしでメッセージ表示のみ（後方互換）', async () => {
    renderHarness(BACKEND_MESSAGE);
    await goToCodeStep();

    jest.mocked(userApi.verifyCode).mockRejectedValueOnce(new Error(BACKEND_MESSAGE));

    fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: VALID_CODE } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await act(async () => {
      await store.dispatch(verifyCode({ phoneNumber: VALID_PHONE, code: VALID_CODE }));
    });

    expect(screen.queryByText(EXPIRED_GUIDANCE)).not.toBeInTheDocument();
    expect(screen.queryByText(MISMATCH_GUIDANCE)).not.toBeInTheDocument();
    // 上部エラーボックスには従来どおり業務メッセージのみ
    expect(screen.getByText(BACKEND_MESSAGE)).toBeInTheDocument();
  });
});
