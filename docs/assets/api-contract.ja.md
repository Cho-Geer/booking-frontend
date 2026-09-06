# API 契約（api-contract）

> 本ドキュメントは `docs/assets/api-contract.md`（基準コミット `2627080a1570eb054292b1c6b0900d0f547bd1b2`）の日本語版である。

本ドキュメントはこのブランチの詳細な API 契約である。

このファイルをフロントエンド/バックエンド統合の詳細に関する single source of truth として使用すること。README は意図的に短く保たれており、エンドポイント単位の挙動については本ドキュメントに従うこと。

ローカル開発時のベース URL:

```text
http://localhost:3001
```

グローバル API プレフィックス:

```text
/v1
```

## 共通規約

### 認証トランスポート

- バックエンドは `access_token` と `refresh_token` に HttpOnly Cookie を使用する。
- CSRF 保護が有効な場合、変更系リクエストには `csrf_token` Cookie も使用される。

### レスポンスエンベロープ

ほとんどのエンドポイントは、成功時にバックエンドの `ApiResponseDto` エンベロープを使用する:

```json
{
  "code": 200,
  "message": "Operation succeeded",
  "data": {},
  "requestId": "req_xxx",
  "timestamp": "2026-03-30T00:00:00.000Z"
}
```

予約リスト系の一部のフローでは、`data` でラップされる代わりに controller/service 経路からリストペイロードを直接返す。これは現在のブランチ契約の一部であり、以下でエンドポイントごとに文書化する。

### ページネーション形式

ページネーションを行うリスト系エンドポイントは次の形式を使用する:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

## 認証

### `POST /v1/auth/login`

- メソッド: `POST`
- パス: `/v1/auth/login`
- 認証必須？: `No`
- リクエスト形式:

