/**
 * CloudDevManagement - 管控端云开发管理页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 * 管理企业云开发环境的创建、分配与生命周期
 */

import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  Building2,
  Smartphone,
  Shield,
} from "lucide-react";

const CARD_SHADOW =
  "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)";

// 云开发能力说明数据 — icon 背景色遵循蓝绿紫橙主题色规范
const CLOUD_DEV_FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
}[] = [
  {
    icon: MessageSquare,
    title: "说话即上线",
    description:
      "用自然语言描述需求，AI 自动完成代码生成、数据库搭建、云端部署的全流程，一句话交付完整应用",
    iconBg: "#2E7CF2",
  },
  {
    icon: Building2,
    title: "企业应用即刻落地",
    description:
      "库存管理、CRM、ERP 等业务系统，AI 理解流程逻辑并自动构建，替代传统开发周期，让业务需求快速固化为可用系统",
    iconBg: "#22C55E",
  },
  {
    icon: Smartphone,
    title: "企业小程序快速交付",
    description:
      "企微应用、内部工具小程序，AI 端到端生成并部署，让企业内部数字化触达每一位员工的手机",
    iconBg: "#A855F7",
  },
  {
    icon: Shield,
    title: "企业级安全与弹性",
    description:
      "依托腾讯云安全体系，自动配置权限与防护规则；按需弹性伸缩，智能优化资源配置，安全可靠的同时持续降本",
    iconBg: "#FD9604",
  },
];

export default function CloudDevManagement() {
  return (
    <div className="page-enter max-w-5xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">云开发管理</h1>
          <span
            className="font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded"
            style={{ fontSize: "12px" }}
          >
            即将开放
          </span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          管理企业云开发环境的创建、分配与生命周期。管理员可为成员分配独立的云开发环境，统一配置运行环境与规格，为成员提供应用开发及部署能力。
        </p>
      </div>

      {/* 能力说明卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLOUD_DEV_FEATURES.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 p-5"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: feature.iconBg }}
              >
                <feature.icon className="text-white" style={{ width: "22px", height: "22px" }} />
              </div>
              <div className="flex flex-col gap-1.5 pt-0.5">
                <h3 className="text-sm font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
