/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 页面标题、描述
 * - 3个功能卡片（2列布局）
 * - 每个卡片带线性icon、标题和说明文字
 */
import AdminLayout from "@/components/AdminLayout";
import { Activity, Heart, AlertCircle } from "lucide-react";

const OpsObservation = () => {
  const cards = [
    {
      title: "性能监控",
      description: "采集消息处理速率、队列等待时间、执行耗时等全链路指标，结合日志与子系统维度快速定位瓶颈与异常",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "健康监测",
      description: "一屏聚合处理量、错误率、工具调用成功率、卡死会话等核心指标，全方位掌握系统运行状态",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "智能告警",
      description: "内置成本突增、接口异常等多维告警规则，异常即时推送至QQ、企微等渠道，第一时间触达",
      icon: AlertCircle,
      color: "text-amber-600",
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">运维观测</h1>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
            即将开放
          </span>
        </div>
        <p className="text-gray-500">全方位守护系统稳定运行，从被动救火到主动防御</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Icon className={`w-6 h-6 flex-shrink-0 ${card.color}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default OpsObservation;
