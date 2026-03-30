import React from 'react';
import { Check, X } from 'lucide-react';

const ITEMS = [
  { label: '存储方式', free: '本地单机数据库', pro: '腾讯云向量数据库' },
  { label: '检索方式', free: '关键词匹配', pro: '语义 + 关键字双路检索' },
  { label: '数据安全', free: null, pro: '备份 / 回档 / 权限' },
  { label: '数据规模', free: '建议 < 1万条', pro: '无限制' },
  { label: '语义理解', free: null, pro: '内置语义匹配，理解意图而非仅匹配文字' },
];

export const ComparisonTable: React.FC = () => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">Free 版 vs Pro 版</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Free 卡片 */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-5">
          <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Free 版
          </div>
          <div className="space-y-3">
            {ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                {item.free ? (
                  <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-gray-500" />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 text-gray-300" />
                  </span>
                )}
                <div>
                  <p className="text-xs text-gray-400 leading-none mb-0.5">{item.label}</p>
                  <p className={`text-sm ${item.free ? 'text-gray-700' : 'text-gray-300'}`}>
                    {item.free || '不支持'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro 卡片 */}
        <div className="rounded-xl border border-violet-100 p-5" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.02), rgba(99,102,241,0.03))' }}>
          <div className="text-sm font-bold text-violet-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Pro 版
          </div>
          <div className="space-y-3">
            {ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-violet-600" />
                </span>
                <div>
                  <p className="text-xs text-gray-400 leading-none mb-0.5">{item.label}</p>
                  <p className="text-sm text-violet-700 font-medium">{item.pro}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
