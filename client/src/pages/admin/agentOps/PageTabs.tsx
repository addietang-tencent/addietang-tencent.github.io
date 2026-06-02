/**
 * PageTabs - Agent 运维页面内的 Tab 切换器（统一 LineTabs 样式）
 *
 * 用法：
 *   <PageTabs
 *     tabs={[{ id: "update", label: "版本更新" }, { id: "history", label: "更新记录" }]}
 *     active={tab}
 *     onChange={setTab}
 *   />
 *
 * 样式参考：与 ChannelConfig / SkillConfig 同款 LineTabs（黑色下划线）。
 */
interface TabDef<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs: ReadonlyArray<TabDef<T>>;
  active: T;
  onChange: (id: T) => void;
  /** 当前选中 Tab 的描述文案（可选，渲染在 Tab 下方） */
  description?: string;
}

export default function PageTabs<T extends string>({
  tabs, active, onChange, description,
}: Props<T>) {
  return (
    <div>
      {/* Tab 切换器（与 Agent 工具库 / ChannelConfig / SkillConfig 同款 LineTabs：黑色下划线 + 浅蓝底线） */}
      <div className="mb-1">
        <div className="flex items-center gap-2 border-b border-[#dbe6ff]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-3 text-[14px] font-medium transition-colors whitespace-nowrap ${
                active === tab.id
                  ? "text-[#0A0A0A] border-b-2 border-[#0A0A0A] -mb-px"
                  : "text-[#737373] hover:text-[#0A0A0A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 描述（仅一行） */}
      {description && (
        <div className="flex items-center gap-3 mt-3 mb-6">
          <p className="text-sm text-[#737373] leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}
