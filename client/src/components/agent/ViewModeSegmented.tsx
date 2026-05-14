/**
 * ViewModeSegmented - 管理视图 / 对话视图分段切换
 * 对齐 Figma node 358:2376「切换」：
 *   - 浅灰底，选中态白底 + 阴影
 *   - 每段 padding 4px 12px，gap 4px，含图标 + 文本
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
      className="inline-flex items-center gap-1 p-1 rounded-[4px]"
      style={{ background: "#F5F5F5" }}
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
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-[3px] text-sm font-medium transition-all duration-150 ${
              active
                ? "bg-white text-[#0A0A0A]"
                : "text-[#737373] hover:text-[#0A0A0A]"
            }`}
            style={active ? { boxShadow: "var(--shadow-segment)" } : undefined}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
};
