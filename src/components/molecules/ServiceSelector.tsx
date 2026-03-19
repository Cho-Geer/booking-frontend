import React from 'react';
import Card from '@/components/atoms/Card';
import Dropdown from '@/components/atoms/Dropdown';
import { useTheme } from '@/hooks/useTheme';
import { Service } from '@/types';

interface ServiceSelectorProps {
  services: Service[];
  serviceId: string;
  onServiceIdChange: (serviceId: string) => void;
  serviceError?: string;
}

/**
 * 分子组件：服务类型选择
 * 服务类型下拉选择
 * 
 * @component
 */
const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  serviceId,
  onServiceIdChange,
  serviceError
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  return (
    <Card className={`rounded-lg p-6 ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow'}`}>
      <h2 className={`text-lg font-medium ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'} mb-4 ${isMobile ? 'text-base' : ''}`}>
        服务类型（必填）
      </h2>
      <Dropdown
        items={[
          { label: "选择服务类型", value: "", disabled: true },
          ...services.filter(s => s.isActive).map(s => ({ label: s.name, value: s.id }))
        ]}
        value={serviceId}
        onChange={(value) => onServiceIdChange(value)}
        buttonText="选择服务类型"
        className="w-full"
      />
      {serviceError && (
        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-error-light' : 'text-red-600'}`}>
          {serviceError}
        </p>
      )}
    </Card>
  );
};

export default ServiceSelector;
