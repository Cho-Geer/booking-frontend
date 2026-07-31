# CRM 予約プラットフォーム フロントエンド

CRM 予約プラットフォームの Next.js フロントエンドです。

このアプリケーションは、ログイン、登録、予約管理、サービス閲覧、アカウント状態処理のユーザーおよび管理画面を提供します。NestJS バックエンドと `/v1` API で連携し、クライアント状態管理には Redux Toolkit を使用しています。

詳細なエンドポイント仕様: [docs/api-contract.md](./docs/api-contract.md)

## 技術スタック

- Next.js 15 (Pages Router)
- React 19
- TypeScript
- Redux Toolkit
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Framer Motion
- Jest
- React Testing Library

## 現在のアプリ構成

`src` 配下の主要フォルダ:

- `pages/` — ルートエントリポイント
- `components/` — UI コンポーネントの組み立て
- `services/` — API クライアント
- `store/` — Redux スライスとストア設定
- `contexts/` — UI / 予約関連のコンテキスト
- `hooks/` — 共通クライアントフック
- `types/` — 共通 TypeScript モデル
- `utils/` — ヘルパー関数

## 実装済みルート

現在のページファイルが定義するルート:

- `/`
- `/login`
- `/register`
- `/bookings`
- `/admin/bookings`
- `/account-disabled`

補足:

- `/` は未認証ユーザーにはログインページを表示し、認証済みユーザーをアプリ内へリダイレクトします。
- `/bookings` は保護されています。
- `/admin/bookings` が現在の管理画面エントリーページです。
- ミドルウェアには `/my-bookings` のロジックも含まれていますが、現在のコードベースには該当ページファイルがありません。

## ランタイム機能

- ログイン・登録フロー
- HttpOnly Cookie ベースの JWT + リフレッシュトークン認証
- 変更リクエストに対する CSRF トークン転送
- 認証状態に基づくルート保護
- ロールベースの管理者ルーティング
- 予約の作成・更新 UI
- API クライアント経由のサービス・スロット取得
- 管理者用予約管理ページ
- アカウント無効化 / ロール変更のハンドリング
- アプリ全体の Redux ストア
- アプリ状態と UI コンテキストによる通知表示

## API 連携

API リクエストは [src/services/api.ts](./src/services/api.ts) を通じて送信されます。

バックエンド API はローカルで次のアドレスで動作します:

```text
http://localhost:3001
```

現在のデフォルト API ベース URL:

```text
http://localhost:3001/v1
```

`next.config.ts` では開発時に `/v1/:path*` を `http://localhost:3001/v1/:path*` へリライトするため、ローカルのフロントエンド開発はバックエンド README と同じ `/v1` 規約に沿って行えます。

### このブランチの主要契約

フロントエンドは以下のバックエンドエンドポイントを予約フローの主要契約として扱います:

- `/v1/bookings/all`
- `/v1/time-slots/available-slots`
- 日付ベースの予約ビューが必要な場面では `/v1/bookings/by-date`

重要なルール:

- フロントエンドは通常ユーザーと管理者の双方で `/bookings/all` を共通エンドポイントとして使用します。
- 通常ユーザーを本人の予約のみに絞り込むのはバックエンドの責務です。
- このブランチでは `/bookings/me` を契約依存として想定しません。

### 現在のコードにおける API 利用例

- `GET /v1/bookings/all`
  現在の予約 API クライアントが使用する主要な予約一覧エンドポイント。

- `GET /v1/bookings/by-date?date=YYYY-MM-DD`
  日付指定の予約検索に使用。

- `GET /v1/time-slots/available-slots?date=YYYY-MM-DD`
  スロット空き状況のクエリに使用。

現在のフロントエンドサービスモジュール:

- `adminApi.ts`
- `bookingApi.ts`
- `notificationApi.ts`
- `serviceApi.ts`
- `slotTimeApi.ts`
- `systemApi.ts`
- `userApi.ts`

これらはフロントエンドのクライアント層を表します。ここで参照されるエンドポイントの一部は、現時点でバックエンドアプリに配線されていない機能に依存している可能性があるため、保証されたバックエンド実装ではなくフロントエンド契約として扱ってください。

