# Next.js フロントエンドのファイル階層図とページ遷移・権限システム（frontend-nextjs-hierarchy-permission）

> 本ドキュメントは ワークスペース `docs/frontend-nextjs-hierarchy-permission.md` の日本語版である。

> 対象: `booking-frontend/`（Pages Router + Redux Toolkit）
> 関連: `src/pages/_app.tsx` / `src/contexts/UIContext.tsx` / `src/components/providers/AuthGuard.tsx` / `src/components/wrappers/PageWrapper.tsx` / `src/components/templates/AppLayout.tsx` / `src/config/routePermissions.ts`

## 1. ファイル階層図（レンダリングのネスト順）

### 1.1 全体チェーン

```
src/pages/_app.tsx（MyApp）
  ⇒ UIContext（UIProvider）                      … UI 状態（テーマ等）の最外層 Provider
      ⇒ Redux Provider（store）                   … Redux ストア提供（AuthGuard の useSelector に必須）
          ⇒ AppWithProviders（useAuthInitialization）… 認証初期化の ON/OFF 判定（_app.tsx 内）
              ⇒ AuthGuard                         … クライアント側ルート権限ガード
                  ⇒ PageWrapper（dynamic / ssr:false）… 遅延ロード・クライアント専用
                      ⇒ AppLayout                 … 全体レイアウト（ヘッダ・サイドバー等）
                          ⇒ Component             … 現在のページ
                              ⇒ src/pages/*       … ルート定義（ファイル = URL）
                                  ⇒ src/components/pages/* … ページ実体
```

### 1.2 各層の役割

| 層 | ファイル | 役割 |
|---|---|---|
| ルート | `src/pages/_app.tsx` | 全ページの共通ラッパー。Provider 構成 + Web Vitals 計測 |
| UI 状態 | `src/contexts/UIContext.tsx` | テーマ・サイドバー・通知等の UI 状態（アプリ全体で永続） |
| 状態管理 | `src/store/index.ts` | Redux Provider（業務状態） |
| 認証初期化 | `_app.tsx` 内 `AppWithProviders` | sessionStorage フラグ判定 + `useAuthInitialization` |
| ルートガード | `src/components/providers/AuthGuard.tsx` | ロール・権限を検証してリダイレクト |
| ラッパー | `src/components/wrappers/PageWrapper.tsx` | `ssr: false` の遅延ロード。認証中スピナー表示 |
| レイアウト | `src/components/templates/AppLayout.tsx` | 共通レイアウトでページを包む |
| ルート定義 | `src/pages/*` | ファイルパス = URL（`withAuth` HOC や dynamic import で実体へ委譲） |
| ページ実体 | `src/components/pages/*` | ページの実装（LoginPage / BookingPage / AdminPage / RegisterPage） |

### 1.3 ページ層のバリエーション

| ルート定義 | 委譲先 | 備考 |
|---|---|---|
| `src/pages/login.tsx` | `components/pages/LoginPage` | 素のまま委譲 |
| `src/pages/register.tsx` | `components/pages/RegisterPage` | 素のまま委譲 |
| `src/pages/bookings.tsx` | `components/pages/BookingPage` | `withAuth` HOC で保護 |
| `src/pages/admin/bookings.tsx` | `components/pages/AdminPage` | `dynamic({ ssr: false })` + マウントガード |

### 1.4 注意: レンダリング方向とイベント方向は逆

- **レンダリング（ネスト）**: トップダウン。`_app.tsx` → … → ページ実体
- **イベント**: ボトムアップ。ページ実体の UI 操作 → handler → `dispatch(action)` → Redux 状態更新 → `useSelector` 購読コンポーネントが再レンダー

## 2. ページ遷移と権限制約のマッピングルール

### 2.1 ルール定義（`src/config/routePermissions.ts`）

パス × ロール × リダイレクト先を**宣言的**に定義:

| パス | 許可ロール | 未認証時 | 権限なし時 |
|---|---|---|---|
| `/login` `/register` `/account-disabled` `/` | 全員（public） | — | — |
| `/admin` `/admin/*` | `admin` のみ | `/login` | `/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN` |
| `/bookings` `/bookings/*` | `customer` のみ | `/login` | `/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN` |
| `/my-bookings` | `customer` + `admin` | `/login` | — |

ルックアップ関数:

- `findRouteRule(pathname)`: パスに一致するルールを探索（`exact` は完全一致、`/*` はセグメント一致）
- `hasRoutePermission(pathname, userRole)`: ロールがアクセス可能かを判定

### 2.2 権限システムの 3 層分担

| レイヤー | 内容 | 場所 |
|---|---|---|
| **定義** | パス × ロール × 遷移先のマッピング | `src/config/routePermissions.ts` |
| **適用（実行）** | ルールを参照して `router.replace()` で遷移 | `src/components/providers/AuthGuard.tsx` |
| **サーバー側ゲート** | cookie（`access_token` / `refresh_token`）の存在のみの簡易判定（ロール判定なし） | `src/middleware.ts` |

AuthGuard は認証初期化完了後に `findRouteRule` + `hasRoutePermission` を呼び、以下を `router.replace` で処理:

| シナリオ | 遷移先 |
|---|---|
| 未認証で保護ルートへアクセス | `/login`（`redirect` パラメータ付き） |
| 認証済みで `/` へアクセス | `/bookings`（admin は `/admin/bookings`） |
| ロールで権限なし | `/account-disabled?reason=...` |

### 2.3 補足

- 詳細なロール判定はクライアント側の routePermissions.ts に一元化されており、サーバー側 middleware は cookie 有無のみの簡易ゲート。
- 「マッピングルールの定義」と「実際の遷移の実行」は別レイヤー（定義 = routePermissions.ts、実行 = AuthGuard）。
