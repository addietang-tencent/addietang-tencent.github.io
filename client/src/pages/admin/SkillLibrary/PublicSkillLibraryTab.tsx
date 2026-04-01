/**
 * 公共技能库 Tab
 * 设计风格：浅色主题，卡片式布局，精选排行榜
 */
import { useState, useMemo, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Download, Star, Heart, ChevronRight,
  ArrowLeft, ChevronDown, ChevronRight as ChevronRightIcon, FileText, Folder, FolderOpen, RefreshCw
} from 'lucide-react';
import {
  PUBLIC_SKILLS, PUBLIC_SKILL_CATEGORIES, type PublicSkill, type FavoriteSkill, type PublicSkillFile
} from './publicSkillMockData';
import { renderMarkdown } from '@/lib/markdownRenderer';
import AddToPackageDialog from './AddToPackageDialog';

// ─── 分页组件 ─────────────────────────────────────────────────────────────────

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
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase = 'min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-all';
  const btnActive = 'text-white shadow-sm';
  const btnInactive = 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50';
  const btnArrow = `${btnBase} border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
      {/* 左侧：数据总览 */}
      <span className="text-xs text-gray-400">
        共 {totalCount} 个技能，第 {currentPage} / {totalPages} 页
      </span>

      {/* 右侧：翻页按钮组 */}
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
            <span key={`ellipsis-${i}`} className="min-w-[28px] h-7 flex items-center justify-center text-gray-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} ${currentPage === p ? btnActive : btnInactive}`}
              style={currentPage === p ? { backgroundColor: '#007AFF' } : undefined}
            >
              {p}
            </button>
          )
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

// ─── 排名徽章 ─────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md z-10">
      <span className="text-white text-xs font-bold">1</span>
    </div>
  );
  if (rank === 2) return (
    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md z-10">
      <span className="text-white text-xs font-bold">2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md z-10">
      <span className="text-white text-xs font-bold">3</span>
    </div>
  );
  return (
    <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center z-10 shadow-sm">
      <span className="text-gray-500 font-medium" style={{ fontSize: '10px', lineHeight: 1 }}>{rank}</span>
    </div>
  );
}

// ─── 技能卡片 ─────────────────────────────────────────────────────────────────

interface SkillCardProps {
  skill: PublicSkill;
  rank: number;
  isFavorited: boolean;
  onFavorite: (skillId: string) => void;
  onClick: () => void;
}

