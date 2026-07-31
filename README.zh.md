# CRM 预约平台前端

本项目是 CRM 预约平台的 Next.js 前端。

本应用提供用户与管理员界面,涵盖登录、注册、预约管理、服务浏览以及账号状态处理。它通过 `/v1` API 与 NestJS 后端集成,并使用 Redux Toolkit 进行客户端状态管理。

详细的接口契约请参见: [docs/api-contract.md](./docs/api-contract.md)

## 技术栈

- Next.js 15(使用 Pages Router)
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

## 当前应用结构

`src` 下的主要目录:

- `pages/` — 路由入口
- `components/` — UI 组件组装
- `services/` — API 客户端
- `store/` — Redux slice 与 store 配置
- `contexts/` — UI 与预约相关的 Context
- `hooks/` — 通用客户端 hooks
- `types/` — 共享的 TypeScript 模型
- `utils/` — 工具函数

## 已实现的路由

当前页面文件定义的路由:

- `/`
- `/login`
- `/register`
- `/bookings`
- `/admin/bookings`
- `/account-disabled`

说明:

- `/` 对未登录用户展示登录页,并将已登录用户重定向到应用内。
- `/bookings` 是受保护的路由。
- `/admin/bookings` 是当前的管理端入口页面。
- 中间件也包含 `/my-bookings` 的逻辑,但当前代码库中尚无对应页面文件。

## 运行期功能

- 登录与注册流程
- 基于 HttpOnly Cookie 的 JWT 与 refresh token 认证
- 变更请求上的 CSRF token 转发
- 基于认证状态的路由保护
- 基于角色的管理员路由行为
- 预约的创建与更新界面
- 通过 API 客户端获取服务与时段
- 管理员预约管理页面
- 账号禁用 / 角色变更的处理
- 全局 Redux store
- 通过应用状态与 UI Context 进行通知展示

## API 集成

API 请求通过 [src/services/api.ts](./src/services/api.ts) 发起。

后端 API 在本地的地址为:

```text
http://localhost:3001
```

当前默认的 API 基础 URL:

```text
http://localhost:3001/v1
```

`next.config.ts` 还会在开发期将 `/v1/:path*` 重写到 `http://localhost:3001/v1/:path*`,使本地前端开发与后端 README 中使用的 `/v1` 契约保持一致。

### 本分支的主要契约

前端应将以下后端端点视为预约流程的主要契约:

- `/v1/bookings/all`
- `/v1/time-slots/available-slots`
- 在需要按日期查看预约的场景下使用 `/v1/bookings/by-date`

重要规则:

- 前端将 `/bookings/all` 同时作为普通用户和管理员的共享端点。
- 将普通用户过滤到自己的预约,是后端的责任。
- 本分支不假设 `/bookings/me`,不应将其作为契约依赖。

### 当前代码中的 API 使用示例

- `GET /v1/bookings/all`
  当前预约 API 客户端使用的主要预约列表端点。

- `GET /v1/bookings/by-date?date=YYYY-MM-DD`
  用于按日期查询预约。

- `GET /v1/time-slots/available-slots?date=YYYY-MM-DD`
  用于查询时段可用性。

前端当前包含的服务模块:

- `adminApi.ts`
- `bookingApi.ts`
- `notificationApi.ts`
- `serviceApi.ts`
- `slotTimeApi.ts`
- `systemApi.ts`
- `userApi.ts`

这些文件代表前端的客户端层。其中引用的某些端点可能依赖后端尚未接入的功能,请将其视为前端契约,而非保证已上线后端实现。

## 状态管理

应用当前在 [src/store/index.ts](./src/store/index.ts) 中设置了以下 Redux slice:

- `user`
- `booking`
- `service`
- `slotTime`
- `notification`
- `admin`

应用在 [src/pages/_app.tsx](./src/pages/_app.tsx) 中通过 Redux 的 `Provider` 与 `UIProvider` 进行包裹。

## 表单与校验

代码库中实际使用了:

- `react-hook-form`
- `zod`

示例:

- `src/components/molecules/LoginForm.tsx`
- `src/components/molecules/RegisterForm.tsx`
- `src/components/molecules/BookingCreateModal.tsx`
- `src/components/molecules/BookingUpdateModal.tsx`

## 样式方案

当前实现使用了:

- Tailwind CSS 工具类
- `src/components` 下的自定义组件
- 部分动画 UI 使用了 Framer Motion

虽然 `antd` 和 `@tanstack/react-query` 也出现在依赖中,但它们并未在当前代码库的主要应用装配中被明确使用,因此不列入此处的主要运行期流程。

## 环境

仓库中提供了环境变量示例文件:

- `.env.development.example`
- `.env.production.example`

请在项目根目录创建 `.env.development`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_INSTANCE_NAME=dev
```

这能让本地前端请求与后端契约 `http://localhost:3001/v1` 保持一致。

**环境变量标准化**

为保持一致,前端和后端使用统一的环境变量。

| 变量 | 用途 | 默认值 |
|----------|---------|---------------|
| `NEXT_PUBLIC_API_URL` | 后端 API 基础 URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_WS_URL` | 实时更新的 WebSocket URL | `ws://localhost:3001/ws` |
| `NEXT_PUBLIC_INSTANCE_NAME` | 多租户场景下的实例标识 | `dev` |

