import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import TenantLayout from '@/components/TenantLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurfaceCard, SurfaceInner } from '@/components/ui/Surface';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 格式化下载量：>=1000 显示 x.xk，否则原样
function formatDownloadCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

// 获取名称首字符：英文返回大写字母，中文统一返回 'A'
function getSkillInitial(name: string): string | null {
  if (!name) return null;
  const firstChar = name.charAt(0);
  // 英文字母
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }
  // 中文标题统一用 A 替代
  return 'A';
}

// 为不同字母分配渐变色，色系对齐 Agent 头像风格（蓝紫、靛蓝、青色系柔和渐变）
const LETTER_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#E8F4FD", text: "#1A73E8" },
  B: { bg: "#F3E8FD", text: "#8B5CF6" },
  C: { bg: "#E8FDF0", text: "#16A34A" },
  D: { bg: "#FDF2E8", text: "#EA580C" },
  E: { bg: "#FDE8F0", text: "#DC2626" },
  F: { bg: "#FDE8F0", text: "#DC2626" },
  G: { bg: "#E8FDF0", text: "#16A34A" },
  H: { bg: "#E8F4FD", text: "#1A73E8" },
  I: { bg: "#F3E8FD", text: "#8B5CF6" },
  J: { bg: "#FDF2E8", text: "#EA580C" },
  K: { bg: "#E8FDF0", text: "#16A34A" },
  L: { bg: "#E8F4FD", text: "#1A73E8" },
  M: { bg: "#F3E8FD", text: "#8B5CF6" },
  N: { bg: "#FDE8F0", text: "#DC2626" },
  O: { bg: "#FDF2E8", text: "#EA580C" },
  P: { bg: "#E8FDF0", text: "#16A34A" },
  Q: { bg: "#E8F4FD", text: "#1A73E8" },
  R: { bg: "#F3E8FD", text: "#8B5CF6" },
  S: { bg: "#E8F4FD", text: "#1A73E8" },
  T: { bg: "#F3E8FD", text: "#8B5CF6" },
  U: { bg: "#E8FDF0", text: "#16A34A" },
  V: { bg: "#FDF2E8", text: "#EA580C" },
  W: { bg: "#FDE8F0", text: "#DC2626" },
  X: { bg: "#E8F4FD", text: "#1A73E8" },
  Y: { bg: "#F3E8FD", text: "#8B5CF6" },
  Z: { bg: "#E8FDF0", text: "#16A34A" },
};
function getLetterColor(letter: string): { bg: string; text: string } {
  return LETTER_COLORS[letter.toUpperCase()] || { bg: "#E8F4FD", text: "#1A73E8" };
}

function getLetterGradient(letter: string): string {
  return `from-[${getLetterColor(letter).bg}] to-[${getLetterColor(letter).bg}]`;
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Code,
  Eye,
  Download,
  Loader,
  RefreshCw,
  Puzzle,
  CheckCircle,
  XCircle,
  Circle,
  Clock,
  Info,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { toast } from 'sonner';

// 复用管控端数据和组件
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_OPENCLAW_INSTANCES } from '../admin/SkillLibrary/mockData';
import { type Skill, type DistributionStatus, DISTRIBUTION_STATUS_MAP, SECURITY_STATUS_MAP, type SecurityStatus } from '../admin/SkillLibrary/types';
import {
  getDistributionRecords,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  initMockDistributionRecords,
  type CachedDistributionRecord,
} from '../admin/SkillLibrary/distributionCache';
import { downloadSkillAsZip } from '../admin/SkillLibrary/downloadUtils';
import BatchDistributeDialog from '../admin/SkillLibrary/BatchDistributeDialog';
import MDXRenderer from '@/components/MDXRenderer';

