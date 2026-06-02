/**
 * TokensMonitor - 管控端 Tokens 监控页
 * 设计风格：与整体管控台保持一致，浅色卡片 + 蓝紫渐变强调色
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Segment, SegmentList, SegmentItem, SegmentContent } from "@/components/ui/segment";
import { Zap, TrendingUp, ArrowUp, ArrowDown, RefreshCw, ChevronRight, Info, AlertCircle, ArrowUpRight, BarChart3, Activity, CheckCircle2, ChevronDown, Check, Download, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActionCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle, AlertOperationInfoIcon } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StatusTag } from "@/components/ui/status-tag";
import { SurfaceCard, SurfaceInner } from "@/components/ui/Surface";
import { StatNumber } from "@/components/ui/Typography";
import { AgentCombobox } from "@/components/OpenClawCombobox";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { MOCK_DEPARTMENTS, MOCK_TOKEN_BY_DEPARTMENT, MOCK_OPENCLAW_LIST, MOCK_CLAWS_WITH_DEPT, type DepartmentNode, type GroupNode, MOCK_GROUP_TREE_MANUAL, MOCK_GROUP_TREE_ONEID, MOCK_TOKEN_BY_GROUP_MANUAL, MOCK_TOKEN_BY_GROUP_ONEID } from "@/lib/mockData";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { AdminPageHeader } from "@/components/ui/admin-page-header";

// CLS 采集插件版本历史
interface CLSPluginVersion {
  version: string;
  releaseDate: string;
  changelog: string;
  status: 'current' | 'available' | 'deprecated';
}

const CLS_PLUGIN_VERSIONS: CLSPluginVersion[] = [
  { version: "v5", releaseDate: "2026-03-24", changelog: "修复会话追踪精度问题，优化 Token 计算算法", status: "available" },
  { version: "v4", releaseDate: "2026-03-17", changelog: "新增会话全局监控功能，支持多渠道分析", status: "available" },
  { version: "v3", releaseDate: "2026-03-10", changelog: "优化日志采集性能，降低 CPU 占用率", status: "current" },
  { version: "v2", releaseDate: "2026-03-03", changelog: "修复 CLS 连接超时问题", status: "deprecated" },
  { version: "v1", releaseDate: "2026-02-24", changelog: "首次发布 CLS 采集插件", status: "deprecated" },
];

// ─── 工具函数 ────────────────────────────────────────────────────────────────
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function todayStr() {
  return toDateStr(new Date());
}
function addDays(base: string, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}
function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}
function fmt(n: number) { return n.toLocaleString(); }

// ─── Mock 数据生成 ────────────────────────────────────────────────────────────
// 生成最近 60 天每天的数据
const DAYS_HISTORY = 60;
const BASE_DATE = addDays(todayStr(), -(DAYS_HISTORY - 1));

const MEMBERS = [
  "alice@acompany.com",
  "bob@acompany.com",
  "carol@acompany.com",
  "dave@acompany.com",
  "eve@acompany.com",
  "frank@acompany.com",
  "grace@acompany.com",
  "henry@acompany.com",
  "ivy@acompany.com",
  "jack@acompany.com",
  "karen@acompany.com",
  "leo@acompany.com",
  "longname-user@very-long-domain-example.com",
  "product-ops-admin@enterprise-acompany.com",
];

const MODELS = [
  "腾讯云 DeepSeek (V3 0324)",
  "腾讯云混元 (Turbo)",
  "腾讯云 DeepSeek (R1)",
  "腾讯云混元 (Pro)",
];

// 每天每用户的 mock 数据
function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

interface DayRecord {
  date: string;
  memberId: string;
  modelName: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

const ALL_RECORDS: DayRecord[] = [];
for (let i = 0; i < DAYS_HISTORY; i++) {
  const date = addDays(BASE_DATE, i);
  MEMBERS.forEach((memberId, mi) => {
    MODELS.forEach((modelName, moi) => {
      const rand = seedRand(i * 1000 + mi * 100 + moi);
      const requests = Math.floor(rand() * 80 + 5);
      const inputTokens = Math.floor(rand() * 15000 + 2000);
      const outputTokens = Math.floor(rand() * 12000 + 1500);
      ALL_RECORDS.push({ date, memberId, modelName, requests, inputTokens, outputTokens });
    });
  });
}

// 今日全局配额（固定）
// 注意：GLOBAL_LIMIT 为 null 表示无限制
const TODAY_RECORDS = ALL_RECORDS.filter((r) => r.date === todayStr());
const TODAY_TOTAL_TOKENS = TODAY_RECORDS.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);

// ─── 进度条 ───────────────────────────────────────────────────────────────────
function ProgressBar({ value, max, showTooltip, isUnlimited }: { value: number; max: number | null; showTooltip?: boolean; isUnlimited?: boolean }) {
  if (isUnlimited || max === null) {
    // 无限制时显示浅灰色进度条，不显示进度
    const bar = (
      <div className="w-full bg-[#f5f5f5] rounded-full h-1.5 cursor-default">
        <div className="h-1.5 rounded-full bg-gray-300 transition-all" style={{ width: "0%" }} />
      </div>
    );
    if (!showTooltip) return bar;
    return (
      <UITooltip>
        <UITooltipTrigger asChild>
          {bar}
        </UITooltipTrigger>
        <UITooltipContent side="bottom" className="text-xs font-medium">
          已消耗 {value.toLocaleString()} Tokens（无限制）
        </UITooltipContent>
      </UITooltip>
    );
  }
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-blue-500";
  const bar = (
    <div className="w-full bg-[#f5f5f5] rounded-full h-1.5 cursor-default">
      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
  if (!showTooltip) return bar;
  return (
    <UITooltip>
      <UITooltipTrigger asChild>
        {bar}
      </UITooltipTrigger>
      <UITooltipContent side="bottom" className="text-xs font-medium">
        {value.toLocaleString()} / {max.toLocaleString()} Tokens
      </UITooltipContent>
    </UITooltip>
  );
}

// ─── CSV 导出工具 ────────────────────────────────────────────────────────────
function makeCsvBlob(header: string, rows: string[]): Blob {
  return new Blob(["\uFEFF" + header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── 翻页组件 ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ─── 部门树节点（递归）──────────────────────────────────────────────────────
function TokenDepartmentTreeNode({
  node, level, selected, expanded, onToggle, onSelect,
}: {
  node: DepartmentNode; level: number; selected: string;
  expanded: Set<string>; onToggle: (id: string) => void; onSelect: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${
          isSelected ? "bg-[#eff4ff] text-[#355EF1]" : "text-[#525252] hover:bg-[#f5f5f5]"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button className="w-4 h-4 flex items-center justify-center flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>
            {isExpanded
              ? <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
              : <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </span>
        )}
        <span className={`text-sm truncate flex-1 ${isSelected ? "text-[#355EF1] font-medium" : ""}`}>{node.name}</span>
        {isSelected && <Check className="w-4 h-4 ml-auto text-[#355EF1] flex-shrink-0" />}
      </div>
      {hasChildren && isExpanded && node.children!.map((child) => (
        <TokenDepartmentTreeNode key={child.id} node={child} level={level + 1}
          selected={selected} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ─── 部门筛选弹出框（Tokens 监控「按部门」Tab 用） ────────────────────────────
function TokenDepartmentFilter({
  departments, value, onChange,
}: {
  departments: DepartmentNode[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { if (open) setTempValue(value); }, [open, value]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const handleConfirm = () => { onChange(tempValue); setOpen(false); };
  const handleCancel = () => { setTempValue(value); setOpen(false); };

  const findNode = (nodes: DepartmentNode[], id: string): DepartmentNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) { const found = findNode(n.children, id); if (found) return found; }
    }
    return undefined;
  };
  const selectedNode = tempValue ? findNode(departments, tempValue) : undefined;
  const triggerNode = value ? findNode(departments, value) : undefined;
  const pathParts = selectedNode?.path?.split("/").filter(Boolean) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox"
          className={`w-[140px] justify-between bg-white text-sm font-normal hover:bg-white data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50 ${
            triggerNode ? "text-foreground" : "text-muted-foreground"
          }`}>
          <span className="truncate">{triggerNode?.name || "全部部门"}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-2">
          <div className={`flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${
            tempValue === "" ? "bg-[#eff4ff]" : "hover:bg-[#f5f5f5]"
          }`} onClick={() => setTempValue("")}>
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#355EF1] font-medium" : "text-[#525252]"}`}>全部部门</span>
            {tempValue === "" && <Check className="w-4 h-4 text-[#355EF1] flex-shrink-0" />}
          </div>
          {departments.map((dept) => (
            <TokenDepartmentTreeNode key={dept.id} node={dept} level={0}
              selected={tempValue} expanded={expanded} onToggle={toggleExpand} onSelect={setTempValue} />
          ))}
        </div>
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-1 text-xs overflow-hidden">
            {tempValue === "" ? (
              <span className="text-[#355EF1] font-medium truncate">全部部门</span>
            ) : pathParts.length > 0 ? (
              pathParts.map((part, idx) => (
                <span key={idx} className="flex items-center gap-1 shrink-0">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#A3A3A3] flex-shrink-0" />}
                  <span className={idx === pathParts.length - 1 ? "text-[#355EF1] font-medium truncate" : "text-[#737373] truncate"}>
                    {part}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-[#A3A3A3] truncate">未选择</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" className="text-xs text-[#737373] h-7 px-2"
              onClick={handleCancel}>取消</Button>
            <Button size="sm" className="text-xs h-7 px-3"
              variant="dialog-confirm" onClick={handleConfirm}>确认</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 分组树节点（递归）──────────────────────────────────────────────────────
function TokenGroupTreeNode({
  node, level, selected, expanded, onToggle, onSelect, search,
}: {
  node: GroupNode; level: number; selected: string;
  expanded: Set<string>; onToggle: (id: string) => void; onSelect: (id: string) => void;
  search: string;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const isSection = node.id.startsWith("__section_");

  // 搜索过滤：如果有搜索词，只显示匹配的节点
  const matchesSearch = !search || node.name.toLowerCase().includes(search.toLowerCase());
  const childrenMatchSearch = hasChildren && node.children!.some(child => {
    const childMatch = child.name.toLowerCase().includes(search.toLowerCase());
    const grandChildMatch = child.children?.some(gc => gc.name.toLowerCase().includes(search.toLowerCase()));
    return childMatch || grandChildMatch;
  });

  if (search && !matchesSearch && !childrenMatchSearch && !isSection) return null;

  return (
    <div>
      {isSection ? (
        <div className="px-2 pt-3 pb-1">
          <span className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wide">{node.name}</span>
        </div>
      ) : (
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${
            isSelected ? "bg-[#eff4ff] text-[#355EF1]" : "text-[#525252] hover:bg-[#f5f5f5]"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelect(node.id)}
        >
          {hasChildren ? (
            <button className="w-4 h-4 flex items-center justify-center flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>
              {isExpanded
                ? <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
                : <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />}
            </button>
          ) : (
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </span>
          )}
          <span className={`text-sm truncate flex-1 ${isSelected ? "text-[#355EF1] font-medium" : ""}`}>{node.name}</span>
          {isSelected && <Check className="w-4 h-4 ml-auto text-[#355EF1] flex-shrink-0" />}
        </div>
      )}
      {hasChildren && (isExpanded || isSection || (search && childrenMatchSearch)) && node.children!.map((child) => (
        <TokenGroupTreeNode key={child.id} node={child} level={isSection ? level : level + 1}
          selected={selected} expanded={expanded} onToggle={onToggle} onSelect={onSelect} search={search} />
      ))}
    </div>
  );
}

// ─── 分组筛选弹出框（Tokens 监控「按分组」Tab 用） ────────────────────────────
function TokenGroupFilter({
  groups, value, onChange,
}: {
  groups: GroupNode[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => { if (open) { setTempValue(value); setSearch(""); } }, [open, value]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const handleConfirm = () => { onChange(tempValue); setOpen(false); };
  const handleCancel = () => { setTempValue(value); setOpen(false); };

  const findNode = (nodes: GroupNode[], id: string): GroupNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) { const found = findNode(n.children, id); if (found) return found; }
    }
    return undefined;
  };
  const selectedNode = tempValue ? findNode(groups, tempValue) : undefined;
  const triggerNode = value ? findNode(groups, value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="claw-outline" size="claw" role="combobox"
          className={`w-[160px] justify-between font-normal ${
            triggerNode ? "" : "text-muted-foreground"
          }`}>
          <span className="truncate">{triggerNode?.name || "全部分组"}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        {/* 搜索框 */}
        <div className="p-2 border-b border-gray-200">
          <Input
            placeholder="搜索分组"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto p-2">
          <div className={`flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${
            tempValue === "" ? "bg-[#eff4ff]" : "hover:bg-[#f5f5f5]"
          }`} onClick={() => setTempValue("")}>
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#355EF1] font-medium" : "text-[#525252]"}`}>全部分组</span>
            {tempValue === "" && <Check className="w-4 h-4 text-[#355EF1] flex-shrink-0" />}
          </div>
          {groups.map((group) => (
            <TokenGroupTreeNode key={group.id} node={group} level={0}
              selected={tempValue} expanded={expanded} onToggle={toggleExpand} onSelect={setTempValue} search={search} />
          ))}
        </div>
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-1 text-xs overflow-hidden">
            {tempValue === "" ? (
              <span className="text-[#355EF1] font-medium truncate">全部分组</span>
            ) : selectedNode?.path ? (
              <span className="flex items-center gap-0.5 truncate">
                {selectedNode.path.split("/").map((seg, idx, arr) => (
                  <span key={idx} className="flex items-center gap-0.5 shrink-0">
                    {idx > 0 && <span className="text-[#A3A3A3] mx-0.5">›</span>}
                    <span className={idx === arr.length - 1 ? "text-[#355EF1] font-medium" : "text-[#737373]"}>{seg}</span>
                  </span>
                ))}
              </span>
            ) : selectedNode ? (
              <span className="text-[#355EF1] font-medium truncate">{selectedNode.name}</span>
            ) : (
              <span className="text-[#A3A3A3] truncate">未选择</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" className="text-xs text-[#737373] h-7 px-2"
              onClick={handleCancel}>取消</Button>
            <Button size="sm" className="text-xs h-7 px-3"
              variant="dialog-confirm" onClick={handleConfirm}>确认</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function TokensMonitor() {
  const [, navigate] = useLocation(); // 在组件顶级调用 useLocation
  const { hasOneid } = useAdminMode();
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [instancePage, setInstancePage] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [deptPage, setDeptPage] = useState(1);
  const [deptFilter, setDeptFilter] = useState("");
  const [groupPage, setGroupPage] = useState(1);
  const [groupFilter, setGroupFilter] = useState("");
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);
  const [deleteLogTopic, setDeleteLogTopic] = useState(false);
  const [showPluginUpgradeDialog, setShowPluginUpgradeDialog] = useState(false);
  const [selectedPluginVersion, setSelectedPluginVersion] = useState<any>(null);
  const [isUpgradingPlugin, setIsUpgradingPlugin] = useState(false);

  // 当弹窗打开时，自动选中最新版本
  useEffect(() => {
    if (showPluginUpgradeDialog && !selectedPluginVersion) {
      setSelectedPluginVersion(CLS_PLUGIN_VERSIONS[0]); // v5 是最新版本
    }
  }, [showPluginUpgradeDialog]);
  const [showClsAgreementDialog, setShowClsAgreementDialog] = useState(false);
  const [clsAgreed, setClsAgreed] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authCheckInterval, setAuthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFreeQuotaDialog, setShowFreeQuotaDialog] = useState(false);
  const [freeQuotaAgreed, setFreeQuotaAgreed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(""); // Agent 名称筛选
  const [globalLimit, setGlobalLimit] = useState<number | null>(() => {
    const mode = localStorage.getItem("globalLimitMode");
    if (mode === "unlimited") return null;
    const value = localStorage.getItem("globalLimit");
    return value ? parseInt(value, 10) : 2000000;
  });
  // 全局 Tokens 时间维度（每日/每月）—— 与平台策略页同步
  const [globalTokenTimeDim, setGlobalTokenTimeDim] = useState<"daily" | "monthly">(() => {
    const v = localStorage.getItem("admin_global_token_time_dim");
    return v === "monthly" ? "monthly" : "daily";
  });
  // 全局 Tokens 上限的"分组策略"列表（来自平台策略页）
  // 每条：{ id, groupIds: string[], value: number | "unlimited" }
  type GlobalTokenGroupRule = { id: string; groupIds: string[]; value: number | "unlimited" };
  const [globalTokenGroupRules, setGlobalTokenGroupRules] = useState<GlobalTokenGroupRule[]>(() => {
    try {
      const raw = localStorage.getItem("admin_global_token_group_rules");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  // 是否启用了"按分组"模式（存在分组策略）
  const IS_GLOBAL_BY_GROUP = globalTokenGroupRules.length > 0;

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "globalClsEnabled") {
        setClsEnabled(e.newValue === "true");
      } else if (e.key === "globalLimitMode" || e.key === "globalLimit") {
        const mode = localStorage.getItem("globalLimitMode");
        if (mode === "unlimited") {
          setGlobalLimit(null);
        } else {
          const value = localStorage.getItem("globalLimit");
          setGlobalLimit(value ? parseInt(value, 10) : 2000000);
        }
      } else if (e.key === "admin_global_token_time_dim") {
        setGlobalTokenTimeDim(e.newValue === "monthly" ? "monthly" : "daily");
      } else if (e.key === "admin_global_token_group_rules") {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setGlobalTokenGroupRules(Array.isArray(parsed) ? parsed : []);
        } catch {
          setGlobalTokenGroupRules([]);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 监听 clsOpenClicked 标记，显示协议弹窗
  useEffect(() => {
    const checkClsOpen = () => {
      if (localStorage.getItem('clsOpenClicked') === 'true') {
        localStorage.removeItem('clsOpenClicked');
        setShowClsAgreementDialog(true);
      }
    };
    
    // 页面加载时检查
    checkClsOpen();
    
    // 监听 focus 事件
    window.addEventListener('focus', checkClsOpen);
    return () => window.removeEventListener('focus', checkClsOpen);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success("数据已刷新"); }, 1000);
  };

  const handleOpenCLS = () => {
    // 检查授权状态（从后台缓存数据中获取）
    const isAuthorized = localStorage.getItem('clsAuthorized') === 'true';
    
    if (!isAuthorized) {
      // 未授权，显示授权 Dialog
      setShowAuthDialog(true);
      // 启动自动检测授权状态
      setIsCheckingAuth(true);
      const interval = setInterval(() => {
        const authorized = localStorage.getItem('clsAuthorized') === 'true';
        if (authorized) {
          // 已授权，关闭 Dialog 并继续
          setShowAuthDialog(false);
          setIsCheckingAuth(false);
          clearInterval(interval);
          // 继续开启 CLS 日志服务
          proceedWithClsSetup();
        }
      }, 2000);
      setAuthCheckInterval(interval);
    } else {
      // 已授权，直接继续
      proceedWithClsSetup();
    }
  };

  const proceedWithClsSetup = () => {
    // 显示免费额度 Dialog
    setShowFreeQuotaDialog(true);
    setFreeQuotaAgreed(false);
  };

  const handleGoToAuth = () => {
    // Mock 授权流程：5 秒后自动检测授权完成
    // 不真正打开腾讯云页面，而是模拟授权完成
    // 先显示检测状态
    setIsCheckingAuth(true);
    setAuthCompleted(false);
    
    setTimeout(() => {
      localStorage.setItem('clsAuthorized', 'true');
      // 检测完成，显示完成状态
      setIsCheckingAuth(false);
      setAuthCompleted(true);
      // 1秒后自动关闭Dialog并进入下一步
      setTimeout(() => {
        setShowAuthDialog(false);
        setAuthCompleted(false);
        proceedWithClsSetup();
      }, 1000);
    }, 5000);
  };

  const handleCancelAuth = () => {
    setShowAuthDialog(false);
    setIsCheckingAuth(false);
    setAuthCompleted(false);
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      setAuthCheckInterval(null);
    }
  };

  const handleConfirmFreeQuota = () => {
    if (!freeQuotaAgreed) return;
    setShowFreeQuotaDialog(false);
    setIsEnablingCls(true);
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setFreeQuotaAgreed(false);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleGoToCalcDetail = () => {
    window.open('https://cloud.tencent.com/document/product/614/45802', '_blank');
  };

  const handleCancelFreeQuota = () => {
    setShowFreeQuotaDialog(false);
    setFreeQuotaAgreed(false);
  };

  const handleCloseClsConfirmCancel = () => {
    setShowCloseClsConfirm(false);
    setDeleteLogTopic(false);
  };

  const handleConfirmClsAgreement = () => {
    if (!clsAgreed) return;
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setShowClsAgreementDialog(false);
      setClsAgreed(false);
      // 3 秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleCloseCls = () => {
    setIsClosingCls(true);
    setTimeout(() => {
      setClsEnabled(false);
      localStorage.setItem("globalClsEnabled", "false");
      setIsClosingCls(false);
      setShowCloseClsConfirm(false);
      setDeleteLogTopic(false);
      const message = deleteLogTopic ? "CLS 日志服务已关闭，日志主题资源已删除" : "CLS 日志服务已关闭";
      toast.success(message);
    }, 1000);
  };

  // 计算全局配额百分比
  const TODAY_GLOBAL_PCT = globalLimit === null ? "0" : ((TODAY_TOTAL_TOKENS / globalLimit) * 100).toFixed(1);
  const IS_GLOBAL_UNLIMITED = globalLimit === null;

  const handleFromChange = (v: string) => {
    setDateFrom(v);
    setInstancePage(1);
    setMemberPage(1);
    setModelPage(1);
    setSessionPage(1);
    setDeptPage(1);
    setGroupPage(1);
  };
  const handleToChange = (v: string) => {
    setDateTo(v);
    setInstancePage(1);
    setMemberPage(1);
    setModelPage(1);
    setSessionPage(1);
    setDeptPage(1);
    setGroupPage(1);
  };

  // 有效时间范围
  const effectiveFrom = dateFrom || today;
  const effectiveTo = dateTo || today;
  const isSingleDay = effectiveFrom === effectiveTo;

  // 筛选范围内的记录
  const rangeRecords = useMemo(
    () => ALL_RECORDS.filter((r) => r.date >= effectiveFrom && r.date <= effectiveTo),
    [effectiveFrom, effectiveTo]
  );

  // 总览指标（随时间联动）
  const totalRequests = rangeRecords.reduce((s, r) => s + r.requests, 0);
  const totalInput = rangeRecords.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutput = rangeRecords.reduce((s, r) => s + r.outputTokens, 0);
  const totalTokens = totalInput + totalOutput;

  // 折线图数据
  const chartData = useMemo(() => {
    if (isSingleDay) {
      // 单日：展示最近 7 天
      return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(today, i - 6);
        const recs = ALL_RECORDS.filter((r) => r.date === date);
        return {
          date: date.slice(5), // MM-DD
          输入Tokens: recs.reduce((s, r) => s + r.inputTokens, 0),
          输出Tokens: recs.reduce((s, r) => s + r.outputTokens, 0),
        };
      });
    } else {
      // 时间段：展示每天
      const days = daysBetween(effectiveFrom, effectiveTo);
      return Array.from({ length: days + 1 }, (_, i) => {
        const date = addDays(effectiveFrom, i);
        const recs = ALL_RECORDS.filter((r) => r.date === date);
        return {
          date: date.slice(5),
          输入Tokens: recs.reduce((s, r) => s + r.inputTokens, 0),
          输出Tokens: recs.reduce((s, r) => s + r.outputTokens, 0),
        };
      });
    }
  }, [isSingleDay, effectiveFrom, effectiveTo, today]);

  // 按实例汇总（随时间联动），按总 token 降序
  // 普通模式用 MOCK_OPENCLAW_LIST，OneID 模式用 MOCK_CLAWS_WITH_DEPT
  const instanceList = hasOneid ? MOCK_CLAWS_WITH_DEPT : MOCK_OPENCLAW_LIST;
  const instanceStats = useMemo(() => {
    // 用实例 id 作为 seed 生成稳定的 mock 消耗数据
    return instanceList.map((inst, idx) => {
      const rand = seedRand(idx * 777 + 42);
      const days = daysBetween(effectiveFrom, effectiveTo) + 1;
      const requests = Math.floor(rand() * 200 * days + 10);
      const inputTokens = Math.floor(rand() * 30000 * days + 5000);
      const outputTokens = Math.floor(rand() * 25000 * days + 3000);
      return {
        id: inst.id,
        instanceId: inst.instanceId,
        name: inst.name,
        creator: (inst as any).creator ?? "",
        department: (inst as any).department ?? "",
        requests,
        inputTokens,
        outputTokens,
        total: inputTokens + outputTokens,
      };
    }).sort((a, b) => b.total - a.total);
  }, [instanceList, effectiveFrom, effectiveTo, hasOneid]);
  const instancePaged = instanceStats.slice((instancePage - 1) * PAGE_SIZE, instancePage * PAGE_SIZE);

  // 按用户汇总（随时间联动），按总请求数降序
  const memberStats = useMemo(() => {
    const map = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    rangeRecords.forEach((r) => {
      const cur = map.get(r.memberId) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
      map.set(r.memberId, {
        requests: cur.requests + r.requests,
        inputTokens: cur.inputTokens + r.inputTokens,
        outputTokens: cur.outputTokens + r.outputTokens,
      });
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, total: v.inputTokens + v.outputTokens }))
      .sort((a, b) => b.total - a.total);
  }, [rangeRecords]);

  // 按模型汇总（随时间联动），按总 token 降序
  const modelStats = useMemo(() => {
    const map = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    rangeRecords.forEach((r) => {
      const cur = map.get(r.modelName) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
      map.set(r.modelName, {
        requests: cur.requests + r.requests,
        inputTokens: cur.inputTokens + r.inputTokens,
        outputTokens: cur.outputTokens + r.outputTokens,
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, total: v.inputTokens + v.outputTokens }))
      .sort((a, b) => b.total - a.total);
  }, [rangeRecords]);

  // 按会话汇总（高成本 TOP 5），按成本降序
  interface SessionStat {
    sessionId: string;
    sessionName: string;
    channel: string;
    model: string;
    lastActiveTime: string;
    rounds: number;
    tokens: number;
    cost: number;
    duration: string;
  }
  const sessionStats: SessionStat[] = [
    { sessionId: "fb766833", sessionName: "你能干啥 / 你管理一下我在伊朗的局势", channel: "Feishu Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-04 21:06", rounds: 63, tokens: 1950000, cost: 0.2743, duration: "454m 1s" },
    { sessionId: "06468225", sessionName: "我感觉现在仅表盘可观测细节这人，...", channel: "Feishu Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-08 13:14", rounds: 51, tokens: 1880000, cost: 0.2700, duration: "28m 52s" },
    { sessionId: "a9c7eb8b", sessionName: "请帮我列出 /etc 目录下所有 .conf ...", channel: "Webchat", model: "deepseek-v3.2", lastActiveTime: "2026-03-04 20:23", rounds: 47, tokens: 1590000, cost: 0.2242, duration: "12m 5s" },
    { sessionId: "a46be600", sessionName: "nihao / 帮我看看你的session-cost...", channel: "QQ Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-07 23:29", rounds: 35, tokens: 965000, cost: 0.1359, duration: "679m 41s" },
    { sessionId: "7bec562c", sessionName: "你还在吗 / 我是觉得现在 agent 仍...", channel: "Feishu Group", model: "hunyuan-turbos-latest", lastActiveTime: "2026-03-08 21:58", rounds: 28, tokens: 755000, cost: 0.1076, duration: "548m 57s" },
  ];
  const sessionPaged = sessionStats.slice((sessionPage - 1) * PAGE_SIZE, sessionPage * PAGE_SIZE);

  // 导出函数
  const runExport = (buildBlob: () => { blob: Blob; filename: string }) => {
    const tid = toast.loading("正在导出Tokens消耗明细列表");
    setTimeout(() => {
      const { blob, filename } = buildBlob();
      downloadBlob(blob, filename);
      toast.dismiss(tid);
    }, 500);
  };

  const handleExportInstance = () => runExport(() => {
    const header = hasOneid
      ? "实例名称,实例ID,用户ID,所属部门,总请求数,输入Tokens,输出Tokens,总Tokens"
      : "实例名称,实例ID,用户ID,总请求数,输入Tokens,输出Tokens,总Tokens";
    const rows = instanceStats.map((r) =>
      hasOneid
        ? `${r.name},${r.instanceId},${r.creator},${r.department},${r.requests},${r.inputTokens},${r.outputTokens},${r.total}`
        : `${r.name},${r.instanceId},${r.creator},${r.requests},${r.inputTokens},${r.outputTokens},${r.total}`
    );
    return { blob: makeCsvBlob(header, rows), filename: `tokens_by_instance_${effectiveFrom}_${effectiveTo}.csv` };
  });
  const handleExportMember = () => runExport(() => {
    const header = "用户ID,总请求数,输入Tokens,输出Tokens,总Tokens";
    const rows = memberStats.map((r) => `${r.id},${r.requests},${r.inputTokens},${r.outputTokens},${r.total}`);
    return { blob: makeCsvBlob(header, rows), filename: `tokens_by_member_${effectiveFrom}_${effectiveTo}.csv` };
  });
  const handleExportModel = () => runExport(() => {
    const header = "模型名称,总请求数,输入Tokens,输出Tokens,总Tokens";
    const rows = modelStats.map((r) => `${r.name},${r.requests},${r.inputTokens},${r.outputTokens},${r.total}`);
    return { blob: makeCsvBlob(header, rows), filename: `tokens_by_model_${effectiveFrom}_${effectiveTo}.csv` };
  });
  const handleExportDept = () => runExport(() => {
    const header = "部门名称,所属路径,总请求数,输入Tokens,输出Tokens,总Tokens";
    const rows = deptStats.map((r) => `${r.departmentName},${r.path},${r.requests},${r.inputTokens},${r.outputTokens},${r.totalTokens}`);
    return { blob: makeCsvBlob(header, rows), filename: `tokens_by_department_${effectiveFrom}_${effectiveTo}.csv` };
  });
  const handleExportSession = () => runExport(() => {
    const header = "会话ID,会话名称,渠道,模型,最后活动时间,轮次,Tokens,成本($),耗时";
    const rows = sessionStats.map((r) => `${r.sessionId},"${r.sessionName}",${r.channel},${r.model},${r.lastActiveTime},${r.rounds},${r.tokens},${r.cost.toFixed(4)},${r.duration}`);
    return { blob: makeCsvBlob(header, rows), filename: `tokens_by_session_${effectiveFrom}_${effectiveTo}.csv` };
  });

  // 翻页切片
  const memberPaged = memberStats.slice((memberPage - 1) * PAGE_SIZE, memberPage * PAGE_SIZE);
  const modelPaged = modelStats.slice((modelPage - 1) * PAGE_SIZE, modelPage * PAGE_SIZE);

  // 按部门汇总（OneID 模式使用）
  const findDeptAndChildren = (nodes: DepartmentNode[], targetId: string): string[] => {
    const ids: string[] = [];
    const collect = (node: DepartmentNode) => {
      ids.push(node.id);
      node.children?.forEach(collect);
    };
    const find = (list: DepartmentNode[]): boolean => {
      for (const n of list) {
        if (n.id === targetId) { collect(n); return true; }
        if (n.children && find(n.children)) return true;
      }
      return false;
    };
    find(nodes);
    return ids;
  };

  const deptStats = useMemo(() => {
    if (!hasOneid) return [];
    let data = MOCK_TOKEN_BY_DEPARTMENT;
    if (deptFilter) {
      const allowedIds = findDeptAndChildren(MOCK_DEPARTMENTS, deptFilter);
      data = data.filter((d) => allowedIds.includes(d.departmentId));
    }
    return data.sort((a, b) => b.totalTokens - a.totalTokens);
  }, [hasOneid, deptFilter]);
  const deptPaged = deptStats.slice((deptPage - 1) * PAGE_SIZE, deptPage * PAGE_SIZE);

  // 按分组汇总（普通模式和 OneID 模式都可见）
  const groupTree = hasOneid ? MOCK_GROUP_TREE_ONEID : MOCK_GROUP_TREE_MANUAL;
  const findGroupAndChildren = (nodes: GroupNode[], targetId: string): string[] => {
    const ids: string[] = [];
    const collect = (node: GroupNode) => {
      if (!node.id.startsWith("__section_")) ids.push(node.id);
      node.children?.forEach(collect);
    };
    const find = (list: GroupNode[]): boolean => {
      for (const n of list) {
        if (n.id === targetId) { collect(n); return true; }
        if (n.children && find(n.children)) return true;
      }
      return false;
    };
    find(nodes);
    return ids;
  };

  const groupStats = useMemo(() => {
    const rawData = hasOneid ? MOCK_TOKEN_BY_GROUP_ONEID : MOCK_TOKEN_BY_GROUP_MANUAL;
    let data = rawData;
    if (groupFilter) {
      const allowedIds = findGroupAndChildren(groupTree, groupFilter);
      data = data.filter((d) => allowedIds.includes(d.groupId));
    }
    return data.sort((a, b) => b.totalTokens - a.totalTokens);
  }, [hasOneid, groupFilter, groupTree]);
  const groupPaged = groupStats.slice((groupPage - 1) * PAGE_SIZE, groupPage * PAGE_SIZE);

  // ── 分组 → 全局 Tokens 上限映射 ──
  // 把 groupRule.groupIds 展开成"该规则覆盖的所有底层分组ID"
  const groupLimitMap = useMemo(() => {
    const map = new Map<string, number | "unlimited">();
    for (const rule of globalTokenGroupRules) {
      for (const gid of rule.groupIds) {
        const expanded = findGroupAndChildren(groupTree, gid);
        const ids = expanded.length > 0 ? expanded : [gid];
        for (const id of ids) {
          // 后写入会覆盖前面（按规则顺序，后定义优先）
          map.set(id, rule.value);
        }
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTokenGroupRules, groupTree]);
  // 给每个分组返回"按时间维度的消耗 / 上限"
  // mock：daily 用 totalTokens × 0.3，monthly 用 totalTokens 直接
  const getGroupQuotaInfo = (g: { groupId: string; totalTokens: number }) => {
    const limit = groupLimitMap.get(g.groupId);
    const consumed = globalTokenTimeDim === "daily"
      ? Math.round(g.totalTokens * 0.3)
      : g.totalTokens;
    if (limit === undefined) {
      // 未配置策略 → 落入兜底：兜底无限制 ↔ globalLimit === null
      if (IS_GLOBAL_UNLIMITED) return { unlimited: true, consumed, limit: null as number | null, pct: 0 };
      const pct = globalLimit && globalLimit > 0 ? (consumed / globalLimit) * 100 : 0;
      return { unlimited: false, consumed, limit: globalLimit, pct };
    }
    if (limit === "unlimited" || limit === -1) {
      return { unlimited: true, consumed, limit: null as number | null, pct: 0 };
    }
    const num = Number(limit);
    const pct = num > 0 ? (consumed / num) * 100 : 0;
    return { unlimited: false, consumed, limit: num, pct };
  };

  const handleExportGroup = () => runExport(() => {
    const header = "分组名称,总请求数,输入Tokens,输出Tokens,总Tokens";
    const rows = groupStats.map((r) => `${r.groupName},${r.requests},${r.inputTokens},${r.outputTokens},${r.totalTokens}`);
    return { blob: makeCsvBlob(header, rows), filename: `tokens_by_group_${effectiveFrom}_${effectiveTo}.csv` };
  });

  return (
      <div className="page-enter">
        {/* Header */}




        <AdminPageHeader
          title="Tokens 监控"
          description={
            <span className="flex items-center gap-2">
              查看企业用户和模型的 Tokens 消耗情况。
              <UITooltip>
                <UITooltipTrigger asChild>
                  <button className="text-sm text-[#355EF1] hover:text-[#355EF1] hover:underline cursor-help transition-colors">
                    查看tokens统计规则
                  </button>
                </UITooltipTrigger>
                <UITooltipContent side="right" className="max-w-sm text-xs">
                  <div className="space-y-1.5">
                    <p>统计数据为模型 API 处理的全量 Token，包含输入 Token(缓存未命中)、输入 Token(缓存命中)、输出 Token。</p>
                    <p>缓存命中 Token 的实际计费价格通常远低于缓存未命中 Token。</p>
                    <p>因此页面展示的总 Token 数不等于等额的实际计费成本。</p>
                    <p>如需了解各模型的缓存输入 Token 定价，请参考对应模型提供商的官方计费文档。</p>
                  </div>
                </UITooltipContent>
              </UITooltip>
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <DatePicker
                value={dateFrom}
                onChange={handleFromChange}
              />
              <span className="text-[#A3A3A3] text-sm">—</span>
              <DatePicker
                value={dateTo}
                onChange={handleToChange}
              />
              <Button
                variant="claw-outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                title="刷新数据"
                className="w-9 h-9"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          }
        />

        {/* Overview Cards - 始终显示 */}
        <div className="grid grid-cols-5 gap-5 mb-6">
          {/* 随时间联动的四张卡片 */}
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.1557 0.568474C11.2759 0.547602 11.3997 0.565694 11.5083 0.621208C11.6168 0.676751 11.7039 0.766463 11.7573 0.876091C11.8107 0.985788 11.8275 1.10986 11.8042 1.22961L10.77 6.39172L14.8227 7.91125C14.9089 7.94398 14.9857 7.99716 15.0464 8.06652C15.1071 8.13609 15.1505 8.2197 15.1714 8.30968C15.1922 8.39969 15.1905 8.4939 15.1665 8.58312C15.1425 8.67222 15.0968 8.75406 15.0337 8.8214H15.0366L7.1616 17.2589L7.09421 17.3204C7.0224 17.3757 6.9373 17.4131 6.84714 17.4288L6.7573 17.4366C6.69672 17.4373 6.63627 17.4288 6.57859 17.4103L6.49461 17.3751C6.386 17.3195 6.29798 17.2299 6.24461 17.1202C6.20472 17.0381 6.18625 16.9479 6.18894 16.8575L6.19871 16.7667L7.22996 11.6105L3.17722 10.089C3.11208 10.0646 3.05213 10.0285 3.00046 9.98254L2.95164 9.93273C2.9057 9.8803 2.86992 9.82011 2.84617 9.755L2.82664 9.68859C2.80577 9.59809 2.80709 9.50378 2.83152 9.41418C2.85597 9.32456 2.90234 9.2423 2.96629 9.17492L10.8413 0.737419C10.9247 0.648358 11.0355 0.589437 11.1557 0.568474ZM5.34324 9.09972L9.1655 10.5353L8.63035 13.2111L11.1528 10.5089H11.1401L12.6479 8.89758L8.83445 7.46789L9.37058 4.78527L5.34324 9.09972Z" fill="url(#tm_icon_requests)"/>
                <defs><radialGradient id="tm_icon_requests" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.81201 8.99836) scale(12.3738 747.725)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
              </svg>
              <span className="text-sm text-[#737373]">总请求数</span>
            </div>
            <StatNumber>{fmt(totalRequests)}</StatNumber>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.02805 6.22195C4.86954 6.06344 4.78049 5.84846 4.78049 5.6243C4.78049 5.40013 4.86954 5.18515 5.02805 5.02664C5.18656 4.86813 5.40154 4.77908 5.6257 4.77908C5.84987 4.77908 6.06485 4.86813 6.22336 5.02664L8.15625 6.96094V1.6875C8.15625 1.46372 8.24514 1.24911 8.40338 1.09088C8.56161 0.932645 8.77622 0.84375 9 0.84375C9.22378 0.84375 9.43839 0.932645 9.59662 1.09088C9.75485 1.24911 9.84375 1.46372 9.84375 1.6875V6.96094L11.778 5.02594C11.9366 4.86743 12.1515 4.77838 12.3757 4.77838C12.5999 4.77838 12.8149 4.86743 12.9734 5.02594C13.1319 5.18445 13.2209 5.39943 13.2209 5.62359C13.2209 5.84776 13.1319 6.06274 12.9734 6.22125L9.59836 9.59625C9.51997 9.67491 9.42683 9.73732 9.32427 9.77991C9.22171 9.82249 9.11175 9.84442 9.0007 9.84442C8.88965 9.84442 8.7797 9.82249 8.67714 9.77991C8.57458 9.73732 8.48143 9.67491 8.40305 9.59625L5.02805 6.22195ZM15.75 8.15625H13.2188C12.995 8.15625 12.7804 8.24514 12.6221 8.40338C12.4639 8.56161 12.375 8.77622 12.375 9C12.375 9.22378 12.4639 9.43839 12.6221 9.59662C12.7804 9.75485 12.995 9.84375 13.2188 9.84375H15.4688V13.7812H2.53125V9.84375H4.78125C5.00503 9.84375 5.21964 9.75485 5.37787 9.59662C5.53611 9.43839 5.625 9.22378 5.625 9C5.625 8.77622 5.53611 8.56161 5.37787 8.40338C5.21964 8.24514 5.00503 8.15625 4.78125 8.15625H2.25C1.87704 8.15625 1.51935 8.30441 1.25563 8.56813C0.991908 8.83185 0.84375 9.18954 0.84375 9.5625V14.0625C0.84375 14.4355 0.991908 14.7931 1.25563 15.0569C1.51935 15.3206 1.87704 15.4688 2.25 15.4688H15.75C16.123 15.4688 16.4806 15.3206 16.7444 15.0569C17.0081 14.7931 17.1562 14.4355 17.1562 14.0625V9.5625C17.1563 9.18954 17.0081 8.83185 16.7444 8.56813C16.4806 8.30441 16.123 8.15625 15.75 8.15625ZM14.3438 11.8125C14.3438 11.59 14.2778 11.3725 14.1542 11.1875C14.0305 11.0025 13.8548 10.8583 13.6493 10.7731C13.4437 10.688 13.2175 10.6657 12.9993 10.7091C12.781 10.7525 12.5806 10.8597 12.4233 11.017C12.2659 11.1743 12.1588 11.3748 12.1154 11.593C12.072 11.8113 12.0942 12.0375 12.1794 12.243C12.2645 12.4486 12.4087 12.6243 12.5937 12.7479C12.7787 12.8715 12.9962 12.9375 13.2188 12.9375C13.5171 12.9375 13.8033 12.819 14.0142 12.608C14.2252 12.397 14.3438 12.1109 14.3438 11.8125Z" fill="url(#tm_icon_input)"/>
                <defs><radialGradient id="tm_icon_input" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.843749 8.15625) scale(16.3125 647.966)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
              </svg>
              <span className="text-sm text-[#737373]">输入 Tokens</span>
            </div>
            <StatNumber>{fmt(totalInput)}</StatNumber>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8157 10.653C13.9742 10.8116 14.0633 11.0265 14.0633 11.2507C14.0633 11.4749 13.9742 11.6899 13.8157 11.8484C13.6572 12.0069 13.4422 12.0959 13.2181 12.0959C12.9939 12.0959 12.7789 12.0069 12.6204 11.8484L11.8125 11.0391V14.625C11.8125 14.8488 11.7236 15.0634 11.5654 15.2216C11.4071 15.3799 11.1925 15.4688 10.9688 15.4688C10.745 15.4688 10.5304 15.3799 10.3721 15.2216C10.2139 15.0634 10.125 14.8488 10.125 14.625V11.0391L9.31572 11.8491C9.15721 12.0076 8.94222 12.0966 8.71806 12.0966C8.4939 12.0966 8.27891 12.0076 8.1204 11.8491C7.9619 11.6906 7.87285 11.4756 7.87285 11.2514C7.87285 11.0272 7.9619 10.8123 8.1204 10.6538L10.3704 8.40375C10.4488 8.32509 10.5419 8.26268 10.6445 8.22009C10.7471 8.17751 10.857 8.15558 10.9681 8.15558C11.0791 8.15558 11.1891 8.17751 11.2916 8.22009C11.3942 8.26268 11.4873 8.32509 11.5657 8.40375L13.8157 10.653ZM11.25 2.53125C10.0822 2.53181 8.93632 2.84821 7.9337 3.44694C6.93107 4.04567 6.10905 4.90443 5.5547 5.93227C4.9091 5.86465 4.2565 5.9292 3.63666 6.12198C3.01682 6.31477 2.44272 6.63175 1.94937 7.05361C1.45601 7.47547 1.05372 7.99337 0.767018 8.57575C0.480315 9.15814 0.315204 9.7928 0.281746 10.4411C0.248288 11.0893 0.347185 11.7376 0.57241 12.3464C0.797634 12.9552 1.14447 13.5118 1.59178 13.9822C2.03908 14.4526 2.57749 14.827 3.17419 15.0826C3.77089 15.3382 4.41338 15.4695 5.06251 15.4688H7.03126C7.25504 15.4688 7.46965 15.3799 7.62788 15.2216C7.78612 15.0634 7.87501 14.8488 7.87501 14.625C7.87501 14.4012 7.78612 14.1866 7.62788 14.0284C7.46965 13.8701 7.25504 13.7812 7.03126 13.7812H5.06251C4.25632 13.7763 3.4839 13.4569 2.90972 12.8909C2.33554 12.325 2.00496 11.5573 1.98838 10.7512C1.97179 9.94518 2.2705 9.1645 2.82091 8.57542C3.37132 7.98633 4.12994 7.63537 4.93525 7.59727C4.83275 8.0578 4.78111 8.5282 4.78126 9C4.78126 9.22378 4.87016 9.43839 5.02839 9.59662C5.18663 9.75485 5.40124 9.84375 5.62501 9.84375C5.84879 9.84375 6.0634 9.75485 6.22163 9.59662C6.37987 9.43839 6.46876 9.22378 6.46876 9C6.46934 8.30834 6.61998 7.62505 6.91028 6.99726C7.20057 6.36948 7.62362 5.81215 8.15022 5.36373C8.67682 4.91532 9.29445 4.58649 9.96047 4.39995C10.6265 4.2134 11.3251 4.17358 12.008 4.28322C12.6909 4.39287 13.3419 4.64938 13.916 5.03504C14.4902 5.42071 14.9738 5.92635 15.3336 6.51708C15.6933 7.10781 15.9206 7.76956 15.9998 8.45666C16.079 9.14377 16.0082 9.83988 15.7922 10.497C15.7575 10.6022 15.7439 10.7133 15.7522 10.8238C15.7604 10.9343 15.7904 11.0421 15.8403 11.1411C15.8902 11.24 15.9591 11.3282 16.0431 11.4005C16.1271 11.4728 16.2245 11.5279 16.3297 11.5625C16.435 11.5972 16.5461 11.6108 16.6566 11.6026C16.7671 11.5943 16.8749 11.5644 16.9739 11.5145C17.0728 11.4645 17.161 11.3956 17.2333 11.3116C17.3056 11.2277 17.3607 11.1303 17.3953 11.025C17.7147 10.0532 17.7992 9.01945 17.6418 8.00864C17.4845 6.99784 17.0898 6.03872 16.4902 5.20992C15.8905 4.38112 15.103 3.70624 14.1921 3.24063C13.2812 2.77501 12.273 2.5319 11.25 2.53125Z" fill="url(#tm_icon_output)"/>
                <defs><radialGradient id="tm_icon_output" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.27539 9) scale(17.4435 573.201)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
              </svg>
              <span className="text-sm text-[#737373]">输出 Tokens</span>
            </div>
            <StatNumber>{fmt(totalOutput)}</StatNumber>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6322 7.68155L12.2953 6.10444L10.7182 1.76757C10.6198 1.49691 10.4405 1.26309 10.2047 1.09786C9.9688 0.932629 9.68779 0.843994 9.39982 0.843994C9.11184 0.843994 8.83084 0.932629 8.59498 1.09786C8.35912 1.26309 8.17983 1.49691 8.08146 1.76757L6.50435 6.10444L2.16747 7.68155C1.89682 7.77992 1.66299 7.95921 1.49776 8.19507C1.33253 8.43093 1.2439 8.71193 1.2439 8.99991C1.2439 9.28789 1.33253 9.56889 1.49776 9.80475C1.66299 10.0406 1.89682 10.2199 2.16747 10.3183L6.50435 11.8954L8.08146 16.2323C8.17983 16.5029 8.35912 16.7367 8.59498 16.902C8.83084 17.0672 9.11184 17.1558 9.39982 17.1558C9.68779 17.1558 9.9688 17.0672 10.2047 16.902C10.4405 16.7367 10.6198 16.5029 10.7182 16.2323L12.2953 11.8954L16.6322 10.3183C16.9028 10.2199 17.1366 10.0406 17.3019 9.80475C17.4671 9.56889 17.5557 9.28789 17.5557 8.99991C17.5557 8.71193 17.4671 8.43093 17.3019 8.19507C17.1366 7.95921 16.9028 7.77992 16.6322 7.68155ZM11.3489 10.4441C11.2329 10.4863 11.1277 10.5533 11.0404 10.6405C10.9532 10.7278 10.8862 10.833 10.844 10.949L9.39982 14.9209L7.9556 10.949C7.91347 10.833 7.84643 10.7278 7.7592 10.6405C7.67198 10.5533 7.56669 10.4863 7.45075 10.4441L3.4788 8.99991L7.45075 7.55569C7.56669 7.51356 7.67198 7.44653 7.7592 7.3593C7.84643 7.27208 7.91347 7.16679 7.9556 7.05085L9.39982 3.0789L10.844 7.05085C10.8862 7.16679 10.9532 7.27208 11.0404 7.3593C11.1277 7.44653 11.2329 7.51356 11.3489 7.55569L15.3208 8.99991L11.3489 10.4441Z" fill="url(#tm_icon_total)"/>
                <defs><radialGradient id="tm_icon_total" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.2439 8.99991) scale(16.3118 722.702)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
              </svg>
              <span className="text-sm text-[#737373]">总 Tokens</span>
            </div>
            <StatNumber>{fmt(totalTokens)}</StatNumber>
          </SurfaceCard>

          {/* 全局配额消耗（按时间维度展示：今日/本月，不随上方时间筛选联动） */}
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.7085 0.84375C12.9323 0.84375 13.1469 0.932586 13.3052 1.09082C13.4634 1.24905 13.5522 1.46372 13.5522 1.6875V1.96875H14.9585C15.3315 1.96875 15.6889 2.11714 15.9526 2.38086C16.2164 2.64458 16.3647 3.00204 16.3647 3.375V14.625C16.3647 14.998 16.2164 15.3554 15.9526 15.6191C15.6889 15.8829 15.3315 16.0312 14.9585 16.0312H3.7085C3.33554 16.0312 2.97808 15.8829 2.71436 15.6191C2.45063 15.3554 2.30225 14.998 2.30225 14.625V3.375C2.30225 3.00204 2.45063 2.64458 2.71436 2.38086C2.97808 2.11714 3.33554 1.96875 3.7085 1.96875H5.11475V1.6875C5.11475 1.46372 5.20358 1.24905 5.36182 1.09082C5.52005 0.932587 5.73472 0.84375 5.9585 0.84375C6.18227 0.84375 6.39694 0.932587 6.55518 1.09082C6.71341 1.24905 6.80225 1.46372 6.80225 1.6875V1.96875H11.8647V1.6875C11.8647 1.46372 11.9536 1.24905 12.1118 1.09082C12.2701 0.932586 12.4847 0.84375 12.7085 0.84375ZM3.98975 3.65625V14.3438H14.6772V3.65625H13.5522C13.5522 3.88003 13.4634 4.0947 13.3052 4.25293C13.1469 4.41116 12.9323 4.5 12.7085 4.5C12.4847 4.5 12.2701 4.41116 12.1118 4.25293C11.9536 4.0947 11.8647 3.88003 11.8647 3.65625H6.80225C6.80225 3.88003 6.71341 4.0947 6.55518 4.25293C6.39694 4.41116 6.18227 4.5 5.9585 4.5C5.73472 4.5 5.52005 4.41116 5.36182 4.25293C5.20358 4.0947 5.11475 3.88003 5.11475 3.65625H3.98975ZM9.01709 5.70508C9.12582 5.41124 9.54117 5.41124 9.6499 5.70508L10.4731 7.92871L12.6968 8.75195C12.9905 8.86075 12.9906 9.27605 12.6968 9.38477L10.4731 10.208L9.6499 12.4316C9.54784 12.7068 9.1762 12.7242 9.04053 12.4834L9.01709 12.4316L8.19385 10.208L5.97021 9.38477C5.67641 9.27605 5.67647 8.86073 5.97021 8.75195L8.19385 7.92871L9.01709 5.70508Z" fill="url(#tm_icon_quota)"/>
                <defs><radialGradient id="tm_icon_quota" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.30225 8.4375) scale(14.0625 672.888)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
              </svg>
              <span className="text-sm text-[#737373] flex items-center gap-1">
                {globalTokenTimeDim === "daily" ? "今日全局配额消耗" : "本月全局配额消耗"}
                <UITooltip>
                  <UITooltipTrigger asChild>
                    <span className="cursor-default">
                      <Info className="w-3 h-3 text-[#A3A3A3] hover:text-[#A3A3A3] transition-colors" />
                    </span>
                  </UITooltipTrigger>
                  <UITooltipContent side="top" className="max-w-[260px] text-xs">
                    {IS_GLOBAL_BY_GROUP
                      ? '全局 Tokens 上限已按分组进行设置，请在下方"按分组"Tab 查看具体分组的消耗'
                      : IS_GLOBAL_UNLIMITED
                        ? "全局配额已设置为无限制，无需关注消耗占比"
                        : globalTokenTimeDim === "daily"
                          ? "此处统计所有用户使用所有公司配置模型的总 Tokens 占每日全局 Tokens 上限的占比，按自然日统计，每天 0 点重置"
                          : "此处统计所有用户使用所有公司配置模型的总 Tokens 占每月全局 Tokens 上限的占比，按自然月统计，每月 1 号 0 点重置"}
                  </UITooltipContent>
                </UITooltip>
              </span>
            </div>
            <div className="flex items-center gap-8">
              <StatNumber className="shrink-0">{IS_GLOBAL_BY_GROUP ? "0" : TODAY_GLOBAL_PCT}%</StatNumber>
              {IS_GLOBAL_BY_GROUP ? (
                <span className="text-xs font-semibold text-[#355EF1] bg-[#e0e9ff] px-2.5 py-1.5 rounded-[4px]">按分组</span>
              ) : IS_GLOBAL_UNLIMITED ? (
                <span className="text-xs font-semibold text-[#355EF1] bg-[#e0e9ff] px-2.5 py-1.5 rounded-[4px]">无限制</span>
              ) : (
                <ProgressBar
                  value={IS_GLOBAL_BY_GROUP ? 0 : TODAY_TOTAL_TOKENS}
                  max={IS_GLOBAL_BY_GROUP ? 1 : globalLimit}
                  showTooltip={!IS_GLOBAL_BY_GROUP}
                  isUnlimited={IS_GLOBAL_UNLIMITED && !IS_GLOBAL_BY_GROUP}
                />
              )}
            </div>
          </SurfaceCard>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6"
         >
          <p className="text-sm font-medium text-[#525252] mb-4">
            {isSingleDay ? "最近 7 天 Tokens 趋势" : "所选时间段 Tokens 趋势"}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value: number) => [value.toLocaleString(), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="输入Tokens" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="输出Tokens" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detail Tabs */}
        <Segment defaultValue="instance">
          <div className="flex items-center justify-between mb-2">
            <SegmentList>
              <SegmentItem value="instance">按实例</SegmentItem>
              <SegmentItem value="member">按用户</SegmentItem>
              <SegmentItem value="model">按模型</SegmentItem>
              {hasOneid && <SegmentItem value="department">按部门</SegmentItem>}
              <SegmentItem value="group" className="relative pr-3">
                按分组
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </SegmentItem>
              <SegmentItem value="session">按会话</SegmentItem>
            </SegmentList>
          </div>

          {/* 按实例 */}
          <SegmentContent value="instance">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#A3A3A3]">汇总所选时间范围内每台实例的 Token 消耗，按总 Tokens 降序排序</p>
              <UITooltip>
                <UITooltipTrigger asChild>
                  <Button
                    variant="claw-outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={handleExportInstance}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </UITooltipTrigger>
                <UITooltipContent side="top" className="text-xs">导出列表</UITooltipContent>
              </UITooltip>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
             >
              <Table variant="elevated-white">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: '220px', minWidth: '220px', maxWidth: '220px' }}>名称 / ID</TableHead>
                    <TableHead>用户 ID</TableHead>
                    {hasOneid && <TableHead>所属部门</TableHead>}
                    <TableHead>总请求数</TableHead>
                    <TableHead>输入 Tokens</TableHead>
                    <TableHead>输出 Tokens</TableHead>
                    <TableHead>总 Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instancePaged.length === 0 ? (
                    <TableRow><TableCell colSpan={hasOneid ? 7 : 6} className="text-center text-sm text-[#A3A3A3] py-12">暂无数据</TableCell></TableRow>
                  ) : instancePaged.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell style={{ width: '220px', minWidth: '220px', maxWidth: '220px' }}>
                        <div className="min-w-0">
                          <UITooltip>
                            <UITooltipTrigger asChild>
                              <div className="text-sm font-medium text-[#09090b] truncate max-w-[180px]">{inst.name}</div>
                            </UITooltipTrigger>
                            <UITooltipContent side="top" className="text-xs max-w-xs break-all">{inst.name}</UITooltipContent>
                          </UITooltip>
                          <div className="text-xs font-mono text-[#737373]">{inst.instanceId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#737373]">{inst.creator || "—"}</TableCell>
                      {hasOneid && <TableCell className="text-sm text-[#737373]">{inst.department || "—"}</TableCell>}
                      <TableCell>{fmt(inst.requests)}</TableCell>
                      <TableCell>{fmt(inst.inputTokens)}</TableCell>
                      <TableCell>{fmt(inst.outputTokens)}</TableCell>
                      <TableCell className="font-medium">{fmt(inst.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 py-2 border-t border-gray-200">
                <Pagination total={instanceStats.length} current={instancePage} pageSize={PAGE_SIZE} showTotal={(total) => `共 ${total} 条记录`} className="w-full justify-between" onChange={(p) => setInstancePage(p)} />
              </div>
            </div>
          </SegmentContent>

          {/* 按用户 */}
          <SegmentContent value="member">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#A3A3A3]">汇总所选时间范围内每个用户使用所有模型的消耗，按总 Tokens 降序排序</p>
              <UITooltip>
                <UITooltipTrigger asChild>
                  <Button
                    variant="claw-outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={handleExportMember}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </UITooltipTrigger>
                <UITooltipContent side="top" className="text-xs">导出列表</UITooltipContent>
              </UITooltip>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
             >
              <Table variant="elevated-white">
                <TableHeader>
                  <TableRow>
                    <TableHead>用户 ID</TableHead>
                    <TableHead>总请求数</TableHead>
                    <TableHead>输入 Tokens</TableHead>
                    <TableHead>输出 Tokens</TableHead>
                    <TableHead>总 Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberPaged.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-[#A3A3A3] py-12">暂无数据</TableCell></TableRow>
                  ) : memberPaged.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell style={{ width: '220px', minWidth: '220px', maxWidth: '220px' }}>
                        <UITooltip>
                          <UITooltipTrigger asChild>
                            <span className="font-medium truncate block max-w-[180px]">{m.id}</span>
                          </UITooltipTrigger>
                          <UITooltipContent side="top" className="text-xs max-w-xs break-all">{m.id}</UITooltipContent>
                        </UITooltip>
                      </TableCell>
                      <TableCell>{fmt(m.requests)}</TableCell>
                      <TableCell>{fmt(m.inputTokens)}</TableCell>
                      <TableCell>{fmt(m.outputTokens)}</TableCell>
                      <TableCell className="font-medium">{fmt(m.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 py-2 border-t border-gray-200">
                <Pagination total={memberStats.length} current={memberPage} pageSize={PAGE_SIZE} showTotal={(total) => `共 ${total} 条记录`} className="w-full justify-between" onChange={(p) => setMemberPage(p)} />
              </div>
            </div>
          </SegmentContent>

          {/* 按模型 */}
          <SegmentContent value="model">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#A3A3A3]">汇总所选时间范围内每个模型被所有企业用户使用的消耗，按总 Tokens 降序排序</p>
              <UITooltip>
                <UITooltipTrigger asChild>
                  <Button
                    variant="claw-outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={handleExportModel}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </UITooltipTrigger>
                <UITooltipContent side="top" className="text-xs">导出列表</UITooltipContent>
              </UITooltip>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
             >
              <Table variant="elevated-white">
                <TableHeader>
                  <TableRow>
                    <TableHead>模型名称</TableHead>
                    <TableHead>总请求数</TableHead>
                    <TableHead>输入 Tokens</TableHead>
                    <TableHead>输出 Tokens</TableHead>
                    <TableHead>总 Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelPaged.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-[#A3A3A3] py-12">暂无数据</TableCell></TableRow>
                  ) : modelPaged.map((m) => (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{fmt(m.requests)}</TableCell>
                      <TableCell>{fmt(m.inputTokens)}</TableCell>
                      <TableCell>{fmt(m.outputTokens)}</TableCell>
                      <TableCell className="font-medium">{fmt(m.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 py-2 border-t border-gray-200">
                <Pagination total={modelStats.length} current={modelPage} pageSize={PAGE_SIZE} showTotal={(total) => `共 ${total} 条记录`} className="w-full justify-between" onChange={(p) => setModelPage(p)} />
              </div>
            </div>
          </SegmentContent>

          {/* 按部门 - 仅 OneID 模式显示 */}
          {hasOneid && (
            <SegmentContent value="department">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#A3A3A3]">汇总所选时间范围内各部门的消耗，按总 Tokens 降序排序</p>
                <div className="flex items-center gap-2">
                  <TokenDepartmentFilter
                    departments={MOCK_DEPARTMENTS}
                    value={deptFilter}
                    onChange={(v) => { setDeptFilter(v); setDeptPage(1); }}
                  />
                  <UITooltip>
                    <UITooltipTrigger asChild>
                      <Button
                        variant="claw-outline"
                        size="icon"
                        className="w-9 h-9"
                        onClick={handleExportDept}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </UITooltipTrigger>
                    <UITooltipContent side="top" className="text-xs">导出列表</UITooltipContent>
                  </UITooltip>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
               >
                <Table variant="elevated-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead>部门名称</TableHead>
                      <TableHead>所属路径</TableHead>
                      <TableHead>总请求数</TableHead>
                      <TableHead>输入 Tokens</TableHead>
                      <TableHead>输出 Tokens</TableHead>
                      <TableHead>总 Tokens</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deptPaged.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-[#A3A3A3] py-12">暂无数据</TableCell></TableRow>
                    ) : deptPaged.map((d) => (
                      <TableRow key={d.departmentId}>
                        <TableCell className="font-medium">{d.departmentName}</TableCell>
                        <TableCell className="text-sm text-[#737373]">{d.path.replace(/\//g, " / ")}</TableCell>
                        <TableCell>{fmt(d.requests)}</TableCell>
                        <TableCell>{fmt(d.inputTokens)}</TableCell>
                        <TableCell>{fmt(d.outputTokens)}</TableCell>
                        <TableCell className="font-medium">{fmt(d.totalTokens)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-4 py-2 border-t border-gray-200">
                  <Pagination total={deptStats.length} current={deptPage} pageSize={PAGE_SIZE} showTotal={(total) => `共 ${total} 条记录`} className="w-full justify-between" onChange={(p) => setDeptPage(p)} />
                </div>
              </div>
            </SegmentContent>
          )}

          {/* 按分组 */}
          <SegmentContent value="group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#A3A3A3]">汇总所选时间范围内各分组的消耗，按总 Tokens 降序排序</p>
              <div className="flex items-center gap-2">
                <TokenGroupFilter
                  groups={groupTree}
                  value={groupFilter}
                  onChange={(v) => { setGroupFilter(v); setGroupPage(1); }}
                />
                <UITooltip>
                  <UITooltipTrigger asChild>
                    <Button
                      variant="claw-outline"
                      size="icon"
                      className="w-9 h-9"
                      onClick={handleExportGroup}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </UITooltipTrigger>
                  <UITooltipContent side="top" className="text-xs">导出列表</UITooltipContent>
                </UITooltip>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
             >
              <Table variant="elevated-white">
                <TableHeader>
                  <TableRow>
                    <TableHead>分组名称</TableHead>
                    <TableHead>总请求数</TableHead>
                    <TableHead>输入 Tokens</TableHead>
                    <TableHead>输出 Tokens</TableHead>
                    <TableHead>总 Tokens</TableHead>
                    {IS_GLOBAL_BY_GROUP && (
                      <TableHead className="whitespace-nowrap">{globalTokenTimeDim === "daily" ? "今日全局配额消耗" : "本月全局配额消耗"}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupPaged.length === 0 ? (
                    <TableRow><TableCell colSpan={IS_GLOBAL_BY_GROUP ? 6 : 5} className="text-center text-sm text-[#A3A3A3] py-12">暂无数据</TableCell></TableRow>
                  ) : groupPaged.map((g) => {
                    const q = IS_GLOBAL_BY_GROUP ? getGroupQuotaInfo(g) : null;
                    return (
                      <TableRow key={g.groupId}>
                        <TableCell className="font-medium">{g.groupName}</TableCell>
                        <TableCell>{fmt(g.requests)}</TableCell>
                        <TableCell>{fmt(g.inputTokens)}</TableCell>
                        <TableCell>{fmt(g.outputTokens)}</TableCell>
                        <TableCell className="font-medium">{fmt(g.totalTokens)}</TableCell>
                        {IS_GLOBAL_BY_GROUP && q && (
                          <TableCell className="text-sm">
                            {q.unlimited ? (
                              <span className="text-xs font-semibold text-[#355EF1] bg-[#e0e9ff] px-2 py-1 rounded-[4px]">无限制</span>
                            ) : (
                              <UITooltip>
                                <UITooltipTrigger asChild>
                                  <span className="cursor-default text-[#09090b] font-medium tabular-nums">
                                    {q.pct.toFixed(1)}%
                                  </span>
                                </UITooltipTrigger>
                                <UITooltipContent side="top" className="text-xs">
                                  {fmt(q.consumed)} / {q.limit !== null ? fmt(q.limit) : "—"}
                                </UITooltipContent>
                              </UITooltip>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="px-4 py-2 border-t border-gray-200">
                <Pagination total={groupStats.length} current={groupPage} pageSize={PAGE_SIZE} showTotal={(total) => `共 ${total} 条记录`} className="w-full justify-between" onChange={(p) => setGroupPage(p)} />
              </div>
            </div>
          </SegmentContent>

          {/* 按会话 */}
          <SegmentContent value="session">
            {!clsEnabled && (
              <>
                {/* CLS 提示弹框 */}
                <div className="bg-white border border-gray-200 rounded-[4px] p-6 mb-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">Tokens 监控（按会话）需要开启 CLS 日志服务</h3>
                      <p className="text-xs text-[#737373]">开启后，为您赠送3个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 500台 Agent 机器3个月的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-[#355EF1] hover:underline inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
                    </div>
                    <Button
                      onClick={handleOpenCLS}
                      disabled={isEnablingCls}
                      className="ml-4 text-xs h-8 px-4 whitespace-nowrap flex-shrink-0"
                    >
                      {isEnablingCls ? "开启中..." : "开启 CLS 日志服务"}
                    </Button>
                  </div>
                </div>

                {/* CLS 协议确认弹窗 */}
                <Dialog open={showClsAgreementDialog} onOpenChange={setShowClsAgreementDialog}>
                  <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>确认免费额度</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="cls-agreement"
                          checked={clsAgreed}
                          onCheckedChange={(checked) => setClsAgreed(checked === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="cls-agreement" className="text-sm text-[#525252] cursor-pointer flex-1 font-normal leading-relaxed">
                          为您赠送三个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 700 台 Agent 机器的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-[#355EF1] hover:text-[#355EF1] inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a>
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowClsAgreementDialog(false);
                          setClsAgreed(false);
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        variant="dialog-confirm"
                        onClick={handleConfirmClsAgreement}
                        disabled={!clsAgreed || isEnablingCls}
                      >
                        {isEnablingCls ? "开启中..." : "确认"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* 卡片功能展示 */}
                <div className="space-y-4 mb-8">
                  {/* 第一块：当前页可获得的会话数据 */}
                  <div className="bg-white border border-gray-200 rounded-[4px] px-6 py-5">
                    <h4 className="text-[14px] font-medium text-[#737373] mb-4">开启CLS日志服务后您可以在此处获得以下会话数据：</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      {[
                        {
                          id: "high-cost-session",
                          title: "高Token会话实时分析与管控",
                          description: "聚焦 TOP 会话的 Token 消耗、轮次分布与耗时特征，精准定位高Token交互，优化模型调用成本与资源效率",
                          iconSrc: "/assets/admin-session-management/high-token-session-control.svg",
                        },
                        {
                          id: "single-session-cost",
                          title: "单会话全链路Token透视",
                          description: "拆解每轮交互的 Token 流量与耗时分布，可视化工具调用与上下文膨胀对成本的影响",
                          iconSrc: "/assets/admin-session-management/single-session-token-insight.svg",
                        },
                      ].map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-[14px] py-5"
                        >
                          <img src={card.iconSrc} alt="" className="shrink-0 w-9 h-9" />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">
                              {card.title}
                            </h5>
                            <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 第二块：运维观测和会话管理中可获得的数据 */}
                  <div className="bg-white border border-gray-200 rounded-[4px] px-6 py-5">
                    <h4 className="text-[14px] font-medium text-[#737373] mb-4">开启CLS日志服务后您还可以在运维观测和会话管理页面中获得以下观测数据：</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      {[
                        {
                          id: "log-metrics-insight",
                          title: "应用日志与 OTEL 指标全景洞察",
                          description: "多维度分析日志级别与模块分布，精细化追踪消息处理、队列状态与执行耗时",
                          iconSrc: "/assets/admin-session-management/app-log-otel-insight.svg",
                        },
                        {
                          id: "session-efficiency",
                          title: "会话详情与交互效率精细化分析",
                          description: "聚焦单会话 Token 消耗，可视化渠道与模型分布特征，精准定位高Token会话，优化资源配置与调用效率",
                          iconSrc: "/assets/admin-session-management/session-detail-analysis.svg",
                        },
                        {
                          id: "health-monitoring",
                          title: "业务运行健康度实时监控",
                          description: "聚焦消息处理总量、入队效率与卡死会话，保障系统稳定运行",
                          iconSrc: "/assets/admin-session-management/business-health-monitoring.svg",
                        },
                        {
                          id: "session-global-monitoring",
                          title: "会话全局运行态势监控",
                          description: "聚合总会话数、平均轮次与工具调用量，多维度洞察渠道与模型分布，实现会话全生命周期可追溯、可分析",
                          iconSrc: "/assets/admin-session-management/session-global-monitoring.svg",
                        },
                      ].map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-[14px] py-5"
                        >
                          <img src={card.iconSrc} alt="" className="shrink-0 w-9 h-9" />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">
                              {card.title}
                            </h5>
                            <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-[4px] px-4 py-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-md">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <p className="text-sm font-medium text-green-800">CLS 日志服务开启成功</p>
                  </div>
                </div>
              </div>
            )}
            {clsEnabled && (
              <>

              {/* 顶部工具栏：左侧 Agent 下拉 + 提示文案；右侧 升级CLS / 关闭CLS / 下载 */}
              <div className="flex items-center justify-between mb-4 gap-4">
                {/* 左侧：Agent 名称筛选 + 提示文案 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <AgentCombobox
                    value={selectedAgent}
                    onValueChange={setSelectedAgent}
                    className="w-[240px]"
                  />
                  <p className="text-xs text-[#A3A3A3] truncate">全部会话已按 tokens 排序，点击可查看会话详情</p>
                </div>
                 {/* 右侧：下载 / 关闭CLS（次级）/ 升级CLS（主按钮）— 同档 32px 高度 */}
                <div className="flex items-center gap-2 shrink-0">
                  <UITooltip>
                    <UITooltipTrigger asChild>
                      <Button
                        variant="claw-outline"
                        size="icon-sm"
                        onClick={handleExportSession}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </UITooltipTrigger>
                    <UITooltipContent side="top" className="text-xs">导出列表</UITooltipContent>
                  </UITooltip>
                  <Button
                    onClick={() => setShowCloseClsConfirm(true)}
                    variant="claw-outline"
                    size="claw-sm"
                  >
                    关闭CLS服务
                  </Button>
                  <Button
                    onClick={() => setShowPluginUpgradeDialog(true)}
                    variant="claw-primary"
                    size="claw-sm"
                  >
                    升级CLS采集插件
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
               >
                <Table variant="elevated-white" scrollX={1400}>
                  <TableHeader>
                    <TableRow>
                      <TableHead fixed="left">会话</TableHead>
                      <TableHead>渠道</TableHead>
                      <TableHead>模型</TableHead>
                      <TableHead>最后活动时间</TableHead>
                      <TableHead>轮次</TableHead>
                      <TableHead>TOKENS</TableHead>
                      <TableHead>成本</TableHead>
                      <TableHead>耗时</TableHead>
                      <TableHead fixed="right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionPaged.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center text-sm text-[#A3A3A3] py-12">暂无数据</TableCell></TableRow>
                    ) : sessionPaged.map((s) => {
                      return (
                      <TableRow key={s.sessionId} className="cursor-pointer" onClick={() => navigate(`/admin/session/${s.sessionId}`)}>
                        <TableCell fixed="left">
                          <div className="text-sm">{s.sessionName}</div>
                          <div className="text-xs text-[#A3A3A3] font-mono mt-0.5">{s.sessionId}</div>
                        </TableCell>
                        <TableCell>{s.channel}</TableCell>
                        <TableCell>{s.model}</TableCell>
                        <TableCell className="text-[#737373]">{s.lastActiveTime}</TableCell>
                        <TableCell>{s.rounds}</TableCell>
                        <TableCell className="font-mono">{(s.tokens / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="font-mono">${s.cost.toFixed(4)}</TableCell>
                        <TableCell className="text-[#737373]">{s.duration}</TableCell>
                        <TableActionCell fixed="right">
                          <Button
                            variant="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/session/${s.sessionId}`);
                            }}
                          >
                            查看详情
                          </Button>
                        </TableActionCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="px-4 py-2 border-t border-gray-200">
                  <Pagination total={sessionStats.length} current={sessionPage} pageSize={PAGE_SIZE} showTotal={(total) => `共 ${total} 条记录`} className="w-full justify-between" onChange={(p) => setSessionPage(p)} />
                </div>
              </div>
              </>
            )}
          </SegmentContent>
        </Segment>

      {/* CLS 授权 Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>开通服务授权</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            {!isCheckingAuth && !authCompleted && (
              <p className="text-sm text-[#525252]">开启CLS日志服务后您可以获取会话数据和观测数据</p>
            )}
            <div className="space-y-3 flex flex-col items-center min-h-16 justify-center">
              {isCheckingAuth ? (
                <>
                  {/* 检测中的旋转动画 */}
                  <div className="w-8 h-8 border-2 border-[#355EF1] border-t-[#355EF1] rounded-full animate-spin"></div>
                  <p className="text-xs text-[#737373] text-center">检测中...</p>
                </>
              ) : authCompleted ? (
                <>
                  {/* 检测完成后显示完成 icon */}
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-xs text-[#737373] text-center">检测到已授权</p>
                </>
              ) : null}
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelAuth}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleGoToAuth}
            >
              前往授权
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 免费额度 Dialog */}
      <Dialog open={showFreeQuotaDialog} onOpenChange={setShowFreeQuotaDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>开启CLS日志服务-免费额度说明</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <Alert variant="info">
              <AlertOperationInfoIcon />
              <AlertDescription>
                为您赠送<span className="font-semibold text-[#355EF1]">3个月</span>ClawPro 专属 CLS 日志服务免费额度（共<span className="font-semibold text-[#355EF1]">3000U</span>），预估可覆盖 <span className="font-semibold text-[#355EF1]">500台</span> Agent 机器<span className="font-semibold text-[#355EF1]">3个月</span>的日志用量；超过免费额度达到上限或<span className="font-semibold text-[#355EF1]">3个月</span>到期后，CLS 将按量计费。计费详情请参考{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoToCalcDetail();
                  }}
                  className="text-[#355EF1] hover:text-[#355EF1] underline"
                >
                  计费详情
                </a>
                。
              </AlertDescription>
            </Alert>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id="free-quota-agreement"
                checked={freeQuotaAgreed}
                onCheckedChange={(checked) => setFreeQuotaAgreed(checked === true)}
              />
              <Label htmlFor="free-quota-agreement" className="text-sm text-[#525252] cursor-pointer font-normal">我已阅读并同意免费额度说明</Label>
            </label>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelFreeQuota}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleConfirmFreeQuota}
              disabled={!freeQuotaAgreed}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关闭CLS服务 - 警示弹窗 */}
      <AlertDialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={handleCloseClsConfirmCancel}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">确定要关闭 CLS 日志服务吗？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-sm text-[#0A0A0A]">
                  关闭后以下功能将无法使用，<span className="text-[#DC2626]">此操作可能影响业务运行。</span>
                </p>
                <Alert variant="warning">
                  <AlertOperationInfoIcon />
                  <AlertTitle>受影响的功能</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><span className="font-medium">运维观测：</span>支持通过全链路性能监控采集核心运行指标</li>
                      <li><span className="font-medium">会话管理：</span>支持通过会话总览、会话链下钻还原及渠道模型分布分析</li>
                      <li><span className="font-medium">Tokens 监控（按会话）：</span>支持从按会话、消息维度查看 tokens、费用使用情况</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <SurfaceInner
                  className="p-3 cursor-pointer transition-colors hover:bg-[#FAFAFA]"
                  role="button"
                  tabIndex={0}
                  onClick={() => setDeleteLogTopic((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDeleteLogTopic((prev) => !prev);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="deleteLogTopic"
                      checked={deleteLogTopic}
                      onCheckedChange={(checked) => setDeleteLogTopic(checked === true)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor="deleteLogTopic"
                        className="text-sm font-medium text-[#0A0A0A] cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        同时删除关联的日志主题资源
                      </Label>
                      <p className="text-sm text-[#525252] leading-relaxed">
                        勾选后将永久删除该日志主题及所有日志数据，
                        <span className="text-[#DC2626]">数据不可恢复</span>
                        ；未删除则会持续产生存储费用。
                      </p>
                    </div>
                  </div>
                </SurfaceInner>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseClsConfirmCancel}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseCls}
              disabled={isClosingCls}
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CLS 采集插件升级对话框 - 普通弹窗 */}
      <Dialog open={showPluginUpgradeDialog} onOpenChange={setShowPluginUpgradeDialog}>
        <DialogContent
          className="sm:max-w-[720px]"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader>
            <DialogTitle>升级 CLS 采集插件</DialogTitle>
            <DialogDescription>选择要升级的版本并查看更新内容</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="rounded-[4px] border border-gray-200 overflow-hidden">
              <RadioGroup
                value={selectedPluginVersion?.version ?? ""}
                onValueChange={(val) => {
                  const v = CLS_PLUGIN_VERSIONS.find((x) => x.version === val);
                  if (v) setSelectedPluginVersion(v);
                }}
                className="contents"
              >
              <Table density="compact" autoFixedColumns={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 40 }} />
                    <TableHead style={{ width: 100 }}>版本号</TableHead>
                    <TableHead>更新内容</TableHead>
                    <TableHead style={{ width: 120 }}>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLS_PLUGIN_VERSIONS.map((v) => {
                    const isUpgradeable = v.status !== 'current' && v.status !== 'deprecated';
                    return (
                      <TableRow
                        key={v.version}
                        onClick={() => isUpgradeable && setSelectedPluginVersion(v)}
                        className={isUpgradeable ? "cursor-pointer" : "cursor-default"}
                      >
                        <TableCell>
                          <RadioGroupItem
                            value={v.version}
                            disabled={!isUpgradeable}
                            aria-label={`选择版本 ${v.version}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{v.version}</TableCell>
                        <TableCell className="text-[#525252]">{v.changelog}</TableCell>
                        <TableCell>
                          {v.status === 'current' && <StatusTag mode="text" variant="green">当前版本</StatusTag>}
                          {v.status === 'deprecated' && <StatusTag mode="text" variant="gray">已弃用</StatusTag>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </RadioGroup>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPluginUpgradeDialog(false);
                setSelectedPluginVersion(null);
              }}
              disabled={isUpgradingPlugin}
            >
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setIsUpgradingPlugin(true);
                setTimeout(() => {
                  setIsUpgradingPlugin(false);
                  setShowPluginUpgradeDialog(false);
                  if (selectedPluginVersion) {
                    toast.success(`成功升级到 ${selectedPluginVersion?.version}`);
                  }
                }, 2000);
              }}
              disabled={isUpgradingPlugin || !selectedPluginVersion || selectedPluginVersion?.status === 'current'}
            >
              {isUpgradingPlugin ? "升级中..." : "确认升级"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
