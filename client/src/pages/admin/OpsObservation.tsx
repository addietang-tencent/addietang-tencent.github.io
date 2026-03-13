/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import AdminLayout from "@/components/AdminLayout";
import { Activity, Heart, AlertCircle } from "lucide-react";

const OPS_CARDS = [
  {
    id: "performance",
    title: "性能监控",
    description:
      "采集消息处理速率、队列等待时间、执行耗时等全链路指标，结合日志与子系统维度快速定位瓶颈与异常",
    icon: Activity,
    color: "#007AFF",
  },
  {
    id: "health",
    title: "健康监测",
    description:
      "一屏聚合处理量、错误率、工具调用成功率、卡死会话等核心指标，全方位掌握系统运行状态",
    icon: Heart,
    color: "#FF2D55",
  },
  {
    id: "alert",
    title: "智能告警",
    description:
      "内置成本突增、接口异常等多维告警规则，异常即时推送至QQ、企微等渠道，第一时间触达",
    icon: AlertCircle,
    color: "#FF9500",
  },
];

export default function OpsObservation() {
  return (
    <AdminLayout>
      <div className="page-enter max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">运维观测</h1>
            <span
              className="font-medium text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded whitespace-nowrap"
              style={{ fontSize: "11px" }}
            >
              即将开放
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            全方位守护系统稳定运行，从被动救火到主动防御
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {OPS_CARDS.map((card) => {
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
    </AdminLayout>
  );
}
