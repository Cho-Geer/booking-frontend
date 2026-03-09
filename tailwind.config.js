// Tailwind配置文件 - 符合UI设计系统说明
module.exports = {
  // 启用JIT模式以减少CSS文件大小
  mode: 'jit',
  // 配置深色模式使用class类名切换
  darkMode: 'class',
  // 配置内容扫描范围
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // 如果你使用 src 目录，也要加上：
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 主题配置 - 基于UI设计系统的设计Token
  theme: {
    extend: {
      // 颜色系统 - 在dark模式下统一使用Default颜色
      colors: {
        // 主色调 - 红色主题 (#DC2626)
        primary: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#DC2626', // dark模式使用与default相同的颜色
        },
        // 辅助色
        secondary: {
          DEFAULT: '#52c41a',
          light: '#73d13d',
          dark: '#52c41a', // dark模式使用与default相同的颜色
        },
        // 警告色
        warning: {
          DEFAULT: '#faad14',
          light: '#ffc53d',
          dark: '#faad14', // dark模式使用与default相同的颜色
        },
        // 错误色
        error: {
          DEFAULT: '#f5222d',
          light: '#ff4d4f',
          dark: '#f5222d', // dark模式使用与default相同的颜色
        },
        // 信息色
        info: {
          DEFAULT: '#1890ff',
          light: '#40a9ff',
          dark: '#1890ff', // dark模式使用与default相同的颜色
        },
        // 中性色
        neutral: {
          1: '#fafafa',
          2: '#f5f5f5',
          3: '#f0f0f0',
          4: '#d9d9d9',
          5: '#bfbfbf',
          6: '#8c8c8c',
          7: '#595959',
          8: '#434343',
          9: '#262626',
          10: '#1f1f1f',
        },
        // 背景色
        background: {
          DEFAULT: '#ffffff',
          subtle: '#fafafa',
          hover: '#f5f5f5',
          // 深色主题背景 - 保留以确保UI可读性
          dark: '#0F172A',
          'dark-100': '#1E293B',
          'dark-200': '#334155',
        },
        'input-background': {
          DEFAULT: '#ffffff',
          dark: '#1E293B',
        },
        // 文本颜色 - 在dark模式下保持原有的高对比度
        text: {
          primary: '#262626',
          secondary: '#595959',
          disabled: '#bfbfbf',
          // 深色主题文本 - 保留以确保UI可读性
          'dark-primary': '#F8FAFC',
          'dark-secondary': '#CBD5E1',
          'dark-disabled': '#64748B',
        },
        // 边框颜色 - 在dark模式下保持原有的高对比度
        border: {
          DEFAULT: '#d9d9d9',
          light: '#f0f0f0',
          dark: '#d9d9d9', // dark模式使用与default相同的颜色
          // 深色主题边框 - 保留以确保UI可读性
          'dark-light': '#334155',
          'dark': '#475569',
        },
      },
      // 字体系统
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
      // 字体大小
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
      },
      // 行高
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
      // 字重
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      // 间距系统
      spacing: {
        // 基于4px网格的间距单位
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        32: '128px',
        40: '160px',
        48: '192px',
        56: '224px',
        64: '256px',
        // 负边距
        '-1': '-4px',
        '-2': '-8px',
        '-3': '-12px',
        '-4': '-16px',
        '-5': '-20px',
        '-6': '-24px',
        '-8': '-32px',
        '-10': '-40px',
        '-12': '-48px',
        '-16': '-64px',
      },
      // 圆角系统
      borderRadius: {
        0: '0px',
        1: '2px',
        2: '4px',
        3: '6px',
        4: '8px',
        6: '12px',
        8: '16px',
        12: '24px',
        full: '9999px',
        circle: '50%',
      },
      // 阴影系统
      boxShadow: {
        // 基础阴影
        1: '0 2px 8px rgba(0, 0, 0, 0.06)',
        2: '0 4px 12px rgba(0, 0, 0, 0.08)',
        3: '0 6px 16px rgba(0, 0, 0, 0.1)',
        4: '0 8px 24px rgba(0, 0, 0, 0.12)',
        5: '0 12px 32px rgba(0, 0, 0, 0.16)',
        // 内阴影
        inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        // 悬浮阴影
        hover: '0 8px 24px rgba(0, 0, 0, 0.12)',
        // 聚焦阴影
        focus: '0 0 0 2px rgba(24, 144, 255, 0.2)',
      },
      // 过渡动画
      transitionTimingFunction: {
        // 缓动函数
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      // 动画时长
      transitionDuration: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },
      // 动画延迟
      transitionDelay: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
      },
      // 动画
      animation: {
        // 淡入淡出
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        // 滑入滑出
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-up': 'slideOutUp 0.3s ease-out',
        'slide-out-down': 'slideOutDown 0.3s ease-out',
        'slide-out-left': 'slideOutLeft 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out',
        // 缩放动画
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        // 脉冲动画
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      // 动画关键帧
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        slideOutDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-20px)', opacity: '0' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(20px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      // 自定义工具类
      utilities: {
        // 为了保持向后兼容，添加scheme-dark类名支持
        '.scheme-dark': {
          '@apply dark': {},
        },
        '.scheme-light': {
          '@apply not-dark': {},
        },
        // 文本截断
        'text-ellipsis': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        'text-ellipsis-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        },
        'text-ellipsis-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        },
        // 滚动行为
        'scroll-smooth': {
          scrollBehavior: 'smooth',
        },
        'scroll-hidden': {
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        // 可点击区域
        'clickable': {
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  // 插件配置
  plugins: [
    // 可以添加自定义插件或社区插件
    // 例如：require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
  // 排除配置
  purge: {
    // 排除不需要扫描的文件
    content: [],
    // 保留必要的类名
    safelist: [
      // 动态生成的类名可以添加到这里
    ],
  },
  // 前缀配置
  prefix: '',
  // 重要性配置
  important: false,
};