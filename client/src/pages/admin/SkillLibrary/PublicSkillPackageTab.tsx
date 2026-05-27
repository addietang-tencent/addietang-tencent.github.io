/**
 * 公共技能包 Tab
 *
 * 二级 Tab「公共技能包」的内容：浏览来自 SkillHub 的技能包（一组 Skill 的场景化组合）
 *
 * 数据来源：SkillHub 公共 API 数据快照（publicSkillPackageDataSnapshot.ts）
 *
 * 设计原则：
 * 1. 公共技能包只是前端展示层概念，本质是多个公共技能的组合模板
 * 2. 不直接安装、不直接执行，只用于浏览、收藏，以及在角色设定中被展开为多个公共技能
 * 3. 视觉与「公共技能」Tab 完全一致：搜索框、分类筛选、卡片样式、收藏交互、分页
 * 4. 卡片极简：标题 + 描述 + Skill chip 列表（前 2 个 + N） + 右下角收藏按钮
 *    （已去除「公共包」badge / 排名 / 下载量 / 评分）
 * 5. 详情页：
 *    - 顶部信息卡：标题 + 长描述（summary）
 *    - 技能模块（identify）：chip 列表
 *    - 工作流：用 MDXRenderer 渲染 SkillHub 真实 markdown 内容（已剥离 YAML frontmatter）
 */
