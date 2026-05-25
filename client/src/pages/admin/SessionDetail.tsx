/**
 * SessionDetail - 会话详情页面
 * 展示单个会话的完整信息：成本、Token、交互链路等
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MessageSquare, Zap } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

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
    timestamp: "2026-03-04 13:32:00",
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
    timestamp: "2026-03-04 13:32:13",
    role: "assistant",
    content: "你好！我是你的 AI 助手。我能帮你做很多事情，包括...",
    model: "deepseek-v3.2",
    stopReason: "stop",
    input: "17K",
    output: "315",
    cacheRW: "0/0",
    tokens: "17K",
    cost: "0.0024",
    duration: "13.6s",
  },
  {
    timestamp: "2026-03-04 13:32:45",
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
    timestamp: "2026-03-04 13:32:52",
    role: "assistant",
    content: "我是一个 AI 助手，无法直接管理现实中的政治局势。但我可以帮助你分析...",
    model: "deepseek-v3.2",
    stopReason: "toolUse",
    input: "17K",
    output: "100",
    cacheRW: "0/0",
    tokens: "17K",
    cost: "0.0024",
    duration: "6.8s",
  },
  {
    timestamp: "2026-03-04 13:32:59",
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
    cost: "0.0025",
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
    name: "会话详情",
    channel: "Feishu Dm",
    model: "deepseek-v3.2",
    totalCost: "$0.2743",
    avgCostPerRound: "$0.0076",
    totalTokens: "1.95M",
    totalRounds: 63,
    lastActiveTime: "2026-03-04 21:06",
    openClawName: "Agent-A", // Agent 名称
  };

  return (
    <div className="page-enter space-y-8">

      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-[#737373] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>
      </div>

      {/* 会话标题 */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">会话详情</h1>
        <p className="text-sm text-[#737373] mt-1">会话 ID: {sessionInfo.id} • Agent名称: {sessionInfo.openClawName}</p>
      </div>      {/* ══ 顶部指标卡 ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-4">       <div
          className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-4"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-[#737373]">TOKEN 总量</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0A0A0A]">{sessionInfo.totalTokens}</div>

        </div>

        <div
          className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-4"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-[#737373]">成本总量</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0A0A0A]">$0.2743</div>

        </div>

        <div
          className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-4"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-[#737373]">会话轮次</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0A0A0A]">{sessionInfo.totalRounds}</div>

        </div>
      </div>



      {/* ══ 图表区 ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-5">

        {/* Token 流量 */}
        <div
          className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-medium text-[#334155]">Token 流量</span>

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

        {/* 成本趋势 */}
        <div
          className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-medium text-[#334155]">成本趋势</span>

          </div>
          <div className="px-4 pt-4 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={TOKEN_FLOW.map((item, idx) => ({ minute: idx + 1, cost: (0.0024 * (item.input + item.output) / 1000).toFixed(4) }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="minute" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ══ 交互链 ═════════════════════════════════════════════════════════════ */}
      <div>
        <p className="text-sm font-medium text-[#334155] mb-4">交互链</p>
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden"
         >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">时间</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">角色</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">内容</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">模型</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">停止原因</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">INPUT</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">OUTPUT</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">CACHE R/W</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">TOKENS</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">成本</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {INTERACTION_CHAIN.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#737373]">{item.timestamp}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        item.role === "user" ? "bg-blue-100 text-[#355EF1]" :
                        item.role === "assistant" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-[#334155]"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373] max-w-xs truncate">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.content}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            {item.content}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373]">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.model}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.model}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373]">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.stopReason}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.stopReason}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373] text-right">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.input}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.input}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373] text-right">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.output}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.output}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373] text-right">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.cacheRW}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.cacheRW}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373] text-right font-mono">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{(() => {
                              if (item.input === "—" || item.output === "—") return "—";
                              // Handle input with K suffix (e.g., "17K" -> 17000)
                              const inputStr = (item.input as string).replace('K', '');
                              const inputNum = parseInt(inputStr) * 1000;
                              const outputNum = parseInt(item.output as string);
                              return (inputNum + outputNum).toLocaleString();
                            })()}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {(() => {
                              if (item.input === "—" || item.output === "—") return "—";
                              const inputStr = (item.input as string).replace('K', '');
                              const inputNum = parseInt(inputStr) * 1000;
                              const outputNum = parseInt(item.output as string);
                              return (inputNum + outputNum).toLocaleString();
                            })()}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#737373] text-right font-mono">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{item.cost === "—" ? "—" : `$${item.cost}`}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.cost === "—" ? "—" : `$${item.cost}`}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </td>
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
