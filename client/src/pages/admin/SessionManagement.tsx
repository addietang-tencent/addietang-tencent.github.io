/**
 * SessionManagement - 会话管理页面
 * 包含：顶部指标卡 / 会话列表表格（支持筛选）
 * 风格：浅色主题，与 Token 监控页保持一致
 */
import { useState, useMemo } from "react";
import { MessageCircle, RotateCw, Zap, Lightbulb, Globe } from "lucide-react";

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
    label: "SKILLS 调用",
    value: 1,
    metric: "skills_calls",
    icon: Lightbulb,
    iconBg: "from-green-500 to-green-600",
  },
  {
    label: "活跃渠道",
    value: 5,
    metric: "active_channels",
    icon: Globe,
    iconBg: "from-orange-500 to-orange-600",
    channels: ["CLI", "Webchat", "Feishu Group", "Feishu Dm", "QQ Dm"],
  },
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
    status: "cron",
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
    status: "cron",
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

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function SessionManagement() {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "cron" | "groups">("all");

  // 筛选会话
  const filteredSessions = useMemo(() => {
    if (filterStatus === "all") return MOCK_SESSIONS;
    if (filterStatus === "active") return MOCK_SESSIONS.filter((s) => s.status === "active");
    if (filterStatus === "cron") return MOCK_SESSIONS.filter((s) => s.status === "cron");
    if (filterStatus === "groups") return MOCK_SESSIONS.filter((s) => s.type === "GROUP");
    return MOCK_SESSIONS;
  }, [filterStatus]);

  return (
    <div className="page-enter max-w-6xl space-y-8">

      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">会话管理</h1>
        <p className="text-sm text-gray-500 mt-1">让每一轮对话，都可追溯、可分析、可优化</p>
      </div>

      {/* ══ 顶部指标卡 ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 px-4 py-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500 leading-tight">{card.label}</span>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">{card.value}</div>
              {card.channels ? (
                <div className="text-xs text-gray-400 leading-tight">
                  {card.channels.join(" / ")}
                </div>
              ) : (
                <div className="text-xs text-gray-400 font-mono">{card.metric}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ 会话列表 ════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">会话摘要一览</h2>
          <div className="flex items-center gap-2">
            {(["All", "Active", "Cron", "Groups"] as const).map((label) => {
              const value = label.toLowerCase() as typeof filterStatus;
              const isActive = filterStatus === value;
              return (
                <button
                  key={label}
                  onClick={() => setFilterStatus(value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 text-xs text-gray-500">
            按时间倒序 · 点击查看会话详情
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">会话</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">类型</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">模型</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">TOKENS</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">预计成本</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">最后消息</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">更新时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                    暂无会话
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">{session.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{session.id}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-cyan-600 bg-cyan-50 rounded">
                        {session.type}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 rounded">
                        {session.model}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-700">{session.tokens}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{session.cost}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 max-w-xs truncate">{session.lastMessage}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{session.updatedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
