/*
 * TokensMonitor - 管控端 Tokens 监控页
 * 设计风格：与整体管控台保持一致，浅色卡片 + 蓝紫渐变强调色
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, ArrowUp, ArrowDown, RefreshCw, ChevronLeft, ChevronRight, Info, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// ─── 工具函数 ────────────────────────────────────────────────────────────────
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
function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}
function fmt(n: number) { return n.toLocaleString(); }

// ─── Mock 数据生成 ────────────────────────────────────────────────────────────
// 生成最近 60 天每天的数据
const DAYS_HISTORY = 60;
const BASE_DATE = addDays(todayStr(), -(DAYS_HISTORY - 1));

const MEMBERS = [
  "alice@acompany.com",
  "bob@acompany.com",
  "carol@acompany.com",
  "dave@acompany.com",
  "eve@acompany.com",
  "frank@acompany.com",
  "grace@acompany.com",
  "henry@acompany.com",
  "ivy@acompany.com",
  "jack@acompany.com",
  "karen@acompany.com",
  "leo@acompany.com",
];

const MODELS = [
  "腾讯云 DeepSeek (V3 0324)",
  "腾讯云混元 (Turbo)",
  "腾讯云 DeepSeek (R1)",
  "腾讯云混元 (Pro)",
];

// 每天每用户的 mock 数据
function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

interface DayRecord {
  date: string;
  memberId: string;
  modelName: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

const ALL_RECORDS: DayRecord[] = [];
for (let i = 0; i < DAYS_HISTORY; i++) {
  const date = addDays(BASE_DATE, i);
  MEMBERS.forEach((memberId, mi) => {
    MODELS.forEach((modelName, moi) => {
      const rand = seedRand(i * 1000 + mi * 100 + moi);
      const requests = Math.floor(rand() * 80 + 5);
      const inputTokens = Math.floor(rand() * 15000 + 2000);
      const outputTokens = Math.floor(rand() * 12000 + 1500);
      ALL_RECORDS.push({ date, memberId, modelName, requests, inputTokens, outputTokens });
    });
  });
}

const TODAY_RECORDS = ALL_RECORDS.filter((r) => r.date === todayStr());
const TODAY_TOTAL_TOKENS = TODAY_RECORDS.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);

// ─── 进度条 ───────────────────────────────────────────────────────────────────
function ProgressBar({ value, max, showTooltip, isUnlimited }: { value: number; max: number | null; showTooltip?: boolean; isUnlimited?: boolean }) {
  if (isUnlimited || max === null) {
    // 无限制时显示浅灰色进度条，不显示进度
    const bar = (
      <div className="w-full bg-gray-100 rounded-full h-1.5 cursor-default">
        <div className="h-1.5 rounded-full bg-gray-300 transition-all" style={{ width: "0%" }} />
      </div>
    );
    if (!showTooltip) return bar;
    return (
      <UITooltip>
        <UITooltipTrigger asChild>
          {bar}
        </UITooltipTrigger>
        <UITooltipContent side="bottom" className="text-xs font-medium">
          已消耗 {value.toLocaleString()} Tokens（无限制）
        </UITooltipContent>
      </UITooltip>
    );
  }
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-blue-500";
  const bar = (
    <div className="w-full bg-gray-100 rounded-full h-1.5 cursor-default">
      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
  if (!showTooltip) return bar;
  return (
    <UITooltip>
      <UITooltipTrigger asChild>
        {bar}
      </UITooltipTrigger>
      <UITooltipContent side="bottom" className="text-xs font-medium">
        {value.toLocaleString()} / {max.toLocaleString()} Tokens
      </UITooltipContent>
    </UITooltip>
  );
}

// ─── 翻页组件 ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safe = Math.min(page, totalPages);
  if (totalPages <= 1) return (
    <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">共 {total} 条记录</div>
  );
  return (
    <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
      <span className="text-xs text-gray-400">共 {total} 条记录，第 {safe} / {totalPages} 页</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, safe - 1))} disabled={safe <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === safe ? "text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            style={p === safe ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, safe + 1))} disabled={safe >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function TokensMonitor() {
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [memberPage, setMemberPage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [showCLSDialog, setShowCLSDialog] = useState(false);
  const [showAKSKDialog, setShowAKSKDialog] = useState(false);
  const [secretId, setSecretId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [clsEnabled, setClsEnabled] = useState(false);
  
  // 全局配额状态 - 使用 useState 实现实时同步
  const [globalLimitMode, setGlobalLimitMode] = useState<"unlimited" | "custom">(() => {
    return (localStorage.getItem("globalLimitMode") as "unlimited" | "custom") || "unlimited";
  });
  const [globalLimitValue, setGlobalLimitValue] = useState(() => {
    return localStorage.getItem("globalLimit");
  });
  
  // 监听 localStorage 变化，实现跨页面同步
  useEffect(() => {
    const handleStorageChange = () => {
      const newMode = (localStorage.getItem("globalLimitMode") as "unlimited" | "custom") || "unlimited";
      const newValue = localStorage.getItem("globalLimit");
      setGlobalLimitMode(newMode);
      setGlobalLimitValue(newValue);
    };
    
    // 监听 storage 事件（其他标签页修改时触发）
    window.addEventListener("storage", handleStorageChange);
    
    // 监听页面可见性变化（同一标签页切换回来时触发）
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleStorageChange();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // 页面获得焦点时也更新配额设置
    const handleFocus = () => {
      handleStorageChange();
    };
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  
  // 计算全局配额
  const GLOBAL_LIMIT: number | null = globalLimitMode === "custom" && globalLimitValue ? parseInt(globalLimitValue) : (globalLimitMode === "unlimited" ? null : null);
  const TODAY_GLOBAL_PCT = GLOBAL_LIMIT === null ? "0" : ((TODAY_TOTAL_TOKENS / GLOBAL_LIMIT) * 100).toFixed(1);
  const IS_GLOBAL_UNLIMITED = GLOBAL_LIMIT === null;

  const handleRefresh = () => {
    setRefreshing(true);
    // 刷新时也重新读取 localStorage
    const newMode = (localStorage.getItem("globalLimitMode") as "unlimited" | "custom") || "unlimited";
    const newValue = localStorage.getItem("globalLimit");
    setGlobalLimitMode(newMode);
    setGlobalLimitValue(newValue);
    setTimeout(() => { setRefreshing(false); toast.success("数据已刷新"); }, 1000);
  };

  const handleOpenCLS = () => {
    setShowCLSDialog(true);
  };

  const handleSaveCLS = () => {
    setClsEnabled(true);
    setShowCLSDialog(false);
    toast.success("CLS 配置已保存");
  };

  const handleSaveAKSK = () => {
    setShowAKSKDialog(false);
    toast.success("AKSK 已保存");
  };

  // ─── 表格数据计算 ────────────────────────────────────────────────────────────
  const memberData = useMemo(() => {
    const filtered = ALL_RECORDS.filter((r) => r.date >= dateFrom && r.date <= dateTo);
    const grouped = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    filtered.forEach((r) => {
      const key = r.memberId;
      if (!grouped.has(key)) grouped.set(key, { requests: 0, inputTokens: 0, outputTokens: 0 });
      const g = grouped.get(key)!;
      g.requests += r.requests;
      g.inputTokens += r.inputTokens;
      g.outputTokens += r.outputTokens;
    });
    return Array.from(grouped, ([memberId, stats]) => ({
      memberId,
      ...stats,
      totalTokens: stats.inputTokens + stats.outputTokens,
    })).sort((a, b) => b.requests - a.requests);
  }, [dateFrom, dateTo]);

  const modelData = useMemo(() => {
    const filtered = ALL_RECORDS.filter((r) => r.date >= dateFrom && r.date <= dateTo);
    const grouped = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    filtered.forEach((r) => {
      const key = r.modelName;
      if (!grouped.has(key)) grouped.set(key, { requests: 0, inputTokens: 0, outputTokens: 0 });
      const g = grouped.get(key)!;
      g.requests += r.requests;
      g.inputTokens += r.inputTokens;
      g.outputTokens += r.outputTokens;
    });
    return Array.from(grouped, ([modelName, stats]) => ({
      modelName,
      ...stats,
      totalTokens: stats.inputTokens + stats.outputTokens,
    })).sort((a, b) => b.requests - a.requests);
  }, [dateFrom, dateTo]);

  const sessionData = useMemo(() => {
    const filtered = ALL_RECORDS.filter((r) => r.date >= dateFrom && r.date <= dateTo);
    return filtered.map((r, i) => ({
      id: i,
      memberId: r.memberId,
      modelName: r.modelName,
      date: r.date,
      requests: r.requests,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      totalTokens: r.inputTokens + r.outputTokens,
    })).sort((a, b) => b.requests - a.requests);
  }, [dateFrom, dateTo]);

  const trendData = useMemo(() => {
    const grouped = new Map<string, { inputTokens: number; outputTokens: number }>();
    ALL_RECORDS.forEach((r) => {
      if (!grouped.has(r.date)) grouped.set(r.date, { inputTokens: 0, outputTokens: 0 });
      const g = grouped.get(r.date)!;
      g.inputTokens += r.inputTokens;
      g.outputTokens += r.outputTokens;
    });
    return Array.from(grouped, ([date, stats]) => ({
      date,
      ...stats,
      total: stats.inputTokens + stats.outputTokens,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const memberPageData = memberData.slice((memberPage - 1) * PAGE_SIZE, memberPage * PAGE_SIZE);
  const modelPageData = modelData.slice((modelPage - 1) * PAGE_SIZE, modelPage * PAGE_SIZE);
  const sessionPageData = sessionData.slice((sessionPage - 1) * PAGE_SIZE, sessionPage * PAGE_SIZE);

  // ─── 渲染 ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 标题 + 日期选择 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tokens 监控</h1>
          <p className="text-sm text-gray-500 mt-1">查看企业用户和模型的 Tokens 消耗情况。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-600">从</Label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-600">到</Label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors" title="刷新数据">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-400">总请求数</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(memberData.reduce((s, m) => s + m.requests, 0))}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <ArrowUp className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-400">输入 Tokens</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(memberData.reduce((s, m) => s + m.inputTokens, 0))}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-400">输出 Tokens</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(memberData.reduce((s, m) => s + m.outputTokens, 0))}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-400">总 Tokens</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(memberData.reduce((s, m) => s + m.totalTokens, 0))}</p>
        </div>
      </div>

      {/* 全局配额卡片 */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400">今日全局配额消耗</p>
              <UITooltip>
                <UITooltipTrigger asChild>
                  <span className="cursor-default">
                    <Info className="w-3 h-3 text-gray-300 hover:text-gray-400 transition-colors" />
                  </span>
                </UITooltipTrigger>
                <UITooltipContent side="top" className="max-w-[240px] text-xs">
                  {IS_GLOBAL_UNLIMITED ? "全局配额已设置为无限制，无需关注消耗占比" : "此处统计所有用户使用所有公司配置模型的总 Tokens 占每日全局 Tokens 上限的占比，按自然日统计和刷新"}
                </UITooltipContent>
              </UITooltip>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-gray-900">{TODAY_GLOBAL_PCT}%</p>
            {IS_GLOBAL_UNLIMITED && <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 rounded">无限制</span>}
          </div>
          <ProgressBar value={TODAY_TOTAL_TOKENS} max={GLOBAL_LIMIT} showTooltip isUnlimited={IS_GLOBAL_UNLIMITED} />
        </div>
      </div>

      {/* 趋势图 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          最近 7 天 Tokens 趋势
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData.slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#999" style={{ fontSize: "12px" }} />
            <YAxis stroke="#999" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="inputTokens" stroke="#8b5cf6" strokeWidth={2} dot={false} name="输入 Tokens" />
            <Line type="monotone" dataKey="outputTokens" stroke="#ec4899" strokeWidth={2} dot={false} name="输出 Tokens" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 表格标签 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
        <Tabs defaultValue="member" className="w-full">
          <TabsList className="border-b border-gray-100 bg-transparent px-6 py-0 rounded-none">
            <TabsTrigger value="member" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium">按用户</TabsTrigger>
            <TabsTrigger value="model" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium ml-6">按模型</TabsTrigger>
            <TabsTrigger value="session" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium ml-6">按会话</TabsTrigger>
          </TabsList>

          {/* 按用户 */}
          <TabsContent value="member" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">用户 ID</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">总请求数</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">输入 Tokens</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">输出 Tokens</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">总 Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {memberPageData.map((m) => (
                    <tr key={m.memberId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{m.memberId}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(m.requests)}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(m.inputTokens)}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(m.outputTokens)}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">{fmt(m.totalTokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={memberPage} total={memberData.length} onChange={setMemberPage} />
          </TabsContent>

          {/* 按模型 */}
          <TabsContent value="model" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">模型</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">总请求数</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">输入 Tokens</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">输出 Tokens</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">总 Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {modelPageData.map((m) => (
                    <tr key={m.modelName} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{m.modelName}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(m.requests)}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(m.inputTokens)}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(m.outputTokens)}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">{fmt(m.totalTokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={modelPage} total={modelData.length} onChange={setModelPage} />
          </TabsContent>

          {/* 按会话 */}
          <TabsContent value="session" className="m-0">
            <div className="px-6 py-3 text-xs text-gray-500 border-b border-gray-100">
              汇总所选时间范围内每个用户使用所有模型的消耗，按总请求数降序排列
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">用户 ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">模型</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">日期</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">请求数</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">输入 Tokens</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">输出 Tokens</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">总 Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionPageData.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{s.memberId}</td>
                      <td className="px-6 py-3 text-gray-600">{s.modelName}</td>
                      <td className="px-6 py-3 text-gray-600">{s.date}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(s.requests)}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(s.inputTokens)}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(s.outputTokens)}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">{fmt(s.totalTokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={sessionPage} total={sessionData.length} onChange={setSessionPage} />
          </TabsContent>
        </Tabs>
      </div>

      {/* CLS 对话框 */}
      <Dialog open={showCLSDialog} onOpenChange={setShowCLSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置 CLS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>CLS 实例 ID</Label>
              <input type="text" placeholder="输入 CLS 实例 ID" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <Label>日志主题</Label>
              <input type="text" placeholder="输入日志主题" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCLSDialog(false)}>取消</Button>
            <Button onClick={handleSaveCLS} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AKSK 对话框 */}
      <Dialog open={showAKSKDialog} onOpenChange={setShowAKSKDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置 AKSK</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Secret ID</Label>
              <input type="text" placeholder="输入 Secret ID" value={secretId} onChange={(e) => setSecretId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <Label>Secret Key</Label>
              <input type="password" placeholder="输入 Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAKSKDialog(false)}>取消</Button>
            <Button onClick={handleSaveAKSK} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
