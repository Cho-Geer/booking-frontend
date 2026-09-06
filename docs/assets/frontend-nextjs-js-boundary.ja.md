# Next.js フロントエンドにおけるフロント/バック JS 混在の境界（frontend-nextjs-js-boundary）

> 本ドキュメントは ワークスペース `docs/frontend-nextjs-js-boundary.md` の日本語版である。

> 対象: `booking-frontend/` 配下の JS/TS コードの実行環境ごとの分類

## 1. 結論

booking-frontend には**サーバー側 JS とブラウザ側 JS が同じリポジトリ・同じ `src/` 配下に同居**している。
ただしこれは Next.js のフルスタック設計による**正常な構成**であり、業務のバックエンド API は別プロジェクト（`booking-backend` / NestJS / ポート 3001）に分離されている。

フロント側のサーバーコードは**認証ゲート・プロキシ・SSR 描画というインフラ層に限定**されている。

```
booking-system/
├── booking-frontend/   # Next.js（サーバー側 JS とブラウザ側 JS が混在）
└── booking-backend/    # NestJS（業務 API 本体・ポート 3001）
```

## 2. 実行環境ごとの分類

### 2.1 サーバー側で実行される JS

| ファイル | 実行環境 | 役割 |
|---|---|---|
| `src/middleware.ts` | Edge Runtime | JWT cookie 認証ゲート、リダイレクト、セキュリティヘッダ |
| `next.config.ts` | Node（ビルド/起動時） | `rewrites` で `/v1/*` → `http://localhost:3001/v1/*` のプロキシ |
| `src/pages/*.tsx`（Pages Router） | SSR 時は Node | ページコンポーネント（SSR ではサーバー側でも描画される） |
| `next.config.container.mjs` / `Dockerfile` / 起動スクリプト | サーバー運用 | コンテナ化・起動管理 |

### 2.2 ブラウザ側で実行される JS

| ディレクトリ | 役割 |
|---|---|
| `src/components/` | UI コンポーネント（Atomic Design） |
| `src/store/` | Redux Toolkit による状態管理 |
| `src/services/` | axios API クライアント（`document.cookie` を参照するブラウザ専用コード） |
| `src/hooks/` / `src/contexts/` / `src/utils/` | クライアントロジック |

### 2.3 両環境で実行される JS（環境分岐コード）

| ファイル | 分岐方法 |
|---|---|
| `src/pages/_app.tsx` | `typeof window === 'undefined'` で SSR / クライアントを分岐 |
| `src/contexts/UIContext.tsx` | 初期 state と useEffect 群を `typeof window` ガードで分岐 |
| `src/hooks/useAuthInitialization.ts` | SSR 時は早期 return、クライアントのみ `dispatch(initializeAuth())` |
| `src/types/` / `src/constants/` | 環境非依存の共通コード（分岐なし） |

## 3. 境界の仕組み

混在の境界は**実行環境（`typeof window` / Edge vs Node）で明確に分かれている**。

```
                    booking-frontend（Next.js）
┌─────────────────────────────────────────────────┐
│  サーバー側       middleware.ts（Edge）            │
│                  rewrites（Node）                 │
│                  SSR 描画（Node）                  │
├─────────────────────────────────────────────────┤
│  ブラウザ側       components / store / services   │
│                  hooks / contexts / utils         │
└─────────────────────────────────────────────────┘
        │ rewrites /v1/* プロキシ
        ▼
booking-backend（NestJS・ポート3001）← 業務 API 本体
```

### 混在に見えるが実際は別物のもの

- **`src/pages/api/**` は存在しない**（Next.js の API ルート＝サーバー側エンドポイントは一切作られていない）。サーバー側の「API」はプロキシと認証ゲートのみ。
- `devDependencies` の `ioredis` / `testcontainers` は**テスト用**（Node 環境でインテグレーションテストを起動するため）。本番アプリのバックエンドではなく、Redis は `booking-backend` 側の関心事。

## 4. 補足

- Next.js はフルスタックフレームワーク。Pages Router ではページがデフォルトで SSR され、Middleware もサーバー側で動くため、「1 つの JS コードベースにサーバー用・クライアント用が混在する」のはフレームワークの設計仕様。
- 新規にサーバー側コードを追加する場合は、実行環境（Edge Runtime / Node / ブラウザ）を明示してから実装すること。
- ブラウザ専用 API（`document` / `window` / `localStorage`）を参照するコードは、必ず `typeof` ガードまたは `useEffect` 内で実行すること（SSR エラー防止）。
