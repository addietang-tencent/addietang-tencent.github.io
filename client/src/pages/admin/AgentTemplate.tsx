/**
 * AgentTemplate - Agent 模板管理页
 * 管控端「云设备配置」分组下，供管理员统一管理和分发 Agent 模板
 */
import { LayoutTemplate } from "lucide-react";

export default function AgentTemplate() {
  return (
    <div>
      {/* 页面标题区 */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <LayoutTemplate className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1.5">Agent 模板</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            在此统一管理企业内可复用的 Agent 模板，包括预设的系统提示词、工具配置与模型参数。
            管理员可发布模板供员工一键创建标准化 Agent，降低配置门槛，保障使用规范。
          </p>
        </div>
      </div>
    </div>
  );
}
