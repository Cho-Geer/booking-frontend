import React from 'react';
import * as lucideIcons from 'lucide-react';
import * as heroIcons from '@heroicons/react/24/outline';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  type?: 'lucide' | 'heroicons';
}

/**
 * 原子组件：图标
 * 统一的图标组件，支持Lucide React和Heroicons
 * 
 * @component
 * @example
 * // 使用Lucide图标
 * <Icon name="Search" size={20} />
 * 
 * // 使用Heroicons图标
 * <Icon name="Search" size={20} type="heroicons" />
 * 
 * // 自定义颜色和类名
 * <Icon name="Search" size={20} color="blue-500" className="mr-2" />
 */
const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  color = '',
  type = 'lucide' 
}) => {
  // 转换驼峰命名为蛇形命名（用于Heroicons）
  const toKebabCase = (str: string): string => {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  };
  
  // 获取图标组件
  const getIconComponent = () => {
    if (type === 'lucide') {
      // 从Lucide React获取图标
      const IconComponent = lucideIcons[name as keyof typeof lucideIcons];
      if (IconComponent) {
        return IconComponent;
      }
      
      // 如果找不到，尝试首字母小写
      const lowerCaseName = name.charAt(0).toLowerCase() + name.slice(1);
      return lucideIcons[lowerCaseName as keyof typeof lucideIcons];
    } else {
      // 从Heroicons获取图标
      const kebabCaseName = toKebabCase(name);
      
      // Heroicons命名通常是kebab-case并带有Icon后缀
      const heroIconName = `${kebabCaseName}Icon`;
      const heroIconNamePascal = heroIconName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      return heroIcons[heroIconNamePascal as keyof typeof heroIcons];
    }
  };
  
  const IconComponent = getIconComponent();
  
  // 如果找不到图标，记录警告并返回null
  if (!IconComponent) {
    console.warn(`Icon not found: ${name} (type: ${type})`);
    return null;
  }
  
  // 构建颜色类名
  const colorClasses = color ? `text-${color}` : '';
  
  // 合并所有类名
  const combinedClasses = [colorClasses, className].filter(Boolean).join(' ');
  
  return (
    <IconComponent 
      size={size} 
      className={combinedClasses} 
    />
  );
};

export default Icon;