# Figma设计文档

## 1. 项目概览

这是一个预约系统的前端项目，采用现代React技术栈开发，使用TypeScript确保类型安全。项目实现了登录/注册功能、日历预约、时间段选择和表单提交等核心业务逻辑，并采用了组件化设计和响应式布局。

### 1.1 项目目录结构

```
figma/
├── App.tsx             # 应用主入口文件
├── globals.css         # 全局样式和主题定义
└── components/
    ├── booking-calendar.tsx  # 日历预约组件
    ├── booking-form.tsx      # 预约表单组件
    ├── time-slots.tsx        # 时间段选择组件
    ├── ui/
    │   ├── accordion.tsx     # 折叠面板组件
    │   ├── alert-dialog.tsx  # 警告对话框组件
    │   ├── button.tsx        # 按钮组件
    │   ├── card.tsx          # 卡片组件
    │   └── ... (40+ UI组件)  # 其他UI组件
    └── figma/
        └── ...               # Figma相关资源
```

## 2. 设计系统

### 2.1 色彩系统

项目采用深色主题为默认主题，并使用OKLCH色彩空间定义颜色，确保在各种设备上的显示一致性。主要颜色变量定义在`globals.css`中。

#### 2.1.1 基础颜色

```css
:root {
  /* 深色主题背景色系 */
  --background: oklch(12.3% 0 0);
  --background-secondary: oklch(15.1% 0 0);
  --background-tertiary: oklch(17.7% 0 0);
  --background-card: oklch(20.7% 0 0);
  --background-elevated: oklch(23.8% 0 0);
  --background-input: oklch(27% 0 0);
  --background-border: oklch(30.4% 0 0);
  
  /* 深色主题前景色系 */
  --foreground: oklch(99.9% 0 0);
  --foreground-secondary: oklch(95.1% 0 0);
  --foreground-tertiary: oklch(90.3% 0 0);
  --foreground-muted: oklch(85.6% 0 0);
  --foreground-disabled: oklch(80.9% 0 0);
  --foreground-border: oklch(76.2% 0 0);
  
  /* 主色调 - 红色系 */
  --primary: oklch(65.2% 0.251 10);
  --primary-light: oklch(72.1% 0.26 10);
  --primary-dark: oklch(58.3% 0.243 10);
  --primary-foreground: oklch(100% 0 0);
  
  /* 功能色 */
  --secondary: oklch(54.1% 0.17 250);
  --secondary-foreground: oklch(100% 0 0);
  --destructive: oklch(60.7% 0.24 35);
  --destructive-foreground: oklch(100% 0 0);
  --success: oklch(69.2% 0.15 125);
  --success-foreground: oklch(100% 0 0);
  --warning: oklch(82.2% 0.17 90);
  --warning-foreground: oklch(20% 0 0);
  --info: oklch(73.9% 0.15 210);
  --info-foreground: oklch(100% 0 0);
  
  /* 中性色 */
  --neutral-50: oklch(96.6% 0 0);
  --neutral-100: oklch(93.2% 0 0);
  --neutral-200: oklch(86.3% 0 0);
  --neutral-300: oklch(79.3% 0 0);
  --neutral-400: oklch(72.4% 0 0);
  --neutral-500: oklch(65.4% 0 0);
  --neutral-600: oklch(58.5% 0 0);
  --neutral-700: oklch(51.6% 0 0);
  --neutral-800: oklch(44.6% 0 0);
  --neutral-900: oklch(37.7% 0 0);
  --neutral-950: oklch(30.8% 0 0);
}
```

#### 2.1.2 语义化颜色映射

项目还定义了语义化颜色映射，将CSS变量映射为主题色，便于组件使用：

