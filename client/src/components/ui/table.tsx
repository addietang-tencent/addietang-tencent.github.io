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
        className={cn("w-full caption-bottom font-sans text-sm leading-[1.5] text-gray-900", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-gray-50 [&_tr]:border-b [&_tr]:border-gray-200", className)}
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
        "bg-gray-50 border-t border-gray-200 font-sans text-sm font-medium leading-[1.5] text-gray-900 [&>tr]:last:border-b-0",
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
        "border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-[rgba(20,71,230,0.06)] data-[state=selected]:hover:bg-[rgba(20,71,230,0.1)]",
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
 * - 背景色：继承 TableHeader 的 bg-gray-50（#FAFAFA）
 * - 文字：对齐 Typography MetaMedium（12px / Medium / #737373）
 * - 行高：h-12
 * - 内边距：px-4
 * - 默认对齐：text-left align-middle，可按列通过 className 覆盖 text-right
 * - 不换行：whitespace-nowrap
 *
 * className 主要用于控制宽度（w-[xx%]）、sticky 定位和必要的列对齐。
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-sans text-xs font-medium leading-[1.5] text-gray-500 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
        "px-4 py-3 text-left align-middle whitespace-nowrap font-sans text-sm font-normal leading-[1.5] text-gray-900 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
        "px-4 py-3 align-middle whitespace-nowrap font-sans text-sm font-normal leading-[1.5] text-gray-900 [&:has([role=checkbox])]:pr-0",
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
      className={cn("mt-4 font-sans text-xs font-normal leading-[1.5] text-gray-500", className)}
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
