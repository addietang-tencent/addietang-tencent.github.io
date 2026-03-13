/**
 * SecurityManagement - 安全管理页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 页面标题 + 描述
 * - 2x2 卡片网格：资产盘点、深度审计、运行管控、Skills 扫描
 * - 每个卡片带线性 icon、标题、说明文字
 */

import { Shield, FileText, Lock, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const SECURITY_CARDS = [
  {
    id: "asset-visibility",
    title: "资产盘点与风险可视",
    description:
      "自动发现并清点企业内所有 AI Agent 资产，实时侦测大模型调用与敏感凭证泄露，实现安全风险动态可视。",
    icon: Shield,
    gradient: "linear-gradient(135deg, #007AFF, #5856D6)",
  },
  {
    id: "audit-tracing",
    title: "深度审计与全链路溯源",
    description:
      "完整记录 AI Agent 的每轮对话、工具调用及系统行为日志，提供满足严格合规要求的全链路操作溯源能力。",
    icon: FileText,
    gradient: "linear-gradient(135deg, #AF52DE, #FF2D55)",
  },
  {
    id: "runtime-control",
    title: "运行管控与环境隔离",
    description:
      "通过策略对高危命令、恶意请求进行拦截，并管控 Agent 网络访问与身份密钥，实现主机行为与内网环境的主动隔离防护。",
    icon: Lock,
    gradient: "linear-gradient(135deg, #34C759, #00C7BE)",
  },
  {
    id: "skills-scanning",
    title: "Skills 供应链安全扫描",
    description:
      "对 OpenClaw 安装的所有 Skills 进行深度扫描，排查木马、恶意代码与提示词注入漏洞，确保第三方工具链的安全可信。",
    icon: AlertCircle,
    gradient: "linear-gradient(135deg, #FF9500, #FF6B6B)",
  },
];

export default function SecurityManagement() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">安全管理</h1>
            <span className="font-medium text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded whitespace-nowrap" style={{ fontSize: '11px' }}>
              即将开放
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            提供全面的 AI Agent
            资产盘点与全链路安全审计能力，实时发现恶意 Skills
            与安全威胁，并支持一键管控，为你的 AI 业务构建可信运行环境。
          </p>
        </div>

        {/* 2x2 Card Grid */}
        <div className="grid grid-cols-2 gap-6">
          {SECURITY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200"
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
