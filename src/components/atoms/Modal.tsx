import React from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { useTheme } from '@/hooks/useTheme';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  cardClassName?: string;
  headerActions?: React.ReactNode;
  closeButtonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  closeButtonText?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  cardClassName = '',
  headerActions,
  closeButtonVariant = 'ghost',
  closeButtonText = '关闭',
  showCloseButton = true,
}) => {
  const { isDark: isDarkTheme } = useTheme();

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass =
    size === 'sm'
      ? 'max-w-md'
      : size === 'lg'
        ? 'max-w-3xl'
        : size === 'xl'
          ? 'max-w-4xl'
          : size === '2xl'
            ? 'max-w-6xl'
            : 'max-w-xl';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 py-2">
      <Card className={`w-full ${sizeClass} flex flex-col overflow-hidden rounded-lg p-6 max-h-[90vh] ${isDarkTheme ? 'bg-background-dark-100 border border-border-dark' : 'bg-white shadow-xl'} ${cardClassName}`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-text-dark-primary' : 'text-gray-900'}`}>
            {title}
          </h3>
          {(headerActions || showCloseButton) && (
            <div className="flex items-center gap-2">
              {headerActions}
              {showCloseButton && (
                <Button variant={closeButtonVariant} size="sm" onClick={onClose}>
                  {closeButtonText}
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex-1 min-h-0 h-full">
          {children}
        </div>
        {footer && (
          <div className="mt-6 flex shrink-0 justify-end gap-3">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Modal;
