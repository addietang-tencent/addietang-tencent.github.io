/**
 * DatePickerInput - 日期选择输入组件
 * 特性：整个输入框范围都可点击打开日期选择器
 * 用途：替代原生 input[type="date"]，提供更好的交互体验
 */

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
  (
    {
      value,
      onChange,
      placeholder = 'yyyy/mm/日',
      min,
      max,
      className = '',
      disabled = false,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 合并 ref
    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleContainerClick = () => {
      if (!disabled && inputRef.current) {
        inputRef.current.click();
      }
    };

    // 格式化日期显示 (yyyy-mm-dd -> yyyy/mm/dd)
    const displayValue = value ? value.replace(/-/g, '/') : '';

    return (
      <div
        ref={containerRef}
        className={`
          relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 
          bg-white text-gray-700 cursor-pointer transition-all
          hover:border-blue-300 hover:bg-blue-50/30
          focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-300
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          ${className}
        `}
        onClick={handleContainerClick}
      >
        {/* 隐藏的原生日期输入 - 使用 absolute 定位覆盖整个容器 */}
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className="
            absolute inset-0 w-full h-full opacity-0 cursor-pointer
            [color-scheme:light]
          "
          style={{ colorScheme: 'light' }}
        />

        {/* 可见的内容 */}
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
        
        <span className={`text-sm pointer-events-none ${displayValue ? 'text-gray-700' : 'text-gray-400'}`}>
          {displayValue || placeholder}
        </span>
      </div>
    );
  }
);

DatePickerInput.displayName = 'DatePickerInput';
