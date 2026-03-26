/**
 * OpenClawList - 管控端 OpenClaw 列表页
 * 4 个模块：状态统计卡片、状态列+列头筛选、操作列、监控抽屉面板
 */
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Search, Bot, Trash2, ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
  Terminal, UserRoundCog, Power, MoreHorizontal, RotateCcw, HardDriveDownload,
  Activity, Loader2, ExternalLink, ChevronDown, Filter, HelpCircle, X, Eye, EyeOff
} from "lucide-react";

type ClawStatus = "creating" | "createFail" | "running" | "loading" | "loadFail" | "shutdown" | "maintaining" | "pending";

interface Claw {
  id: string;
  instanceId: string;
  name: string;
  creator: string;
  createTime: string;
  status: ClawStatus;
}

const STATUS_CONFIG: Record<ClawStatus, { label: string; color: string; dotClass: string }> = {
  creating:   { label: "创建中",   color: "text-blue-700",   dotClass: "bg-blue-500 animate-pulse" },
  createFail: { label: "创建失败", color: "text-red-700",    dotClass: "bg-red-500" },
  running:    { label: "运行中",   color: "text-green-700",  dotClass: "bg-green-500 animate-breathing" },
  loading:    { label: "加载中",   color: "text-blue-700",   dotClass: "spinner-blue" },
  loadFail:   { label: "加载失败", color: "text-red-700",    dotClass: "bg-red-500" },
  shutdown:   { label: "已关机",   color: "text-gray-500",   dotClass: "bg-gray-400" },
  maintaining: { label: "维护中",  color: "text-orange-700", dotClass: "bg-orange-500 animate-pulse" },
  pending:    { label: "待处理",   color: "text-red-700",    dotClass: "bg-red-500" },
};

const MOCK_CLAWS: Claw[] = [
  { id: "1",  instanceId: "ins-g83c6wvc", name: "Alice的助手",      creator: "alice@acompany.com",  createTime: "2025-12-01 09:12:34", status: "running" },
  { id: "2",  instanceId: "ins-h92d7xwe", name: "Bob工作助手",       creator: "bob@acompany.com",    createTime: "2025-12-15 14:05:22", status: "running" },
  { id: "3",  instanceId: "ins-j14e8yvf", name: "Carol的研究助手",   creator: "carol@acompany.com",  createTime: "2026-01-05 10:33:47", status: "shutdown" },
  { id: "4",  instanceId: "ins-k25f9zwg", name: "Dave的代码助手",    creator: "dave@acompany.com",   createTime: "2026-01-20 16:48:09", status: "running" },
  { id: "5",  instanceId: "ins-l36g0axh", name: "Eve的写作助手",     creator: "eve@acompany.com",    createTime: "2026-02-10 08:21:55", status: "createFail" },
  { id: "6",  instanceId: "ins-m47h1byi", name: "Frank的数据助手",   creator: "frank@acompany.com",  createTime: "2026-02-18 11:07:30", status: "running" },
  { id: "7",  instanceId: "ins-n58i2czj", name: "Grace的翻译助手",   creator: "grace@acompany.com",  createTime: "2026-02-25 15:44:18", status: "creating" },
  { id: "8",  instanceId: "ins-o69j3dak", name: "Henry的销售助手",   creator: "henry@acompany.com",  createTime: "2026-03-01 09:58:03", status: "running" },
  { id: "9",  instanceId: "ins-p70k4ebl", name: "Ivy的客服助手",     creator: "ivy@acompany.com",    createTime: "2026-03-05 13:26:41", status: "maintaining" },
  { id: "10", instanceId: "ins-q81l5fcm", name: "Jack的会议助手",    creator: "jack@acompany.com",   createTime: "2026-03-08 17:02:15", status: "running" },
  { id: "11", instanceId: "ins-r92m6gdn", name: "Karen的报告助手",   creator: "karen@acompany.com",  createTime: "2026-03-09 10:15:50", status: "loadFail" },
  { id: "12", instanceId: "ins-s03n7heo", name: "Leo的项目助手",     creator: "leo@acompany.com",    createTime: "2026-03-10 08:39:27", status: "running" },
  { id: "13", instanceId: "ins-t14o8ipf", name: "Mia的新助手",        creator: "mia@acompany.com",    createTime: "2026-03-12 11:00:00", status: "loading" },
  { id: "14", instanceId: "ins-u25p9jqg", name: "Noah的分析助手",    creator: "noah@acompany.com",   createTime: "2026-03-13 14:30:00", status: "pending" },
];