## 状態管理

現在のアプリは [src/store/index.ts](./src/store/index.ts) で以下の Redux スライスを設定しています:

- `user`
- `booking`
- `service`
- `slotTime`
- `notification`
- `admin`

アプリは [src/pages/_app.tsx](./src/pages/_app.tsx) で Redux の `Provider` と `UIProvider` でラップされています。

## フォームとバリデーション

現在のコードベースで実際に使用されているもの:

- `react-hook-form`
- `zod`

例:

- `src/components/molecules/LoginForm.tsx`
- `src/components/molecules/RegisterForm.tsx`
- `src/components/molecules/BookingCreateModal.tsx`
- `src/components/molecules/BookingUpdateModal.tsx`

## スタイリング

現在の実装で使用しているもの:

- Tailwind CSS ユーティリティ
- `src/components` 配下のカスタムコンポーネント
- 一部のアニメーション UI に対する Framer Motion

依存関係には `antd` と `@tanstack/react-query` も含まれていますが、現在のコードベースでは主要なアプリの配線に明確に使われていないため、ここでの主なランタイムフローには含めていません。

## 環境

サンプル env ファイルが用意されています:

- `.env.development.example`
- `.env.production.example`

プロジェクトのルートに `.env.development` を作成してください:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_INSTANCE_NAME=dev
```

これにより、ローカルフロントエンドのリクエストは `http://localhost:3001/v1` のバックエンド契約と整合します。

**環境変数の標準化**

フロントエンドとバックエンドは一貫性のために標準化された環境変数を使用しています。

| 変数 | 用途 | デフォルト値 |
|----------|---------|---------------|
| `NEXT_PUBLIC_API_URL` | バックエンド API のベース URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_WS_URL` | リアルタイム更新用 WebSocket URL | `ws://localhost:3001/ws` |
| `NEXT_PUBLIC_INSTANCE_NAME` | マルチテナント構成向けインスタンス識別子 | `dev` |

**CI/CD 連携**
フロントエンド CI ワークフロー (`frontend-ci.yml`) はバックエンド CI と同じ環境変数値を使用しており、リポジトリ間で一貫したテストを保証します。E2E テストはフロントエンドとバックエンドサービス間の統合フローを検証します。

## フロントエンド開発環境設定

### 設定ファイル

フロントエンドはローカル開発向けにテンプレートベースの設定を採用しています。

1. **テンプレートファイル**: `.env.development.example`
   - コメント付きで全フロントエンド環境変数を記載
   - バージョン管理に含めても安全
   - 各環境 (ローカル、Docker、本番) の API エンドポイント指針を含む

2. **個人設定**: `.env.development`
   - テンプレートからコピーして作成
   - 実際の開発値を記載
   - **絶対にコミットしない** (`.gitignore` に含まれる)

3. **初期化スクリプト**: `scripts/init-local-env.sh`
   - 設定セットアップ処理を自動化
   - 対話的な案内と環境選択を提供
   - 既存設定のバックアップをサポート

### クイックセットアップ

```bash
# 1. 初期化スクリプトを実行
./scripts/init-local-env.sh

# 2. スクリプトがテンプレートから .env.development を作成します
#    開発環境に応じて API エンドポイントを調整してください

# 3. 開発サーバーを起動
npm run dev
```

### 環境別設定

フロントエンド設定は複数の開発環境をサポートします。

| 環境 | NEXT_PUBLIC_API_URL | NEXT_PUBLIC_WS_URL | 説明 |
|-------------|---------------------|-------------------|-------------|
| ローカル開発 | `http://localhost:3001/v1` | `ws://localhost:3001/ws` | バックエンドとフロントエンドをローカルで起動 |
| Docker Compose | `http://booking-backend:3001/v1` | `ws://booking-backend:3001/ws` | 両サービスを Docker コンテナで起動 |
| 本番 | `https://api.yourdomain.com/v1` | `wss://api.yourdomain.com/ws` | ライブの本番環境 |

### 設定変数

| 変数 | 説明 | デフォルト値 |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | バックエンド API のベース URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_WS_URL` | リアルタイム更新用 WebSocket URL | `ws://localhost:3001/ws` |
| `NEXT_PUBLIC_INSTANCE_NAME` | インスタンス識別子 | `dev` |

