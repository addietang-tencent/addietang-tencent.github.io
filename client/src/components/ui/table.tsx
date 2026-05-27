import * as React from "react";

import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
 * Table 组件
 *
 * 能力：
 *   1) 密度 density（default | compact）
 *      Table 组件只负责表格结构与密度；分页器不属于 Table 内部能力。
 *      约定上，页面级标准表格通常搭配 Pagination 默认尺寸 `size="default"`；
 *      `size="small"` 更适合 Dialog / Drawer 等空间受限浮层中的表格分页。
 *
 *   2) 固定列 / Fixed Columns（参考 Ant Design）
 *      https://ant.design/components/table-cn#table-demo-fixed-header
 *      严格使用项目自身的颜色 / 字号 / 交互规范（见 SKILL-GLOBAL-COMPONENTS.md §15）。
 *
 *      API：
 *        - <Table scrollX={1500}> 或 <Table scrollX="max-content">
 *          → 给容器加最小内宽，超出宽度自动出现横向滚动条；不需要固定列时也可使用。
 *        - <TableHead fixed="left"> / <TableHead fixed="right">
 *        - <TableCell fixed="left"> / <TableCell fixed="right">
 *          → sticky 定位 + 阴影分隔线；
 *          → 当 row 处于 hover / selected 时，固定单元格底色自动跟随，避免出现"hover 错位"问题。
 *
 *      注：
 *        - 固定列内部默认仍使用项目规范色（白底单元格 / bg-gray-50 表头），
 *          hover/selected 通过 CSS 群组选择器 (group-hover / group-data-[state=selected]) 实现底色同步。
 *        - 阴影分隔线根据横向滚动状态显示：最左隐藏 left shadow，最右隐藏 right shadow，无横滚全部隐藏。
 * ──────────────────────────────────────────────────────────────────── */

type TableDensity = "default" | "compact";

type FixedSide = "left" | "right";

type TableScrollState = {
  scrollableX: boolean;
  scrollLeft: boolean;
  scrollRight: boolean;
  scrollLeftValue: number;
};

type FixedShadowMetrics = {
  leftX: number | null;
  rightX: number | null;
};

const TableDensityContext = React.createContext<TableDensity>("default");

