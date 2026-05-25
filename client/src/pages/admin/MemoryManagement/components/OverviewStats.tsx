import React from 'react';
import { Bot, Zap, Crown, CircleOff, Info } from 'lucide-react';
import { SurfaceCard } from '@/components/ui/Surface';

interface OverviewStatsProps {
  totalCount: number;
  proCount: number;
  freeCount: number;
  noneCount: number;
}

/**
 * 记忆空间概览统计组件
 * 
 * 遵循 Agent Enterprise 设计规范：
 * - 卡片圆角：rounded-xl
 * - 统一阴影：通过 inline style 设置
 * - 图标容器：使用规范渐变色
 * - 图标：仅使用 lucide-react
 */
export const OverviewStats: React.FC<OverviewStatsProps> = ({
  totalCount,
  proCount,
  freeCount,
  noneCount,
}) => {
  const enabledCount = proCount + freeCount;

  const stats = [
    {
      label: '总实例数',
      value: totalCount,
      icon: Bot,
      gradient: 'linear-gradient(135deg, #6B7280, #4B5563)', // gray
    },
    {
      label: '已开启记忆',
      value: enabledCount,
      icon: Zap,
      gradient: 'linear-gradient(90deg, #020617 70%, #355EF1 100%)', // 品牌色
      subItems: [
        { label: 'Pro', value: proCount, color: '#16A34A' },
        { label: 'Free', value: freeCount, color: '#355EF1' },
      ],
    },
    {
      label: '未开启',
      value: noneCount,
      icon: CircleOff,
      gradient: 'linear-gradient(135deg, #9CA3AF, #6B7280)', // gray
    },
  ];

  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-[#0A0A0A]">记忆空间概览</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <SurfaceCard
              key={stat.label}
              className="p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: stat.gradient }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-[#737373]">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-[#0A0A0A] tabular-nums">
                {stat.value}
              </div>
              {stat.subItems && (
                <div className="flex items-center gap-3 mt-2">
                  {stat.subItems.map((sub) => (
                    <span key={sub.label} className="flex items-center gap-1.5 text-xs text-[#737373]">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      {sub.label} <span className="font-medium text-[#334155]">{sub.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </SurfaceCard>
          );
        })}
      </div>

      {/* 当全部未开启时，显示引导提示 - 符合设计规范的信息横幅 */}
      {enabledCount === 0 && (
        <div className="mt-4 flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-[#355EF1] mt-0.5 shrink-0" />
          <p className="text-xs text-[#355EF1] leading-relaxed">
            当前暂无实例开启记忆功能。可在各 Agent 的「设置 → Memory」中开启 Free 或 Pro 版本。
          </p>
        </div>
      )}
    </SurfaceCard>
  );
};
