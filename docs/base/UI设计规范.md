# UI设计规范

## 更新记录
- 2024-11-10：根据设计系统整合建议进行系统性更新，统一设计规范
- 2024-11-11：增加深浅主题切换支持，明确主题切换时字体颜色变化机制
- 2024-11-12：全面优化设计规范，解决章节间不匹配问题，统一设计标准

## 1. 概述
本规范旨在确保预约系统UI的一致性、可用性和美观性。基于原子化设计模式，同时支持深色和浅色主题，以满足不同用户的视觉偏好，打造专业、沉浸式的用户体验。

## 2. 设计决策
- **主题选择**：同时支持深色和浅色主题，提供主题切换功能，默认使用深色主题
- **主色调**：统一选择红色系(oklch(65.2% 0.251 10))作为主色调，传达活力和专业感
- **排版系统**：基于Inter字体，建立清晰的文字层级，确保跨主题的可读性
- **布局方法**：采用12列网格系统，移动端优先设计
- **组件体系**：遵循原子化设计模式，确保组件可复用性
- **主题切换机制**：基于Tailwind CSS的darkMode: 'class'实现，确保所有UI元素（特别是字体颜色）能随主题平滑切换

## 3. 设计系统规范

### 3.1 设计原则
基于UI参考图，采用现代化、简洁、专业的设计风格，结合双主题支持提供个性化体验：

1. **视觉层次**：清晰的视觉层次结构，重要信息突出显示
2. **色彩系统**：使用红色系作为主色调，同时支持深色和浅色主题，确保在两种主题下都有良好的可读性
3. **间距规范**：基于8px网格系统的一致间距，确保界面整洁有序
4. **响应式设计**：移动端优先，适配各种屏幕尺寸
5. **无障碍设计**：遵循WCAG 2.1 AA标准，确保可访问性

### 3.2 组件状态
组件应包含完整的交互和反馈状态，提供明确的视觉反馈，并在主题切换时保持一致性：

#### 交互状态
- **默认状态**：默认外观
- **悬停状态**：轻微亮度变化或阴影增强
- **激活状态**：颜色加深或添加内阴影
- **禁用状态**：透明度降低，鼠标样式改变
- **聚焦状态**：添加聚焦环或边框变化

#### 反馈状态
- **加载状态**：旋转动画或脉冲效果
- **成功状态**：绿色主题(oklch(70.8% 0.164 162))配成功图标
- **警告状态**：橙色主题(oklch(87.3% 0.164 70))配警告图标
- **错误状态**：红色主题(oklch(71.4% 0.241 11))配错误图标

#### 主题切换适配
所有组件状态在深浅主题下均应保持视觉一致性，确保状态变化明显且符合用户预期

### 3.3 布局系统

#### 网格系统
- **容器宽度**：max-w-7xl (1280px) 默认，响应式调整
- **列数**：12列网格系统
- **间距**：基于8px网格系统的间距规范
- **断点**：
  - sm: 640px
  - md: 768px  
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

#### 主题适配原则
- 深色主题：通过背景色和边框色构建层次感
- 浅色主题：通过阴影和微妙的颜色差异构建层次感

#### 组件布局规范
- **卡片组件**：
  - 内边距：p-6 (24px)
  - 圆角：rounded-lg (8px)
  - 阴影：shadow-md
  - 背景：深色主题使用bg-dark-200 (oklch(18.1% 0 0))，浅色主题使用bg-light-200 (oklch(96.9% 0 0))
- **按钮组件**：
  - 高度：h-10 (40px) 标准按钮
  - 内边距：px-4 py-2 (16px水平，8px垂直)
  - 圆角：rounded-md (6px)
  - 字体权重：font-medium
  - 主按钮：bg-primary text-white (oklch(65.2% 0.251 10), oklch(99.9% 0 0))
- **输入框组件**：
  - 高度：h-10 (40px)
  - 内边距：px-3 py-2 (12px水平，8px垂直)
  - 背景：深色主题使用bg-dark-100 (oklch(28.8% 0 0))，浅色主题使用bg-light-100 (oklch(99.9% 0 0))
  - 文字：深色主题使用text-primary (oklch(99.9% 0 0))，浅色主题使用text-primary (oklch(12.3% 0 0))
  - 聚焦状态：ring-2 ring-primary border-primary

