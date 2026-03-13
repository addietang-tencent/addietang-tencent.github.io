/**
 * SessionManagement - 会话管理页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { BarChart3, GitBranch, PieChart } from "lucide-react";

const SESSION_CARDS = [
  {
    id: "session-overview",
    title: "会话总览",
    description:
      "一览会话数量、平均轮次、tool/skill 调用情况、渠道数量等；快速了解员工使用活跃度",
    icon: BarChart3,
    color: "#007AFF",
  },
  {
    id: "session-tracing",
    title: "会话链还原",
    description:
      "支持「会话 → 消息 → 详情」三级下钒，拆解单次会话的成本构成与性能瓶颈，AI 定制优化建议",
    icon: GitBranch,
    color: "#AF52DE",
  },
  {
    id: "channel-model-distribution",
    title: "渠道与模型分布",
    description:
      "直观展示 QQ、企微、飞书、钉钉等各渠道会话占比与模型使用偏好，洞察团队使用习惯",
    icon: PieChart,
    color: "#34C759",
  },
];

export default function SessionManagement() {
  return (
      <div className="page-enter max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">会话管理</h1>
            <span
              className="font-medium text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded whitespace-nowrap"
              style={{ fontSize: "11px" }}
            >
              即将开放
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            让每一轮对话，都可追溯、可分析、可优化
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {SESSION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: card.color }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
