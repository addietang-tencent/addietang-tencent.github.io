import React from 'react';
import { Brain, Clock } from 'lucide-react';

export const ProVersionCard: React.FC = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 40%, #F0F9FF 100%)', border: '1px solid #E8EAF0' }}>
      <div className="absolute -top-1/2 -right-1/5 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-1/3 -left-1/10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 px-8 py-7 flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-blue-900">Memory Pro 版</h2>
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1.5">基于腾讯云向量数据库的企业级记忆服务</h3>
          <p className="text-sm text-blue-600/70 leading-relaxed">
            在 Free 版全部能力基础上，接入腾讯云向量数据库与内置 Embedding 能力，实现语义级记忆检索与企业级数据管理。
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 opacity-70 cursor-not-allowed flex-shrink-0"
          style={{ background: 'rgba(37,99,235,0.08)' }}
        >
          <Clock className="w-4 h-4" />
          即将到来
        </button>
      </div>
    </div>
  );
};