#### 主题适配规范
所有组件布局在深浅主题下应保持结构一致性，仅通过颜色、阴影和对比度调整来适应不同主题

### 3.4 设计Token
设计Token是可复用的设计决策，确保整个系统的视觉一致性。所有设计Token应与Tailwind CSS配置完全对应，确保实现一致性。

#### 颜色Token（基于OKLCH色彩空间）
```typescript
const colors = {
  primary: {
    50: 'oklch(97.7% 0.064 10)',
    100: 'oklch(95.5% 0.107 10)',
    200: 'oklch(91.1% 0.173 10)',
    300: 'oklch(85.5% 0.227 10)',
    400: 'oklch(78.6% 0.244 11)',
    500: 'oklch(65.2% 0.251 10)', // 主色（红色）
    600: 'oklch(56.5% 0.241 11)',
    700: 'oklch(48.3% 0.217 13)',
    800: 'oklch(41.3% 0.182 14)',
    900: 'oklch(35.2% 0.153 15)',
  },
  success: {
    500: 'oklch(70.8% 0.164 162)', // 成功色
  },
  warning: {
    500: 'oklch(87.3% 0.164 70)', // 警告色
  },
  error: {
    500: 'oklch(71.4% 0.241 11)', // 错误色
  },
  // 深色主题颜色
  dark: {
    100: 'oklch(28.8% 0 0)',
    200: 'oklch(18.1% 0 0)',
    300: 'oklch(12.3% 0 0)', // 深色背景
    400: 'oklch(8.9% 0 0)', // 更深色背景
  },
  // 浅色主题颜色
  light: {
    100: 'oklch(99.9% 0 0)', // 浅色背景
    200: 'oklch(96.9% 0 0)', // 卡片背景
    300: 'oklch(89.1% 0 0)', // 边框颜色
    400: 'oklch(85.1% 0 0)', // 次要元素颜色
  },
  // 文本颜色（统一命名，方便主题切换）
  text: {
    primary: {
      dark: 'oklch(99.9% 0 0)', // 深色主题主文字
      light: 'oklch(12.3% 0 0)', // 浅色主题主文字
    },
    secondary: {
      dark: 'oklch(78.6% 0 0)', // 深色主题次要文字
      light: 'oklch(28.8% 0 0)', // 浅色主题次要文字
    },
    tertiary: {
      dark: 'oklch(60.8% 0 0)', // 深色主题辅助文字
      light: 'oklch(45.1% 0 0)', // 浅色主题辅助文字
    },
  },
}
```

#### 间距Token
```typescript
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  2xl: '3rem',    // 48px
  3xl: '4rem',    // 64px
  4xl: '6rem',    // 96px
  5xl: '8rem',    // 128px
}
```

#### 字体Token
```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['SFMono', 'Monaco', 'monospace'],
  },
  fontSize: {
    tiny: '0.75rem',   // 12px (极小字)
    small: '0.875rem', // 14px (小字)
    body: '1rem',      // 16px (正文)
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px (标题3)
    '3xl': '1.875rem', // 30px (标题2)
    '4xl': '2.25rem',  // 36px (标题1)
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    title: '1.2-1.4',
    body: '1.6',
  }
}
```

#### 圆角Token
```typescript
const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // 圆形
}
```

#### 阴影Token
```typescript
const shadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}
```

#### 过渡Token
```typescript
const transition = {
  fast: '0.15s',
  DEFAULT: '0.2s',
  slow: '0.3s',
}
```

### 3.5 组件实现规范

#### 组件分类
采用原子化设计模式(Atomic Design)，将UI组件分解为五个层次：
1. **原子(Atoms)**：最小的UI单元，如按钮、输入框、标签、图标
2. **分子(Molecules)**：由原子组成的简单UI组合，如搜索框、表单字段、卡片头部
3. **有机体(Organisms)**：相对复杂的UI组件，形成独立的功能单元，如预约表单、日历组件、导航栏
4. **模板(Templates)**：页面级组件，定义内容结构，如预约页面模板、管理后台模板
5. **页面(Pages)**：具体的页面实例，填充真实数据

