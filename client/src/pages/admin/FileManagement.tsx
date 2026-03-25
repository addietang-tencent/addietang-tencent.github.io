/**
 * FileManagement - 文件管理页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { Users, SlidersHorizontal, Share2, History } from "lucide-react";

const FILE_CARDS = [
  {
    id: "isolation",
    title: "空间完全隔离",
    description:
      "实现不同用户 AI 智能体存储空间的完全隔离，用户仅可访问自身名下的数据，从根源上保障数据隐私与安全",
    icon: Users,
    color: "#007AFF",
  },
  {
    id: "quota",
    title: "配额灵活可控",
    description:
      "支持为每个成员、每个 AI 智能体独立配置存储额度，管理员可根据需要随时调整，实现资源的精细化管控与成本分配",
    icon: SlidersHorizontal,
    color: "#34C759",
  },
  {
    id: "sharing",
    title: "文件安全共享",
    description:
      "一键生成带有效期、提取码及操作权限控制的外链分享链接，在便捷分享文件的同时，确保分发的安全性与管理性",
    icon: Share2,
    color: "#AF52DE",
  },
  {
    id: "version",
    title: "版本历史保护",
    description:
      "支持按需设置文件版本保留数量与周期，随时可回滚至任一历史版本，有效防范误操作与数据覆盖风险，保障文件安全",
    icon: History,
    color: "#FF9500",
  },
];

export default function FileManagement() {
  return (
    <div className="page-enter max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
          <span
            className="font-medium text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded whitespace-nowrap"
            style={{ fontSize: "11px" }}
          >
            即将开放
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          为每位用户提供专属、安全的私人云存储空间。
        </p>
      </div>

      {/* 2x2 Card Grid */}
      <div className="grid grid-cols-2 gap-6">
        {FILE_CARDS.map((card) => {
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
