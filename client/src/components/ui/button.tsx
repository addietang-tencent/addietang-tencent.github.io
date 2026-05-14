import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button 组件
 *
 * 在 shadcn 默认 variant/size 之外，扩展了一组「ClawPro Figma 按钮规范」变体（前缀 `claw-`），
 * 严格对齐设计稿 Figma ComponentSet 317:1051「按钮」。
 *
 * 设计令牌（来自 Figma 317:1051）：
 *   ┌─────────────────────────┬──────────────────────────────────────────────────────────────┐
 *   │ Token                   │ Value                                                         │
 *   ├─────────────────────────┼──────────────────────────────────────────────────────────────┤
 *   │ claw-outline / bg       │ #FFFFFF                                                       │
 *   │ claw-outline / hover bg │ linear-gradient(90deg, #FFFFFF 0%, #F2F5FF 100%)              │
 *   │ claw-outline / border   │ 1px solid #E5E5E5                                             │
 *   │ claw-outline / hover    │ 1px solid #D8E1FF                                             │
 *   │ claw-outline / text     │ #020617                                                       │
 *   │ claw-primary / bg       │ linear-gradient(90deg, #020617 70%, #1447E6 100%)             │
 *   │ claw-primary / hover bg │ linear-gradient(90deg, #020617 70%, #0A226F 100%)             │
 *   │ claw-primary / text     │ #FFFFFF                                                       │
 *   │ 圆角                     │ 4px（已由基类提供）                                            │
 *   │ icon size               │ 16×16（已由基类 [&_svg:not([size-])]:size-4 提供）              │
 *   └─────────────────────────┴──────────────────────────────────────────────────────────────┘
 *
 * 使用示例：
 *   <Button variant="claw-outline" size="claw">  // 36 高 / 24 padding / 8 gap
 *     <Settings /> 详细配置
 *   </Button>
 *
 *   <Button variant="claw-outline" size="claw-square">  // 48×36 仅图标
 *     <RefreshCw />
 *   </Button>
 *
 *   <Button variant="claw-primary" size="claw-lg">  // 40 高 / 18 padding / 16 gap
 *     <Plus /> 创建 Agent
 *   </Button>
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-transparent shadow-xs hover:bg-accent dark:bg-transparent dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        /* ============================================================== */
        /*  Figma「按钮」ComponentSet 317:1051 对齐变体                       */
        /* ============================================================== */

        /**
         * 线性描边（次级按钮）
         * - normal: 白底 + #E5E5E5 边 + #020617 字
         * - hover : 浅蓝渐变 + #D8E1FF 边
         * - 用于卡片底部「详细配置 / 刷新」等次要操作
         */
        "claw-outline":
          "bg-white border border-[#E5E5E5] text-[#020617] font-normal " +
          "hover:bg-[linear-gradient(90deg,#FFFFFF_0%,#F2F5FF_100%)] hover:border-[#D8E1FF]",

        /**
         * 深色填充（主按钮）
         * - normal: 黑→蓝渐变 + 白字
         * - hover : 黑→深蓝渐变
         * - 用于「创建 Agent」等主操作
         */
        "claw-primary":
          "bg-[linear-gradient(90deg,#020617_70%,#1447E6_100%)] text-white font-normal border-0 " +
          "hover:bg-[linear-gradient(90deg,#020617_70%,#0A226F_100%)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-[4px] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-[4px] px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",

        /* --------------------------- Figma 尺寸 --------------------------- */

        /** 36×hug，padding 8/24，icon-text gap 8（线性描边默认尺寸 / 主按钮默认） */
        claw: "h-9 gap-2 px-6 py-2",

        /**
         * 32×hug，padding 4/16，icon-text gap 6（紧凑场景：Dialog footer / 行内主按钮）
         * 不属于 Figma 原 ComponentSet，但项目中大量历史 Dialog 主按钮使用 h-8，
         * 在不破坏现有视觉密度的前提下提供一个收口尺寸。
         */
        "claw-sm": "h-8 gap-1.5 px-4 py-1",

        /** 48×36 纯图标（线性描边方形按钮，卡片角落「刷新」） */
        "claw-square": "h-9 w-12 p-0",

        /** 40×hug，padding 4.44/17.78（≈4/18），icon-text gap 16（深色主按钮） */
        "claw-lg": "h-10 gap-4 px-[18px] py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