#### 组件实现方式
- 使用`class-variance-authority`实现组件样式变体
- 为所有组件添加详细的TypeScript类型定义
- 遵循单一职责原则，确保组件可复用性和可测试性
- 组件应支持响应式行为，根据屏幕尺寸调整布局
- 使用React Context管理主题和全局UI状态，确保主题切换时界面元素（特别是字体颜色）能够相应变化

#### 组件实现规范
1. 所有组件应支持完整的主题切换功能，根据当前主题自动应用对应的颜色方案
2. 严格使用基于OKLCH色彩空间的设计Token，确保跨主题的视觉一致性
3. 提供清晰的焦点状态和交互反馈，符合无障碍设计标准
4. 支持响应式调整，在不同屏幕尺寸下保持良好的可用性
5. 确保组件在深色和浅色主题下的对比度均符合WCAG 2.1 AA标准
6. 组件状态设计应包含默认、悬停、激活、禁用和聚焦等交互状态，以及加载、成功、警告和错误等反馈状态
7. 为组件添加详细的文档和类型定义，提高可维护性和开发效率

## 4. 响应式设计规范

### 4.1 移动端优先 (Mobile First)
- **默认样式**：移动端样式
- **渐进增强**：通过断点逐步添加桌面端样式
- **触摸优化**：按钮和交互元素最小44px触摸区域
- **主题适配**：确保响应式布局在深浅主题下均保持良好的可读性和可用性

### 4.2 断点系统
```typescript
const breakpoints = {
  sm: '640px',   // 小型设备
  md: '768px',   // 中型设备  
  lg: '1024px',  // 大型设备
  xl: '1280px',  // 特大型设备
  2xl: '1536px', // 超大型设备
}
```

### 4.3 组件响应式行为
- **日期选择器**：
  - sm (<640px)：单列显示，全屏模态
  - md (640px-767px)：单列显示，底部弹出
  - lg (768px+)：网格布局，内嵌显示，支持并排多日选择
  - 主题适配：确保在深浅主题下日期选择的视觉一致性和交互反馈
- **时间选择器**：
  - sm (<640px)：2列布局，垂直滚动
  - md (640px-767px)：3列布局，紧凑显示
  - lg (768px+)：4列布局，宽松显示
  - 主题适配：确保在深浅主题下时间选择的视觉一致性和交互反馈
- **表单布局**：
  - sm (<640px)：垂直堆叠，全宽输入框
  - md (640px-767px)：2列网格布局，紧凑间距
  - lg (768px+)：多列网格布局，标准间距
  - 主题适配：确保表单元素在深浅主题下的可读性和交互体验
- **导航栏**：
  - sm (<640px)：汉堡菜单，抽屉式导航
  - md (640px-767px)：精简导航，部分选项折叠
  - lg (768px+)：完整导航，全部选项可见
  - 主题适配：确保导航元素在深浅主题下的视觉一致性
- **卡片组件**：
  - sm (<640px)：单列显示，全宽
  - md (640px-767px)：2列网格显示
  - lg (768px+)：多列网格显示，数量根据容器宽度自适应
  - 主题适配：确保卡片样式在深浅主题下的层次感和可读性

## 5. 色彩系统

本系统采用OKLCH色彩空间，提供更准确的色彩感知和更一致的色彩渐变效果，同时支持深色和浅色主题。

### 5.1 主色调（统一使用OKLCH色彩空间）
- **主色**：统一使用oklch(65.2% 0.251 10) (红色系，用于主要操作按钮和高亮显示)
- **辅助色**：oklch(70.8% 0.164 162) (绿色系，成功状态)
- **警告色**：oklch(87.3% 0.164 70) (橙色系，警告信息)
- **错误色**：oklch(71.4% 0.241 11) (红色系，错误提示)

### 5.2 主题颜色系统（基于OKLCH色彩空间）

#### 深色主题（默认）
- **背景色**：oklch(12.3% 0 0) (深色背景，提供沉浸式体验)
- **次要背景**：oklch(18.1% 0 0) (稍浅的深色背景，用于卡片和区域划分)
- **边框色**：oklch(28.8% 0 0) (深色边框，保持界面连贯性)
- **文字主色**：oklch(99.9% 0 0) (浅色文字，确保在深色背景上的可读性)
- **文字次要**：oklch(78.6% 0 0) (中等浅色文字，用于辅助信息)
- **文字辅助**：oklch(60.8% 0 0) (较浅浅色文字，用于最次要信息)

