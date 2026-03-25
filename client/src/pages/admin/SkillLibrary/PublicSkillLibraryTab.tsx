/**
 * 公共技能库 Tab
 * 设计风格：浅色主题，卡片式布局，精选排行榜
 */
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Download, Star, Heart, Package, ChevronRight,
  ArrowLeft, ChevronDown, ChevronRight as ChevronRightIcon, FileText, Folder, FolderOpen
} from 'lucide-react';
import {
  PUBLIC_SKILLS, PUBLIC_SKILL_CATEGORIES, type PublicSkill, type FavoriteSkill, type PublicSkillFile
} from './publicSkillMockData';
import { renderMarkdown } from '@/lib/markdownRenderer';
import AddToPackageDialog from './AddToPackageDialog';

// ─── 收藏标签气泡 ─────────────────────────────────────────────────────────────

interface FavoriteTagBubbleProps {
  onConfirm: (tags: string[]) => void;
  onSkip: () => void;
}

function FavoriteTagBubble({ onConfirm, onSkip }: FavoriteTagBubbleProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const availableTags = ['研发工具', '数据分析', '通用办公', '运维工具', '安全合规'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="absolute z-50 bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-56"
      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <p className="text-xs font-medium text-gray-700 mb-2">为该技能添加标签分类</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={onSkip}>
          跳过
        </Button>
        <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => onConfirm(selectedTags)}>
          确认
        </Button>
      </div>
      {/* 气泡箭头 */}
      <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
    </div>
  );
}

// ─── 排名徽章 ─────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md z-10">
      <span className="text-white text-xs font-bold">1</span>
    </div>
  );
  if (rank === 2) return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md z-10">
      <span className="text-white text-xs font-bold">2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md z-10">
      <span className="text-white text-xs font-bold">3</span>
    </div>
  );
  return (
    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center z-10">
      <span className="text-gray-500 text-xs font-medium">{rank}</span>
    </div>
  );
}

// ─── 技能卡片 ─────────────────────────────────────────────────────────────────

interface SkillCardProps {
  skill: PublicSkill;
  rank: number;
  isFavorited: boolean;
  isInPackage: boolean;
  onFavorite: (skillId: string) => void;
  onAddToPackage: (skillId: string) => void;
  onClick: () => void;
}

