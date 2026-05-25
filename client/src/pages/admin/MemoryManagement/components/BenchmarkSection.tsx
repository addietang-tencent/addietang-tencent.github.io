import React from 'react';
import { FreeVersionCard } from './FreeVersionCard';

interface BenchmarkSectionProps {
  /** 是否有实例开启了 Memory，用于判断默认折叠状态 */
  hasEnabledInstances: boolean;
}

export const BenchmarkSection: React.FC<BenchmarkSectionProps> = () => {
  return (
    <div
      className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden"
    >
      {/* 标题栏 — 常驻展开，不可折叠 */}
      <div className="px-5 py-4 flex items-center gap-2">
        <span className="text-lg">📈</span>
        <h3 className="font-semibold text-[#0A0A0A]">记忆效果对比</h3>
        <span className="text-xs text-[#A3A3A3]">基于 PersonaMem 数据集评测</span>
      </div>

      {/* 内容区 — 常驻展示 */}
      <div className="px-5 pb-5">
        <FreeVersionCard isEnabled={false} onEnabledChange={() => {}} />
      </div>
    </div>
  );
};
