/**
 * RadioCard - 单选卡片组件
 *
 * 规范：
 *   - 默认：1px 边框 #EAEEF4 白底
 *   - hover：边框 #1447E6/40
 *   - 选中：边框 #1447E6，背景 #1447E6/5
 *   - 圆角：4px
 *
 * 用法（配合 RadioGroup 使用）：
 *   <RadioGroup value={v} onValueChange={setV}>
 *     <RadioCard id="opt-a" value="a" checked={v === "a"} title="选项 A" description="描述" />
 *   </RadioGroup>
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { RadioGroupItem } from "./radio-group";

interface RadioCardProps {
  id: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 选中态时额外叠加的卡片 className，用于定制特殊颜色（如 native 橙色） */
  checkedClassName?: string;
  /** RadioGroupItem 选中态覆盖 className（如 native 橙色 radio 点） */
  radioCheckedClassName?: string;
  /** 卡片底部附加内容（如 checkbox 确认项） */
  children?: React.ReactNode;
}

function RadioCard({
  id,
  value,
  checked = false,
  disabled,
  title,
  description,
  checkedClassName,
  radioCheckedClassName,
  children,
}: RadioCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-2.5 rounded-[4px] border px-3 py-3 transition-colors",
        "border-gray-200 bg-white",
        !checked && !disabled && "hover:border-[#1447E6]/40 cursor-pointer",
        checked && (checkedClassName ?? "border-[#1447E6] bg-[#1447E6]/5"),
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className={cn(
          "mt-0.5 shrink-0",
          checked && radioCheckedClassName,
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#0A0A0A] mb-0.5 leading-snug">
          {title}
        </div>
        {description && (
          <p className="text-xs text-[#737373] leading-relaxed">{description}</p>
        )}
        {children}
      </div>
    </label>
  );
}

export { RadioCard };
