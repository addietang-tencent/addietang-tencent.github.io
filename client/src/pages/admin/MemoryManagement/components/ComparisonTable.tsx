import React from 'react';
import { Sparkles, Shield, Zap, Crown, Check, Database, Lock, Minus } from 'lucide-react';

interface ComparisonTableProps {
  // Pro 服务是否已开通
  isProActive?: boolean;
}

/**
 * 版本对比展示：Free 版 → Pro 版
 *
 * 方案 B：仅做功能对比展示，开通入口集中在服务概览区域
 * 折叠交互由外层容器统一承担（避免触发器重复、视觉重叠），
 * 本组件只负责"展开后"的对比内容渲染。
 *
 * 遵循 Agent Enterprise 设计规范：
 * - 品牌渐变：linear-gradient(135deg, #007AFF, #5856D6)
 * - 卡片圆角：rounded-2xl (16px)
 * - 统一阴影：通过 inline style 设置
 * - 图标：仅使用 lucide-react，禁止 emoji
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  isProActive = false,
}) => {
  return (
    <div>
      <div className="grid grid-cols-[1fr_1.5fr] gap-5">
        {/* Free 版卡片 */}
        <div 
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
        >
          {/* 头部 */}
          <div className="flex items-center gap-3 mb-5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#007AFF' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-gray-900">Free 版</h3>
              <span className="text-xs text-gray-500">入门方案</span>
            </div>
          </div>

          {/* 能力列表 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">本地文件持久化</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Minus className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">仅关键词检索</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Minus className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">小于 1 万条记忆数据</span>
            </div>
          </div>
        </div>

        {/* Pro 版卡片 */}
        <div 
          className="bg-white rounded-2xl border border-blue-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
        >
          {/* 头部 */}
          <div className="flex items-center gap-3 mb-5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#007AFF' }}
            >
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-gray-900">Pro 版</h3>
              <span className="text-xs text-blue-600 font-medium">企业级方案</span>
            </div>
            {/* 已开通状态标签 */}
            {isProActive && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                <Check className="w-3 h-3" />
                已开通
              </div>
            )}
          </div>

          {/* 核心能力列表 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">腾讯云向量数据库 (VDB)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">语义 + 关键词双路检索</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">支持百万级记忆数据</span>
            </div>
          </div>

          {/* 企业级特性 Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <Sparkles className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">短期记忆压缩，Token 节省 50%+</span>
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-medium rounded ml-auto flex-shrink-0">New</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">全链路加密，保障数据安全</span>
              <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded ml-auto flex-shrink-0">即将上线</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <Database className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">数据备份，可靠性更高</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">租户权限隔离，访问更安全</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