function useTableDensity() {
  return React.useContext(TableDensityContext);
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

type TableProps = React.ComponentProps<"table"> & {
  containerClassName?: string;
  containerRef?: React.Ref<HTMLDivElement>;
  containerStyle?: React.CSSProperties;
  density?: TableDensity;
  /**
   * 与 Ant Design Table 的 scroll.x 一致：
   *   - 数字：表格最小宽度（px）；超出容器宽度即出现横向滚动条
   *   - 字符串：直接作为 min-width，例如 "max-content" / "1200px"
   *   - 不传：表格按原生宽度渲染（默认）
   */
  scrollX?: number | string;
};

function Table({
  className,
  containerClassName,
  containerRef,
  containerStyle,
  density = "default",
  scrollX,
  ...props
}: TableProps) {
  const tableMinWidth =
    typeof scrollX === "number" ? `${scrollX}px` : scrollX ?? undefined;
  const outerContainerRef = React.useRef<HTMLDivElement | null>(null);
  const containerNodeRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = React.useState<TableScrollState>({
    scrollableX: false,
    scrollLeft: false,
    scrollRight: false,
    scrollLeftValue: 0,
  });
  const [fixedShadowMetrics, setFixedShadowMetrics] = React.useState<FixedShadowMetrics>({
    leftX: null,
    rightX: null,
  });

  const setContainerNode = React.useCallback((node: HTMLDivElement | null) => {
    containerNodeRef.current = node;
    assignRef(containerRef, node);
  }, [containerRef]);

  React.useEffect(() => {
    const el = containerNodeRef.current;
    if (!el) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      const next: TableScrollState = {
        scrollableX: maxScrollLeft > 1,
        scrollLeft: el.scrollLeft > 1,
        scrollRight: el.scrollLeft < maxScrollLeft - 1,
        scrollLeftValue: el.scrollLeft,
      };

      const containerRect = el.getBoundingClientRect();
      const outerRect = outerContainerRef.current?.getBoundingClientRect() ?? containerRect;
      const fixedLeftCells = Array.from(
        el.querySelectorAll<HTMLElement>("[data-fixed='left']")
      );
      const fixedRightCells = Array.from(
        el.querySelectorAll<HTMLElement>("[data-fixed='right']")
      );
      const leftBoundary = fixedLeftCells.reduce<number | null>((max, cell) => {
        const rect = cell.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return max;
        const x = rect.right - outerRect.left;
        return max === null ? x : Math.max(max, x);
      }, null);
      const rightBoundary = fixedRightCells.reduce<number | null>((min, cell) => {
        const rect = cell.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return min;
        const x = rect.left - outerRect.left;
        return min === null ? x : Math.min(min, x);
      }, null);

      setScrollState((prev) => (
        prev.scrollableX === next.scrollableX &&
        prev.scrollLeft === next.scrollLeft &&
        prev.scrollRight === next.scrollRight &&
        Math.abs(prev.scrollLeftValue - next.scrollLeftValue) < 0.5
          ? prev
          : next
      ));
      setFixedShadowMetrics((prev) => {
        const sameLeft = prev.leftX === leftBoundary || (prev.leftX !== null && leftBoundary !== null && Math.abs(prev.leftX - leftBoundary) < 0.5);
        const sameRight = prev.rightX === rightBoundary || (prev.rightX !== null && rightBoundary !== null && Math.abs(prev.rightX - rightBoundary) < 0.5);
        return sameLeft && sameRight ? prev : { leftX: leftBoundary, rightX: rightBoundary };
      });
    };

    const requestMeasure = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    requestMeasure();
    el.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);

    const ro = new ResizeObserver(requestMeasure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      ro.disconnect();
    };
  }, [tableMinWidth]);

  return (
    <TableDensityContext.Provider value={density}>
      <div ref={outerContainerRef} className="relative isolate w-full">
        <div
          ref={setContainerNode}
          data-density={density}
          data-slot="table-container"
          data-scrollable-x={scrollState.scrollableX ? "true" : "false"}
          data-scroll-left={scrollState.scrollLeft ? "true" : "false"}
          data-scroll-right={scrollState.scrollRight ? "true" : "false"}
          className={cn(
            "relative w-full overflow-x-auto",
            // 横向滚动模式下：滚动条默认隐藏，hover 表格区域或正在滚动时才出现（复用全局 .scrollbar-on-hover 工具类）
            tableMinWidth && "scrollbar-on-hover",
            containerClassName
          )}
          style={containerStyle}
        >
          <table
            data-density={density}
            data-slot="table"
            className={cn(
              "w-full caption-bottom font-sans leading-[1.5] text-gray-900",
              density === "compact" ? "text-xs" : "text-sm",
              // 固定列要求 table 不能使用 collapse，否则 sticky 单元格的边框/背景会出现间隙
              tableMinWidth ? "border-separate border-spacing-0" : "",
              className
            )}
            style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
            {...props}
          />
        </div>
        {tableMinWidth && scrollState.scrollLeft && fixedShadowMetrics.leftX !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 z-30 w-[6px] bg-[linear-gradient(to_right,rgba(0,0,0,0.08),transparent)]"
            style={{ left: fixedShadowMetrics.leftX }}
          />
        )}
        {tableMinWidth && scrollState.scrollRight && fixedShadowMetrics.rightX !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 z-30 w-[6px] bg-[linear-gradient(to_left,rgba(0,0,0,0.08),transparent)]"
            style={{ left: fixedShadowMetrics.rightX - 6 }}
          />
        )}
      </div>
    </TableDensityContext.Provider>
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
  const density = useTableDensity();

  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-gray-50 border-t border-gray-200 font-sans font-medium leading-[1.5] text-gray-900 [&>tr]:last:border-b-0",
        density === "compact" ? "text-xs" : "text-sm",
        className
      )}
      {...props}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────
 * TableRow
 * 加 `group` class 是为了让固定单元格通过 group-hover / group-data-[state=selected]
 * 同步行的 hover / selected 背景色，避免固定列出现"白条不变色"问题。
 * ──────────────────────────────────────────────────────────────────── */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-[rgba(20,71,230,0.06)] data-[state=selected]:hover:bg-[rgba(20,71,230,0.1)]",
        className
      )}
      {...props}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────
 * 固定列样式 token
 *   - left:  z-index 较高、靠左 sticky；右侧加竖向分隔线 + 容器级连续投影
 *   - right: 同上对称；左侧加分隔线 + 容器级连续投影
 *
 *  分隔与投影使用与 SKILL §15 一致的 token：
 *    after       → 1px 内嵌分割线 #f0f0f0（仅在对应方向需要 sticky 分隔时显示）
 *    容器 overlay → 6px 边缘投影（不挂在单元格上，避免按行截断）
 *
 *  注：分隔线与投影根据横向滚动状态显示（left 仅在已向右滚动时出现；right 仅在右侧仍有内容时出现）。
 *      表头（FIXED_*_CLS）与 body 单元格（FIXED_*_CELL_CLS）的 after
 *      写法必须**完全一致**，否则会出现表头/body 边界视觉割裂。
 *
 *  多列固定（如复选框列 + 名称列同时 fixed="left"）：
 *      只在最右侧那个左固定列（或最左侧那个右固定列）保留阴影。
 *      通过 `fixedShadow={false}` 关闭中间列的阴影。
 * ──────────────────────────────────────────────────────────────────── */
