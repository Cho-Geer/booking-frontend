import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/hooks/useTheme';

interface DropdownItem {
  /** 选项文本 */
  label: string;
  /** 选项值 */
  value: string;
  /** 是否禁用 */
  disabled?: boolean;
}

interface DropdownProps {
  /** 下拉菜单选项 */
  items: DropdownItem[];
  /** 选中值 */
  value?: string;
  /** 值变更回调 */
  onChange?: (value: string) => void;
  /** 按钮文本 */
  buttonText?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 原子组件：下拉菜单
 * 使用Headless UI实现的下拉菜单组件
 * 
 * @component
 * @example
 * <Dropdown 
 *   items={[{label: "选项1", value: "1"}, {label: "选项2", value: "2"}]}
 *   onChange={(value) => console.log(value)}
 * />
 */
const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChange,
  buttonText = "选择选项",
  className = ''
}) => {
  const { theme } = useTheme();
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const [menuRect, setMenuRect] = React.useState<{ top: number; left: number; width: number } | null>(null);
  // 查找选中项的标签
  const selectedLabel = items.find(item => item.value === value)?.label || buttonText;

  const updateMenuRect = React.useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleWindowChange = () => updateMenuRect();
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);
    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [updateMenuRect]);

  return (
    <Menu as="div" id="dropdown-container" className={`relative block text-left w-full ${className}`}>
      {({ open }) => {
        const portalTarget = typeof window !== 'undefined' ? document.body : null;

        return (
          <>
            <div>
              <Menu.Button
                ref={buttonRef}
                onClick={() => requestAnimationFrame(updateMenuRect)}
                className={`inline-flex items-center justify-between w-full rounded-md border shadow-sm px-3 py-2 text-left focus:outline-none focus:ring-primary focus:border-primary ${
                  theme === 'dark'
                    ? 'border-border-dark bg-background-dark text-text-dark-primary'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {selectedLabel}
                <svg className="ml-2 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Menu.Button>
            </div>

            {portalTarget && menuRect && createPortal(
              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  style={{
                    position: 'fixed',
                    top: menuRect.top,
                    left: menuRect.left,
                    width: menuRect.width,
                    zIndex: 2147483647,
                  }}
                  className={`origin-top rounded-md shadow-lg ring-1 ring-black focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-background-dark ring-opacity-10'
                      : 'bg-white ring-opacity-5'
                  }`}
                >
                  <div className="py-1">
                    {items.map((item) => (
                      <Menu.Item key={item.value} disabled={item.disabled}>
                        {({ active }) => (
                          <button
                            onClick={() => onChange && onChange(item.value)}
                            className={`${
                              active
                                ? (theme === 'dark' ? 'bg-background-dark-200 text-text-dark-primary' : 'bg-gray-100 text-gray-900')
                                : (theme === 'dark' ? 'text-text-dark-primary' : 'text-gray-700')
                            } ${
                              item.disabled
                                ? (theme === 'dark' ? 'opacity-50 text-text-dark-disabled cursor-not-allowed' : 'opacity-50 cursor-not-allowed')
                                : ''
                            } block px-4 py-2 text-sm w-full text-left`}
                            disabled={item.disabled}
                          >
                            {item.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>,
              portalTarget
            )}
          </>
        );
      }}
    </Menu>
  );
};

export default Dropdown;