### セキュリティ上の注意

- フロントエンドの環境変数はブラウザに公開されます
- 機密情報 (API キー、パスワード など) は**絶対に**フロントエンド設定に置かないでください
- 機密操作はすべてバックエンド API 経由で行ってください
- 本番環境では HTTPS/WSS を使用してください

### トラブルシューティング

- **設定が見つからない**: `./scripts/init-local-env.sh` を実行して作成してください
- **権限拒否**: スクリプトに実行権限を付与: `chmod +x scripts/init-local-env.sh`
- **テンプレートが見つからない**: `.env.development.example` がプロジェクトルートに存在することを確認してください
- **API 接続の問題**: バックエンドが起動していてアクセス可能か確認してください

## ローカル開発

**リライト設定を使った開発 (推奨)**

ローカル開発では、API リクエストをバックエンドへプロキシする Next.js リライトルールを使用するように構成されています。このアプローチは次の利点があります。

1. **CORS 問題の解消** — すべて同一オリジン (`localhost:3000`) 経由のリクエストとなるため
2. **環境設定の簡素化** — バックエンド側で CORS を設定する必要なし
3. **本番ルーティングと一致** — 本番でリバースプロキシが動作するのと同様

`next.config.ts` のリライト設定により、`/v1/*` へのリクエストは自動的に `http://localhost:3001/v1/*` へルーティングされます。これにより、フロントエンドコードでは相対 URL (`/v1/health`) をクロスオリジンを気にせずに使えます。

**代替: 直接 API 呼び出し**
直接 API 呼び出しが必要な場合 (curl や Postman など) は、`http://localhost:3001/v1/*` でバックエンドに直接アクセスできます。ただし、通常の開発ではリライト方式を推奨します。

**複数インスタンススクリプトに関する注記**: リポジトリには旧来の複数インスタンスデプロイ用スクリプト (`start-frontend-instances.sh`) が含まれていますが、これらは過去のデプロイ戦略で使われていたもので、現在は歴史的参照用に保持されています。新規開発ではリライト設定によるシングルインスタンス方式を使用してください。

依存関係をインストール:

```bash
npm install
```

開発サーバーを起動:

```bash
npm run dev
```

Next.js アプリは `http://localhost:3000` でローカル起動し、`http://localhost:3001` のバックエンド API と通信します。

ブラウザで次を開いてください:

```text
http://localhost:3000
```

## ビルドと起動

ビルド:

```bash
npm run build
```

本番サーバーを起動:

```bash
npm start
```

## 品質とテスト

Lint:

```bash
npm run lint
```

Lint の自動修正:

```bash
npm run lint:fix
```

型チェック:

```bash
npm run check
```

テスト実行:

```bash
npm run test
```

カバレッジ:

```bash
npm run test:coverage
```

## リポジトリ横断 E2E テスト

フロントエンド CI にはリポジトリ横断の E2E テストワークフローが含まれており、次のことを行います。

1. **両リポジトリをチェックアウト** — フロントエンドとバックエンドを同じ CI ランナーにクローン
2. **標準化されたインフラをセットアップ** — PostgreSQL 16 と Redis 7-alpine (バックエンド CI と同じバージョン) を使用
3. **統合テストをフル実行** — 3 つの主要ユーザーフローを検証
   - 認証コードによるユーザーログイン
   - 未来日時の予約可能スロット照会
   - 予約ページからの予約作成

**E2E テストフロー:**
1. バックエンドサービスを DB マイグレーションとシードデータとともに起動
2. フロントエンドをビルドして起動
3. ヘルスチェックで両サービスの readiness を確認 (`/v1/health` エンドポイント)
4. Playwright がユーザーシナリオを実行

これにより、どちらのリポジトリの変更も統合された予約フローを壊さないことが保証されます。

## 関連バックエンド

このフロントエンドは兄弟プロジェクト `booking-backend` のバックエンドと連携するように設計されています。

---

## 🇬🇧 English | 🇨🇳 中文

- [English version](./README.en.md)
- [中文版本](./README.zh.md)