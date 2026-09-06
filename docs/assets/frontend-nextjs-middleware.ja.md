# Next.js Middleware（src/middleware.ts）の責務・実行タイミング・所在階層（frontend-nextjs-middleware）

> 本ドキュメントは ワークスペース `docs/frontend-nextjs-middleware.md` の日本語版である。

> 対象ファイル: `booking-frontend/src/middleware.ts`

## 1. 所在階層

```
booking-system/
├── booking-backend/          # NestJS バックエンド (ポート 3001)
└── booking-frontend/         # Next.js フロントエンド (ポート 3000)
    └── src/
        └── middleware.ts     # ← 本ドキュメントの対象
```

- Next.js 12.2 以降の Middleware ファイルは、プロジェクトルート直下の `middleware.ts` か、`src/` 配下の `src/middleware.ts` のどちらかに配置するのが公式の規約。
- 本プロジェクトは `src/middleware.ts` を採用（App Router / Pages Router どちらでも同一の規約）。
- ファイルから `middleware` 関数と `config.matcher` を export する。

## 2. 実行タイミング

| 観点 | 内容 |
|------|------|
| 実行環境 | Edge Runtime（Node.js ではない。Node 専用 API は使用不可） |
| 実行タイミング | リクエストが Next.js に到着した後、**ルーティング・ページ描画の前**に実行 |
| 実行頻度 | matcher にマッチした各リクエストごとに 1 回（リクエスト間で状態を共有しない） |
| リクエストの流れ | ブラウザ → Next.js → **middleware（ここ）** → ルーティング（rewrites 適用）→ ページ / バックエンド |

### 重要なポイント

- **リクエスト到着時にのみ実行される**。バックエンドから戻ってくるレスポンスが middleware を再度通過することはない。
- **matcher にマッチしないパスでは一切実行されない**（処理コストの削減と保護範囲の宣言）。

### 本プロジェクトでの実行対象（`config.matcher`）

```
'/', '/login', '/register', '/account-disabled',
'/admin/:path*', '/bookings/:path*', '/my-bookings/:path*'
```

- `:path*` = 0 個以上のセグメントにマッチ（例: `/admin`、`/admin/users`、`/admin/users/1`）。
- `/v1/:path*` は matcher に**含まれない**。API リクエストは rewrites（`next.config.ts`）により `http://localhost:3001/v1/*` へ直接プロキシされるため、middleware はリクエスト・レスポンスとも素通りする。

```
ブラウザ
  │  GET /v1/bookings
  ▼
Next.js Server ── middleware(実行されない: matcher外)
  │  rewrites により http://localhost:3001/v1/bookings へプロキシ
  ▼
バックエンド(3001) ── レスポンスをそのまま Next.js 経由で返す（middleware は通らない）
```

## 3. 責務

### 3.1 ルート保護（認証ゲート）

- Cookie（`access_token` / `refresh_token`）の存在により `isAuthenticated` を判定。
- 未認証で `/admin/*` を訪問 → ログインページへリダイレクト。
- 未認証でその他の非公開ルート（`/bookings/*` など）を訪問 → ログインページへリダイレクト。
- 認証は「Cookie の存在確認のみ」。トークンの検証・有効期限チェックはバックエンドの JWT Guard が担当。

### 3.2 ログインページの特殊処理（リダイレクトループ防止）

- 公開パス: `/login`、`/register`、`/account-disabled`、`/demo-ui`、`/image-gallery`、`/`。
- 認証済みユーザーが `/login` 等へアクセスした場合、Middleware 側で**ロール別リダイレクトを行わず**、クライアント側のルートガード（AuthGuard）に一元化。
  - これにより Middleware とクライアントガードの「ピンポンリダイレクト」を防止。
- 特殊パラメータあり（`csrf_error=true`、`cleared_from_disabled_page=true`、`role_changed=true` / `reason=ROLE_*`）の場合は認証 Cookie をクリアしてログインページへのアクセスを許可。

### 3.3 セキュリティヘッダの付与

matcher 対象のすべてのレスポンスに以下を設定:

