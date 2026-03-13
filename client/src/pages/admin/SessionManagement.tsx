/**
 * SessionManagement - 会话管理页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 页面标题 + 描述
 * - 2x2 卡片网格（第三个卡片跨两列）：会话总览、会话链还原、渠道与模型分布
 * - 每个卡片带线性 icon、标题、说明文字
 */

import { BarChart3, GitBranch, PieChart } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const SESSION_CARDS = [
  {
    id: "session-overview",
    title: "会话总览",
    description:
      "一览会话数量、平均轮次、tool/skill 调用情况、渠道数量等；快速了解员工使用活跃度",
    icon: BarChart3,
    gradient: "linear-gradient(135deg, #007AFF, #5856D6)",
    span: "col-span-1",
  },
  {
    id: "session-tracing",
    title: "会话链还原",
    description:
      "支持「会话 → 消息 → 详情」三级下钻，拆解单次会话的成本构成与性能瓶颈，AI 定制优化建议",
    icon: GitBranch,
    gradient: "linear-gradient(135deg, #AF52DE, #FF2D55)",
    span: "col-span-1",
  },
  {
    id: "channel-model-distribution",
    title: "渠道与模型分布",
    description:
      "直观展示 QQ、企微等各渠道会话占比与模型使用偏好，洞察团队使用习惯",
    icon: PieChart,
    gradient: "linear-gradient(135deg, #34C759, #00C7BE)",
    span: "col-span-1",
  },
];

export default function SessionManagement() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">会话管理</h1>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
              即将开放
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            让每一轮对话，都可追溯、可分析、可优化
          </p>
        </div>

        {/* 2x2 Card Grid with third card spanning 2 columns */}
        <div className="grid grid-cols-2 gap-6">
          {SESSION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200 ${card.span}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: card.gradient }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
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
    </AdminLayout>
  );
}
