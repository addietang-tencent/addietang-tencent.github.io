/**
 * CloudDevManagement - 管控端云开发管理页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 * 管理企业云开发环境的创建、分配与生命周期
 */

const ASSET_BASE = "/assets/admin-cloud-dev";

// 云开发能力说明数据
const CLOUD_DEV_FEATURES: {
  iconSrc: string;
  title: string;
  description: string;
}[] = [
  {
    iconSrc: `${ASSET_BASE}/speak-to-deploy.svg`,
    title: "说话即上线",
    description:
      "用自然语言描述需求，AI 自动完成代码生成、数据库搭建、云端部署的全流程，一句话交付完整应用",
  },
  {
    iconSrc: `${ASSET_BASE}/enterprise-app-deploy.svg`,
    title: "企业应用即刻落地",
    description:
      "库存管理、CRM、ERP 等业务系统，AI 理解流程逻辑并自动构建，替代传统开发周期，让业务需求快速固化为可用系统",
  },
  {
    iconSrc: `${ASSET_BASE}/mini-program-delivery.svg`,
    title: "企业小程序快速交付",
    description:
      "企微应用、内部工具小程序，AI 端到端生成并部署，让企业内部数字化触达每一位员工的手机",
  },
  {
    iconSrc: `${ASSET_BASE}/enterprise-security-scalability.svg`,
    title: "企业级安全与弹性",
    description:
      "依托腾讯云安全体系，自动配置权限与防护规则；按需弹性伸缩，智能优化资源配置，安全可靠的同时持续降本",
  },
];

import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/ui/admin-page-header";

export default function CloudDevManagement() {
  return (
    <div className="page-enter">
      <AdminPageHeader
        title="云开发管理"
        titleAccessory={<Badge variant="outline">即将开放</Badge>}
        description="管理企业云开发环境的创建、分配与生命周期。管理员可为成员分配独立的云开发环境，统一配置运行环境与规格，为成员提供应用开发及部署能力。"
      />

      {/* 能力说明卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLOUD_DEV_FEATURES.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start gap-4">
              <img src={feature.iconSrc} alt="" className="shrink-0" />
              <div className="flex flex-col pt-0.5">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs text-[#737373] leading-relaxed">
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
