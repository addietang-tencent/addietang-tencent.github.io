/**
 * 公共技能库 Tab
 * 设计风格：浅色主题，卡片式布局，精选排行榜
 */
import { useState, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Download, Star, Heart, ChevronRight,
  ArrowLeft, ChevronDown, ChevronRight as ChevronRightIcon, FileText, Folder, FolderOpen, RefreshCw, Package, Eye, Code
} from 'lucide-react';
import {
  PUBLIC_SKILLS, PUBLIC_SKILL_CATEGORIES, type PublicSkill, type FavoriteSkill, type PublicSkillFile
} from './publicSkillMockData';
import MDXRenderer from '@/components/MDXRenderer';
import AddToPackageDialog from './AddToPackageDialog';

// 懒加载 react-syntax-highlighter 减少首屏包体积
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(mod => ({ default: mod.Light as any }))
);
const _loadedLanguages = new Set<string>();
const registerLanguage = async (lang: string) => {
  if (_loadedLanguages.has(lang)) return;
  _loadedLanguages.add(lang);
  try {
    const mod = await import('react-syntax-highlighter');
    const Light = mod.Light as any;
    const langModules: Record<string, () => Promise<any>> = {
      xml: () => import('react-syntax-highlighter/dist/esm/languages/hljs/xml'),
      json: () => import('react-syntax-highlighter/dist/esm/languages/hljs/json'),
      yaml: () => import('react-syntax-highlighter/dist/esm/languages/hljs/yaml'),
      python: () => import('react-syntax-highlighter/dist/esm/languages/hljs/python'),
      javascript: () => import('react-syntax-highlighter/dist/esm/languages/hljs/javascript'),
      typescript: () => import('react-syntax-highlighter/dist/esm/languages/hljs/typescript'),
      bash: () => import('react-syntax-highlighter/dist/esm/languages/hljs/bash'),
      css: () => import('react-syntax-highlighter/dist/esm/languages/hljs/css'),
      ini: () => import('react-syntax-highlighter/dist/esm/languages/hljs/ini'),
      markdown: () => import('react-syntax-highlighter/dist/esm/languages/hljs/markdown'),
    };
    const loader = langModules[lang];
    if (loader) {
      const langMod = await loader();
      Light.registerLanguage(lang, langMod.default);
    }
  } catch { /* 静默降级 */ }
};

