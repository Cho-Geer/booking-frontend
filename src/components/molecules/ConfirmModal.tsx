import React from 'react';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import { useUI } from '../../contexts/UIContext';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * 分子组件：确认弹窗
 * 用于显示确认对话框，包含确认和取消按钮
 * 
 * @component
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      showCloseButton={false}
      footer={(
        <div className="flex gap-3 justify-end">
          <Button
            variant="warning"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : confirmText}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        </div>
      )}
    >
      <p className={`${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmModal;
