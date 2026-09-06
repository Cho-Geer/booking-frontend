# フロントエンド画面一覧(booking-frontend 画面 Inventory)（frontend-pages-inventory）

> 本ドキュメントは ワークスペース `docs/frontend-pages-inventory.md` の日本語版であり、文中の file:line アンカーは booking-frontend コミット `2627080a1570eb054292b1c6b0900d0f547bd1b2` 時点の実測値である。

> 対象: `booking-frontend/src/pages/` の全ルート + ページコンポーネントのマウントチェーン
> すべての `file:line` は本セッションで `grep -n` / Read により実測。省略箇所は `…` で明示している
> 姉妹ドキュメント: `docs/frontend-screen-transition.md`(イベント駆動画面遷移図。画面番号は本ドキュメントと一致)

## 1. 概要

- フレームワーク: Next.js 15.5.3(Pages Router)。実測 `booking-frontend/package.json:38` → `"next": "15.5.3"`。
- ルートファイルは計 7 個(`src/pages/` 実測):`_app.tsx`(シェル、画面ではない)+ 業務画面ルート 6 個。ページコンポーネントは 2 層に分かれる:
  - ルート層 `src/pages/*.tsx`(薄いラッパー。ガード/動的 import/props 引渡しを担う);
  - ページコンポーネント層 `src/components/pages/*.tsx`(LoginPage/RegisterPage/BookingPage/AdminPage。状態オーケストレーションを担い、さらに organisms/ を参照する)。
- **レンダリング特性の実測**:`grep -rn "getServerSideProps\|getStaticProps" src/pages src/components`(cwd=booking-frontend/)は 1 件もヒットなし → 全ページ**SSR データ取得なし、すべてクライアントサイドレンダリング(CSR)**。`pages/bookings.tsx:20-24` で宣言された `initialBookings/isServerRendered` props にはデータ取得関数が供給されず、実際は常に undefined である(S-04 参照)。
- **二層ガード**(SSR 層 + クライアント層):
  - 第一層:`src/middleware.ts`(Edge Runtime。matcher は `src/middleware.ts:127-137`)が Cookie の存在性により第一段のリダイレクトを行う;
  - 第二層: クライアントの `AuthGuard`(`src/components/providers/AuthGuard.tsx`)+ ルート権限設定 `src/config/routePermissions.ts`。
- 画面番号の規約(両ドキュメント共通):S-01 `/`、S-02 `/login`、S-03 `/register`、S-04 `/bookings`、S-05 `/admin/bookings`、S-06 `/account-disabled`。

## 2. 画面一覧表

| 番号 | ルート | ルートファイル | ページコンポーネント(components/pages/) | 権限保護 | レンダリング特性 | 主要機能概要 |
|---|---|---|---|---|---|---|
| S-01 | `/` | `pages/index.tsx:17-38` HomeRoute | LoginPage(`components/pages/LoginPage.tsx`) | 公開(HOC なし。`index.tsx:37-38` のコメント「首页不需要认证保护」=ホームは認証保護不要) | CSR。未認証時はログインフォームを描画、認証済み時はローディング状態を描画 | 未認証: ログインフォーム。認証済み: ローディング状態の描画のみ、自動リダイレクトなし |
| S-02 | `/login` | `pages/login.tsx:9-11` LoginRoute | LoginPage | 公開(HOC なし)。middleware 公開パス `middleware.ts:65-71` | CSR | 検証コード送信 + 検証コードログイン(`sendCode`/`verifyCode` → userApi `/auth/send-verification-code` `/auth/login`) |
| S-03 | `/register` | `pages/register.tsx:9-11` RegisterRoute | RegisterPage | 公開(HOC なし) | CSR | 登録フォーム + 検証コード(`registerUser`/`sendCode` → `/auth/register`) |
| S-04 | `/bookings` | `pages/bookings.tsx:20-24` **withAuth**(`bookings.tsx:4,24`) | BookingPage | withAuth(クライアント HOC)+ AuthGuard ルートルール(`routePermissions.ts:26-36` roles: customer) | CSR。props にデータ取得関数の供給なし | 予約サービス: 日付/時間枠の選択、予約の作成/キャンセル/更新、自分の予約リスト、検索・フィルタ、ページネーション |
| S-05 | `/admin/bookings` | `pages/admin/bookings.tsx:14-25` **dynamic(ssr:false)** | AdminPage | **withAdmin HOC なし**(実測: withAdmin は `components/hoc/withAdmin.tsx` に定義されているのみで、src 全体に使用箇所なし)。AdminPage 自身のロール判定(`AdminPage.tsx:231-257`)+ AuthGuard ルートルール(`routePermissions.ts:12-22` roles: admin)による | CSR + クライアント動的 import(mounted ゲート `admin/bookings.tsx:15-22`) | 管理コンソール: 予約管理/サービス管理/ユーザー管理の 3 タブ(ADMIN_TABS)。ロール/ステータス変更、サービスの追加・更新・有効/無効切替、ユーザーのステータス/タイプ変更 |
| S-06 | `/account-disabled` | `pages/account-disabled.tsx:13-132` AccountDisabledPage(自己完結、organism なし) | —(ページ自体がコンポーネント) | 公開(HOC なし)。AuthGuard PUBLIC_PATHS(`AuthGuard.tsx:10`) | CSR | アカウント無効化/ロール変更の告知ページ。reason に応じて 4 種類の文言を表示(INACTIVE/BLOCKED/ROLE_CHANGED_FROM_ADMIN/ROLE_UPGRADED_TO_ADMIN)。ボタンでログイン/ホームへ遷移 |

