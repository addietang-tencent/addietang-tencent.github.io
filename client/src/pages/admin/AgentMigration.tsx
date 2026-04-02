/**
 * AgentMigration - 智能体迁移页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 左上角返回 OpenClaw 列表按钮
 * - 顶部标题 + 介绍文字
 * - 其余内容留白待后续开发
 */
import { Link } from "wouter";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";

export default function AgentMigration() {
  return (
    <div className="min-h-full">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/admin/openclaw-monitor">
          <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            返回 OpenClaw 列表
          </button>
        </Link>
      </div>

      {/* 页面标题区 */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
          <ArrowLeftRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">智能体迁移</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            将现有智能体从其他平台或旧版本迁移至当前企业版 OpenClaw 平台，支持配置、会话记录与技能绑定的完整迁移，确保迁移过程数据完整、服务不中断。
          </p>
        </div>
      </div>

      {/* 留白区域 */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 min-h-[400px] flex items-center justify-center">
        <p className="text-sm text-gray-400">功能开发中，敬请期待</p>
      </div>
    </div>
  );
}
