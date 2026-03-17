/**
 * TokensMonitor - 管控端 Tokens 监控页
 * 设计风格：与整体管控台保持一致，浅色卡片 + 蓝紫渐变强调色
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, ArrowUp, ArrowDown, RefreshCw, ChevronLeft, ChevronRight, Info, AlertCircle, ArrowUpRight } from "lucide-react";
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

// 今日全局配额（固定）
// 注意：GLOBAL_LIMIT 为 null 表示无限制
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
  const [, navigate] = useLocation(); // 在组件顶级调用 useLocation
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [memberPage, setMemberPage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [clsEnabled, setClsEnabled] = useState(() => {
    return localStorage.getItem("tokensMonitorClsEnabled") === "true";
  });
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);
  const [globalLimit, setGlobalLimit] = useState<number | null>(() => {
    const mode = localStorage.getItem("globalLimitMode");
    if (mode === "unlimited") return null;
    const value = localStorage.getItem("globalLimit");
    return value ? parseInt(value, 10) : 2000000;
  });

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      const mode = localStorage.getItem("globalLimitMode");
      if (mode === "unlimited") {
        setGlobalLimit(null);
      } else {
        const value = localStorage.getItem("globalLimit");
        setGlobalLimit(value ? parseInt(value, 10) : 2000000);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success("数据已刷新"); }, 1000);
  };

  const handleOpenCLS = () => {
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem("tokensMonitorClsEnabled", "true");
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
      localStorage.setItem("tokensMonitorClsEnabled", "false");
      setIsClosingCls(false);
      setShowCloseClsConfirm(false);
      toast.success("CLS 日志服务已关闭");
    }, 1000);
  };

  // 计算全局配额百分比
  const TODAY_GLOBAL_PCT = globalLimit === null ? "0" : ((TODAY_TOTAL_TOKENS / globalLimit) * 100).toFixed(1);
  const IS_GLOBAL_UNLIMITED = globalLimit === null;

  const handleFromChange = (v: string) => {
    setDateFrom(v);
    setMemberPage(1);
    setModelPage(1);
    setSessionPage(1);
  };
  const handleToChange = (v: string) => {
    setDateTo(v);
    setMemberPage(1);
    setModelPage(1);
    setSessionPage(1);
  };

  // 有效时间范围
  const effectiveFrom = dateFrom || today;
  const effectiveTo = dateTo || today;
  const isSingleDay = effectiveFrom === effectiveTo;

  // 筛选范围内的记录
  const rangeRecords = useMemo(
    () => ALL_RECORDS.filter((r) => r.date >= effectiveFrom && r.date <= effectiveTo),
    [effectiveFrom, effectiveTo]
  );

  // 总览指标（随时间联动）
  const totalRequests = rangeRecords.reduce((s, r) => s + r.requests, 0);
  const totalInput = rangeRecords.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutput = rangeRecords.reduce((s, r) => s + r.outputTokens, 0);
  const totalTokens = totalInput + totalOutput;

  // 折线图数据
  const chartData = useMemo(() => {
    if (isSingleDay) {
      // 单日：展示最近 7 天
      return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(today, i - 6);
        const recs = ALL_RECORDS.filter((r) => r.date === date);
        return {
          date: date.slice(5), // MM-DD
          输入Tokens: recs.reduce((s, r) => s + r.inputTokens, 0),
          输出Tokens: recs.reduce((s, r) => s + r.outputTokens, 0),
        };
      });
    } else {
      // 时间段：展示每天
      const days = daysBetween(effectiveFrom, effectiveTo);
      return Array.from({ length: days + 1 }, (_, i) => {
        const date = addDays(effectiveFrom, i);
        const recs = ALL_RECORDS.filter((r) => r.date === date);
        return {
          date: date.slice(5),
          输入Tokens: recs.reduce((s, r) => s + r.inputTokens, 0),
          输出Tokens: recs.reduce((s, r) => s + r.outputTokens, 0),
        };
      });
    }
  }, [isSingleDay, effectiveFrom, effectiveTo, today]);

  // 按用户汇总（随时间联动），按总请求数降序
  const memberStats = useMemo(() => {
    const map = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    rangeRecords.forEach((r) => {
      const cur = map.get(r.memberId) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
      map.set(r.memberId, {
        requests: cur.requests + r.requests,
        inputTokens: cur.inputTokens + r.inputTokens,
        outputTokens: cur.outputTokens + r.outputTokens,
      });
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, total: v.inputTokens + v.outputTokens }))
      .sort((a, b) => b.requests - a.requests);
  }, [rangeRecords]);

  // 按模型汇总（随时间联动），按总请求数降序
  const modelStats = useMemo(() => {
    const map = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    rangeRecords.forEach((r) => {
      const cur = map.get(r.modelName) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
      map.set(r.modelName, {
        requests: cur.requests + r.requests,
        inputTokens: cur.inputTokens + r.inputTokens,
        outputTokens: cur.outputTokens + r.outputTokens,
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, total: v.inputTokens + v.outputTokens }))
      .sort((a, b) => b.requests - a.requests);
  }, [rangeRecords]);

  // 按会话汇总（高成本 TOP 5），按成本降序
  interface SessionStat {
    sessionId: string;
    sessionName: string;
    channel: string;
    model: string;
    lastActiveTime: string;
    rounds: number;
    tokens: number;
    cost: number;
    duration: string;
  }
  const sessionStats: SessionStat[] = [
    { sessionId: "fb766833", sessionName: "你能干啥 / 你管理一下我在伊朗的局势", channel: "Feishu Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-04 21:06", rounds: 63, tokens: 1950000, cost: 0.2743, duration: "454m 1s" },
    { sessionId: "06468225", sessionName: "我感觉现在仅表盘可观测细节这人，...", channel: "Feishu Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-08 13:14", rounds: 51, tokens: 1880000, cost: 0.2700, duration: "28m 52s" },
    { sessionId: "a9c7eb8b", sessionName: "请帮我列出 /etc 目录下所有 .conf ...", channel: "Webchat", model: "deepseek-v3.2", lastActiveTime: "2026-03-04 20:23", rounds: 47, tokens: 1590000, cost: 0.2242, duration: "12m 5s" },
    { sessionId: "a46be600", sessionName: "nihao / 帮我看看你的session-cost...", channel: "QQ Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-07 23:29", rounds: 35, tokens: 965000, cost: 0.1359, duration: "679m 41s" },
    { sessionId: "7bec562c", sessionName: "你还在吗 / 我是觉得现在 openclaw 仍...", channel: "Feishu Group", model: "hunyuan-turbos-latest", lastActiveTime: "2026-03-08 21:58", rounds: 28, tokens: 755000, cost: 0.1076, duration: "548m 57s" },
  ];
  const sessionPaged = sessionStats.slice((sessionPage - 1) * PAGE_SIZE, sessionPage * PAGE_SIZE);

  // 翻页切片
  const memberPaged = memberStats.slice((memberPage - 1) * PAGE_SIZE, memberPage * PAGE_SIZE);
  const modelPaged = modelStats.slice((modelPage - 1) * PAGE_SIZE, modelPage * PAGE_SIZE);

  return (
      <div className="page-enter">
        {/* Header */}




        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tokens 监控</h1>
            <p className="text-sm text-gray-500 mt-1">查看企业用户和模型的 Tokens 消耗情况。</p>
          </div>
          {/* 时间范围筛选 + 刷新 */}
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

        {/* Overview Cards - 始终显示 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* 随时间联动的四张卡片 */}
          {[
            { label: "总请求数", value: fmt(totalRequests), icon: TrendingUp, color: "from-blue-500 to-blue-600" },
            { label: "输入 Tokens", value: fmt(totalInput), icon: ArrowUp, color: "from-indigo-500 to-indigo-600" },
            { label: "输出 Tokens", value: fmt(totalOutput), icon: ArrowDown, color: "from-purple-500 to-purple-600" },
            { label: "总 Tokens", value: fmt(totalTokens), icon: Zap, color: "from-blue-600 to-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
          {/* 今日全局配额消耗（不随时间联动，放末尾） */}
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
              {IS_GLOBAL_UNLIMITED && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">无限制</span>}
            </div>
            <ProgressBar value={TODAY_TOTAL_TOKENS} max={globalLimit} showTooltip isUnlimited={IS_GLOBAL_UNLIMITED} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <p className="text-sm font-medium text-gray-700 mb-4">
            {isSingleDay ? "最近 7 天 Tokens 趋势" : "所选时间段 Tokens 趋势"}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value: number) => [value.toLocaleString(), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="输入Tokens" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="输出Tokens" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detail Tabs */}
        <Tabs defaultValue="member">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="member">按用户</TabsTrigger>
              <TabsTrigger value="model">按模型</TabsTrigger>
              <TabsTrigger value="session">按会话</TabsTrigger>
            </TabsList>
          </div>

          {/* 按用户 */}
          <TabsContent value="member">
            <p className="text-xs text-gray-400 mb-3">汇总所选时间范围内每个用户使用所有模型的消耗，按总请求数降序排列</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">用户 ID</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总请求数</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输入 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输出 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总 Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {memberPaged.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>
                  ) : memberPaged.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{m.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.requests)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.inputTokens)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.outputTokens)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{fmt(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={memberPage} total={memberStats.length} onChange={setMemberPage} />
            </div>
          </TabsContent>

          {/* 按模型 */}
          <TabsContent value="model">
            <p className="text-xs text-gray-400 mb-3">汇总所选时间范围内每个模型被所有企业用户使用的消耗，按总请求数降序排列</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型名称</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总请求数</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输入 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输出 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总 Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {modelPaged.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>
                  ) : modelPaged.map((m) => (
                    <tr key={m.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.requests)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.inputTokens)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.outputTokens)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{fmt(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={modelPage} total={modelStats.length} onChange={setModelPage} />
            </div>
          </TabsContent>

          {/* 按会话 */}
          <TabsContent value="session">
            {!clsEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900">Tokens 监控（按会话）需要开启 CLS 日志服务</h3>
                    <p className="text-xs text-blue-700 mt-2">授权开通后将自动采集日志及指标数据，支持从按会话、消息维度查看 tokens、費用使用情况。CLS 根据用量采用资源包或按量计费，<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
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
            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                <span className="text-sm font-medium text-green-800">CLS 日志服务开启成功</span>
              </div>
            )}
            {clsEnabled && (
              <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400">展示高成本会话 TOP 5，点击查看会话详情</p>
                <Button
                  onClick={() => setShowCloseClsConfirm(true)}
                  variant="outline"
                  className="text-xs h-7 px-3 text-gray-600 hover:text-red-600 hover:border-red-200"
                >
                  关闭CLS
                </Button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">会话</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">渠道</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">最后活动时间</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">轮次</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">TOKENS</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">预计成本</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">耗时</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessionPaged.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>
                    ) : sessionPaged.map((s) => {
                      return (
                      <tr key={s.sessionId} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/session/${s.sessionId}`)}>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{s.sessionName}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{s.sessionId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.channel}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.model}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.lastActiveTime}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{s.rounds}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right font-mono">{(s.tokens / 1000000).toFixed(2)}M</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">${s.cost.toFixed(4)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{s.duration}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={sessionPage} total={sessionStats.length} onChange={setSessionPage} />
              </div>
              </>
            )}
          </TabsContent>
        </Tabs>

      {/* 关闭 CLS 确认对话框 */}
      <Dialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确定要关闭 CLS 日志服务吗？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 my-4">关闭后将无法查看该页面的数据仪表板。</p>
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
