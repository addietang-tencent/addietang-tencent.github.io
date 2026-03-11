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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
const MODELS = ["DeepSeek V3 0324", "混元 TurboS Latest", "自定义模型（Claude Opus 4.6）"];

function generateSummary(dateStr: string): SummaryRow[] {
  const seed = dateStr.replace(/-/g, "").slice(-4);
  const n = parseInt(seed, 10);
  return MODELS.map((model, i) => {
    const base = ((n * (i + 1) * 137) % 800) + 200;
    const inputTokens = base * 120 + (n % 50) * 10;
    const outputTokens = base * 80 + (n % 30) * 5;
    return {
      model,
      requests: base,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  });
}

function generateDetails(dateStr: string): DetailRow[] {
  const seed = parseInt(dateStr.replace(/-/g, "").slice(-4), 10);
  const rows: DetailRow[] = [];
  for (let i = 0; i < 28; i++) {
    const hour = String(Math.floor((seed * (i + 1) * 7) % 24)).padStart(2, "0");
    const min = String(Math.floor((seed * (i + 3) * 13) % 60)).padStart(2, "0");
    const sec = String(Math.floor((seed * (i + 5) * 17) % 60)).padStart(2, "0");
    const model = MODELS[i % MODELS.length];
    const inputTokens = 800 + ((seed * (i + 1) * 31) % 3200);
    const outputTokens = 400 + ((seed * (i + 2) * 19) % 1600);
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

function aggregateRange(start: string, end: string): { summary: SummaryRow[]; details: DetailRow[] } {
  const dates: string[] = [];
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  const allDetails: DetailRow[] = dates.flatMap(generateDetails);
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
    <div className="bg-white border border-gray-100 rounded-xl p-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconColor)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-[1.625rem] font-bold text-gray-900 tabular-nums leading-none">{value}</p>
    </div>
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
    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">
        第 {page}/{totalPages} 页，共 {total} 条
      </span>
      <button
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4 text-gray-500" />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </button>
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

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Compute data based on current filter
  const { summary, details, overviewStats } = useMemo(() => {
    let s: SummaryRow[];
    let d: DetailRow[];
    if (dateMode === "single") {
      s = generateSummary(singleDate);
      d = generateDetails(singleDate);
    } else {
      const agg = aggregateRange(dateRange.start, dateRange.end);
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
  }, [dateMode, singleDate, dateRange, refreshKey]);

  // Today quota: always based on today's data (not affected by filter)
  const todaySummary = useMemo(() => generateSummary(TODAY), []);
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
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">模型额度</h1>
            <p className="text-sm text-gray-500 mt-1">
              查看所选时间范围内的模型 Token 使用情况
            </p>
          </div>

          {/* Time Filter + Refresh */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => { setDateMode("single"); setSummaryPage(1); setDetailPage(1); }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-all",
                  dateMode === "single"
                    ? "bg-white text-gray-900 font-medium shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                单日
              </button>
              <button
                onClick={() => { setDateMode("range"); setSummaryPage(1); setDetailPage(1); }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-all",
                  dateMode === "range"
                    ? "bg-white text-gray-900 font-medium shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                时间段
              </button>
            </div>

            {/* Date Input(s) */}
            {dateMode === "single" ? (
              <input
                type="date"
                value={singleDate}
                max={TODAY}
                onChange={(e) => { setSingleDate(e.target.value); setSummaryPage(1); setDetailPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  max={dateRange.end}
                  onChange={(e) => { setDateRange((r) => ({ ...r, start: e.target.value })); setSummaryPage(1); setDetailPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <span className="text-gray-400 text-sm">至</span>
                <input
                  type="date"
                  value={dateRange.end}
                  min={dateRange.start}
                  max={TODAY}
                  onChange={(e) => { setDateRange((r) => ({ ...r, end: e.target.value })); setSummaryPage(1); setDetailPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-gray-600 bg-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              刷新
            </Button>
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
            <div className="bg-white border border-gray-100 rounded-xl p-5 col-span-2 lg:col-span-1"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
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
              <p className="text-[1.625rem] font-bold text-gray-900 tabular-nums leading-none mb-1">
                {quotaPctStr}%
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {todayTotalTokens.toLocaleString()} / {TODAY_QUOTA_TOTAL.toLocaleString()} Tokens
              </p>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isQuotaWarning ? "bg-orange-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min(quotaPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Model Usage Summary */}
          <div className="bg-white rounded-xl border border-gray-100 mb-5 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">模型使用汇总</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-medium">模型名称</th>
                    <th className="text-right px-5 py-3 font-medium">总请求数</th>
                    <th className="text-right px-5 py-3 font-medium">输入 Tokens</th>
                    <th className="text-right px-5 py-3 font-medium">输出 Tokens</th>
                    <th className="text-right px-5 py-3 font-medium">总 Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summarySlice.map((row) => (
                    <tr key={row.model} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{row.model}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600">{row.requests.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600">{row.inputTokens.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600">{row.outputTokens.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums font-semibold text-gray-900">{row.totalTokens.toLocaleString()}</td>
                    </tr>
                  ))}
                  {summarySlice.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">暂无数据</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={summaryPage}
              total={summary.length}
              pageSize={SUMMARY_PAGE_SIZE}
              onChange={setSummaryPage}
            />
          </div>

          {/* Detail Usage Records */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">详细使用记录</h2>
            </div>
            <div className="overflow-x-auto" style={{ maxHeight: 360, overflowY: "auto" }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-medium whitespace-nowrap">请求时间</th>
                    <th className="text-left px-5 py-3 font-medium">模型名称</th>
                    <th className="text-right px-5 py-3 font-medium">总请求数</th>
                    <th className="text-right px-5 py-3 font-medium">输入 Tokens</th>
                    <th className="text-right px-5 py-3 font-medium">输出 Tokens</th>
                    <th className="text-right px-5 py-3 font-medium">总 Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {detailSlice.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums whitespace-nowrap">{row.time}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800 whitespace-nowrap">{row.model}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600">{row.requests.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600">{row.inputTokens.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600">{row.outputTokens.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums font-semibold text-gray-900">{row.totalTokens.toLocaleString()}</td>
                    </tr>
                  ))}
                  {detailSlice.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">暂无数据</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={detailPage}
              total={details.length}
              pageSize={DETAIL_PAGE_SIZE}
              onChange={setDetailPage}
            />
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            额度由企业管理员统一配置，如需调整请联系管理员
          </p>
        </div>
      </TooltipProvider>
    </TenantLayout>
  );
}
