/**
 * AgentToolLibrary - 管控端 Agent 工具库页面
 * Design: 「流动蓝图」Fluid Blueprint
 * 四个 Tab：公共技能库、企业技能库、企业插件库、企业MCP库
 * 将原 SkillConfig 中的公共技能库和企业技能库迁移至此，并新增企业插件库和企业MCP库
 */
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ExternalLink, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTag } from "@/components/ui/status-tag";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
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
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Agent 工具库</h1>
      </div>

      {/* Tab 切换器 - LineTabs */}
      <div className="mb-1">
        <div className="flex items-center gap-2 border-b border-[#f0f0f0]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-[14px] font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#0A0A0A] border-b-2 border-[#0A0A0A] -mb-px"
                  : "text-[#737373] hover:text-[#0A0A0A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 描述 */}
      <div className="mt-3 mb-6 space-y-2">
        <p className="text-sm text-[#737373] leading-relaxed">{currentTab.description}</p>
        {currentTab.id === 'enterprise' && (
          <p className="text-xs text-[#0A0A0A] leading-relaxed flex items-center gap-2">
            <span>由腾讯云 Agent Storage 提供服务，独享 50GB 免费空间</span>
            {!securityServiceActive ? (
              <Badge variant="outline" className="cursor-pointer gap-1.5 pr-1.5" onClick={() => setSecurityApplyDialogOpen(true)}>
                <span>恶意 Skills 扫描 API：未开通</span>
                <span className="inline-flex items-center gap-0.5 text-[#355EF1] hover:text-[#1d4ed8] font-medium">
                  一键开通
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Badge>
            ) : (
              <HoverCard openDelay={300}>
                <HoverCardTrigger asChild>
                  <span className="inline-flex">
                    <Badge color="green" className="cursor-pointer">
                      恶意 Skills 扫描 API：试用中
                    </Badge>
                  </span>
                </HoverCardTrigger>
                <HoverCardContent side="bottom" align="end" className="w-80 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#0A0A0A] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          恶意 Skills 扫描 API
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 border border-green-200">
                          试用中
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-[#737373]">
                        <div className="flex items-start gap-2">
                          <span className="text-[#737373] shrink-0 w-16">试用有效期</span>
                          <span>有效期至 2026年6月30日</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#737373] shrink-0 w-16">已用额度</span>
                          <span>{securityServiceUsed}/1000次<span className="text-[#A3A3A3]">（有效期到期后，剩余未使用的调用额度将清空）</span></span>
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
                          className="text-xs text-[#355EF1] hover:text-[#355EF1] flex items-center gap-1"
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
              <button
                onClick={() => {
                  const next = !securityServiceActive;
                  setSecurityServiceActive(next);
                  localStorage.setItem('skill_security_service_active', String(next));
                  toast.success(next ? '已模拟开通安全检测服务' : '已模拟取消安全检测服务');
                }}
                className="inline-flex w-5 h-5 rounded-[4px] border border-[#E5E5E5] text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A] items-center justify-center ml-1.5 align-middle transition-colors"
                title="切换开通状态（调试）"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>
          </p>
        )}
      </div>

      {/* 安全检测服务 — 申请开通弹窗 */}
      <Dialog open={securityApplyDialogOpen} onOpenChange={setSecurityApplyDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>申请免费试用（Skills 风险检测 API）</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-[5rem_1fr] gap-y-3 text-sm">
              <span className="text-[#737373]">试用有效期</span>
              <span className="text-[#0A0A0A]">有效期至 2026年6月30日</span>
              <span className="text-[#737373]">调用额度</span>
              <span className="text-[#0A0A0A]">1000次<span className="text-[#A3A3A3] text-xs ml-1">（有效期到期后，剩余未使用的调用额度将清空）</span></span>
              <span className="text-[#737373]">操作指引</span>
              <a
                href="https://cloud.tencent.com/document/api/664/131590"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1447E6] hover:opacity-80 flex items-center gap-1"
              >
                说明文档
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityApplyDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setSecurityServiceActive(true);
                localStorage.setItem('skill_security_service_active', 'true');
                setSecurityApplyDialogOpen(false);
                setSecuritySuccessDialogOpen(true);
              }}
            >
              立即领取
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 安全检测服务 — 开通成功弹窗 */}
      <Dialog open={securitySuccessDialogOpen} onOpenChange={setSecuritySuccessDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              试用额度已开通
            </DialogTitle>
            <DialogDescription className="pt-2">
              1000次调用额度，有效期至 2026-06-30
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <p className="text-sm font-medium text-[#0A0A0A] mb-1">使用 API</p>
              <p className="text-sm text-[#737373]">
                您可以前往查看{' '}
                <a
                  href="https://cloud.tencent.com/document/api/664/131590"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1447E6] hover:opacity-80 inline-flex items-center gap-0.5"
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
              variant="dialog-confirm"
              onClick={() => setSecuritySuccessDialogOpen(false)}
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
