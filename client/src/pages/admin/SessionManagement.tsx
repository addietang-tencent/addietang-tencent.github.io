/**
 * SessionManagement - 会话管理页面
 * 包含：顶部指标卡 / 会话列表表格（支持筛选）/ 渠道与模型分布
 * 风格：浅色主题，与 Token 监控页保持一致
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageCircle, RotateCw, Zap, Globe, ArrowUpRight, CheckCircle2, RefreshCw, ArrowUp, ArrowDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle, AlertOperationInfoIcon } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusTag } from "@/components/ui/status-tag";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AgentCombobox } from "@/components/OpenClawCombobox";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from "recharts";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { Pagination } from "@/components/ui/pagination";

// CLS 采集插件版本历史
interface CLSPluginVersion {
  version: string;
  releaseDate: string;
  changelog: string;
  status: 'current' | 'available' | 'deprecated';
}

const CLS_PLUGIN_VERSIONS: CLSPluginVersion[] = [
  { version: "v5", releaseDate: "2026-03-24", changelog: "修复会话追踪精度问题，优化 Token 计算算法", status: "available" },
  { version: "v4", releaseDate: "2026-03-17", changelog: "新增会话全局监控功能，支持多渠道分析", status: "available" },
  { version: "v3", releaseDate: "2026-03-10", changelog: "优化日志采集性能，降低 CPU 占用率", status: "current" },
  { version: "v2", releaseDate: "2026-03-03", changelog: "修复 CLS 连接超时问题", status: "deprecated" },
  { version: "v1", releaseDate: "2026-02-24", changelog: "首次发布 CLS 采集插件", status: "deprecated" },
];

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

// 顶部指标卡
const STAT_CARDS = [
  {
    label: "总会话数",
    value: 11,
    metric: "total_sessions",
    icon: MessageCircle,
    iconBg: "from-blue-500 to-blue-600",
  },
  {
    label: "平均轮次",
    value: "28.6",
    metric: "avg_rounds",
    icon: RotateCw,
    iconBg: "from-cyan-500 to-cyan-600",
  },
  {
    label: "工具调用",
    value: 206,
    metric: "tool_calls",
    icon: Zap,
    iconBg: "from-purple-500 to-purple-600",
  },
  {
    label: "活跃渠道",
    value: 0,
    metric: "active_channels",
    icon: Globe,
    iconBg: "from-orange-500 to-orange-600",
    channels: [],
  },
];

// 按渠道分布数据
const CHANNEL_DIST_DATA = [
  { name: "Feishu Dm", count: 4 },
  { name: "QQ Dm", count: 3 },
  { name: "Feishu Group", count: 2 },
  { name: "CLI", count: 1 },
  { name: "Webchat", count: 1 },
];

// 按模型分布数据
const MODEL_DIST_DATA = [
  { name: "hunyuan-turbos-latest", value: 6, color: "#d8b4fe" },
  { name: "deepseek-v3.2", value: 5, color: "#60a5fa" },
];

// Mock 会话数据
const MOCK_SESSIONS = [
  {
    id: "c3b2ac3c",
    name: "System: [2026-03-09 16:10]",
    type: "Feishu Dm",
    model: "hunyuan-turbos-latest",
    tokens: "521K",
    cost: "$0.0742",
    lastMessage: "System: [2026-03-10 01:48:01 GMT+8] Feishu[de...",
    updatedAt: "2026-03-09 17:49",
    status: "active",
  },
  {
    id: "81c87c7b",
    name: "Conversation info (untrus",
    type: "QQ Dm",
    model: "hunyuan-turbos-latest",
    tokens: "188K",
    cost: "$0.0155",
    lastMessage: "Conversation info (untrusted metadata): '...json {",
    updatedAt: "2026-03-09 10:07",
    status: "active",
  },
  {
    id: "267e462d",
    name: "Conversation info (untrus",
    type: "QQ Dm",
    model: "hunyuan-turbos-latest",
    tokens: "476K",
    cost: "$0.0691",
    lastMessage: "[Queued messages while agent was busy] --- Que...",
    updatedAt: "2026-03-08 14:17",
    status: "active",
  },
  {
    id: "7be362c",
    name: "System: [2026-03-08 12:49]",
    type: "GROUP",
    model: "hunyuan-turbos-latest",
    tokens: "755K",
    cost: "$0.1076",
    lastMessage: "System: [2026-03-08 21:58:03 GMT+8] Feishu[...",
    updatedAt: "2026-03-08 13:58",
    status: "active",
  },
  {
    id: "c51c62c7",
    name: "你是什么模型",
    type: "CLI",
    model: "hunyuan-turbos-latest",
    tokens: "29K",
    cost: "$0.0041",
    lastMessage: "你是什么模型",
    updatedAt: "2026-03-08 12:54",
    status: "active",
  },
  {
    id: "96c0b225",
    name: "System: [2026-03-08 12:45]",
    type: "Feishu Dm",
    model: "deepseek-v3.2",
    tokens: "1.88M",
    cost: "$0.2700",
    lastMessage: "[Queued messages while agent was busy] --- Que...",
    updatedAt: "2026-03-08 05:14",
    status: "active",
  },
  {
    id: "a46be688",
    name: "Conversation info (untrus",
    type: "QQ Dm",
    model: "deepseek-v3.2",
    tokens: "965K",
    cost: "$0.1359",
    lastMessage: "Conversation info (untrusted metadata): '...json {",
    updatedAt: "2026-03-07 15:29",
    status: "active",
  },
  {
    id: "e4861318",
    name: "System: [2026-03-06 10:49]",
    type: "Feishu Dm",
    model: "deepseek-v3.2",
    tokens: "415K",
    cost: "$0.0685",
    lastMessage: "[Queued messages while agent was busy] --- Que...",
    updatedAt: "2026-03-05 07:21",
    status: "active",
  },
  {
    id: "6a9b9765",
    name: "System: [2026-03-04 17:59]",
    type: "GROUP",
    model: "deepseek-v3.2",
    tokens: "585K",
    cost: "$0.0829",
    lastMessage: "System: [2026-03-04 21:04:20 GMT+8] Feishu[...",
    updatedAt: "2026-03-04 13:08",
    status: "active",
  },
  {
    id: "7878d832",
    name: "System: [2026-03-04 13:32]",
    type: "Feishu Dm",
    model: "deepseek-v3.2",
    tokens: "1.95M",
    cost: "$0.2743",
    lastMessage: "[Queued messages while agent was busy] --- Que...",
    updatedAt: "2026-03-04 13:06",
    status: "active",
  },
  {
    id: "a9c7eb8b",
    name: "[Wed 2026-03-04 12:11 UTC",
    type: "Webchat",
    model: "deepseek-v3.2",
    tokens: "1.59M",
    cost: "$0.2242",
    lastMessage: "[Wed 2026-03-04 12:20 UTC] 粘贴直下 /etc/pass...",
    updatedAt: "2026-03-04 12:23",
    status: "active",
  },
];

// 工具函数
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function todayStr() {
  return toDateStr(new Date());
}
function addDays(base: string, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function SessionManagement() {
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "cron" | "groups">("all");
  const [, navigate] = useLocation();
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);
  const [deleteLogTopic, setDeleteLogTopic] = useState(false);
  const [showPluginUpgradeDialog, setShowPluginUpgradeDialog] = useState(false);
  const [selectedPluginVersion, setSelectedPluginVersion] = useState<any>(null);
  const [isUpgradingPlugin, setIsUpgradingPlugin] = useState(false);

  // 当弹窗打开时，自动选中最新版本
  useEffect(() => {
    if (showPluginUpgradeDialog && !selectedPluginVersion) {
      setSelectedPluginVersion(CLS_PLUGIN_VERSIONS[0]); // v5 是最新版本
    }
  }, [showPluginUpgradeDialog]);
  const [showClsAgreementDialog, setShowClsAgreementDialog] = useState(false);
  const [clsAgreed, setClsAgreed] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authCheckInterval, setAuthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFreeQuotaDialog, setShowFreeQuotaDialog] = useState(false);
  const [freeQuotaAgreed, setFreeQuotaAgreed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(""); // Agent 名称筛选
  const [sortColumn, setSortColumn] = useState<"tokens" | "cost" | "updatedAt">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 处理日期变化
  const handleFromChange = (value: string) => {
    setDateFrom(value);
  };

  const handleToChange = (value: string) => {
    setDateTo(value);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); }, 1000);
  };

  // 监听 localStorage 变化，实现跨页面同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "globalClsEnabled") {
        setClsEnabled(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 筛选和排序会话
  const filteredSessions = useMemo(() => {
    let sessions = [...MOCK_SESSIONS];
    
    // 排序逻辑
    sessions.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];
      
      // 处理 tokens 和 cost 的数值比较
      if (sortColumn === "tokens") {
        aVal = parseFloat(aVal.replace(/[KMB]/g, ""));
        bVal = parseFloat(bVal.replace(/[KMB]/g, ""));
        // 处理单位倍数
        if (a.tokens.includes("M")) aVal *= 1000;
        if (b.tokens.includes("M")) bVal *= 1000;
      } else if (sortColumn === "cost") {
        aVal = parseFloat(aVal.replace(/[$,]/g, ""));
        bVal = parseFloat(bVal.replace(/[$,]/g, ""));
      } else if (sortColumn === "updatedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return sessions;
  }, [sortColumn, sortDirection]);

  // 分页处理
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSessions.slice(start, start + PAGE_SIZE);
  }, [filteredSessions, currentPage]);

  const totalPages = Math.ceil(filteredSessions.length / PAGE_SIZE);

  const handleSort = (column: "tokens" | "cost" | "updatedAt") => {
    if (sortColumn === column) {
      // 同一列，切换排序方向
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 不同列，设置新列并默认降序
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ column }: { column: "tokens" | "cost" | "updatedAt" }) => {
    if (sortColumn !== column) return <div className="w-4 h-4" />;
    return sortDirection === "asc" ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const handleOpenCLS = () => {
    // 每次点击时重置授权状态，以便每次都能显示授权 Dialog
    localStorage.removeItem('clsAuthorized');
    
    // 显示授权 Dialog
    setShowAuthDialog(true);
    // 启动自动检测授权状态
    setIsCheckingAuth(true);
    const interval = setInterval(() => {
      const authorized = localStorage.getItem('clsAuthorized') === 'true';
      if (authorized) {
        // 已授权，关闭 Dialog 并继续
        setShowAuthDialog(false);
        setIsCheckingAuth(false);
        clearInterval(interval);
        // 继续开启 CLS 日志服务
        proceedWithClsSetup();
      }
    }, 2000);
    setAuthCheckInterval(interval);
  };

  const proceedWithClsSetup = () => {
    // 显示免费额度 Dialog
    setShowFreeQuotaDialog(true);
    setFreeQuotaAgreed(false);
  };

  const handleGoToAuth = () => {
    // Mock 授权流程：5 秒后自动检测授权完成
    // 不真正打开腾讯云页面，而是模拟授权完成
    // 先显示检测状态
    setIsCheckingAuth(true);
    setAuthCompleted(false);
    
    setTimeout(() => {
      localStorage.setItem('clsAuthorized', 'true');
      // 检测完成，显示完成状态
      setIsCheckingAuth(false);
      setAuthCompleted(true);
      // 1秒后自动关闭Dialog并进入下一步
      setTimeout(() => {
        setShowAuthDialog(false);
        setAuthCompleted(false);
        proceedWithClsSetup();
      }, 1000);
    }, 5000);
  };

  const handleCancelAuth = () => {
    setShowAuthDialog(false);
    setIsCheckingAuth(false);
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      setAuthCheckInterval(null);
    }
  };

  const handleConfirmFreeQuota = () => {
    if (!freeQuotaAgreed) return;
    setShowFreeQuotaDialog(false);
    setIsEnablingCls(true);
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setFreeQuotaAgreed(false);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleGoToCalcDetail = () => {
    window.open('https://cloud.tencent.com/document/product/614/45802', '_blank');
  };

  const handleCancelFreeQuota = () => {
    setShowFreeQuotaDialog(false);
    setFreeQuotaAgreed(false);
  };

  const handleConfirmClsAgreement = () => {
    if (!clsAgreed) return;
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setShowClsAgreementDialog(false);
      setClsAgreed(false);
      // 3 秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleCloseCls = () => {
    setIsClosingCls(true);
    setTimeout(() => {
      setClsEnabled(false);
      localStorage.setItem("globalClsEnabled", "false");
      setIsClosingCls(false);
      setShowCloseClsConfirm(false);
      setDeleteLogTopic(false);
      const message = deleteLogTopic ? "CLS 日志服务已关闭，日志主题资源已删除" : "CLS 日志服务已关闭";
      // toast.success(message);
    }, 1000);
  };

  const handleCloseClsConfirmCancel = () => {
    setShowCloseClsConfirm(false);
    setDeleteLogTopic(false);
  };

  return (
    <div className="page-enter space-y-8">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090b]">会话管理</h1>
          <p className="text-sm text-[#737373] mt-1">让每一轮对话，都可追溪、可分析、可优化</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker
            value={dateFrom}
            onChange={handleFromChange}
          />
          <span className="text-[#A3A3A3] text-sm">—</span>
          <DatePicker
            value={dateTo}
            onChange={handleToChange}
          />
          <Button
            variant="claw-outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="刷新数据"
            className="w-9 h-9"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* CLS 日志服务未开启提示 */}
      {!clsEnabled && (
        <>
          {/* CLS 提示弹框 */}
          <div className="bg-white border border-[#e5e5e5] rounded-[4px] py-8 px-4 mb-8 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-[14px] font-semibold text-[#09090b]">会话管理需要开启 CLS 日志服务</h3>
                <p className="text-[13px] text-[#525252] mt-1">开启后，为您赠送3个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 500台 Agent 机器3个月的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-[#355EF1] hover:underline inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
              </div>
              <Button
                onClick={handleOpenCLS}
                disabled={isEnablingCls}
                className="ml-4 text-xs h-8 px-4 whitespace-nowrap"
              >
                {isEnablingCls ? "开启中..." : "开启 CLS 日志服务"}
              </Button>
            </div>
          </div>

          {/* 卡片功能展示 */}
          <div className="space-y-4 mb-8">
            {/* 第一块：会话数据 */}
            <div className="border border-[#E5E5E5] rounded-[4px] px-6 py-5">
              <h4 className="text-[14px] font-medium text-[#737373] mb-4">开启CLS日志服务后您可以在此处获得以下观测数据：</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex items-center gap-[14px] py-5">
                  <img src="/assets/admin-session-management/session-global-monitoring.svg" alt="" className="shrink-0 w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">业务运行健康实时监控</h5>
                    <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">聚焦消息处理总量、入队效率与卡死会话，保障系统稳定运行</p>
                  </div>
                </div>
                <div className="flex items-center gap-[14px] py-5">
                  <img src="/assets/admin-session-management/session-detail-analysis.svg" alt="" className="shrink-0 w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">应用日志与 OTEL 指标全景洞察</h5>
                    <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">多维度分析日志级别与模块分布，精细化追踪消息处理、队列状态与执行耗时</p>
                  </div>
                </div>
              </div>
            </div>



            {/* 第二块：运维观测和会话管理功能 */}
            <div className="border border-[#E5E5E5] rounded-[4px] px-6 py-5">
              <h4 className="text-[14px] font-medium text-[#737373] mb-4">开启CLS日志服务后您还可以在 Tokens 监控和运维观测页面中获得以下观测数据：</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex items-center gap-[14px] py-5">
                  <img src="/assets/admin-session-management/high-token-session-control.svg" alt="" className="shrink-0 w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">高Token会话实时分析与管控</h5>
                    <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">聚焦 TOP 会话的 Token 消耗、轮次分布与耗时特征，精准定位高Token交互，优化模型调用成本与资源效率</p>
                  </div>
                </div>
                <div className="flex items-center gap-[14px] py-5">
                  <img src="/assets/admin-session-management/single-session-token-insight.svg" alt="" className="shrink-0 w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">单会话全链路Token透视</h5>
                    <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">拆解每轮交互的 Token 流量与耗时分布，可视化工具调用与上下文膨胀对成本的影响</p>
                  </div>
                </div>
                <div className="flex items-center gap-[14px] py-5">
                  <img src="/assets/admin-session-management/business-health-monitoring.svg" alt="" className="shrink-0 w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">会话全局运营态势监控</h5>
                    <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">聚合总会话数、平均轮次与工具调用量，多维度洞察渠道与模型分布，实现会话全生命周期可追溯、可分析</p>
                  </div>
                </div>
                <div className="flex items-center gap-[14px] py-5">
                  <img src="/assets/admin-session-management/app-log-otel-insight.svg" alt="" className="shrink-0 w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">会话详情与交互效率精细化分析</h5>
                    <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">聚焦会话 Token 消耗，可视化渠道与模型分布特征，精准定位高Token会话，优化资源配置与调用效率</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}



      {/* CLS 开启成功提示 */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-[4px] px-4 py-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-md">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">CLS 日志服务开启成功</p>
            </div>
          </div>
        </div>
      )}

      {/* 已开启时显示搜索框 + 关闭按钮 */}
      {clsEnabled && (
        <div className="flex items-start justify-between mb-6 gap-4">
          {/* 左侧：Agent 名称筛选 */}
          <div className="flex-1">
            <label className="text-xs font-medium text-[#525252] block mb-2">Agent名称：</label>
            <AgentCombobox
              value={selectedAgent}
              onValueChange={setSelectedAgent}
              className="max-w-xs"
            />
          </div>
           {/* 右侧：升级CLS插件 + 关闭CLS按钮 */}
          <div className="flex items-center gap-2 mt-6">
            <Button
              onClick={() => setShowPluginUpgradeDialog(true)}
              variant="outline"
              className="text-xs h-8 px-3 text-[#355EF1] border-[#355EF1] hover:bg-[#eff4ff] bg-white"
            >
              升级CLS采集插件
            </Button>
            <Button
              onClick={() => setShowCloseClsConfirm(true)}
              variant="outline"
              className="text-xs h-8 px-3 text-red-600 border-red-200 hover:bg-white bg-white"
            >
              关闭CLS服务
            </Button>
          </div>
        </div>
      )}

      {/* 仪表板 - 仅在 CLS 启用时显示 */}
      {clsEnabled && (
        <div className="space-y-8">
          {/* 顶部指标卡 */}
          <div className="grid grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => (
              <div key={card.metric} className="bg-white rounded-[4px] border border-[#e5e5e5] p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-[#737373] font-medium">{card.label}</span>
                  <div className={`w-8 h-8 rounded-[4px] bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-white`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#09090b]">{card.value}</div>
                {card.channels && (
                  <div className="mt-3 text-xs text-[#737373] space-y-1">
                    {card.channels.map((ch) => (
                      <div key={ch}>{ch}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 会话摘要表格 */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#09090b]">会话摘要一览</h2>
              <p className="text-xs text-[#A3A3A3] mt-1">按时间倒序 · 点击查看会话详情</p>
            </div>
            <div className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden"
             >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-[#fafafa]/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">会话</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">会话 ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">模型</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">轮次</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">TOKENS</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">成本</th>
                    <th className="text-right px-6 py-3">
                      <button
                        onClick={() => handleSort("updatedAt")}
                        className="flex items-center justify-end gap-2 text-xs font-medium text-[#737373] uppercase tracking-wide hover:text-[#525252] w-full"
                      >
                        更新时间
                        <SortIcon column="updatedAt" />
                      </button>
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-[#f5f5f5]/50 transition-colors">
                      <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/admin/session/${session.id}`)}>
                        <div className="text-sm text-[#525252] font-medium hover:text-[#355EF1] transition-colors">{session.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#737373] font-mono">{session.id}</td>
                      <td className="px-6 py-4 text-sm text-[#525252]">{session.model}</td>
                      <td className="px-6 py-4 text-sm text-[#737373] text-right">28</td>
                      <td className="px-6 py-4 text-sm text-[#737373] text-right font-mono">{session.tokens}</td>
                      <td className="px-6 py-4 text-sm text-[#737373] text-right font-mono">{session.cost}</td>
                      <td className="px-6 py-4 text-sm text-[#737373] text-right">{session.updatedAt}</td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          onClick={() => navigate(`/admin/session/${session.id}`)}
                          variant="outline"
                          className="text-xs h-7 px-3"
                        >
                          查看详情
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 翻页控件 */}
            <div className="px-6 py-4 border-t border-gray-50 bg-[#fafafa]/50">
              <Pagination
                total={filteredSessions.length}
                current={currentPage}
                pageSize={PAGE_SIZE}
                showTotal={(total) => `共 ${total} 条记录`}
                className="w-full justify-between"
                onChange={(page) => { setCurrentPage(page); }}
              />
            </div>
          </div>

          {/* 渠道与模型分布 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 渠道分布 */}
            <div className="bg-white rounded-[4px] border border-[#e5e5e5] p-6">
              <h3 className="text-sm font-bold text-[#09090b] mb-4">渠道分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={CHANNEL_DIST_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 模型分布 */}
            <div className="bg-white rounded-[4px] border border-[#e5e5e5] p-6">
              <h3 className="text-sm font-bold text-[#09090b] mb-4">模型分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={MODEL_DIST_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {MODEL_DIST_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* CLS 授权 Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>开通服务授权</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div className="space-y-3 flex flex-col items-center min-h-16 justify-center">
              {isCheckingAuth ? (
                <>
                  {/* 检测中的旋转动画 */}
                  <div className="w-8 h-8 border-2 border-[#355EF1] border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-xs text-[#737373] text-center">检测中...</p>
                </>
              ) : authCompleted ? (
                <>
                  {/* 检测完成后显示完成 icon */}
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-xs text-[#737373] text-center">检测到已授权</p>
                </>
              ) : null}
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelAuth}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleGoToAuth}
            >
              前往授权
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 免费额度 Dialog */}
      <Dialog open={showFreeQuotaDialog} onOpenChange={setShowFreeQuotaDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>免费额度说明</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div className="bg-[#eff4ff] border border-[#355EF1] rounded-[4px] p-4 space-y-2">
              <p className="text-sm text-[#525252]">
                为您赠送<span className="font-semibold text-[#355EF1]">3个月</span>ClawPro 专属 CLS 日志服务免费额度（共<span className="font-semibold text-[#355EF1]">3000U</span>），预估可覆盖 <span className="font-semibold text-[#355EF1]">500台</span> Agent 机器<span className="font-semibold text-[#355EF1]">3个月</span>的日志用量；超过免费额度达到上限或<span className="font-semibold text-[#355EF1]">3个月</span>到期后，CLS 将按量计费。计费详情请参考{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoToCalcDetail();
                  }}
                  className="text-[#355EF1] hover:text-[#1447E6] underline"
                >
                  计费详情
                </a>
                。
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={freeQuotaAgreed}
                onChange={(e) => setFreeQuotaAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-[#e5e5e5] text-[#355EF1] focus:ring-blue-500"
              />
              <span className="text-sm text-[#525252]">我已阅读并同意免费额度说明</span>
            </label>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelFreeQuota}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleConfirmFreeQuota}
              disabled={!freeQuotaAgreed}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* 关闭CLS服务 - 警示弹窗 */}
      <AlertDialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={handleCloseClsConfirmCancel}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">确定要关闭 CLS 日志服务吗？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-sm text-[#0A0A0A]">
                  关闭后以下功能将无法使用，<span className="text-[#DC2626]">此操作可能影响业务运行。</span>
                </p>
                <Alert variant="warning">
                  <AlertOperationInfoIcon />
                  <AlertTitle>受影响的功能</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><span className="font-medium">运维观测：</span>支持通过全链路性能监控采集核心运行指标</li>
                      <li><span className="font-medium">会话管理：</span>支持通过会话总览、会话链下钻还原及渠道模型分布分析</li>
                      <li><span className="font-medium">Tokens 监控（按会话）：</span>支持从按会话、消息维度查看 tokens、费用使用情况</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="deleteLogTopic"
                    checked={deleteLogTopic}
                    onCheckedChange={(checked) => setDeleteLogTopic(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="deleteLogTopic" className="text-sm font-medium text-[#0A0A0A] cursor-pointer">
                      同时删除关联的日志主题资源
                    </Label>
                    <p className="text-xs text-[#737373] leading-relaxed">
                      勾选后将永久删除该日志主题及所有日志数据，
                      <span className="text-[#DC2626]">数据不可恢复</span>
                      ；未删除则会持续产生存储费用。
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseClsConfirmCancel}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseCls}
              disabled={isClosingCls}
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CLS 采集插件升级对话框 - 普通弹窗 */}
      <Dialog open={showPluginUpgradeDialog} onOpenChange={setShowPluginUpgradeDialog}>
        <DialogContent
          className="sm:max-w-[720px]"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader>
            <DialogTitle>升级 CLS 采集插件</DialogTitle>
            <DialogDescription>选择要升级的版本并查看更新内容</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="rounded-[4px] border border-[#e5e5e5] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 100 }}>版本号</TableHead>
                    <TableHead>更新内容</TableHead>
                    <TableHead style={{ width: 120 }}>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLS_PLUGIN_VERSIONS.map((v) => {
                    const isUpgradeable = v.status !== 'current' && v.status !== 'deprecated';
                    const isSelected = selectedPluginVersion?.version === v.version;
                    return (
                      <TableRow
                        key={v.version}
                        onClick={() => isUpgradeable && setSelectedPluginVersion(v)}
                        data-state={isSelected ? "selected" : undefined}
                        className={
                          isUpgradeable
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-60"
                        }
                      >
                        <TableCell className="font-medium">{v.version}</TableCell>
                        <TableCell className="text-[#525252]">{v.changelog}</TableCell>
                        <TableCell>
                          {v.status === 'current' && (
                            <StatusTag variant="green">当前版本</StatusTag>
                          )}
                          {v.status === 'deprecated' && (
                            <StatusTag variant="gray">已弃用</StatusTag>
                          )}
                          {v.status === 'available' && isSelected && (
                            <StatusTag variant="blue">已选中</StatusTag>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPluginUpgradeDialog(false);
                setSelectedPluginVersion(null);
              }}
              disabled={isUpgradingPlugin}
            >
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setIsUpgradingPlugin(true);
                setTimeout(() => {
                  setIsUpgradingPlugin(false);
                  setShowPluginUpgradeDialog(false);
                  if (selectedPluginVersion) {
                    toast.success(`成功升级到 ${selectedPluginVersion?.version}`);
                  }
                }, 2000);
              }}
              disabled={isUpgradingPlugin || !selectedPluginVersion || selectedPluginVersion?.status === 'current'}
            >
              {isUpgradingPlugin ? "升级中..." : "确认升级"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