```css
:root {
  /* 内联主题 - 颜色 */
  --theme-color-background: var(--background);
  --theme-color-background-secondary: var(--background-secondary);
  --theme-color-background-tertiary: var(--background-tertiary);
  --theme-color-background-card: var(--background-card);
  --theme-color-background-elevated: var(--background-elevated);
  --theme-color-background-input: var(--background-input);
  --theme-color-background-border: var(--background-border);
  --theme-color-foreground: var(--foreground);
  --theme-color-foreground-secondary: var(--foreground-secondary);
  --theme-color-foreground-tertiary: var(--foreground-tertiary);
  --theme-color-foreground-muted: var(--foreground-muted);
  --theme-color-foreground-disabled: var(--foreground-disabled);
  --theme-color-foreground-border: var(--foreground-border);
  --theme-color-primary: var(--primary);
  --theme-color-primary-light: var(--primary-light);
  --theme-color-primary-dark: var(--primary-dark);
  --theme-color-primary-foreground: var(--primary-foreground);
  --theme-color-secondary: var(--secondary);
  --theme-color-secondary-foreground: var(--secondary-foreground);
  --theme-color-destructive: var(--destructive);
  --theme-color-destructive-foreground: var(--destructive-foreground);
  --theme-color-success: var(--success);
  --theme-color-success-foreground: var(--success-foreground);
  --theme-color-warning: var(--warning);
  --theme-color-warning-foreground: var(--warning-foreground);
  --theme-color-info: var(--info);
  --theme-color-info-foreground: var(--info-foreground);
}
```

### 2.2 排版系统

项目定义了完整的排版系统，包括字体大小、行高和字重。

#### 2.2.1 基础字体设置

```css
:root {
  /* 字体设置 */
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### 2.2.2 文本元素样式

```css
/* 标题样式 */
h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 700;
}

h2 {
  font-size: 2rem;
  line-height: 1.3;
  font-weight: 600;
}

h3 {
  font-size: 1.5rem;
  line-height: 1.4;
  font-weight: 600;
}

h4 {
  font-size: 1.25rem;
  line-height: 1.5;
  font-weight: 600;
}

/* 正文样式 */
p {
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
}

/* 标签样式 */
label {
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 500;
}

/* 按钮样式 */
button {
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 500;
}

/* 输入框样式 */
input, textarea, select {
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 400;
}
```

### 2.3 间距系统

项目使用4px为基础单位的间距系统，确保页面元素间距的一致性。

```css
:root {
  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --spacing-4xl: 96px;
  --spacing-5xl: 128px;
}
```

### 2.4 圆角系统

项目定义了统一的圆角系统，应用于卡片、按钮、输入框等组件。

```css
:root {
  /* 圆角系统 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

### 2.5 阴影系统

项目定义了多层级的阴影系统，用于区分元素的层级关系。

```css
:root {
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### 2.6 过渡动画

项目定义了统一的过渡动画时间，确保交互效果的一致性和流畅性。

```css
:root {
  /* 过渡时间 */
  --transition-fast: 0.15s;
  --transition-base: 0.2s;
  --transition-slow: 0.3s;
}
```

## 3. 组件系统

项目采用组件化设计，将UI拆分为可复用的组件。组件系统分为两类：UI组件和业务组件。

### 3.1 UI组件

UI组件位于`components/ui/`目录下，提供基础的界面元素。

#### 3.1.1 按钮组件 (Button)

按钮组件支持多种变体和尺寸，使用`class-variance-authority`实现样式变体。

```tsx
import { Button } from './ui/button';

// 默认按钮
<Button>默认按钮</Button>

// 危险按钮
<Button variant="destructive">危险按钮</Button>

// 轮廓按钮
<Button variant="outline">轮廓按钮</Button>

// 次要按钮
<Button variant="secondary">次要按钮</Button>

// 幽灵按钮
<Button variant="ghost">幽灵按钮</Button>

// 链接按钮
<Button variant="link">链接按钮</Button>

// 不同尺寸的按钮
<Button size="sm">小按钮</Button>
<Button size="md">中按钮</Button>
<Button size="lg">大按钮</Button>
<Button size="icon">图标按钮</Button>
```

#### 3.1.2 卡片组件 (Card)

卡片组件提供了完整的卡片布局系统，包括头部、标题、内容和底部。

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
  </CardHeader>
  <CardContent>
    卡片内容
  </CardContent>
  <CardFooter>
    卡片底部
  </CardFooter>
</Card>
```

#### 3.1.3 其他UI组件

项目还包含以下UI组件：

- Accordion（折叠面板）
- AlertDialog（警告对话框）
- Avatar（头像）
- Badge（徽章）
- Calendar（日历）
- Checkbox（复选框）
- Dialog（对话框）
- DropdownMenu（下拉菜单）
- Input（输入框）
- Label（标签）
- RadioGroup（单选组）
- Select（选择器）
- Separator（分隔线）
- Sheet（侧边栏）
- Tabs（标签页）
- Textarea（文本域）
- Tooltip（提示框）
- 等等

