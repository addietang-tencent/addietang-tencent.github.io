import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * Segment 分段选择器
 *
 * 对齐 Figma 设计稿：水平分段选择器
 *
 * 设计令牌：
 *   ┌─────────────────────────────┬───────────────────────────────────────────────────┐
 *   │ Token                       │ Value                                              │
 *   ├─────────────────────────────┼───────────────────────────────────────────────────┤
 *   │ container / bg              │ #f3f3f4                                            │
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
/*  基于 Radix Tabs 的受控版本（需要 Segment 包裹）                    */
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
        "bg-[#f3f3f4] text-[#7b818f] inline-flex h-9 w-fit items-center justify-center rounded-[6px] p-[3px]",
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
/*  独立版本（纯样式，不依赖 Radix Tabs Root）                         */
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
        "bg-[#f3f3f4] text-[#7b818f] inline-flex h-9 w-fit items-center justify-center rounded-[6px] p-[3px]",
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

export { Segment, SegmentList, SegmentItem, SegmentContent, SegmentGroup, SegmentOption };
