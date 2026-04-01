import React from 'react';
import { FreeVersionCard } from './components/FreeVersionCard';
import { ProVersionCard } from './components/ProVersionCard';
import { FeatureGrid } from './components/FeatureGrid';
import { ComparisonTable } from './components/ComparisonTable';

export const MemoryManagement: React.FC = () => {
  return (
    <div className="page-enter">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">记忆管理</h1>
        <p className="text-sm text-gray-500">
          让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好。由腾讯云数据库 Agent Memory 服务提供支持。
        </p>
      </div>

      {/* Free 版 */}
      <FreeVersionCard />

      {/* Pro 版 */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
      >
        {/* Hero */}
        <div className="p-0">
          <ProVersionCard />
        </div>

        {/* Feature Grid */}
        <div className="px-8 pt-7 pb-2">
          <FeatureGrid />
        </div>

        {/* Comparison Table */}
        <div className="px-8 pb-8">
          <ComparisonTable />
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;
