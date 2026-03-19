import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

jest.mock('../../../contexts/UIContext', () => ({
  useUI: () => ({
    uiState: { theme: 'light' },
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>测试按钮</Button>);
    const button = screen.getByRole('button', { name: /测试按钮/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('测试按钮');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">主要按钮</Button>);
    let button = screen.getByRole('button', { name: /主要按钮/i });
    expect(button).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">次要按钮</Button>);
    button = screen.getByRole('button', { name: /次要按钮/i });
    expect(button).toHaveClass('bg-secondary');

    rerender(<Button variant="danger">危险按钮</Button>);
    button = screen.getByRole('button', { name: /危险按钮/i });
    expect(button).toHaveClass('bg-red-600');

    rerender(<Button variant="ghost">幽灵按钮</Button>);
    button = screen.getByRole('button', { name: /幽灵按钮/i });
    expect(button).toHaveClass('text-gray-700');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    const button = screen.getByRole('button', { name: /点击我/i });
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>禁用按钮</Button>);
    const button = screen.getByRole('button', { name: /禁用按钮/i });
    
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>加载中</Button>);
    const button = screen.getByRole('button', { name: /加载中/i });
    
    expect(button).toBeDisabled();
  });

  it('renders with full width', () => {
    render(<Button fullWidth>全宽按钮</Button>);
    const button = screen.getByRole('button', { name: /全宽按钮/i });
    
    expect(button).toHaveClass('w-full');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">小按钮</Button>);
    let button = screen.getByRole('button', { name: /小按钮/i });
    expect(button).toHaveClass('h-9');

    rerender(<Button size="md">中按钮</Button>);
    button = screen.getByRole('button', { name: /中按钮/i });
    expect(button).toHaveClass('h-10');

    rerender(<Button size="lg">大按钮</Button>);
    button = screen.getByRole('button', { name: /大按钮/i });
    expect(button).toHaveClass('h-12');
  });

  it('handles form submission', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">提交</Button>
      </form>
    );
    const button = screen.getByRole('button', { name: /提交/i });
    
    fireEvent.click(button);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