const FIXED_BASE = "sticky";
// 表头固定列：z-50 必须高于业务表头里常见的 `relative z-40`（如带筛选 Popover 的列）以及任何 body cell
const FIXED_LEFT_CLS = "left-0 z-50 bg-gray-50";
const FIXED_RIGHT_CLS = "right-0 z-50 bg-gray-50";
// 边界列的 1px 分隔线（仅 fixedShadow !== false 时附加）；投影由 Table 容器级 overlay 连续绘制
const FIXED_LEFT_SHADOW_CLS =
  "after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:w-px after:bg-[#f0f0f0] after:pointer-events-none after:opacity-0 after:transition-opacity [[data-scroll-left=true]_&]:after:opacity-100";
const FIXED_RIGHT_SHADOW_CLS =
  "after:content-[''] after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px after:bg-[#f0f0f0] after:pointer-events-none after:opacity-0 after:transition-opacity [[data-scroll-right=true]_&]:after:opacity-100";

// body 单元格的固定列样式：白底 + 跟随行 hover/selected
// z-20 高于普通 body cell（z auto），避免横向滚动时被相邻列内容穿透
const FIXED_LEFT_CELL_CLS =
  "left-0 z-20 bg-white transition-colors " +
  "group-hover:bg-gray-50 group-data-[state=selected]:bg-[rgba(20,71,230,0.06)] group-data-[state=selected]:group-hover:bg-[rgba(20,71,230,0.1)]";
const FIXED_RIGHT_CELL_CLS =
  "right-0 z-20 bg-white transition-colors " +
  "group-hover:bg-gray-50 group-data-[state=selected]:bg-[rgba(20,71,230,0.06)] group-data-[state=selected]:group-hover:bg-[rgba(20,71,230,0.1)]";
// body 边界列的 1px 分隔线；投影由 Table 容器级 overlay 连续绘制
const FIXED_LEFT_CELL_SHADOW_CLS =
  "after:content-[''] after:absolute after:top-0 after:bottom-[-1px] after:right-0 after:w-px after:bg-[#f0f0f0] after:pointer-events-none after:opacity-0 after:transition-opacity [[data-scroll-left=true]_&]:after:opacity-100";