#### 浅色主题
- **背景色**：oklch(99.9% 0 0) (浅色背景，提供明亮简洁的体验)
- **次要背景**：oklch(96.9% 0 0) (稍深的浅色背景，用于卡片和区域划分)
- **边框色**：oklch(85.1% 0 0) (浅色边框，保持界面连贯性)
- **文字主色**：oklch(12.3% 0 0) (深色文字，确保在浅色背景上的可读性)
- **文字次要**：oklch(28.8% 0 0) (中等深色文字，用于辅助信息)
- **文字辅助**：oklch(45.1% 0 0) (较浅深色文字，用于最次要信息)

### 5.3 颜色应用规范
- 主色用于关键操作按钮、高亮状态和重要信息提示
- 成功色用于操作成功状态、进度条等积极反馈
- 警告色用于警告信息、需要用户注意的操作
- 错误色用于错误信息、表单验证失败等负面反馈
- **主题切换时字体颜色变化规则**：
  - 深色主题：文本使用浅色系(oklch(99.9% 0 0), oklch(78.6% 0 0))以确保在深色背景上的可读性
  - 浅色主题：文本使用深色系(oklch(12.3% 0 0), oklch(28.8% 0 0))以确保在浅色背景上的可读性
- 确保文本与背景的对比度符合WCAG 2.1 AA标准
- 主题切换时，所有UI元素（包括文本、背景、边框）应平滑过渡，避免视觉闪烁

### 5.4 色彩系统结构

色彩系统采用语义化的设计，通过CSS变量和设计Token实现主题切换。系统将颜色分为核心层、语义层和应用层三个层次，确保设计系统的一致性和可维护性，并与Tailwind CSS配置完全对应。

#### 1. 核心层
- 定义基础的颜色值，完全基于OKLCH色彩空间
- 包括主色、功能色、中性色等原始色值
- 示例：`--color-primary-500: oklch(65.2% 0.251 10);`

#### 2. 语义层
- 将核心层颜色映射到语义化的名称
- 支持主题切换时的颜色替换
- 示例：`--color-background: var(--color-dark-300);` (深色主题)
- 示例：`--color-background: var(--color-light-100);` (浅色主题)

#### 3. 应用层
- 为特定组件和场景定义应用级别的颜色
- 基于语义层颜色构建
- 示例：`--color-button-primary-bg: var(--color-primary-500);`

#### 色彩系统整合要求
1. 统一使用OKLCH色彩空间进行颜色定义，不再使用HEX值
2. 保持红色系主色调(oklch(65.2% 0.251 10))，确保在深浅主题下的视觉一致性
3. 确保色彩对比度符合WCAG 2.1 AA标准
4. 优化颜色命名规范，确保语义化和一致性
5. 建立统一的主题切换机制，确保跨组件的主题一致性
6. 确保设计Token与Tailwind CSS配置完全对应，实现一处定义多处使用

## 6. 字体系统

### 6.1 字体族
- **标题字体**：Inter, system-ui, Avenir, Helvetica, Arial, sans-serif
- **正文字体**：Inter, system-ui, Avenir, Helvetica, Arial, sans-serif
- **等宽字体**：SFMono, Monaco, monospace

### 6.2 字体大小（统一命名规范）
- **标题1**：4xl (2.25rem, 36px) - 页面主标题
- **标题2**：3xl (1.875rem, 30px) - 区块标题
- **标题3**：2xl (1.5rem, 24px) - 小组件标题
- **正文**：body (1rem, 16px) - 标准正文
- **小字**：small (0.875rem, 14px) - 辅助信息
- **极小字**：tiny (0.75rem, 12px) - 标签信息

### 6.3 行高
- **标题**：1.2-1.4
- **正文**：1.6

