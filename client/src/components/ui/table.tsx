import * as React from "react";

import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════════
 * Table 组件 · 设计规范（v2026.05）
 *
 * 本组件是企业管控端表格的"权威标准"。一切表格场景必须使用本组件 + Pagination
 * 组合，禁止直接写原生 <table> / <thead> / <tbody> / <tr> / <th> / <td>。
 *
 * 规范对应的 CSS 落点：client/src/index.css 「表格字号一致性规则」段。
 * ════════════════════════════════════════════════════════════════════
 *
 * §1. 密度 density（default | compact）
 * ──────────────────────────────────────────
 *   - default → 行高 54px，纵向 padding 12px
 *   - compact → 行高 40px，纵向 padding 8px
 *   两种密度仅在行高 / 纵向 padding 上区分，字号 / 横向 padding / 颜色保持一致。
 *
 *   Table 组件只负责表格结构与密度；分页器不属于 Table 内部能力。
 *   约定上，页面级标准表格通常搭配 Pagination 默认尺寸 `size="default"`；
 *   `size="small"` 更适合 Dialog / Drawer 等空间受限浮层中的表格分页。
 *
 * §2. 字号一致性（!important 全局强制）
 * ──────────────────────────────────────────
 *   表格相关所有元素字号统一 **12px / text-xs**，不区分密度。
 *
 *   覆盖范围（全部 12px）：
 *     ① 表格单元格自身（5 类 data-slot）
 *        [data-slot="table"]
 *        [data-slot="table-head"]
 *        [data-slot="table-cell"]
 *        [data-slot="table-action-cell"]
 *        [data-slot="table-footer"]
 *
 *     ② 表格内任意后代元素（table[data-density] *）：
 *        Button / Input / Select / Switch / Checkbox / Label / Tooltip /
 *        code / pre / div / span / p / a / strong ... 全部强制 12px。
 *        业务侧即便手写 `text-sm` / `text-base` / inline style fontSize 也会被 !important 覆盖。
 *
 *     ③ 分页器（[data-slot="pagination"]）：
 *        Pagination 组件 simple / default 两种模式、size="default" / "small"
 *        都强制 12px。两种 size 仅按钮尺寸（32px / 24px）不同，字号一致。
 *
 *     ④ 数量统计 / 摘要文字：
 *        SurfaceCard 内、与 [data-slot="table-container"] 同级的兄弟元素
 *        （例如「共 N 条记录」「最后更新于 ...」等表格底部说明文字）。
 *
 *   唯一豁免：**Badge** [data-slot="badge"] 始终保持自身尺寸，不被强制 12px。
 *
 *   ⚠️ 业务侧规范：
 *     - 不要在 TableCell 上手写 `text-sm` / `text-[14px]` / `text-[#737373]` 来"调字号"，
 *       不仅冗余（被 !important 覆盖），还会让代码层不一致。
 *     - 字号要变化时，请改 index.css 的全局规则，不要在 TableCell 局部硬写。
 *
 * §3. 字色规范
 * ──────────────────────────────────────────
 *   - TableHead（表头）：
 *       default 密度 → #171717（gray-900）
 *       compact 密度 → #737373（gray-500，参考 Figma MetaMedium）
 *   - TableCell / TableActionCell（数据行）：
 *       默认强制 #0A0A0A（纯黑），即 Tailwind gray-950 / project foreground。
 *
 *   业务可在单列上覆盖为辅助灰（#737373 / #525252）来表达"次要信息"，
 *   但表头之外**默认全部纯黑** —— 不再像 v1 那样按"主/次列"切灰色。
 *
 * §4. 字体（PingFang SC）
 * ──────────────────────────────────────────
 *   全站字体已通过 index.css 的 `*:not(svg):not(svg *) { font-family: 'PingFang SC' ... !important }`
 *   强制统一为 PingFang SC，因此：
 *     - 表格内 monospace ID（例如 `ins-hermes01`）也会渲染为 PingFang SC，
 *       不需要在业务侧用 `font-mono` 类名维持等宽（且 font-mono 也会被字体规则覆盖）。
 *     - 极少数确实需要等宽的位置（例如纯英文/数字代码块）建议放在 SVG 或独立 inline style 中处理。
 *
 * §5. 操作列 TableActionCell
 * ──────────────────────────────────────────
 *   - 业务按钮统一使用 `<Button variant="link">` 文字按钮（品牌蓝），
 *     连"删除"等危险操作也用 link 蓝色，红/黑语义差异由文案 + 二次确认 Dialog 承载，
 *     **禁止再加 text-red-600 / text-red-700 / disabled:text-red-300 等覆盖**。
 *   - 内置 flex wrapper：项间距固定 24px (gap-6)，对齐 Figma 操作列规范。
 *   - 在横向滚动表格中，操作列必须 `fixed="right"` 钉在最右侧。
 *
 * §6. 固定列 / Fixed Columns（参考 Ant Design）
 * ──────────────────────────────────────────
 *   <Table> 组件默认 props：
 *     - scrollX={undefined}        → 默认按容器宽度自适应；内容放得下不出现横滚条
 *     - autoFixedColumns={true}    → 自动 sticky 首列（第一个 th/td）+ 操作列（TableActionCell）
 *
 *   ⚠️ 何时显式开启横滚兜底？
 *     列数较多 / 内容长度不可控的表格，**必须**传 `scrollX={1500}` 或 `scrollX="max-content"`，
 *     这样在窄屏 / 大表格时才会出现横向滚动条，并触发自动固定列的视觉效果。
 *     若表格列数固定且内容能放下（如「内置通道」7 行简单列表），无需传 scrollX，
 *     避免出现"内容明明能放下却出现横滚条"的尴尬。
 *
 *   显式 API：
 *     - <Table scrollX={1500}> 或 <Table scrollX="max-content">  开启横滚兜底
 *     - <Table autoFixedColumns={false}>                          关闭自动固定列
 *     - <TableHead fixed="left"> / <TableHead fixed="right">
 *     - <TableCell fixed="left"> / <TableCell fixed="right">
 *     - <TableActionCell fixed="right">
 *       业务显式声明 fixed 的列优先级更高，自动固定不会覆盖。
 *
 *   多列同侧固定（如复选框列 + 名称列同时 fixed="left"）：
 *     仅在最右侧的左固定列（或最左侧的右固定列）保留 `fixedShadow`，其余设 `fixedShadow={false}`。
 *
 *   阴影分隔线：自动固定与显式固定通用同一套规则
 *     - 最左：仅在已向右滚动时显示
 *     - 最右：仅在右侧仍有内容时显示
 *     - 无横滚：阴影全部隐藏
 *
 *   规则定义位置：
 *     - JS：本文件 Table 组件（scrollX / autoFixedColumns）
 *     - CSS：client/src/index.css「表格自动固定列规则（v2026.05）」段
 *
 * §7. 选中行 data-state="selected"
 * ──────────────────────────────────────────
 *   通过给 <TableRow data-state="selected"> 标记选中态，全行（含固定列）背景
 *   会自动变为 rgba(20,71,230,0.06)，hover 时加深为 rgba(20,71,230,0.10)。
 *   可选 / 可勾选场景请使用 data-state，不要手写 bg-blue-50/40 等覆盖。
 *
 * §8. 与 Pagination 的搭配规范
 * ──────────────────────────────────────────
 *   推荐结构：
 *     <SurfaceCard>
 *       <Table>...</Table>
 *       <div className="px-4 py-3 border-t border-[#f0f0f0]">
 *         <Pagination total={...} showTotal={(t) => `共 ${t} 条记录`} ... />
 *       </div>
 *     </SurfaceCard>
 *
 *   - Pagination 字号自动跟随表格（12px），无需在调用侧覆盖。
 *   - showTotal 文案统一「共 N 条记录」（中文逗号），不要写 "Total: N"。
 * ════════════════════════════════════════════════════════════════════ */

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
   *   - 不传：表格按容器宽度自适应（默认）—— 内容放得下时不出现横滚条
   *
   * 列数较多 / 可能溢出的表格请显式传 `scrollX={1500}` 或 `scrollX="max-content"` 启用横滚兜底。
   */
  scrollX?: number | string;
  /**
   * 是否自动固定首列与操作列（默认 true）。
   * 仅在表格触发横向滚动（即传入了 scrollX 且内容溢出）时视觉上有意义：
   *   - 每行第一个 TableHead / TableCell 自动 sticky 在左侧
   *   - 每行的 TableActionCell 自动 sticky 在右侧
   * 业务侧已显式声明 `fixed="left"` / `fixed="right"` 的列优先级更高，不被覆盖。
   * 若特殊场景需要关闭自动固定（如卡片型不滚动表），传 autoFixedColumns={false}。
   */
  autoFixedColumns?: boolean;
};

