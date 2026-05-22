import * as React from "react";
import { useState, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Pagination 分页器
 *
 * 参考 Ant Design Pagination 设计，使用本项目品牌色。
 *
 * 设计令牌：
 *   ┌─────────────────────────────┬────────────────────────────────────────┐
 *   │ Token                       │ Value                                  │
 *   ├─────────────────────────────┼────────────────────────────────────────┤
 *   │ brand / primary             │ #355EF1                                │
 *   │ brand / primary-hover       │ #1447E6                                │
 *   │ item / size (default)       │ 32px                                   │
 *   │ item / size (small)         │ 24px                                   │
 *   │ item / border-radius        │ 6px                                    │
 *   │ item / border               │ #d9d9d9                                │
 *   │ item / active-bg            │ transparent                            │
 *   │ item / active-border        │ #355EF1                                │
 *   │ item / active-color         │ #355EF1                                │
 *   │ item / hover-border         │ #355EF1                                │
 *   │ item / hover-color          │ #355EF1                                │
 *   │ item / disabled-color       │ #00000040                              │
 *   │ item / disabled-border      │ #d9d9d9                                │
 *   │ text / color                │ #000000e0                              │
 *   │ text / disabled             │ #00000040                              │
 *   └─────────────────────────────┴────────────────────────────────────────┘
 *
 * 用法：
 *
 * 1. 基础用法：
 *   <Pagination total={50} onChange={(page, pageSize) => {}} />
 *
 * 2. 显示总数 + 快速跳转 + 切换每页条数：
 *   <Pagination
 *     total={500}
 *     showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`}
 *     showSizeChanger
 *     showQuickJumper
 *   />
 *
 * 3. 简洁模式：
 *   <Pagination total={50} simple />
 *
 * 4. 迷你尺寸：
 *   <Pagination total={50} size="small" />
 */

/* ─── Types ─────────────────────────────────────────────────────────── */

export interface PaginationProps {
  /** 数据总数 */
  total: number;
  /** 当前页码（受控） */
  current?: number;
  /** 默认当前页码 */
  defaultCurrent?: number;
  /** 每页条数（受控） */
  pageSize?: number;
  /** 默认每页条数 */
  defaultPageSize?: number;
  /** 页码/每页条数改变的回调 */
  onChange?: (page: number, pageSize: number) => void;
  /** 每页条数改变的回调 */
  onPageSizeChange?: (current: number, size: number) => void;
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean;
  /** 每页条数选项 */
  pageSizeOptions?: readonly number[] | number[];
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean;
  /** 显示总数的函数 */
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  /** 简洁模式 */
  simple?: boolean;
  /** 尺寸 */
  size?: "default" | "small";
  /** 是否禁用 */
  disabled?: boolean;
  /** 只有一页时是否隐藏 */
  hideOnSinglePage?: boolean;
  /** 自定义样式 */
  className?: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

function generatePageList(
  current: number,
  totalPages: number
): (number | "prev-ellipsis" | "next-ellipsis")[] {
  const pages: (number | "prev-ellipsis" | "next-ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (current > 4) {
    pages.push("prev-ellipsis");
  }

  const start = Math.max(2, current - 2);
  const end = Math.min(totalPages - 1, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < totalPages - 3) {
    pages.push("next-ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

/* ─── Component ─────────────────────────────────────────────────────── */

function Pagination({
  total,
  current: controlledCurrent,
  defaultCurrent = 1,
  pageSize: controlledPageSize,
  defaultPageSize = 10,
  onChange,
  onPageSizeChange,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal,
  simple = false,
  size = "default",
  disabled = false,
  hideOnSinglePage = false,
  className,
}: PaginationProps) {
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [jumpValue, setJumpValue] = useState("");

  const currentPage = controlledCurrent ?? internalCurrent;
  const pageSize = controlledPageSize ?? internalPageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Hide if only one page
  if (hideOnSinglePage && totalPages <= 1) return null;

  const isSmall = size === "small";
  const itemSize = isSmall ? "h-6 min-w-[24px]" : "h-8 min-w-[32px]";
  const textSize = isSmall ? "text-xs" : "text-sm";

  const handleChange = (page: number) => {
    if (disabled) return;
    const safePage = Math.max(1, Math.min(page, totalPages));
    if (safePage === currentPage) return;
    if (controlledCurrent === undefined) {
      setInternalCurrent(safePage);
    }
    onChange?.(safePage, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    if (disabled) return;
    const newTotalPages = Math.max(1, Math.ceil(total / newSize));
    const newCurrent = Math.min(currentPage, newTotalPages);
    if (controlledPageSize === undefined) {
      setInternalPageSize(newSize);
    }
    if (controlledCurrent === undefined) {
      setInternalCurrent(newCurrent);
    }
    onPageSizeChange?.(newCurrent, newSize);
    onChange?.(newCurrent, newSize);
  };

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page)) {
      handleChange(page);
    }
    setJumpValue("");
  };

  // Range for showTotal
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  const pages = useMemo(
    () => generatePageList(currentPage, totalPages),
    [currentPage, totalPages]
  );

  /* ─── Simple mode ──────────────────────────────────────────── */
  if (simple) {
    return (
      <nav
        role="navigation"
        aria-label="pagination"
        className={cn("flex items-center gap-1", className)}
      >
        {/* Prev */}
        <button
          onClick={() => handleChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-[#000000a6] transition-colors",
            itemSize,
            "hover:bg-[#0000000a]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeftIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </button>

        {/* Current / Total input */}
        <div className={cn("flex items-center gap-1", textSize)}>
          <input
            value={jumpValue || currentPage}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={handleJump}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            disabled={disabled}
            className={cn(
              "w-12 text-center border border-[#d9d9d9] rounded-md outline-none transition-colors",
              "focus:border-[#1447E6] focus:shadow-[0_0_0_2px_rgba(53,94,241,0.1)]",
              itemSize,
              textSize,
              "disabled:bg-gray-50 disabled:cursor-not-allowed"
            )}
          />
          <span className="text-[#000000a6]">/</span>
          <span className="text-[#000000a6]">{totalPages}</span>
        </div>

        {/* Next */}
        <button
          onClick={() => handleChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-[#000000a6] transition-colors",
            itemSize,
            "hover:bg-[#0000000a]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRightIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </button>
      </nav>
    );
  }

  /* ─── Default mode ─────────────────────────────────────────── */
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center gap-2 flex-wrap", textSize, className)}
    >
      {/* Show Total */}
      {showTotal && (
        <span className="text-[#000000a6]">
          {showTotal(total, [rangeStart, rangeEnd])}
        </span>
      )}

      {/* Page items */}
      <ul className="flex items-center gap-1 list-none m-0 p-0">
        {/* Prev button */}
        <li>
          <button
            onClick={() => handleChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            aria-label="上一页"
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#000000a6] bg-white transition-colors",
              itemSize,
              !disabled && currentPage !== 1 && "hover:bg-[#f5f5f5]",
              "disabled:text-[#00000040] disabled:cursor-not-allowed"
            )}
          >
            <ChevronLeftIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((page, idx) => {
          if (page === "prev-ellipsis") {
            return (
              <li key="prev-ellipsis">
                <button
                  onClick={() => handleChange(Math.max(1, currentPage - 5))}
                  disabled={disabled}
                  aria-label="向前 5 页"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-[#00000040] transition-colors group",
                    itemSize,
                    !disabled && "hover:text-[#355EF1]"
                  )}
                >
                  <MoreHorizontalIcon className="w-4 h-4 group-hover:hidden" />
                  <ChevronsLeftIcon className="w-4 h-4 hidden group-hover:block" />
                </button>
              </li>
            );
          }

          if (page === "next-ellipsis") {
            return (
              <li key="next-ellipsis">
                <button
                  onClick={() => handleChange(Math.min(totalPages, currentPage + 5))}
                  disabled={disabled}
                  aria-label="向后 5 页"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-[#00000040] transition-colors group",
                    itemSize,
                    !disabled && "hover:text-[#355EF1]"
                  )}
                >
                  <MoreHorizontalIcon className="w-4 h-4 group-hover:hidden" />
                  <ChevronsRightIcon className="w-4 h-4 hidden group-hover:block" />
                </button>
              </li>
            );
          }

          const isActive = page === currentPage;
          return (
            <li key={page}>
              <button
                onClick={() => handleChange(page)}
                disabled={disabled}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg font-medium transition-colors border",
                  itemSize,
                  "px-1.5",
                  textSize,
                  isActive
                    ? "border-[#1447E6] text-[#355EF1] bg-white"
                    : "border-[#e5e5e5] text-[#000000e0] bg-white",
                  !disabled && !isActive && "hover:bg-[#f5f5f5]",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <button
            onClick={() => handleChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            aria-label="下一页"
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#000000a6] bg-white transition-colors",
              itemSize,
              !disabled && currentPage !== totalPages && "hover:bg-[#f5f5f5]",
              "disabled:text-[#00000040] disabled:cursor-not-allowed"
            )}
          >
            <ChevronRightIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>
        </li>
      </ul>

      {/* Size changer */}
      {showSizeChanger && (
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className={cn(
            "border border-[#E4E4E4] rounded-[4px] bg-white text-[#09090b] outline-none transition-colors pl-3 pr-7 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat",
            itemSize,
            textSize,
            "hover:border-[#355EF1]",
            "focus:border-[#355EF1]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#f3f3f4] disabled:border-[#E4E4E4]"
          )}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} 条/页
            </option>
          ))}
        </select>
      )}

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className={cn("flex items-center gap-2", textSize)}>
          <span className="text-[#09090b]">跳至</span>
          <input
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={handleJump}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            disabled={disabled}
            className={cn(
              "w-12 text-center border border-[#E4E4E4] rounded-[4px] outline-none transition-colors",
              "hover:border-[#355EF1]",
              "focus:border-[#355EF1]",
              itemSize,
              textSize,
              "disabled:bg-[#f3f3f4] disabled:cursor-not-allowed"
            )}
          />
          <span className="text-[#000000e0]">页</span>
        </div>
      )}
    </nav>
  );
}

export { Pagination };
