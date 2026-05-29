import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * Segment 分段选择器（管理端 4px 方角原版）
 *
 * 对齐 Figma 设计稿：水平分段选择器（管理端规范，与 claw-* 按钮同档 4px 方角）。
 *
 * ⚠️ 端别提示（0523 修订）：
 *   - 管理端（Admin）：请用 `Segment / SegmentList / SegmentItem / SegmentContent`
 *     或 `SegmentGroup / SegmentOption`（本文件下半部分），保持 6px 容器 + 4px 滑块
 *   - 用户端（Tenant）：请用 `TenantSegment / TenantSegmentList / TenantSegmentItem`
 *     或 `TenantSegmentGroup / TenantSegmentOption`（本文件最下方），全圆角胶囊
 *   - 不要把管理端组件直接用 `className="rounded-full"` 临时改胶囊——会破坏单一真理源
 *
 * 设计令牌（管理端，恢复 0523 之前的原版）：
 *   ┌─────────────────────────────┬───────────────────────────────────────────────────┐
 *   │ Token                       │ Value                                              │
 *   ├─────────────────────────────┼───────────────────────────────────────────────────┤
 *   │ container / bg              │ #d7d7e354                                            │
 *   │ container / radius          │ 6px                                                │
 *   │ container / padding         │ 3px                                                │
 *   │ container / height          │ 36px (h-9)                                         │
 *   │ item / active bg            │ #FFFFFF                                            │
 *   │ item / active text          │ #020617 (font-semibold)                            │
 *   │ item / active shadow        │ 0px 1px 2px rgba(0,0,0,0.05)                      │
 *   │ item / active radius        │ 4px                                                │
 *   │ item / inactive text        │ #7b818f (font-normal)                              │
 *   │ item / hover text           │ #4b5563                                            │
 *   │ item / padding              │ 4px 16px                                           │
 *   │ item / disabled text        │ #d3d6db                                            │
 *   └─────────────────────────────┴───────────────────────────────────────────────────┘
 *
 * 两种用法：
 *
 * 1. 受控模式（带 TabsContent 联动）：
 *   <Segment defaultValue="basic">
 *     <SegmentList>
 *       <SegmentItem value="basic">基础配置</SegmentItem>
 *       <SegmentItem value="tools">工具管理</SegmentItem>
 *     </SegmentList>
 *     <SegmentContent value="basic">...</SegmentContent>
 *   </Segment>
 *
 * 2. 独立模式（纯样式，自行管理状态）：
 *   <SegmentGroup>
 *     <SegmentOption active={mode === "all"} onClick={() => setMode("all")}>全部</SegmentOption>
 *     <SegmentOption active={mode === "group"} onClick={() => setMode("group")}>分组</SegmentOption>
 *   </SegmentGroup>
 */

/* ============================================================== */
/*  管理端｜基于 Radix Tabs 的受控版本（需要 Segment 包裹）            */
/* ============================================================== */

function Segment({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="segment"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function SegmentList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="segment-list"
      className={cn(
        "bg-[#d7d7e354] text-[#7b818f] inline-flex h-9 w-fit items-center justify-center rounded-[6px] border border-border p-[2px]",
        className
      )}
      {...props}
    />
  );
}

function SegmentItem({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="segment-item"
      className={cn(
        "text-[#7b818f] font-normal inline-flex h-[calc(100%-1px)] items-center justify-center rounded-[4px] border border-transparent px-4 py-1 text-sm whitespace-nowrap transition-all " +
          "data-[state=active]:bg-white data-[state=active]:text-[#020617] data-[state=active]:font-semibold data-[state=active]:shadow-[0px_1px_2px_rgba(0,0,0,0.05)] " +
          "hover:text-[#4b5563] " +
          "focus-visible:ring-[3px] focus-visible:ring-[#355EF1]/20 focus-visible:outline-none " +
          "disabled:pointer-events-none disabled:text-[#d3d6db]",
        className
      )}
      {...props}
    />
  );
}

function SegmentContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="segment-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

