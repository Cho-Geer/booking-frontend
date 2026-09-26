/**
 * P2: api.ts response interceptor の 429 + Retry-After ハンドリング 単体テスト
 * P3: error.details の customError への透過テスト
 *
 * axios インスタンスに登録された rejection ハンドラを直接呼び出して検証する
 * （axios 1.x の InterceptorManager は handlers 配列を公開している。
 *   api.ts では response.use の rejection ハンドラは 1 件のみ登録）。
 */
import api from '@/services/api';

interface FakeAxiosError {
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    _retry?: boolean;
  };
  response?: {
    status?: number;
    headers?: Record<string, string>;
    data?: Record<string, unknown>;
  };
  message?: string;
}

type RejectionHandler = (error: FakeAxiosError) => Promise<never>;
type RejectedValue = Error & { status?: number; retryAfter?: number; details?: unknown; response?: unknown };

const getResponseRejectionHandler = (): RejectionHandler => {
  const manager = api.interceptors.response as unknown as {
    handlers: Array<{ rejected?: RejectionHandler }>;
  };
  expect(manager.handlers).toHaveLength(1);
  const rejected = manager.handlers[0].rejected;
  expect(typeof rejected).toBe('function');
  return rejected as RejectionHandler;
};

const makeError = (overrides: FakeAxiosError = {}): FakeAxiosError => ({
  config: { url: '/auth/login', method: 'post' },
  response: { status: 429, headers: {}, data: {} },
  message: 'Request failed with status code 429',
  ...overrides,
});

describe('api response interceptor (P2: 429 + Retry-After / P3: details)', () => {
  let rejectionHandler: RejectionHandler;

  beforeAll(() => {
    rejectionHandler = getResponseRejectionHandler();
  });

  const catchRejection = async (error: FakeAxiosError): Promise<RejectedValue> => {
    return rejectionHandler(error).then(
      () => {
        throw new Error('handler must reject');
      },
      (err: RejectedValue) => err
    );
  };

  it('429 + 数値の Retry-After で customError.retryAfter に秒数が設定される', async () => {
    const rejected = await catchRejection(
      makeError({
        response: { status: 429, headers: { 'retry-after': '30' }, data: { message: '请求过于频繁' } },
      })
    );
    expect(rejected).toBeInstanceOf(Error);
    expect(rejected.message).toBe('请求过于频繁');
    expect(rejected.status).toBe(429);
    expect(rejected.retryAfter).toBe(30);
  });

  it('大文字始まりの Retry-After ヘッダにもフォールバックする', async () => {
    const rejected = await catchRejection(
      makeError({
        response: { status: 429, headers: { 'Retry-After': '12' }, data: {} },
      })
    );
    expect(rejected.retryAfter).toBe(12);
  });

  it('Retry-After が HTTP-date 形式の場合 retryAfter は undefined になる', async () => {
    const rejected = await catchRejection(
      makeError({
        response: {
          status: 429,
          headers: { 'retry-after': 'Wed, 21 Oct 2026 07:28:00 GMT' },
          data: {},
        },
      })
    );
    expect(rejected).toHaveProperty('retryAfter', undefined);
  });

  it('Retry-After が数値解析不能な場合も retryAfter は undefined になる', async () => {
    const rejected = await catchRejection(
      makeError({
        response: { status: 429, headers: { 'retry-after': 'soon' }, data: {} },
      })
    );
    expect(rejected).toHaveProperty('retryAfter', undefined);
  });

  it('Retry-After が 0 の場合は 0 が設定される（0 以上は有効）', async () => {
    const rejected = await catchRejection(
      makeError({
        response: { status: 429, headers: { 'retry-after': '0' }, data: {} },
      })
    );
    expect(rejected.retryAfter).toBe(0);
  });

  it('429 は 401 リフレッシュ・ログインリダイレクトの経路に到達しない', async () => {
    const originalRequest: NonNullable<FakeAxiosError['config']> = {
      url: '/auth/login',
      method: 'post',
    };
    const rejected = await catchRejection(
      makeError({
        config: originalRequest,
        response: { status: 429, headers: { 'retry-after': '60' }, data: { message: 'too many' } },
      })
    );
    // 429 専用分岐で即 reject（refresh 試行・リダイレクトの副作用なし）
    expect(rejected.status).toBe(429);
    expect(rejected.retryAfter).toBe(60);
    // 401 リフレッシュ用の _retry フラグが立ったまま返ってこない
    expect(originalRequest._retry).toBeUndefined();
  });

  it('429 以外（500）は従来どおり: メッセージ正規化 + retryAfter なし（回帰）', async () => {
    const rejected = await catchRejection(
      makeError({
        response: { status: 500, headers: {}, data: { message: '服务器错误' } },
      })
    );
    expect(rejected.message).toBe('服务器错误');
    expect(rejected.status).toBe(500);
    // 非旧 429 経路では retryAfter プロパティ自体が生えない（従来挙動のまま）
    expect(rejected.retryAfter).toBeUndefined();
    expect(rejected.response).toBeDefined();
  });

  it('401 + auth 系 URL は refresh せず即 reject する（回帰）', async () => {
    const rejected = await catchRejection(
      makeError({
        config: { url: '/auth/login', method: 'post' },
        response: { status: 401, headers: {}, data: { message: '验证码错误' } },
      })
    );
    expect(rejected.message).toBe('验证码错误');
    expect(rejected.status).toBe(401);
    expect(rejected.retryAfter).toBeUndefined();
  });

  it('P3: 後端 envelope の error.details が customError.details に透過される', async () => {
    const rejected = await catchRejection(
      makeError({
        config: { url: '/auth/login', method: 'post' },
        response: {
          status: 401,
          headers: {},
          data: {
            message: '验证码错误或已过期',
            error: { code: 'VERIFICATION_CODE_ERROR', message: '验证码错误或已过期', details: { reason: 'EXHAUSTED' } },
          },
        },
      })
    );
    expect(rejected.message).toBe('验证码错误或已过期');
    expect(rejected.details).toEqual({ reason: 'EXHAUSTED' });
  });
});