import { useMemo, useState } from 'react';
import { Search, Heart, ArrowLeft, RefreshCw, Puzzle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MDXRenderer from '@/components/MDXRenderer';
import {
  PUBLIC_SKILL_PACKAGES,
  PUBLIC_SKILL_PACKAGE_CATEGORIES,
  type PublicSkillPackage,
  type PackageSkillRef,
} from './publicSkillPackageMockData';

// ─── 子组件：Skill chip（identify 区块用） ───────────────────────────────────
// 规范：
// - 卡片场景（size='sm'）chip 固定最大宽度，超出用 ellipsis 截断，避免破坏卡片高度
// - 详情页场景（size='md'）chip 宽度自适应，完整展示 slug

function SkillChip({ skill, size = 'sm' }: { skill: PackageSkillRef; size?: 'sm' | 'md' }) {
  const padding = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5';
  const fontSize = size === 'md' ? 'text-xs' : 'text-[11px]';
  // 卡片里的 chip 限制最大宽度，与 SkillHub 「test-case-gen...」截断规范保持一致
  const maxWidth = size === 'md' ? '' : 'max-w-[120px]';
  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} ${fontSize} ${maxWidth} rounded-md bg-gray-50 border border-gray-200 text-gray-600 font-medium overflow-hidden`}
      title={skill.slug}
    >
      <Puzzle className="w-3 h-3 text-gray-400 flex-shrink-0" />
      <span className="truncate min-w-0">{skill.name}</span>
    </span>
  );
}

// ─── 子组件：技能包卡片 ─────────────────────────────────────────────────────

interface PackageCardProps {
  pkg: PublicSkillPackage;
  isFavorited: boolean;
  onFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function PackageCard({ pkg, isFavorited, onFavorite, onClick }: PackageCardProps) {
  // 卡片只展示前 2 个 Skill chip，超出折叠为 +N
  const VISIBLE_SKILLS = 2;
  const visibleSkills = pkg.skills.slice(0, VISIBLE_SKILLS);
  const overflowCount = pkg.skills.length - visibleSkills.length;

  return (
    <div
      className="relative bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-gray-200 hover:shadow-md transition-all group flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      onClick={onClick}
    >
      <div className="p-4 flex flex-col flex-1">
        {/* 标题 —— 单行省略，固定高度 */}
        <h3
          className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight truncate mb-1"
          title={pkg.name}
        >
          {pkg.name}
        </h3>

        {/* 描述 —— 固定两行，line-clamp 截断 */}
        <p
          className="text-xs text-gray-500 line-clamp-2 leading-relaxed"
          style={{ minHeight: '2.5rem' }}
        >
          {pkg.description}
        </p>

        {/* Skill chip 列表（最多 2 个 + N）—— 单行不换行，chip 自身限宽截断保证整体定高 */}
        <div className="flex items-center gap-1.5 mt-3 flex-nowrap overflow-hidden">
          {visibleSkills.map((s) => (
            <SkillChip key={s.slug} skill={s} />
          ))}
          {overflowCount > 0 && (
            <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">
              +{overflowCount}
            </span>
          )}
        </div>

        {/* 底部：右下角收藏按钮 */}
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={onFavorite}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isFavorited
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
            }`}
            title={isFavorited ? '取消收藏' : '添加到我的收藏'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 子组件：分页（与公共技能 Tab 视觉完全一致，仅文案改成"技能包"） ─────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase =
    'min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-all';
  const btnActive = 'text-white shadow-sm';
  const btnInactive = 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50';
  const btnArrow = `${btnBase} border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
      <span className="text-xs text-gray-400">
        共 {totalCount} 个技能包，第 {currentPage} / {totalPages} 页
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={btnArrow}
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="min-w-[28px] h-7 flex items-center justify-center text-gray-400 text-xs"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} ${currentPage === p ? btnActive : btnInactive}`}
              style={currentPage === p ? { backgroundColor: '#007AFF' } : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={btnArrow}
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ─── 子组件：详情页 ────────────────────────────────────────────────────────

interface PackageDetailProps {
  pkg: PublicSkillPackage;
  isFavorited: boolean;
  onFavorite: () => void;
  onBack: () => void;
}

function PackageDetailView({ pkg, isFavorited, onFavorite, onBack }: PackageDetailProps) {
  const categoryName = useMemo(
    () => PUBLIC_SKILL_PACKAGE_CATEGORIES.find((c) => c.id === pkg.category)?.name ?? '',
    [pkg.category],
  );

  return (
    <div className="space-y-4">
      {/* 顶部返回 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回公共技能包
      </button>

      {/* 技能包信息头部 */}
      <div
        className="bg-white rounded-xl border border-gray-100 p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* 第一行：标题（与「技能模块」「XX 工作流」字号统一为 text-xl font-bold） */}
            <h2 className="text-xl font-bold text-gray-900 truncate mb-1">{pkg.name}</h2>
            {/* 第二行：分类 */}
            {categoryName && (
              <p className="text-xs text-gray-400 mb-3">分类：{categoryName}</p>
            )}
            {/* 第三行：长描述 */}
            <p className="text-sm text-gray-600 leading-relaxed">{pkg.descriptionLong}</p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onFavorite}
              className={`gap-1.5 ${
                isFavorited ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
          </div>
        </div>
      </div>

      {/* 技能模块（identify 区块） */}
      <div
        className="bg-white rounded-xl border border-gray-100 p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        {/* 第一行：标题（与「技能包名称」「XX 工作流」字号统一） */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">技能模块</h3>
        {/* 第二行：副信息（与「分类：学术」格式一致） */}
        <p className="text-xs text-gray-400 mb-3">共 {pkg.skills.length} 个 Skill</p>
        {/* 第三行：说明 */}
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          本技能包是一个场景化组合模板，包含以下 Skill。在「角色设定」中应用此技能包时，将自动展开为下列公共技能。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {pkg.skills.map((s) => (
            <SkillChip key={s.slug} skill={s} size="md" />
          ))}
        </div>
      </div>

      {/* 工作流 —— 直接渲染 SkillHub 的真实 markdown 内容 */}
      {pkg.workflowMarkdown ? (
        <div
          className="bg-white rounded-xl border border-gray-100 p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <MDXRenderer content={pkg.workflowMarkdown} />
        </div>
      ) : (
        <div
          className="bg-white rounded-xl border border-gray-100 p-6 text-center"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <p className="text-sm text-gray-400">该技能包暂无工作流说明</p>
        </div>
      )}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

export default function PublicSkillPackageTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFavorited = (id: string) => favoriteIds.has(id);

  // 收藏切换 + Toast 反馈
  const handleFavorite = (pkg: PublicSkillPackage) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const willFavorite = !next.has(pkg.id);
      if (willFavorite) {
        next.add(pkg.id);
        toast.success(`已收藏「${pkg.name}」`);
      } else {
        next.delete(pkg.id);
        toast.success(`已取消收藏「${pkg.name}」`);
      }
      return next;
    });
  };

  // 过滤
  const filteredPackages = useMemo(() => {
    let list: PublicSkillPackage[];
    if (activeCategory === 'all') {
      list = [...PUBLIC_SKILL_PACKAGES];
    } else if (activeCategory === 'favorites') {
      list = PUBLIC_SKILL_PACKAGES.filter((p) => favoriteIds.has(p.id));
    } else {
      list = PUBLIC_SKILL_PACKAGES.filter((p) => p.category === activeCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.descriptionLong.toLowerCase().includes(q) ||
          p.skills.some(
            (s) => s.slug.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
          ),
      );
    }
    return list;
  }, [activeCategory, searchQuery, favoriteIds]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE));
  const pagedPackages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPackages.slice(start, start + PAGE_SIZE);
  }, [filteredPackages, currentPage]);

  // 切分类、改搜索都要重置到第一页
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // 详情页
  if (selectedPackageId) {
    const pkg = PUBLIC_SKILL_PACKAGES.find((p) => p.id === selectedPackageId);
    if (pkg) {
      return (
        <PackageDetailView
          pkg={pkg}
          isFavorited={isFavorited(pkg.id)}
          onFavorite={() => handleFavorite(pkg)}
          onBack={() => setSelectedPackageId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* 搜索框 + 刷新 —— 与公共技能 Tab 完全一致 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索技能包名称或关键词..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <button
          onClick={() => {
            setIsRefreshing(true);
            setTimeout(() => {
              handleSearchChange('');
              setCurrentPage(1);
              setTimeout(() => setIsRefreshing(false), 50);
            }, 250);
          }}
          title="刷新"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:shadow-sm transition-all flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 分类标签栏 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PUBLIC_SKILL_PACKAGE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              activeCategory === cat.id
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            style={
              activeCategory === cat.id
                ? { backgroundColor: '#007AFF', borderColor: '#007AFF' }
                : undefined
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 卡片网格 + 分页（每个分类都展示分页栏，与公共技能 Tab 一致） */}
      {filteredPackages.length > 0 ? (
        <>
          <div
            className="grid grid-cols-3 gap-4"
            style={{ opacity: isRefreshing ? 0 : 1, transition: 'opacity 0.25s ease' }}
          >
            {pagedPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isFavorited={isFavorited(pkg.id)}
                onFavorite={(e) => {
                  e.stopPropagation();
                  handleFavorite(pkg);
                }}
                onClick={() => setSelectedPackageId(pkg.id)}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filteredPackages.length}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {activeCategory === 'favorites' && favoriteIds.size === 0
              ? '还没有收藏任何技能包'
              : '没有找到匹配的技能包'}
          </p>
        </div>
      )}
    </div>
  );
}