function Table({
  className,
  containerClassName,
  containerRef,
  containerStyle,
  density = "default",
  scrollX,
  autoFixedColumns = true,
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
            data-auto-fixed={autoFixedColumns ? "true" : "false"}
            className={cn(
              "w-full caption-bottom font-sans leading-[1.5] text-gray-900 text-xs",
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
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-gray-50 border-t border-gray-200 font-sans font-medium leading-[1.5] text-gray-900 text-xs [&>tr]:last:border-b-0",
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
 * 规范（严格遵循 §1 / §2 / §3）：
 * - 背景：bg-gray-50（#FAFAFA），继承 TableHeader
 * - 字号：12px / Medium（不区分密度，全局 !important 强制 §2）
 * - 字色：default → #171717；compact → #737373
 * - 表头高度：default 54px / compact 40px（§1）
 * - 横向 padding：统一 px-4（16px）
 * - 默认对齐：text-left align-middle，可按列覆盖 text-right
 * - 不换行：whitespace-nowrap
 *
 * Props：
 *   - fixed?: "left" | "right"     固定该列；必须配合 <Table scrollX={...}>（§6）
 *   - fixedShadow?: boolean        是否允许边界分隔线 + 滚动阴影，默认 true
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
        "text-left align-middle font-sans whitespace-nowrap text-xs font-medium leading-[1.5] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        density === "compact"
          ? "h-10 px-4 py-0 text-gray-500"
          : "h-[54px] px-4 py-0 text-gray-900",
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
        "text-left align-middle whitespace-nowrap font-sans font-normal leading-[1.5] text-[#0A0A0A] text-xs [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        density === "compact" ? "h-10 px-4 py-2" : "h-[54px] px-4 py-3",
        // separate 模式下补下分隔线（默认 collapse 模式由 <tr> border-b 接管）
        "[table.border-separate_&]:border-b [table.border-separate_&]:border-gray-200",
        // separate 模式下，tbody 最后一行单元格不画底边，避免与外层卡片底边重合（与 collapse 模式 `[&_tr:last-child]:border-0` 行为对齐）
        "[table.border-separate_tbody_tr:last-child_&]:border-b-0",
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
 * 规范（参见顶部 §5 + §3 + §6）：
 *   - 字号 12px / 字色 #0A0A0A（被 §2 全局 !important 强制覆盖）
 *   - 内置 flex wrapper：项间距固定 24px (gap-6)，对齐 Figma 操作列规范
 *   - 业务按钮**必须**显式声明 `variant="link"`（品牌蓝文字按钮）：
 *       连「删除」等危险操作也用 link 蓝色，不再以红/黑区分语义；
 *       语义差异由文案 + 二次确认 Dialog 承载。
 *       ❌ 禁止 `text-red-600` / `text-red-700` / `disabled:text-red-300` 等覆盖。
 *   - 横向滚动表格中操作列必须 `fixed="right"`
 *
 * Props：
 *   - fixed?: "left" | "right"
 *   - fixedShadow?: boolean        默认 true
 *   - rawChildren?: boolean        关闭内置 flex wrapper（默认 false）
 *   - actionsClassName?: string    flex wrapper 的额外 className
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
        "align-middle whitespace-nowrap font-sans font-normal leading-[1.5] text-[#0A0A0A] text-xs [&:has([role=checkbox])]:pr-0",
        density === "compact" ? "h-10 px-4 py-2" : "h-[54px] px-4 py-3",
        // separate 模式下补下分隔线（默认 collapse 模式由 <tr> border-b 接管）
        "[table.border-separate_&]:border-b [table.border-separate_&]:border-gray-200",
        // separate 模式下，tbody 最后一行单元格不画底边，避免与外层卡片底边重合
        "[table.border-separate_tbody_tr:last-child_&]:border-b-0",
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
