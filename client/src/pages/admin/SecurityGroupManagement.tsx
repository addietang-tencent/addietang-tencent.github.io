/**
 * SecurityGroupManagement - 管控端网络管理页
 * 采用 Tab 结构：私有网络和子网、安全组、公网、更多功能
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Info, Zap, Globe, Link, RefreshCw, Network, ExternalLink, Wifi, Lock, Loader2, Check, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

// 迁移影响范围 Mock 数据
const MIGRATION_INSTANCES = [
  { user: "alice@acompany.com",  instance: "openclaw-alice-01",  currentNet: "vpc-aa1 / subnet-aa1", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", status: "运行中" },
  { user: "alice@acompany.com",  instance: "openclaw-alice-02",  currentNet: "vpc-aa1 / subnet-aa1", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", status: "运行中" },
  { user: "bob@acompany.com",    instance: "openclaw-bob-01",    currentNet: "vpc-bb2 / subnet-bb2", targetNet: "vpc-jp7fjg13 / subnet-gz6-001", status: "运行中" },
  { user: "carol@acompany.com",  instance: "openclaw-carol-01", currentNet: "vpc-cc3 / subnet-cc3", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", status: "已停止" },
  { user: "carol@acompany.com",  instance: "openclaw-carol-02", currentNet: "vpc-cc3 / subnet-cc3", targetNet: "vpc-jp7fjg13 / subnet-gz6-001", status: "运行中" },
  { user: "dave@acompany.com",   instance: "openclaw-dave-01",  currentNet: "vpc-dd4 / subnet-dd4", targetNet: "vpc-jp7fjg13 / subnet-gz7-001", status: "运行中" },
  { user: "eve@acompany.com",    instance: "openclaw-eve-01",   currentNet: "vpc-ee5 / subnet-ee5", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", status: "运行中" },
  { user: "frank@acompany.com",  instance: "openclaw-frank-01", currentNet: "vpc-ff6 / subnet-ff6", targetNet: "vpc-jp7fjg13 / subnet-gz6-001", status: "运行中" },
];

const DEFAULT_INBOUND = [
  { id: "1", source: "0.0.0.0/0", protocol: "ICMP", port: "ALL", policy: "允许", remark: "放通 Ping 服务" },
  { id: "2", source: "::/0", protocol: "ICMPv6", port: "ALL", policy: "允许", remark: "放通 Ping 服务（IPv6）" },
  { id: "3", source: "0.0.0.0/0", protocol: "TCP", port: "22", policy: "允许", remark: "放通 Linux SSH 登录" },
  { id: "4", source: "::/0", protocol: "TCP", port: "22", policy: "允许", remark: "放通 Linux SSH 登录（IPv6）" },
  { id: "5", source: "0.0.0.0/0", protocol: "TCP", port: "3389", policy: "允许", remark: "放通 Windows 远程登录" },
  { id: "6", source: "::/0", protocol: "TCP", port: "3389", policy: "允许", remark: "放通 Windows 远程登录（IPv6）" },
  { id: "7", source: "10.0.0.0/8", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通内网（云私有网络）" },
  { id: "8", source: "172.16.0.0/12", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通内网（云私有网络）" },
  { id: "9", source: "192.168.0.0/16", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通内网（云私有网络）" },
  { id: "10", source: "0.0.0.0/0", protocol: "TCP", port: "80", policy: "允许", remark: "Web 服务 HTTP（Apache、Nginx 等）" },
  { id: "11", source: "0.0.0.0/0", protocol: "TCP", port: "443", policy: "允许", remark: "Web 服务 HTTPS（Apache、Nginx 等）" },
  { id: "12", source: "0.0.0.0/0", protocol: "TCP", port: "18789", policy: "允许", remark: "OpenClaw 服务端口" },
  { id: "13", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

const DEFAULT_OUTBOUND = [
  { id: "1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
  { id: "2", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

// 系统分配的可用区
const AVAILABLE_ZONES = ["广州五区", "广州六区", "广州七区"];

// 系统自动分配的 VPC（模拟后端返回的实际生效资源）
const AUTO_ASSIGNED_VPC = { id: "vpc-jp7fjg13", name: "clawpro/default-vpc", cidr: "10.0.0.0/16" };

// 系统自动分配的子网（按可用区，模拟后端返回的实际生效资源）
const AUTO_ASSIGNED_SUBNETS: Record<string, { id: string; name: string; cidr: string }> = {
  "广州五区": { id: "subnet-gz5-001", name: "clawpro/ap-guangzhou-5", cidr: "10.0.1.0/24" },
  "广州六区": { id: "subnet-gz6-001", name: "clawpro/ap-guangzhou-6", cidr: "10.0.2.0/24" },
  "广州七区": { id: "subnet-gz7-001", name: "clawpro/ap-guangzhou-7", cidr: "10.0.3.0/24" },
};

// Mock VPC 列表
const MOCK_VPCS = [
  { id: "vpc-jp7fjg13", name: "auto_test_vpc_2", cidr: "10.1.0.0/16" },
  { id: "vpc-9lyx5t8h", name: "CHC-带外", cidr: "192.168.0.0/16" },
  { id: "vpc-ri7mmw6n", name: "CHC-部署", cidr: "192.168.0.0/16" },
  { id: "vpc-ab3cd4ef", name: "企业内网", cidr: "172.16.0.0/12" },
];

// Mock 子网列表（按 VPC ID 过滤）
const MOCK_SUBNETS: Record<string, { id: string; name: string; cidr: string }[]> = {
  "vpc-jp7fjg13": [
    { id: "subnet-f7t69gji", name: "lb_auto_test_subnet", cidr: "10.1.0.0/24" },
    { id: "subnet-h8u80hkj", name: "lb_auto_test_subnet_2", cidr: "10.1.1.0/24" },
  ],
  "vpc-9lyx5t8h": [
    { id: "subnet-gaclgbzu", name: "带外管理", cidr: "192.168.20.0/24" },
  ],
  "vpc-ri7mmw6n": [
    { id: "subnet-mn3op5qr", name: "部署子网A", cidr: "192.168.1.0/24" },
    { id: "subnet-st6uv7wx", name: "部署子网B", cidr: "192.168.2.0/24" },
  ],
  "vpc-ab3cd4ef": [
    { id: "subnet-yz9ab1cd", name: "企业内网子网", cidr: "172.16.1.0/24" },
  ],
};

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

type Rule = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  policy: string;
  remark: string;
};

type NetworkConfig = {
  vpcId: string;
  zoneSubnets: Record<string, string>;
};

// ─── Tab 定义 ──────────────────────────────────────────────

const TABS = [
  {
    id: "vpc",
    label: "私有网络和子网",
    description: "配置 OpenClaw 云服务器的私有网络和子网部署策略。",
  },
  {
    id: "security",
    label: "安全组",
    description: "配置 OpenClaw 云服务器的入站与出站规则，管控网络流量策略。",
  },
  {
    id: "public",
    label: "公网",
    description: "配置 OpenClaw 云服务器的公网 IP 和带宽策略。",
  },
  {
    id: "coming",
    label: "更多功能",
    description: "更多功能即将上线。",
  },
];

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export default function SecurityGroupManagement() {
  const [activeTab, setActiveTab] = useState("security");
  // 安全组状态
  const [inboundRules, setInboundRules] = useState<Rule[]>(DEFAULT_INBOUND);
  const [outboundRules, setOutboundRules] = useState<Rule[]>(DEFAULT_OUTBOUND);
  const [securityTab, setSecurityTab] = useState<"outbound" | "inbound">("outbound");

  // 用户端访问 OpenClaw 面板开关 - 持久化到 localStorage
  const [allowPanelAccess, setAllowPanelAccess] = useState(() => {
    return localStorage.getItem("admin_allow_panel_access") === "true";
  });
  const [panelPort, setPanelPort] = useState<string | null>(() => {
    return localStorage.getItem("admin_panel_port");
  });
  const [panelAccessLoading, setPanelAccessLoading] = useState(false);

  // VPC 和子网配置状态
  const INITIAL_NETWORK_CONFIG: NetworkConfig = { vpcId: "", zoneSubnets: {} };
  const [config, setConfig] = useState<NetworkConfig>(INITIAL_NETWORK_CONFIG);
  const [savedConfig, setSavedConfig] = useState<NetworkConfig>(INITIAL_NETWORK_CONFIG); // 上次保存的快照
  const [isDirty, setIsDirty] = useState(false);
  const [showVpcSaveDialog, setShowVpcSaveDialog] = useState(false);
  const [refreshingVpc, setRefreshingVpc] = useState(false);
  const [refreshingZone, setRefreshingZone] = useState<string | null>(null);
  // Combobox 搜索状态
  const [vpcOpen, setVpcOpen] = useState(false);
  const [vpcSearch, setVpcSearch] = useState("");
  const [subnetOpen, setSubnetOpen] = useState<Record<string, boolean>>({});
  const [subnetSearch, setSubnetSearch] = useState<Record<string, string>>({});

  // 旧模式 / 迁移状态
  const [isLegacyMode, setIsLegacyMode] = useState(true); // true = 旧模式（每个用户单独分配）
  const [showMigrationConfirm, setShowMigrationConfirm] = useState(false);
  const [showMigrationProgress, setShowMigrationProgress] = useState(false);
  const [migrationStep, setMigrationStep] = useState(0); // 0=未开始, 1-4=各步骤
  const [migrationDone, setMigrationDone] = useState(false);
  const [confirmTableExpanded, setConfirmTableExpanded] = useState(false); // 确认弹窗明细表展开
  const [migrationRunningInBg, setMigrationRunningInBg] = useState(false); // 迁移后台运行中（弹窗已隐藏）
  // 迁移执行弹窗中每个实例的任务状态
  type InstanceTaskStatus = "待执行" | "进行中" | "已完成" | "失败";
  type InstanceTask = {
    user: string;
    instance: string;
    currentStep: string;
    status: InstanceTaskStatus;
    failReason?: string;
  };
  const [instanceTasks, setInstanceTasks] = useState<InstanceTask[]>(
    MIGRATION_INSTANCES.map(m => ({ user: m.user, instance: m.instance, currentStep: "确认网络配置", status: "待执行" }))
  );

  // 公网配置状态
  const INITIAL_PUBLIC_CONFIG = { assignPublicIp: true, billingMode: "monthly" as "monthly" | "traffic", bandwidth: 5 };
  const [publicConfig, setPublicConfig] = useState(INITIAL_PUBLIC_CONFIG);
  const [savedPublicConfig, setSavedPublicConfig] = useState(INITIAL_PUBLIC_CONFIG);
  const [isPublicDirty, setIsPublicDirty] = useState(false);

  // 编辑规则状态
  const [editingRule, setEditingRule] = useState<{ id: string; type: "inbound" | "outbound" } | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Rule>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ id: string; type: "inbound" | "outbound" } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<"inbound" | "outbound" | null>(null);
  const [addRuleTab, setAddRuleTab] = useState<"template" | "custom">("template"); // 入站弹窗内 tab
  const [addDraft, setAddDraft] = useState<Partial<Rule>>({});

  // ── VPC 和子网处理函数 ──
  const handleVpcChange = (val: string) => {
    // val: "auto" 表示自动分配，其他为具体 vpc id
    setConfig((prev) => {
      const updatedZoneSubnets: Record<string, string> = {};
      if (val === "auto") {
        // 切换回自动分配：所有可用区子网全部重置为「自动分配」，并禁用交互
        AVAILABLE_ZONES.forEach((zone) => {
          updatedZoneSubnets[zone] = "auto";
        });
      } else {
        // 切换到具体 VPC：所有可用区子网全部重置为「不分配」
        AVAILABLE_ZONES.forEach((zone) => {
          updatedZoneSubnets[zone] = "none";
        });
      }
      return { ...prev, vpcId: val, zoneSubnets: updatedZoneSubnets };
    });
    setIsDirty(true);
  };

  const handleSubnetChange = (zone: string, val: string) => {
    // val: "auto" / "none" / 具体 subnet id
    setConfig((prev) => ({
      ...prev,
      zoneSubnets: { ...prev.zoneSubnets, [zone]: val },
    }));
    setIsDirty(true);
  };

  const handleRefreshVpc = () => {
    setRefreshingVpc(true);
    setTimeout(() => setRefreshingVpc(false), 1000);
  };

  const handleRefreshZone = (zone: string) => {
    setRefreshingZone(zone);
    setTimeout(() => setRefreshingZone(null), 1000);
  };

  const handleDiscard = () => {
    setConfig(savedConfig); // 还原到上次保存的快照
    setIsDirty(false);
  };

  const handleSaveVpc = () => {
    setSavedConfig(config); // 保存当前配置为快照
    toast.success("VPC 和子网配置已保存");
    setShowVpcSaveDialog(false);
    setIsDirty(false);
  };

  const hasAtLeastOneSubnet = Object.values(config.zoneSubnets).some(
    (v) => v !== undefined && v !== "none"
  );

  // ── 公网配置处理函数 ──
  const handleBillingModeChange = (mode: "monthly" | "traffic") => {
    setPublicConfig((prev) => ({
      ...prev,
      billingMode: mode,
      bandwidth: Math.min(prev.bandwidth, mode === "monthly" ? 2000 : 200),
    }));
    setIsPublicDirty(true);
  };

  const handlePublicSave = () => {
    setSavedPublicConfig(publicConfig);
    setIsPublicDirty(false);
    toast.success("公网配置已保存");
  };

  const handlePublicDiscard = () => {
    setPublicConfig(savedPublicConfig);
    setIsPublicDirty(false);
  };

  // ── 规则表格内容组件（不包含卡片外层）──
  function RuleTableBody({ rules, type }: { rules: Rule[]; type: "inbound" | "outbound" }) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-3 text-left font-medium text-gray-600">{type === "inbound" ? "来源" : "目标"}</th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">协议</th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">端口</th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">策略</th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">备注</th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">{rule.source}</td>
              <td className="px-6 py-3 text-gray-700">{rule.protocol}</td>
              <td className="px-6 py-3 text-gray-700">{rule.port}</td>
              <td className="px-6 py-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${rule.policy === "允许" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {rule.policy}
                </span>
              </td>
              <td className="px-6 py-3 text-gray-700">{rule.remark || "—"}</td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRule({ id: rule.id, type });
                      setEditDraft(rule);
                    }}
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                    title="编辑"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (type === "inbound") setInboundRules((prev) => prev.filter((r) => r.id !== rule.id));
                      else setOutboundRules((prev) => prev.filter((r) => r.id !== rule.id));
                      toast.success("规则已删除");
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const availableSubnets = config.vpcId ? (MOCK_SUBNETS[config.vpcId] ?? []) : [];
  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <>
      <div className="page-enter max-w-5xl">

        {/* 页头 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">网络管理</h1>
        </div>

        {/* Tab 切换器 */}
        <div className="flex items-center gap-1 mb-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
        <p className="text-sm text-gray-500 mt-3 mb-6 leading-relaxed">{currentTab.description}</p>

        {/* Tab 内容 */}
        {activeTab === "security" && (
        <div>
          {/* 统一提示说明 */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">出站规则为空时，所有出站流量将被拒绝，可能导致用户无法使用 OpenClaw；修改规则后对所有 OpenClaw 云服务器立即生效，请谨慎操作。</p>
          </div>

          {/* 统一规则卡片 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            {/* 卡片顶部工具栏：Tab 切换 + 添加按钮 */}
            <div className="flex items-center justify-between px-6 border-b border-gray-100" style={{ minHeight: "52px" }}>
              <div className="flex items-center gap-0">
                {(["outbound", "inbound"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSecurityTab(t)}
                    className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      securityTab === t
                        ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "outbound" ? "出站规则" : "入站规则"}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={() => setShowAddDialog(securityTab)} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-3.5 h-3.5" />
                添加规则
              </Button>
            </div>
            {/* 表格内容 */}
            <RuleTableBody rules={securityTab === "outbound" ? outboundRules : inboundRules} type={securityTab} />
          </div>

        </div>
        )}

        {activeTab === "vpc" && (
        <div>
          {/* 旧模式黄色提示条 */}
          {isLegacyMode && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-800 leading-relaxed">
                  {migrationRunningInBg
                    ? <>迁移任务正在后台运行中，单击<button onClick={() => setMigrationRunningInBg(false)} className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors mx-0.5">查看详情</button>可查看运行情况。</>
                    : <>当前企业仍按"每个用户单独分配私有网络"的旧方式运行。为减少网络资源占用并统一企业网络配置，建议切换为"企业内用户共享同一网络"的新方式。单击<button onClick={() => setShowMigrationConfirm(true)} className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors mx-0.5">查看详情</button>可查看迁移影响，并确认是否迁移。</>}
                </p>
              </div>
            </div>
          )}

          {/* 说明文字区域 */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <ul className="text-xs text-blue-700 leading-relaxed space-y-1.5">
              <li className="flex gap-1.5">
                <span className="shrink-0">•</span>
                <span><span className="font-medium">私有网络（VPC）：</span>选择「自动分配」时，系统会为企业统一分配 VPC，所有用户创建的 OpenClaw 云服务器将默认共享该 VPC；您也可以选择其他已有 VPC，作为企业统一使用的 VPC。</span>
              </li>
              <li className="flex gap-1.5">
                <span className="shrink-0">•</span>
                <span><span className="font-medium">子网：</span>选择「自动分配」 VPC 时，系统会将 OpenClaw 云服务器随机部署到系统分配可用区的子网下；您也可选择其他的 VPC 下的子网，或选择「不分配」跳过该可用区部署。</span>
              </li>
              <li className="flex gap-1.5">
                <span className="shrink-0">•</span>
                <span>如需限制实例间的内网互访，请将安全策略设置为内网不互通，以实现 OpenClaw 云服务器间的隔离。</span>
              </li>
            </ul>
          </div>

          {/* VPC / 子网配置卡片 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-6 border-b border-gray-100" style={{ minHeight: "56px" }}>
              <span className="text-sm font-semibold text-gray-800">私有网络与子网配置</span>
              {isDirty && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    className="h-7 px-3 text-xs text-gray-500"
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // 校验是否至少有一个可用区选择了子网
                      // 自动分配(""/undefined)和具体子网 ID 都算有效，只有 "none" 才算未选
                      const allNone = AVAILABLE_ZONES.every((z) => {
                        const v = config.zoneSubnets[z];
                        return v === "none";
                      });
                      if (allNone) {
                        toast.error("请至少选择一个子网");
                        return;
                      }
                      setShowVpcSaveDialog(true);
                    }}
                    className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    保存
                  </Button>
                </div>
              )}
            </div>

            {/* ── 私有网络区域 ── */}
            <div className="px-6 py-4 border-b border-gray-100">
              {/* 字段标题行 */}
              <div className="grid grid-cols-[100px_1fr_40px] gap-4 mb-2">
                <span className="text-xs font-medium text-gray-400">私有网络（VPC）</span>
                <span />
              </div>
              {/* VPC 数据行 */}
              <div className="grid grid-cols-[100px_1fr_40px] gap-4 items-center">
                {/* 左：地域 */}
                <span className="text-sm text-[oklch(0.707_0.022_261.325)]">全局</span>

                {/* 中： Combobox（自动分配 + 所有可选 VPC，支持关键字搜索） */}
                {(() => {
                  const currentVpc = MOCK_VPCS.find(v => v.id === config.vpcId);
                  const isAuto = !config.vpcId || config.vpcId === "auto";
                  const displayLabel = isAuto
                    ? "自动分配"
                    : currentVpc ? `${currentVpc.id} | ${currentVpc.name} | ${currentVpc.cidr}` : config.vpcId;
                  const filteredVpcs = vpcSearch
                    ? MOCK_VPCS.filter(v =>
                        `${v.id} ${v.name} ${v.cidr}`.toLowerCase().includes(vpcSearch.toLowerCase())
                      )
                    : MOCK_VPCS;
                  return (
                    <Popover open={vpcOpen} onOpenChange={(o) => { setVpcOpen(o); if (!o) setVpcSearch(""); }}>
                      <PopoverTrigger asChild>
                        <button
                          className={`h-9 w-full flex items-center justify-between px-3 rounded-md border border-gray-200 bg-white text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                            isAuto ? "text-[oklch(0.707_0.022_261.325)]" : "text-[oklch(0.446_0.03_256.802)]"
                          }`}
                        >
                          <span className="truncate">{displayLabel}</span>
                          <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 ml-2" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                        style={{ width: "var(--radix-popover-trigger-width)" }}
                        align="start"
                        sideOffset={4}
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="搜索 VPC…"
                            value={vpcSearch}
                            onValueChange={setVpcSearch}
                            className="text-sm"
                          />
                          <CommandList className="max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                            <CommandEmpty className="py-3 text-xs text-gray-400 text-center">未找到匹配的 VPC</CommandEmpty>
                            <CommandGroup>
                              {/* 自动分配选项：仅在无搜索关键字时显示 */}
                              {!vpcSearch && (
                                <CommandItem
                                  value="auto"
                                  onSelect={() => { handleVpcChange("auto"); setVpcOpen(false); setVpcSearch(""); }}
                                  className="text-[oklch(0.707_0.022_261.325)] cursor-pointer"
                                >
                                  <span className="flex-1">自动分配</span>
                                  {isAuto && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                </CommandItem>
                              )}
                              {filteredVpcs.map((vpc) => (
                                <CommandItem
                                  key={vpc.id}
                                  value={vpc.id}
                                  onSelect={() => { handleVpcChange(vpc.id); setVpcOpen(false); setVpcSearch(""); }}
                                  className="text-[oklch(0.446_0.03_256.802)] cursor-pointer"
                                >
                                  <span className="flex-1">{vpc.id} | {vpc.name} | {vpc.cidr}</span>
                                  {config.vpcId === vpc.id && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                })()}

                {/* 刷新按钮 */}
                <button
                  onClick={handleRefreshVpc}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
                  title="刷新私有网络列表"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingVpc ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* ── 子网区域 ── */}
            <div>
              {/* 字段标题行 */}
              <div className="grid grid-cols-[100px_1fr_40px] gap-4 px-6 py-2.5 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-400">系统分配可用区</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-300 hover:text-gray-400 cursor-default shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[240px] text-xs leading-relaxed">
                        系统自动选择的 OpenClaw 云服务器主力可用区，不可修改。可通过指定子网来规定云服务器部署在哪个可用区。
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xs font-medium text-gray-400">子网</span>
                <span />
              </div>

              {/* 每个可用区一行 */}
              {AVAILABLE_ZONES.map((zone, idx) => {
                const isRefreshing = refreshingZone === zone;
                const subnetVal = config.zoneSubnets[zone] ?? "auto";
                // 当前生效的 VPC ID：自动分配时用系统分配的 VPC
                const effectiveVpcId = (config.vpcId && config.vpcId !== "auto") ? config.vpcId : AUTO_ASSIGNED_VPC.id;
                const zoneSubnets = MOCK_SUBNETS[effectiveVpcId] ?? [];
                // VPC 是否为自动分配（子网禁用状态依赖此变量）
                const isAutoVpc = !config.vpcId || config.vpcId === "auto";

                return (
                  <div
                    key={zone}
                    className={`grid grid-cols-[100px_1fr_40px] gap-4 items-center px-6 py-3.5 ${
                      idx < AVAILABLE_ZONES.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    {/* 左：可用区 */}
                    <span className="text-sm text-gray-700">{zone}</span>

                    {/* 中： Combobox（支持关键字搜索） */}
                    {(() => {
                      const currentSubnet = zoneSubnets.find(s => s.id === subnetVal);
                      const subnetDisplayLabel =
                        subnetVal === "auto" ? "自动分配"
                        : subnetVal === "none" ? "不分配"
                        : currentSubnet ? `${currentSubnet.id} | ${currentSubnet.name} | ${currentSubnet.cidr}`
                        : subnetVal;
                      const isSpecialVal = subnetVal === "auto" || subnetVal === "none";
                      const sq = subnetSearch[zone] ?? "";
                      const filteredSubnets = sq
                        ? zoneSubnets.filter(s =>
                            `${s.id} ${s.name} ${s.cidr}`.toLowerCase().includes(sq.toLowerCase())
                          )
                        : zoneSubnets;
                      return (
                        <Popover
                          open={isAutoVpc ? false : !!subnetOpen[zone]}
                          onOpenChange={(o) => {
                            if (isAutoVpc) return;
                            setSubnetOpen(prev => ({ ...prev, [zone]: o }));
                            if (!o) setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              disabled={isAutoVpc}
                              className={`h-9 w-full flex items-center justify-between px-3 rounded-md border bg-white text-sm transition-colors ${
                                isAutoVpc
                                  ? "border-gray-100 bg-gray-50 text-[oklch(0.707_0.022_261.325)] opacity-60 cursor-not-allowed"
                                  : `border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                      isSpecialVal ? "text-[oklch(0.707_0.022_261.325)]" : "text-[oklch(0.446_0.03_256.802)]"
                                    }`
                              }`}
                            >
                              <span className="truncate">{subnetDisplayLabel}</span>
                              <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 ml-2" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0 shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                            style={{ width: "var(--radix-popover-trigger-width)" }}
                            align="start"
                            sideOffset={4}
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="搜索子网…"
                                value={sq}
                                onValueChange={(v) => setSubnetSearch(prev => ({ ...prev, [zone]: v }))}
                                className="text-sm"
                              />
                              <CommandList className="max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                                <CommandEmpty className="py-3 text-xs text-gray-400 text-center">未找到匹配的子网</CommandEmpty>
                                <CommandGroup>
                                  {/* 不分配：始终显示在最顶部（无搜索关键字时） */}
                                  {!sq && (
                                    <CommandItem
                                      value="none"
                                      onSelect={() => {
                                        handleSubnetChange(zone, "none");
                                        setSubnetOpen(prev => ({ ...prev, [zone]: false }));
                                        setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                                      }}
                                      className="text-[oklch(0.707_0.022_261.325)] cursor-pointer"
                                    >
                                      <span className="flex-1">不分配</span>
                                      {subnetVal === "none" && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                    </CommandItem>
                                  )}
                                  {/* 自动分配：仅 VPC 为自动分配且无搜索关键字时显示 */}
                                  {isAutoVpc && !sq && (
                                    <CommandItem
                                      value="auto"
                                      onSelect={() => {
                                        handleSubnetChange(zone, "auto");
                                        setSubnetOpen(prev => ({ ...prev, [zone]: false }));
                                        setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                                      }}
                                      className="text-[oklch(0.707_0.022_261.325)] cursor-pointer"
                                    >
                                      <span className="flex-1">自动分配</span>
                                      {subnetVal === "auto" && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                    </CommandItem>
                                  )}
                                  {filteredSubnets.map((subnet) => (
                                    <CommandItem
                                      key={subnet.id}
                                      value={subnet.id}
                                      onSelect={() => {
                                        handleSubnetChange(zone, subnet.id);
                                        setSubnetOpen(prev => ({ ...prev, [zone]: false }));
                                        setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                                      }}
                                      className="text-[oklch(0.446_0.03_256.802)] cursor-pointer"
                                    >
                                      <span className="flex-1">{subnet.id} | {subnet.name} | {subnet.cidr}</span>
                                      {subnetVal === subnet.id && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      );
                    })()}

                    {/* 刷新按鈕 */}
                    <button
                      onClick={() => handleRefreshZone(zone)}
                      disabled={isAutoVpc}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                        isAutoVpc
                          ? "border-gray-100 text-gray-300 opacity-60 cursor-not-allowed"
                          : "border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300"
                      }`}
                      title="刷新子网列表"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 底部提示文案 */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500 leading-relaxed">
                如现有私有网络/子网不符合要求，可以去腾讯云控制台{" "}
                <a
                  href="https://console.cloud.tencent.com/vpc/vpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
                >
                  新建私有网络
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
                {" "}或{" "}
                <a
                  href="https://console.cloud.tencent.com/vpc/subnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
                >
                  新建子网
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
                。
              </p>
            </div>
          </div>
        </div>
        )}

        {activeTab === "public" && (
        <div>
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">公网配置</span>
              {isPublicDirty && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePublicDiscard}>取消</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePublicSave}>保存</Button>
                </div>
              )}
            </div>

            {/* ── 是否分配公网 IP ── */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">是否分配公网 IP</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="!max-w-none w-96 text-xs leading-relaxed text-justify">
                      云服务器需要外网访问能力的时候，需要为云服务器分配公网IP，如果云服务器不分配公网IP，则不支持外出流量，并且无法使用外网IP对外进行互相通信。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignPublicIp"
                    checked={publicConfig.assignPublicIp === true}
                    onChange={() => { setPublicConfig((prev) => ({ ...prev, assignPublicIp: true })); setIsPublicDirty(true); }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">分配</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignPublicIp"
                    checked={publicConfig.assignPublicIp === false}
                    onChange={() => { setPublicConfig((prev) => ({ ...prev, assignPublicIp: false })); setIsPublicDirty(true); }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">不分配</span>
                </label>
              </div>
            </div>

            {/* 带宽计费模式 + 带宽上限（分配公网 IP 时才显示） */}
            {publicConfig.assignPublicIp && (
              <>
                {/* 带宽计费模式 */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">带宽计费模式</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm text-xs leading-relaxed space-y-2">
                          <p><span className="font-semibold">包月带宽：</span>包月的固定带宽是指定公网出方向的带宽的大小，选择单台服务器最大带宽値。固定带宽，流量单价相对于按使用流量的计费方式所使用的费用低，适合网络带宽使用稳定的用户。</p>
                          <p><span className="font-semibold">按流量计费：</span>使用流量是指服务器使用过程中产生的流量大小，网络费用仅取决于云服务器的出流量。为了防止突然爆发的流量产生较高的费用，可选择设置一个带宽上限，带宽上限对于网络单价完全无影响。</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billingMode"
                        checked={publicConfig.billingMode === "monthly"}
                        onChange={() => handleBillingModeChange("monthly")}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">包月带宽</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billingMode"
                        checked={publicConfig.billingMode === "traffic"}
                        onChange={() => handleBillingModeChange("traffic")}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">按流量计费</span>
                    </label>
                  </div>
                </div>

                {/* 带宽上限 */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700">带宽上限</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="!max-w-none w-96 text-xs leading-relaxed text-justify">
                          单台云服务器可以运行到的最高带宽，超过这个带宽上限将默认丢包。不同的网络计费模式，支持的公网带宽上限有所不同。
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* 滑块 */}
                    <div className="flex-1">
                      <Slider
                        min={1}
                        max={publicConfig.billingMode === "monthly" ? 2000 : 200}
                        step={1}
                        value={[publicConfig.bandwidth]}
                        onValueChange={([val]) => { setPublicConfig((prev) => ({ ...prev, bandwidth: val })); setIsPublicDirty(true); }}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">1 Mbps</span>
                        <span className="text-xs text-gray-400">{publicConfig.billingMode === "monthly" ? "2000" : "200"} Mbps</span>
                      </div>
                    </div>
                    {/* 输入框 */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={publicConfig.billingMode === "monthly" ? 2000 : 200}
                        value={publicConfig.bandwidth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const maxBw = publicConfig.billingMode === "monthly" ? 2000 : 200;
                          if (!isNaN(val)) {
                            setPublicConfig((prev) => ({
                              ...prev,
                              bandwidth: Math.max(1, Math.min(val, maxBw)),
                            }));
                            setIsPublicDirty(true);
                          }
                        }}
                        className="w-20 h-9 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-500">Mbps</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
        )}

        {activeTab === "coming" && (
        <div className="grid grid-cols-3 gap-6">
          {/* 模型加速服务 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#007AFF" }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 mb-1">模型加速服务</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  为 OpenClaw 调用海外模型或国内模型提供专属优化链路，实现跨境/跨网访问的低延迟、高稳定传输，显著提升大模型交互体验
                </p>
              </div>
            </div>
          </div>

          {/* 公网高效接入 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#34C759" }}>
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 mb-1">公网极速接入</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  提供全球范围内广覆盖、大带宽、低延时的公网出口和高性能接入网关，保障 OpenClaw 各场景下极速、灵活、稳定的网络接入体验
                </p>
              </div>
            </div>
          </div>

          {/* 企业网络环境互通 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FF9500" }}>
                <Link className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 mb-1">企业网络环境互通</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  为 OpenClaw 平台与企业 IDC 之间提供大带宽、高速、安全的互通能力，保障云上云下协同
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>

      {/* ─── 添加规则弹窗 ─────────────────────────────────────────────────────── */}
      <Dialog
        open={showAddDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(null);
            setAddDraft({});
            setAddRuleTab("template");
          }
        }}
      >
        <DialogContent
          className="w-auto"
          style={{ minWidth: "360px", maxWidth: "min(90vw, 480px)" }}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {showAddDialog === "inbound" ? "添加入站规则" : "添加出站规则"}
            </DialogTitle>
            {showAddDialog === "inbound" && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-2">
                <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  您可按需选择添加方式：<span className="font-medium">自定义添加</span>适用于逐条配置安全组规则；<span className="font-medium">使用模板添加</span>适用于按场景批量生成一组推荐规则，应用后仍可继续调整。
                </p>
              </div>
            )}
          </DialogHeader>

          {/* 入站：双 tab；出站：仅自定义 */}
          {showAddDialog === "inbound" && (
            <div className="flex gap-0 border-b border-gray-100 -mt-1 mb-4">
              <button
                onClick={() => setAddRuleTab("template")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  addRuleTab === "template"
                    ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                使用模板添加
              </button>
              <button
                onClick={() => setAddRuleTab("custom")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  addRuleTab === "custom"
                    ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                自定义添加
              </button>
            </div>
          )}

          {/* ── 模板添加 tab（仅入站） ── */}
          {showAddDialog === "inbound" && addRuleTab === "template" && (
            <div className="space-y-4">
              {/* 模板名称（选项内嵌入说明，触发器只显名称） */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">模板名称</Label>
                <Select defaultValue="block-all">
                  <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-full">
                    <span className="font-medium text-gray-800">所有 OpenClaw 云服务器不互通</span>
                  </SelectTrigger>
                  <SelectContent align="start" className="w-[var(--radix-select-trigger-width)] min-w-[320px]">
                    <SelectItem value="block-all">
                      <div className="py-0.5">
                        <p className="font-semibold text-gray-800">所有 OpenClaw 云服务器不互通</p>
                        <p className="text-xs text-gray-400 font-normal mt-0.5 whitespace-normal leading-relaxed">限制所有 OpenClaw 云服务器的内网互访，适用于企业共享私有网络下的访问控制场景。</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 规则预览 */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">入站规则预览</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-3 py-2 text-left font-medium text-gray-500">来源</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">协议</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">端口</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">策略</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50/60">
                        <td className="px-3 py-2 text-gray-700">10.0.0.0/12</td>
                        <td className="px-3 py-2 text-gray-700">TCP</td>
                        <td className="px-3 py-2 text-gray-700">ALL</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">拒绝</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">限制 VPC 内 OpenClaw 云服务器互访</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>


              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(null);
                    setAddRuleTab("template");
                  }}
                >
                  取消
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // 应用模板：按模板预览内容插入列表首位
                    const newId = String(Date.now());
                    setInboundRules((prev) => [
                      {
                        id: newId,
                        source: "10.0.0.0/12",
                        protocol: "TCP",
                        port: "ALL",
                        policy: "拒绝",
                        remark: "限制 VPC 内 OpenClaw 云服务器互访",
                      },
                      ...prev,
                    ]);
                    setShowAddDialog(null);
                    setAddRuleTab("template");
                    toast.success("模板规则添加成功");
                  }}
                >
                  应用模板
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── 自定义添加 tab ── */}
          {(showAddDialog === "outbound" || (showAddDialog === "inbound" && addRuleTab === "custom")) && (
            <div className="space-y-4">
              {/* 来源 / 目标 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {showAddDialog === "inbound" ? "来源" : "目标"}
                </Label>
                <Input
                  placeholder={showAddDialog === "inbound" ? "例如：0.0.0.0/0 或 10.0.0.0/8" : "例如：0.0.0.0/0"}
                  value={addDraft.source ?? ""}
                  onChange={(e) => setAddDraft((prev) => ({ ...prev, source: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              {/* 协议 + 端口：两列并排，协议下拉固定宽 */}
              <div className="flex gap-3 items-end">
                <div className="space-y-1.5 flex-none w-[120px]">
                  <Label className="text-sm font-medium text-gray-700">协议</Label>
                  <Select
                    value={addDraft.protocol ?? ""}
                    onValueChange={(v) => setAddDraft((prev) => ({ ...prev, protocol: v }))}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-[120px]">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">ALL</SelectItem>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="ICMP">ICMP</SelectItem>
                      <SelectItem value="ICMPv6">ICMPv6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label className="text-sm font-medium text-gray-700">端口</Label>
                  <Input
                    placeholder="例如 80 或 ALL"
                    value={addDraft.port ?? ""}
                    onChange={(e) => setAddDraft((prev) => ({ ...prev, port: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* 策略：下拉固定宽，与协议宽度对齐 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">策略</Label>
                <Select
                  value={addDraft.policy ?? ""}
                  onValueChange={(v) => setAddDraft((prev) => ({ ...prev, policy: v }))}
                >
                  <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-[160px]">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="允许">允许</SelectItem>
                    <SelectItem value="拒绝">拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 备注（可选） */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  备注
                  <span className="text-gray-400 font-normal ml-1">（可选）</span>
                </Label>
                <Input
                  placeholder="简要描述此规则用途"
                  value={addDraft.remark ?? ""}
                  onChange={(e) => setAddDraft((prev) => ({ ...prev, remark: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(null);
                    setAddDraft({});
                    setAddRuleTab("template");
                  }}
                >
                  取消
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (!addDraft.source?.trim()) {
                      toast.error(showAddDialog === "inbound" ? "请填写来源" : "请填写目标");
                      return;
                    }
                    if (!addDraft.protocol) {
                      toast.error("请选择协议");
                      return;
                    }
                    if (!addDraft.port?.trim()) {
                      toast.error("请填写端口");
                      return;
                    }
                    if (!addDraft.policy) {
                      toast.error("请选择策略");
                      return;
                    }
                    const newRule: Rule = {
                      id: String(Date.now()),
                      source: addDraft.source!,
                      protocol: addDraft.protocol!,
                      port: addDraft.port!,
                      policy: addDraft.policy!,
                      remark: addDraft.remark ?? "",
                    };
                    if (showAddDialog === "inbound") {
                      setInboundRules((prev) => [...prev, newRule]);
                    } else {
                      setOutboundRules((prev) => [...prev, newRule]);
                    }
                    setShowAddDialog(null);
                    setAddDraft({});
                    setAddRuleTab("template");
                    toast.success("规则添加成功");
                  }}
                >
                  添加规则
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* VPC 保存确认对话框 */}
      <Dialog open={showVpcSaveDialog} onOpenChange={setShowVpcSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认保存网络配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              确认保存当前私有网络和子网配置？<br />
              修改后将对后续新创建的 OpenClaw 云服务器生效。
            </p>
            {inboundRules.some(r => r.remark === "限制 VPC 内 OpenClaw 云服务器互访") && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <p className="text-xs text-amber-800 leading-relaxed">
                  检测到当前企业已通过模板添加安全组规则。切换私有网络后，已添加的模板规则不会自动更新，可能与新的网络配置不一致。保存后，请前往「安全组」重新应用模板或手动调整规则。
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVpcSaveDialog(false)}>取消</Button>
            <Button onClick={handleSaveVpc} className="bg-blue-600 hover:bg-blue-700 text-white">继续保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 迁移确认弹窗 */}
      <Dialog open={showMigrationConfirm} onOpenChange={setShowMigrationConfirm}>
        <DialogContent style={{ maxWidth: "min(90vw, 860px)", width: "min(90vw, 860px)" }}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">网络模式迁移</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {/* 模式对比 */}
            <div className="grid grid-cols-[1fr_32px_1fr] items-center gap-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">当前模式</p>
                <p className="text-sm font-medium text-gray-800">每个用户单独分配私有网络</p>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-400 mb-1">目标模式</p>
                <p className="text-sm font-medium text-blue-800">企业内用户共享同一私有网络</p>
              </div>
            </div>

            {/* 迁移影响说明 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <p className="text-xs text-amber-800">迁移过程中 OpenClaw 云服务器会重启，且内网 IP 会发生变化，请提前告知相关用户。</p>
              </div>
            </div>

            {/* 涉及范围 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{MIGRATION_INSTANCES.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">涉及云服务器数</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{new Set(MIGRATION_INSTANCES.map(m => m.user)).size}</p>
                <p className="text-xs text-gray-500 mt-0.5">涉及用户数</p>
              </div>
            </div>

            {/* 影响范围明细表 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 grid grid-cols-[1.4fr_1.4fr_1.8fr_1.8fr_0.8fr] text-xs text-gray-500 font-medium px-3 py-2 border-b border-gray-100">
                <span className="whitespace-nowrap">用户名</span>
                <span className="whitespace-nowrap">OpenClaw 云服务器</span>
                <span className="whitespace-nowrap">当前网络</span>
                <span className="whitespace-nowrap">目标网络</span>
                <span className="whitespace-nowrap">状态</span>
              </div>
              <div className="divide-y divide-gray-50">
                {(confirmTableExpanded ? MIGRATION_INSTANCES : MIGRATION_INSTANCES.slice(0, 4)).map((item, i) => (
                  <div key={i} className="grid grid-cols-[1.4fr_1.4fr_1.8fr_1.8fr_0.8fr] text-xs text-gray-700 px-3 py-2 items-center hover:bg-gray-50/60">
                    <span className="truncate text-gray-500">{item.user}</span>
                    <span className="truncate font-medium">{item.instance}</span>
                    <span className="truncate text-gray-500">{item.currentNet}</span>
                    <span className="truncate text-blue-600">{item.targetNet}</span>
                    <span className={`inline-flex items-center gap-1 ${
                      item.status === "运行中" ? "text-green-600" : "text-gray-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === "运行中" ? "bg-green-500" : "bg-gray-300"
                      }`} />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              {MIGRATION_INSTANCES.length > 4 && (
                <button
                  className="w-full text-xs text-blue-500 hover:text-blue-600 py-2 border-t border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  onClick={() => setConfirmTableExpanded(v => !v)}
                >
                  {confirmTableExpanded
                    ? "收起"
                    : `展开查看剩余 ${MIGRATION_INSTANCES.length - 4} 条`}
                </button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMigrationConfirm(false)}>取消</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setShowMigrationConfirm(false);
                setMigrationStep(0);
                setMigrationDone(false);
                // 重置实例任务列表
                setInstanceTasks(MIGRATION_INSTANCES.map(m => ({
                  user: m.user, instance: m.instance,
                  currentStep: "确认网络配置", status: "待执行"
                })));
                setShowMigrationProgress(true);

                const STEP_LABELS = ["确认网络配置", "切换实例网络", "重启实例并加载网络配置", "更新默认网络模式"];
                const totalInstances = MIGRATION_INSTANCES.length;

                // 逐台逐步推进：step 为全局步骤（1-4），idx 为当前正在处理的实例下标
                const runStep = (step: number, idx: number, baseTasks: typeof instanceTasks) => {
                  if (step > 4) {
                    setMigrationDone(true);
                    return;
                  }
                  const stepLabel = STEP_LABELS[step - 1];

                  // 进入新步骤时（idx === 0），先将所有实例重置为「待执行」
                  const resetTasks = idx === 0
                    ? baseTasks.map(t => ({ ...t, currentStep: stepLabel, status: "待执行" as const }))
                    : baseTasks;

                  if (idx === 0) {
                    setMigrationStep(step);
                    setInstanceTasks(resetTasks);
                  }

                  // 将第 idx 台实例设为「进行中」
                  const tasksInProgress = resetTasks.map((t, i) => i === idx
                    ? { ...t, currentStep: stepLabel, status: "进行中" as const }
                    : t
                  );
                  setInstanceTasks(tasksInProgress);

                  setTimeout(() => {
                    // 将第 idx 台实例设为「已完成」
                    const tasksDone = tasksInProgress.map((t, i) => i === idx
                      ? { ...t, status: "已完成" as const }
                      : t
                    );
                    setInstanceTasks(tasksDone);

                    if (idx + 1 < totalInstances) {
                      // 继续处理同步骤的下一台实例
                      setTimeout(() => runStep(step, idx + 1, tasksDone), 200);
                    } else {
                      // 本步骤所有实例完成，进入下一步
                      setTimeout(() => runStep(step + 1, 0, tasksDone), 500);
                    }
                  }, 600);
                };

                const initialTasks = MIGRATION_INSTANCES.map(m => ({
                  user: m.user, instance: m.instance,
                  currentStep: "确认网络配置", status: "待执行" as const
                }));
                setInstanceTasks(initialTasks);
                setTimeout(() => runStep(1, 0, initialTasks), 400);
              }}
            >
              开始迁移
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 迁移进度弹窗 */}
      <Dialog
        open={showMigrationProgress && !migrationRunningInBg}
        onOpenChange={(open) => {
          // 后台运行时弹窗已隐藏，不处理
          if (migrationRunningInBg) return;
          // 迁移完成前不允许通过遮罩/Esc关闭（只能用后台运行按钮）
          if (!migrationDone) return;
          if (!open) {
            setShowMigrationProgress(false);
            setIsLegacyMode(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl" showCloseButton={migrationDone} style={{ maxWidth: "min(90vw, 900px)", width: "min(90vw, 900px)" }}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {migrationDone ? "迁移完成" : "迁移进行中…"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {/* 全局步骤进度 */}
            <div className="flex items-center gap-6">
              {([
                { label: "确认私有网络 / 子网配置", step: 1 },
                { label: "切换 OpenClaw 云服务器网络", step: 2 },
                { label: "重启实例并加载网络配置", step: 3 },
                { label: "更新企业默认网络模式", step: 4 },
              ] as { label: string; step: number }[]).map(({ label, step }, idx, arr) => {
                const isDone = migrationStep > step || (migrationDone && migrationStep >= step);
                const isActive = migrationStep === step && !migrationDone;
                return (
                  <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {isDone ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                    <span className={`text-xs truncate ${
                      isDone ? "text-gray-800 font-medium" :
                      isActive ? "text-blue-600 font-medium" :
                      "text-gray-400"
                    }`}>{label}</span>
                    {idx < arr.length - 1 && (
                      <svg className="w-3 h-3 text-gray-300 shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-100" />

            {/* 实例任务明细表 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 grid grid-cols-[1.6fr_1.6fr_2fr_0.9fr_1.2fr] text-xs text-gray-500 font-medium px-3 py-2 border-b border-gray-100">
                <span>用户名</span>
                <span>OpenClaw 云服务器</span>
                <span>当前步骤</span>
                <span>状态</span>
                <span>失败原因</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                {instanceTasks.map((task, i) => (
                  <div key={i} className="grid grid-cols-[1.6fr_1.6fr_2fr_0.9fr_1.2fr] text-xs text-gray-700 px-3 py-2 items-center hover:bg-gray-50/60">
                    <span className="truncate text-gray-500">{task.user}</span>
                    <span className="truncate font-medium">{task.instance}</span>
                    <span className="truncate text-gray-600">{task.currentStep}</span>
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      task.status === "已完成" ? "text-green-600" :
                      task.status === "进行中" ? "text-blue-600" :
                      task.status === "失败" ? "text-red-500" :
                      "text-gray-400"
                    }`}>
                      {task.status === "进行中" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.status === "已完成" ? "bg-green-500" :
                          task.status === "失败" ? "bg-red-500" :
                          "bg-gray-300"
                        }`} />
                      )}
                      {task.status}
                    </span>
                    <span className="truncate text-red-400 text-xs">{task.failReason ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            {!migrationDone && (
              <Button
                variant="outline"
                onClick={() => {
                  setMigrationRunningInBg(true);
                }}
              >
                后台运行
              </Button>
            )}
            {migrationDone && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setShowMigrationProgress(false);
                  setMigrationRunningInBg(false);
                  setIsLegacyMode(false);
                }}
              >
                完成
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
