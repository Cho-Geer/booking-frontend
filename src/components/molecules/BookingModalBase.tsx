import React from 'react';
import Modal from '@/components/atoms/Modal';
import { useTheme } from '@/hooks/useTheme';

interface BookingModalBaseProps {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  cardClassName?: string;
  closeButtonVariant?: 'primary' | 'secondary' | 'warning';
  closeButtonText?: string;
  headerActions?: React.ReactNode;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

/**
 * 分子组件：预约相关Modal基础组件
 * 提供统一的Modal布局，供创建、更新、详情等具体Modal使用
 * 
 * @component
 */
const BookingModalBase: React.FC<BookingModalBaseProps> = ({
  open,
  title,
  onClose,
  children,
  size,
  cardClassName,
  closeButtonVariant = 'secondary',
  closeButtonText = '取消',
  headerActions,
  showCloseButton = true,
  footer
}) => {
  const { isDark: isDarkTheme, isMobile } = useTheme();

  const defaultSize = isMobile ? 'md' : 'lg';
  const defaultCardClassName = `${isMobile ? 'min-h-[70vh]' : 'min-h-[78vh]'} flex flex-col`;

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size={size || defaultSize}
      cardClassName={cardClassName || defaultCardClassName}
      closeButtonVariant={closeButtonVariant}
      closeButtonText={closeButtonText}
      showCloseButton={showCloseButton}
      headerActions={headerActions}
      footer={footer}
    >
      {children}
    </Modal>
  );
};

export default BookingModalBase;