- `X-XSS-Protection: 1; mode=block`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`

> 注意: `/v1/*` の API 応答には middleware が効かないため、これらのヘッダは API 応答には付与されない。

## 4. ファイル構成（機能別）

| セクション | 内容 |
|------------|------|
| `JwtPayload` / `decodeToken` | JWT ペイロード型定義とデコード関数（※現在の処理フローでは未使用の予備コード） |
| `clearAuthCookies` | `access_token` / `refresh_token` / `csrf_token` の削除 |
| `createLoginRedirect` | `redirect` / `error` / `message` パラメータ付きログインリダイレクト生成 |
| `middleware` | 上記 3.1〜3.3 のメイン処理 |
| `config.matcher` | 実行対象パスの宣言（第 2 節参照） |

## 5. 補足（書き方の標準性）

- `export const config = { matcher: [...] }` は Next.js 公式ドキュメントで規定された標準的な書き方。
- matcher パターンは path-to-regexp 構文。`:path*`（0 個以上のセグメント）や `(.*)`（正規表現相当）が使用可能。
- `matcher` は文字列でも配列でも可（配列は複数パスの OR 条件）。
- 新しいバージョンでは `has` / `missing` フィールドにより、ヘッダーやクエリの有無を条件に加えることも可能。

## 6. ブラウザでサイトを開いたときのレンダリング時系列

> 前提: 本プロジェクトは Pages Router + SSR。ページの初回ロードは「サーバー側レンダリング（SSR）」と「クライアント側ハイドレーション」の 2 段構え。

### 6.1 全体フロー

```
ユーザーが URL を入力
  │
  ▼
① リクエストが Next.js サーバーに到達
  │
  ▼
② Middleware ゲート（サーバー側・ページ描画より先に実行）
  │
  ▼
③ SSR: _app.tsx のコンポーネントツリーをサーバーで描画 → HTML 生成
  │
  ▼
④ ブラウザが HTML を受信 → 初回ペイント（FCP）
  │
  ▼
⑤ JS/CSS をダウンロード → React ハイドレーション（クライアントで再描画）
  │
  ▼
⑥ useEffect 群が実行（テーマ読み込み / 認証初期化）
  │
  ▼
⑦ AuthGuard が Redux 状態から判定 → 必要なら router.replace でリダイレクト
  │
  ▼
⑧ クライアントルーティングで目標ページを再描画（全ページリロードなし）
```

### 6.2 各フェーズの詳細

| # | フェーズ | 実行環境 | 内容 |
|---|---------|---------|------|
| ① | リクエスト受信 | サーバー | ブラウザが URL をリクエスト |
| ② | Middleware ゲート | Edge Runtime | cookie（`access_token` / `refresh_token`）の有無で認証判定。未認証の `/admin/*` や保護ルートは `/login` へリダイレクト。セキュリティヘッダ付与（§3.3）。ここでリダイレクトされた場合はページ描画は行われない |
| ③ | SSR | Node（サーバー） | `_app.tsx` の Provider スタックをサーバーで描画（§6.3 参照） |
| ④ | 初回ペイント | ブラウザ | 受信 HTML を解析・描画。この時点では操作不可 |
| ⑤ | ハイドレーション | ブラウザ | React が同じツリーをクライアントで再実行し、イベントをバインド |
| ⑥ | useEffect 群 | ブラウザ | テーマ復元・リスナー登録・認証初期化（`dispatch(initializeAuth())`） |
| ⑦ | AuthGuard 二次判定 | ブラウザ | `authInitialized` 後にロール・ルート権限を検証してリダイレクト |
| ⑧ | クライアント遷移 | ブラウザ | 以後の遷移はサーバーを経由せず `PageWrapper` が `Component` を差し替え |

### 6.3 SSR 時の各層の挙動（フェーズ③の内訳）

| 層 | SSR 時の挙動 |
|----|-------------|
| `UIProvider`（UIContext） | 初期 state のみ計算（`typeof window` ガードで SSR 安全なデフォルト値を使用） |
| `Provider store`（Redux） | 初期 state の空 store |
| `AppWithProviders` | `useAuthInitialization` は `typeof window === 'undefined'` で早期 return → 認証初期化しない |
| `AuthGuard` | `authInitialized=false` → 保護ルートではスピナー（ローディング）を描画 |
| `PageWrapper` | `ssr: false`（動的 import）→ サーバーでは描画されない |
| `Component`（ページ） | ページ本体を HTML 化 |

### 6.4 ハイドレーション後のクライアント処理（フェーズ⑥⑦）

1. **UIContext** … localStorage から `app-theme` を読んで `applyThemeToDocument()` を実行（首絵後にテーマが切り替わるため、一瞬スタイルが変わる可能性がある）。
2. **useAuthInitialization** … `dispatch(initializeAuth())` で cookie / API からセッションを復元し、Redux の `authInitialized` / `currentUser` を更新。
3. **AuthGuard** … 復元後にルート権限を判定してリダイレクト:

| シナリオ | 遷移先 |
|----------|--------|
| 未認証で保護ルートへアクセス | `/login`（`redirect` パラメータ付き） |
| 認証済みで `/` へアクセス | `/bookings`（admin は `/admin/bookings`） |
| ロールで権限なし | `/account-disabled?reason=...` |

### 6.5 重要なポイント

- 同じ 1 回のページロードで「サーバー描画 + クライアントハイドレーション」の**2 回**レンダリングが発生する。
- 認証ゲートは Middleware（サーバー、ページ前）と AuthGuard（クライアント、初期化後）の**2 段構え**で、最終判定は AuthGuard。
- 首絵（FCP）と最終画面は一致しない。テーマ切り替え（⑥）やリダイレクト（⑦）は首絵の後に発生するため、素早くリロードすると「スピナー → テーマ切替 → リダイレクト」の短い遷移が見えることがある。
- 以降のページ遷移はすべてクライアント側で行われ、サーバーを経由しない（ブラウザのリロード時のみ全フローを再実行）。
