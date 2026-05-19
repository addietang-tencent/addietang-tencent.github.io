/**
 * ModelQuota - 模型额度页面
 * Design: 「流动蓝图」Fluid Blueprint
 * Changes v2:
 *  - 拉宽主体内容区域（max-w-7xl）
 *  - 删除今日配额消耗卡片「今日」徽章
 *  - Tooltip 文案两端对齐
 *  - 今日配额消耗总Tokens对齐左侧卡片当天数据
 *  - 今日配额消耗卡片底部进度条（>80%橙色）
 *  - 卡片 icon/配色对齐管控端风格（圆形icon）
 *  - 字体排版统一
 */
import { useState, useCallback, useMemo } from "react";
import TenantLayout from "@/components/TenantLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Zap,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/Surface";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

// ─── 多分组相关 ──────────────────────────────────────────────────────────────
type UserGroupMode = "normal" | "multi-group";

interface SimpleGroup {
  id: string;
  name: string;
  isPrimary: boolean;
  allowViewQuota: boolean;
}

const MOCK_GROUPS: SimpleGroup[] = [
  { id: "grp-fe", name: "A公司 / 技术部 / 前端组", isPrimary: true, allowViewQuota: true },
  { id: "grp-ai", name: "A公司 / 技术部 / AI 组", isPrimary: false, allowViewQuota: true },
  { id: "grp-custom", name: "前端研发同学", isPrimary: false, allowViewQuota: false },
];

// 普通用户的默认分组（只有一个）
const MOCK_DEFAULT_GROUP: SimpleGroup[] = [
  { id: "default", name: "默认", isPrimary: true, allowViewQuota: true },
];

const getDefaultGroup = (groups: SimpleGroup[]): SimpleGroup => {
  return groups.find(g => g.isPrimary) || groups[0];
};

// ─── Types ───────────────────────────────────────────────────────────────────
type DateMode = "single" | "range";

interface DateRange {
  start: string;
  end: string;
}