const PAGE_SIZE = 10;

export default function OpenClawMonitor() {
  const [claws, setClaws] = useState<Claw[]>(
    [...MOCK_CLAWS].sort((a, b) => b.createTime.localeCompare(a.createTime))
  );
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // 状态卡片筛选
  const [activeCardFilter, setActiveCardFilter] = useState<"all" | "running" | "shutdown" | "other">("all");

  // 状态列筛选
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ClawStatus>>(new Set());

  // 操作对话框
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [shutdownTarget, setShutdownTarget] = useState<string | null>(null);
  const [reinstallTarget, setReinstallTarget] = useState<string | null>(null);
  const [reinstallInput, setReinstallInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");

  // 监控抽屉
  const [showMonitorDrawer, setShowMonitorDrawer] = useState(false);
  const [selectedClaw, setSelectedClaw] = useState<Claw | null>(null);

  // 权限开关
  const [allowTerminal, setAllowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });

  // 计算统计数据
  const countByStatus = (status: ClawStatus | ClawStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return claws.filter(c => statuses.includes(c.status)).length;
  };

  const totalCount = claws.length;
  const runningCount = countByStatus("running");
  const shutdownCount = countByStatus("shutdown");
  const otherCount = countByStatus(["creating", "loading", "createFail", "loadFail", "maintaining", "pending"]);

  // 根据卡片筛选限制状态列筛选的可选项
  const getAvailableStatuses = (): ClawStatus[] => {
    switch (activeCardFilter) {
      case "running": return ["running"];
      case "shutdown": return ["shutdown"];
      case "other": return ["creating", "loading", "createFail", "loadFail", "maintaining", "pending"];
      case "all": return ["creating", "createFail", "running", "loading", "loadFail", "shutdown", "maintaining", "pending"];
    }
  };

  const handleCardFilterChange = (filter: "all" | "running" | "shutdown" | "other") => {
    setActiveCardFilter(filter);
    setPage(1);
    // 重置状态列筛选为当前卡片允许的全选状态
    const available = getAvailableStatuses();
    setSelectedStatuses(new Set(available));
  };

  const handleStatusFilterChange = (status: ClawStatus, checked: boolean) => {
    const newStatuses = new Set(selectedStatuses);
    if (checked) {
      newStatuses.add(status);
    } else {
      newStatuses.delete(status);
    }
    setSelectedStatuses(newStatuses);
  };

  const handleStatusFilterReset = () => {
    const available = getAvailableStatuses();
    setSelectedStatuses(new Set(available));
  };

  const handleStatusFilterConfirm = () => {
    setShowStatusFilter(false);
    setPage(1);
  };

  // 筛选逻辑
  const timeFiltered = claws.filter((c) => {
    const matchFrom = !dateFrom || c.createTime >= dateFrom;
    const matchTo = !dateTo || c.createTime <= dateTo;
    return matchFrom && matchTo;
  });

  const searchFiltered = timeFiltered.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.creator.includes(search) || c.instanceId.includes(search);
    return matchSearch;
  });

  const cardFiltered = searchFiltered.filter((c) => {
    switch (activeCardFilter) {
      case "running": return c.status === "running";
      case "shutdown": return c.status === "shutdown";
      case "other": return ["creating", "loading", "createFail", "loadFail", "maintaining", "pending"].includes(c.status);
      case "all": return true;
    }
  });

  const statusFiltered = cardFiltered.filter((c) => {
    if (selectedStatuses.size === 0) return true;
    return selectedStatuses.has(c.status);
  });

  const totalPages = Math.max(1, Math.ceil(statusFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = statusFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("列表已刷新");
    }, 1000);
  };

  const handleOpenTerminal = (claw: Claw) => {
    window.open(`/terminal/${claw.id}`, "_blank");
  };

  const handleRestart = (claw: Claw) => {
    toast.success(`正在重启 ${claw.name}...`);
  };

  const handleReinstallClick = (claw: Claw) => {
    setReinstallTarget(claw.id);
    setReinstallInput("");
  };

  const confirmReinstall = () => {
    if (!reinstallTarget) return;
    const claw = claws.find(c => c.id === reinstallTarget);
    setClaws(claws.map(c => c.id === reinstallTarget ? { ...c, status: "loading" as ClawStatus } : c));
    setReinstallTarget(null);
    setReinstallInput("");
    toast.success(`正在重新安装 ${claw?.name}...`);
  };

  const confirmShutdown = () => {
    if (!shutdownTarget) return;
    const claw = claws.find(c => c.id === shutdownTarget);
    setClaws(claws.map(c => c.id === shutdownTarget ? { ...c, status: "shutdown" as ClawStatus } : c));
    setShutdownTarget(null);
    toast.success(`已关机 ${claw?.name}`);
  };

  const handleDeleteClick = (claw: Claw) => {
    setDeleteTarget(claw.id);
    setDeleteInput("");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const claw = claws.find(c => c.id === deleteTarget);
    setClaws(claws.filter(c => c.id !== deleteTarget));
    setDeleteTarget(null);
    setDeleteInput("");
    toast.success(`已删除 ${claw?.name}`);
  };

  const handleOpenMonitor = (claw: Claw) => {
    setSelectedClaw(claw);
    setShowMonitorDrawer(true);
  };

  const isStatusDisabled = (status: ClawStatus): boolean => {
    const available = getAvailableStatuses();
    return !available.includes(status);
  };

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
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
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

        {/* 状态统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* 总数 */}
          <button
            onClick={() => handleCardFilterChange("all")}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeCardFilter === "all"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">总数</div>
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
          </button>

          {/* 运行中 */}
          <button
            onClick={() => handleCardFilterChange("running")}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeCardFilter === "running"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">运行中</div>
            <div className="text-2xl font-bold text-green-600">{runningCount}</div>
          </button>

          {/* 已关机 */}
          <button
            onClick={() => handleCardFilterChange("shutdown")}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeCardFilter === "shutdown"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">已关机</div>
            <div className="text-2xl font-bold text-gray-500">{shutdownCount}</div>
          </button>

          {/* 其他 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleCardFilterChange("other")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activeCardFilter === "other"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  其他
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{otherCount}</div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-xs">
              <div className="space-y-1">
                <div>⚠ 需关注：创建失败 · 加载失败 · 维护中 · 待处理</div>
                <div>◎ 处理中：创建中 · 加载中</div>
              </div>
            </TooltipContent>
          </Tooltip>
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
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                共计 <span className="text-lg font-bold text-gray-900">{statusFiltered.length}</span> 个 OpenClaw
              </span>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[25%]">名称 / ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[15%]">
                  <div className="flex items-center gap-2 relative">
                    当前状态
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={() => setShowStatusFilter(!showStatusFilter)}
                    >
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {showStatusFilter && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                          {["creating", "createFail", "running", "loading", "loadFail", "shutdown", "maintaining", "pending"].map((status) => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={selectedStatuses.has(status as ClawStatus)}
                                onCheckedChange={(checked) => handleStatusFilterChange(status as ClawStatus, !!checked)}
                                disabled={isStatusDisabled(status as ClawStatus)}
                              />
                              <span className={`text-sm ${isStatusDisabled(status as ClawStatus) ? "text-gray-300" : "text-gray-700"}`}>
                                {STATUS_CONFIG[status as ClawStatus].label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 p-2 flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleStatusFilterReset} className="flex-1">
                            重置
                          </Button>
                          <Button size="sm" onClick={handleStatusFilterConfirm} className="flex-1">
                            确认
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">创建人</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">创建时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    暂无符合条件的 OpenClaw
                  </td>
                </tr>
              ) : (
                paginated.map((claw) => {
                  const isRunning = claw.status === "running";
                  const isGrayed = ["createFail", "shutdown", "loadFail", "pending"].includes(claw.status);
                  const statusConfig = STATUS_CONFIG[claw.status];

                  return (
                    <tr key={claw.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* 名称/ID */}
                      <td className={`px-6 py-4 ${isGrayed ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 ${isGrayed ? "opacity-50" : ""}`}>
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isGrayed ? "text-gray-400" : "text-gray-900"}`}>{claw.name}</div>
                            <button
                              onClick={() => handleOpenMonitor(claw)}
                              className={`text-xs font-mono cursor-pointer ${isGrayed ? "text-gray-300" : "text-blue-500 hover:text-blue-700 hover:underline"}`}
                            >
                              {claw.instanceId}
                            </button>
                          </div>
                        </div>
                      </td>
                      {/* 状态列 */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {claw.status === "loading" ? (
                            <div className="w-2 h-2 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`}></div>
                          )}
                          <span className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                      </td>
                      {/* 创建人 */}
                      <td className={`px-6 py-4 text-sm ${isGrayed ? "text-gray-300" : "text-gray-500"}`}>{claw.creator}</td>
                      {/* 创建时间 */}
                      <td className={`px-6 py-4 text-sm whitespace-nowrap ${isGrayed ? "text-gray-300" : "text-gray-500"}`}>{claw.createTime}</td>
                      {/* 操作 */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 h-5">
                          {/* 终端 */}
                          {!isRunning ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-xs text-gray-300 cursor-not-allowed leading-none">
                                  <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
                                  终端
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                仅运行中的实例可进入终端
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 leading-none"
                              onClick={() => handleOpenTerminal(claw)}
                            >
                              <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
                              终端
                            </button>
                          )}

                          {/* 关机/开机 */}
                          {claw.status === "running" ? (
                            <button
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 leading-none"
                              onClick={() => setShutdownTarget(claw.id)}
                            >
                              <Power className="w-3.5 h-3.5 flex-shrink-0" />
                              关机
                            </button>
                          ) : claw.status === "shutdown" ? (
                            <button
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 leading-none"
                              onClick={() => setShutdownTarget(claw.id)}
                            >
                              <Power className="w-3.5 h-3.5 flex-shrink-0" />
                              开机
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-300 leading-none">
                              <Power className="w-3.5 h-3.5 flex-shrink-0" />
                              开机
                            </span>
                          )}

                          {/* 删除 */}
                          <button
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 leading-none"
                            onClick={() => handleDeleteClick(claw)}
                          >
                            <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                            删除
                          </button>

                          {/* 更多操作 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 leading-none">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className={`text-xs focus:bg-gray-50 cursor-pointer ${isRunning ? "text-gray-500 focus:text-gray-700" : "text-gray-300 cursor-not-allowed"}`}
                                disabled={!isRunning}
                                onClick={() => handleRestart(claw)}
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                重启
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`text-xs focus:bg-gray-50 cursor-pointer ${["running", "shutdown"].includes(claw.status) ? "text-gray-500 focus:text-gray-700" : "text-gray-300 cursor-not-allowed"}`}
                                disabled={!["running", "shutdown"].includes(claw.status)}
                                onClick={() => handleReinstallClick(claw)}
                              >
                                <HardDriveDownload className="w-3.5 h-3.5 mr-2" />
                                重新安装 OpenClaw
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50 cursor-pointer"
                                onClick={() => handleOpenMonitor(claw)}
                              >
                                <Activity className="w-3.5 h-3.5 mr-2" />
                                监控
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
              共 {statusFiltered.length} 条记录
              {statusFiltered.length > 0 && `，第 ${safePage} / ${totalPages} 页`}
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

      {/* 关机/开机确认弹窗 */}
      <Dialog open={!!shutdownTarget} onOpenChange={() => setShutdownTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认操作</DialogTitle>
            <DialogDescription>
              {claws.find(c => c.id === shutdownTarget)?.status === "running" ? "关机后该 OpenClaw 将无法使用，直到重新启动。" : "开机后该 OpenClaw 将重新运行。"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              确定要{claws.find(c => c.id === shutdownTarget)?.status === "running" ? "关闭" : "启动"} <strong>{claws.find(c => c.id === shutdownTarget)?.name}</strong> 吗？
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShutdownTarget(null)}>取消</Button>
            <Button onClick={confirmShutdown} className="bg-orange-600 hover:bg-orange-700 text-white">
              {claws.find(c => c.id === shutdownTarget)?.status === "running" ? "确认关机" : "确认开机"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重新安装确认弹窗 */}
      <Dialog open={!!reinstallTarget} onOpenChange={() => setReinstallTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>重新安装 OpenClaw</DialogTitle>
            <DialogDescription>
              使用最新镜像版本重新安装 OpenClaw
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800 space-y-1">
              <p>· 所有配置和数据将丢失，无法恢复</p>
              <p>· 安装完成后需要重新配置模型和通道</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">请输入「重装」以确认</label>
            <Input
              value={reinstallInput}
              onChange={(e) => setReinstallInput(e.target.value)}
              placeholder="输入「重装」"
              className="mt-2"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReinstallTarget(null)}>取消</Button>
            <Button
              onClick={confirmReinstall}
              disabled={reinstallInput !== "重装"}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              确认重新安装
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后「{claws.find(c => c.id === deleteTarget)?.name}」将被立即彻底销毁，数据无法恢复。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 space-y-1">
              <p>· 已配置的模型、通道和插件将全部清除</p>
              <p>· 此操作不可撤销</p>
            </div>
          </div>
          {claws.find(c => c.id === deleteTarget)?.status === "running" && (
            <div>
              <label className="text-sm font-medium text-gray-700">请输入「删除」以确认</label>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="输入「删除」"
                className="mt-2"
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button
              onClick={confirmDelete}
              disabled={claws.find(c => c.id === deleteTarget)?.status === "running" && deleteInput !== "删除"}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 监控抽屉 */}
      {showMonitorDrawer && selectedClaw && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowMonitorDrawer(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[640px] bg-white shadow-lg overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">{selectedClaw.name} - 监控</h2>
              <button
                onClick={() => setShowMonitorDrawer(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Token 分析区 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Token 分析</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Input Token</div>
                    <div className="text-lg font-bold text-gray-900">1,234</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Output Token</div>
                    <div className="text-lg font-bold text-gray-900">5,678</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Token 调用总量</div>
                    <div className="text-lg font-bold text-gray-900">6,912</div>
                  </div>
                </div>
                <button className="mt-4 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  查看完整 Token 监控 <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 会话记录区 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">会话记录</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">总会话数</div>
                    <div className="text-lg font-bold text-gray-900">42</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">平均轮次</div>
                    <div className="text-lg font-bold text-gray-900">8.5</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-center py-8">暂无会话数据</div>
                <button className="mt-4 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  查看完整会话管理 <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes breathing {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-breathing {
          animation: breathing 2s ease-in-out infinite;
        }
      `}</style>
    </TooltipProvider>
  );
}
