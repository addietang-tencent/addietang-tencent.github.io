import React from 'react';
import { Sparkles, Shield, Crown, Check, Database, Lock, Minus, Zap } from 'lucide-react';
import { SurfaceCard, SurfaceInner } from '@/components/ui/Surface';
import { StatusTag } from '@/components/ui/status-tag';

interface ComparisonTableProps {
  /** Pro 服务是否已开通（开通后 Pro 卡显示「已开通」绿色徽标） */
  isProActive?: boolean;
}

/**
 * 版本对比展示：Free 版 → Pro 版
 *
 * 设计原则：
 * - 左右两栏对比：Free（中性、弱化）vs Pro（品牌色、推荐）
 * - 左栏 Free：中性灰图标容器、灰勾/灰减号区分能力开闭
 * - 右栏 Pro：品牌蓝渐变图标容器 + 「推荐」品牌色边框 + 已开通态绿色 StatusTag
 * - 企业级特性 Grid：用 SurfaceInner 内嵌卡（4px 圆角、浅描边）+ 单色 icon + StatusTag 标签
 *
 * 全局组件：<SurfaceCard> / <SurfaceInner> / <StatusTag>
 * 设计令牌：v2 主色 #1447E6 / 4px 圆角 / 文字色阶 #0A0A0A → #334155 → #737373 → #A3A3A3
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  isProActive = false,
}) => {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] gap-4">
      {/* ─────────── Free 版（弱化展示） ─────────── */}
      <SurfaceCard className="p-5 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-5">
          {/* Free 图标容器：中性灰渐变（与 Pro 区分层级） */}
          <div
            className="w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #94A3B8, #64748B)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#0A0A0A] leading-tight">Free 版</h3>
            <span className="text-xs text-[#737373]">入门方案</span>
          </div>
        </div>

        {/* 能力列表 */}
        <ul className="space-y-3">
          <FeatureItem enabled label="本地文件持久化" />
          <FeatureItem label="仅关键词检索" />
          <FeatureItem label="小于 1 万条记忆数据" />
        </ul>
      </SurfaceCard>

      {/* ─────────── Pro 版（推荐方案） ─────────── */}
      <SurfaceCard
        className="p-5 flex flex-col relative"
        style={{ borderColor: '#1447E6', borderWidth: '1px', borderStyle: 'solid' }}
      >
        {/* 右上角「推荐」角标：品牌色斜角带 */}
        <div
          className="absolute top-0 right-0 inline-flex items-center px-2.5 py-0.5 rounded-bl-[4px] rounded-tr-[4px] text-[10px] font-medium text-white leading-relaxed"
          style={{ background: 'linear-gradient(90deg, #020617 70%, #1447E6 100%)' }}
        >
          推荐
        </div>

        {/* 头部 */}
        <div className="flex items-center gap-3 mb-5">
          {/* Pro 图标容器：品牌蓝渐变（强化主推） */}
          <div
            className="w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #1447E6, #2563EB)' }}
          >
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#0A0A0A] leading-tight">Pro 版</h3>
            <span className="text-xs text-[#1447E6] font-medium">企业级方案</span>
          </div>
          {/* 已开通状态：绿色 StatusTag（全局组件） */}
          {isProActive && (
            <StatusTag variant="green" dot className="mr-12">
              已开通
            </StatusTag>
          )}
        </div>

        {/* 核心能力列表 */}
        <ul className="space-y-3">
          <FeatureItem enabled label="腾讯云向量数据库 (VDB)" />
          <FeatureItem enabled label="语义 + 关键词双路检索" />
          <FeatureItem enabled label="支持百万级记忆数据" />
        </ul>

        {/* 企业级特性 Grid（2×2，使用 SurfaceInner 内嵌卡） */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <ProFeatureChip icon={Sparkles} label="短期记忆压缩，Token 节省 50%+" badge="new" />
          <ProFeatureChip icon={Shield} label="全链路加密，保障数据安全" badge="upcoming" />
          <ProFeatureChip icon={Database} label="数据备份，可靠性更高" />
          <ProFeatureChip icon={Lock} label="租户权限隔离，访问更安全" />
        </div>
      </SurfaceCard>
    </div>
  );
};

// ─── 子组件：能力列表项（已启用 / 未启用） ───
function FeatureItem({ enabled, label }: { enabled?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          enabled ? 'bg-[#1447E6]' : 'bg-[#F5F5F5]'
        }`}
      >
        {enabled ? (
          <Check className="w-3 h-3 text-white" />
        ) : (
          <Minus className="w-3 h-3 text-[#A3A3A3]" />
        )}
      </span>
      <span className={`text-sm ${enabled ? 'text-[#334155]' : 'text-[#A3A3A3]'}`}>
        {label}
      </span>
    </li>
  );
}

// ─── 子组件：Pro 企业级特性卡片项 ───
type ProFeatureBadge = 'new' | 'upcoming';

function ProFeatureChip({
  icon: Icon,
  label,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: ProFeatureBadge;
}) {
  return (
    <SurfaceInner className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAFA]">
      <Icon className="w-4 h-4 text-[#737373] shrink-0" />
      <span className="text-xs text-[#334155] flex-1 leading-relaxed">{label}</span>
      {badge === 'new' && (
        <StatusTag variant="green" className="shrink-0 h-4 text-[10px] px-1.5">
          New
        </StatusTag>
      )}
      {badge === 'upcoming' && (
        <StatusTag variant="blue" className="shrink-0 h-4 text-[10px] px-1.5">
          即将上线
        </StatusTag>
      )}
    </SurfaceInner>
  );
}