interface SummaryRow {
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface DetailRow {
  time: string;
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

// ─── Mock Data Generators ────────────────────────────────────────────────────
const MODELS = ["腾讯云 DeepSeek（DeepSeek V3 0324）", "腾讯云混元（混元 TurboS Latest）", "自定义模型（Claude Opus 4.6）"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateSummary(dateStr: string, groupId?: string): SummaryRow[] {
  const seed = dateStr.replace(/-/g, "").slice(-4);
  const n = parseInt(seed, 10);
  const groupSeed = groupId ? hashStr(groupId) : 0;
  return MODELS.map((model, i) => {
    const base = (((n + groupSeed) * (i + 1) * 137) % 800) + 200;
    const inputTokens = base * 120 + ((n + groupSeed) % 50) * 10;
    const outputTokens = base * 80 + ((n + groupSeed) % 30) * 5;
    return {
      model,
      requests: base,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  });
}

function generateDetails(dateStr: string, groupId?: string): DetailRow[] {
  const seed = parseInt(dateStr.replace(/-/g, "").slice(-4), 10);
  const groupSeed = groupId ? hashStr(groupId) : 0;
  const combinedSeed = seed + groupSeed;
  const rows: DetailRow[] = [];
  for (let i = 0; i < 28; i++) {
    const hour = String(Math.floor((combinedSeed * (i + 1) * 7) % 24)).padStart(2, "0");
    const min = String(Math.floor((combinedSeed * (i + 3) * 13) % 60)).padStart(2, "0");
    const sec = String(Math.floor((combinedSeed * (i + 5) * 17) % 60)).padStart(2, "0");
    const model = MODELS[i % MODELS.length];
    const inputTokens = 800 + ((combinedSeed * (i + 1) * 31) % 3200);
    const outputTokens = 400 + ((combinedSeed * (i + 2) * 19) % 1600);
    rows.push({
      time: `${dateStr} ${hour}:${min}:${sec}`,
      model,
      requests: 1 + (i % 5),
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    });
  }
  return rows.sort((a, b) => b.time.localeCompare(a.time));
}

function aggregateRange(start: string, end: string, groupId?: string): { summary: SummaryRow[]; details: DetailRow[] } {
  const dates: string[] = [];
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  const allDetails: DetailRow[] = dates.flatMap(d => generateDetails(d, groupId));
  const summaryMap: Record<string, SummaryRow> = {};
  for (const d of allDetails) {
    if (!summaryMap[d.model]) {
      summaryMap[d.model] = { model: d.model, requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    }
    summaryMap[d.model].requests += d.requests;
    summaryMap[d.model].inputTokens += d.inputTokens;
    summaryMap[d.model].outputTokens += d.outputTokens;
    summaryMap[d.model].totalTokens += d.totalTokens;
  }
  return { summary: Object.values(summaryMap), details: allDetails };
}

const TODAY = new Date().toISOString().slice(0, 10);
const TODAY_QUOTA_TOTAL = 500000;

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn("w-8 h-8 rounded-[4px] flex items-center justify-center", iconColor)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{value}</p>
    </SurfaceCard>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#e5e5e5]">
      <span className="text-xs text-gray-400">
        第 {page}/{totalPages} 页，共 {total} 条
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4 text-gray-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SUMMARY_PAGE_SIZE = 5;
const DETAIL_PAGE_SIZE = 10;

export default function ModelQuota() {
  const [dateMode, setDateMode] = useState<DateMode>("single");
  const [singleDate, setSingleDate] = useState(TODAY);
  const [dateRange, setDateRange] = useState<DateRange>({ start: TODAY, end: TODAY });
  const [refreshKey, setRefreshKey] = useState(0);
  const [summaryPage, setSummaryPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);

  // 多分组模式
  const [groupMode] = useState<UserGroupMode>(() => {
    return (localStorage.getItem("openclaw_group_mode") as UserGroupMode) || "normal";
  });
  const groupList = groupMode === "multi-group" ? MOCK_GROUPS : MOCK_DEFAULT_GROUP;
  const [selectedGroup, setSelectedGroup] = useState<SimpleGroup>(() => getDefaultGroup(groupMode === "multi-group" ? MOCK_GROUPS : MOCK_DEFAULT_GROUP));
  const [showGroupFilter, setShowGroupFilter] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Compute data based on current filter
  const { summary, details, overviewStats } = useMemo(() => {
    const groupId = groupMode === "multi-group" ? selectedGroup.id : undefined;
    let s: SummaryRow[];
    let d: DetailRow[];
    if (dateMode === "single") {
      s = generateSummary(singleDate, groupId);
      d = generateDetails(singleDate, groupId);
    } else {
      const agg = aggregateRange(dateRange.start, dateRange.end, groupId);
      s = agg.summary;
      d = agg.details;
    }
    const totalRequests = s.reduce((acc, r) => acc + r.requests, 0);
    const totalInput = s.reduce((acc, r) => acc + r.inputTokens, 0);
    const totalOutput = s.reduce((acc, r) => acc + r.outputTokens, 0);
    const totalTokens = s.reduce((acc, r) => acc + r.totalTokens, 0);
    return {
      summary: s,
      details: d,
      overviewStats: { totalRequests, totalInput, totalOutput, totalTokens },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMode, singleDate, dateRange, refreshKey, groupMode, selectedGroup]);

  // Today quota: always based on today's data (not affected by filter)
  const todaySummary = useMemo(() => {
    const groupId = groupMode === "multi-group" ? selectedGroup.id : undefined;
    return generateSummary(TODAY, groupId);
  }, [groupMode, selectedGroup]);
  const todayTotalTokens = todaySummary.reduce((acc, r) => acc + r.totalTokens, 0);
  const quotaPct = (todayTotalTokens / TODAY_QUOTA_TOTAL) * 100;
  const quotaPctStr = quotaPct.toFixed(1);
  const isQuotaWarning = quotaPct > 80;

  // Paginated slices
  const summarySlice = summary.slice(
    (summaryPage - 1) * SUMMARY_PAGE_SIZE,
    summaryPage * SUMMARY_PAGE_SIZE
  );
  const detailSlice = details.slice(
    (detailPage - 1) * DETAIL_PAGE_SIZE,
    detailPage * DETAIL_PAGE_SIZE
  );

  return (
    <TenantLayout>
      <TooltipProvider>
        {/* SKILL §7.4 用户端通用骨架（以「我的 Agent」为基准）：
              外层 min-w-[1200px] overflow-x-clip + 中层 max-w-[1920px] mx-auto flex，
              左右各 w-20 占位带 + 中间 flex-1 min-w-0 px-[42px] py-8 内容区。 */}
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
                模型额度
              </h1>
              <div className="flex items-center gap-2">
                <p className="font-sans font-normal text-xs leading-[22.22px] tracking-[0.015em] text-[#737373] m-0">
                  查看所选时间范围内的模型 Token 使用情况。
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="text-xs text-blue-600 hover:text-blue-700 hover:underline cursor-help h-auto p-0 whitespace-nowrap">
                      查看Token使用规则
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm text-xs">
                    <div className="space-y-1.5">
                      <p>统计数据为模型 API 处理的全量 Token，包含输入 Token(缓存未命中)、输入 Token(缓存命中)、输出 Token。</p>
                      <p>缓存命中 Token 的实际计费价格通常远低于缓存未命中 Token。</p>
                      <p>因此页面展示的总 Token 数不等于等额的实际计费成本。</p>
                      <p>如需了解各模型的缓存输入 Token 定价，请参考对应模型提供商的官方计费文档。</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
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

          {/* 内容区 */}
          <div className="px-[42px] py-6">

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            {/* Left: 分组筛选 */}
            <Popover open={showGroupFilter} onOpenChange={setShowGroupFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="claw-outline"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm h-8"
                >
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-700">{selectedGroup.name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-1 min-w-[200px]">
                {groupList.map((group) => (
                  <div key={group.id} className="relative group/item">
                    <Button
                      variant="ghost"
                      disabled={!group.allowViewQuota}
                      onClick={() => { if (group.allowViewQuota) { setSelectedGroup(group); setShowGroupFilter(false); setSummaryPage(1); setDetailPage(1); } }}
                      className={cn(
                        "w-full justify-start px-4 py-2.5 text-sm h-auto rounded-none",
                        !group.allowViewQuota
                          ? "text-gray-300 cursor-not-allowed"
                          : selectedGroup.id === group.id
                            ? "bg-blue-50 text-blue-700 font-medium hover:bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {group.name}
                    </Button>
                    {!group.allowViewQuota && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded-[4px] whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-30">
                        该分组不允许查看模型额度
                      </div>
                    )}
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* Right: 日期模式 + 日期 + 刷新 */}
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              {/* Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-[4px] p-1 gap-1 h-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDateMode("single"); setSummaryPage(1); setDetailPage(1); }}
                  className={cn(
                    "px-3 h-6 text-sm rounded-[4px]",
                    dateMode === "single"
                      ? "bg-white text-gray-900 font-medium shadow-sm hover:bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  )}
                >
                  单日
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDateMode("range"); setSummaryPage(1); setDetailPage(1); }}
                  className={cn(
                    "px-3 h-6 text-sm rounded-[4px]",
                    dateMode === "range"
                      ? "bg-white text-gray-900 font-medium shadow-sm hover:bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  )}
                >
                  时间段
                </Button>
              </div>

              {/* Date Input(s) */}
              {dateMode === "single" ? (
                <DatePicker
                  value={singleDate}
                  max={TODAY}
                  onChange={(v) => { setSingleDate(v); setSummaryPage(1); setDetailPage(1); }}
                  className="h-8"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={dateRange.start}
                    max={dateRange.end}
                    onChange={(v) => { setDateRange((r) => ({ ...r, start: v })); setSummaryPage(1); setDetailPage(1); }}
                    className="h-8"
                  />
                  <span className="text-gray-400 text-sm">至</span>
                  <DatePicker
                    value={dateRange.end}
                    min={dateRange.start}
                    max={TODAY}
                    onChange={(v) => { setDateRange((r) => ({ ...r, end: v })); setSummaryPage(1); setDetailPage(1); }}
                    className="h-8"
                  />
                </div>
              )}

              {/* Refresh */}
              <Button
                variant="claw-outline"
                size="claw-sm"
                onClick={handleRefresh}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                刷新
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              icon={Activity}
              iconColor="bg-blue-500"
              label="总请求数"
              value={overviewStats.totalRequests.toLocaleString()}
            />
            <StatCard
              icon={ArrowDownToLine}
              iconColor="bg-blue-500"
              label="输入 Tokens"
              value={overviewStats.totalInput.toLocaleString()}
            />
            <StatCard
              icon={ArrowUpFromLine}
              iconColor="bg-violet-500"
              label="输出 Tokens"
              value={overviewStats.totalOutput.toLocaleString()}
            />
            <StatCard
              icon={Zap}
              iconColor="bg-violet-500"
              label="总 Tokens"
              value={overviewStats.totalTokens.toLocaleString()}
            />

            {/* Today Quota Card — not affected by time filter */}
            <SurfaceCard className="p-5 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-[4px] bg-orange-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  今日配额消耗
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[180px] text-xs leading-relaxed text-justify"
                     
                    >
                      此配额为公司提供的外部模型 Token 额度，按自然日统计和刷新
                    </TooltipContent>
                  </Tooltip>
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none mb-3">
                {quotaPctStr}%
              </p>
              {/* Progress bar — hover to see token details */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Progress
                    value={Math.min(quotaPct, 100)}
                    className={cn("h-1.5 cursor-default bg-gray-100", isQuotaWarning ? "[&>[data-slot=progress-indicator]]:bg-orange-500" : "[&>[data-slot=progress-indicator]]:bg-blue-500")}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {todayTotalTokens.toLocaleString()} / {TODAY_QUOTA_TOTAL.toLocaleString()} Tokens
                </TooltipContent>
              </Tooltip>
            </SurfaceCard>
          </div>

          {/* Model Usage Summary */}
          <SurfaceCard className="mb-5 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5]">
              <h2 className="text-sm font-semibold text-gray-900">模型使用汇总</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide hover:bg-gray-50">
                    <TableHead className="text-left px-5 py-3 font-medium">模型名称</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium">总请求数</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium">输入 Tokens</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium">输出 Tokens</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium">总 Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {summarySlice.map((row) => (
                    <TableRow key={row.model} className="hover:bg-gray-50/60">
                      <TableCell className="px-5 py-3.5 text-sm text-gray-600">{row.model}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500">{row.requests.toLocaleString()}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500">{row.inputTokens.toLocaleString()}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500">{row.outputTokens.toLocaleString()}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500">{row.totalTokens.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {summarySlice.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">暂无数据</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={summaryPage}
              total={summary.length}
              pageSize={SUMMARY_PAGE_SIZE}
              onChange={setSummaryPage}
            />
          </SurfaceCard>

          {/* Detail Usage Records */}
          <SurfaceCard className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5]">
              <h2 className="text-sm font-semibold text-gray-900">详细使用记录</h2>
            </div>
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide hover:bg-gray-50">
                    <TableHead className="text-left px-5 py-3 font-medium whitespace-nowrap w-44">请求时间</TableHead>
                    <TableHead className="text-left px-5 py-3 font-medium">模型名称</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium w-32">输入 Tokens</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium w-32">输出 Tokens</TableHead>
                    <TableHead className="text-right px-5 py-3 font-medium w-32">总 Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {detailSlice.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50/60">
                      <TableCell className="px-5 py-3.5 text-sm tabular-nums text-gray-500 whitespace-nowrap w-44">{row.time}</TableCell>
                      <TableCell className="px-5 py-3.5 text-sm text-gray-600">{row.model}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500 w-32">{row.inputTokens.toLocaleString()}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500 w-32">{row.outputTokens.toLocaleString()}</TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500 w-32">{row.totalTokens.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {detailSlice.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">暂无数据</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={detailPage}
              total={details.length}
              pageSize={DETAIL_PAGE_SIZE}
              onChange={setDetailPage}
            />
          </SurfaceCard>

          </div>{/* end 内容区 px-[42px] py-6 */}

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

          {/* 底部提示语 — 位于分割线下方的 paddingBottom 区域内 */}
          <p className="absolute bottom-7 left-0 right-0 text-xs text-gray-400 text-center">
            额度由企业管理员统一配置，如需调整请联系管理员
          </p>
            </div>{/* end flex-1 min-w-0 relative */}
            <div aria-hidden className="shrink-0 w-20 self-stretch" />
          </div>{/* end max-w-[1920px] flex */}
        </div>{/* end min-w-[1200px] overflow-x-clip */}
      </TooltipProvider>
    </TenantLayout>
  );
}
