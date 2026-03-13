import React from 'react';
import Button from '../atoms/Button';
import { useUI } from '../../contexts/UIContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const { uiState } = useUI();
  const isDarkTheme = uiState.theme === 'dark';
  const isMobile = uiState.isMobile;

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-start items-center space-x-2">
      <Button
        size="xxs"
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={isMobile ? 'w-6 h-6 p-0' : ''}
      >
        {isMobile ? '＜' : '上一页'}
      </Button>
      <span className={`text-xs ${isDarkTheme ? 'text-text-dark-secondary' : 'text-gray-600'}`}>
        {currentPage} / {totalPages}
      </span>
      <Button
        size="xxs"
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={isMobile ? 'w-6 h-6 p-0' : ''}
      >
        {isMobile ? '＞' : '下一页'}
      </Button>
    </div>
  );
};

export default Pagination;
