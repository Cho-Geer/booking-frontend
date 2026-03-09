# Commit3 启动恢复登录态与守卫统一执行说明

- **ID**: COMMIT3-COOKIE-AUTH-20260309-01
- **执行时间戳**: 2026-03-09 17:30:00
- **执行内容**: 按改造顺序完成 Commit3，实现前端启动登录态恢复并统一 withAuth 守卫判定时机。
- **修改的代码路径**:
  - `booking-frontend/src/store/userSlice.ts`
  - `booking-frontend/src/pages/_app.tsx`
  - `booking-frontend/src/services/authService.ts`
  - `booking-frontend/src/services/api.ts`
  - `booking-frontend/src/components/hoc/withAuth.tsx`
- **生成的代码路径**:
  - `booking-frontend/docs/tasks/Commit3-启动恢复登录态与守卫统一执行说明.md`
- **实现的内容**:
  1. 在 `userSlice` 增加 `authInitialized` 状态和 `initializeAuth` 异步动作。
  2. 应用启动时在 `_app.tsx` 触发 `initializeAuth`，通过 Cookie 会话恢复当前用户。
  3. `authService.getCurrentUser` 接口统一到 `/auth/profile`。
  4. 新增 `X-Skip-Auth-Redirect` 机制，避免初始化请求401时被拦截器强制跳转。
  5. `withAuth` 增加初始化门控：仅在 `authInitialized=true` 且无用户时才跳转登录页。
- **配置方式**:
  - 前端需继续保持 `withCredentials: true`。
  - 后端需确保 `/auth/profile` 可通过 Cookie 鉴权返回用户信息。
- **验证结果**:
  - 执行命令：`npm run check`
  - 结果：失败
  - 失败原因：仓库既有TypeScript错误（`Link.tsx`、`withNextImage.tsx`），与本次改动无直接关系。
- **注意事项**:
  - Commit3 已完成“刷新后恢复登录态”的前端基础能力。
  - 仍需在 Commit4 中完善登出清Cookie与刷新令牌链路。
