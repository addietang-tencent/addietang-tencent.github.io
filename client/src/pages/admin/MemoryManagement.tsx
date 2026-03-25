/**
 * MemoryManagement - 记忆管理页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { Zap, Brain, Sparkles, ShieldCheck } from "lucide-react";

const MEMORY_CARDS = [
  {
    id: "efficiency",
    title: "效能跃升",
    description:
      "接入专业记忆组件，核心记忆能力平均提升近60%。在关键的事实与偏好召回场景，精准度提升超2.5倍",
    icon: Zap,
    color: "#FF9500",
  },
  {
    id: "core-memory",
    title: "核心记忆",
    description:
      "深刻记住您的操作习惯与决策偏好。在相关评测中，对用户长期偏好的跟踪准确率高达83.5%",
    icon: Brain,
    color: "#007AFF",
  },
  {
    id: "experience",
    title: "体验进化",
    description:
      "基于对过往对话的深度理解，提供高度个性化的建议与服务，让后续的每一次对话都「更懂你」",
    icon: Sparkles,
    color: "#AF52DE",
  },
  {
    id: "deployment",
    title: "无忧部署",
    description:
      "提供从 Free 版免费启用到 Pro 版企业级管理的平滑升级路径，记忆安全托管，支持轻松迁移",
    icon: ShieldCheck,
    color: "#34C759",
  },
];

export default function MemoryManagement() {
  return (
    <div className="page-enter max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">记忆管理</h1>
          <span
            className="font-medium text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded whitespace-nowrap"
            style={{ fontSize: "11px" }}
          >
            即将开放
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好。
        </p>
      </div>

      {/* 2x2 Card Grid */}
      <div className="grid grid-cols-2 gap-6">
        {MEMORY_CARDS.map((card) => {
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
