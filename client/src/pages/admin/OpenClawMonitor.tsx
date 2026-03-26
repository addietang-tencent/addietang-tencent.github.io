/**
 * OpenClawList - 管控端 OpenClaw 列表页
 * 布局：标题行右上角时间筛选器+刷新 → 数据概览卡片 → 表格
 * 表格列：名称/ID、创建人、状态、创建时间、操作
 * 操作栏：终端、关机（二次确认）、删除（二次确认）；三点菜单：重启、重新安装
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Search, Bot, Trash2, ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
  Terminal, UserRoundCog, Power, MoreHorizontal, RotateCcw, HardDriveDownload,
  Activity, Loader2, ExternalLink, ChevronDown
} from "lucide-react";

type ClawStatus = "running" | "stopped" | "error" | "starting" | "stopping";

interface Claw {
  id: string;
  instanceId: string;
  name: string;
  creator: string;
  createTime: string;
  observableStatus: "on" | "off";
  powerStatus?: "off";
  status: ClawStatus;
}

const STATUS_CONFIG: Record<ClawStatus, { label: string; color: string; bg: string; dot: string }> = {
  running:  { label: "运行中", color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-500" },
  stopped:  { label: "已关机", color: "text-gray-500",   bg: "bg-gray-100",  dot: "bg-gray-400" },
  error:    { label: "异常",   color: "text-red-700",    bg: "bg-red-50",    dot: "bg-red-500" },
  starting: { label: "启动中", color: "text-yellow-700", bg: "bg-yellow-50", dot: "bg-yellow-500" },
  stopping: { label: "关机中", color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
};

const MOCK_CLAWS: Claw[] = [
  { id: "1",  instanceId: "ins-g83c6wvc", name: "Alice的助手",      creator: "alice@acompany.com",  createTime: "2025-12-01 09:12:34", observableStatus: "off", status: "running" },
  { id: "2",  instanceId: "ins-h92d7xwe", name: "Bob工作助手",       creator: "bob@acompany.com",    createTime: "2025-12-15 14:05:22", observableStatus: "off", status: "running" },
  { id: "3",  instanceId: "ins-j14e8yvf", name: "Carol的研究助手",   creator: "carol@acompany.com",  createTime: "2026-01-05 10:33:47", observableStatus: "off", powerStatus: "off", status: "stopped" },
  { id: "4",  instanceId: "ins-k25f9zwg", name: "Dave的代码助手",    creator: "dave@acompany.com",   createTime: "2026-01-20 16:48:09", observableStatus: "off", status: "running" },
  { id: "5",  instanceId: "ins-l36g0axh", name: "Eve的写作助手",     creator: "eve@acompany.com",    createTime: "2026-02-10 08:21:55", observableStatus: "off", status: "error" },
  { id: "6",  instanceId: "ins-m47h1byi", name: "Frank的数据助手",   creator: "frank@acompany.com",  createTime: "2026-02-18 11:07:30", observableStatus: "off", status: "running" },
  { id: "7",  instanceId: "ins-n58i2czj", name: "Grace的翻译助手",   creator: "grace@acompany.com",  createTime: "2026-02-25 15:44:18", observableStatus: "off", status: "starting" },
  { id: "8",  instanceId: "ins-o69j3dak", name: "Henry的销售助手",   creator: "henry@acompany.com",  createTime: "2026-03-01 09:58:03", observableStatus: "off", status: "running" },
  { id: "9",  instanceId: "ins-p70k4ebl", name: "Ivy的客服助手",     creator: "ivy@acompany.com",    createTime: "2026-03-05 13:26:41", observableStatus: "off", status: "stopping" },
  { id: "10", instanceId: "ins-q81l5fcm", name: "Jack的会议助手",    creator: "jack@acompany.com",   createTime: "2026-03-08 17:02:15", observableStatus: "off", status: "running" },
  { id: "11", instanceId: "ins-r92m6gdn", name: "Karen的报告助手",   creator: "karen@acompany.com",  createTime: "2026-03-09 10:15:50", observableStatus: "off", status: "error" },
  { id: "12", instanceId: "ins-s03n7heo", name: "Leo的项目助手",     creator: "leo@acompany.com",    createTime: "2026-03-10 08:39:27", observableStatus: "off", status: "running" },
];

const PAGE_SIZE = 10;

export default function OpenClawMonitor() {
  const [claws, setClaws] = useState<Claw[]>(
    [...MOCK_CLAWS].sort((a, b) => b.createTime.localeCompare(a.createTime))
  );
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [shutdownTarget, setShutdownTarget] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // 三步骤开启流程状态
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1);
  const [clsEnabled, setClsEnabled] = useState(false);
  const [logTopic, setLogTopic] = useState("openclaw_log_topic");
  const [metricTopic, setMetricTopic] = useState("openclaw_metric_topic");
  const [isInstallingAgent, setIsInstallingAgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const [allowTerminal, setAllowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });

  // 抽屉状态
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedClaw, setSelectedClaw] = useState<Claw | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // 模拟 OpenClaw 详情数据
  interface ChannelDetail {
    name: string;
    appId: string;
    appSecret: string;
    expanded: boolean;
  }

  interface ClawDetail {
    appliedModel: string;
    appliedModelVersion: string;
    connectedChannels: ChannelDetail[];
    installedSkills: { name: string; version: string }[];
  }

  const getClawDetail = (clawId: string): ClawDetail => {
    // 模拟数据（不同实例返回不同数据）
    const channelSets: Record<string, ChannelDetail[]> = {
      "1": [
        { name: "企业微信", appId: "wx1234567890", appSecret: "abc", expanded: false },
        { name: "飞书", appId: "cli_9876543210", appSecret: "xyz", expanded: false },
      ],
      "2": [
        { name: "钉钉", appId: "ding_abcdef1234", appSecret: "def", expanded: false },
      ],
      "3": [
        { name: "QQ", appId: "1234567890", appSecret: "xyz", expanded: false },
        { name: "飞书", appId: "cli_1122334455", appSecret: "pqr", expanded: false },
      ],
    };
    const skillSets: Record<string, { name: string; version: string }[]> = {
      "1": [
        { name: "tavily-search", version: "1.0.0" },
        { name: "summarize", version: "1.0.0" },
        { name: "agent-browser", version: "0.2.0" },
        { name: "find-skills", version: "0.1.0" },
        { name: "github", version: "1.0.0" },
        { name: "obsidian", version: "1.0.0" },
        { name: "notion", version: "1.0.0" },
        { name: "weather", version: "1.0.0" },
        { name: "tencentcloud-lighthouse-skill", version: "1.0.0" },
        { name: "tencent-docs", version: "1.0.3" },
        { name: "code-interpreter", version: "0.3.1" },
        { name: "sql-query", version: "1.2.0" },
        { name: "email-sender", version: "0.9.0" },
        { name: "calendar-sync", version: "1.0.1" },
        { name: "image-analyzer", version: "0.4.2" },
        { name: "pdf-reader", version: "1.1.0" },
        { name: "slack-integration", version: "0.6.0" },
      ],
      "2": [
        { name: "code-review", version: "2.1.0" },
        { name: "agent-browser", version: "0.2.0" },
        { name: "github", version: "1.0.0" },
        { name: "summarize", version: "1.0.0" },
      ],
      "3": [
        { name: "github", version: "1.0.0" },
        { name: "meeting-notes", version: "0.5.1" },
        { name: "translate-pro", version: "1.1.0" },
        { name: "data-analyst", version: "0.8.3" },
        { name: "tavily-search", version: "1.0.0" },
        { name: "tencent-docs", version: "1.0.3" },
        { name: "weather", version: "1.0.0" },
      ],
    };
    const models: Record<string, { name: string; version: string }> = {
      "1": { name: "腾讯云 DeepSeek", version: "DeepSeek V3 0324" },
      "2": { name: "GPT-4 Turbo", version: "gpt-4-turbo-2024-04-09" },
      "3": { name: "Claude 3.5 Sonnet", version: "claude-3-5-sonnet-20241022" },
    };
    const model = models[clawId] ?? { name: "腾讯云 DeepSeek", version: "DeepSeek V3 0324" };
    return {
      appliedModel: model.name,
      appliedModelVersion: model.version,
      connectedChannels: channelSets[clawId] ?? [
        { name: "企业微信", appId: "wx9988776655", appSecret: "stu", expanded: false },
      ],
      installedSkills: skillSets[clawId] ?? [
        { name: "github", version: "1.0.0" },
        { name: "agent-browser", version: "0.2.0" },
      ],
    };
  };

  // 通道展开状态（本地 UI 状态）
  const [expandedChannels, setExpandedChannels] = useState<Set<number>>(new Set());

  const toggleChannel = (idx: number) => {
    setExpandedChannels(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleOpenDrawer = (claw: Claw) => {
    setSelectedClaw(claw);
    setExpandedChannels(new Set());
    setShowDetailDrawer(true);
  };

  const handleRefreshDrawer = () => {
    if (!selectedClaw) return;
    setDrawerLoading(true);
    setTimeout(() => {
      setDrawerLoading(false);
      toast.success("信息已刷新");
    }, 1500);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("列表已刷新");
    }, 1000);
  };

  const handleOpenSetupDialog = () => {
    setSetupStep(1);
    setShowSetupDialog(true);
  };

  const handleStep1EnableCls = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setClsEnabled(true);
      setSetupStep(2);
      toast.success("CLS 服务已开通");
    }, 1500);
  };

  const handleStep2Continue = () => {
    setSetupStep(3);
  };

  const handleStep3InstallAgent = () => {
    setIsInstallingAgent(true);
    setTimeout(() => {
      setIsInstallingAgent(false);
      setClaws(claws.map(c =>
        selectedIds.has(c.id) ? { ...c, observableStatus: "on" } : c
      ));
      setShowSetupDialog(false);
      setSelectedIds(new Set());
      toast.success("可观测面板开启成功");
    }, 2000);
  };

  const handleFilterChange = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const handleOpenTerminal = (claw: Claw) => {
    window.open(`/terminal/${claw.id}`, "_blank");
  };

  const handleRestart = (claw: Claw) => {
    toast.success(`正在重启 ${claw.name}...`);
  };

  const handleReinstall = (claw: Claw) => {
    toast.success(`正在重新安装 ${claw.name} 的 OpenClaw...`);
  };

  const confirmShutdown = () => {
    if (!shutdownTarget) return;
    setClaws(claws.map(c => c.id === shutdownTarget ? { ...c, status: "stopped" as ClawStatus, powerStatus: "off" } : c));
    const claw = claws.find(c => c.id === shutdownTarget);
    setShutdownTarget(null);
    toast.success(`已关机 ${claw?.name}`);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const claw = claws.find(c => c.id === deleteTarget);
    setClaws(claws.filter(c => c.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success(`已删除 ${claw?.name}`);
  };

  const confirmDisable = () => {
    setClaws(claws.map(c =>
      selectedIds.has(c.id) ? { ...c, observableStatus: "off" } : c
    ));
    const count = selectedIds.size;
    setSelectedIds(new Set());
    setShowCloseConfirm(false);
    toast.success(`已关闭 ${count} 个 OpenClaw 的可观测面板`);
  };

  // 筛选逻辑
  const timeFiltered = claws.filter((c) => {
    const matchFrom = !dateFrom || c.createTime >= dateFrom;
    const matchTo = !dateTo || c.createTime <= dateTo;
    return matchFrom && matchTo;
  });

  const filtered = timeFiltered.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.creator.includes(search) || c.instanceId.includes(search);
    return matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="page-enter">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OpenClaw 列表</h1>
            <p className="text-sm text-gray-500 mt-1">查看和管理所有企业用户创建的 OpenClaw 云服务器。</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(() => setDateFrom(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(() => setDateTo(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => handleFilterChange(() => { setDateFrom(""); setDateTo(""); })}
                className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors whitespace-nowrap"
              >
                清除筛选
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50 shrink-0"
              title="刷新列表"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>

          {/* 工具栏 */}
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索名称、ID 或创建人"
                  value={search}
                  onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                  className="pl-9 bg-gray-50 border-gray-200 h-9"
                />
              </div>

            </div>
            {/* 统计 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-gray-500">
                共计 <span className="text-lg font-bold text-gray-900">{filtered.length}</span> 个 OpenClaw
              </span>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[30%]">名称 / ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[28%]">创建人</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">创建时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                    暂无符合条件的 OpenClaw
                  </td>
                </tr>
              ) : (
                paginated.map((claw) => {
                  const isRunning = claw.status === "running";
                  return (
                    <tr key={claw.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* 名称/ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{claw.name}</div>
                            <button
                              onClick={() => handleOpenDrawer(claw)}
                              className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-mono cursor-pointer"
                            >
                              {claw.instanceId}
                            </button>
                          </div>
                        </div>
                      </td>
                      {/* 创建人 */}
                      <td className="px-6 py-4 text-sm text-gray-500">{claw.creator}</td>
                      {/* 创建时间 */}
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{claw.createTime}</td>
                      {/* 操作 */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* 终端 */}
                          {!isRunning ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-xs text-gray-300 cursor-not-allowed">
                                  <Terminal className="w-3.5 h-3.5" />
                                  终端
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                仅运行中的实例可进入终端
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                              onClick={() => handleOpenTerminal(claw)}
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              终端
                            </button>
                          )}

                          {/* 关机 */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <button
                                  className={`inline-flex items-center gap-1 text-xs ${
                                    isRunning
                                      ? "text-gray-600 hover:text-gray-900"
                                      : "text-gray-300 cursor-not-allowed"
                                  }`}
                                  disabled={!isRunning}
                                  onClick={() => isRunning && setShutdownTarget(claw.id)}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  关机
                                </button>
                              </span>
                            </TooltipTrigger>
                            {!isRunning && (
                              <TooltipContent side="top" className="text-xs">
                                仅运行中的实例可关机
                              </TooltipContent>
                            )}
                          </Tooltip>

                          {/* 删除 */}
                          <button
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(claw.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            删除
                          </button>

                          {/* 更多操作 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center text-xs text-gray-500 hover:text-gray-800">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className="text-sm cursor-pointer"
                                onClick={() => handleRestart(claw)}
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                重启
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-sm cursor-pointer"
                                onClick={() => handleReinstall(claw)}
                              >
                                <HardDriveDownload className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                重新安装 OpenClaw
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              共 {filtered.length} 条记录
              {filtered.length > 0 && `，第 ${safePage} / ${totalPages} 页`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 px-2">第 {safePage} 页</span>
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 底部权限开关区域 */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                <UserRoundCog className="text-white" style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">允许成员进入 OpenClaw 终端</p>
                <p className="text-xs text-gray-400 mt-0.5">开启后，所有用户在用户端可看到「进入终端」选项，进入对应 OpenClaw 云服务器的终端</p>
              </div>
            </div>
            <Switch
              checked={allowTerminal}
              onCheckedChange={(v) => {
                setAllowTerminal(v);
                localStorage.setItem("admin_allow_terminal", String(v));
                toast.success(v ? "已允许成员进入终端" : "已禁止成员进入终端");
              }}
            />
          </div>
        </div>
      </div>

      {/* 关机确认弹窗 */}
      <Dialog open={!!shutdownTarget} onOpenChange={() => setShutdownTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认关机</DialogTitle>
            <DialogDescription>
              关机后该 OpenClaw 将无法使用，直到重新启动。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              确定要关闭 <strong>{claws.find(c => c.id === shutdownTarget)?.name}</strong> 吗？关机后该实例将停止运行。
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShutdownTarget(null)}>取消</Button>
            <Button onClick={confirmShutdown} className="bg-orange-600 hover:bg-orange-700 text-white">
              确认关机
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>删除 OpenClaw</DialogTitle>
            <DialogDescription>
              此操作无法撤销，请谨慎操作。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              确定要删除 <strong>{claws.find(c => c.id === deleteTarget)?.name}</strong> 吗？删除后数据将无法恢复。
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 三步骤开启流程弹窗 */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开启可观测面板</DialogTitle>
            <DialogDescription>按照步骤完成可观测面板的配置</DialogDescription>
          </DialogHeader>

          {setupStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">1. 开通 CLS</h3>
                <p className="text-sm text-gray-600">开启可观测面板需要您开通日志服务 CLS</p>
              </div>
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">2025年6月15日前该功能免费使用，2025年6月15日后CLS将按量计费</p>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">2. 设置主题</h3>
                <p className="text-sm text-gray-600">配置日志主题和指标主题</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">日志主题</label>
                  <Input placeholder="日志主题名称" value={logTopic} onChange={(e) => setLogTopic(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">指标主题</label>
                  <Input placeholder="指标主题名称" value={metricTopic} onChange={(e) => setMetricTopic(e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">3. 安装 Agent</h3>
                <p className="text-sm text-gray-600">正在安装日志采集 Agent…</p>
              </div>
              {isInstallingAgent && (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {setupStep > 1 && (
              <Button variant="outline" onClick={() => setSetupStep((prev) => (prev - 1) as 1 | 2 | 3)} disabled={isLoading || isInstallingAgent}>
                上一步
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowSetupDialog(false)} disabled={isLoading || isInstallingAgent}>取消</Button>
            {setupStep === 1 && (
              <Button onClick={handleStep1EnableCls} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? "开通中..." : "下一步"}
              </Button>
            )}
            {setupStep === 2 && (
              <Button onClick={handleStep2Continue} className="bg-blue-600 hover:bg-blue-700 text-white">下一步</Button>
            )}
            {setupStep === 3 && (
              <Button onClick={handleStep3InstallAgent} disabled={isInstallingAgent} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isInstallingAgent ? "安装中..." : "确认"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关闭可观测面板确认弹窗 */}
      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关闭可观测面板</DialogTitle>
            <DialogDescription>关闭后将无法查看详细日志和对话数据</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">关闭后将无法查看详细日志和对话数据，请谨慎操作</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>取消</Button>
            <Button onClick={confirmDisable} className="bg-red-600 hover:bg-red-700 text-white">确认关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* OpenClaw 详情抽屉 */}
      {showDetailDrawer && selectedClaw && (
        <div className="fixed inset-0 z-50 flex">
          {/* 半透明背景 */}
          <div
            className="flex-1 bg-black/20"
            onClick={() => setShowDetailDrawer(false)}
          />
          {/* 抽屉 */}
          <div className="w-[576px] bg-white shadow-lg flex flex-col">
            {/* 抽屉头 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">OpenClaw 详情</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={handleRefreshDrawer}
                  disabled={drawerLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${drawerLoading ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowDetailDrawer(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* 抽屉内容 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* 名称/ID 部分 */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-900">{selectedClaw.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-mono">{selectedClaw.instanceId}</span>
                        <a
                          href={`https://console.cloud.tencent.com/cvm/instance/detail?rid=1&id=${selectedClaw.instanceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-blue-500 underline hover:text-blue-700"
                        >
                          去腾讯云控制台管理
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 已应用模型 */}
                <div>
                  <div className="text-xs text-gray-400 mb-2">已应用模型</div>
                  <div className="px-4 py-3 bg-white rounded-xl border border-gray-200">
                    <div className="text-sm font-medium text-gray-900">{getClawDetail(selectedClaw.id).appliedModel}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{getClawDetail(selectedClaw.id).appliedModelVersion}</div>
                  </div>
                </div>

                {/* 已接入通道 */}
                <div>
                  <div className="text-xs text-gray-400 mb-2">
                    已接入通道（{getClawDetail(selectedClaw.id).connectedChannels.length}）
                  </div>
                  <div className="space-y-2">
                    {getClawDetail(selectedClaw.id).connectedChannels.map((channel, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => toggleChannel(idx)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedChannels.has(idx)
                              ? <ChevronDown className="w-4 h-4 text-gray-400" />
                              : <ChevronRight className="w-4 h-4 text-gray-400" />
                            }
                            <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                          </div>
                        </button>
                        {expandedChannels.has(idx) && (
                          <div className="px-4 pt-2 pb-3 space-y-2">
                            <div className="flex items-baseline gap-2 text-sm">
                              <span className="text-gray-400">appId:</span>
                              <span className="font-mono text-gray-800 tracking-wider">{channel.appId}</span>
                            </div>
                            <div className="flex items-baseline gap-2 text-sm">
                              <span className="text-gray-400">appSecret:</span>
                              <span className="font-mono text-gray-800 tracking-wider">{channel.appSecret}<span className="text-[0.55em] tracking-widest align-middle ml-0.5">●●●●●●</span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 已安装技能 */}
                <div>
                  <div className="text-xs text-gray-400 mb-2">
                    已安装技能（{getClawDetail(selectedClaw.id).installedSkills.length}）
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
                    {getClawDetail(selectedClaw.id).installedSkills.map((skill, idx) => (
                      <div key={idx} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-sm text-gray-800">{skill.name} {skill.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
