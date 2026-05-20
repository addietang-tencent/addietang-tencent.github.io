import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatusTag 状态标签组件
 *
 * 对齐 Figma 设计稿「徽标」组件 (node 65:1295)
 *
 * 设计令牌：
 *   ┌──────────┬────────────┬────────────┬────────────┐
 *   │ variant  │ background │ dot color  │ text color │
 *   ├──────────┼────────────┼────────────┼────────────┤
 *   │ green    │ #E9F8EB    │ #008236    │ #008236    │
 *   │ gray     │ #F5F5F5    │ #0A0A0A    │ #0A0A0A    │
 *   │ blue     │ #E8ECFE    │ #1447E6    │ #1447E6    │
 *   └──────────┴────────────┴────────────┴────────────┘
 *
 * 规格：高度 20px, 圆角 full, px-2 py-[2px], 12px 文字, 圆点 6px
 *
 * 使用示例：
 *   <StatusTag variant="green" dot>已完成</StatusTag>
 *   <StatusTag variant="gray">待完成</StatusTag>
 *   <StatusTag variant="blue" dot>进行中</StatusTag>
 *   <StatusTag variant="blue">管理员</StatusTag>
 */

const variantStyles = {
  green: {
    bg: "bg-[#E9F8EB]",
    text: "text-[#008236]",
    dot: "bg-[#008236]",
  },
  gray: {
    bg: "bg-[#F5F5F5]",
    text: "text-[#0A0A0A]",
    dot: "bg-[#0A0A0A]",
  },
  blue: {
    bg: "bg-[#E8ECFE]",
    text: "text-[#1447E6]",
    dot: "bg-[#1447E6]",
  },
} as const;

interface StatusTagProps extends React.ComponentProps<"span"> {
  variant?: keyof typeof variantStyles;
  dot?: boolean;
}

function StatusTag({
  variant = "gray",
  dot = false,
  className,
  children,
  ...props
}: StatusTagProps) {
  const styles = variantStyles[variant];

  return (
    <span
      data-slot="status-tag"
      className={cn(
        "inline-flex items-center justify-center gap-1 h-5 px-2 py-[2px] rounded-full text-xs leading-3 tracking-[0.18px] whitespace-nowrap",
        styles.bg,
        styles.text,
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
      )}
      {children}
    </span>
  );
}

export { StatusTag, variantStyles as statusTagVariants };