const FIXED_RIGHT_CELL_SHADOW_CLS =
  "after:content-[''] after:absolute after:top-0 after:bottom-[-1px] after:left-0 after:w-px after:bg-[#f0f0f0] after:pointer-events-none after:opacity-0 after:transition-opacity [[data-scroll-right=true]_&]:after:opacity-100";

/**
 * TableHead - 表头单元格（强制样式）
 *
 * 强制规范：
 * - 背景色：继承 TableHeader 的 bg-gray-50（#FAFAFA）
 * - 标准版表头：对齐 Typography BodyMedium（14px / Medium / #171717）
 * - 紧凑版表头：对齐 Typography MetaMedium（12px / Medium / #737373）
 * - 表头高度固定：标准版 54px；紧凑版 40px
 * - 内容行用 table-cell height 作为最小视觉高度：标准版 54px；紧凑版 40px，并保留垂直 padding，复杂内容可自然撑高
 * - 标准版与紧凑版横向内边距统一：px-4（16px）
 * - 紧凑版只收缩字号与纵向 padding，不收缩左右贴边安全距离
 * - 默认对齐：text-left align-middle，可按列通过 className 覆盖 text-right
 * - 不换行：whitespace-nowrap
 *
 * 新增：
 *   - fixed?: "left" | "right"  ── 固定该列；必须配合 <Table scrollX={...}> 使用
 *   - fixedShadow?: boolean      ── 是否允许边界分隔线 + 滚动阴影，默认 true
 *     多列同侧固定时（如复选框列 + 名称列同时 fixed="left"），
 *     仅在最右侧的左固定列（或最左侧的右固定列）保留 true，其余列设 false。
 *
 * className 主要用于控制宽度（w-[xx%]）、sticky 偏移和必要的列对齐。
 * 每列标题和内容必须统一左对齐。
 */
type TableHeadProps = React.ComponentProps<"th"> & {
  fixed?: FixedSide;
  fixedShadow?: boolean;
};

function TableHead({ className, fixed, fixedShadow = true, ...props }: TableHeadProps) {
  const density = useTableDensity();

  return (
    <th
      data-slot="table-head"
      data-fixed={fixed}
      className={cn(
        "text-left align-middle font-sans whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        density === "compact"
          ? "h-10 px-4 py-0 text-xs font-medium leading-[1.5] text-gray-500"
          : "h-[54px] px-4 py-0 text-sm font-medium leading-[1.5] text-gray-900",
        // separate 模式下 <tr> border-b 会失效，由单元格自身补一条下分隔线（仅在 separate 模式下生效）
        "[table.border-separate_&]:border-b [table.border-separate_&]:border-gray-200",
        fixed === "left" && [FIXED_BASE, FIXED_LEFT_CLS],
        fixed === "right" && [FIXED_BASE, FIXED_RIGHT_CLS],
        fixed === "left" && fixedShadow && FIXED_LEFT_SHADOW_CLS,
        fixed === "right" && fixedShadow && FIXED_RIGHT_SHADOW_CLS,
        className
      )}
      {...props}
    />
  );
}

type TableCellProps = React.ComponentProps<"td"> & {
  fixed?: FixedSide;
  fixedShadow?: boolean;
};

function TableCell({ className, fixed, fixedShadow = true, ...props }: TableCellProps) {
  const density = useTableDensity();

  return (
    <td
      data-slot="table-cell"
      data-fixed={fixed}
      className={cn(
        "text-left align-middle whitespace-nowrap font-sans font-normal leading-[1.5] text-gray-900 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        density === "compact" ? "h-10 px-4 py-2 text-xs" : "h-[54px] px-4 py-3 text-sm",
        // separate 模式下补下分隔线（默认 collapse 模式由 <tr> border-b 接管）
        "[table.border-separate_&]:border-b [table.border-separate_&]:border-gray-200",
        fixed === "left" && [FIXED_BASE, FIXED_LEFT_CELL_CLS],
        fixed === "right" && [FIXED_BASE, FIXED_RIGHT_CELL_CLS],
        fixed === "left" && fixedShadow && FIXED_LEFT_CELL_SHADOW_CLS,
        fixed === "right" && fixedShadow && FIXED_RIGHT_CELL_SHADOW_CLS,
        className
      )}
      {...props}
    />
  );
}

