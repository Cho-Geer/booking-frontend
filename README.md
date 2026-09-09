# CRM 予約プラットフォーム フロントエンド

CRM 予約プラットフォームの Next.js フロントエンドです。

このアプリケーションは、ログイン、登録、予約管理、サービス閲覧、アカウント状態処理のユーザーおよび管理画面を提供します。NestJS バックエンドと `/v1` API で連携し、クライアント状態管理には Redux Toolkit を使用しています。

詳細なエンドポイント仕様: [docs/assets/api-contract.md](./docs/assets/api-contract.md)

## ドキュメント

`docs/assets/` に API 契約とフロントエンド設計ドキュメントを整備しています。

- [api-contract.md](./docs/assets/api-contract.md) — エンドポイント単位の API 契約(英語・原文)
- [api-contract.ja.md](./docs/assets/api-contract.ja.md) — API 契約(日本語版)
- [frontend-nextjs-hierarchy-permission.ja.md](./docs/assets/frontend-nextjs-hierarchy-permission.ja.md) — ファイル階層とページ遷移・権限システムの全体構造
- [frontend-nextjs-js-boundary.ja.md](./docs/assets/frontend-nextjs-js-boundary.ja.md) — フロント/バック JS 混在の境界
- [frontend-nextjs-middleware.ja.md](./docs/assets/frontend-nextjs-middleware.ja.md) — Middleware の責務・実行タイミング・所在階層
- [frontend-pages-inventory.ja.md](./docs/assets/frontend-pages-inventory.ja.md) — 画面一覧(全ルートの棚卸し)
- [frontend-screen-transition.ja.md](./docs/assets/frontend-screen-transition.ja.md) — イベント駆動の画面遷移図(認証イベント → AuthGuard → ルーティング)

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

## 画面デモ

> 動画（mp4）はリンクをクリックすると GitHub 上で再生できます。

| デモ | 動画 |
|---|---|
| ユーザーログイン | ![▶ ログインフロー（約2分26秒）](https://github.com/user-attachments/assets/b4bf13e4-73c0-4a87-aecc-f9abe44a3474) |
| ユーザー登録 | ![▶ 登録フロー（約1分32秒）](https://github.com/user-attachments/assets/54d1e127-d857-41c0-9aa6-c15ee3609db7) |
| 管理者コンソール | ![▶ 管理者ログインと管理操作（約2分）](https://github.com/user-attachments/assets/22566f42-beb9-4164-93fa-fa686c3d42af) |

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

---

## 🇬🇧 English | 🇨🇳 中文

- [English version](./README.en.md)
- [中文版本](./README.zh.md)
