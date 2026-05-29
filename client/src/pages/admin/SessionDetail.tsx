/**
 * SessionDetail - 会话详情页面
 * 展示单个会话的完整信息：成本、Token、交互链路等
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { SurfaceCard } from "@/components/ui/Surface";
import { BackButton } from "@/components/ui/back-button";
import { StatusTag } from "@/components/ui/status-tag";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatNumber } from "@/components/ui/Typography";
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
      <div>
        <BackButton onClick={() => window.history.back()} />
      </div>

      {/* 会话标题 */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">会话详情</h1>
        <p className="text-sm text-[#737373] mt-1">会话 ID: {sessionInfo.id} • Agent名称: {sessionInfo.openClawName}</p>
      </div>      {/* ══ 顶部指标卡 ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-5">
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1557 0.568474C11.2759 0.547602 11.3997 0.565694 11.5083 0.621208C11.6168 0.676751 11.7039 0.766463 11.7573 0.876091C11.8107 0.985788 11.8275 1.10986 11.8042 1.22961L10.77 6.39172L14.8227 7.91125C14.9089 7.94398 14.9857 7.99716 15.0464 8.06652C15.1071 8.13609 15.1505 8.2197 15.1714 8.30968C15.1922 8.39969 15.1905 8.4939 15.1665 8.58312C15.1425 8.67222 15.0968 8.75406 15.0337 8.8214H15.0366L7.1616 17.2589L7.09421 17.3204C7.0224 17.3757 6.9373 17.4131 6.84714 17.4288L6.7573 17.4366C6.69672 17.4373 6.63627 17.4288 6.57859 17.4103L6.49461 17.3751C6.386 17.3195 6.29798 17.2299 6.24461 17.1202C6.20472 17.0381 6.18625 16.9479 6.18894 16.8575L6.19871 16.7667L7.22996 11.6105L3.17722 10.089C3.11208 10.0646 3.05213 10.0285 3.00046 9.98254L2.95164 9.93273C2.9057 9.8803 2.86992 9.82011 2.84617 9.755L2.82664 9.68859C2.80577 9.59809 2.80709 9.50378 2.83152 9.41418C2.85597 9.32456 2.90234 9.2423 2.96629 9.17492L10.8413 0.737419C10.9247 0.648358 11.0355 0.589437 11.1557 0.568474ZM5.34324 9.09972L9.1655 10.5353L8.63035 13.2111L11.1528 10.5089H11.1401L12.6479 8.89758L8.83445 7.46789L9.37058 4.78527L5.34324 9.09972Z" fill="url(#sd_icon_0)"/><defs><radialGradient id="sd_icon_0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.81201 8.99836) scale(12.3738 747.725)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
            <span className="text-sm text-[#737373]">TOKEN 总量</span>
          </div>
          <StatNumber>{sessionInfo.totalTokens}</StatNumber>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6322 7.68155L12.2953 6.10444L10.7182 1.76757C10.6198 1.49691 10.4405 1.26309 10.2047 1.09786C9.9688 0.932629 9.68779 0.843994 9.39982 0.843994C9.11184 0.843994 8.83084 0.932629 8.59498 1.09786C8.35912 1.26309 8.17983 1.49691 8.08146 1.76757L6.50435 6.10444L2.16747 7.68155C1.89682 7.77992 1.66299 7.95921 1.49776 8.19507C1.33253 8.43093 1.2439 8.71193 1.2439 8.99991C1.2439 9.28789 1.33253 9.56889 1.49776 9.80475C1.66299 10.0406 1.89682 10.2199 2.16747 10.3183L6.50435 11.8954L8.08146 16.2323C8.17983 16.5029 8.35912 16.7367 8.59498 16.902C8.83084 17.0672 9.11184 17.1558 9.39982 17.1558C9.68779 17.1558 9.9688 17.0672 10.2047 16.902C10.4405 16.7367 10.6198 16.5029 10.7182 16.2323L12.2953 11.8954L16.6322 10.3183C16.9028 10.2199 17.1366 10.0406 17.3019 9.80475C17.4671 9.56889 17.5557 9.28789 17.5557 8.99991C17.5557 8.71193 17.4671 8.43093 17.3019 8.19507C17.1366 7.95921 16.9028 7.77992 16.6322 7.68155ZM11.3489 10.4441C11.2329 10.4863 11.1277 10.5533 11.0404 10.6405C10.9532 10.7278 10.8862 10.833 10.844 10.949L9.39982 14.9209L7.9556 10.949C7.91347 10.833 7.84643 10.7278 7.7592 10.6405C7.67198 10.5533 7.56669 10.4863 7.45075 10.4441L3.4788 8.99991L7.45075 7.55569C7.56669 7.51356 7.67198 7.44653 7.7592 7.3593C7.84643 7.27208 7.91347 7.16679 7.9556 7.05085L9.39982 3.0789L10.844 7.05085C10.8862 7.16679 10.9532 7.27208 11.0404 7.3593C11.1277 7.44653 11.2329 7.51356 11.3489 7.55569L15.3208 8.99991L11.3489 10.4441Z" fill="url(#sd_icon_1)"/><defs><radialGradient id="sd_icon_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.2439 8.99991) scale(16.3118 722.702)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
            <span className="text-sm text-[#737373]">成本总量</span>
          </div>
          <StatNumber>$0.2743</StatNumber>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7085 0.84375C12.9323 0.84375 13.1469 0.932586 13.3052 1.09082C13.4634 1.24905 13.5522 1.46372 13.5522 1.6875V1.96875H14.9585C15.3315 1.96875 15.6889 2.11714 15.9526 2.38086C16.2164 2.64458 16.3647 3.00204 16.3647 3.375V14.625C16.3647 14.998 16.2164 15.3554 15.9526 15.6191C15.6889 15.8829 15.3315 16.0312 14.9585 16.0312H3.7085C3.33554 16.0312 2.97808 15.8829 2.71436 15.6191C2.45063 15.3554 2.30225 14.998 2.30225 14.625V3.375C2.30225 3.00204 2.45063 2.64458 2.71436 2.38086C2.97808 2.11714 3.33554 1.96875 3.7085 1.96875H5.11475V1.6875C5.11475 1.46372 5.20358 1.24905 5.36182 1.09082C5.52005 0.932587 5.73472 0.84375 5.9585 0.84375C6.18227 0.84375 6.39694 0.932587 6.55518 1.09082C6.71341 1.24905 6.80225 1.46372 6.80225 1.6875V1.96875H11.8647V1.6875C11.8647 1.46372 11.9536 1.24905 12.1118 1.09082C12.2701 0.932586 12.4847 0.84375 12.7085 0.84375ZM3.98975 3.65625V14.3438H14.6772V3.65625H13.5522C13.5522 3.88003 13.4634 4.0947 13.3052 4.25293C13.1469 4.41116 12.9323 4.5 12.7085 4.5C12.4847 4.5 12.2701 4.41116 12.1118 4.25293C11.9536 4.0947 11.8647 3.88003 11.8647 3.65625H6.80225C6.80225 3.88003 6.71341 4.0947 6.55518 4.25293C6.39694 4.41116 6.18227 4.5 5.9585 4.5C5.73472 4.5 5.52005 4.41116 5.36182 4.25293C5.20358 4.0947 5.11475 3.88003 5.11475 3.65625H3.98975ZM9.01709 5.70508C9.12582 5.41124 9.54117 5.41124 9.6499 5.70508L10.4731 7.92871L12.6968 8.75195C12.9905 8.86075 12.9906 9.27605 12.6968 9.38477L10.4731 10.208L9.6499 12.4316C9.54784 12.7068 9.1762 12.7242 9.04053 12.4834L9.01709 12.4316L8.19385 10.208L5.97021 9.38477C5.67641 9.27605 5.67647 8.86073 5.97021 8.75195L8.19385 7.92871L9.01709 5.70508Z" fill="url(#sd_icon_2)"/><defs><radialGradient id="sd_icon_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.30225 8.4375) scale(14.0625 672.888)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
            <span className="text-sm text-[#737373]">会话轮次</span>
          </div>
          <StatNumber>{sessionInfo.totalRounds}</StatNumber>
        </SurfaceCard>
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
        <p className="text-sm font-medium text-[#0A0A0A] mb-4">交互链</p>
        <SurfaceCard className="overflow-hidden">
          <Table scrollX={1280}>
            <TableHeader>
              <TableRow>
                <TableHead fixed="left" style={{ minWidth: 180 }}>时间</TableHead>
                <TableHead style={{ minWidth: 100 }}>角色</TableHead>
                <TableHead style={{ minWidth: 280 }}>内容</TableHead>
                <TableHead style={{ minWidth: 140 }}>模型</TableHead>
                <TableHead style={{ minWidth: 100 }}>停止原因</TableHead>
                <TableHead style={{ minWidth: 80 }}>INPUT</TableHead>
                <TableHead style={{ minWidth: 80 }}>OUTPUT</TableHead>
                <TableHead style={{ minWidth: 100 }}>CACHE R/W</TableHead>
                <TableHead style={{ minWidth: 100 }}>TOKENS</TableHead>
                <TableHead fixed="right" style={{ minWidth: 80 }}>成本</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INTERACTION_CHAIN.map((item, idx) => {
                const tokensTotal = (() => {
                  if (item.input === "—" || item.output === "—") return "—";
                  const inputNum = parseInt((item.input as string).replace("K", "")) * 1000;
                  const outputNum = parseInt(item.output as string);
                  return (inputNum + outputNum).toLocaleString();
                })();
                const roleVariant: "blue" | "gray" =
                  item.role === "user"
                    ? "blue"
                    : item.role === "assistant"
                      ? "blue"
                      : "gray";
                // assistant 用紫色覆盖（StatusTag 不支持 purple，用 className 覆盖）
                const isAssistant = item.role === "assistant";
                return (
                  <TableRow key={idx}>
                    <TableCell fixed="left" className="text-[#0A0A0A] tabular-nums">{item.timestamp}</TableCell>
                    <TableCell>
                      <StatusTag
                        mode="fill"
                        variant={roleVariant}
                        className={isAssistant ? "bg-[#F3E8FF] text-[#7E22CE]" : ""}
                      >
                        {item.role}
                      </StatusTag>
                    </TableCell>
                    <TableCell className="text-[#0A0A0A] max-w-[320px]">
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{item.content}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            {item.content}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-[#0A0A0A]">{item.model}</TableCell>
                    <TableCell className="text-[#0A0A0A]">{item.stopReason}</TableCell>
                    <TableCell className="tabular-nums text-[#0A0A0A]">{item.input}</TableCell>
                    <TableCell className="tabular-nums text-[#0A0A0A]">{item.output}</TableCell>
                    <TableCell className="tabular-nums text-[#0A0A0A]">{item.cacheRW}</TableCell>
                    <TableCell className="tabular-nums text-[#0A0A0A]">{tokensTotal}</TableCell>
                    <TableCell fixed="right" className="tabular-nums text-[#0A0A0A]">
                      {item.cost === "—" ? "—" : `$${item.cost}`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SurfaceCard>
      </div>

    </div>
  );
}
