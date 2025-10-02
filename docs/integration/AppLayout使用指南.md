# AppLayout 使用指南

## 概述

AppLayout 是预约系统的前端布局组件，提供统一的顶部导航栏、用户状态管理和主题切换功能。通过智能的页面包装器 PageWrapper 实现自动布局管理。

## 组件结构

```
AppLayout (模板组件)
├── 顶部导航栏
│   ├── Logo/标题
│   ├── 导航菜单（动态根据用户类型）
│   ├── 主题切换按钮
│   └── 用户信息/登出按钮
└── 主要内容区域
    └── 页面内容组件
```

## 使用方式

### 自动布局（推荐）

大部分页面会自动应用 AppLayout，无需手动配置：

```typescript
// 这些页面会自动包含 AppLayout:
// /bookings, /my-bookings, /admin/bookings
```

### 独立布局页面

以下页面保持独立布局，不应用 AppLayout：

```typescript
// 这些页面保持独立布局:
// /login, /register, /demo-ui
```

### 添加新页面

#### 需要 AppLayout 的页面

创建新页面时，只需在 `/src/pages/` 目录下创建对应的 `.tsx` 文件即可，系统会自动应用 AppLayout：

```typescript
// src/pages/new-feature.tsx
import React from 'react';

export default function NewFeaturePage() {
  return (
    <div>
      <h1>新功能页面</h1>
      <p>这里的内容会自动被 AppLayout 包装</p>
    </div>
  );
}
```

#### 需要独立布局的页面

如果新页面需要保持独立布局，需要在 PageWrapper 中配置：

```typescript
// src/components/wrappers/PageWrapper.tsx
const noLayoutPages = ['/login', '/register', '/demo-ui', '/your-new-page'];
```

## 配置选项

### 导航菜单配置

AppLayout 会根据用户类型自动显示不同的导航菜单：

#### 普通用户导航
```typescript
const navItems = [
  { name: '首页', path: '/' },
  { name: '预约', path: '/bookings' },
  { name: '我的预约', path: '/my-bookings' },
];
```

#### 管理员用户导航
```typescript
const adminNavItems = [
  { name: '首页', path: '/' },
  { name: '预约', path: '/bookings' },
  { name: '我的预约', path: '/my-bookings' },
  { name: '管理', path: '/admin/bookings' },
];
```

### 主题配置

AppLayout 支持深色和浅色主题自动切换：

```typescript
// 主题切换逻辑在 UIContext 中管理
const { uiState, toggleTheme } = useUI();
```

## 属性说明

### AppLayout Props

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| children | ReactNode | 是 | 页面内容组件 |
| isLoggedIn | boolean | 是 | 用户登录状态 |
| onLogout | () => void | 是 | 登出处理函数 |
| username | string | 否 | 显示的用户名 |
| userType | string | 否 | 用户类型 ('customer' \| 'admin') |

### PageWrapper 内部属性

PageWrapper 组件会自动从 Redux 获取用户状态：

```typescript
const { currentUser } = useSelector((state: RootState) => state.user);
```

## 样式定制

### 主题样式

AppLayout 会根据当前主题自动应用不同的样式类：

```typescript
// 深色主题
bg-background-dark
text-text-dark-primary
border-border-dark

// 浅色主题  
bg-white
text-gray-900
border-gray-200
```

### 自定义样式

可以通过以下方式自定义样式：

1. **覆盖 Tailwind 类**：在全局 CSS 中重新定义颜色变量
2. **扩展主题配置**：在 `tailwind.config.js` 中添加自定义颜色
3. **组件级样式**：使用 CSS-in-JS 或 CSS Modules

## 最佳实践

### 1. 页面内容布局

页面内容应该遵循以下结构：

```typescript
// 好的实践
export default function MyPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">页面标题</h1>
        <Button>操作按钮</Button>
      </div>
      <Card>
        <CardContent>
          {/* 页面主要内容 */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. 响应式设计

确保页面内容在不同设备上都能良好显示：

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 响应式网格布局 */}
</div>
```

### 3. 主题适配

页面组件应该适配主题变化：

```typescript
const { uiState } = useUI();
const cardClass = uiState.theme === 'dark' 
  ? 'bg-gray-800 text-white' 
  : 'bg-white text-gray-900';
```

## 常见问题

### Q: 我的新页面没有显示导航栏？

A: 检查以下几点：
1. 确认页面路径不在 `noLayoutPages` 数组中
2. 确认页面文件在 `/src/pages/` 目录下
3. 检查浏览器控制台是否有错误信息

### Q: 如何修改导航菜单项？

A: 修改 `AppLayout.tsx` 文件中的 `navItems` 或 `adminNavItems` 数组。

### Q: 主题切换不生效？

A: 确保：
1. 页面组件正确使用了 `useUI` Hook
2. 样式类名正确对应主题变量
3. 检查 `UIContext` 的初始状态

### Q: 登录状态没有更新？

A: 检查：
1. Redux store 是否正确更新
2. PageWrapper 是否正确获取 currentUser
3. 登录/登出 action 是否正确 dispatch

## 更新日志

### v1.0.0 (2025-01)
- ✨ 初始版本发布
- ✨ 支持自动布局管理
- ✨ 集成主题切换功能
- ✨ 支持用户权限管理
- ✨ 响应式设计支持

## 相关文档

- [UI设计规范](../base/UI设计规范.md)
- [前端架构设计说明](../base/前端架构设计说明.md)
- [AppLayout集成测试报告](./AppLayout集成测试报告.md)