import React from 'react';
import { toast } from 'sonner';
import { ComparisonTable } from './ComparisonTable';

/**
 * Memory Pro 版本区块
 * 展示 Pro 版本的功能特性、升级按钮和 Free vs Pro 对比表格
 */
export const ProVersionCard: React.FC = () => {
  const features = [
    {
      emoji: '🔍',
      title: '高质量检索',
      description: '专业 Embedding + 关键字双路检索\n召回更稳定、更精准',
    },
    {
      emoji: '🔄',
      title: '支持记忆迁移',
      description: '记忆独立存储，不绑定单个应用\n换工具、换平台，记忆一键带走',
    },
    {
      emoji: '🛡️',
      title: '数据安全保障',
      description: '提供数据备份 / 回档能力\n降低数据误删除风险',
    },
    {
      emoji: '📋',
      title: '记忆集中管理',
      description: '统一管控所有应用记忆资源\n可视化查看、分配与回收记忆库',
    },
  ];

  const handleUpgradeClick = () => {
    toast.info('Pro 版本即将开放，敬请期待');
  };

  return (
    <div className="bg-white rounded-[14px] border border-[#e8eaf0] shadow-[0_1px_4px_rgba(0,0,0,.03)] overflow-hidden mb-5 mt-8">
      {/* 卡片头部 */}
      <div className="px-7 py-6 border-b border-[#f0f0f5]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6c63ff] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <h2 className="text-[17px] font-semibold text-[#1a1a2e]">
            Memory Pro 版
          </h2>
          <span className="text-xs text-[#007AFF] font-medium">由腾讯云数据库 AI 服务（TDAI）提供</span>
        </div>
        <p className="text-[13.5px] text-[#1a1a2e] font-semibold mb-2">
          基于腾讯云向量数据库的企业级记忆服务
        </p>
        <p className="text-[13.5px] text-[#8c8ca1] leading-relaxed mb-4">
          Pro 版 = Free 版全部能力 + 腾讯云向量数据库（内置 Embedding），让 OpenClaw 从个人增强插件升级为企业级 AI Agent 记忆底座。
        </p>
        <button
          onClick={handleUpgradeClick}
          disabled
          className="px-6 py-2 rounded-lg font-semibold text-sm cursor-not-allowed opacity-60 hover:opacity-60 transition-opacity text-white"
          style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
        >
          ⋰ 即将到来
        </button>
      </div>

      {/* 功能特性网格 */}
      <div className="px-7 py-8 border-b border-[#f0f0f5]">
        <div className="grid grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-5 rounded-[12px] bg-[#fafbfc] border border-[#e8eaf0] shadow-sm text-center hover:border-[#6c63ff] hover:bg-[#f3f0ff] hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <h3 className="text-sm font-bold text-[#1a1a2e] mb-2">{feature.title}</h3>
              <p className="text-xs text-[#8c8ca1] leading-relaxed whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free vs Pro 对比表格 */}
      <div className="px-7 py-8">
        <h3 className="text-[15px] font-semibold text-[#1a1a2e] mb-5">Free 版 vs Pro 版</h3>
        <ComparisonTable />
      </div>
    </div>
  );
};