/* ============================================================== */
/*  管理端｜独立版本（纯样式，不依赖 Radix Tabs Root）                 */
/* ============================================================== */

function SegmentGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="segment-group"
      role="tablist"
      className={cn(
        "bg-[#d7d7e354] text-[#7b818f] inline-flex h-9 w-fit items-center justify-center rounded-[6px] border border-border p-[2px]",
        className
      )}
      {...props}
    />
  );
}

interface SegmentOptionProps extends React.ComponentProps<"button"> {
  active?: boolean;
}

function SegmentOption({
  className,
  active = false,
  ...props
}: SegmentOptionProps) {
  return (
    <button
      data-slot="segment-option"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-[4px] border border-transparent px-4 py-1 text-sm whitespace-nowrap transition-all " +
          "focus-visible:ring-[3px] focus-visible:ring-[#355EF1]/20 focus-visible:outline-none " +
          "disabled:pointer-events-none disabled:text-[#d3d6db]",
        active
          ? "bg-white text-[#020617] font-semibold shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          : "text-[#7b818f] font-normal hover:text-[#4b5563]",
        className
      )}
      {...props}
    />
  );
}

/* ============================================================== */
/*  用户端｜TenantSegment 胶囊版（0525 对齐 Figma 1077-33424）        */
/*  与上方管理端组件接口完全一致，仅视觉差异：                          */
/*    - 容器：h-36px、圆角 80px、bg rgba(219,221,228,0.32)           */
/*    - Tab：px-12 py-4、圆角 80px、14/22/500                       */
/*    - Active：bg #FFF、border #CDD4DC、shadow 0 1px 4px 0.05     */
/*    - Normal：color #334155、font-weight 400                      */
/*  仅供 client/src/pages/tenant/** 使用，管理端禁用。               */
/* ============================================================== */

function TenantSegment({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tenant-segment"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function TenantSegmentList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tenant-segment-list"
      className={cn(
        "relative text-muted-foreground inline-flex h-9 w-fit items-center rounded-[80px] p-0",
        className
      )}
      style={{ background: "rgba(219, 221, 228, 0.32)" }}
      {...props}
    />
  );
}

function TenantSegmentItem({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tenant-segment-item"
      className={cn(
        "relative z-10 text-[#334155] font-normal inline-flex h-full items-center justify-center rounded-[40px] px-3 py-1 text-[14px] leading-[22px] tracking-[0.005em] whitespace-nowrap transition-all " +
          "data-[state=active]:bg-white data-[state=active]:text-[#020617] data-[state=active]:font-medium data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-[#CDD4DC] data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] " +
          "hover:text-[#020617] " +
          "focus-visible:ring-[3px] focus-visible:ring-[#355EF1]/20 " +
          "disabled:pointer-events-none disabled:text-[#d3d6db]",
        className
      )}
      {...props}
    />
  );
}

function TenantSegmentContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tenant-segment-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

function TenantSegmentGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tenant-segment-group"
      role="tablist"
      className={cn(
        "relative text-muted-foreground inline-flex h-9 w-fit items-center rounded-[80px] p-0",
        className
      )}
      style={{ background: "rgba(219, 221, 228, 0.32)" }}
      {...props}
    />
  );
}

interface TenantSegmentOptionProps extends React.ComponentProps<"button"> {
  active?: boolean;
}

function TenantSegmentOption({
  className,
  active = false,
  ...props
}: TenantSegmentOptionProps) {
  return (
    <button
      data-slot="tenant-segment-option"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "relative z-10 inline-flex h-full items-center justify-center gap-2 rounded-[40px] px-3 py-1 text-[14px] leading-[22px] tracking-[0.005em] whitespace-nowrap transition-all " +
          "focus-visible:ring-[3px] focus-visible:ring-[#355EF1]/20 " +
          "disabled:pointer-events-none disabled:text-[#d3d6db]",
        active
          ? "bg-white text-[#020617] font-medium outline outline-1 outline-[#CDD4DC] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)]"
          : "text-[#334155] font-normal hover:text-[#020617]",
        className
      )}
      {...props}
    />
  );
}

