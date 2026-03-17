/**
 * SessionDetail - 会话详情页面
 * 展示单个会话的完整信息：成本、Token、交互链路等
 */
import { useLocation } from "wouter";
import { ArrowLeft, MessageSquare, DollarSign, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

// 每轮成本数据
const COST_PER_ROUND = [
  { round: 1, cost: 0.0012 },
  { round: 2, cost: 0.0024 },
  { round: 3, cost: 0.0018 },
  { round: 4, cost: 0.0024 },
  { round: 5, cost: 0.0025 },
  { round: 6, cost: 0.0025 },
  { round: 7, cost: 0.0024 },
  { round: 8, cost: 0.0025 },
  { round: 9, cost: 0.0024 },
];

// Token 流量数据
const TOKEN_FLOW = [
  { round: 1, input: 17, output: 315 },
  { round: 2, input: 17, output: 100 },
  { round: 3, input: 17, output: 109 },
  { round: 4, input: 17, output: 185 },
  { round: 5, input: 18, output: 185 },
  { round: 6, input: 18, output: 188 },
  { round: 7, input: 18, output: 185 },
  { round: 8, input: 18, output: 185 },
  { round: 9, input: 18, output: 185 },
];

// 交互链数据
const INTERACTION_CHAIN = [
  {
    round: 1,
    role: "user",
    content: "你能干啥",
    model: "—",
    stopReason: "—",
    input: "—",
    output: "—",
    cacheRW: "—",
    tokens: "—",
    cost: "—",
    duration: "—",
  },
  {
    round: 2,
    role: "assistant",
    content: "你好！我是你的 AI 助手。我能帮你做很多事情，包括...",
    model: "deepseek-v3.2",
    stopReason: "stop",
    input: "17K",
    output: "315",
    cacheRW: "0/0",
    tokens: "17K",
    cost: "$0.0024",
    duration: "13.6s",
  },
  {
    round: 3,
    role: "user",
    content: "你管理一下我在伊朗的局势",
    model: "—",
    stopReason: "—",
    input: "—",
    output: "—",
    cacheRW: "—",
    tokens: "—",
    cost: "—",
    duration: "—",
  },
  {
    round: 4,
    role: "assistant",
    content: "我是一个 AI 助手，无法直接管理现实中的政治局势。但我可以帮助你分析...",
    model: "deepseek-v3.2",
    stopReason: "toolUse",
    input: "17K",
    output: "100",
    cacheRW: "0/0",
    tokens: "17K",
    cost: "$0.0024",
    duration: "6.8s",
  },
  {
    round: 5,
    role: "tool",
    content: '{"status": "error", "tool": "web_fetch", "error": "missing_brave_api_key", "message": "web_sear...',
    model: "—",
    stopReason: "—",
    input: "—",
    output: "—",
    cacheRW: "—",
    tokens: "—",
    cost: "—",
    duration: "—",
  },
  {
    round: 6,
    role: "assistant",
    content: "让我查证这个信息。我是一个 AI 助手，无法直接管理现实中的政治局势...",
    model: "deepseek-v3.2",
    stopReason: "toolUse",
    input: "18K",
    output: "185",
    cacheRW: "0/0",
    tokens: "18K",
    cost: "$0.0025",
    duration: "7.5s",
  },
];

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface SessionDetailProps {
  params?: { id: string };
}

export default function SessionDetail({ params }: SessionDetailProps) {
  // 从路由参数中提取 session ID
  const sessionId = params?.id || "fb766833";

  // Mock 会话信息
  const sessionInfo = {
    id: sessionId,
    name: "你能干啥 / 你管理一下我在伊朗的局势",
    channel: "Feishu Dm",
    model: "deepseek-v3.2",
    totalCost: "$0.2743",
    avgCostPerRound: "$0.0076",
    totalTokens: "1.95M",
    totalRounds: 63,
    lastActiveTime: "2026-03-04 21:06",
  };

  return (
    <div className="page-enter max-w-7xl space-y-8">

      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>
      </div>

      {/* 会话标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{sessionInfo.name}</h1>
        <p className="text-sm text-gray-500 mt-1">会话 ID: {sessionInfo.id}</p>
      </div>

      {/* ══ 顶部指标卡 ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className="bg-white rounded-2xl border border-gray-100 px-4 py-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-500">会话成本</span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{sessionInfo.totalCost}</div>
          <div className="text-xs text-gray-400 mt-1">total_cost</div>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 px-4 py-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-500">平均轮次成本</span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{sessionInfo.avgCostPerRound}</div>
          <div className="text-xs text-gray-400 mt-1">avg_cost_per_round</div>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 px-4 py-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-500">TOKEN 总量</span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{sessionInfo.totalTokens}</div>
          <div className="text-xs text-gray-400 mt-1">total_tokens</div>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 px-4 py-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-500">会话轮次</span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{sessionInfo.totalRounds}</div>
          <div className="text-xs text-gray-400 mt-1">total_rounds</div>
        </div>
      </div>



      {/* ══ 图表区 ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-5">

        {/* 每轮成本 */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-700">每轮成本</span>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">cost_per_round</span>
          </div>
          <div className="px-4 pt-4 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={COST_PER_ROUND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="round" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  formatter={(value: number) => `$${value.toFixed(4)}`}
                />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token 流量 */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-700">Token 流量</span>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">input_vs_output</span>
          </div>
          <div className="px-4 pt-4 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={TOKEN_FLOW} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="round" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="input" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="output" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ══ 交互链 ═════════════════════════════════════════════════════════════ */}
      <div className="col-span-3">
        <p className="text-sm font-medium text-gray-700 mb-4">交互链</p>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">角色</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">内容</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">停止原因</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">INPUT</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">OUTPUT</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CACHE R/W</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">TOKENS</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">成本</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">耗时</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {INTERACTION_CHAIN.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{item.round}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        item.role === "user" ? "bg-blue-100 text-blue-700" :
                        item.role === "assistant" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.content}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.stopReason}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.input}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.output}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.cacheRW}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right font-mono">{item.tokens}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.cost}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