## 3. 画面別セクション(マウントチェーン + 権限 + イベント)

### S-01 ホーム `/`

- マウントチェーン:`pages/index.tsx:17` HomeRoute → `components/pages/LoginPage.tsx:15` → `components/organisms/LoginPage.tsx:29` → `components/molecules/LoginForm.tsx`(マウントチェーンの実測は `components/pages/LoginPage.tsx:4` の import + `components/organisms/LoginPage.tsx:2` の import による)。
- 動作:`index.tsx:22-24` `if (!currentUser) return <LoginPage />`。認証済みの場合はローディング状態を描画 `index.tsx:27-34`(div id="home-loading-container")。**認証済みで `/` にアクセスした場合はローディング状態の描画のみで、自動リダイレクトは発生しない** —— AuthGuard の `PUBLIC_PATHS`(`AuthGuard.tsx:10`)は `/` を含まず、`AuthGuard.tsx:67-70` の認証済みリダイレクトは `/login` と `/register` にのみ有効。ホームで認証済みのままローディング状態に留まり続けるのはソースコードの欠陥の疑いがある。
- グローバルラッパー(全画面共通):`_app.tsx:98-111` `UIProvider` > `Provider(store)` > `AppWithProviders`(内部に `AuthGuard`、`_app.tsx:64`)> `PageWrapper`(`_app.tsx:13-16` dynamic import、`{ ssr: false }`)> `AppLayout`(`PageWrapper.tsx:65-71`)。

### S-02 ログインページ `/login`

- マウントチェーン:`pages/login.tsx:9-11` → `components/pages/LoginPage.tsx:15` → `components/organisms/LoginPage.tsx:29` → `LoginForm`。
- ログインイベント:`components/pages/LoginPage.tsx:51-56` `handleVerifyCode` が `verifyCode` を dispatch。`userSlice.ts:200-213` の verifyCode.fulfilled が `currentUser` と `authInitialized=true` を書き込む。**リダイレクトに明示的な navigate なし**: AuthGuard の初期ルート保護(`AuthGuard.tsx:49-71`)が担い、`AuthGuard.tsx:67-70` により認証済みユーザーが公開ページにアクセスした場合 → `userRole === 'admin' ? '/admin/bookings' : '/bookings'`。
- 401 シナリオ: ログイン/登録/検証コード系 API の 401 はリフレッシュチェーンを発火しない(`api.ts:217-224`)。

### S-03 登録ページ `/register`

- マウントチェーン:`pages/register.tsx:9-11` → `components/pages/RegisterPage.tsx:13` → `components/organisms/RegisterPage.tsx:29` → `RegisterForm`。
- 登録イベント:`components/pages/RegisterPage.tsx:41-46` `handleRegister` が `registerUser` を dispatch。`userSlice.ts:161-173` の registerUser.fulfilled が `currentUser` を書き込む(userType は `role === 'ADMIN' ? 'admin' : 'customer'` から導出)。リダイレクトも同様に AuthGuard が担う。

### S-04 予約ページ `/bookings`

- マウントチェーン:`pages/bookings.tsx:20` BookingsRoute → **withAuth**(`bookings.tsx:4,24`)→ `components/pages/BookingPage.tsx:54` → `components/organisms/BookingPage.tsx:86`(BookingLeftPanel `BookingPage.tsx:253` / BookingRightPanel `BookingPage.tsx:269` / 各 Modal)。
- 権限:`withAuth.tsx:10-20` `!authInitialized` → Spinner。`!currentUser` → null(**リダイレクトしない**。フォールバックは AuthGuard `AuthGuard.tsx:49-71` が担い、未認証 → `/login`)。AuthGuard ルートルールは customer 専用(`routePermissions.ts:26-36`)。
- データ: `getServerSideProps` なし。`initialData`/`isSSR` props は常に提供されない → クライアント取得ブランチに進み `components/pages/BookingPage.tsx:104-107` `dispatch(getBookings(...))`。サービスリスト/利用可能時間枠は `BookingPage.tsx:129-133`(fetchServicesForUsers + getAvailableSlots)。
- 主要機能(実測): 予約作成 `BookingPage.tsx:278-369`(「時間枠満席」ブランチ `:345-364` を含む)、予約キャンセル `:381-417`、予約更新 `:427-462`、ページネーション/検索 `:112-119`、成功/失敗のグローバル通知(openModal/showError)。

