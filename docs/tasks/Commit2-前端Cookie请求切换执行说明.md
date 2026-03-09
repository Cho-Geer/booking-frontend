# Commit2 前端Cookie请求切换执行说明

- **ID**: COMMIT2-COOKIE-AUTH-20260309-01
- **执行时间戳**: 2026-03-09 16:55:00
- **执行内容**: 按改造顺序完成 Commit2，切换前端请求为 Cookie 凭证模式，并移除 localStorage token 读写依赖。
- **修改的代码路径**:
  - `booking-frontend/src/services/api.ts`
  - `booking-frontend/src/store/userSlice.ts`
- **生成的代码路径**:
  - `booking-frontend/docs/tasks/Commit2-前端Cookie请求切换执行说明.md`
- **实现的内容**:
  1. Axios实例启用 `withCredentials: true`，支持浏览器自动携带Cookie。
  2. 删除请求拦截器中从 `localStorage` 读取 token 并注入 `Authorization` 的逻辑。
  3. 401处理逻辑移除本地 token 清理动作，保留跳转登录页行为。
  4. 删除 `userSlice` 在登录/注册成功后的 token、refreshToken、expiresAt 本地存储写入。
  5. 删除 `userSlice.logout` 中对本地 token 的删除逻辑，状态仅由 Redux 内存态维护。
- **配置方式**:
  - 前端请求已默认开启 `withCredentials`，需确保后端 CORS `credentials=true`。
  - 浏览器环境需允许同站或跨站Cookie策略（由后端Set-Cookie配置决定）。
- **验证结果**:
  - 执行命令：`npm run check`
  - 结果：失败
  - 失败原因：项目中存在与本次改动无关的既有TypeScript错误（`Link.tsx`、`withNextImage.tsx`）。
- **注意事项**:
  - Commit2 尚未引入启动恢复登录态逻辑，刷新后依赖 Commit3 实现 `profile` 回填。
  - 若前后端跨站部署，后续需配合 SameSite/CSRF 方案。
