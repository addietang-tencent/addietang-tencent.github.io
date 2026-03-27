import React from 'react';

/**
 * Pro 版功能特性卡片网格
 * 
 * 展示 4 个核心功能特性：
 * 1. 高质量检索
 * 2. 支持记忆迁移
 * 3. 数据安全保障
 * 4. 记忆集中管理
 */
export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: '🔍',
      title: '高质量检索',
      description: '专业 Embedding + 关键字双路检索，召回更稳定、更精准',
      bgGradient: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
    },
    {
      icon: '🔄',
      title: '支持记忆迁移',
      description: '记忆与应用实例解耦，换壳不换脑，跨应用迁移记忆，体验无缝延续',
      bgGradient: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)',
    },
    {
      icon: '🛡️',
      title: '数据安全保障',
      description: '提供数据备份 / 回档能力，降低数据误删除风险',
      bgGradient: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)',
    },
    {
      icon: '📋',
      title: '记忆集中管理',
      description: '统一管控所有应用记忆资源，可视化查看、分配与回收记忆库',
      bgGradient: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-[22px] bg-[#FAFBFE] border border-[#E8EAF0] rounded-[12px] text-center transition-all duration-200 hover:border-[#C4B5FD] hover:shadow-[0_4px_12px_rgba(124,58,237,.08)]"
          >
            {/* 图标 */}
            <div
              className="w-12 h-12 rounded-[14px] inline-flex items-center justify-center mb-3.5 text-2xl"
              style={{ background: feature.bgGradient }}
            >
              {feature.icon}
            </div>

            {/* 标题 */}
            <h3 className="text-[14.5px] font-semibold text-[#1a1a2e] mb-1.5">
              {feature.title}
            </h3>

            {/* 描述 */}
            <p className="text-[12.5px] text-[#8c8ca1] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
