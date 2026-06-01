/**
 * SecurityManagement - AI Agent 安全管理页面
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 *
 * 结构：
 *  - Header：标题 + 描述 + 右上角快捷链接
 *  - 3 个统计指标卡（AI Agent资产 / 存在风险/告警资产 / 威胁告警）
 *  - Tab 标签页（AI Agent配置 / 管控配置 / 审计日志 / 恶意Skills / 威胁告警）
 *  - 数据表格 + 操作栏
 */
import { useState } from "react";
import { Segment, SegmentList, SegmentItem, SegmentContent } from "@/components/ui/segment";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SurfaceCard } from "@/components/ui/Surface";
import { StatNumber } from "@/components/ui/Typography";
import { RefreshCw, Info, ChevronDown } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";

// ─── 统计卡片数据 ────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    label: "AI Agent资产",
    value: 1841,
    icon: "agent" as const,
    hasTooltip: false,
  },
  {
    label: "存在风险/告警资产",
    value: 533112,
    icon: "risk" as const,
    hasTooltip: true,
  },
  {
    label: "威胁告警",
    value: 533112,
    icon: "threat" as const,
    hasTooltip: false,
  },
];

// ─── Mock 资产表格数据 ────────────────────────────────────────────────────────────

interface AgentAsset {
  id: string;
  agentName: string;
  model: string;
  skillsCount: number;
  alertHighDanger: number;
  alertMalicious: number;
  identifyTime: string;
  identifySource: string;
  openClawVersion: string;
  intranetControl: "已开启" | "未开启";
}

const MOCK_ASSETS: AgentAsset[] = [];

// ─── 统计图标 ─────────────────────────────────────────────────────────────────

