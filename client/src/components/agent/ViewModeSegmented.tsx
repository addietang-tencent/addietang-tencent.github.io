/**
 * ViewModeSegmented - 管理视图 / 对话视图分段切换（v3 / [Figma 1116-6220]）
 *
 * 设计来源：Figma 节点 1116:6220「切换」
 * 视觉规范：
 *   - 容器：高 31px、bg rgba(228,232,241,0.4)、圆角 40px
 *   - Active Tab（等高容器 31px）：bg #FFFFFF、border 1px #CDD4DC、
 *     shadow 0px 1px 4px rgba(0,0,0,0.05)、圆角 40px、padding 8px 12px、gap 8px
 *   - Normal Tab：padding 8px 12px、gap 8px、无背景
 *   - 文字：14px / 22px / 400（两态均 400）
 *   - Active 色 #020617、Normal 色 #334155
 *   - 图标：16×16
 */
import { LayoutGrid, MessageSquare } from "lucide-react";

export type ViewMode = "card" | "chat";

interface ViewModeSegmentedProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ITEMS: { key: ViewMode; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "card", label: "管理视图", Icon: LayoutGrid },
  { key: "chat", label: "对话视图", Icon: MessageSquare },
];

export const ViewModeSegmented = ({ value, onChange }: ViewModeSegmentedProps) => {
  return (
    <div
      className="inline-flex items-center h-[31px] rounded-[40px]"
      style={{ background: "rgba(228, 232, 241, 0.4)" }}
      role="tablist"
      aria-label="视图切换"
    >
      {ITEMS.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={[
              "inline-flex h-[31px] items-center gap-2 px-3 rounded-[40px] text-[14px] leading-[22px] tracking-[0.005em] font-normal whitespace-nowrap transition-all duration-150",
              active
                ? "bg-white text-[#020617] outline outline-1 outline-[#CDD4DC] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)]"
                : "text-[#334155] hover:text-[#020617]",
            ].join(" ")}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
};
