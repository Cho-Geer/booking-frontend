import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useUI } from '@/contexts/UIContext';

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
  const { uiState } = useUI();
  // 查找选中项的标签
  const selectedLabel = items.find(item => item.value === value)?.label || buttonText;

  return (
    <Menu as="div" id="dropdown-container" className={`relative inline-block text-left ${className}`}>
      <div>
        <Menu.Button className={`inline-flex justify-center w-full rounded-md border shadow-sm px-4 py-2 text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
          uiState.theme === 'dark'
            ? 'border-border-dark bg-background-dark text-text-dark-primary focus:ring-offset-background-dark'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-offset-gray-100'
        }`}>
          {selectedLabel}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black focus:outline-none ${
          uiState.theme === 'dark'
            ? 'bg-background-dark ring-opacity-10'
            : 'bg-white ring-opacity-5'
        }`}>
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item key={item.value} disabled={item.disabled}>
                {({ active }) => (
                  <button
                    onClick={() => onChange && onChange(item.value)}
                    className={`${
                      active 
                        ? (uiState.theme === 'dark' ? 'bg-background-dark-200 text-text-dark-primary' : 'bg-gray-100 text-gray-900')
                        : (uiState.theme === 'dark' ? 'text-text-dark-primary' : 'text-gray-700')
                    } ${
                      item.disabled 
                        ? (uiState.theme === 'dark' ? 'opacity-50 text-text-dark-disabled cursor-not-allowed' : 'opacity-50 cursor-not-allowed')
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
      </Transition>
    </Menu>
  );
};

export default Dropdown;