### 6.4 字体应用规范
- 标题使用粗体或半粗体，确保视觉层次
- 正文使用常规字重，保证长时间阅读舒适度
- 辅助文本使用较小字体和次要文字颜色
- 等宽字体用于代码块、数据表格等需要对齐的内容
- **主题切换时字体样式规则**：
  - 字体大小、字重和行高在不同主题下保持一致
  - 字体颜色根据主题自动调整以确保最佳可读性
  - 深色主题使用浅色文字(oklch(99.9% 0 0), oklch(78.6% 0 0))，浅色主题使用深色文字(oklch(12.3% 0 0), oklch(28.8% 0 0))
  - 确保文本与背景的对比度符合WCAG 2.1 AA标准

## 7. 间距系统

### 7.1 基于8px网格系统
- **xs**：0.25rem (4px)
- **sm**：0.5rem (8px)
- **md**：1rem (16px)
- **lg**：1.5rem (24px)
- **xl**：2rem (32px)
- **2xl**：3rem (48px)
- **3xl**：4rem (64px)
- **4xl**：6rem (96px)
- **5xl**：8rem (128px)

### 7.2 间距应用规范
- 使用一致的间距单位，避免随意使用像素值
- 组件内部使用较小间距（sm, md）
- 组件之间使用中等间距（md, lg）
- 区块之间使用较大间距（xl, 2xl）
- 确保内容区域有足够的留白，提高可读性

## 8. 圆角和阴影

### 8.1 圆角系统
- **none**：0px (直角)
- **sm**：0.125rem (2px)
- **md**：0.375rem (6px)
- **lg**：0.5rem (8px)
- **xl**：0.75rem (12px)
- **2xl**：1.5rem (24px)
- **full**：9999px (圆形)

### 8.2 圆角应用规范
- 按钮使用中等圆角（md）
- 卡片使用较大圆角（lg）
- 输入框使用中等圆角（md）
- 头像和圆形图标使用圆形（full）
- 表格和分割线使用直角（none）

### 8.3 阴影系统
- **sm**：0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **md**：0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **lg**：0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- **xl**：0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- **2xl**：0 25px 50px -12px rgba(0, 0, 0, 0.25)

### 8.4 阴影应用规范
- 基础组件使用轻微阴影（sm, md）
- 卡片和模态框使用中等阴影（md, lg）
- 下拉菜单和悬浮元素使用较深阴影（lg, xl）
- 避免过度使用阴影，保持界面简洁
- **主题切换时阴影规则**：
  - 深色主题使用标准阴影
  - 浅色主题阴影可以稍微加深以提高层次感
  - 确保阴影在不同主题下的视觉效果保持一致

## 9. 动画规范

### 9.1 过渡时间
- **快速过渡**：0.15s
- **标准过渡**：0.2s
- **慢速过渡**：0.3s

### 9.2 过渡效果
- **标准过渡**：all 0.2s ease-out
- **快速过渡**：all 0.15s ease-out
- **慢速过渡**：all 0.3s ease-in-out

### 9.3 动画曲线
- **ease-out**：快速开始，缓慢结束，适合入场动画
- **ease-in-out**：缓慢开始和结束，适合对称动画
- **linear**：匀速动画，适合旋转等循环动画

### 9.4 组件动画
- 按钮悬停：轻微放大效果 (scale: 1.02)
- 卡片悬停：轻微放大和阴影增强
- 模态框：淡入淡出和缩放效果
- 页面切换：淡入淡出和位移效果
- **主题切换动画**：平滑的颜色过渡，确保文本和背景色变化自然，避免视觉闪烁

### 9.5 反馈动画
- 加载状态：旋转动画或脉冲效果
- 成功状态：淡入成功图标和文字
- 错误状态：抖动动画和错误提示
- 表单验证：实时反馈动画

## 10. 实现配置