// hljs 亮色主题样式（与企业技能库保持一致）
const hljsStyle: Record<string, React.CSSProperties> = {
  'hljs': { display: 'block', overflowX: 'auto', padding: '1em', background: '#ffffff', color: '#383a42' },
  'hljs-comment': { color: '#a0a1a7', fontStyle: 'italic' },
  'hljs-quote': { color: '#a0a1a7', fontStyle: 'italic' },
  'hljs-keyword': { color: '#a626a4' },
  'hljs-selector-tag': { color: '#a626a4' },
  'hljs-addition': { color: '#50a14f' },
  'hljs-number': { color: '#986801' },
  'hljs-string': { color: '#50a14f' },
  'hljs-meta': { color: '#4078f2' },
  'hljs-literal': { color: '#0184bb' },
  'hljs-doctag': { color: '#a626a4' },
  'hljs-regexp': { color: '#50a14f' },
  'hljs-attr': { color: '#986801' },
  'hljs-attribute': { color: '#50a14f' },
  'hljs-builtin-name': { color: '#e45649' },
  'hljs-name': { color: '#e45649' },
  'hljs-section': { color: '#e45649' },
  'hljs-tag': { color: '#e45649' },
  'hljs-variable': { color: '#e45649' },
  'hljs-template-variable': { color: '#e45649' },
  'hljs-selector-id': { color: '#e45649' },
  'hljs-title': { color: '#4078f2' },
  'hljs-type': { color: '#4078f2' },
  'hljs-symbol': { color: '#4078f2' },
  'hljs-bullet': { color: '#4078f2' },
  'hljs-link': { color: '#4078f2' },
  'hljs-deletion': { color: '#e45649' },
  'hljs-emphasis': { fontStyle: 'italic' },
  'hljs-strong': { fontWeight: 'bold' },
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
    py: 'python', js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    sh: 'bash', bash: 'bash', css: 'css',
    md: 'markdown', html: 'xml', htm: 'xml',
    ini: 'ini', cfg: 'ini', conf: 'ini',
  };
  return map[ext] || 'text';
}

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

  const btnBase = 'min-w-[28px] h-7 px-2 flex items-center justify-center rounded-xl text-xs font-medium transition-all';
  const btnActive = 'text-white shadow-sm';
  const btnInactive = 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50';
  const btnArrow = `${btnBase} border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5] mt-2">
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
              style={currentPage === p ? { backgroundColor: '#355EF1' } : undefined}
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
  const style = rank === 1
    ? "bg-[#E9F8EB] text-[#008236]"
    : rank === 2
    ? "bg-[#E8ECFE] text-[#1447E6]"
    : rank === 3
    ? "bg-[#F5F5F5] text-[#0A0A0A]"
    : "bg-[#F5F5F5] text-[#0A0A0A]";

  return (
    <div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 ${style}`}>
      <span className="text-xs font-bold tracking-[0.18px]">{rank}</span>
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
      className="relative bg-white rounded-xl border border-[#e5e5e5] cursor-pointer hover:border-gray-200 transition-all group flex flex-col"
     
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
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
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
          {expanded ? <FolderOpen className="w-3.5 h-3.5 shrink-0 text-gray-400" /> : <Folder className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
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

  // 剥离唯一顶层文件夹：如果 files 只有一个 folder，直接展示其 children
  const displayFiles = useMemo(() => {
    if (skill.files.length === 1 && skill.files[0].type === 'folder' && skill.files[0].children) {
      return skill.files[0].children;
    }
    return skill.files;
  }, [skill.files]);

  const [selectedFile, setSelectedFile] = useState<PublicSkillFile | null>(() => {
    // 默认选中 SKILL.md（在 displayFiles 中递归查找）
    const findSkillMd = (files: PublicSkillFile[]): PublicSkillFile | null => {
      for (const f of files) {
        if (f.name === 'SKILL.md') return f;
        if (f.children) {
          const found = findSkillMd(f.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findSkillMd(displayFiles.length > 0 ? displayFiles : skill.files) || skill.files[0] || null;
  });
  const [mdPreviewMode, setMdPreviewMode] = useState<'source' | 'preview'>(
    () => selectedFile?.name.endsWith('.md') ? 'preview' : 'source'
  );
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
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-5"
       >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-mono text-lg font-bold text-gray-900">{skill.name}</h2>
              <Badge variant="secondary" className="text-xs font-mono">v{skill.version}</Badge>
            </div>
            <p className="text-xs text-gray-400 font-mono mb-2">slug：{skill.name}</p>
            <p className="text-sm text-gray-600 mb-3">{skill.descriptionZh}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
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
          </div>
        </div>
      </div>

      {/* 三列内容区 */}
      <div className="flex h-[47rem] border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* 左列：版本列表 */}
        <div className="w-[14%] min-w-[120px] border-r border-gray-200 flex flex-col">
          <div className="bg-gray-50/50 px-3 py-3 border-b border-gray-200 flex items-center">
            <p className="text-xs font-medium text-gray-900">版本</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {skill.versions.map((v, idx) => (
              <button
                key={v.version}
                onClick={() => setSelectedVersion(v)}
                className={`w-full text-left px-3 py-2.5 border-b border-[#e5e5e5] transition-colors rounded-none ${
                  selectedVersion.version === v.version
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-normal ${
                    selectedVersion.version === v.version ? 'text-blue-700' : 'text-gray-700'
                  }`}>{v.version}</span>
                  {v.isLatest && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">最新</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{v.date.slice(0, 10)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 中列：文件目录 */}
        <div className="w-[22%] min-w-[160px] border-r border-gray-200 flex flex-col">
          <div className="bg-gray-50/50 px-3 py-3 border-b border-gray-200 flex items-center">
            <p className="text-xs font-medium text-gray-900">{selectedVersion.version}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {displayFiles.map(file => (
              <FileTreeNode
                key={file.path}
                file={file}
                depth={0}
                selectedFile={selectedFile}
                onSelect={(file) => {
                  setSelectedFile(file);
                  setMdPreviewMode(file.name.endsWith('.md') ? 'preview' : 'source');
                }}
              />
            ))}
          </div>
        </div>

        {/* 右列：文件内容预览 */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedFile ? (
            <>
              <div className="bg-gray-50/50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between min-h-[40px]">
                <p className="text-xs font-medium text-gray-900">{selectedFile.name}</p>
                {/* 源码/预览 切换（所有文件都显示） */}
                <div className="flex items-center gap-0.5 bg-gray-200/60 rounded p-0.5">
                  <button
                    onClick={() => setMdPreviewMode('preview')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      mdPreviewMode === 'preview'
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    预览
                  </button>
                  <button
                    onClick={() => setMdPreviewMode('source')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      mdPreviewMode === 'source'
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    源码
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {(() => {
                  const content = selectedFile.content || '';
                  if (!content) {
                    return (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">文件内容暂无</p>
                      </div>
                    );
                  }
                  // 源码模式：所有文件类型都使用语法高亮
                  if (mdPreviewMode === 'source') {
                    const lang = getLanguageFromFilename(selectedFile.name);
                    registerLanguage(lang);
                    return (
                      <Suspense fallback={
                        <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words font-mono leading-5 bg-gray-50 p-3 m-0">{content}</pre>
                      }>
                        <SyntaxHighlighter
                          language={lang}
                          style={hljsStyle}
                          showLineNumbers
                          lineNumberStyle={{ color: '#b0b0b0', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
                          customStyle={{ margin: 0, padding: '12px 0', fontSize: '12px', lineHeight: '1.6', background: '#ffffff', borderRadius: 0 }}
                          wrapLongLines
                        >
                          {content}
                        </SyntaxHighlighter>
                      </Suspense>
                    );
                  }
                  // 预览模式：md 文件用 MDXRenderer，其他文件也用语法高亮
                  if (selectedFile.name.toLowerCase().endsWith('.md') || selectedFile.name.toLowerCase().endsWith('.mdx')) {
                    return (
                      <div className="p-4">
                        <MDXRenderer content={content} />
                      </div>
                    );
                  }
                  const previewLang = getLanguageFromFilename(selectedFile.name);
                  registerLanguage(previewLang);
                  return (
                    <Suspense fallback={
                      <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words font-mono leading-5 bg-gray-50 p-3 m-0">{content}</pre>
                    }>
                      <SyntaxHighlighter
                        language={previewLang}
                        style={hljsStyle}
                        showLineNumbers
                        lineNumberStyle={{ color: '#b0b0b0', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
                        customStyle={{ margin: 0, padding: '12px 0', fontSize: '12px', lineHeight: '1.6', background: '#ffffff', borderRadius: 0 }}
                        wrapLongLines
                      >
                        {content}
                      </SyntaxHighlighter>
                    </Suspense>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">选择一个文件查看内容</p>
            </div>
          )}
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
        <Button
          variant="claw-outline"
          size="icon"
          onClick={() => {
            setIsRefreshing(true);
            setTimeout(() => {
              handleSearchChange('');
              setCurrentPage(1);
              setTimeout(() => setIsRefreshing(false), 50);
            }, 250);
          }}
          title="刷新"
          className="w-9 h-9"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* 分类 Tab */}
      <div className="flex items-center gap-2 flex-wrap">
        {PUBLIC_SKILL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#020617] border-[#020617] text-white'
                : 'bg-white border-[#e4e4e4] text-[#020617] hover:border-[#020617]'
            }`}
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
