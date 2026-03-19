/**
 * DateInput - 通用日期选择组件
 * 特性：整个组件都可点击以弹出日期选择器
 * 用途：全局通用的日期选择组件，替代原生 input[type="date"]
 */

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value,
      onChange,
      placeholder = '选择日期',
      min,
      max,
      title,
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

    return (
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 
          bg-white text-gray-700 cursor-pointer transition-all
          hover:border-blue-300 hover:bg-blue-50/30
          focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-300
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          ${className}
        `}
        title={title}
      >
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className="
            flex-1 bg-transparent border-0 outline-none text-sm text-gray-700
            placeholder-gray-400 cursor-pointer
            focus:ring-0
            [color-scheme:light]
          "
          style={{ colorScheme: 'light' }}
        />

        {/* 显示选中的日期文本 */}
        {!value && (
          <span className="text-sm text-gray-400 pointer-events-none">
            {placeholder}
          </span>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
