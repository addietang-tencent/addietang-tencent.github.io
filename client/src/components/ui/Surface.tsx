/**
 * Surface（语义化卡片容器）
 * ─────────────────────────────────────────────────────────────────
 * v2 设计系统 §5「阴影系统」唯一卡片 API。
 * 业务层一律用本组件，禁止再写 inline boxShadow / Tailwind shadow-md/lg/xl。
 *
 * 5 档语义：
 *   L1 SurfaceCard    表层卡片（页面主区块、列表卡、统计卡、Agent 卡）
 *   L2 SurfaceInner   内嵌卡片（卡片内的子卡 / 表格容器，无阴影）
 *   L3 SurfaceOverlay 浮层（Dialog/Sheet/Drawer/Popover/DropdownMenu，由 shadcn 内部使用）
 *   L4 SurfaceConfig  高亮配置卡（管理端"操作要点""引导卡"等需强调的卡）
 *   L5 segment 滑块   见 index.css --shadow-segment（直接写在 Tab/Segmented 内部）
 *
 * 修改阴影/描边：改 index.css 的 --shadow-card / --shadow-config 或本文件 baseClass，
 * 即可批量影响全站所有卡片，无需跨文件搜索替换。
 * ─────────────────────────────────────────────────────────────────
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ───────────── 公共 props ───────────── */

interface SurfaceBaseProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否启用卡片 hover 微抬动效（仅 L1/L4 推荐） */
  hover?: boolean;
  /** 是否禁用底色（让卡片透明，仅保留描边/阴影框） */
  bare?: boolean;
}

/* ───────────── L1 SurfaceCard ─────────────
 * 用于：页面主区块、列表卡、统计卡、Agent 卡、技能广场卡等"表层信息单元"。
 */
export const SurfaceCard = forwardRef<HTMLDivElement, SurfaceBaseProps>(
  ({ className, hover, bare, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-surface="card"
        className={cn(
          "rounded-[4px] border border-[#E5E5E5]",
          !bare && "bg-white",
          hover && "transition-all duration-200 hover:-translate-y-0.5",
          className,
        )}
        style={{ boxShadow: "var(--shadow-card)", ...style }}
        {...props}
      />
    );
  },
);
SurfaceCard.displayName = "SurfaceCard";

/* ───────────── L2 SurfaceInner ─────────────
 * 用于：卡片内的"子卡片/表格容器/分组面板"，无阴影、靠 #F5F5F5 浅描边。
 * 典型场景：模型额度页面里"模型使用汇总""详细使用记录"两个表格容器。
 */
export const SurfaceInner = forwardRef<HTMLDivElement, SurfaceBaseProps>(
  ({ className, bare, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-surface="inner"
        className={cn(
          "rounded-[4px] border border-[#F5F5F5]",
          !bare && "bg-white",
          className,
        )}
        style={{ boxShadow: "var(--shadow-inner)", ...style }}
        {...props}
      />
    );
  },
);
SurfaceInner.displayName = "SurfaceInner";

/* ───────────── L3 SurfaceOverlay ─────────────
 * 用于：自定义浮层（自实现 Dropdown / 浮动菜单）。
 * 注意：shadcn 自带 Dialog/Sheet/Drawer/Popover/DropdownMenu 已在
 *       components/ui 内部用 var(--shadow-overlay)，无需手动包一层。
 */
export const SurfaceOverlay = forwardRef<HTMLDivElement, SurfaceBaseProps>(
  ({ className, bare, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-surface="overlay"
        className={cn(
          "rounded-[4px] border border-[#E5E5E5]",
          !bare && "bg-white",
          className,
        )}
        style={{ boxShadow: "var(--shadow-overlay)", ...style }}
        {...props}
      />
    );
  },
);
SurfaceOverlay.displayName = "SurfaceOverlay";

/* ───────────── L4 SurfaceConfig ─────────────
 * 用于：管理端「操作要点」「引导卡」「Pro 套餐推荐卡」等需要"略强存在感"的卡。
 * 比 L1 略重，但远低于 L3 浮层。
 */
export const SurfaceConfig = forwardRef<HTMLDivElement, SurfaceBaseProps>(
  ({ className, hover, bare, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-surface="config"
        className={cn(
          "rounded-[4px]",
          !bare && "bg-white",
          hover && "transition-all duration-200 hover:-translate-y-0.5",
          className,
        )}
        style={{
          border: "0.5px solid #E5E5E5",
          boxShadow: "var(--shadow-config)",
          ...style,
        }}
        {...props}
      />
    );
  },
);
SurfaceConfig.displayName = "SurfaceConfig";
