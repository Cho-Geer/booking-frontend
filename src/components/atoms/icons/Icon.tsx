import React from 'react';
import * as lucideIcons from 'lucide-react';
import * as heroIcons from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  type?: 'lucide' | 'heroicons';
}

type HeroIconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type LucideIconComponent = ComponentType<{ size?: number; className?: string }>;

const lucideIconMap = lucideIcons as unknown as Record<string, LucideIconComponent>;
const heroIconMap = heroIcons as Record<string, HeroIconComponent>;

const toKebabCase = (value: string): string => {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

const toHeroIconName = (value: string): string => {
  const iconName = `${toKebabCase(value)}-icon`;
  return iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  color = '',
  type = 'lucide',
}) => {
  const colorClasses = color ? `text-${color}` : '';
  const combinedClasses = [colorClasses, className].filter(Boolean).join(' ');

  if (type === 'lucide') {
    const IconComponent =
      lucideIconMap[name] ?? lucideIconMap[name.charAt(0).toLowerCase() + name.slice(1)];

    if (!IconComponent) {
      console.warn(`Icon not found: ${name} (type: ${type})`);
      return null;
    }

    return <IconComponent size={size} className={combinedClasses} />;
  }

  const HeroIcon = heroIconMap[toHeroIconName(name)];

  if (!HeroIcon) {
    console.warn(`Icon not found: ${name} (type: ${type})`);
    return null;
  }

  return <HeroIcon className={combinedClasses} width={size} height={size} />;
};

export default Icon;
