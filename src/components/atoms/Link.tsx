import React from 'react';
import NextLink, { LinkProps } from 'next/link';
import { useRouter } from 'next/compat/router';

/**
 * 导航链接组件，封装了 Next.js Link 组件
 * 提供客户端导航和活动状态检测功能
 */
interface NavLinkProps extends LinkProps {
  /**
   * 链接显示的内容
   */
  children: React.ReactNode;
  /**
   * 链接的自定义CSS类名
   */
  className?: string;
  /**
   * 链接激活时的额外CSS类名
   */
  activeClassName?: string;
  /**
   * 自定义点击处理函数
   */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 导航链接组件，封装了 Next.js Link 功能
 * 支持客户端导航、活动状态检测和自定义样式
 * 
 * @example
 * ```tsx
 * <Link href="/home" className="nav-link">首页</Link>
 * ```
 * 
 * @example
 * ```tsx
 * <Link 
 *   href="/bookings" 
 *   className="nav-link" 
 *   activeClassName="nav-link-active"
 * >
 *   预约
 * </Link>
 * ```
 */
const Link: React.FC<NavLinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = 'active',
  onClick,
  ...rest
}) => {
  const router = useRouter();
  
  // 检测链接是否为当前活动路由
  const isActive = React.useMemo(() => {
    if (typeof href === 'string') {
      // 精确匹配或路径前缀匹配
      return router && (router.pathname === href || router.pathname.startsWith(`${href}/`));
    } else if (href && typeof href === 'object') {
      // 对于对象类型的href，需要比较路径名和查询参数
      const pathname = typeof href.pathname === 'string' ? href.pathname : '';
      return router && router.pathname === pathname;
    }
    return false;
  }, [href, router.pathname]);

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  // 合并基础类名和活动类名
  const combinedClassName = isActive ? `${className} ${activeClassName}` : className;

  return (
    <NextLink
      href={href}
      className={combinedClassName}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </NextLink>
  );
};

export default Link;