### 10.1 Tailwind CSS配置（与设计Token完全对应）
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 启用基于类的暗色模式
  theme: {
    extend: {
      colors: {
        primary: 'oklch(65.2% 0.251 10)', // 红色主色调（基于OKLCH色彩空间）
        success: 'oklch(70.8% 0.164 162)',
        warning: 'oklch(87.3% 0.164 70)',
        error: 'oklch(71.4% 0.241 11)',
        // 深色主题
        dark: {
          100: 'oklch(28.8% 0 0)',
          200: 'oklch(18.1% 0 0)',
          300: 'oklch(12.3% 0 0)', // 深色背景
          400: 'oklch(8.9% 0 0)', // 更深色背景
        },
        // 浅色主题
        light: {
          100: 'oklch(99.9% 0 0)', // 浅色背景
          200: 'oklch(96.9% 0 0)', // 卡片背景
          300: 'oklch(89.1% 0 0)', // 边框颜色
          400: 'oklch(85.1% 0 0)', // 次要元素颜色
        },
        // 文本颜色
        'text-primary-dark': 'oklch(99.9% 0 0)', // 深色主题主文字
        'text-secondary-dark': 'oklch(78.6% 0 0)', // 深色主题次要文字
        'text-tertiary-dark': 'oklch(60.8% 0 0)', // 深色主题辅助文字
        'text-primary-light': 'oklch(12.3% 0 0)', // 浅色主题主文字
        'text-secondary-light': 'oklch(28.8% 0 0)', // 浅色主题次要文字
        'text-tertiary-light': 'oklch(45.1% 0 0)', // 浅色主题辅助文字
        // 语义化文本颜色（根据主题自动切换）
        'text-primary': 'oklch(12.3% 0 0)', // 默认浅色主题主文字
        'text-secondary': 'oklch(28.8% 0 0)', // 默认浅色主题次要文字
        'text-tertiary': 'oklch(45.1% 0 0)', // 默认浅色主题辅助文字
      },
      dark: {
        extend: {
          colors: {
            // 深色主题语义化颜色
            'text-primary': 'oklch(99.9% 0 0)', // 深色主题主文字
            'text-secondary': 'oklch(78.6% 0 0)', // 深色主题次要文字
            'text-tertiary': 'oklch(60.8% 0 0)', // 深色主题辅助文字
          },
        },
      },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SFMono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '2.5rem' }],
        'h2': ['1.875rem', { lineHeight: '2.25rem' }],
        'h3': ['1.5rem', { lineHeight: '2rem' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        'small': ['0.875rem', { lineHeight: '1.25rem' }],
        'tiny': ['0.75rem', { lineHeight: '1rem' }],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      transitionDuration: {
        'fast': '0.15s',
        'DEFAULT': '0.2s',
        'slow': '0.3s',
      },
    },
  },
}
```

### 10.2 主题配置
```typescript
// theme-context.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// 导入颜色配置
import { colors } from './design-tokens';