function SkillCard({ skill, rank, isFavorited, isInPackage, onFavorite, onAddToPackage, onClick }: SkillCardProps) {
  const [showFavBubble, setShowFavBubble] = useState(false);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorited) {
      setShowFavBubble(true);
    } else {
      onFavorite(skill.id);
    }
  };

  const handleFavConfirm = (tags: string[]) => {
    setShowFavBubble(false);
    onFavorite(skill.id);
  };

  const handleFavSkip = () => {
    setShowFavBubble(false);
    onFavorite(skill.id);
  };

  const handleAddToPackage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPackage(skill.id);
  };

  return (
    <div
      className="relative bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      onClick={onClick}
    >
      <RankBadge rank={rank} />

      <div className="pl-3">
        {/* 技能名称 */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-mono text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
            {skill.name}
          </h3>
        </div>

        {/* 中文简介 */}
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{skill.descriptionZh}</p>

        {/* 统计数据 */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
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

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-1 relative">
          {/* 收藏按钮 */}
          <div className="relative">
            <button
              onClick={handleFavoriteClick}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isFavorited
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title={isFavorited ? '取消收藏' : '添加到我的收藏'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            {showFavBubble && (
              <FavoriteTagBubble onConfirm={handleFavConfirm} onSkip={handleFavSkip} />
            )}
          </div>

          {/* 加入初始技能包按钮 */}
          <button
            onClick={handleAddToPackage}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isInPackage
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title={isInPackage ? '已加入初始技能包' : '加入初始技能包'}
          >
            <Package className={`w-3.5 h-3.5 ${isInPackage ? 'fill-current' : ''}`} />
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
  const [showFavBubble, setShowFavBubble] = useState(false);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const handleFavoriteClick = () => {
    if (!isFavorited) {
      setShowFavBubble(true);
    } else {
      onFavorite(skill.id);
    }
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
              {showFavBubble && (
                <div className="absolute z-50 top-full mt-2 right-0">
                  <FavoriteTagBubble
                    onConfirm={(tags) => { setShowFavBubble(false); onFavorite(skill.id); }}
                    onSkip={() => { setShowFavBubble(false); onFavorite(skill.id); }}
                  />
                </div>
              )}
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

export default function PublicSkillLibraryTab({ packages, onAddSkillToPackage }: PublicSkillLibraryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');
  const [favoriteTags, setFavoriteTags] = useState<string[]>([]); // 我的收藏二级标签筛选
  const [favorites, setFavorites] = useState<FavoriteSkill[]>([]);
  const [inPackageSkills, setInPackageSkills] = useState<Set<string>>(new Set());
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [addToPackageSkillId, setAddToPackageSkillId] = useState<string | null>(null);

  // 精选 Top 50：按下载量+收藏量综合排序
  const featuredSkills = useMemo(() => {
    return [...PUBLIC_SKILLS]
      .sort((a, b) => (b.downloads + b.stars) - (a.downloads + a.stars))
      .slice(0, 50);
  }, []);

  // 过滤技能
  const filteredSkills = useMemo(() => {
    let list: PublicSkill[] = [];

    if (activeCategory === 'featured') {
      list = featuredSkills;
    } else if (activeCategory === 'favorites') {
      const favIds = new Set(favorites.map(f => f.skillId));
      list = PUBLIC_SKILLS.filter(s => favIds.has(s.id));
      // 二级标签筛选
      if (favoriteTags.length > 0) {
        const taggedIds = new Set(
          favorites.filter(f => f.tags.some(t => favoriteTags.includes(t))).map(f => f.skillId)
        );
        list = list.filter(s => taggedIds.has(s.id));
      }
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
  }, [activeCategory, searchQuery, favorites, favoriteTags, featuredSkills]);

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

  // 收藏时带标签
  const handleFavoriteWithTags = (skillId: string, tags: string[]) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.skillId === skillId);
      if (exists) {
        return prev.map(f => f.skillId === skillId ? { ...f, tags } : f);
      }
      return [...prev, { skillId, tags, addedAt: new Date() }];
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

  // 收藏的二级标签（从已收藏技能中提取）
  const allFavTags = useMemo(() => {
    const tags = new Set<string>();
    favorites.forEach(f => f.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [favorites]);

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
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜索技能名称或描述..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* 分类 Tab */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PUBLIC_SKILL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setFavoriteTags([]); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 我的收藏二级标签 */}
      {activeCategory === 'favorites' && allFavTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pl-1">
          <span className="text-xs text-gray-400">筛选：</span>
          <button
            onClick={() => setFavoriteTags([])}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              favoriteTags.length === 0
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {allFavTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFavoriteTags(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
              )}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                favoriteTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 列表标题 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {activeCategory === 'featured' && `精选 Top 50 · 按下载量+收藏量综合排序`}
          {activeCategory === 'favorites' && `我的收藏 · 共 ${filteredSkills.length} 个技能`}
          {!['featured', 'favorites'].includes(activeCategory) && `共 ${filteredSkills.length} 个技能`}
        </span>
      </div>

      {/* 技能卡片网格 */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill, index) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              rank={index + 1}
              isFavorited={isFavorited(skill.id)}
              isInPackage={inPackageSkills.has(skill.id)}
              onFavorite={handleFavorite}
              onAddToPackage={handleAddToPackage}
              onClick={() => setSelectedSkillId(skill.id)}
            />
          ))}
        </div>
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

      {/* 加入初始技能包弹窗 */}
      <AddToPackageDialog
        open={!!addToPackageSkillId}
        skillName={PUBLIC_SKILLS.find(s => s.id === addToPackageSkillId)?.nameZh || ''}
        packages={packages}
        onConfirm={handlePackageSelected}
        onCancel={() => setAddToPackageSkillId(null)}
      />
    </div>
  );
}