### S-05 管理コンソール `/admin/bookings`

- マウントチェーン:`pages/admin/bookings.tsx:4-7` dynamic(() => import('@/components/pages/AdminPage'), `{ ssr: false }`)+ mounted ゲート `:15-22`(未マウント時は null を返す)→ `components/pages/AdminPage.tsx:57` → 3 つの organism(AdminBookingList `AdminPage.tsx:9` / AdminServiceList `:10` / AdminUserList `:11`)。
- 権限: 動的 import されたコンポーネント内でセルフチェック `AdminPage.tsx:231-257` — `currentUser?.userType !== 'admin'` の場合はストレージをクリアし `window.location.href = '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN'`(`:251`)。その前に `sessionStorage.setItem('accountDisabledReason', 'ROLE_CHANGED_FROM_ADMIN')`(`:248`)を実行。通過後は `setIsAdmin(true)`(`:254`)。不通過時は空を描画(`:487-489`)。AuthGuard ルートルールは admin 専用(`routePermissions.ts:12-22`)。
- **注意**: `withAdmin` HOC(`components/hoc/withAdmin.tsx:6-24`)は本プロジェクトで**どのページからも使用されていない**(grep 全 src では自身のファイルのみヒット)。
- 主要機能(実測): 予約管理(ステータス更新。期限切れ検証 `AdminPage.tsx:310-346` を含む)、サービス管理(追加/更新/有効・無効切替 `:159-226`)、ユーザー管理(ステータス/タイプ変更 `:349-406`)、3 タブ切替 `:531-639`、予約詳細 Modal `:645-650`。

### S-06 アカウント無効化ページ `/account-disabled`

- コンポーネント:`pages/account-disabled.tsx:13` AccountDisabledPage(自己完結したページコンポーネント。components/pages 層を経由しない)。
- 文言: reason は query または sessionStorage の `accountDisabledReason` から取得(`:18-22`)。4 分岐 `:24-46`(BLOCKED / ROLE_CHANGED_FROM_ADMIN / ROLE_UPGRADED_TO_ADMIN / デフォルト INACTIVE)。
- イベント: `handleLogin` `:78-81` → `navigate('/login?cleared_from_disabled_page=true&role_changed=true')`。`handleGoHome` `:73-76` → `navigate('/?cleared_from_disabled_page=true')`。両者とも先に `performFullLogout`(`:51-71`。logoutUser API 呼び出し + Redux クリア + ストレージクリア)を実行。
- 権限: 公開ページ。`AuthGuard.tsx:10` PUBLIC_PATHS。middleware 公開パス `middleware.ts:70`。

## 4. 画面ではないがルート上の意味を持つ要素

### 4.1 `_app.tsx`(グローバルシェル)

- 位置: `pages/_app.tsx:67-112`。Provider スタック: `UIProvider` > Redux `Provider` > `AppWithProviders` > `PageWrapper`(`:98-111`)。
- `AppWithProviders`(`:32-65`): ログイン/登録/アカウント無効化ページでは認証初期化をスキップ(`:36`)。`forceRedirectToLogin` / `csrfValidationFailed` の 2 つの sessionStorage ワンタイムフラグ(`:39-56`。読み取り時に削除)。`useAuthInitialization(shouldInitializeAuth)`(`:59-62`)。
- `PageWrapper` 動的 import: `_app.tsx:13-16` `{ ssr: false }` → サーバー側では描画されず、画面シェルのレイアウト/ログアウトロジックはすべてクライアント側にある。

### 4.2 `src/middleware.ts`(SSR 層 Middleware)

- 公開パス: `middleware.ts:65-71` `/login` `/register` `/demo-ui` `/image-gallery` `/account-disabled`。ルートパス `pathname === '/'` も公開とみなす(`:73-75`)。
- 未認証で `/admin/*` にアクセス → `/login?redirect=<元のパス>`(`:78-80`)。未認証でその他の非公開パスにアクセス → 同様(`:83-85`)。
- 認証済みで `/login` `/register` `/account-disabled` にアクセス: 特殊パラメータ(`csrf_error=true` / `cleared_from_disabled_page=true` / `role_changed=true` または `reason=ROLE_*`)付きの場合は Cookie をクリアして通過許可(`:89-107`)。それ以外はそのまま通過許可とし、クライアントの AuthGuard に一元化(`:109-116`。クライアントガードとの「ピンポンリダイレクト」回避がコメントに記載)。
- matcher: `:127-137` `'/' '/login' '/register' '/account-disabled' '/admin/:path*' '/bookings/:path*' '/my-bookings/:path*'`。
- 実測注記: publicPaths の `/demo-ui`、`/image-gallery` および matcher の `/my-bookings` は `src/pages/` に**対応するページファイルが存在しない**(`find src/pages -type f` の実測では 7 ファイルのみ)。アクセスすると 404 になる。

