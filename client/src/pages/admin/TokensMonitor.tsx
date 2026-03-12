/**
 * TokensMonitor - 管控端 Tokens 监控页
 * 设计风格：与整体管控台保持一致，浅色卡片 + 蓝紫渐变强调色
 */
import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, ArrowUp, ArrowDown, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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

// 每天每成员的 mock 数据
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
const GLOBAL_LIMIT = 2000000;
const TODAY_RECORDS = ALL_RECORDS.filter((r) => r.date === todayStr());
const TODAY_TOTAL_TOKENS = TODAY_RECORDS.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);
const TODAY_GLOBAL_PCT = ((TODAY_TOTAL_TOKENS / GLOBAL_LIMIT) * 100).toFixed(1);

// ─── 进度条 ───────────────────────────────────────────────────────────────────
function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
    </div>
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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success("数据已刷新"); }, 1000);
  };

  const handleFromChange = (v: string) => {
    setDateFrom(v);
    setMemberPage(1);
    setModelPage(1);
  };
  const handleToChange = (v: string) => {
    setDateTo(v);
    setMemberPage(1);
    setModelPage(1);
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

  // 按成员汇总（随时间联动），按总请求数降序
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

  // 翻页切片
  const memberPaged = memberStats.slice((memberPage - 1) * PAGE_SIZE, memberPage * PAGE_SIZE);
  const modelPaged = modelStats.slice((modelPage - 1) * PAGE_SIZE, modelPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tokens 监控</h1>
            <p className="text-sm text-gray-500 mt-1">查看企业成员和模型的 Tokens 消耗情况。</p>
          </div>
          {/* 时间范围筛选 + 刷新 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFromChange(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleToChange(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
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

        {/* Overview Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* 今日全局配额消耗（不随时间联动） */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs text-gray-400">今日全局配额消耗</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{TODAY_GLOBAL_PCT}%</p>
            <ProgressBar value={TODAY_TOTAL_TOKENS} max={GLOBAL_LIMIT} />
          </div>
          {/* 以下随时间联动 */}
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
              <TabsTrigger value="member">按成员</TabsTrigger>
              <TabsTrigger value="model">按模型</TabsTrigger>
            </TabsList>
          </div>

          {/* 按成员 */}
          <TabsContent value="member">
            <p className="text-xs text-gray-400 mb-3">汇总所选时间范围内每个成员使用所有模型的消耗，按总请求数降序排列</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">成员 ID</th>
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
            <p className="text-xs text-gray-400 mb-3">汇总所选时间范围内每个模型被所有企业成员使用的消耗，按总请求数降序排列</p>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