// 懒加载 react-syntax-highlighter
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(mod => ({ default: mod.Light as any }))
);
const loadedLanguages = new Set<string>();
const registerLanguage = async (lang: string) => {
  if (loadedLanguages.has(lang)) return;
  loadedLanguages.add(lang);
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

// hljs 亮色主题
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

// ========== Mock 用户身份（模拟当前用户所属分组） ==========
const CURRENT_USER_GROUP_IDS = ['grp-1', 'grp-2'];

// ========== Mock 下载量数据 ==========
const MOCK_DOWNLOAD_COUNTS: Record<string, number> = {
  'skill-0': 1286,
  'skill-1': 432,
  'skill-2': 867,
  'skill-3': 523,
  'skill-4': 198,
  'skill-5': 945,
  'skill-6': 312,
  'skill-7': 756,
  'skill-8': 89,
  'skill-9': 167,
};

// ========== 排序类型 ==========
type SortType = 'time' | 'downloads';
type ViewMode = 'card' | 'list';

// ========== 过滤可见技能（应用范围过滤） ==========
function getVisibleSkills(skills: Skill[], userGroupIds: string[]): Skill[] {
  return skills.filter(skill => {
    if (skill.scope === 'public') return true;
    // scope=private: 用户分组与技能分组有交集才可见
    if (skill.scope === 'private' && skill.groupIds.length > 0) {
      return skill.groupIds.some(gId => userGroupIds.includes(gId));
    }
    return false;
  });
}

export default function SkillSquare() {
  // 初始化预设下发记录（仅首次、localStorage为空时生效）
  useEffect(() => { initMockDistributionRecords(); }, []);

  // ========== 列表状态 ==========
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [sortType, setSortType] = useState<SortType>('time');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [skills] = useState<Skill[]>(MOCK_SKILLS);

  // ========== 详情状态 ==========
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<string>('overview');

  // 过滤可见技能
  const visibleSkills = useMemo(
    () => getVisibleSkills(skills, CURRENT_USER_GROUP_IDS),
    [skills]
  );

  // 搜索 + 分类筛选
  const filteredSkills = useMemo(() => {
    let result = visibleSkills;

    // 搜索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }

    // 分类筛选
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.categories.includes(selectedCategory));
    }

    // 排序
    if (sortType === 'time') {
      result = [...result].sort(
        (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
      );
    } else {
      result = [...result].sort(
        (a, b) => (MOCK_DOWNLOAD_COUNTS[b.id] || 0) - (MOCK_DOWNLOAD_COUNTS[a.id] || 0)
      );
    }

    return result;
  }, [visibleSkills, searchQuery, selectedCategory, sortType]);

  // 刷新
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('列表已刷新');
    }, 1000);
  };

  // 如果选中了技能，渲染详情页
  if (selectedSkillId) {
    return (
      <TenantLayout>
        {/* 标准骨架：min-w-[1200px] + max-w-[1920px] + 左右 80px 占位带
              · min-h-[calc(100vh-64px)] 放在外层 flex 上，让中间 + 两侧占位带共同撑满视口
              · 中间内容区仅 flex-1 min-w-0 relative，不带 px/py，由内部各分段（header/tab/内容/底部分隔栏）自管理 */}
        <div className="min-w-[1200px] overflow-x-clip">
          <div className="max-w-[1920px] mx-auto flex items-stretch page-enter min-h-[calc(100vh-64px)]">
            <div aria-hidden className="shrink-0 w-20 self-stretch" />
            <div className="flex-1 min-w-0 relative flex flex-col pb-[75px]">
              {/* 中间内容区左右贯穿竖线 */}
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 left-0 z-30 w-px bg-[#E2E8F0]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 right-0 z-30 w-px bg-[#E2E8F0]"
              />
              <div className="relative flex-1 flex flex-col">
                <SkillSquareDetail
                  skillId={selectedSkillId}
                  skills={visibleSkills}
                  onBack={() => { setSelectedSkillId(null); setInitialTab('overview'); }}
                  initialTab={initialTab}
                />
              </div>
            </div>
            <div aria-hidden className="shrink-0 w-20 self-stretch" />
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      {/* 与「我的 Agent」(MyOpenClaw) 完全一致的外壳骨架：
            · min-w-[1200px] 兜底小屏（整体横滚不重排）
            · max-w-[1920px] mx-auto 大屏限宽（两侧自动均分留白）
            · 内层 flex：左右 w-20 (80px) 占位带 + 中间 flex-1 内容区
            · 内容区内部用 px-[42px] py-8，与「我的 Agent」段落内边距对齐
            这样技能广场两侧留白与「我的 Agent」完全一致，不会比它更宽。 */}
      <div className="min-w-[1200px] overflow-x-clip">
        <div className="max-w-[1920px] mx-auto flex items-stretch page-enter">
          <div aria-hidden className="shrink-0 w-20 self-stretch" />
          <div className="flex-1 min-w-0 relative min-h-[calc(100vh-64px)] pb-[75px]">
            {/* 中间内容区左右竖向分隔线 — 对齐「我的 Agent」 */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 left-0 z-30 w-px bg-[#E2E8F0]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 right-0 z-30 w-px bg-[#E2E8F0]"
            />
            {/* 左右两侧点阵装饰层 — 对齐「我的 Agent」
                覆盖范围：hero 底线(112px) ~ 底部分割线(bottom 75px = paddingBottom)
                点阵规格：12×12 网格 / 2×2 圆点（半径 1px）/ #DFE2E5 */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                top: "112px",
                bottom: "75px",
                left: "calc((100% - 100vw) / 2)",
                right: "100%",
                backgroundImage: "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
                backgroundSize: "12px 12px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                top: "112px",
                bottom: "75px",
                left: "100%",
                right: "calc((100% - 100vw) / 2)",
                backgroundImage: "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
                backgroundSize: "12px 12px",
              }}
            />
            {/* Hero 段 — 对齐「我的 Agent」HeroBanner 样式（112px / 渐变标题 / 底部贯穿分割线） */}
            <div className="relative h-[112px]">
              <div className="h-[112px] px-[42px] border-l border-r border-[#E2E8F0] flex flex-col justify-center gap-2 overflow-hidden">
                <h1 className="font-sans font-medium text-[26px] leading-[35.56px] tracking-[-0.0427em] m-0 w-fit bg-gradient-to-r from-[#0A0A0A] to-[#1447E6] bg-clip-text text-transparent">
                  企业技能
                </h1>
                <p className="font-sans font-normal text-xs leading-[22.22px] tracking-[0.015em] text-[#737373] m-0">
                  一键选装企业内的优质技能。
                </p>
              </div>
              {/* 贯穿底部分割线 */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: "calc(50% - 50vw)",
                  width: "100vw",
                  bottom: 0,
                  height: "1px",
                  backgroundColor: "#E2E8F0",
                }}
              />
            </div>

            {/* 内容段（搜索栏 / 分类 / 卡片网格） */}
            <div
              className="relative px-[42px] py-6"
            >

        {/* 搜索栏 + 筛选 */}
        <div className="relative flex flex-wrap gap-3 mb-4 items-center">
          {/* 搜索框 — 加长 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]"/>
            <Input
              placeholder="搜索技能名称或描述..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#E5E5E5] rounded-[4px]"
            />
          </div>

          {/* 排序 */}
          <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
            <SelectTrigger className="w-32 bg-white border-[#E5E5E5] rounded-[4px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">发布时间</SelectItem>
              <SelectItem value="downloads">下载量</SelectItem>
            </SelectContent>
          </Select>

          {/* 刷新按钮 */}
          <Button
            variant="claw-outline"
            size="icon"
            onClick={handleRefresh}
            className="w-9 h-9"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* 视图切换 — 对齐 §8.6 Segmented Control */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-[4px] bg-[#F5F5F5]"
            
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('card')}
              className={`w-8 h-8 rounded-[3px] ${
                viewMode === 'card'
                  ? 'bg-white text-[#0A0A0A]'
                  : 'text-[#737373] hover:text-[#0A0A0A] hover:bg-transparent'
              }`}
              style={viewMode === 'card' ? { boxShadow: "var(--shadow-segment)" } : undefined}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 rounded-[3px] ${
                viewMode === 'list'
                  ? 'bg-white text-[#0A0A0A]'
                  : 'text-[#737373] hover:text-[#0A0A0A] hover:bg-transparent'
              }`}
              style={viewMode === 'list' ? { boxShadow: "var(--shadow-segment)" } : undefined}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 分类横排按钮 */}
        <div className="relative flex items-center gap-1.5 mb-6 flex-wrap pl-1">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            全部
          </Button>
          {DEFAULT_CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* 技能列表 */}
        {filteredSkills.length === 0 ? (
          <div className="relative text-center py-24">
            <Puzzle className="w-12 h-12 mx-auto mb-4 text-[#E5E5E5]" />
            <p className="mb-4 text-[#A3A3A3]">暂无符合条件的技能</p>
          </div>
        ) : viewMode === 'card' ? (
          /* 卡片视图：常规 3 列 / 超大屏 4 列（>1600px 时启用，配合 §7.4 三档容器） */
          <div className="relative grid grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                downloadCount={MOCK_DOWNLOAD_COUNTS[skill.id] || 0}
                onClick={() => setSelectedSkillId(skill.id)}
                onDistStatusClick={() => { setInitialTab('distribution'); setSelectedSkillId(skill.id); }}
              />
            ))}
          </div>
        ) : (
          /* 列表视图 — 紧凑横排布局 */
          <SurfaceCard className="relative overflow-hidden">
            <div className="divide-y divide-[#F5F5F5]">
              {filteredSkills.map(skill => (
                <SkillListRow
                  key={skill.id}
                  skill={skill}
                  downloadCount={MOCK_DOWNLOAD_COUNTS[skill.id] || 0}
                  onClick={() => setSelectedSkillId(skill.id)}
                  onDistStatusClick={() => { setInitialTab('distribution'); setSelectedSkillId(skill.id); }}
                />
              ))}
            </div>
          </SurfaceCard>
        )}
            </div>
            {/* /内容段 */}

            {/* 底部贯穿分割线 — 绝对定位于容器 bottom: 75px（paddingBottom 区域上方），吸底 */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: "calc(50% - 50vw)",
                width: "100vw",
                bottom: "75px",
                height: "1px",
                backgroundColor: "#E2E8F0",
              }}
            />
          </div>
          <div aria-hidden className="shrink-0 w-20 self-stretch" />
        </div>
      </div>
    </TenantLayout>
  );
}

// ========== 卡片组件 ==========
function SkillCard({
  skill,
  downloadCount,
  onClick,
  onDistStatusClick,
}: {
  skill: Skill;
  downloadCount: number;
  onClick: () => void;
  onDistStatusClick?: () => void;
}) {
  const [distributeOpen, setDistributeOpen] = useState(false);

  // 获取该技能的最新下发状态
  const latestRecord = getDistributionRecords(skill.id)?.[0];
  const distStatus = latestRecord?.status;
  const isDistributing = distStatus === 'distributing';

  const handleDistributeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDistributing) return; // 下发中禁止点击
    setDistributeOpen(true);
  };

  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: skill.id,
      timestamp: new Date().toISOString(),
      totalCount: selectedInstanceIds.length,
      successCount: 0,
      failedCount: 0,
      inProgressCount: selectedInstanceIds.length,
      status: 'distributing',
      instances: selectedInstancesData.map(inst => ({
        id: inst.id,
        name: inst.name,
        createdBy: inst.createdBy || 'admin',
        distributionStatus: 'distributing' as DistributionStatus,
      })),
    };
    addDistributionRecord(newRecord);
    setDistributeOpen(false);
    toast.success(`已开始下发「${skill.name}」到 ${selectedInstanceIds.length} 个实例`);
    simulateDistribution(recordId, selectedInstanceIds.length);
  };

  const initial = getSkillInitial(skill.name);

  return (
    <>
      <SurfaceCard
        hover
        className="group relative flex flex-col cursor-pointer"
        style={{ padding: "20px", gap: "16px" }}
        onClick={onClick}
      >
        {/* ===== 头部行：图标(字母) + 名称/版本 + 下载量 ===== */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {initial && (
              <div
                className="flex items-center justify-center flex-shrink-0 rounded-[4px]"
                style={{ width: 40, height: 40, background: getLetterColor(initial).bg }}
              >
                <span className="font-bold text-sm" style={{ color: getLetterColor(initial).text }}>{initial}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className="truncate transition-colors group-hover:text-[#1447e6]"
                  style={{
                    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: "#0A0A0A",
                  }}
                  title={skill.name}
                >
                  {skill.name}
                </h3>
                {/* 下发状态图标 */}
                {distStatus && <DistributionStatusIcon status={distStatus} latestRecord={latestRecord} onClick={() => onDistStatusClick?.()} />}
              </div>
              <span
                style={{
                  fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "20px",
                  color: "#A3A3A3",
                }}
              >
                v{skill.version}
              </span>
            </div>
          </div>

          {/* 右上角：下载量 */}
          <div
            className="flex items-center flex-shrink-0"
            style={{
              gap: "4px",
              fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "20px",
              color: "#A3A3A3",
            }}
          >
            <Download className="w-3 h-3" />
            <span className="tabular-nums">{formatDownloadCount(downloadCount)}</span>
          </div>
        </div>

        {/* ===== 描述 — 支持展示三行 ===== */}
        <p
          className="line-clamp-3"
          style={{
            fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "20px",
            color: "#737373",
          }}
        >
          {skill.description}
        </p>

        {/* ===== 底部行：发布时间 + 下发按钮 ===== */}
        <div className="flex items-center justify-between">
          <span
            className="truncate"
            style={{
              fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "20px",
              color: "#A3A3A3",
            }}
          >
            {formatDate(skill.uploadTime)}
          </span>
          {isDistributing ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex items-center justify-center size-8 rounded-[4px] border border-[#e5e5e5] text-[rgba(2,6,23,0.3)] cursor-not-allowed flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="w-4 h-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent><span className="text-xs">请等待下发完成</span></TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="claw-outline"
              size="icon-sm"
              onClick={handleDistributeClick}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SurfaceCard>

      {/* 下发弹窗 */}
      <BatchDistributeDialog
        open={distributeOpen}
        onOpenChange={setDistributeOpen}
        skillName={skill.name}
        skillVersion={skill.version}
        onDistributionStart={handleDistributionStart}
        title="下发技能"
        showScopeFilter={false}
        instances={getMyInstances()}
        hideCreatorAndGroup
      />
    </>
  );
}

// ========== 列表行组件 ==========
function SkillListRow({
  skill,
  downloadCount,
  onClick,
  onDistStatusClick,
}: {
  skill: Skill;
  downloadCount: number;
  onClick: () => void;
  onDistStatusClick?: () => void;
}) {
  const [distributeOpen, setDistributeOpen] = useState(false);

  const latestRecord = getDistributionRecords(skill.id)?.[0];
  const distStatus = latestRecord?.status;
  const isDistributing = distStatus === 'distributing';

  const handleDistributeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDistributing) return;
    setDistributeOpen(true);
  };

  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: skill.id,
      timestamp: new Date().toISOString(),
      totalCount: selectedInstanceIds.length,
      successCount: 0,
      failedCount: 0,
      inProgressCount: selectedInstanceIds.length,
      status: 'distributing',
      instances: selectedInstancesData.map(inst => ({
        id: inst.id,
        name: inst.name,
        createdBy: inst.createdBy || 'admin',
        distributionStatus: 'distributing' as DistributionStatus,
      })),
    };
    addDistributionRecord(newRecord);
    setDistributeOpen(false);
    toast.success(`已开始下发「${skill.name}」到 ${selectedInstanceIds.length} 个实例`);
    simulateDistribution(recordId, selectedInstanceIds.length);
  };

  const initial = getSkillInitial(skill.name);
  // 格式化短日期 250303
  const shortDate = (() => {
    const d = typeof skill.uploadTime === 'string' ? new Date(skill.uploadTime) : skill.uploadTime;
    const y = String(d.getFullYear()).slice(2);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  })();

  return (
    <>
      <div
        className="flex items-center px-5 py-5 hover:bg-gray-50/50 transition-colors cursor-pointer gap-4"
        onClick={onClick}
      >
        {/* 左：图标(字母) + 名称 + 描述 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {initial && (
            <div
              className="w-9 h-9 rounded-[4px] flex items-center justify-center flex-shrink-0"
              style={{ background: getLetterColor(initial).bg }}
            >
              <span className="text-sm font-bold" style={{ color: getLetterColor(initial).text }}>{initial}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate text-[#0A0A0A]">{skill.name}</span>
            </div>
            <p className="text-sm truncate mt-1 text-[#737373]">{skill.description}</p>
          </div>
        </div>

        {/* 下载量 */}
        <div className="flex items-center gap-1 flex-shrink-0 text-xs tabular-nums whitespace-nowrap text-[#A3A3A3]">
          <Download className="w-3 h-3" />
          {formatDownloadCount(downloadCount)}
        </div>

        {/* 版本+日期 */}
        <div className="flex-shrink-0 text-xs tabular-nums whitespace-nowrap text-[#A3A3A3]">
          v{skill.version}({shortDate})
        </div>

        {/* 下发状态图标 — 未下发时也显示置灰图标占位 */}
        {distStatus ? (
          <DistributionStatusIcon status={distStatus} latestRecord={latestRecord} onClick={() => onDistStatusClick?.()} />
        ) : (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-default" onClick={(e) => e.stopPropagation()}>
                <Circle className="w-3.5 h-3.5 hover:text-[#1447E6] transition-colors text-[#E5E5E5]" />
              </span>
            </TooltipTrigger>
            <TooltipContent><span className="text-xs">还没下发过</span></TooltipContent>
          </Tooltip>
        )}

        {/* + 按钮 */}
        {isDistributing ? (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span
                className="w-7 h-7 rounded-[4px] border border-[#E5E5E5] flex items-center justify-center cursor-not-allowed flex-shrink-0 text-[#A3A3A3]"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="w-3.5 h-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent><span className="text-xs">请等待下发完成</span></TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="claw-outline"
            size="icon"
            onClick={handleDistributeClick}
            className="w-7 h-7 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <BatchDistributeDialog
        open={distributeOpen}
        onOpenChange={setDistributeOpen}
        skillName={skill.name}
        skillVersion={skill.version}
        onDistributionStart={handleDistributionStart}
        title="下发技能"
        showScopeFilter={false}
        instances={getMyInstances()}
        hideCreatorAndGroup
      />
    </>
  );
}

// ========== 详情页组件 ==========
function SkillSquareDetail({
  skillId,
  skills,
  onBack,
  initialTab = 'overview',
}: {
  skillId: string;
  skills: Skill[];
  onBack: () => void;
  initialTab?: string;
}) {
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>('SKILL.md');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [fileViewMode, setFileViewMode] = useState<'preview' | 'source'>('preview');

  // ========== 点阵装饰层动态测量（参照 OpenClawDetailGuide）==========
  // 点阵从 Header 底部横线开始，到底部分隔栏顶部横线结束
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerElRef = useRef<HTMLElement | null>(null);
  const bottomBarElRef = useRef<HTMLDivElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [dotsTop, setDotsTop] = useState(112);
  const [dotsBottom, setDotsBottom] = useState(75);

  const recomputeDots = useCallback(() => {
    const root = rootRef.current;
    const header = headerElRef.current;
    const bottomBar = bottomBarElRef.current;
    if (!root) return;
    if (header) {
      const rootRect = root.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      setDotsTop(headerRect.bottom - rootRect.top);
    }
    if (bottomBar) {
      const rootRect = root.getBoundingClientRect();
      const barRect = bottomBar.getBoundingClientRect();
      const barTopInRoot = barRect.top - rootRect.top;
      setDotsBottom(root.offsetHeight - barTopInRoot);
    }
  }, []);

  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (!node) return;
    recomputeDots();
    if (roRef.current) roRef.current.disconnect();
    const ro = new ResizeObserver(recomputeDots);
    ro.observe(node);
    if (headerElRef.current) ro.observe(headerElRef.current);
    if (bottomBarElRef.current) ro.observe(bottomBarElRef.current);
    roRef.current = ro;
  }, [recomputeDots]);

  const setHeaderRef = useCallback((node: HTMLElement | null) => {
    headerElRef.current = node;
    recomputeDots();
    if (node && roRef.current) roRef.current.observe(node);
  }, [recomputeDots]);

  const setBottomBarRef = useCallback((node: HTMLDivElement | null) => {
    bottomBarElRef.current = node;
    recomputeDots();
    if (node && roRef.current) roRef.current.observe(node);
  }, [recomputeDots]);

  useEffect(() => {
    window.addEventListener("resize", recomputeDots);
    return () => window.removeEventListener("resize", recomputeDots);
  }, [recomputeDots]);

  // 下发记录
  const [distributionRecords, setDistributionRecords] = useState<CachedDistributionRecord[]>([]);
  const [activeDistributionId, setActiveDistributionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | DistributionStatus>('all');
  const [detailSearchQuery, setDetailSearchQuery] = useState('');

  const refreshRecords = useCallback(() => {
    setDistributionRecords(getDistributionRecords(skillId));
  }, [skillId]);

  useEffect(() => {
    refreshRecords();
    const handler = () => refreshRecords();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshRecords]);

  const hasInProgress = distributionRecords.some(r => r.status === 'distributing');

  const skill = useMemo(() => skills.find(s => s.id === skillId), [skillId, skills]);

  useEffect(() => {
    if (skill?.versions && skill.versions.length > 0 && !selectedVersion) {
      setSelectedVersion(skill.versions[0]);
    }
  }, [skill?.versions, selectedVersion]);

  useEffect(() => {
    if (selectedVersion) {
      setExpandedFile('SKILL.md');
      setExpandedDirs(new Set());
    }
  }, [selectedVersion]);

  // 文件列表处理
  const currentVersionFiles = useMemo(() => {
    if (!skill) return [];
    if (!selectedVersion || selectedVersion === skill.versions?.[0]) {
      return skill.files || [];
    }
    const versionRecord = skill.versionHistory?.find(v => v.version === selectedVersion);
    if (versionRecord?.files && versionRecord.files.length > 0) {
      return versionRecord.files;
    }
    return skill.files || [];
  }, [skill, selectedVersion]);

  const { processedFiles, strippedPrefix } = useMemo(() => {
    const rawFiles = currentVersionFiles;
    if (rawFiles.length === 0) return { processedFiles: rawFiles, strippedPrefix: '' };
    const topDirs = new Set<string>();
    let topFileCount = 0;
    for (const f of rawFiles) {
      const parts = f.name.split('/');
      if (parts.length > 1) topDirs.add(parts[0]);
      else topFileCount++;
    }
    if (topDirs.size === 1 && topFileCount === 0) {
      const prefix = [...topDirs][0] + '/';
      return {
        processedFiles: rawFiles.map(f => ({ ...f, name: f.name.slice(prefix.length) })),
        strippedPrefix: prefix,
      };
    }
    return { processedFiles: rawFiles, strippedPrefix: '' };
  }, [currentVersionFiles]);

  const VIEWABLE_EXTENSIONS = ['.md', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];

  const isViewableFile = (name: string) => {
    const lower = name.toLowerCase();
    if (!lower.includes('.') && !lower.includes('/')) return true;
    return VIEWABLE_EXTENSIONS.some(ext => lower.endsWith(ext));
  };

  const isMarkdownFile = (name: string) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.md') || lower.endsWith('.mdx');
  };

  const getFileLanguage = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
      toml: 'toml', py: 'python', js: 'javascript', ts: 'typescript',
      css: 'css', html: 'html', htm: 'html', sh: 'bash', bat: 'batch',
      svg: 'xml', ini: 'ini', cfg: 'ini', conf: 'ini',
    };
    return langMap[ext] || 'text';
  };

  const toggleDir = (dirName: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dirName)) next.delete(dirName);
      else next.add(dirName);
      return next;
    });
  };

  useEffect(() => {
    if (processedFiles.length) {
      const dirs = new Set<string>();
      for (const file of processedFiles) {
        const parts = file.name.split('/');
        if (parts.length > 1) dirs.add(parts[0]);
      }
      setExpandedDirs(dirs);
    }
  }, [processedFiles]);

  const findFileInTree = (files: any[], targetName: string): any => {
    for (const f of files) {
      if (f.name === targetName || f.path === targetName) return f;
      if (f.children && f.children.length > 0) {
        const found = findFileInTree(f.children, targetName);
        if (found) return found;
      }
    }
    return null;
  };

  const getFileContent = (fileName: string): string => {
    const versionFiles = currentVersionFiles;
    if (fileName === 'SKILL.md' || fileName.toLowerCase() === 'skill.md') {
      const skillMdFile = versionFiles.find(f => f.name.toLowerCase() === 'skill.md' || f.name.toLowerCase().endsWith('/skill.md'));
      if (skillMdFile?.content) return skillMdFile.content;
      if (!selectedVersion || selectedVersion === skill?.versions?.[0]) {
        return skill?.content || '';
      }
      return '';
    }
    const originalName = strippedPrefix ? strippedPrefix + fileName : fileName;
    const file = findFileInTree(versionFiles, originalName);
    if (file?.content) return file.content;
    const file2 = findFileInTree(versionFiles, fileName);
    if (file2?.content) return file2.content;
    return '';
  };

  const renderFileTree = (files: Array<{ name: string; size?: number; content?: string }>) => {
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    const renderedDirs = new Set<string>();
    const result: React.ReactNode[] = [];

    for (const file of sorted) {
      const parts = file.name.split('/');
      const isDir = file.name.endsWith('/');
      const isNested = parts.length > 1 && !isDir;
      const canView = !isDir && isViewableFile(file.name);

      if (isNested) {
        for (let i = 1; i < parts.length; i++) {
          const dirPath = parts.slice(0, i).join('/');
          if (!renderedDirs.has(dirPath)) {
            renderedDirs.add(dirPath);
            const depth = i - 1;
            const isExpanded = expandedDirs.has(dirPath);
            let ancestorsExpanded = true;
            for (let j = 1; j < i; j++) {
              const ancestor = parts.slice(0, j).join('/');
              if (!expandedDirs.has(ancestor)) { ancestorsExpanded = false; break; }
            }
            if (!ancestorsExpanded) continue;
            result.push(
              <Button
                key={`dir-${dirPath}`}
                variant="ghost"
                onClick={() => toggleDir(dirPath)}
                className="w-full flex items-center gap-1.5 px-2 py-2 text-xs text-[#334155] hover:bg-gray-50/50 rounded-[3px] h-auto justify-start"
                style={{ paddingLeft: `${8 + depth * 16}px` }}
              >
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />}
                <span className="truncate font-medium">{parts[i - 1]}</span>
                {isExpanded
                  ? <ChevronDown className="w-3 h-3 ml-auto text-[#A3A3A3] flex-shrink-0" />
                  : <ChevronRight className="w-3 h-3 ml-auto text-[#A3A3A3] flex-shrink-0" />
                }
              </Button>
            );
          }
        }
        let allParentsExpanded = true;
        for (let i = 1; i < parts.length; i++) {
          const ancestor = parts.slice(0, i).join('/');
          if (!expandedDirs.has(ancestor)) { allParentsExpanded = false; break; }
        }
        if (!allParentsExpanded) continue;
      }
      if (isDir) continue;
      const depth = parts.length - 1;
      result.push(
        <Button
          key={file.name}
          variant="ghost"
          onClick={() => canView && setExpandedFile(expandedFile === file.name ? null : file.name)}
          disabled={!canView}
          className={`w-full flex items-center gap-1.5 px-2 py-2 text-xs rounded-[3px] h-auto justify-start ${
            expandedFile === file.name
              ? 'bg-[#EFF6FF] text-[#1447E6]'
              : canView ? 'hover:bg-gray-50/50 text-[#334155]' : 'text-[#A3A3A3] opacity-60'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <FileText className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
          <span className="truncate">{parts[parts.length - 1]}</span>
        </Button>
      );
    }
    return result;
  };

  // 下载
  const handleDownload = async () => {
    if (!skill) return;
    setIsDownloading(true);
    try {
      await downloadSkillAsZip(skill);
      toast.success(`「${skill.name}」下载完成`);
    } catch {
      toast.error('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 下发处理
  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId,
      timestamp: new Date().toISOString(),
      totalCount: selectedInstanceIds.length,
      successCount: 0,
      failedCount: 0,
      inProgressCount: selectedInstanceIds.length,
      status: 'distributing',
      instances: selectedInstancesData.map(inst => ({
        id: inst.id,
        name: inst.name,
        createdBy: inst.createdBy || 'admin',
        distributionStatus: 'distributing' as DistributionStatus,
      })),
    };
    addDistributionRecord(newRecord);
    setActiveDistributionId(recordId);
    setDistributeDialogOpen(false);
    simulateDistribution(recordId, selectedInstanceIds.length);
  };

  const getCategoryName = (catId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === catId)?.name || catId;
  };

  const activeDistribution = distributionRecords.find(r => r.id === activeDistributionId);
  const filteredInstances = activeDistribution
    ? activeDistribution.instances.filter(inst => {
        const matchesStatus = statusFilter === 'all' || inst.distributionStatus === statusFilter;
        const searchLower = detailSearchQuery.toLowerCase();
        const matchesSearch = !detailSearchQuery ||
          inst.name.toLowerCase().includes(searchLower) ||
          inst.id.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
      })
    : [];

  if (!skill) {
    return (
      <div className="text-center py-12">
        <p>技能未找到</p>
        <Button onClick={onBack} className="mt-4" variant="claw-outline">返回列表</Button>
      </div>
    );
  }

  return (
    <div ref={setRootRef} className="flex-1 flex flex-col relative">
      {/* ======== 左右两侧点阵装饰层（覆盖到视口左右边缘的占位带）======== */}
      {/* 左侧点阵：从 root 左边 - 100vw 起，到 root 左边止 → 覆盖左侧 80px 占位带及外侧 */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0"
        style={{
          top: `${dotsTop}px`,
          bottom: `${dotsBottom}px`,
          left: "calc((100% - 100vw) / 2)",
          right: "100%",
          backgroundImage: "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
          backgroundSize: "12px 12px",
        }}
      />
      {/* 右侧点阵 */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0"
        style={{
          top: `${dotsTop}px`,
          bottom: `${dotsBottom}px`,
          left: "100%",
          right: "calc((100% - 100vw) / 2)",
          backgroundImage: "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
          backgroundSize: "12px 12px",
        }}
      />

      {/* ======== Header（参照 Agent 详情页风格）======== */}
      {/* 与 Agent 详情页一致：外层 items-end（按钮底对齐）、py-6、左侧整组 items-center */}
      <header ref={setHeaderRef} className="relative flex items-end justify-between gap-6 px-[42px] py-6">
        {/* Header 底部横线（贯穿全视口，与下方点阵装饰区边线对齐） */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: "calc(50% - 50vw)",
            width: "100vw",
            bottom: 0,
            height: "1px",
            backgroundColor: "#E2E8F0",
          }}
        />

        <div className="flex items-center gap-3">
          {/* 返回按钮 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="w-8 h-8 shrink-0 text-[#525252]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>返回列表</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 技能图标（首字母渐变圆形） */}
          {(() => {
            const initial = getSkillInitial(skill.name) || 'A';
            const colors = getLetterColor(initial);
            return (
              <div
                className="w-12 h-12 rounded-[4px] flex items-center justify-center text-xl font-semibold shrink-0"
                style={{ background: colors.bg, color: colors.text }}
              >
                {initial}
              </div>
            );
          })()}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1
                className="text-[22px] font-semibold leading-7"
                style={{ color: "#0A0A0A", letterSpacing: "-0.02em" }}
              >
                {skill.name}
              </h1>
              <span
                className="inline-flex items-center"
                style={{
                  padding: "2px 6px",
                  borderRadius: "2px",
                  border: "1px solid #DAE0E9",
                  background: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 100%)",
                  color: "#334155",
                  fontSize: "12px",
                  lineHeight: "18px",
                }}
              >
                v{skill.version}
              </span>
            </div>
            {/* 元信息行 */}
            <div
              className="flex items-center flex-wrap gap-2"
              style={{
                fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "20px",
                color: "#737373",
              }}
            >
              <span>slug: {skill.slug}</span>
              <span>|</span>
              {skill.categories && skill.categories.length > 0 && (
                <>
                  <span>分类：{skill.categories.map((catId: string) => getCategoryName(catId)).join('、')}</span>
                  <span>|</span>
                </>
              )}
              <span className="inline-flex items-center gap-1">
                <Download className="w-3 h-3 text-[#A3A3A3]"/>
                {formatDownloadCount(MOCK_DOWNLOAD_COUNTS[skill.id] || 0)}
              </span>
              <span>|</span>
              <span>{formatDate(skill.uploadTime)} 发布</span>
            </div>
            {skill.description && (
              <p
                className="mt-1"
                style={{
                  fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "13px",
                  lineHeight: "20px",
                  color: "#737373",
                }}
              >
                {skill.description}
              </p>
            )}
          </div>
        </div>

        {/* 右：操作按钮组（底对齐到 header 底部） */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="claw-outline" size="claw" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            下载
          </Button>
          <Button
            variant="claw-primary"
            size="claw"
            onClick={() => setDistributeDialogOpen(true)}
            disabled={hasInProgress}
          >
            <Plus className="w-4 h-4" />
            {hasInProgress ? '下发中...' : '下发'}
          </Button>
        </div>
      </header>

      {/* ======== Tab 导航 + 主要内容（标准骨架分段：Tab 区 px-[42px] py-4；内容区 px-[42px] py-0）======== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        {/* Tab 导航段 */}
        <div className="relative px-[42px] py-4">
          {/* §8.6 Segmented Control：灰底容器 + 白滑块 + var(--shadow-segment) */}
          <TabsList
            className="inline-flex items-center gap-1 p-1 h-auto rounded-[4px] bg-[#F5F5F5]"
          >
            <TabsTrigger
              value="overview"
              className="rounded-[3px] px-3 py-1 text-sm font-normal text-[#737373] hover:text-[#0A0A0A] data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:font-medium data-[state=active]:shadow-[var(--shadow-segment)] transition-colors"
            >
              概述
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-[3px] px-3 py-1 text-sm font-normal text-[#737373] hover:text-[#0A0A0A] data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:font-medium data-[state=active]:shadow-[var(--shadow-segment)] transition-colors"
            >
              文件列表
            </TabsTrigger>
            <TabsTrigger
              value="distribution"
              className="rounded-[3px] px-3 py-1 text-sm font-normal text-[#737373] hover:text-[#0A0A0A] data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:font-medium data-[state=active]:shadow-[var(--shadow-segment)] transition-colors"
            >
              下发记录
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 主要内容段（flex-1：内容不足一屏时撑开，把底部分隔栏顶到底部） */}
        <div className="px-[42px] py-0 flex-1">
          {/* 概述 Tab */}
          <TabsContent value="overview" className="mt-0 p-0">
            <SurfaceCard className="p-6">
              <MDXRenderer content={(() => {
                if (!selectedVersion || selectedVersion === skill.versions?.[0]) {
                  return skill.content || '';
                }
                const versionFiles = currentVersionFiles;
                const skillMdFile = versionFiles.find(f => f.name.toLowerCase() === 'skill.md' || f.name.toLowerCase().endsWith('/skill.md'));
                return skillMdFile?.content || skill.content || '';
              })()} />
            </SurfaceCard>
          </TabsContent>

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="mt-0 p-0">
            <SurfaceCard className="flex h-[47rem] overflow-hidden">
              {/* 左列：版本选择 */}
              <div className="w-[14%] min-w-[120px] border-r border-[#E5E5E5] flex flex-col">
                <div className="bg-gray-50/50 px-3 py-4 border-b border-[#E5E5E5] flex items-center">
                  <p className="text-xs font-medium text-[#0A0A0A]">版本</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {skill.versions?.map((ver: string, idx: number) => {
                    const isLatest = idx === 0;
                    const isSelected = selectedVersion === ver;
                    const versionRecord = skill.versionHistory?.find(v => v.version === ver);
                    const dateStr = versionRecord?.date || '';
                    // 安全检测图标：仅最新版本显示当前 skill 的安全状态
                    const secStatus = isLatest ? (skill.securityInfo?.overallStatus || 'not_scanned') : null;
                    return (
                      <Button
                        key={ver}
                        variant="ghost"
                        onClick={() => setSelectedVersion(ver)}
                        className={`w-full text-left px-3 py-3.5 border-b border-[#F5F5F5] rounded-none h-auto justify-start ${
                          isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[11px] font-semibold"
                            style={{ color: isSelected ? "#0A0A0A" : "#334155" }}
                          >
                            {ver}
                          </span>
                          {isLatest && (
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-[2px]"
                              style={{ background: "#EFF6FF", color: "#1447E6" }}
                            >
                              最新
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <p className="text-[10px] text-[#A3A3A3]">{dateStr}</p>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="ml-auto cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <Info className="w-3 h-3 text-[#A3A3A3] hover:text-[#334155]" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[260px] p-3 bg-white border border-[#E5E5E5] text-xs text-[#0A0A0A]">
                              <p className="font-medium mb-1.5 text-xs text-[#0A0A0A]">更新说明</p>
                              <p className="whitespace-pre-line leading-relaxed text-xs text-[#334155]">{versionRecord?.changeLog || '暂无更新说明'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* 中列：文件列表 */}
              <div className="w-[22%] min-w-[160px] border-r border-[#E5E5E5] flex flex-col">
                <div className="bg-gray-50/50 px-3 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
                  <p className="text-xs font-medium text-[#0A0A0A]">{selectedVersion || skill.version}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-7 h-7 text-[#737373] hover:text-[#1447E6]"
                    title="下载此版本 ZIP"
                  >
                    {isDownloading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {renderFileTree(processedFiles)}
                </div>
              </div>

              {/* 右列：文件详情 */}
              <div className="flex-1 flex flex-col bg-white">
                {expandedFile ? (
                  <>
                    <div className="bg-gray-50/50 px-3 py-2.5 border-b border-[#E5E5E5] flex items-center justify-between min-h-[44px]">
                      <p className="text-xs font-medium text-[#0A0A0A]">{expandedFile}</p>
                      {/* 内嵌 Segmented Control（预览/源码） */}
                      <div
                        className="flex items-center gap-0.5 rounded-[3px] p-0.5 bg-[#F5F5F5]"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileViewMode('preview')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-[2px] text-xs h-auto ${
                            fileViewMode === 'preview'
                              ? 'bg-white font-medium text-[#0A0A0A] hover:bg-white'
                              : 'text-[#737373] hover:text-[#0A0A0A] hover:bg-transparent'
                          }`}
                          style={fileViewMode === 'preview' ? { boxShadow: "var(--shadow-segment)" } : undefined}
                        >
                          <Eye className="w-3 h-3" />
                          预览
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileViewMode('source')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-[2px] text-xs h-auto ${
                            fileViewMode === 'source'
                              ? 'bg-white font-medium text-[#0A0A0A] hover:bg-white'
                              : 'text-[#737373] hover:text-[#0A0A0A] hover:bg-transparent'
                          }`}
                          style={fileViewMode === 'source' ? { boxShadow: "var(--shadow-segment)" } : undefined}
                        >
                          <Code className="w-3 h-3" />
                          源码
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {(() => {
                        const content = getFileContent(expandedFile);
                        if (!content) {
                          return (
                            <div className="flex items-center justify-center h-full text-[#A3A3A3]">
                              <p className="text-sm">文件内容暂无</p>
                            </div>
                          );
                        }
                        if (fileViewMode === 'source') {
                          const lang = getFileLanguage(expandedFile);
                          registerLanguage(lang);
                          return (
                            <Suspense fallback={
                              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono leading-5 bg-gray-50/50 p-3 m-0 text-[#334155]">
                                {content}
                              </pre>
                            }>
                              <SyntaxHighlighter
                                language={lang}
                                style={hljsStyle}
                                showLineNumbers
                                lineNumberStyle={{ color: '#A3A3A3', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
                                customStyle={{ margin: 0, padding: '12px 0', fontSize: '12px', lineHeight: '1.6', background: '#ffffff', borderRadius: 0 }}
                                wrapLongLines
                              >
                                {content}
                              </SyntaxHighlighter>
                            </Suspense>
                          );
                        }
                        if (isMarkdownFile(expandedFile)) {
                          return (
                            <div className="p-4">
                              <MDXRenderer content={content} />
                            </div>
                          );
                        }
                        const previewLang = getFileLanguage(expandedFile);
                        registerLanguage(previewLang);
                        return (
                          <Suspense fallback={
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono leading-5 bg-gray-50/50 p-3 m-0 text-[#334155]">
                              {content}
                            </pre>
                          }>
                            <SyntaxHighlighter
                              language={previewLang}
                              style={hljsStyle}
                              showLineNumbers
                              lineNumberStyle={{ color: '#A3A3A3', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
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
                  <div className="flex items-center justify-center h-full text-[#737373]">
                    <p className="text-sm">选择一个文件查看内容</p>
                  </div>
                )}
              </div>
            </SurfaceCard>
          </TabsContent>

          {/* 下发记录 Tab */}
          <TabsContent value="distribution" className="mt-0 p-0">
            <SurfaceCard className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-[#0A0A0A]">下发记录</h3>
              </div>

              <div className="space-y-3 mt-4">
                {distributionRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Puzzle className="w-12 h-12 mx-auto mb-4 text-[#E5E5E5]" />
                    <p className="text-[#A3A3A3]">还没有下发记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {distributionRecords.map((record, idx) => {
                      const progress = record.totalCount > 0 ? Math.round((record.successCount / record.totalCount) * 100) : 0;
                      return (
                        <div key={record.id} className="border border-[#E5E5E5] rounded-[4px] p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0A0A0A]">
                                #{idx + 1} · v{skill.version} {new Date(record.timestamp).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block px-3 py-1 rounded-[3px] text-xs font-medium"
                                style={
                                  record.status === 'distributing'
                                    ? { background: "#EFF6FF", color: "#1447E6" }
                                    : record.successCount === record.totalCount
                                      ? { background: "#F0FDF4", color: "#166534" }
                                      : { background: "#FEFCE8", color: "#854D0E" }
                                }
                              >
                                {record.status === 'distributing'
                                  ? `下发中 ${progress}%`
                                  : `下发完成，${record.successCount}个成功，${record.failedCount}个失败`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setActiveDistributionId(record.id);
                                  setStatusFilter('all');
                                  setDetailSearchQuery('');
                                  setDetailsOpen(true);
                                }}
                                className="h-auto py-1 px-2"
                                style={{ color: "#1447E6" }}
                              >
                                查看详情
                              </Button>
                            </div>
                          </div>

                          {record.status === 'distributing' && (
                            <div className="w-full rounded-full h-1.5 bg-[#F5F5F5]">
                              <div
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%`, background: "#1447E6" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </SurfaceCard>
          </TabsContent>
        </div>
      </Tabs>

      {/* ======== 底部分隔栏（标准骨架）======== */}
      <div ref={setBottomBarRef} className="relative mt-6 px-6 py-3 h-9">
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: "calc(50% - 50vw)",
            width: "100vw",
            top: 0,
            height: "1px",
            backgroundColor: "#E2E8F0",
          }}
        />
      </div>

      {/* 下发弹窗 — 用户端简化版 */}
      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillName={skill.name}
        skillVersion={skill.version}
        onDistributionStart={handleDistributionStart}
        title="下发技能"
        showScopeFilter={false}
        instances={getMyInstances()}
        hideCreatorAndGroup
      />

      {/* 下发详情弹窗 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>下发详情</DialogTitle>
          </DialogHeader>

          {activeDistribution && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]"/>
                  <Input
                    placeholder="搜索实例名称/ID..."
                    value={detailSearchQuery}
                    onChange={(e) => setDetailSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="distributing">下发中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-[#E5E5E5] rounded-[4px] overflow-hidden">
                <div className="overflow-y-auto max-h-72">
                  <Table className="table-fixed">
                    <TableHeader className="bg-gray-50/50 border-b border-[#E5E5E5] sticky top-0 z-10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[25%] px-4 py-2.5 text-xs font-medium text-[#737373]">实例名称</TableHead>
                        <TableHead className="w-[30%] px-4 py-2.5 text-xs font-medium text-[#737373]">实例ID</TableHead>
                        <TableHead className="w-[18%] px-4 py-2.5 text-xs font-medium text-[#737373]">状态</TableHead>
                        <TableHead className="w-[27%] px-4 py-2.5 text-xs font-medium text-[#737373]">失败原因</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstances.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={4} className="px-4 py-10 text-center text-sm text-[#A3A3A3]">
                            暂无符合条件的记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInstances.map(instance => (
                          <TableRow key={instance.id} className="border-b border-[#F5F5F5] last:border-b-0 hover:bg-gray-50/50">
                            <TableCell className="px-4 py-2.5 text-sm truncate text-[#0A0A0A]">{instance.name}</TableCell>
                            <TableCell className="px-4 py-2.5 text-sm font-mono truncate text-[#737373]">{instance.id}</TableCell>
                            <TableCell className="px-4 py-2.5">
                              <span
                                className="text-xs font-medium"
                                style={
                                  instance.distributionStatus === 'success' ? { color: "#16A34A" } :
                                  instance.distributionStatus === 'failed' ? { color: "#DC2626" } :
                                  instance.distributionStatus === 'distributing' ? { color: "#1447E6" } :
                                  { color: "#A3A3A3" }
                                }
                              >
                                {DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.label || '未下发'}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-2.5 text-sm truncate text-[#A3A3A3]">
                              {instance.distributionStatus === 'failed'
                                ? (instance.failReason || '连接超时')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== 下发状态图标 ==========
function DistributionStatusIcon({ status, latestRecord, onClick }: {
  status: DistributionStatus;
  latestRecord?: CachedDistributionRecord;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const total = latestRecord?.totalCount || 0;
  const success = latestRecord?.successCount || 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  if (status === 'distributing') {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-pointer" onClick={handleClick}>
            <Loader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          </span>
        </TooltipTrigger>
        <TooltipContent><span className="text-xs">下发中</span></TooltipContent>
      </Tooltip>
    );
  }
  if (status === 'success') {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-pointer" onClick={handleClick}>
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent><span className="text-xs">已下发 ({success}/{total} 成功)</span></TooltipContent>
      </Tooltip>
    );
  }
  if (status === 'failed') {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-pointer" onClick={handleClick}>
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent><span className="text-xs">下发失败 ({success}/{total} 成功)</span></TooltipContent>
      </Tooltip>
    );
  }
  return null;
}

// ========== 工具函数 ==========

/** 格式化日期 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 获取当前用户自己的实例（模拟：用户分组有交集的实例） */
function getMyInstances() {
  return MOCK_OPENCLAW_INSTANCES.filter(inst =>
    inst.groupIds?.some(gId => CURRENT_USER_GROUP_IDS.includes(gId))
  );
}

/** 模拟下发进度 */
function simulateDistribution(recordId: string, totalCount: number) {
  const FAIL_REASONS = ['连接超时', '实例离线', '版本冲突', '磁盘空间不足'];
  let completed = 0;
  const interval = setInterval(() => {
    completed += Math.floor(Math.random() * 3) + 1;
    if (completed >= totalCount) {
      completed = totalCount;
      clearInterval(interval);
      const failedCount = Math.floor(Math.random() * 2);
      const successCount = totalCount - failedCount;
      updateDistributionRecord(recordId, (record) => ({
        ...record,
        successCount,
        failedCount,
        inProgressCount: 0,
        status: (failedCount === 0 ? 'success' : 'failed') as DistributionStatus,
        instances: record.instances.map((inst, idx) => ({
          ...inst,
          distributionStatus: (idx < successCount ? 'success' : 'failed') as DistributionStatus,
          failReason: idx >= successCount ? FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)] : undefined,
        })),
      }));
    } else {
      updateDistributionRecord(recordId, (record) => ({
        ...record,
        successCount: completed,
        inProgressCount: totalCount - completed,
      }));
    }
  }, 800);
}
