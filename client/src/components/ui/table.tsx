import * as React from "react";

import { cn } from "@/lib/utils";

type TableProps = React.ComponentProps<"table"> & {
  containerClassName?: string;
  containerRef?: React.Ref<HTMLDivElement>;
  containerStyle?: React.CSSProperties;
};

function Table({
  className,
  containerClassName,
  containerRef,
  containerStyle,
  ...props
}: TableProps) {
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
      style={containerStyle}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-[14px] text-[#09090b]", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-[#fafafa] [&_tr]:border-b [&_tr]:border-[#f0f0f0]", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-[#fafafa] border-t border-[#f0f0f0] font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-[#fafafa] data-[state=selected]:bg-[rgba(53,94,241,0.06)] data-[state=selected]:hover:bg-[rgba(53,94,241,0.1)] border-b border-[#f0f0f0] transition-colors",
        className
      )}
      {...props}
    />
  );
}

/**
 * TableHead - 表头单元格（强制样式，与 audit-log 页面视觉一致）
 *
 * 强制规范：
 * - 背景色：继承 TableHeader 的 bg-[#fafafa]（灰色）
 * - 文字色：#09090b（黑色）
 * - 字号：14px
 * - 字重：font-semibold（600）
 * - 行高：h-[54px]
 * - 内边距：px-4
 * - 对齐：text-left align-middle
 * - 不换行：whitespace-nowrap
 *
 * 禁止通过 className 覆盖以上字体/颜色/字重属性。
 * className 仅用于控制宽度（w-[xx%]）、对齐（text-right/text-center）等布局属性。
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-[#09090b] h-[54px] px-4 text-left align-middle font-semibold text-[14px] whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 align-middle whitespace-nowrap text-[14px] text-[#09090b] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * TableActionCell - 表格操作列专用单元格
 * 内部按钮强制使用 link-dark 样式（黑色文字按钮）
 * 用法：<TableActionCell>操作按钮...</TableActionCell>
 */
function TableActionCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-action-cell"
      className={cn(
        "px-4 py-3 align-middle whitespace-nowrap text-[14px] [&:has([role=checkbox])]:pr-0",
        "[&_[data-slot=button]]:text-[#020617] [&_[data-slot=button]]:font-normal [&_[data-slot=button]]:underline-offset-4 [&_[data-slot=button]]:bg-transparent [&_[data-slot=button]]:border-0 [&_[data-slot=button]]:shadow-none [&_[data-slot=button]]:p-0 [&_[data-slot=button]]:h-auto",
        "[&_[data-slot=button]:hover]:text-[#525252] [&_[data-slot=button]:hover]:bg-transparent",
        "[&_[data-slot=button]:active]:text-[#020617] [&_[data-slot=button]:active]:underline",
        "[&_[data-slot=button]:disabled]:text-[rgba(2,6,23,0.3)] [&_[data-slot=button]:disabled]:no-underline",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-[#09090b] mt-4 text-[14px]", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableActionCell,
  TableCaption,
};
