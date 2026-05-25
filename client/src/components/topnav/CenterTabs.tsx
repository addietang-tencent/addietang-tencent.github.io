/**
 * CenterTabs - 中央 segmented 切换控件（v3 / [Figma 1077-33929] 胶囊版）
 *
 * 设计来源：Figma 「公共组件/导航」中央 Frame（节点 1077:33933 / 历史 297:3468）
 * 视觉规范（[Figma 1077-33929] 修订）：
 *   - 容器：高 39px、padding 4px、bg rgba(219,221,228,0.32)（半透灰）、rounded-full（胶囊）
 *   - Tab：padding 7px 16px、字号 14、rounded-full（胶囊）
 *     - Active：bg #FFFFFF、color var(--foreground)、shadow var(--shadow-segment)、
 *               border 1px solid #CDD4DC（[Figma 1077-33929] 新增描边）
 *     - Normal：color var(--secondary-foreground)（= #334155）
 *
 * 阴影来源：index.css §5 阴影系统 L5 segment 滑块（var(--shadow-segment)），
 * 改 index.css 单变量即可批量影响全站所有 segmented 控件。
 *
 * 用法：
 *   <CenterTabs
 *     items={[{ label: "我的 Agent", value: "/my-openclaw" }, ...]}
 *     activeValue={location}
 *     onChange={(value) => navigate(value)}
 *   />
 */
import React from "react";

export interface CenterTabItem<V extends string = string> {
  label: string;
  value: V;
  /** 可选：自定义 Active 判断函数，默认严格等于；常用于路由前缀匹配 */
  matches?: (current: string) => boolean;
}

export interface CenterTabsProps<V extends string = string> {
  items: CenterTabItem<V>[];
  activeValue: string;
  onChange?: (value: V, index: number) => void;
  /** 自定义 Active 判断（全局），优先级低于 item.matches */
  isActive?: (item: CenterTabItem<V>, current: string) => boolean;
  className?: string;
}

export default function CenterTabs<V extends string = string>({
  items,
  activeValue,
  onChange,
  isActive,
  className = "",
}: CenterTabsProps<V>) {
  const checkActive = (item: CenterTabItem<V>) => {
    if (item.matches) return item.matches(activeValue);
    if (isActive) return isActive(item, activeValue);
    return item.value === activeValue;
  };

  return (
    <nav
      // [Figma 1077-33929] 容器底色 rgba(219,221,228,0.32) — 半透灰，区别于 bg-muted 的 #F5F5F5
      className={`flex items-center gap-1 p-1 rounded-full ${className}`}
      style={{ background: "rgba(219, 221, 228, 0.32)" }}
      role="tablist"
    >
      {items.map((item, idx) => {
        const active = checkActive(item);
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(item.value, idx)}
            className={[
              "px-4 py-[7px] rounded-full text-[14px] leading-[22px] transition-all duration-150 whitespace-nowrap",
              active
                // [Figma 1077-33929] Active 滑块新增 1px #CDD4DC 描边
                ? "bg-white text-foreground font-medium shadow-[var(--shadow-segment)] border border-[#CDD4DC]"
                : "text-secondary-foreground hover:text-foreground font-normal border border-transparent",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