function StatIcon({ type }: { type: "agent" | "risk" | "threat" }) {
  if (type === "agent") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.4375 2.1377C9.21415 2.1377 9.84375 2.76729 9.84375 3.54395V5.15625H14.4385C15.2151 5.15631 15.8447 5.78589 15.8447 6.5625V9.67383H16.5371C17.0031 9.67383 17.3809 10.0516 17.3809 10.5176C17.3807 10.9835 17.003 11.3613 16.5371 11.3613H15.8447V14.4375C15.8447 15.2141 15.2151 15.8437 14.4385 15.8438H3.55957C2.78303 15.8436 2.15332 15.2141 2.15332 14.4375V11.3613H1.46289C0.996982 11.3613 0.619273 10.9835 0.619141 10.5176C0.619141 10.0516 0.9969 9.67383 1.46289 9.67383H2.15332V6.5625C2.15332 5.78593 2.78303 5.15638 3.55957 5.15625H8.15625V3.8252H6.04688C5.58097 3.8252 5.20326 3.44732 5.20312 2.98145C5.20312 2.51546 5.58088 2.1377 6.04688 2.1377H8.4375ZM3.84082 14.1562H14.1572V6.84375H3.84082V14.1562ZM6.75 8.87109C7.21599 8.87109 7.59375 9.24885 7.59375 9.71484V11.29C7.59338 11.7557 7.21576 12.1338 6.75 12.1338C6.28424 12.1338 5.90662 11.7557 5.90625 11.29V9.71484C5.90625 9.24885 6.28401 8.87109 6.75 8.87109ZM11.25 8.87109C11.716 8.87109 12.0938 9.24885 12.0938 9.71484V11.29C12.0934 11.7557 11.7158 12.1338 11.25 12.1338C10.7842 12.1338 10.4066 11.7557 10.4062 11.29V9.71484C10.4062 9.24885 10.784 8.87109 11.25 8.87109Z" fill="url(#paint0_linear_stat_agent)"/>
        <defs>
          <linearGradient id="paint0_linear_stat_agent" x1="16" y1="16" x2="14" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0080FF"/>
            <stop offset="1" stopColor="#202020"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (type === "risk") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.03321 11.7588C9.49958 11.7592 9.87794 12.1371 9.87794 12.6035C9.8777 13.0698 9.49943 13.4479 9.03321 13.4482H9.0254C8.55886 13.4482 8.18091 13.07 8.18067 12.6035C8.18067 12.1368 8.55872 11.7588 9.0254 11.7588H9.03321Z" fill="url(#paint0_radial_stat_risk)"/>
        <path d="M9.0254 5.99707C9.49191 5.99727 9.87012 6.37524 9.87012 6.8418V9.72266C9.86998 10.1891 9.49182 10.5672 9.0254 10.5674C8.5588 10.5674 8.18081 10.1892 8.18067 9.72266V6.8418C8.18067 6.37512 8.55872 5.99707 9.0254 5.99707Z" fill="url(#paint1_radial_stat_risk)"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9.01758 1.66602C9.42181 1.66604 9.81969 1.77305 10.169 1.97656C10.517 2.17945 10.8047 2.47118 11.0039 2.82129L16.7647 12.9004L16.835 13.0332C16.9894 13.3467 17.0702 13.6922 17.0703 14.043C17.0704 14.4439 16.9649 14.8382 16.7647 15.1855C16.5645 15.5326 16.2764 15.8208 15.9297 16.0215C15.5826 16.2222 15.188 16.3287 14.7871 16.3291H3.26368C2.8635 16.3313 2.4691 16.2281 2.1211 16.0303C1.77116 15.8313 1.48028 15.543 1.27735 15.1953C1.07438 14.8474 0.966773 14.4516 0.965826 14.0488C0.964934 13.6459 1.07002 13.2493 1.27149 12.9004L7.03126 2.82129C7.23048 2.47094 7.51896 2.17953 7.86719 1.97656C8.21635 1.77312 8.61349 1.66609 9.01758 1.66602ZM9.01758 3.35547C8.91261 3.35554 8.80951 3.38376 8.71876 3.43652C8.62784 3.4895 8.55193 3.5657 8.50001 3.65723L8.49903 3.66016L2.73731 13.7422L2.7002 13.8164C2.67044 13.8886 2.6551 13.9664 2.65528 14.0449C2.65554 14.1498 2.68347 14.2531 2.73633 14.3438C2.78922 14.4343 2.86583 14.5097 2.95704 14.5615C3.04804 14.6131 3.15125 14.6395 3.25587 14.6387H14.7861L14.8633 14.6338C14.9405 14.6235 15.0152 14.5978 15.083 14.5586C15.1734 14.5063 15.2486 14.4313 15.3008 14.3408C15.3529 14.2504 15.3809 14.1474 15.3809 14.043C15.3808 13.9388 15.3528 13.8364 15.3008 13.7461L15.2988 13.7422L9.53712 3.66016L9.53614 3.65723C9.48424 3.56571 9.40828 3.48951 9.31739 3.43652C9.22651 3.38365 9.12273 3.35549 9.01758 3.35547Z" fill="url(#paint2_radial_stat_risk)"/>
        <defs>
          <radialGradient id="paint0_radial_stat_risk" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.36502 8.99707) scale(13.67 551.217)">
            <stop stopColor="#202020"/>
            <stop offset="1" stopColor="#0080FF"/>
          </radialGradient>
          <radialGradient id="paint1_radial_stat_risk" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.36502 8.99707) scale(13.67 551.217)">
            <stop stopColor="#202020"/>
            <stop offset="1" stopColor="#0080FF"/>
          </radialGradient>
          <radialGradient id="paint2_radial_stat_risk" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.36502 8.99707) scale(13.67 551.217)">
            <stop stopColor="#202020"/>
            <stop offset="1" stopColor="#0080FF"/>
          </radialGradient>
        </defs>
      </svg>
    );
  }
  // threat
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.15625 1.40625V0.84375C8.15625 0.619974 8.24514 0.405362 8.40338 0.247129C8.56161 0.0888948 8.77622 0 9 0C9.22378 0 9.43839 0.0888948 9.59662 0.247129C9.75486 0.405362 9.84375 0.619974 9.84375 0.84375V1.40625C9.84375 1.63003 9.75486 1.84464 9.59662 2.00287C9.43839 2.16111 9.22378 2.25 9 2.25C8.77622 2.25 8.56161 2.16111 8.40338 2.00287C8.24514 1.84464 8.15625 1.63003 8.15625 1.40625ZM14.0625 3.9375C14.1733 3.93759 14.2831 3.91584 14.3855 3.87349C14.488 3.83114 14.581 3.76903 14.6595 3.6907L15.222 3.1282C15.3004 3.04972 15.3627 2.95654 15.4052 2.854C15.4476 2.75145 15.4695 2.64154 15.4695 2.53055C15.4695 2.41955 15.4476 2.30964 15.4052 2.2071C15.3627 2.10455 15.3004 2.01138 15.222 1.93289C15.1435 1.85441 15.0503 1.79215 14.9477 1.74967C14.8452 1.7072 14.7353 1.68533 14.6243 1.68533C14.5133 1.68533 14.4034 1.7072 14.3008 1.74967C14.1983 1.79215 14.1051 1.85441 14.0266 1.93289L13.4641 2.49539C13.3454 2.6134 13.2645 2.76406 13.2317 2.92819C13.1988 3.09232 13.2155 3.26251 13.2797 3.41712C13.3438 3.57172 13.4525 3.70375 13.5919 3.79642C13.7313 3.88908 13.8951 3.93819 14.0625 3.9375ZM3.34055 3.6907C3.49906 3.84921 3.71404 3.93826 3.9382 3.93826C4.16237 3.93826 4.37735 3.84921 4.53586 3.6907C4.69437 3.53219 4.78342 3.31721 4.78342 3.09305C4.78342 2.86888 4.69437 2.6539 4.53586 2.49539L3.97336 1.93289C3.81485 1.77438 3.59987 1.68533 3.3757 1.68533C3.15154 1.68533 2.93656 1.77438 2.77805 1.93289C2.61954 2.0914 2.53049 2.30638 2.53049 2.53055C2.53049 2.75471 2.61954 2.96969 2.77805 3.1282L3.34055 3.6907ZM16.5938 12.375V14.0625C16.5938 14.4355 16.4456 14.7931 16.1819 15.0569C15.9181 15.3206 15.5605 15.4688 15.1875 15.4688H2.8125C2.43954 15.4688 2.08185 15.3206 1.81813 15.0569C1.55441 14.7931 1.40625 14.4355 1.40625 14.0625V12.375C1.40618 12.0508 1.51813 11.7366 1.72313 11.4854C1.92814 11.2343 2.21362 11.0617 2.53125 10.9969V9.84375C2.53125 8.12813 3.21278 6.48278 4.4259 5.26965C5.63903 4.05653 7.28438 3.375 9 3.375H9.04992C12.5859 3.40172 15.4688 6.33516 15.4688 9.91406V10.9969C15.7864 11.0617 16.0719 11.2343 16.2769 11.4854C16.4819 11.7366 16.5938 12.0508 16.5938 12.375ZM4.21875 9.84375V10.9688H13.7812V9.91406C13.7812 7.25836 11.6529 5.08219 9.03656 5.0625H9C7.73193 5.0625 6.5158 5.56624 5.61915 6.4629C4.72249 7.35955 4.21875 8.57568 4.21875 9.84375ZM14.9062 12.6562H3.09375V13.7812H14.9062V12.6562ZM9.59062 7.965C9.89322 8.06007 10.1684 8.22684 10.3926 8.45111C10.6169 8.67539 10.7837 8.95053 10.8787 9.25313C10.9459 9.46665 11.0951 9.64475 11.2935 9.74826C11.492 9.85177 11.7234 9.87221 11.937 9.80508C12.1505 9.73794 12.3286 9.58874 12.4321 9.39029C12.5356 9.19184 12.556 8.96039 12.4889 8.74687C12.3123 8.1854 12.0027 7.67486 11.5865 7.25865C11.1703 6.84244 10.6598 6.53287 10.0983 6.35625C9.88476 6.28912 9.65332 6.30955 9.45487 6.41307C9.25641 6.51658 9.10721 6.69468 9.04008 6.9082C8.97295 7.12172 8.99338 7.35317 9.09689 7.55162C9.2004 7.75007 9.37851 7.89927 9.59203 7.96641L9.59062 7.965Z" fill="url(#paint0_radial_stat_threat)"/>
      <defs>
        <radialGradient id="paint0_radial_stat_threat" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.40625 7.73437) scale(15.1875 685.349)">
          <stop stopColor="#202020"/>
          <stop offset="1" stopColor="#0080FF"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─── 威胁告警面板 ─────────────────────────────────────────────────────────────

