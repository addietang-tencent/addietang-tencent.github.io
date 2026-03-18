/**
 * SessionManagement - 会话管理页面
 * 包含：顶部指标卡 / 会话列表表格（支持筛选）/ 渠道与模型分布
 * 风格：浅色主题，与 Token 监控页保持一致
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageCircle, RotateCw, Zap, Globe, ArrowUpRight, CheckCircle2, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from "recharts";

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
  const [sortColumn, setSortColumn] = useState<"tokens" | "cost" | "updatedAt">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem("globalClsEnabled", "true");
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
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
    }, 1000);
  };

  return (
    <div className="page-enter space-y-8">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会话管理</h1>
          <p className="text-sm text-gray-500 mt-1">让每一轮对话，都可追溯、可分析、可优化</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFromChange(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            style={{ colorScheme: 'light' }}
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleToChange(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            style={{ colorScheme: 'light' }}
          />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* CLS 日志服务未开启提示 */}
      {!clsEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">会话管理需要开启 CLS 日志服务</h3>
              <p className="text-xs text-blue-700 mt-2">授权开通后将自动采集日志及指标数据，支持通过会话总览、会话链下钻还原及渠道模型分布分析。2025年6月15日前该功能免费使用，2025年6月15日后CLS将按量计费，<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
              <div className="text-xs text-blue-700 mt-3 space-y-1 border-t border-blue-200 pt-3">
                <p className="font-medium">开启 CLS 后还将获得：</p>
                <div>• 运维观测：支持通过全链路性能监控采集核心运行指标</div>
                <div>• Tokens 监控（按会话）：支持从按会话、消息维度查看 tokens、费用使用情况</div>
              </div>
            </div>
            <Button
              onClick={handleOpenCLS}
              disabled={isEnablingCls}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 whitespace-nowrap disabled:opacity-50"
            >
              {isEnablingCls ? "开启中..." : "开启 CLS 日志服务"}
            </Button>
          </div>
        </div>
      )}

      {/* CLS 开启成功提示 */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-md">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">CLS 日志服务开启成功</p>
              <div className="text-xs text-green-700 mt-2 space-y-1">
                <div>运维观测：支持通过全链路性能监控采集核心运行指标</div>
                <div>会话管理：支持通过会话总览、会话链下钻还原及渠道模型分布分析</div>
                <div>Tokens 监控：支持从按会话、消息维度查看 tokens、费用使用情况</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 已开启时显示关闭按钮 */}
      {clsEnabled && (
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => setShowCloseClsConfirm(true)}
            variant="outline"
            className="text-xs h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
          >
            关闭CLS服务按键
          </Button>
        </div>
      )}

      {/* 仪表板 - 仅在 CLS 启用时显示 */}
      {clsEnabled && (
        <div className="space-y-8">
          {/* 顶部指标卡 */}
          <div className="grid grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => (
              <div key={card.metric} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-white`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                {card.channels && (
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
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
              <h2 className="text-lg font-bold text-gray-900">会话摘要一览</h2>
              <p className="text-xs text-gray-400 mt-1">按时间倒序 · 点击查看会话详情</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">会话</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">类型</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型</th>
                    <th className="text-right px-6 py-3">
                      <button
                        onClick={() => handleSort("tokens")}
                        className="flex items-center justify-end gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 w-full"
                      >
                        TOKENS
                        <SortIcon column="tokens" />
                      </button>
                    </th>
                    <th className="text-right px-6 py-3">
                      <button
                        onClick={() => handleSort("cost")}
                        className="flex items-center justify-end gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 w-full"
                      >
                        预计成本
                        <SortIcon column="cost" />
                      </button>
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">最后消息</th>
                    <th className="text-right px-6 py-3">
                      <button
                        onClick={() => handleSort("updatedAt")}
                        className="flex items-center justify-end gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 w-full"
                      >
                        更新时间
                        <SortIcon column="updatedAt" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/session/${session.id}`)}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 font-medium">{session.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{session.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{session.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{session.model}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right font-mono">{session.tokens}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{session.cost}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate">{session.lastMessage}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{session.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 渠道与模型分布 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 渠道分布 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">渠道分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={CHANNEL_DIST_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 模型分布 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">模型分布</h3>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 关闭 CLS 确认对话框 */}
      <Dialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确定要关闭 CLS 日志服务吗？</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <p className="text-sm text-gray-600">关闭后以下功能将无法使用：</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">运维观测：</span>
                <span>支持通过全链路性能监控采集核心运行指标</span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">会话管理：</span>
                <span>支持通过会话总览、会话链下钻还原及渠道模型分布分析</span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">Tokens 监控（按会话）：</span>
                <span>支持从按会话、消息维度查看 tokens、费用使用情况</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCloseClsConfirm(false)}>
              取消
            </Button>
            <Button
              onClick={handleCloseCls}
              disabled={isClosingCls}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
