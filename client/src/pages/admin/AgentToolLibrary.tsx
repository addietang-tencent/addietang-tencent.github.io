/**
 * AgentToolLibrary - 管控端 Agent 工具库页面
 * Design: 「流动蓝图」Fluid Blueprint
 * 四个 Tab：公共技能库、企业技能库、企业插件库、企业MCP库
 * 将原 SkillConfig 中的公共技能库和企业技能库迁移至此，并新增企业插件库和企业MCP库
 */
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import EnterpriseSkillLibrary from "./EnterpriseSkillLibrary";
import PublicSkillLibraryTab from "./SkillLibrary/PublicSkillLibraryTab";
import PluginListTab from "./SkillLibrary/PluginListTab";
import MCPListTab from "./SkillLibrary/MCPListTab";

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
    description: "上传和管理企业自定义插件，按需下发到 Agent 云服务器，扩展 Agent 能力边界。",
  },
  {
    id: "mcp",
    label: "企业MCP库",
    description: "统一管理 MCP 服务配置，支持远程服务和本地命令两种连接方式，按需下发到智能体实例。",
  },
];

export default function AgentToolLibrary() {
  const [activeTab, setActiveTab] = useState("public");
  const [packages, setPackages] = useState<Array<{ id: string; name: string; isActive: boolean }>>([
    { id: 'pkg-1', name: '全员通用技能包', isActive: true },
    { id: 'pkg-2', name: '高级开发技能包', isActive: false },
  ]);
  const [packagesDraft, setPackagesDraft] = useState<Record<string, boolean>>({});

  // 安全检测服务状态（与 SkillListTab 共享 localStorage）
  const [securityServiceActive, setSecurityServiceActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('skill_security_service_active');
    return saved === 'true';
  });
  const [securityApplyDialogOpen, setSecurityApplyDialogOpen] = useState(false);
  const [securitySuccessDialogOpen, setSecuritySuccessDialogOpen] = useState(false);
  const [securityServiceUsed] = useState(156); // mock 已用额度

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="page-enter w-full min-w-0">
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
      <div className="mt-3 mb-6 space-y-2">
        <p className="text-sm text-gray-500 leading-relaxed">{currentTab.description}</p>
        {currentTab.id === 'enterprise' && (
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-[4px] whitespace-nowrap">
              <svg className="w-3 h-3 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
              </svg>
              <span className="text-xs text-blue-600">由腾讯云存储 Agent Storage 提供服务，ClawPro 用户独享初始技能包和企业技能库各 50GB 免费空间</span>
            </div>

            {/* 安全检测服务区域 — 右上角 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!securityServiceActive ? (
                <>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    恶意 Skills 扫描 API
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                    未开通
                  </span>
                  <button
                    onClick={() => setSecurityApplyDialogOpen(true)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    开通
                  </button>
                </>
              ) : (
                <HoverCard openDelay={300}>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                        恶意 Skills 扫描 API
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 border border-green-200">
                        试用中
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent side="bottom" align="end" className="w-80 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          恶意 Skills 扫描 API
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 border border-green-200">
                          试用中
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 shrink-0 w-16">试用有效期</span>
                          <span>有效期至 2026年6月30日</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 shrink-0 w-16">已用额度</span>
                          <span>{securityServiceUsed}/1000次<span className="text-gray-400">（有效期到期后，剩余未使用的调用额度将清空）</span></span>
                        </div>
                        {/* 进度条 */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${(securityServiceUsed / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <a
                          href="https://cloud.tencent.com/document/api/664/131590"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          说明文档
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
              {/* 调试用：状态切换按钮 */}
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const next = !securityServiceActive;
                      setSecurityServiceActive(next);
                      localStorage.setItem('skill_security_service_active', String(next));
                      toast.success(next ? '已模拟开通安全检测服务' : '已模拟取消安全检测服务');
                    }}
                    className="w-5 h-5 rounded border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] ml-1"
                  >
                    ↻
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">切换开通状态（调试）</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {/* 安全检测服务 — 申请开通弹窗 */}
      <Dialog open={securityApplyDialogOpen} onOpenChange={setSecurityApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">申请免费试用（Skills 风险检测 API）</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-[5rem_1fr] gap-y-3 text-sm">
              <span className="text-gray-500">试用有效期</span>
              <span className="text-gray-900">有效期至 2026年6月30日</span>
              <span className="text-gray-500">调用额度</span>
              <span className="text-gray-900">1000次<span className="text-gray-400 text-xs ml-1">（有效期到期后，剩余未使用的调用额度将清空）</span></span>
              <span className="text-gray-500">操作指引</span>
              <a
                href="https://cloud.tencent.com/document/api/664/131590"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                说明文档
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setSecurityApplyDialogOpen(false)} className="text-sm">
              取消
            </Button>
            <Button
              onClick={() => {
                setSecurityServiceActive(true);
                localStorage.setItem('skill_security_service_active', 'true');
                setSecurityApplyDialogOpen(false);
                setSecuritySuccessDialogOpen(true);
              }}
              style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
              className="text-white text-sm"
            >
              立即领取
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 安全检测服务 — 开通成功弹窗 */}
      <Dialog open={securitySuccessDialogOpen} onOpenChange={setSecuritySuccessDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </span>
              试用额度已开通
            </DialogTitle>
            <DialogDescription className="pt-2">
              1000次调用额度，有效期至 2026-06-30
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">使用 API</p>
              <p className="text-sm text-gray-600">
                您可以前往查看{' '}
                <a
                  href="https://cloud.tencent.com/document/api/664/131590"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
                >
                  说明文档
                  <ExternalLink className="w-3 h-3" />
                </a>
                ，基于说明文档调用并测试 API。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setSecuritySuccessDialogOpen(false)}
              style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
              className="text-white text-sm"
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <EnterpriseSkillLibrary securityServiceActive={securityServiceActive} />
      )}

      {activeTab === "plugins" && (
        <PluginListTab />
      )}

      {activeTab === "mcp" && (
        <MCPListTab />
      )}
    </div>
  );
}