/* ============================================================== */
/*  TextSwitch：纯文字切换器（用户端轻量场景，0523 新增）              */
/* ============================================================== */

/**
 * TextSwitch 文字切换器
 *
 * 严格对齐 Figma `1077:33980`（用户端「普通 / 多分组」切换）。
 *
 * 与 TenantSegmentGroup 的差异：
 *   ┌────────────┬──────────────────────────────┬────────────────────────────┐
 *   │            │ TenantSegmentGroup（胶囊版）   │ TextSwitch（文字版）          │
 *   ├────────────┼──────────────────────────────┼────────────────────────────┤
 *   │ 容器        │ var(--muted) 圆角胶囊 + h-9   │ 无背景，纯横排                  │
 *   │ active     │ 白底 + shadow-segment          │ #020617 深字 + 14/400          │
 *   │ inactive   │ #737373 灰字                  │ #A7A7A7 浅灰 14/400            │
 *   │ 分隔        │ 无                            │ 中间 `/` 字符 #E2E8F0           │
 *   │ 字号        │ 14 / inactive 400             │ 14 / 400（active/inactive 同字重）│
 *   │ 适用场景      │ 强切换（视图模式、分类筛选）       │ 弱切换（次要状态、配套主操作的辅助开关）│
 *   └────────────┴──────────────────────────────┴────────────────────────────┘
 *
 * 用法：
 *   <TextSwitch>
 *     <TextSwitchOption active={mode === "a"} onClick={() => setMode("a")}>普通</TextSwitchOption>
 *     <TextSwitchOption active={mode === "b"} onClick={() => setMode("b")}>多分组</TextSwitchOption>
 *   </TextSwitch>
 *
 * 实现细节：
 *   - 分隔符 `/` 由组件内部自动在相邻两个 `TextSwitchOption` 之间渲染（aria-hidden="true"）
 *   - gap 12px = Figma `layout_LE2IPO`
 *   - active/inactive 字重均为 400（Figma `style_3FUI4B` fontWeight=400），靠颜色拉差异
 */

function TextSwitch({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  // 在相邻 option 之间插入分隔符 `/`，保持 aria 语义干净（分隔符对屏幕阅读器隐藏）
  const items = React.Children.toArray(children).filter(Boolean);
  const interleaved: React.ReactNode[] = [];
  items.forEach((node, idx) => {
    interleaved.push(node);
    if (idx < items.length - 1) {
      interleaved.push(
        <span
          key={`sep-${idx}`}
          aria-hidden="true"
          className="text-[#E2E8F0] text-sm font-normal leading-none select-none"
        >
          /
        </span>
      );
    }
  });

  return (
    <div
      data-slot="text-switch"
      role="tablist"
      className={cn("inline-flex items-center gap-3", className)}
      {...props}
    >
      {interleaved}
    </div>
  );
}

interface TextSwitchOptionProps extends React.ComponentProps<"button"> {
  active?: boolean;
}

function TextSwitchOption({
  className,
  active = false,
  ...props
}: TextSwitchOptionProps) {
  return (
    <button
      type="button"
      data-slot="text-switch-option"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      className={cn(
        // 基础排版：14px / 400 / line-height 22px / letter-spacing 0.5%（Figma style_3FUI4B）
        "text-sm font-normal leading-[22px] tracking-[0.005em] transition-colors " +
          "focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-[#355EF1]/20 focus-visible:rounded-sm " +
          "disabled:pointer-events-none disabled:text-[#d3d6db]",
        active
          ? "text-[#020617] cursor-default"
          : "text-[#A7A7A7] hover:text-[#020617] cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export {
  // 管理端 4px 方角
  Segment,
  SegmentList,
  SegmentItem,
  SegmentContent,
  SegmentGroup,
  SegmentOption,
  // 用户端胶囊
  TenantSegment,
  TenantSegmentList,
  TenantSegmentItem,
  TenantSegmentContent,
  TenantSegmentGroup,
  TenantSegmentOption,
  // 用户端文字切换
  TextSwitch,
  TextSwitchOption,
};