/**
 * TableActionCell - 表格操作列专用单元格
 *
 * 业务侧的按钮**必须**显式声明 `variant="link"`（品牌蓝文字按钮）：
 *   - 因为 Button 默认 variant 是 claw-primary（黑→蓝实心渐变），不显式声明会得到实心按钮
 *   - 全局 TableActionCell 无法仅通过 className 选择器强制覆盖 Button 自带的 default variant 样式
 *     （CVA 生成的 class specificity 相同，被业务侧 Button 自带样式胜出）
 *
 * 操作列规范（v2026.05）：所有操作按钮（含「删除」等危险操作）统一使用 `variant="link"` 蓝色，
 *   不再用红色 / 黑色区分语义；语义差异由文案 + 二次确认 Dialog 承载。
 *   ❌ 禁止再加 `text-red-600` / `text-red-700` / `disabled:text-red-300` 等覆盖。
 *
 * 布局：
 *   - children 自动包裹在 `<div class="flex items-center gap-6">` 中（项间距固定 24px，对齐 Figma 操作列规范）
 *   - 单元格 padding `px-4`，与 `TableHead` 一致，确保按钮组与表头标题左对齐
 *   - 若业务有特殊布局需求（如多行、自定义 wrapper），可设 `rawChildren` 关闭自动 flex 容器
 *
 * 新增：fixed?: "left" | "right" + fixedShadow?: boolean（同 TableCell）
 *   - 横向滚动表格中操作列必须 fixed="right"
 *
 * 用法：
 *   <TableActionCell>
 *     <Button variant="link" onClick={onEdit}>编辑</Button>
 *     <Button variant="link" onClick={onDelete}>删除</Button>
 *   </TableActionCell>
 */
type TableActionCellProps = React.ComponentProps<"td"> & {
  fixed?: FixedSide;
  fixedShadow?: boolean;
  /** 关闭内置 flex wrapper，直接渲染 children（默认 false） */
  rawChildren?: boolean;
  /** 内置 flex wrapper 的额外 className（如 h-5 / whitespace-nowrap） */
  actionsClassName?: string;
};

function TableActionCell({
  className,
  fixed,
  fixedShadow = true,
  rawChildren = false,
  actionsClassName,
  children,
  ...props
}: TableActionCellProps) {
  const density = useTableDensity();

  return (
    <td
      data-slot="table-action-cell"
      data-fixed={fixed}
      className={cn(
        "align-middle whitespace-nowrap font-sans font-normal leading-[1.5] text-gray-900 [&:has([role=checkbox])]:pr-0",
        density === "compact" ? "h-10 px-4 py-2 text-xs" : "h-[54px] px-4 py-3 text-sm",
        // separate 模式下补下分隔线（默认 collapse 模式由 <tr> border-b 接管）
        "[table.border-separate_&]:border-b [table.border-separate_&]:border-gray-200",
        fixed === "left" && [FIXED_BASE, FIXED_LEFT_CELL_CLS],
        fixed === "right" && [FIXED_BASE, FIXED_RIGHT_CELL_CLS],
        fixed === "left" && fixedShadow && FIXED_LEFT_CELL_SHADOW_CLS,
        fixed === "right" && fixedShadow && FIXED_RIGHT_CELL_SHADOW_CLS,
        className
      )}
      {...props}
    >
      {rawChildren ? (
        children
      ) : (
        // 内置 flex 容器：项间距固定 24px (gap-6)，与 Figma 操作列规范对齐
        <div className={cn("relative z-10 flex items-center gap-6 whitespace-nowrap", actionsClassName)}>
          {children}
        </div>
      )}
    </td>
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
