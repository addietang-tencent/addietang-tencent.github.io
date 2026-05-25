/**
 * PageTabs - Agent 运维页面内的 Tab 切换器（统一样式）
 *
 * 用法：
 *   <PageTabs
 *     tabs={[{ id: "update", label: "版本更新" }, { id: "history", label: "更新记录" }]}
 *     active={tab}
 *     onChange={setTab}
 *   />
 *
 * 样式参考原 AgentVersionManagement 内的 TabButton：底部蓝条 + 主色文字。
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
      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              active === tab.id
                ? "text-[#355EF1] border-b-2 border-blue-600 -mb-px"
                : "text-[#737373] hover:text-[#334155]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {description && (
        <div className="mt-3 mb-6">
          <p className="text-sm text-[#737373] leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}