```json
{
  "phoneNumber": "13800138000",
  "verificationCode": "123456"
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Login succeeded",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "name": "Alice",
      "phoneNumber": "13800138000",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  電話番号と検証コードを使用する。
  `access_token`、`refresh_token`、`csrf_token` の各 Cookie も設定する。

### `POST /v1/auth/register`

- メソッド: `POST`
- パス: `/v1/auth/register`
- 認証必須？: `No`
- リクエスト形式:

```json
{
  "name": "Alice",
  "phoneNumber": "13800138000",
  "email": "alice@example.com",
  "verificationCode": "123456"
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Register succeeded",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "name": "Alice",
      "phoneNumber": "13800138000",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  登録も成功時に認証用 Cookie を設定する。

### `POST /v1/auth/send-verification-code`

- メソッド: `POST`
- パス: `/v1/auth/send-verification-code`
- 認証必須？: `No`
- リクエスト形式:

```json
{
  "phoneNumber": "13800138000",
  "type": "login"
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Verification code sent",
  "data": null,
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  `type` は `login` または `register` でなければならない。

### `POST /v1/auth/refresh`

- メソッド: `POST`
- パス: `/v1/auth/refresh`
- 認証必須？: `No`
- リクエスト形式:

```json
{}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "name": "Alice",
      "phoneNumber": "13800138000",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  バックエンドは認証に `refresh_token` Cookie を使用する。トークンは HttpOnly Cookie で運搬されるため、リクエストボディは通常空である。

### `POST /v1/auth/logout`

- メソッド: `POST`
- パス: `/v1/auth/logout`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Logout succeeded",
  "data": null,
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  `access_token`、`refresh_token`、`csrf_token` の各 Cookie をクリアする。

### `GET /v1/auth/profile`

- メソッド: `GET`
- パス: `/v1/auth/profile`
- 認証必須？: `Yes`
- リクエスト形式:
  リクエストボディなし。

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Profile loaded",
  "data": {
    "id": "uuid",
    "name": "Alice",
    "phoneNumber": "13800138000",
    "email": "alice@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "remarks": "",
    "createdAt": "2026-03-30T00:00:00.000Z",
    "updatedAt": "2026-03-30T00:00:00.000Z"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  このブランチにおける正規の「現在のユーザー」エンドポイントとして扱うこと。



## 予約

### `POST /v1/bookings`

- メソッド: `POST`
- パス: `/v1/bookings`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{
  "timeSlotId": "uuid",
  "userId": "uuid",
  "serviceId": "uuid",
  "appointmentDate": "2026-03-30",
  "customerName": "Alice",
  "customerPhone": "13800138000",
  "customerEmail": "alice@example.com",
  "customerWechat": "alice_wechat",
  "notes": "Window seat if possible",
  "serviceName": "Consultation"
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Booking created",
  "data": {
    "id": "uuid",
    "appointmentNumber": "AP-20260330-0001",
    "timeSlotId": "uuid",
    "userId": "uuid",
    "appointmentDate": "2026-03-30T00:00:00.000Z",
    "status": "PENDING",
    "customerName": "Alice",
    "customerPhone": "13800138000",
    "customerEmail": "alice@example.com",
    "customerWechat": "alice_wechat",
    "notes": "Window seat if possible",
    "timeSlot": {
      "slotTime": "09:00:00",
      "durationMinutes": 30
    },
    "user": {
      "name": "Alice",
      "phoneNumber": "13800138000"
    },
    "service": {
      "id": "uuid",
      "name": "Consultation",
      "durationMinutes": 30
    },
    "confirmationSent": false,
    "reminderSent": false,
    "createdAt": "2026-03-30T00:00:00.000Z",
    "updatedAt": "2026-03-30T00:00:00.000Z"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  `userId` が省略された場合、バックエンドが `currentUser.id` から補完する。

### `GET /v1/bookings/all`

- メソッド: `GET`
- パス: `/v1/bookings/all`
- 認証必須？: `Yes`
- リクエスト形式:
  クエリパラメータとして `userId`、`timeSlotId`、`status`、`customerName`、`customerPhone`、`startDate`、`endDate`、`page`、`limit`、`keyword` を指定できる。

- レスポンス形式:

```json
{
  "items": [
    {
      "id": "uuid",
      "appointmentNumber": "AP-20260330-0001",
      "timeSlotId": "uuid",
      "userId": "uuid",
      "appointmentDate": "2026-03-30T00:00:00.000Z",
      "status": "PENDING",
      "customerName": "Alice",
      "customerPhone": "13800138000"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

- 備考:
  `/bookings/all` はユーザークライアントと管理者クライアントの両方で共有される一覧エンドポイントである。
  管理者以外のユーザーは、受け取ったクエリが広範であってもバックエンドロジックにより現在の認証済みユーザーに絞り込まれる。
  `/bookings/me` はこのブランチでは導入されておらず、契約の一部として扱ってはならない。

### `GET /v1/bookings/by-date?date=YYYY-MM-DD`

- メソッド: `GET`
- パス: `/v1/bookings/by-date`
- 認証必須？: `Yes`
- リクエスト形式:

```text
?date=YYYY-MM-DD
```

- レスポンス形式:

```json
{
  "items": [
    {
      "id": "uuid",
      "appointmentNumber": "AP-20260330-0001",
      "status": "PENDING",
      "customerName": "Alice"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

- 備考:
  日付別の予約ビューや日付ベースの空き状況対応に使用する。
  ここでも管理者以外のユーザーは自分自身のレコードにフィルタされる。

### `GET /v1/bookings/:id`

- メソッド: `GET`
- パス: `/v1/bookings/:id`
- 認証必須？: `Yes`
- リクエスト形式:
  リクエストボディなし。

- レスポンス形式:

```json
{
  "id": "uuid",
  "appointmentNumber": "AP-20260330-0001",
  "timeSlotId": "uuid",
  "userId": "uuid",
  "appointmentDate": "2026-03-30T00:00:00.000Z",
  "status": "PENDING",
  "customerName": "Alice",
  "customerPhone": "13800138000"
}
```

- 備考:
  ラップされたページネーションペイロードではなく、単一の予約オブジェクトを返す。
  管理者以外のユーザーは自分の予約にのみアクセスできる。

### `PATCH /v1/bookings/:id`

- メソッド: `PATCH`
- パス: `/v1/bookings/:id`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{
  "status": "CONFIRMED",
  "appointmentDate": "2026-03-31",
  "timeSlotId": "uuid",
  "serviceId": "uuid",
  "customerName": "Alice",
  "customerPhone": "13800138000",
  "customerEmail": "alice@example.com",
  "customerWechat": "alice_wechat",
  "notes": "Updated note"
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Booking updated",
  "data": {
    "id": "uuid",
    "status": "CONFIRMED"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  管理者以外のユーザーは自分の予約のみを更新できる。

### `PATCH /v1/bookings/:id/cancel`

- メソッド: `PATCH`
- パス: `/v1/bookings/:id/cancel`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Booking cancelled",
  "data": null,
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  これはこのブランチにおけるフロントエンド互換のキャンセルエンドポイントである。

## サービス

### `GET /v1/services`

- メソッド: `GET`
- パス: `/v1/services`
- 認証必須？: `Yes`
- リクエスト形式:
  リクエストボディなし。

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Services loaded",
  "data": [
    {
      "id": "uuid",
      "name": "Consultation",
      "description": "30 minute consultation",
      "durationMinutes": 30,
      "price": 199,
      "imageUrl": "https://example.com/service.png",
      "categoryId": "uuid",
      "isActive": true,
      "displayOrder": 1,
      "category": {
        "id": "uuid",
        "name": "General"
      }
    }
  ],
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  予約フローで使用される共通サービス一覧エンドポイントである。

### `GET /v1/services/all`

- メソッド: `GET`
- パス: `/v1/services/all`
- 認証必須？: `Yes`
- リクエスト形式:
  クエリパラメータとして `name`、`description`、`durationMinutes`、`price`、`imageUrl`、`categoryId`、`isActive`、`displayOrder`、`page`、`limit` を指定できる。

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Services loaded",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Consultation",
        "durationMinutes": 30,
        "isActive": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  ページネーションとフィルタリングに対応した管理者向けサービス一覧エンドポイントである。

### `POST /v1/services/admin`

- メソッド: `POST`
- パス: `/v1/services/admin`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{
  "name": "Consultation",
  "description": "30 minute consultation",
  "durationMinutes": 30,
  "price": 199,
  "imageUrl": "https://example.com/service.png",
  "isActive": true
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Service created",
  "data": {
    "id": "uuid",
    "name": "Consultation",
    "description": "30 minute consultation",
    "durationMinutes": 30,
    "price": 199,
    "imageUrl": "https://example.com/service.png",
    "isActive": true,
    "createdAt": "2026-03-30T00:00:00.000Z",
    "updatedAt": "2026-03-30T00:00:00.000Z"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  新しいサービスを作成するための管理者専用エンドポイントである。

### `PATCH /v1/services/admin/:id`

- メソッド: `PATCH`
- パス: `/v1/services/admin/:id`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{
  "name": "Updated Consultation",
  "description": "45 minute consultation",
  "durationMinutes": 45,
  "price": 299,
  "imageUrl": "https://example.com/service-updated.png",
  "isActive": false
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Service updated",
  "data": {
    "id": "uuid",
    "name": "Updated Consultation",
    "description": "45 minute consultation",
    "durationMinutes": 45,
    "price": 299,
    "imageUrl": "https://example.com/service-updated.png",
    "isActive": false,
    "createdAt": "2026-03-30T00:00:00.000Z",
    "updatedAt": "2026-03-31T00:00:00.000Z"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  既存のサービスを更新するための管理者専用エンドポイントである。

### `PATCH /v1/services/admin/:id/status`

- メソッド: `PATCH`
- パス: `/v1/services/admin/:id/status`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{
  "isActive": false
}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Service status updated",
  "data": {
    "id": "uuid",
    "isActive": false,
    "updatedAt": "2026-03-31T00:00:00.000Z"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  サービスの有効状態を切り替えるための管理者専用エンドポイントである。

## 時間枠

### `GET /v1/time-slots`

- メソッド: `GET`
- パス: `/v1/time-slots`
- 認証必須？: `No`
- リクエスト形式:
  クエリパラメータとして `slotTime`、`isActive`、`minDuration`、`maxDuration`、`page`、`limit` を指定できる。

- レスポンス形式:

```json
{
  "items": [
    {
      "id": "uuid",
      "slotTime": "09:00:00",
      "durationMinutes": 30,
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

- 備考:
  汎用の時間枠一覧エンドポイントである。

### `GET /v1/time-slots/available-slots?date=YYYY-MM-DD`

- メソッド: `GET`
- パス: `/v1/time-slots/available-slots`
- 認証必須？: `No`
- リクエスト形式:

```text
?date=YYYY-MM-DD
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Operation succeeded",
  "data": [
    {
      "id": "uuid",
      "slotTime": "09:00:00",
      "durationMinutes": 30,
      "bookedCount": 1,
      "isAvailable": true,
      "availabilityStatus": "AVAILABLE",
      "appointments": [
        {
          "id": "uuid",
          "customerName": "Alice",
          "status": "PENDING"
        }
      ]
    }
  ],
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  このブランチにおける主要な時間枠空き状況エンドポイントである。
  `date` は `YYYY-MM-DD` 形式で渡さなければならない。

## 通知

### `GET /v1/notifications`

- メソッド: `GET`
- パス: `/v1/notifications`
- 認証必須？: `Yes`
- リクエスト形式:
  クエリパラメータとして `userId`、`type`、`isRead`、`priority`、`page`、`limit` を指定できる。

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Notifications loaded",
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "BOOKING_CONFIRMED",
        "title": "Booking Confirmed",
        "message": "Your booking AP-20260330-0001 has been confirmed",
        "isRead": false,
        "priority": "MEDIUM",
        "metadata": {},
        "createdAt": "2026-03-30T00:00:00.000Z",
        "updatedAt": "2026-03-30T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  現在のユーザーの通知を取得する。

### `GET /v1/notifications/unread-count`

- メソッド: `GET`
- パス: `/v1/notifications/unread-count`
- 認証必須？: `Yes`
- リクエスト形式:
  リクエストボディなし。

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Unread count loaded",
  "data": {
    "count": 5
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  現在のユーザーの未読通知数を取得する。

### `PUT /v1/notifications/:id/read`

- メソッド: `PUT`
- パス: `/v1/notifications/:id/read`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "Notification marked as read",
  "data": {
    "id": "uuid",
    "isRead": true,
    "updatedAt": "2026-03-30T00:00:00.000Z"
  },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  特定の通知を既読にする。

### `PUT /v1/notifications/read-all`

- メソッド: `PUT`
- パス: `/v1/notifications/read-all`
- 認証必須？: `Yes`
- リクエスト形式:

```json
{}
```

- レスポンス形式:

```json
{
  "code": 200,
  "message": "All notifications marked as read",
  "data": null,
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

- 備考:
  現在のユーザーのすべての通知を既読にする。
