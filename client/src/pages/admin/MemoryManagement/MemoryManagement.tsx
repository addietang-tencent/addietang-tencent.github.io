import React from 'react';
import { FreeVersionCard } from './components/FreeVersionCard';
import { ProVersionCard } from './components/ProVersionCard';
import { FeatureGrid } from './components/FeatureGrid';
import { ComparisonTable } from './components/ComparisonTable';

/**
 * 记忆管理页面
 * 
 * 设计特点：
 * - 展示 TDAI-Memory 记忆功能的能力对比
 * - 帮助管理员了解 Free 版和 Pro 版的差异
 * - 支持升级决策
 * 
 * 页面流程：
 * 1. Free 版介绍 + 性能数据
 * 2. Pro 版升级卡片
 * 3. Pro 版功能特性
 * 4. Free vs Pro 对比表格
 */
export const MemoryManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f8] py-9 px-10">
      {/* 页面头部 */}
      <div className="mb-7">
        <h1 className="text-[26px] font-bold text-[#1a1a2e] mb-1.5">
          记忆管理
        </h1>
        <p className="text-[13.5px] text-[#8c8ca1] leading-relaxed">
          让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好
        </p>
      </div>

      {/* Free 版介绍卡片 */}
      <FreeVersionCard />

      {/* Pro 版 Panel */}
      <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_4px_12px_rgba(0,0,0,0.04)] p-0 mb-5">
        {/* Pro 版升级卡片 */}
        <div className="px-9 py-8">
          <ProVersionCard />
        </div>

        {/* Pro 版功能特性网格 */}
        <div className="px-9 py-8 border-t border-gray-100">
          <FeatureGrid />
        </div>

        {/* 对比表格 */}
        <div className="px-9 py-8 border-t border-gray-100">
          <ComparisonTable />
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;