### 4.3 ルート権限設定 `src/config/routePermissions.ts`

- ルール表(`:3-44`): 公開 `/login` `/register` `/account-disabled` `/`。admin 専用 `/admin` `/admin/*`。customer 専用 `/bookings` `/bookings/*`。共通 `/my-bookings`(roles: customer+admin。`routePermissions.ts:39-43`)。
- `findRouteRule` / `hasRoutePermission`(`:47-64`)は AuthGuard が初期ルート保護とリアルタイムロール検証に使用(`AuthGuard.tsx:43,51`)。

### 4.4 幽霊ルート/孤立コンポーネント(実測、要再確認)

- `/my-bookings`: 設定(`routePermissions.ts:40`)と middleware matcher(`middleware.ts:135`)と孤立 organism `components/organisms/MyBookingsPage.tsx`(275 行。`grep -rn "MyBookingsPage" --include="*.tsx"` では import 元なし)のみ存在 → ルートファイルなし、マウントポイントなし。
- `FORCE_LOGOUT` イベント: `utils/authEvents.ts:8` で定義、`AuthGuard.tsx:80` で処理。ただし `grep -rn "FORCE_LOGOUT" src/` の実測では **emit 点が一切ない**(移行ドキュメント §2.1 参照)。
- `withAdmin` HOC: `components/hoc/withAdmin.tsx:6-24` に定義。src 全体に使用箇所なし。

## 5. コード根拠表

| 根拠 | file:line | 実測方法 |
|---|---|---|
| Next.js バージョン 15.5.3 | `booking-frontend/package.json:38` | grep -n '"next"' |
| ページファイル一覧(7 個) | `src/pages/` 全ディレクトリ | find + ls 実測 |
| getServerSideProps/getStaticProps なし | `src/pages src/components` 全体 | grep -rn(0 ヒット、exit 1) |
| withAuth は /bookings のみで使用 | `src/pages/bookings.tsx:4,24` | grep -rn "withAuth" |
| withAdmin に使用箇所なし | `src/components/hoc/withAdmin.tsx:6,26` | grep -rn "withAdmin" |
| AdminPage の非管理者セルフチェックリダイレクト | `src/components/pages/AdminPage.tsx:231-257` | Read |
| AuthGuard のルート保護/イベント switch | `src/components/providers/AuthGuard.tsx:49-71, 74-92` | Read |
| イベントタイプ 6 種 | `src/utils/authEvents.ts:2-8` | Read |
| api.ts のイベント発火点 | `src/services/api.ts:132,156,170,182,199,210,264,275` | grep -rn "emitAuthEvent" |
| navigate 呼び出し点 | `PageWrapper.tsx:59` `account-disabled.tsx:75,80` `api.ts:133,210,264,275` | grep -rn "navigate(" |
| SSR データ取得なし(再確認) | `src/pages` `src/components`(cwd=booking-frontend/) | grep -rn(0 ヒット、exit 1) |

## 6. Verified-by

- `Verified-by: ls /c/Users/USER/ZCodeProject/booking-system/booking-frontend/src/pages/ → _app.tsx account-disabled.tsx admin(bookings.tsx) bookings.tsx index.tsx login.tsx register.tsx(7 files)`
- `Verified-by: grep -n '"next"' package.json → 38: "next": "15.5.3"`
- `Verified-by: grep -rn "getServerSideProps\|getStaticProps" src/pages src/components → 0 ヒット(exit 1)、cwd=booking-frontend/`
- `Verified-by: grep -rn "emitAuthEvent" src/ → api.ts:132/156/170/182/199/210/264/275 + authEvents.ts:18(定義)`
- `Verified-by: grep -rn "FORCE_LOGOUT" src/ → authEvents.ts:8(定義)と AuthGuard.tsx:80(処理)のみ、emit 点なし`
- `Verified-by: grep -rn "withAdmin" src/ → components/hoc/withAdmin.tsx:6,26 自身のみ`
- `Verified-by: grep -rn "navigate(" src/ → PageWrapper.tsx:59 / account-disabled.tsx:75,80 / api.ts:133,210,264,275(計 7 箇所)`
- `Verified-by(書き込み整合性ゲート): test -s docs/frontend-pages-inventory.md → PASS; wc -l → 122; head -n 1 → "# 前端画面一览(booking-frontend 画面 Inventory)"`
