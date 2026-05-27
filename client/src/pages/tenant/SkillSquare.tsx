import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import TenantLayout from '@/components/TenantLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TenantCard } from '@/components/ui/Surface';
import { TenantSegmentGroup, TenantSegmentOption } from '@/components/ui/segment';
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
} from 'lucide-react';
import { toast } from 'sonner';

// 复用管控端数据和组件
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_OPENCLAW_INSTANCES } from '../admin/SkillLibrary/mockData';
import { type Skill, type DistributionStatus, DISTRIBUTION_STATUS_MAP } from '../admin/SkillLibrary/types';
import {
  getDistributionRecords,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  initMockDistributionRecords,
  type CachedDistributionRecord,
  type RecordType,
} from '../admin/SkillLibrary/distributionCache';
import { downloadSkillAsZip } from '../admin/SkillLibrary/downloadUtils';
import BatchDistributeDialog from '../admin/SkillLibrary/BatchDistributeDialog';
import BatchDeleteDialog from '../admin/SkillLibrary/BatchDeleteDialog';
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
        {/* 用户端单层 120px 骨架（SKILL-TENANT §6.1.1） */}
        <div className="min-w-[1200px]">
          <div className="max-w-[1920px] mx-auto page-enter">
            <div
              className="relative min-h-[calc(100vh-64px)] flex flex-col"
              style={{ paddingLeft: 120, paddingRight: 120, paddingBottom: 75 }}
            >
              <SkillSquareDetail
                  skillId={selectedSkillId}
                  skills={visibleSkills}
                  onBack={() => { setSelectedSkillId(null); setInitialTab('overview'); }}
                  initialTab={initialTab}
                />
            </div>
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      {/* 用户端单层 120px 骨架（SKILL-TENANT §6.1.1） */}
      <div className="min-w-[1200px]">
        <div className="max-w-[1920px] mx-auto page-enter">
          <div
            className="relative min-h-[calc(100vh-64px)]"
            style={{ paddingLeft: 120, paddingRight: 120, paddingBottom: 75 }}
          >
            {/* Hero 段 — 112px / 标题居中对齐（对齐「我的 Agent」） */}
            <div className="relative h-[112px]">
              <div className="h-[112px] flex flex-col justify-center gap-2 overflow-hidden">
                <h1 className="font-sans font-medium text-[26px] leading-[35.56px] tracking-[-0.0427em] m-0 text-[#0A0A0A]">
                  企业技能
                </h1>
                <p className="font-sans font-normal text-xs leading-[22.22px] tracking-[0.015em] text-[#737373] m-0">
                  一键选装企业内的优质技能。
                </p>
              </div>
            </div>

            {/* 内容段（搜索栏 / 分类 / 卡片网格） */}
            <div className="relative h-auto pb-6">

        {/* 搜索栏 + 筛选 */}
        <div className="relative flex h-10 flex-wrap gap-2 mb-4 items-center">
          {/* 搜索框 — 加长 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]"/>
            <Input
              tenant
              placeholder="搜索技能名称或描述..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#E5E5E5]"
            />
          </div>

          {/* 排序 */}
          <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
            <SelectTrigger tenant className="w-32 bg-white border-[#E5E5E5]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">发布时间</SelectItem>
              <SelectItem value="downloads">下载量</SelectItem>
            </SelectContent>
          </Select>

          {/* 刷新按钮 */}
          <Button
            variant="tenant-outline"
            size="icon"
            onClick={handleRefresh}
            className="w-9 h-9"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* 视图切换 — 统一 segment 样式（带图标+文字） */}
          <TenantSegmentGroup>
            <TenantSegmentOption active={viewMode === 'card'} onClick={() => setViewMode('card')}>
              <LayoutGrid className="w-4 h-4" />
              卡片视图
            </TenantSegmentOption>
            <TenantSegmentOption active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
              列表视图
            </TenantSegmentOption>
          </TenantSegmentGroup>
        </div>

        {/* 分类横排按钮 */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Button variant="tenant-plain" size="sm" data-state={selectedCategory === 'all' ? "active" : undefined} onClick={() => setSelectedCategory('all')}>
            全部
          </Button>
          {DEFAULT_CATEGORIES.map(cat => (
            <Button key={cat.id} variant="tenant-plain" size="sm" data-state={selectedCategory === cat.id ? "active" : undefined} onClick={() => setSelectedCategory(cat.id)}>
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
          /* 列表视图 — 紧凑横排布局（外框对齐 AgentCard：12px 圆角 + 单层阴影） */
          <TenantCard padding="none" className="relative overflow-hidden">
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
          </TenantCard>
        )}
            </div>
            {/* /内容段 */}
          </div>
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
  const isDistributing = distStatus === 'distributing' || distStatus === 'deleting';

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
      <TenantCard
        interactive
        className="group relative cursor-pointer"
        onClick={onClick}
      >
        {/* ===== 头部行：图标(字母) + 名称/版本 + 下载量 ===== */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {initial && (
              <div
                className="flex items-center justify-center flex-shrink-0 rounded-full"
                style={{ width: 48, height: 48, background: getLetterColor(initial).bg }}
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
              variant="tenant-outline"
              size="icon-sm"
              onClick={handleDistributeClick}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </TenantCard>

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
  const isDistributing = distStatus === 'distributing' || distStatus === 'deleting';

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
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
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
            variant="tenant-outline"
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>('SKILL.md');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [fileViewMode, setFileViewMode] = useState<'preview' | 'source'>('preview');

  // 下发记录
  const [distributionRecords, setDistributionRecords] = useState<CachedDistributionRecord[]>([]);
  const [activeDistributionId, setActiveDistributionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | DistributionStatus>('all');
  const [detailSearchQuery, setDetailSearchQuery] = useState('');
  /** 记录类型筛选：全部/下发记录/卸载记录 */
  const [recordTypeFilter, setRecordTypeFilter] = useState<'all' | 'distribute' | 'delete'>('all');

  const refreshRecords = useCallback(() => {
    setDistributionRecords(getDistributionRecords(skillId));
  }, [skillId]);

  useEffect(() => {
    refreshRecords();
    const handler = () => refreshRecords();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshRecords]);

  const hasInProgress = distributionRecords.some(r => r.status === 'distributing' || r.status === 'deleting');

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
                className="w-full flex items-center gap-1.5 h-8 px-2 text-sm text-[#09090b] hover:bg-[#f4f4f5] rounded-[4px] justify-start"
                style={{ paddingLeft: `${8 + depth * 16}px` }}
              >
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
                  : <ChevronRight className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
                }
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />}
                <span className="truncate font-medium">{parts[i - 1]}</span>
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
          className={`w-full flex items-center gap-1.5 h-8 px-2 text-sm rounded-[4px] justify-start ${
            expandedFile === file.name
              ? 'bg-[#f4f4f5] text-[#09090b] font-medium'
              : canView ? 'hover:bg-[#f4f4f5] text-[#09090b]' : 'text-[#a1a1aa] opacity-60'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <FileText className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
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

  // 卸载处理
  const handleDeleteStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId,
      timestamp: new Date().toISOString(),
      totalCount: selectedInstanceIds.length,
      successCount: 0,
      failedCount: 0,
      inProgressCount: selectedInstanceIds.length,
      status: 'deleting',
      type: 'delete',
      instances: selectedInstancesData.map(inst => ({
        id: inst.id,
        name: inst.name,
        createdBy: inst.createdBy || 'admin',
        distributionStatus: 'distributing' as DistributionStatus,
      })),
    };
    addDistributionRecord(newRecord);
    setActiveDistributionId(recordId);
    setDeleteDialogOpen(false);
    toast.success(`已开始卸载「${skill?.name}」，共 ${selectedInstanceIds.length} 个实例`);
    simulateDelete(recordId, selectedInstanceIds.length);
  };

  // 聚合已下发成功的实例（用于卸载弹窗）
  const distributedInstancesForDelete = useMemo(() => {
    const myInstances = getMyInstances();
    const successRecords = distributionRecords.filter(r => r.type !== 'delete' && (r.status === 'success' || r.status === 'failed'));
    const instanceMap = new Map<string, { id: string; name: string; createdBy: string; distributedVersion?: string; deleteStatus?: 'not_deleted' | 'delete_failed'; deleteFailReason?: string }>();
    successRecords.forEach(record => {
      record.instances.forEach(inst => {
        if (inst.distributionStatus === 'success' && myInstances.some(mi => mi.id === inst.id)) {
          if (!instanceMap.has(inst.id)) {
            instanceMap.set(inst.id, {
              id: inst.id,
              name: inst.name,
              createdBy: inst.createdBy,
              distributedVersion: skill?.version,
              deleteStatus: 'not_deleted',
            });
          }
        }
      });
    });
    // 检查卸载记录，标记已卸载失败的
    const deleteRecords = distributionRecords.filter(r => r.type === 'delete' && r.status !== 'deleting');
    deleteRecords.forEach(record => {
      record.instances.forEach(inst => {
        if (inst.distributionStatus === 'failed' && instanceMap.has(inst.id)) {
          const existing = instanceMap.get(inst.id)!;
          existing.deleteStatus = 'delete_failed';
          existing.deleteFailReason = inst.failReason;
        } else if (inst.distributionStatus === 'success') {
          // 卸载成功的从列表中移除
          instanceMap.delete(inst.id);
        }
      });
    });
    return Array.from(instanceMap.values());
  }, [distributionRecords, skill?.version]);

  // 按类型筛选的记录
  const filteredRecordsByType = useMemo(() => {
    if (recordTypeFilter === 'all') return distributionRecords;
    if (recordTypeFilter === 'distribute') return distributionRecords.filter(r => r.type !== 'delete');
    return distributionRecords.filter(r => r.type === 'delete');
  }, [distributionRecords, recordTypeFilter]);

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
        <Button onClick={onBack} className="mt-4" variant="tenant-outline">返回列表</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* ======== Header（参照设计稿）======== */}
      {/* 返回按钮在最上面，icon + 文字形式，左对齐头像 */}
      <header className="relative flex flex-col gap-4 py-6">
        {/* 返回行 */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[#525252] hover:text-[#1447E6] transition-colors self-start"
          style={{ fontSize: 14, lineHeight: "20px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        {/* 主信息行：头像顶对齐标题 + 右侧按钮底对齐 */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            {/* 技能图标（首字母圆形） */}
            {(() => {
              const initial = getSkillInitial(skill.name) || 'A';
              const colors = getLetterColor(initial);
              return (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
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

          {/* 右：操作按钮组 */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="tenant-outline" size="claw" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              下载
            </Button>
            <Button
              variant="tenant-primary"
              size="claw"
              onClick={() => setDistributeDialogOpen(true)}
              disabled={hasInProgress}
            >
              <Plus className="w-4 h-4" />
              {hasInProgress ? '下发中...' : '下发'}
            </Button>
          </div>
        </div>
      </header>

      {/* ======== Tab 导航 + 主要内容 ======== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        {/* Tab 导航段 */}
        <div className="relative py-4">
          <TabsList
            className="inline-flex items-center h-9 p-0 rounded-[40px] border-0"
            style={{ background: "rgba(228, 232, 241, 0.4)" }}
          >
            <TabsTrigger
              value="overview"
              className="rounded-[40px] h-full px-3 py-1 text-[14px] leading-[22px] tracking-[0.005em] font-normal text-[#334155] hover:text-[#020617] data-[state=active]:bg-white data-[state=active]:text-[#020617] data-[state=active]:font-normal data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-[#CDD4DC] data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] transition-all"
            >
              概述
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-[40px] h-full px-3 py-1 text-[14px] leading-[22px] tracking-[0.005em] font-normal text-[#334155] hover:text-[#020617] data-[state=active]:bg-white data-[state=active]:text-[#020617] data-[state=active]:font-normal data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-[#CDD4DC] data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] transition-all"
            >
              文件列表
            </TabsTrigger>
            <TabsTrigger
              value="distribution"
              className="rounded-[40px] h-full px-3 py-1 text-[14px] leading-[22px] tracking-[0.005em] font-normal text-[#334155] hover:text-[#020617] data-[state=active]:bg-white data-[state=active]:text-[#020617] data-[state=active]:font-normal data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-[#CDD4DC] data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] transition-all"
            >
              下发和卸载记录
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 主要内容段（flex-1：内容不足一屏时撑开，把底部分隔栏顶到底部） */}
        <div className="py-0 flex-1">
          {/* 概述 Tab */}
          <TabsContent value="overview" className="mt-0 p-0">
            <TenantCard padding="none" className="p-6">
              <MDXRenderer content={(() => {
                if (!selectedVersion || selectedVersion === skill.versions?.[0]) {
                  return skill.content || '';
                }
                const versionFiles = currentVersionFiles;
                const skillMdFile = versionFiles.find(f => f.name.toLowerCase() === 'skill.md' || f.name.toLowerCase().endsWith('/skill.md'));
                return skillMdFile?.content || skill.content || '';
              })()} />
            </TenantCard>
          </TabsContent>

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="mt-0 p-0">
            <TenantCard padding="none" className="flex h-[47rem] overflow-hidden">
              {/* 左列：版本选择 */}
              <div className="w-[14%] min-w-[120px] border-r border-[#E5E5E5] flex flex-col">
                <div className="h-12 px-3 border-b border-[#E5E5E5] flex items-center">
                  <p className="text-sm font-medium text-[#09090b]">版本</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {skill.versions?.map((ver: string, idx: number) => {
                    const isLatest = idx === 0;
                    const isSelected = selectedVersion === ver;
                    const versionRecord = skill.versionHistory?.find(v => v.version === ver);
                    const dateStr = versionRecord?.date || '';
                    return (
                      <Button
                        key={ver}
                        variant="ghost"
                        onClick={() => setSelectedVersion(ver)}
                        className={`w-full px-3 py-3.5 border-b border-[#F5F5F5] rounded-none h-auto justify-start items-center ${
                          isSelected ? 'bg-[#f4f4f5]' : 'hover:bg-[#f4f4f5]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[14px] font-semibold"
                            style={{ color: isSelected ? "#09090b" : "#09090b" }}
                          >
                            {ver}
                          </span>
                          {isLatest && (
                            <span
                              className="inline-flex h-[18px] items-center justify-center rounded-[2px] border border-[#1447E6] px-1 text-[10px] font-semibold font-['Open_Sans'] leading-none tracking-[0.015em] text-[#355EF1]"
                            >
                              New
                            </span>
                          )}
                          <span className="text-[12px] text-[#a1a1aa]">{dateStr}</span>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                                <Info className="w-3 h-3 text-[#a1a1aa] hover:text-[#09090b]" />
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
                <div className="h-12 px-3 border-b border-[#E5E5E5] flex items-center justify-between">
                  <p className="text-sm font-medium text-[#09090b]">{selectedVersion || skill.version}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-7 h-7 text-[#71717a] hover:text-[#09090b]"
                    title="下载此版本 ZIP"
                  >
                    {isDownloading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  {renderFileTree(processedFiles)}
                </div>
              </div>

              {/* 右列：文件详情 */}
              <div className="flex-1 flex flex-col bg-white">
                {expandedFile ? (
                  <>
                    <div className="h-12 px-3 border-b border-[#E5E5E5] flex items-center justify-between">
                      <p className="text-sm font-medium text-[#09090b]">{expandedFile}</p>
                      {/* 内嵌 Segmented Control（预览/源码，统一 segment 样式） */}
                      <div
                        className="flex items-center h-7 rounded-[40px]"
                        style={{ background: "rgba(228, 232, 241, 0.4)" }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileViewMode('preview')}
                          className={`flex items-center gap-1 px-2 py-1 h-7 rounded-[40px] text-xs ${
                            fileViewMode === 'preview'
                              ? 'bg-white font-normal text-[#020617] hover:bg-white outline outline-1 outline-[#CDD4DC] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)]'
                              : 'text-[#334155] hover:text-[#020617] hover:bg-transparent'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          预览
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileViewMode('source')}
                          className={`flex items-center gap-1 px-2 py-1 h-7 rounded-[40px] text-xs ${
                            fileViewMode === 'source'
                              ? 'bg-white font-normal text-[#020617] hover:bg-white outline outline-1 outline-[#CDD4DC] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)]'
                              : 'text-[#334155] hover:text-[#020617] hover:bg-transparent'
                          }`}
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
            </TenantCard>
          </TabsContent>

          {/* 下发记录 Tab */}
          <TabsContent value="distribution" className="mt-0 p-0">
            <TenantCard padding="none" className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-[#0A0A0A]">下发记录</h3>
              </div>

              <div className="space-y-3 mt-4">
                {filteredRecordsByType.length === 0 ? (
                  <div className="text-center py-12">
                    <Puzzle className="w-12 h-12 mx-auto mb-4 text-[#E5E5E5]" />
                    <p className="text-[#A3A3A3]">还没有下发记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRecordsByType.map((record, idx) => {
                      const isDelete = record.type === 'delete';
                      const progress = record.totalCount > 0 ? Math.round((record.successCount / record.totalCount) * 100) : 0;
                      return (
                        <TenantCard key={record.id} padding="none" className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0A0A0A]">
                                #{idx + 1} · v{skill.version} {new Date(record.timestamp).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block px-3 py-1 rounded-[3px] text-xs font-medium bg-[#F5F5F5] text-[#0A0A0A]"
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
                        </TenantCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </TenantCard>
          </TabsContent>
        </div>
      </Tabs>

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

      {/* 卸载弹窗 — 用户端简化版 */}
      <BatchDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        skillName={skill.name}
        skillVersion={skill.version}
        distributedInstances={distributedInstancesForDelete}
        groups={[]}
        onDeleteStart={handleDeleteStart}
        showScopeFilter={false}
        hideCreatorAndGroup
      />

      {/* 下发/卸载详情弹窗 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeDistribution?.type === 'delete' ? '卸载详情' : '下发详情'}</DialogTitle>
          </DialogHeader>

          {activeDistribution && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]"/>
                  <Input
                    tenant
                    placeholder="搜索实例名称/ID..."
                    value={detailSearchQuery}
                    onChange={(e) => setDetailSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger tenant className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="distributing">{activeDistribution.type === 'delete' ? '卸载中' : '下发中'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-[#E5E5E5] rounded-[12px] overflow-hidden">
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
  status: DistributionStatus | 'deleting';
  latestRecord?: CachedDistributionRecord;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const total = latestRecord?.totalCount || 0;
  const success = latestRecord?.successCount || 0;
  const isDelete = latestRecord?.type === 'delete';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  if (status === 'deleting') {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-pointer" onClick={handleClick}>
            <Loader className="w-3.5 h-3.5 text-red-500 animate-spin" />
          </span>
        </TooltipTrigger>
        <TooltipContent><span className="text-xs">卸载中</span></TooltipContent>
      </Tooltip>
    );
  }
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
        <TooltipContent><span className="text-xs">{isDelete ? `已卸载（${success}/${total}成功）` : `已下发（${success}/${total}成功）`}</span></TooltipContent>
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
        <TooltipContent><span className="text-xs">{isDelete ? `卸载失败（${success}/${total}成功）` : `下发失败（${success}/${total}成功）`}</span></TooltipContent>
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

/** 模拟卸载进度 */
function simulateDelete(recordId: string, totalCount: number) {
  const FAIL_REASONS = ['卸载超时', '实例繁忙', '权限不足', '进程占用中'];
  let completed = 0;
  const interval = setInterval(() => {
    completed += Math.floor(Math.random() * 2) + 1;
    if (completed >= totalCount) {
      completed = totalCount;
      clearInterval(interval);
      // 必定产生至少1个失败用于验证
      const failedCount = Math.max(1, Math.floor(Math.random() * 2));
      const successCount = totalCount - failedCount;
      updateDistributionRecord(recordId, (record) => ({
        ...record,
        successCount,
        failedCount,
        inProgressCount: 0,
        status: 'failed' as DistributionStatus,
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
  }, 1000);
}