function SkillCard({ skill, rank, isFavorited, onFavorite, onClick }: SkillCardProps) {
  const formatCount = (n: number) => {
    if (n >= 10000) {
      const v = n / 10000;
      return `${parseFloat(v.toFixed(1))}万`;
    }
    if (n >= 1000) {
      const v = n / 1000;
      return `${parseFloat(v.toFixed(1))}千`;
    }
    return String(n);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(skill.id);
  };

  return (
    <div
      className="relative bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-gray-200 hover:shadow-md transition-all group flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      onClick={onClick}
    >
      {rank > 0 && <RankBadge rank={rank} />}

      <div className="p-4 pl-4 flex flex-col flex-1">
        {/* 技能名称 */}
        <h3 className="font-mono text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight mb-1 pl-3">
          {skill.name}
        </h3>

        {/* 中文简介 - 固定两行高度 */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pl-3" style={{ minHeight: '2.5rem' }}>
          {skill.descriptionZh}
        </p>

        {/* 统计数据 + 收藏按钮 - 常驻第三行 */}
        <div className="flex items-center justify-between mt-3 pl-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatCount(skill.downloads)}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {formatCount(skill.stars)}
            </span>
            <span className="font-mono text-gray-300">v{skill.version}</span>
          </div>
          {/* 收藏按钮 - 右下角 */}
          <button
            onClick={handleFavoriteClick}
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

// ─── 文件树节点 ───────────────────────────────────────────────────────────────

interface FileTreeNodeProps {
  file: PublicSkillFile;
  depth: number;
  selectedFile: PublicSkillFile | null;
  onSelect: (file: PublicSkillFile) => void;
}

function FileTreeNode({ file, depth, selectedFile, onSelect }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0);

  if (file.type === 'folder') {
    return (
      <div>
        <button
          className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          <span className="font-medium">{file.name}</span>
          {expanded ? <ChevronDown className="w-3 h-3 ml-auto text-gray-400" /> : <ChevronRightIcon className="w-3 h-3 ml-auto text-gray-400" />}
        </button>
        {expanded && file.children?.map(child => (
          <FileTreeNode
            key={child.path}
            file={child}
            depth={depth + 1}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  const isSelected = selectedFile?.path === file.path;
  return (
    <button
      className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onClick={() => onSelect(file)}
    >
      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span>{file.name}</span>
    </button>
  );
}

// ─── 技能详情页 ───────────────────────────────────────────────────────────────

interface SkillDetailViewProps {
  skill: PublicSkill;
  isFavorited: boolean;
  isInPackage: boolean;
  onFavorite: (skillId: string) => void;
  onAddToPackage: (skillId: string) => void;
  onBack: () => void;
}

function SkillDetailView({ skill, isFavorited, isInPackage, onFavorite, onAddToPackage, onBack }: SkillDetailViewProps) {
  const [selectedVersion, setSelectedVersion] = useState(skill.versions[0]);
  const [selectedFile, setSelectedFile] = useState<PublicSkillFile | null>(() => {
    // 默认选中 SKILL.md
    return skill.files.find(f => f.name === 'SKILL.md') || skill.files[0] || null;
  });
  const formatCount = (n: number) => {
    if (n >= 10000) {
      const v = n / 10000;
      return `${parseFloat(v.toFixed(1))}万`;
    }
    if (n >= 1000) {
      const v = n / 1000;
      return `${parseFloat(v.toFixed(1))}千`;
    }
    return String(n);
  };

  const handleFavoriteClick = () => {
    onFavorite(skill.id);
  };

  return (
    <div className="space-y-4">
      {/* 顶部导航 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回公共技能库
      </button>

      {/* 技能信息头部 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-mono text-lg font-bold text-gray-900">{skill.name}</h2>
              <Badge variant="secondary" className="text-xs font-mono">v{skill.version}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{skill.descriptionZh}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                {formatCount(skill.downloads)} 次下载
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                {formatCount(skill.stars)} 收藏
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            {/* 收藏按钮 */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavoriteClick}
                className={`gap-1.5 ${isFavorited ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? '已收藏' : '收藏'}
              </Button>

            </div>

            {/* 加入初始技能包 */}
            <Button
              size="sm"
              onClick={() => onAddToPackage(skill.id)}
              className={`gap-1.5 ${isInPackage ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <Package className="w-4 h-4" />
              {isInPackage ? '已加入技能包' : '加入初始技能包'}
            </Button>
          </div>
        </div>
      </div>

      {/* 三列内容区 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '520px' }}>
        <div className="flex h-full">
          {/* 左列：版本列表 */}
          <div className="w-44 border-r border-gray-100 flex flex-col shrink-0">
            <div className="px-3 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">版本</span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {skill.versions.map(v => (
                <button
                  key={v.version}
                  onClick={() => setSelectedVersion(v)}
                  className={`w-full text-left px-3 py-2.5 transition-colors ${
                    selectedVersion.version === v.version
                      ? 'bg-blue-50 border-r-2 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-mono font-semibold text-gray-800">{v.version}</span>
                    {v.isLatest && (
                      <span className="text-[10px] px-1 py-0 bg-green-100 text-green-700 rounded font-medium">最新</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{v.date.slice(0, 10)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 中列：文件目录 */}
          <div className="w-44 border-r border-gray-100 flex flex-col shrink-0">
            <div className="px-3 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{selectedVersion.version}</span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {skill.files.map(file => (
                <FileTreeNode
                  key={file.path}
                  file={file}
                  depth={0}
                  selectedFile={selectedFile}
                  onSelect={setSelectedFile}
                />
              ))}
            </div>
          </div>

          {/* 右列：文件内容预览 */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedFile ? (
              <>
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">{selectedFile.name}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedFile.name.endsWith('.md') ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedFile.content || '') }}
                    />
                  ) : (
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedFile.content || '（文件内容为空）'}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                选择文件查看内容
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface PublicSkillLibraryTabProps {
  packages: Array<{ id: string; name: string; isActive: boolean }>;
  onAddSkillToPackage: (skillId: string, packageId: string) => void;
}

const PAGE_SIZE = 24;

export default function PublicSkillLibraryTab({ packages, onAddSkillToPackage }: PublicSkillLibraryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');
  const [favorites, setFavorites] = useState<FavoriteSkill[]>([]);
  const [inPackageSkills, setInPackageSkills] = useState<Set<string>>(new Set());
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [addToPackageSkillId, setAddToPackageSkillId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 精选 Top 50：按下载量+收藏量综合排序
  const featuredSkills = useMemo(() => {
    return [...PUBLIC_SKILLS]
      .sort((a, b) => (b.downloads + b.stars) - (a.downloads + a.stars))
      .slice(0, 50);
  }, []);

  // 过滤技能
  const filteredSkills = useMemo(() => {
    let list: PublicSkill[] = [];

    if (activeCategory === 'all') {
      list = [...PUBLIC_SKILLS];
    } else if (activeCategory === 'featured') {
      list = featuredSkills;
    } else if (activeCategory === 'favorites') {
      const favIds = new Set(favorites.map(f => f.skillId));
      list = PUBLIC_SKILLS.filter(s => favIds.has(s.id));
    } else {
      list = PUBLIC_SKILLS.filter(s => s.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.nameZh.includes(q) ||
        s.descriptionZh.includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery, favorites, featuredSkills]);

  // 收藏操作
  const handleFavorite = (skillId: string) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.skillId === skillId);
      if (exists) {
        return prev.filter(f => f.skillId !== skillId);
      }
      return [...prev, { skillId, tags: [], addedAt: new Date() }];
    });
  };

  // 加入初始技能包
  const handleAddToPackage = (skillId: string) => {
    setAddToPackageSkillId(skillId);
  };

  const handlePackageSelected = (packageId: string) => {
    if (addToPackageSkillId) {
      onAddSkillToPackage(addToPackageSkillId, packageId);
      setInPackageSkills(prev => { const next = new Set(prev); next.add(addToPackageSkillId); return next; });
    }
    setAddToPackageSkillId(null);
  };

  const isFavorited = (skillId: string) => favorites.some(f => f.skillId === skillId);

  // 分页计算
  const totalPages = Math.ceil(filteredSkills.length / PAGE_SIZE);
  const pagedSkills = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSkills.slice(start, start + PAGE_SIZE);
  }, [filteredSkills, currentPage]);

  // 切换分类或搜索时重置到第一页
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // 如果选中了技能，显示详情页
  if (selectedSkillId) {
    const skill = PUBLIC_SKILLS.find(s => s.id === selectedSkillId);
    if (skill) {
      return (
        <>
          <SkillDetailView
            skill={skill}
            isFavorited={isFavorited(skill.id)}
            isInPackage={inPackageSkills.has(skill.id)}
            onFavorite={handleFavorite}
            onAddToPackage={handleAddToPackage}
            onBack={() => setSelectedSkillId(null)}
          />
          <AddToPackageDialog
            open={!!addToPackageSkillId}
            skillName={PUBLIC_SKILLS.find(s => s.id === addToPackageSkillId)?.nameZh || ''}
            packages={packages}
            onConfirm={handlePackageSelected}
            onCancel={() => setAddToPackageSkillId(null)}
          />
        </>
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* 搜索框 + 刷新按钮 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索技能名称或关键词..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
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

      {/* 分类 Tab */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PUBLIC_SKILL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              activeCategory === cat.id
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            style={activeCategory === cat.id ? { backgroundColor: '#007AFF', borderColor: '#007AFF' } : undefined}
          >
            {cat.name}
          </button>
        ))}
      </div>



      {/* 技能卡片网格 */}
      {filteredSkills.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-4" style={{ opacity: isRefreshing ? 0 : 1, transition: 'opacity 0.25s ease' }}>
            {pagedSkills.map((skill, index) => {
              const globalRank = (currentPage - 1) * PAGE_SIZE + index + 1;
              const isFeatured = activeCategory === 'featured';
              return (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  rank={isFeatured ? globalRank : 0}
                  isFavorited={isFavorited(skill.id)}
                  onFavorite={handleFavorite}
                  onClick={() => setSelectedSkillId(skill.id)}
                />
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filteredSkills.length}
            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {activeCategory === 'favorites' && favorites.length === 0
              ? '还没有收藏任何技能'
              : '没有找到匹配的技能'}
          </p>
        </div>
      )}
    </div>
  );
}
