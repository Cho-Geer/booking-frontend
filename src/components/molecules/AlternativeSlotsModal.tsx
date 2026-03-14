import React from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import { useTheme } from '@/hooks/useTheme';
import { TimeSlot } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface AlternativeSlotsModalProps {
  open: boolean;
  conflictSlot: TimeSlot | null;
  alternativeSlots: TimeSlot[];
  onClose: () => void;
  onAlternativeSelect: (slot: TimeSlot) => void;
}

/**
 * 分子组件：替代时间段选择模态框
 * 当选择的时间段已被占用时，显示推荐的替代时间段
 * 
 * @component
 */
const AlternativeSlotsModal: React.FC<AlternativeSlotsModalProps> = ({
  open,
  conflictSlot,
  alternativeSlots,
  onClose,
  onAlternativeSelect
}) => {
  const { isDark: isDarkTheme } = useTheme();

  return (
    <Modal
      open={open}
      title={conflictSlot ? `该时间段 (${formatTime(conflictSlot.startTime)}) 已被预约` : ''}
      onClose={onClose}
      footer={(
        <Button
          variant="ghost"
          onClick={onClose}
        >
          关闭
        </Button>
      )}
    >
      <p className={`mb-6 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
        为您推荐以下临近的可用时间段：
      </p>
      
      <div className="space-y-3">
        {alternativeSlots.length > 0 ? (
          alternativeSlots.map((slot, index) => (
            <Button
              key={index}
              onClick={() => onAlternativeSelect(slot)}
              variant="secondary"
              fullWidth
            >
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </Button>
          ))
        ) : (
          <p className={`text-center py-4 ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-500'}`}>
            暂无其他可用时间段，请尝试选择其他日期。
          </p>
        )}
      </div>
    </Modal>
  );
};

export default AlternativeSlotsModal;
