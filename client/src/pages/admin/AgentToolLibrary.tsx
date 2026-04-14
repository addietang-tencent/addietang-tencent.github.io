/**
 * AgentToolLibrary - 管控端 Agent 工具库页面
 * Design: 「流动蓝图」Fluid Blueprint
 * 三个 Tab：公共技能库、企业技能库、企业插件库
 * 将原 SkillConfig 中的公共技能库和企业技能库迁移至此，并新增企业插件库
 */
import { useState } from "react";
import EnterpriseSkillLibrary from "./EnterpriseSkillLibrary";
import SkillDetail from "./SkillLibrary/SkillDetail";
import PublicSkillLibraryTab from "./SkillLibrary/PublicSkillLibraryTab";
import PluginListTab from "./SkillLibrary/PluginListTab";

const TABS = [
  {
    id: "public",
    label: "公共技能库",
    description: "浏览公共技能市场，收藏技能并加入初始技能包，形成适合企业实际场景的公共技能库。",
  },
  {
    id: "enterprise",
    label: "企业技能库",
    description: "Skill 一键入库、批量分发，打造安全稳定的企业级技能管理体系。",
  },
  {
    id: "plugins",
    label: "企业插件库",
    description: "上传和管理企业自定义插件，按需下发到 OpenClaw 云服务器，扩展 Agent 能力边界。",
  },
];

export default function AgentToolLibrary() {
  const [activeTab, setActiveTab] = useState("public");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Array<{ id: string; name: string; isActive: boolean }>>([
    { id: 'pkg-1', name: '全员通用技能包', isActive: true },
    { id: 'pkg-2', name: '高级开发技能包', isActive: false },
  ]);
  const [packagesDraft, setPackagesDraft] = useState<Record<string, boolean>>({});

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="page-enter max-w-5xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agent 工具库</h1>
      </div>

      {/* Tab 切换器 */}
      <div className="flex items-center gap-1 mb-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // 切换 Tab 时清空技能详情
              if (tab.id !== 'enterprise') setSelectedSkillId(null);
            }}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 描述 */}
      <div className="flex items-center gap-3 mt-3 mb-6">
        <p className="text-sm text-gray-500 leading-relaxed">{currentTab.description}</p>
        {currentTab.id === 'enterprise' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-md whitespace-nowrap">
            <svg className="w-3 h-3 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
            </svg>
            <span className="text-xs text-blue-600">由腾讯云存储 Agent Storage 提供服务，ClawPro 用户独享初始技能包和企业技能库各 50GB 免费空间</span>
          </div>
        )}
      </div>

      {/* Tab 内容 */}
      {activeTab === "public" && (
        <PublicSkillLibraryTab
          packages={packages}
          onAddSkillToPackage={(skillId, packageId) => {
            setPackagesDraft(prev => ({ ...prev, [packageId]: true }));
          }}
        />
      )}

      {activeTab === "enterprise" && (
        selectedSkillId ? (
          <SkillDetail
            skillId={selectedSkillId}
            onBack={() => setSelectedSkillId(null)}
          />
        ) : (
          <EnterpriseSkillLibrary onSelectSkill={setSelectedSkillId} />
        )
      )}

      {activeTab === "plugins" && (
        <PluginListTab />
      )}
    </div>
  );
}