function ThreatAlertPanel() {
  const [subTab, setSubTab] = useState("high-danger");
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
      {/* 子 Tab + 操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="claw-outline" size="claw">
            标记已处理
          </Button>
          <Button variant="claw-outline" size="claw">
            更多操作 ▾
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Segment value={subTab} onValueChange={setSubTab}>
            <SegmentList>
              <SegmentItem value="high-danger">高危命令（0）</SegmentItem>
              <SegmentItem value="malicious-req">恶意请求（0）</SegmentItem>
            </SegmentList>
          </Segment>
          <Select defaultValue="pending">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="resolved">已处理</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部等级</SelectItem>
              <SelectItem value="high">高危</SelectItem>
              <SelectItem value="medium">中危</SelectItem>
              <SelectItem value="low">低危</SelectItem>
            </SelectContent>
          </Select>
          <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-[#737373]" />
          </button>
        </div>
      </div>

      {/* 表格 */}
      <SurfaceCard className="overflow-hidden">
        <Table autoFixedColumns={false}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>告警名称</TableHead>
              <TableHead>威胁等级</TableHead>
              <TableHead>命中策略</TableHead>
              <TableHead>AI Agent/调用模型</TableHead>
              <TableHead>命令内容</TableHead>
              <TableHead>发生时间 ↓</TableHead>
              <TableHead>处理时间</TableHead>
              <TableHead>处理状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={10} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center text-[#A3A3A3]">
                  <span className="text-sm">暂无数据</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </SurfaceCard>

      <div className="mt-3 text-xs text-[#A3A3A3]">共 0 条记录</div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function SecurityManagement() {
  const [activeTab, setActiveTab] = useState("agent-config");
  const [refreshing, setRefreshing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="page-enter">
      {/* 页面标题区 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">AI Agent安全</h1>
          <Button variant="link" onClick={() => setShowGuide((v) => !v)} className="gap-1.5 shrink-0">
            功能使用说明
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGuide ? "rotate-180" : "rotate-0"}`} />
          </Button>
        </div>
        <p className="text-sm text-[#737373] mt-1">
          帮助组织梳理企业AI Agent资产的风险态势，管控策略生效情况及审计记录，让你在"项目→一对一→可信赖"的环节下，安全引入并持续管理AI Agent。（已支持 OpenClaw，其他 Agent 去程管理操作）
        </p>
      </div>

      {/* 说明卡片 */}
      {showGuide && (
        <SurfaceCard className="p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0A0A0A]">什么是 AI Agent安全？</h3>
            <button onClick={() => setShowGuide(false)} className="text-xs text-[#355EF1] hover:underline shrink-0">
              隐藏说明
            </button>
          </div>
          <p className="text-xs text-[#737373] leading-relaxed mb-2">
            帮助快速识别环境中运行 AI Agent / 调用大模型的资产，将这些资产的风险告警、管控策略生效情况与审计记录集中呈现，让你在"可见—可控—可追溯"的闭环下，安全引入并持续使用 Agent。&nbsp;&nbsp;
            <a href="#" className="text-[#355EF1] font-medium hover:underline">说明文档</a>
          </p>
          <ul className="text-xs text-[#737373] leading-relaxed list-disc pl-4 space-y-1">
            <li><span className="font-medium text-[#0A0A0A]">资产可见：</span>自动识别 AI Agent 资产（运行 AI Agent 或通过网络请求调用大模型的资产），生成统一资产清单，支持按 Agent 类型/业务/资产组快速管理。</li>
            <li><span className="font-medium text-[#0A0A0A]">风险可控：</span>围绕 Agent 资产聚合网络、OpenClaw层关键告警，支持按威胁等级/时间/资产/来源归因筛选与排序，快速锁定"最需优先处置"的风险点。</li>
          </ul>
        </SurfaceCard>
      )}

      {/* 统计指标卡片 */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {STAT_CARDS.map((card, index) => (
          <SurfaceCard key={index} className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-1">
              <StatIcon type={card.icon} />
              <span className="text-sm font-medium text-[#0A0A0A]">{card.label}</span>
              {card.hasTooltip && (
                <UITooltip>
                  <UITooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-[#A3A3A3] cursor-help" />
                  </UITooltipTrigger>
                  <UITooltipContent>
                    <p>检测到存在安全风险或告警的 AI Agent 资产数量</p>
                  </UITooltipContent>
                </UITooltip>
              )}
            </div>
            <StatNumber>{card.value.toLocaleString()}</StatNumber>
          </SurfaceCard>
        ))}
      </div>

      {/* Tab 标签页 — 黑色下划线 tabs */}
      <Segment value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <div className="flex gap-6 border-b border-[#dbe6ff] flex-1">
            {[
              { value: "agent-config", label: "AI Agent配置" },
              { value: "control-config", label: "管控配置" },
              { value: "audit-log", label: "审计日志" },
              { value: "malicious-skills", label: "恶意Skills" },
              { value: "threat-alert", label: "威胁告警" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.value
                    ? "text-[#0A0A0A] border-[#0A0A0A]"
                    : "text-[#A3A3A3] border-transparent hover:text-[#525252]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pl-16">
            <Button variant="claw-primary" size="claw" onClick={() => setShowConfigDialog(true)}>
              防护版本配置
            </Button>
          </div>
        </div>

        <SegmentContent value="agent-config">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
          {/* 操作栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="claw-outline" size="claw">
                筛选资产
              </Button>
              <Button variant="claw-outline" size="claw" disabled>
                批量开启防护
              </Button>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-[#737373] ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* 数据表格 */}
          <SurfaceCard className="overflow-hidden">
            <Table autoFixedColumns={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox />
                  </TableHead>
                  <TableHead>AI Agent/调用模型</TableHead>
                  <TableHead>Skills数据</TableHead>
                  <TableHead>告警（高危命令/恶意请求）</TableHead>
                  <TableHead>识别时间</TableHead>
                  <TableHead>识别来源</TableHead>
                  <TableHead>OpenClaw版本</TableHead>
                  <TableHead>内网管控</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ASSETS.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-[#A3A3A3]">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 opacity-40">
                          <rect x="8" y="12" width="32" height="24" rx="2" stroke="#D4D4D4" strokeWidth="2"/>
                          <line x1="8" y1="18" x2="40" y2="18" stroke="#D4D4D4" strokeWidth="2"/>
                          <line x1="16" y1="12" x2="16" y2="36" stroke="#D4D4D4" strokeWidth="1.5"/>
                        </svg>
                        <span className="text-sm">暂无数据</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  MOCK_ASSETS.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-[#0A0A0A]">{asset.agentName}</div>
                          <div className="text-xs text-[#737373]">{asset.model}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{asset.skillsCount}</TableCell>
                      <TableCell className="text-sm">
                        {asset.alertHighDanger}/{asset.alertMalicious}
                      </TableCell>
                      <TableCell className="text-sm text-[#737373]">{asset.identifyTime}</TableCell>
                      <TableCell className="text-sm text-[#737373]">{asset.identifySource}</TableCell>
                      <TableCell className="text-sm">{asset.openClawVersion}</TableCell>
                      <TableCell className="text-sm">{asset.intranetControl}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-[#355EF1]">
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </SurfaceCard>

          {/* 分页 */}
          <div className="mt-3 text-xs text-[#A3A3A3]">
            共 {MOCK_ASSETS.length} 条记录
          </div>
          </div>
        </SegmentContent>

        <SegmentContent value="control-config">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="claw-outline" size="claw">新增策略</Button>
                <Button variant="claw-outline" size="claw">批量操作 ▾</Button>
              </div>
              <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-[#737373]" />
              </button>
            </div>
            <SurfaceCard className="overflow-hidden">
              <Table autoFixedColumns={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox /></TableHead>
                    <TableHead>策略名称</TableHead>
                    <TableHead>策略类型</TableHead>
                    <TableHead>关联 Agent</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-[#A3A3A3]">
                        <span className="text-sm">暂无数据</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </SurfaceCard>
            <div className="mt-3 text-xs text-[#A3A3A3]">共 0 条记录</div>
          </div>
        </SegmentContent>

        <SegmentContent value="audit-log">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="claw-outline" size="claw">导出日志</Button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all-type">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-type">全部类型</SelectItem>
                    <SelectItem value="chat">对话记录</SelectItem>
                    <SelectItem value="tool">工具调用</SelectItem>
                    <SelectItem value="system">系统行为</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">最近7天</SelectItem>
                    <SelectItem value="30d">最近30天</SelectItem>
                    <SelectItem value="all">全部</SelectItem>
                  </SelectContent>
                </Select>
                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-[#737373]" />
                </button>
              </div>
            </div>
            <SurfaceCard className="overflow-hidden">
              <Table autoFixedColumns={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead>操作时间</TableHead>
                    <TableHead>AI Agent</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>操作内容</TableHead>
                    <TableHead>操作人/来源</TableHead>
                    <TableHead>风险等级</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-[#A3A3A3]">
                        <span className="text-sm">暂无数据</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </SurfaceCard>
            <div className="mt-3 text-xs text-[#A3A3A3]">共 0 条记录</div>
          </div>
        </SegmentContent>

        <SegmentContent value="malicious-skills">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="claw-outline" size="claw">立即扫描</Button>
                <Button variant="claw-outline" size="claw">批量处理 ▾</Button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all-status">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">全部状态</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="resolved">已处理</SelectItem>
                    <SelectItem value="ignored">已忽略</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-risk">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-risk">全部风险等级</SelectItem>
                    <SelectItem value="high">高危</SelectItem>
                    <SelectItem value="medium">中危</SelectItem>
                    <SelectItem value="low">低危</SelectItem>
                  </SelectContent>
                </Select>
                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-[#737373]" />
                </button>
              </div>
            </div>
            <SurfaceCard className="overflow-hidden">
              <Table autoFixedColumns={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox /></TableHead>
                    <TableHead>Skill 名称</TableHead>
                    <TableHead>风险类型</TableHead>
                    <TableHead>风险等级</TableHead>
                    <TableHead>关联 Agent</TableHead>
                    <TableHead>发现时间</TableHead>
                    <TableHead>处理状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-[#A3A3A3]">
                        <span className="text-sm">暂无数据</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </SurfaceCard>
            <div className="mt-3 text-xs text-[#A3A3A3]">共 0 条记录</div>
          </div>
        </SegmentContent>

        <SegmentContent value="threat-alert">
          <ThreatAlertPanel />
        </SegmentContent>
      </Segment>

      {/* 防护版本配置弹窗 */}
      {showConfigDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConfigDialog(false)}>
          <div className="bg-white rounded-[4px] w-[720px] max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#737373]" />
                <h2 className="text-base font-bold text-[#0A0A0A]">防护版本配置</h2>
              </div>
              <button onClick={() => setShowConfigDialog(false)} className="text-[#737373] hover:text-[#0A0A0A] text-xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-xs text-[#737373] mb-5">配置防护版本的自动化策略，开启后系统将自动执行相关操作。</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "自动续费", enabled: true },
                  { label: "自动加购", enabled: false },
                  { label: "自动绑定", enabled: true },
                  { label: "自动缩容", enabled: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded">
                    <span className="text-sm text-[#0A0A0A]">{item.label}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={item.enabled ? "text-[#355EF1] font-medium" : "text-[#737373]"}>● {item.enabled ? "已开启" : "已开启"}</span>
                      <span className="text-[#737373]">关闭</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.5 10.5h-1v-4h1v4zm0-5.25h-1V5h1v1.25z" fill="#F97316"/></svg>
                  <span className="text-sm font-bold text-[#0A0A0A]">配额信息</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded mb-3">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 100 14A7 7 0 008 1z" fill="#355EF1"/></svg>
                    <span className="text-sm font-medium text-[#0A0A0A]">AI防护版配额 #1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-5 bg-[#355EF1] rounded-full relative"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                      <span className="text-xs text-[#737373]">自动续费</span>
                    </div>
                    <a href="#" className="text-xs text-[#355EF1] hover:underline">查看详情</a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4">
                  <div>
                    <div className="text-xs text-[#737373] mb-1">配额数量</div>
                    <div className="text-sm font-medium text-[#0A0A0A]">141 / 141 已使用</div>
                    <div className="h-1.5 bg-[#E5E5E5] rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#F97316] rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#737373] mb-1">防护有效期</div>
                    <div className="text-sm text-[#0A0A0A]">2026-05-22 15:09:41 ~ 2026-06-22 15:09:41</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200">
              <Button variant="claw-outline" onClick={() => setShowConfigDialog(false)}>取消</Button>
              <Button variant="claw-primary" onClick={() => setShowConfigDialog(false)}>保存配置</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
