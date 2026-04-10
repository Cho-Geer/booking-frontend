import React from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import { useTheme } from '@/hooks/useTheme';

interface SuccessModalProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  onClose: () => void;
}

/**
 * 分子组件：成功提示Modal
 * 统一的成功提示展示
 * 
 * @component
 */
const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  title,
  message,
  onClose
}) => {
  const { isDark: isDarkTheme } = useTheme();

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      showCloseButton={false}
      size="sm"
      footer={(
        <Button
          size="sm"
          variant="secondary"
          onClick={onClose}
        >
          关闭
        </Button>
      )}
    >
      {typeof message === 'string' ? (
        <p className={`${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`} dangerouslySetInnerHTML={{ __html: message }} />
      ) : (
        message
      )}
    </Modal>
  );
};

export default SuccessModal;