### 3.2 业务组件

业务组件位于`components/`目录下，实现特定的业务功能。

#### 3.2.1 日历预约组件 (BookingCalendar)

日历组件实现了月份切换、日期选择、禁用过去日期等功能。

```tsx
import BookingCalendar from './components/booking-calendar';

<BookingCalendar 
  selectedDate={selectedDate} 
  onDateSelect={handleDateSelect} 
  disabledDates={disabledDates} 
/>
```

#### 3.2.2 时间段选择组件 (TimeSlots)

时间段选择组件实现了上午/下午时段分类、可预约状态显示和选择功能。

```tsx
import TimeSlots from './components/time-slots';

<TimeSlots 
  selectedDate={selectedDate} 
  onTimeSlotSelect={handleTimeSlotSelect} 
  availableSlots={availableSlots} 
/>
```

#### 3.2.3 预约表单组件 (BookingForm)

预约表单组件实现了表单验证(姓名/手机号/邮箱格式)、提交处理和成功页面。

```tsx
import BookingForm from './components/booking-form';

<BookingForm 
  selectedDate={selectedDate} 
  selectedTimeSlot={selectedTimeSlot} 
  onSubmit={handleBookingSubmit} 
/>
```

## 4. 页面布局

项目实现了登录/注册页面和已登录状态的主页面两种主要布局。

### 4.1 登录/注册页面

登录/注册页面采用居中卡片布局，包含表单输入框、提交按钮和状态切换逻辑。

```tsx
// 登录页面布局
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">登录</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          {/* 登录表单输入框 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">登录</Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p>还没有账号？ <button onClick={switchToRegister}>立即注册</button></p>
      </CardFooter>
    </Card>
  </div>
</div>
```

### 4.2 已登录状态的主页面

已登录状态的主页面采用模块化布局，包含多个功能区块。

```tsx
// 已登录状态的主页面布局
<div className="min-h-screen flex flex-col">
  {/* 导航栏 */}
  <header className="border-b">
    {/* 导航栏内容 */}
  </header>
  
  <main className="flex-1">
    {/* 服务介绍区 */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h1>服务标题</h1>
        <p>服务描述</p>
        {/* 特性列表 */}
      </div>
    </section>
    
    {/* 预约系统主体 */}
    <section className="py-16 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：日历和时间段选择 */}
          <div>
            <BookingCalendar />
            <TimeSlots />
          </div>
          
          {/* 右侧：预约表单 */}
          <div>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
    
    {/* 服务特色区 */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2>服务特色</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 特色卡片 */}
          <Card>
            {/* 特色内容 */}
          </Card>
          <Card>
            {/* 特色内容 */}
          </Card>
          <Card>
            {/* 特色内容 */}
          </Card>
        </div>
      </div>
    </section>
    
    {/* 联系我们区 */}
    <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4 text-center">
        <h2>联系我们</h2>
        <p>有任何问题，请随时联系我们</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button>电话咨询</Button>
          <Button variant="outline" className="text-white border-white">在线客服</Button>
        </div>
      </div>
    </section>
  </main>
  
  {/* 页脚 */}
  <footer className="border-t py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 页脚导航链接 */}
      </div>
      <div className="mt-8 pt-8 border-t text-center text-sm text-foreground-muted">
        <p>© 2023 预约系统 版权所有</p>
      </div>
    </div>
  </footer>
</div>
```

## 5. 响应式设计

项目实现了响应式设计，确保在不同屏幕尺寸上有良好的显示效果。

### 5.1 断点系统

项目使用移动优先的断点系统，基于以下断点：

```css
:root {
  /* 断点系统 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 5.2 响应式布局示例

项目在不同断点下调整布局：

```tsx
// 响应式网格布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 内容卡片 */}
</div>

// 响应式文本大小
<h1 className="text-2xl md:text-3xl lg:text-4xl">响应式标题</h1>

// 响应式边距
<div className="m-4 md:m-8 lg:m-12">内容</div>