interface ThemeContextType {
  mode: 'dark' | 'light'; // 支持深色和浅色主题
  toggleMode: () => void;
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  // 根据当前主题获取对应的文本颜色
  textColor: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleMode: () => {},
  colors,
  typography,
  spacing,
  textColor: {
    primary: colors.textDark[100],
    secondary: colors.textDark[200],
    tertiary: colors.textDark[300],
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从localStorage获取保存的主题，默认为dark
  const [mode, setMode] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
  });
  
  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
    // 更新document的class以触发Tailwind的darkMode变化
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // 根据当前主题确定文本颜色
  const textColor = {
    primary: mode === 'dark' ? colors.textDark[100] : colors.textLight[100],
    secondary: mode === 'dark' ? colors.textDark[200] : colors.textLight[200],
    tertiary: mode === 'dark' ? colors.textDark[300] : colors.textLight[300],
  };
  
  const contextValue: ThemeContextType = {
    mode,
    toggleMode,
    colors,
    typography,
    spacing,
    textColor,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

## 11. 组件实现示例

### 11.1 按钮组件
```typescript
// Button.tsx
import React, { ButtonHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import { useTheme } from '../contexts/ThemeContext';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-offset-2',
        secondary: 'bg-dark-100 dark:bg-dark-100 light:bg-light-200 text-text-100 dark:text-text-dark-100 light:text-text-light-100 hover:bg-dark-200 dark:hover:bg-dark-200 light:hover:bg-light-300 focus:ring-2 focus:ring-dark-100 focus:ring-offset-2',
        destructive: 'bg-error text-white hover:bg-error-600 focus:ring-2 focus:ring-error focus:ring-offset-2',
        ghost: 'hover:bg-dark-100 dark:hover:bg-dark-100 light:hover:bg-light-200 focus:ring-2 focus:ring-dark-100 focus:ring-offset-2',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2 text-base',
        lg: 'h-11 px-8 text-base',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
    compoundVariants: [
      { variant: 'primary', disabled: true, className: 'bg-primary/70' },
      { variant: 'secondary', disabled: true, className: 'bg-dark-100/70 dark:bg-dark-100/70 light:bg-light-200/70' },
      { variant: 'destructive', disabled: true, className: 'bg-error/70' },
      { variant: 'ghost', disabled: true, className: 'hover:bg-transparent' },
    ],
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  ...props
}) => {
  const { mode } = useTheme();
  // 确保按钮样式根据主题正确应用
  const themeClass = mode === 'dark' ? 'dark' : 'light';
  
  return (
    <button
      className={`${buttonVariants({ variant, size, disabled })} ${className || ''} ${themeClass}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 11.2 日期选择器组件
```typescript
// DatePicker.tsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useTheme } from '../contexts/ThemeContext';

interface DatePickerProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  unavailableDates: Date[];
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  unavailableDates = [],
  className,
}) => {
  const { mode, textColor } = useTheme();
  const isUnavailable = (date: Date) => {
    return unavailableDates.some(
      unavailableDate =>
        date.getDate() === unavailableDate.getDate() &&
        date.getMonth() === unavailableDate.getMonth() &&
        date.getFullYear() === unavailableDate.getFullYear()
    );
  };

  // 根据主题生成对应的样式
  const themeClass = mode === 'dark' ? 'dark' : 'light';
  const containerBgClass = mode === 'dark' ? 'bg-dark-200' : 'bg-light-200';
  const textClass = mode === 'dark' ? 'text-text-dark-100' : 'text-text-light-100';
  const textSecondaryClass = mode === 'dark' ? 'text-text-dark-200' : 'text-text-light-200';
  const dayHoverBgClass = mode === 'dark' ? 'bg-primary-900/30' : 'bg-primary-50';

  // 自定义样式应用到日期选择器
  const dayPickerStyles = {
    container: `${containerBgClass} rounded-lg shadow-md p-6`,
    month: 'inline-block',
    weekdaysRow: 'grid grid-cols-7 text-center',
    weekday: `text-sm font-medium ${textSecondaryClass} py-2`,
    day: `h-10 w-10 flex items-center justify-center rounded-full ${textClass} transition-colors`,
    dayHover: dayHoverBgClass,
    daySelected: 'bg-primary text-white',
    dayDisabled: `${textSecondaryClass} opacity-50 cursor-not-allowed`,
    dayToday: 'ring-2 ring-primary-500',
    monthCaption: `text-lg font-semibold ${textClass} mb-4`,
    navButton: `p-2 hover:bg-dark-100 dark:hover:bg-dark-100 light:hover:bg-light-100 rounded-md transition-colors`,
  };

  return (
    <div className={`${className || ''} ${themeClass}`}>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabledDays={[isUnavailable, { before: new Date() }]}
        className={dayPickerStyles.container}
        style={{
          '--rdp-day-hover-bg': mode === 'dark' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.05)',
          '--rdp-day-selected-bg': '#DC2626',
          '--rdp-day-selected-color': '#FFFFFF',
          '--rdp-day-disabled-color': mode === 'dark' ? 'rgba(203, 213, 225, 0.5)' : 'rgba(100, 116, 139, 0.5)',
        }}
      />
    </div>
  );
};
```

### 11.3 表单输入组件
```typescript
// InputField.tsx
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface InputBaseProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface InputFieldProps extends InputBaseProps, InputHTMLAttributes<HTMLInputElement> {
  type: 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'time';
}

interface TextareaProps extends InputBaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  type: 'textarea';
  rows?: number;
}

type FormFieldProps = InputFieldProps | TextareaProps;

export const InputField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  type,
  className,
  ...props
}) => {
  const { mode } = useTheme();
  const themeClass = mode === 'dark' ? 'dark' : 'light';
  const bgClass = mode === 'dark' ? 'bg-dark-100' : 'bg-light-100';
  const textClass = mode === 'dark' ? 'text-text-dark-100' : 'text-text-light-100';
  const labelClass = mode === 'dark' ? 'text-text-dark-200' : 'text-text-light-200';
  
  const baseInputStyles = `w-full px-3 py-2 ${bgClass} ${textClass} rounded-md focus:outline-none focus:border focus:border-primary transition-colors`;
  const errorStyles = error ? 'border-red-500 focus:border-red-500' : '';
  
  const inputStyles = `${baseInputStyles} ${errorStyles} ${className || ''}`;
  
  if (type === 'textarea') {
    return (
      <div className={`space-y-2 ${themeClass}`}>
        <label className={`block text-sm font-medium ${labelClass}`}>
          {label} {required && <span className="text-primary">*</span>}
        </label>
        <textarea
          className={inputStyles}
          rows={(props as TextareaProps).rows || 4}
          {...props}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${themeClass}`}>
      <label className={`block text-sm font-medium ${labelClass}`}>
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        className={inputStyles}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
```

## 12. 交互设计规范

### 12.1 表单交互
- 输入验证：实时验证，提供清晰的错误提示
- 错误提示：红色边框和错误文本，位于输入框下方
- 提交状态：按钮显示加载状态，防止重复提交
- 表单重置：提供清晰的重置按钮或操作方式

### 12.2 日历交互
- 月份切换：左右箭头导航，显示当前月份和年份
- 日期选择：点击选择日期，显示选中状态
- 禁用日期：灰色显示，不可点击
- 已预约提示：特殊标记显示已预约日期

### 12.3 时间段选择交互
- 上午/下午时间段显示：通过分组清晰区分
- 时间段选择：点击选择，显示选中状态
- 已预约时间段：显示为禁用状态，不可选择
- 悬停效果：提供视觉反馈，提示可点击

### 12.4 主题切换交互
- **切换按钮**：提供明确的主题切换按钮（通常在导航栏或用户设置中）
- **过渡动画**：主题切换时提供平滑的过渡动画（约0.3秒）
- **字体颜色适配**：主题切换时，字体颜色自动调整以确保与背景的对比度符合WCAG 2.1 AA标准
- **状态保存**：用户选择的主题偏好应保存在本地存储中，下次访问时自动应用
- **系统主题感知**：可选功能，首次访问时可检测系统主题偏好并自动应用

### 12.5 无障碍设计交互
- 键盘导航：支持键盘Tab键导航和Enter/Space键选择
- 焦点状态：明确的焦点指示器，帮助键盘用户了解当前位置
- 颜色对比度：确保文本与背景的对比度符合WCAG 2.1 AA标准（深色主题和浅色主题均需满足）
- 屏幕阅读器支持：所有交互元素都有适当的ARIA属性

## 13. 设计系统文档与维护

### 13.1 文档结构
- 设计系统规范：本文档
- 组件库文档：各组件的使用说明、属性、事件和示例
- 更新记录：详细记录设计规范的变更历史

### 13.2 维护流程
- 设计规范更新需经过团队评审
- 更新后需同步到所有相关文档和代码库
- 重大变更需通知所有相关开发和设计人员

## 14. 常见问题与解决方案

### 14.1 主题切换问题
- **问题**：主题切换时页面闪烁
  **解决方案**：确保主题切换时使用CSS过渡，并优化初始加载逻辑
- **问题**：部分组件在深色主题下对比度不足
  **解决方案**：使用主题上下文提供的文本颜色，确保符合WCAG标准
- **问题**：主题设置不持久化
  **解决方案**：使用localStorage存储主题偏好

### 14.2 性能优化建议
- 组件懒加载：减少初始加载时间
- CSS优化：避免不必要的样式计算
- 缓存策略：合理使用React.memo和useMemo

### 14.3 兼容性考虑
- 浏览器兼容性：支持Chrome、Firefox、Safari、Edge最新版本
- 设备兼容性：适配主流移动设备和桌面设备
- 无障碍兼容性：确保符合WCAG 2.1 AA标准

## 15. 附录

### 15.1 设计系统词汇表
- **原子设计**：将UI分解为原子、分子、有机体、模板和页面的设计方法论
- **设计Token**：可复用的设计决策，如颜色、字体、间距等
- **响应式设计**：使界面适应不同屏幕尺寸的设计方法
- **WCAG**：Web内容无障碍指南，确保网站对残障用户友好

### 15.2 参考资源
- Tailwind CSS官方文档
- React官方文档
- WCAG 2.1 AA标准文档
- 原子设计方法论文档

文档最后更新时间：2024-11-11