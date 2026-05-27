import React from 'react';
import { Check, Zap } from 'lucide-react';

interface ComparisonTableProps {
  /** Pro 服务是否已开通（开通后 Pro 卡可在外层另作徽标处理；本视图按设计稿不显示徽标） */
  isProActive?: boolean;
}

/**
 * 版本对比展示：Free 版 vs Pro 版（Figma node 134:879 还原）
 *
 * 布局：
 *   - 左列 Free 版：白底图标容器 + 标题 + 入门方案 outline tag + 3 条特性
 *   - 中间 1px 垂直分隔线
 *   - 右列 Pro 版：黑→深蓝渐变图标容器 + 标题 + 黑底「推荐」+ 企业级方案 outline tag
 *     - 上半：3 条特性（与 Free 对齐）
 *     - 右上 2×2 网格：4 个企业级特性卡片
 *
 * 特性条文案约束：
 *   - Free 版后两条「仅关键词检索」「小于 1w 条记忆数据」为弱化态（30% 灰）
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props,
) => {
  return (
    <div className="grid grid-cols-[170px_1px_1fr] gap-x-[70px] gap-y-0">
      {/* ─────────── 左列：Free 版 ─────────── */}
      <div className="flex flex-col">
        {/* 图标容器：白底淡蓝渐变 */}
        <div
          className="w-9 h-9 rounded-[4px] flex items-center justify-center shrink-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(20,71,230,0.04) 0%, #FFFFFF 50%, rgba(20,71,230,0.04) 100%)',
          }}
        >
          <Zap className="w-[18px] h-[18px] text-[#0A0A0A]" />
        </div>

        {/* 标题 + 标签 */}
        <div className="mt-[16px]">
          <div className="text-[16px] font-medium leading-none text-[#0A0A0A]">Free 版</div>
          <div className="mt-[13px] inline-flex h-[18px] items-center rounded-full border border-black/40 px-2">
            <span className="text-[10px] leading-none text-[#0A0A0A]">入门方案</span>
          </div>
        </div>

        {/* 特性列表 */}
        <ul className="mt-[16px] space-y-2">
          <FeatureRow label="本地文件持久化" />
          <FeatureRow label="仅关键词检索" muted />
          <FeatureRow label="小于 1w 条记忆数据" muted />
        </ul>
      </div>

      {/* ─────────── 垂直分隔线 ─────────── */}
      <div className="self-stretch w-px bg-[#E6E9EF]" />

      {/* ─────────── 右列：Pro 版（顶部 header + 下半两块：左特性条 / 右 2x2 卡片网格） ─────────── */}
      <div className="flex flex-col">
        {/* 头部：图标 + 标题 + 推荐/企业级方案 tag */}
        <div>
          <div
            className="w-9 h-9 rounded-[4px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(133deg, #010618 0%, #05207E 100%)' }}
          >
            <img
              src="/assets/admin-memory-management/version-compare/pro-icon.svg"
              alt=""
              className="w-[18px] h-[18px]"
              aria-hidden="true"
            />
          </div>

          <div className="mt-[16px] flex items-end gap-2">
            <span className="text-[16px] font-medium leading-none text-[#0A0A0A]">Pro 版</span>
          </div>

          <div className="mt-[13px] flex items-center gap-1">
            <span className="inline-flex h-[18px] items-center rounded-full bg-[#0A0A0A] px-2">
              <span className="text-[10px] leading-none text-white">推荐</span>
            </span>
            <span className="inline-flex h-[18px] items-center rounded-full border border-black/40 px-2">
              <span className="text-[10px] leading-none text-[#0A0A0A]">企业级方案</span>
            </span>
          </div>
        </div>

        {/* 下半：左特性条 + 右 2x2 卡片网格 */}
        <div className="mt-[16px] grid grid-cols-[190px_1fr] gap-x-[54px]">
          {/* 左：3 条特性（与 Free 列对齐） */}
          <ul className="space-y-2">
            <FeatureRow label="腾讯云向量数据库（VDB）" />
            <FeatureRow label="语义 + 关键词双路检索" />
            <FeatureRow label="支持百万级记忆数据" />
          </ul>

          {/* 右：企业级特性 2x2 卡片网格 */}
          <div className="grid grid-cols-2 gap-2">
            <EnterpriseFeatureCard
              iconSrc="/assets/admin-memory-management/version-compare/feature-tenant.svg"
              label="租户权限隔离，访问更安全"
            />
            <EnterpriseFeatureCard
              iconSrc="/assets/admin-memory-management/version-compare/feature-encrypt.svg"
              label="全链路加密，保障数据安全"
            />
            <EnterpriseFeatureCard
              iconSrc="/assets/admin-memory-management/version-compare/feature-backup.svg"
              label="数据备份，可靠性更高"
            />
            <EnterpriseFeatureCard
              iconSrc="/assets/admin-memory-management/version-compare/feature-token.svg"
              label="短期记忆压缩，Token 节省 50%+"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── 子组件 ─────────────── */

/** 特性单行：勾 + 文案。muted=true 时文字置 30% 灰（Free 版未启用特性） */
const FeatureRow: React.FC<{ label: string; muted?: boolean }> = ({ label, muted = false }) => (
  <li className="flex items-center gap-1.5">
    <Check
      className={`w-3.5 h-3.5 shrink-0 ${muted ? 'text-black/30' : 'text-[#0A0A0A]'}`}
      strokeWidth={1.5}
    />
    <span
      className={`text-[12px] leading-5 ${muted ? 'text-black/30' : 'text-[#0A0A0A]'}`}
    >
      {label}
    </span>
  </li>
);

/** 企业级特性卡片：图标 + 文案，9px 圆角 + 1px 浅描边 */
const EnterpriseFeatureCard: React.FC<{ iconSrc: string; label: string }> = ({
  iconSrc,
  label,
}) => (
  <div className="h-16 rounded-[9px] border border-[#EAEAEA] px-6 py-3">
    <img src={iconSrc} alt="" aria-hidden="true" className="w-4 h-4" />
    <div className="mt-1 text-[12px] leading-5 text-[#0A0A0A]">{label}</div>
  </div>
);