// 响应式显示/隐藏元素
<div className="hidden md:block">仅在中等屏幕及以上显示</div>
<div className="block md:hidden">仅在移动设备显示</div>
```

## 6. 交互设计

### 6.1 表单交互

项目实现了丰富的表单交互体验：

- 输入验证（实时验证和提交验证）
- 错误提示（输入不合法时显示具体错误信息）
- 提交状态（加载中、成功、失败状态的反馈）
- 表单重置

### 6.2 日历交互

日历组件实现了以下交互功能：

- 月份切换
- 日期选择
- 禁用日期显示
- 已预约日期提示

### 6.3 时间段选择交互

时间段选择组件实现了以下交互功能：

- 上午/下午时段分类
- 可预约状态显示
- 时间段选择
- 选择反馈

## 7. 代码规范

项目遵循以下代码规范：

### 7.1 文件命名规范

- 组件文件使用PascalCase命名（如`Button.tsx`）
- 样式文件使用小写字母加连字符命名（如`globals.css`）
- 业务组件使用kebab-case命名（如`booking-calendar.tsx`）

### 7.2 组件命名规范

- 组件名称使用PascalCase
- 组件属性使用camelCase
- 私有组件或变量使用下划线前缀（如`_PrivateComponent`）

### 7.3 TypeScript规范

- 为所有组件和函数添加类型定义
- 使用接口定义组件属性和数据结构
- 避免使用`any`类型
- 使用泛型提高代码复用性

## 8. 性能优化

项目考虑了以下性能优化策略：

### 8.1 组件懒加载

使用React的懒加载功能，按需加载组件，减少初始加载时间。

```tsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function MyComponent() {
  return (
    <React.Suspense fallback={<div>加载中...</div>}>
      <HeavyComponent />
    </React.Suspense>
  );
}
```

### 8.2 状态管理优化

- 避免不必要的状态更新
- 使用memo优化组件重渲染
- 合理使用useCallback和useMemo

### 8.3 样式优化

- 使用CSS变量提高样式复用性
- 避免过度使用CSS嵌套
- 合理使用Tailwind CSS等工具类

## 9. 开发建议

### 9.1 组件开发建议

1. 优先使用现有的UI组件
2. 新组件遵循项目的设计系统
3. 考虑组件的可复用性和可扩展性
4. 添加合适的类型定义和文档

### 9.2 页面开发建议

1. 遵循项目的布局结构
2. 合理划分组件职责
3. 考虑响应式布局
4. 优化用户交互体验

### 9.3 性能优化建议

1. 避免不必要的重渲染
2. 优化大型列表的渲染性能
3. 合理使用缓存
4. 考虑首屏加载性能

## 10. 附录

### 10.1 颜色色值表

| 颜色名称 | OKLCH值 | 用途 |
|---------|--------|------|
| 背景色 | oklch(12.3% 0 0) | 页面背景 |
| 主色调 | oklch(65.2% 0.251 10) | 主要按钮、高亮元素 |
| 成功色 | oklch(69.2% 0.15 125) | 成功状态提示 |
| 警告色 | oklch(82.2% 0.17 90) | 警告状态提示 |
| 危险色 | oklch(60.7% 0.24 35) | 错误状态提示 |
| 信息色 | oklch(73.9% 0.15 210) | 信息状态提示 |

### 10.2 常见组件组合示例

#### 表单组件组合

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

<Card>
  <CardHeader>
    <CardTitle>表单标题</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input id="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">分类</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">分类1</SelectItem>
              <SelectItem value="2">分类2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">留言</Label>
          <Textarea id="message" rows={4} />
        </div>
      </div>
    </form>
  </CardContent>
  <CardFooter>
    <Button type="submit">提交</Button>
  </CardFooter>
</Card>
```

#### 信息展示卡片组合

```tsx
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

<Card>
  <CardContent className="p-0">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <h3>卡片标题</h3>
        <Badge variant="outline">状态标签</Badge>
      </div>
      <p className="mt-2 text-sm text-foreground-tertiary">卡片描述信息</p>
    </div>
    <Separator />
    <Tabs defaultValue="tab1">
      <TabsList className="w-full justify-start px-6 pt-4">
        <TabsTrigger value="tab1">标签1</TabsTrigger>
        <TabsTrigger value="tab2">标签2</TabsTrigger>
        <TabsTrigger value="tab3">标签3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-6">标签1内容</TabsContent>
      <TabsContent value="tab2" className="p-6">标签2内容</TabsContent>
      <TabsContent value="tab3" className="p-6">标签3内容</TabsContent>
    </Tabs>
  </CardContent>
</Card>
```