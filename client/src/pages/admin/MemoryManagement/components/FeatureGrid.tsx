import React from 'react';
import { Search, RefreshCw, ShieldCheck, LayoutGrid } from 'lucide-react';

const FEATURES = [
  { icon: Search, title: '语义级检索', desc: '关键字 + 语义双路检索，理解意图而非仅匹配文字', color: '#7C3AED' },
  { icon: RefreshCw, title: '记忆可迁移', desc: '记忆独立于应用实例存储，更换实例时数据无缝迁移', color: '#2563EB' },
  { icon: ShieldCheck, title: '数据安全保障', desc: '支持数据备份与回档，降低误删除风险', color: '#F59E0B' },
  { icon: LayoutGrid, title: '集中管理', desc: '统一管控所有实例的记忆资源，可视化分配与回收', color: '#16A34A' },
];

export const FeatureGrid: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-500">Pro 版独有能力</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">
          升级解锁
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="p-5 rounded-xl border border-gray-100 bg-gray-50/30 text-center hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${f.color}10` }}
              >
                <Icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