**CI/CD 集成**
前端 CI 工作流 (`frontend-ci.yml`) 使用与后端 CI 相同的环境变量值,以确保跨仓库测试的一致性。E2E 测试会验证前后端服务之间的完整集成流程。

## 前端开发环境配置

### 配置文件

前端现在使用基于模板的方式进行本地开发配置:

1. **模板文件**: `.env.development.example`
   - 包含所有前端环境变量,并带有详细注释
   - 可以安全地提交到版本控制
   - 包含针对不同环境(本地、Docker、生产)的 API 端点指引

2. **个人配置**: `.env.development`
   - 从模板复制而来
   - 填写你实际的开发值
   - **切勿提交**该文件(已在 `.gitignore` 中)

3. **初始化脚本**: `scripts/init-local-env.sh`
   - 自动化配置设置流程
   - 提供交互式引导与环境选择
   - 支持对已有配置进行备份

### 快速设置

```bash
# 1. 运行初始化脚本
./scripts/init-local-env.sh

# 2. 脚本会从模板创建 .env.development
#    你可以根据自己的开发环境调整 API 端点

# 3. 启动开发服务器
npm run dev
```

### 环境相关配置

前端配置支持不同的开发环境:

| 环境 | NEXT_PUBLIC_API_URL | NEXT_PUBLIC_WS_URL | 描述 |
|-------------|---------------------|-------------------|-------------|
| 本地开发 | `http://localhost:3001/v1` | `ws://localhost:3001/ws` | 后端与前端都在本地运行 |
| Docker Compose | `http://booking-backend:3001/v1` | `ws://booking-backend:3001/ws` | 两个服务都在 Docker 容器中 |
| 生产 | `https://api.yourdomain.com/v1` | `wss://api.yourdomain.com/ws` | 线上生产环境 |

### 配置变量

| 变量 | 描述 | 默认值 |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | 后端 API 基础 URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_WS_URL` | 实时更新的 WebSocket URL | `ws://localhost:3001/ws` |
| `NEXT_PUBLIC_INSTANCE_NAME` | 实例标识 | `dev` |

### 安全提示

- 前端环境变量会暴露在浏览器中
- **切勿**在前端配置中放置敏感信息(API 密钥、密码等)
- 所有敏感操作都应通过后端 API 进行
- 生产环境请使用 HTTPS/WSS

### 故障排除

- **缺少配置**: 运行 `./scripts/init-local-env.sh` 来创建
- **权限被拒**: 为脚本添加执行权限: `chmod +x scripts/init-local-env.sh`
- **找不到模板**: 确认项目根目录下存在 `.env.development.example`
- **API 连接问题**: 验证后端是否运行并可访问

## 本地开发

**使用重写配置进行开发(推荐)**

本地开发时,前端被配置为使用 Next.js 的重写规则,将 API 请求代理到后端。这种方式有以下好处:

1. **消除 CORS 问题** — 所有请求都通过同一来源(`localhost:3000`)
2. **简化环境配置** — 无需在后端配置 CORS
3. **与生产路由一致** — 与生产环境下反向代理的工作方式类似

`next.config.ts` 中的重写配置会自动将 `/v1/*` 请求路由到 `http://localhost:3001/v1/*`。这意味着在前端代码中可以直接使用相对 URL(如 `/v1/health`),而无需担心跨域问题。

**备选方案: 直接调用 API**
如果需要直接调用 API(例如使用 curl 或 Postman 测试),可以直接访问后端 `http://localhost:3001/v1/*`。但日常开发建议使用重写方式。

**关于多实例脚本的说明**: 仓库中包含历史的多实例部署脚本(`start-frontend-instances.sh`),它们是旧部署策略时使用的,仅为历史参考保留,不属于当前主要的开发或部署工作流。新的开发应使用基于重写配置的单实例方式。

安装依赖:

```bash
npm install
```

启动开发服务器:

```bash
npm run dev
```

Next.js 应用会在本地 `http://localhost:3000` 运行,并与运行在 `http://localhost:3001` 的后端 API 通信。

然后访问:

```text
http://localhost:3000
```

## 构建与启动

构建:

```bash
npm run build
```

启动生产服务器:

```bash
npm start
```

## 质量与测试

Lint:

```bash
npm run lint
```

自动修复 Lint:

```bash
npm run lint:fix
```

类型检查:

```bash
npm run check
```

运行测试:

```bash
npm run test
```

运行覆盖率:

```bash
npm run test:coverage
```

## 跨仓库 E2E 测试

前端 CI 包含跨仓库的 E2E 测试工作流,其内容如下:

1. **同时拉取两个仓库** — 在同一台 CI runner 上克隆前端与后端
2. **搭建统一基础设施** — 使用 PostgreSQL 16 与 Redis 7-alpine(与后端 CI 版本一致)
3. **执行完整集成测试** — 验证三条主要用户流程:
   - 使用验证码登录
   - 查询未来日期的可预约时段
   - 在预约页创建预约

**E2E 测试流程:**
1. 启动后端服务,执行数据库迁移与种子数据
2. 构建并启动前端
3. 通过健康检查确认两个服务就绪(`/v1/health` 端点)
4. Playwright 执行用户场景

由此确保任何仓库的变更都不会破坏集成后的预约流程。

## 相关后端

本前端与同级目录下的 `booking-backend` 项目中的后端配合工作。

---

## 🇯🇵 日本語 | 🇬🇧 English

- [日本語版](./README.md)
- [English version](./README.en.md)