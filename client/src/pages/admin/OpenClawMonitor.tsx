/**
 * AgentList - 管控端 Agent 列表页
 * 4 个模块：状态统计卡片、状态列+列头筛选、操作列、监控抽屉面板
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActionCell } from "@/components/ui/table";
import { SurfaceCard, SurfaceOverlay } from "@/components/ui/Surface";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { StatusTag } from "@/components/ui/status-tag";
import {
  BodyMedium,
  BodyText,
  CodeText,
  MetaMedium,
  MetaText,
  MiniBodyText,
  PanelTitle,
} from "@/components/ui/Typography";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Search, Trash2, ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
  Terminal, Power, MoreHorizontal, RotateCcw, HardDriveDownload,
  Activity, Loader2, ExternalLink, ChevronDown, Filter, HelpCircle, X, Eye, EyeOff,
  Server, CheckCircle2, PowerOff, Layers, ArrowUp, ArrowDown, Zap, BarChart3,
  MessageCircle, RotateCw, Check, ArrowLeftRight, CircleArrowUp, Tag, Info,
  Pencil, Plus, Minus, CircleAlert,
  TerminalSquare, ListChecks, History as HistoryIcon,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { MOCK_DEPARTMENTS, MOCK_CLAWS_WITH_DEPT, type DepartmentNode } from "@/lib/mockData";
import { CHANNEL_OPTIONS, type ChannelConfig } from "@/lib/agentConfigConstants";
import { useAdminModels, CUSTOM_PROVIDER_VALUE, type ModelRow } from "@/lib/modelConfigStore";
import {
  loadBuiltinChannelVisibility,
  loadVisibleCustomChannels,
  onBuiltinChannelVisibilityChange,
  onCustomChannelsChange,
  type CustomChannel as AdminCustomChannel,
} from "@/lib/customChannelStore";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { DepartmentColumnFilter, GroupColumnFilter } from "@/components/admin/ColumnFilters";
import { MOCK_GROUPS, MOCK_MANUAL_GROUPS, MOCK_USERS, MOCK_USERS_MANUAL } from "./MemberManagement/mock";
import type { UserGroup, GroupSource } from "./MemberManagement/types";
import { buildGroupTree, type GroupTreeNode } from "./MemberManagement/health";
import DispatchCommandDialog from "./VersionManagement/components/DispatchCommandDialog";
import NewVersionPushNotice from "./ImageManagement/NewVersionPushNotice";
import UpdateRecordsDrawer, { type PushableItem } from "./ImageManagement/UpdateRecordsDrawer";
import { useOutdatedTypes } from "./BatchUpdateNotice";

type ClawStatus = "creating" | "createFail" | "running" | "loading" | "loadFail" | "shutdown" | "maintaining" | "pending" | "upgrading";
const LATEST_VERSION = "2026.4.2";

const OTHER_STATUS_GROUPS = [
  {
    title: "需关注",
    items: [
      { label: "创建失败", variant: "red" as const },
      { label: "加载失败", variant: "red" as const },
      { label: "维护中", variant: "gray" as const },
      { label: "待处理", variant: "gray" as const },
    ],
  },
  {
    title: "处理中",
    items: [
      { label: "创建中", variant: "blue" as const },
      { label: "加载中", variant: "blue" as const },
    ],
  },
] as const;

interface PluginVersions {
  wechat: string;
  dingtalk: string;
  feishu: string;
  wecom: string;
  qq: string;
}

interface Claw {
  id: string;
  instanceId: string;
  name: string;
  creator: string;
  createTime: string;
  status: ClawStatus;
  version: string;
  agentType: 'OpenClaw' | 'Hermes' | 'LightclawACE';
  pluginVersions: PluginVersions;
  department?: string;
  departmentId?: string;
  tags?: { key: string; value: string }[];
}

const STATUS_CONFIG: Record<ClawStatus, {
  label: string;
  badgeClass: string;       // 复用 index.css 中的 badge-* class
  dotColor: string;         // 小圆点颜色
  tagVariant: "green" | "blue" | "red" | "gray";  // StatusTag variant
  spinning?: boolean;       // 是否用旋转圆圈替代实心圆点
}> = {
  creating:    { label: "创建中",   badgeClass: "badge-loading",  dotColor: "bg-blue-500", tagVariant: "blue" },
  createFail:  { label: "创建失败", badgeClass: "badge-stopped",  dotColor: "bg-red-500", tagVariant: "red" },
  running:     { label: "运行中",   badgeClass: "badge-running",  dotColor: "bg-green-500", tagVariant: "green" },
  loading:     { label: "加载中",   badgeClass: "badge-loading",  dotColor: "bg-blue-500", tagVariant: "blue" },
  loadFail:    { label: "加载失败", badgeClass: "badge-stopped",  dotColor: "bg-red-500", tagVariant: "red" },
  shutdown:    { label: "已关机",   badgeClass: "badge-shutdown", dotColor: "bg-gray-400", tagVariant: "gray" },
  maintaining: { label: "维护中",   badgeClass: "badge-pending",  dotColor: "bg-orange-500", tagVariant: "blue" },
  pending:     { label: "待处理",   badgeClass: "badge-pending",  dotColor: "bg-orange-500", tagVariant: "gray" },
  upgrading:   { label: "升级中",   badgeClass: "badge-loading",  dotColor: "bg-blue-500", tagVariant: "blue" },
};

const DEFAULT_PLUGIN_VERSIONS: PluginVersions = { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" };

// Agent 类型显示名称映射
const AGENT_TYPE_DISPLAY: Record<string, string> = {
  'OpenClaw':    'OpenClaw',
  'Hermes':      'Hermes Agent',
  'LightclawACE': 'LightClaw ACE',
};

const MOCK_CLAWS: Claw[] = [
  { id: "1",  instanceId: "ins-g71c6vud", name: "Alice的技术助手", tags: [{ key: "所属产品", value: "gpulab" }, { key: "env", value: "production" }],    creator: "alice@acompany.com",  createTime: "2025-12-01 09:12:34", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "2",  instanceId: "ins-h92d7xwe", name: "Bob工作助手",       creator: "bob@acompany.com",    createTime: "2025-12-15 14:05:22", status: "running",     version: "2026.4.2",  agentType: "Hermes",      pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "3",  instanceId: "ins-j14e8yvf", name: "Carol的研究助手",   creator: "carol@acompany.com",  createTime: "2026-01-05 10:33:47", status: "shutdown",   version: "2026.3.28", agentType: "LightclawACE", pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "4",  instanceId: "ins-k25f9zwg", name: "Dave的代码助手", tags: [{ key: "test", value: "test2" }],    creator: "dave@acompany.com",   createTime: "2026-01-20 16:48:09", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.1.5", dingtalk: "2.7.2", feishu: "1.4.8", wecom: "2.0.9", qq: "1.0.1" } },
  { id: "5",  instanceId: "ins-l36g0axh", name: "Eve的写作助手",     creator: "eve@acompany.com",    createTime: "2026-02-10 08:21:55", status: "createFail", version: "2026.3.28", agentType: "Hermes",      pluginVersions: DEFAULT_PLUGIN_VERSIONS },
  { id: "6",  instanceId: "ins-m47h1byi", name: "Frank的数据助手",   creator: "frank@acompany.com",  createTime: "2026-02-18 11:07:30", status: "running",     version: "2026.4.2",  agentType: "OpenClaw",    pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "7",  instanceId: "ins-n58i2czj", name: "Grace的翻译助手",   creator: "grace@acompany.com",  createTime: "2026-02-25 15:44:18", status: "creating",   version: "2026.3.28", agentType: "LightclawACE", pluginVersions: DEFAULT_PLUGIN_VERSIONS },
  { id: "8",  instanceId: "ins-o69j3dak", name: "Henry的销售助手", tags: [{ key: "所属产品", value: "gpulab" }, { key: "team", value: "sales" }, { key: "env", value: "staging" }],   creator: "henry@acompany.com",  createTime: "2026-03-01 09:58:03", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "9",  instanceId: "ins-p70k4ebl", name: "Ivy的客服助手",     creator: "ivy@acompany.com",    createTime: "2026-03-05 13:26:41", status: "running",     version: "2026.4.2",  agentType: "Hermes",      pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "10", instanceId: "ins-q81l5fcm", name: "Jack的会议助手",    creator: "jack@acompany.com",   createTime: "2026-03-08 17:02:15", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.0", dingtalk: "2.8.0", feishu: "1.5.2", wecom: "2.1.3", qq: "1.0.2" } },
  { id: "11", instanceId: "ins-r92m6gdn", name: "Karen的报告助手",   creator: "karen@acompany.com",  createTime: "2026-03-09 10:15:50", status: "loadFail",   version: "2026.3.28", agentType: "LightclawACE", pluginVersions: DEFAULT_PLUGIN_VERSIONS },
  { id: "12", instanceId: "ins-s03n7heo", name: "Leo的项目助手", tags: [{ key: "tencentcloud:autoscaling", value: "asg-1f7z0pa9" }],     creator: "leo@acompany.com",    createTime: "2026-03-10 08:39:27", status: "running",     version: "2026.4.2",  agentType: "OpenClaw",    pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "13", instanceId: "ins-t14o8ipf", name: "Mia的新助手",        creator: "mia@acompany.com",    createTime: "2026-03-12 11:00:00", status: "maintaining", version: "2026.3.28", agentType: "Hermes",      pluginVersions: DEFAULT_PLUGIN_VERSIONS },
  { id: "14", instanceId: "ins-u25p9jqg", name: "Noah的分析助手",    creator: "noah@acompany.com",   createTime: "2026-03-13 14:30:00", status: "pending",    version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: DEFAULT_PLUGIN_VERSIONS },
  { id: "15", instanceId: "ins-v36q0krh", name: "Olivia的运营助手",  creator: "olivia@acompany.com",  createTime: "2026-03-14 09:00:00", status: "running",     version: "2026.4.2",  agentType: "LightclawACE", pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "16", instanceId: "ins-w47r1lsi", name: "Peter的财务助手",  creator: "peter@acompany.com",   createTime: "2026-03-15 10:20:00", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "17", instanceId: "ins-x58s2mtj", name: "Quinn的法务助手",  creator: "quinn@acompany.com",   createTime: "2026-03-16 11:45:00", status: "running",     version: "2026.4.2",  agentType: "Hermes",      pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "18", instanceId: "ins-y69t3nuk", name: "Rachel的HR助手",      creator: "rachel@acompany.com",  createTime: "2026-03-17 13:10:00", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "19", instanceId: "ins-z70u4ovl", name: "Sam的产品助手",    creator: "sam@acompany.com",     createTime: "2026-03-18 14:30:00", status: "running",     version: "2026.4.2",  agentType: "LightclawACE", pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "20", instanceId: "ins-a81v5pwm", name: "Tina的客服助手",  creator: "tina@acompany.com",    createTime: "2026-03-19 15:00:00", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "21", instanceId: "ins-b92w6qxn", name: "Uma的设计助手",   creator: "uma@acompany.com",     createTime: "2026-03-20 09:30:00", status: "running",     version: "2026.4.2",  agentType: "Hermes",      pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "22", instanceId: "ins-c03x7ryo", name: "Victor的技术助手", creator: "victor@acompany.com",  createTime: "2026-03-21 10:00:00", status: "running",     version: "2026.3.28", agentType: "OpenClaw",    pluginVersions: { wechat: "3.2.1", dingtalk: "2.8.0", feishu: "1.5.3", wecom: "2.1.4", qq: "1.0.2" } },
  { id: "23", instanceId: "ins-d14y8szp", name: "这是一个名称非常非常长的智能助手用来测试超长文本截断效果", creator: "longname-user@very-long-domain-example.com", createTime: "2026-05-01 09:00:00", status: "running",     version: "2026.4.2",  agentType: "OpenClaw",    pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
  { id: "24", instanceId: "ins-e25z9taq", name: "GPULab产品线专属AI智能运营分析与决策支持系统", creator: "product-ops-admin@enterprise-acompany.com", createTime: "2026-05-02 10:30:00", status: "running",     version: "2026.4.2",  agentType: "Hermes",      pluginVersions: { wechat: "3.3.0", dingtalk: "2.9.1", feishu: "1.6.0", wecom: "2.2.0", qq: "1.1.0" } },
];

const PAGE_SIZE = 10;

// ─── 分组相关工具函数 ─────────────────────────────────────────────────────

/** 获取分组的完整路径（如 "产品组" 或 "研发组 / 前端"） */
function getGroupPath(groupId: string, groups: UserGroup[]): string {
  const map = new Map(groups.map((g) => [g.id, g]));
  const chain: string[] = [];
  let cur = map.get(groupId);
  while (cur) {
    chain.unshift(cur.name);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return chain.join(" / ");
}

/** 按 source 分桶标题 */
const GROUP_SOURCE_LABELS: Record<GroupSource, string> = {
  "oneid-dept": "部门",
  "oneid-group": "自定义分组",
  manual: "自定义分组",
};

/** 获取某 agent creator 的所有部门路径（OneID 模式，主部门排首位） */
function getCreatorDeptPaths(creator: string): Array<{ path: string; isPrimary: boolean }> {
  const user = MOCK_USERS.find((u) => u.userId === creator);
  if (!user) return [];
  const deptGroupIds = user.groupIds.filter((gid) => {
    const g = MOCK_GROUPS.find((g) => g.id === gid);
    return g?.source === "oneid-dept";
  });
  if (deptGroupIds.length === 0) return [];
  return deptGroupIds
    .map((gid) => ({
      path: getGroupPath(gid, MOCK_GROUPS),
      isPrimary: gid === user.primaryGroupId,
    }))
    .sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));
}

/** 获取某 agent creator 对应的分组信息（OneID 模式，只返回一个） */
function getCreatorGroupItemOneid(creator: string): { id: string; path: string; kind: "oneid-dept" | "oneid-group" } | null {
  const user = MOCK_USERS.find((u) => u.userId === creator);
  if (!user) return null;
  // 优先取 oneid-group（自定义分组），其次取 oneid-dept（部门）
  let deptItem: { id: string; path: string; kind: "oneid-dept" | "oneid-group" } | null = null;
  for (const gid of user.groupIds) {
    const g = MOCK_GROUPS.find((g) => g.id === gid);
    if (!g) continue;
    if (g.source === "oneid-group") {
      return { id: gid, path: getGroupPath(gid, MOCK_GROUPS), kind: "oneid-group" };
    }
    if (g.source === "oneid-dept" && !deptItem) {
      deptItem = { id: gid, path: getGroupPath(gid, MOCK_GROUPS), kind: "oneid-dept" };
    }
  }
  return deptItem;
}

/** 获取某 agent creator 对应的分组信息（普通模式，只返回一个） */
function getCreatorGroupItemManual(creator: string): { id: string; path: string } | null {
  const user = MOCK_USERS_MANUAL.find((u) => u.userId === creator);
  if (!user || user.groupIds.length === 0) return null;
  const gid = user.groupIds[0];
  return { id: gid, path: getGroupPath(gid, MOCK_MANUAL_GROUPS) };
}

/** 获取某 agent creator 所属的所有分组 id（含子孙逻辑：选中某分组时，其用户应该被命中） */
function getCreatorAllGroupIds(creator: string, hasOneid: boolean): string[] {
  if (hasOneid) {
    const user = MOCK_USERS.find((u) => u.userId === creator);
    return user ? user.groupIds : [];
  } else {
    const user = MOCK_USERS_MANUAL.find((u) => u.userId === creator);
    return user ? user.groupIds : [];
  }
}

/** 获取节点及其所有子孙 ID */
function getGroupDescendantIds(node: GroupTreeNode): string[] {
  const ids: string[] = [node.id];
  node.children.forEach((c) => ids.push(...getGroupDescendantIds(c)));
  return ids;
}

// ─── 分组筛选树节点（递归） ──────────────────────────────────────────────
function GroupTreeNodeItem({
  node, level, selected, expanded, onToggle, onSelect,
}: {
  node: GroupTreeNode; level: number; selected: string;
  expanded: Set<string>; onToggle: (id: string) => void; onSelect: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${
          isSelected ? "bg-[#f4f4f5] text-[#0A0A0A] font-medium" : "text-[#334155] hover:bg-[#f4f4f5]"
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
      {hasChildren && isExpanded && node.children.map((child) => (
        <GroupTreeNodeItem key={child.id} node={child} level={level + 1}
          selected={selected} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ─── 分组筛选弹出框 ─────────────────────────────────────────────────────
function InstanceGroupFilter({
  groups, value, onChange, hasOneid,
}: {
  groups: UserGroup[]; value: string; onChange: (v: string) => void; hasOneid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { if (open) { setTempValue(value); setSearchQuery(""); } }, [open, value]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const handleConfirm = () => { onChange(tempValue); setOpen(false); };
  const handleCancel = () => { setTempValue(value); setOpen(false); };

  // 按 source 分桶构建树
  const { activeSources, treesMap } = useMemo(() => {
    if (hasOneid) {
      const buckets: Record<string, UserGroup[]> = { "oneid-dept": [], "oneid-group": [] };
      groups.forEach((g) => { if (buckets[g.source]) buckets[g.source].push(g); });
      const order: GroupSource[] = ["oneid-dept", "oneid-group"];
      const active = order.filter((s) => (buckets[s] || []).length > 0);
      const tMap: Record<string, GroupTreeNode[]> = {};
      active.forEach((s) => { tMap[s] = buildGroupTree(buckets[s]); });
      return { activeSources: active, treesMap: tMap };
    } else {
      const trees = buildGroupTree(groups);
      return { activeSources: ["manual" as GroupSource], treesMap: { manual: trees } };
    }
  }, [groups, hasOneid]);

  // 搜索过滤
  const matchedIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return new Set(
      groups.filter((g) => g.name.toLowerCase().includes(q) || getGroupPath(g.id, groups).toLowerCase().includes(q)).map((g) => g.id)
    );
  }, [searchQuery, groups]);

  const isNodeVisible = (node: GroupTreeNode): boolean => {
    if (!matchedIds) return true;
    if (matchedIds.has(node.id)) return true;
    return node.children.some(isNodeVisible);
  };

  // 找到选中节点名称
  const selectedGroup = tempValue ? groups.find((g) => g.id === tempValue) : undefined;
  const triggerGroup = value ? groups.find((g) => g.id === value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox"
          className={`w-[120px] justify-between bg-white text-sm font-normal hover:bg-white border-[#E4E4E4] hover:border-[#355EF1] data-[state=open]:border-[#355EF1] ${
            triggerGroup ? "text-[#0A0A0A]" : "text-[#A3A3A3]"
          }`}>
          <span className="truncate">{triggerGroup?.name || "全部分组"}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        {/* 搜索 */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索分组"
              className="w-full h-8 pl-8 pr-3 text-sm border border-[#E4E4E4] rounded-[4px] focus:outline-none focus:border-[#355EF1] transition-colors"
            />
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto px-2 pb-2">
          {/* 全部分组 */}
          <div className={`flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${
            tempValue === "" ? "bg-[#f4f4f5]" : "hover:bg-[#f4f4f5]"
          }`} onClick={() => setTempValue("")}>
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#0A0A0A] font-medium" : "text-[#334155]"}`}>全部分组</span>
            {tempValue === "" && <Check className="w-4 h-4 text-[#0A0A0A] flex-shrink-0" />}
          </div>
          {/* 按 source 分区展示 */}
          {activeSources.map((source) => (
            <div key={source}>
              {hasOneid && (
                <div className="px-2 pt-3 pb-1">
                  <span className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
                    {GROUP_SOURCE_LABELS[source]}
                  </span>
                </div>
              )}
              {(treesMap[source] || []).map((root) =>
                isNodeVisible(root) ? (
                  <GroupTreeNodeItem key={root.id} node={root} level={0}
                    selected={tempValue} expanded={expanded} onToggle={toggleExpand} onSelect={setTempValue} />
                ) : null
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-[#f0f0f0] px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 text-xs text-[#737373] truncate">
            {selectedGroup ? getGroupPath(selectedGroup.id, groups) : "全部分组"}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="claw-outline" size="claw-sm" className="h-7 px-3 text-xs"
              onClick={handleCancel}>取消</Button>
            <Button variant="claw-primary" size="claw-sm" className="h-7 px-3 text-xs"
              onClick={handleConfirm}>确认</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 部门树节点（递归）──────────────────────────────────────────────────────
function InstanceDepartmentTreeNode({
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
          isSelected ? "bg-[#f4f4f5] text-[#0A0A0A] font-medium" : "text-[#334155] hover:bg-[#f4f4f5]"
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
        <InstanceDepartmentTreeNode key={child.id} node={child} level={level + 1}
          selected={selected} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ─── 部门筛选弹出框（Agent 列表页用） ──────────────────────────────────────
function InstanceDepartmentFilter({
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
          className={`w-[120px] justify-between bg-white text-sm font-normal hover:bg-white data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50 ${
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
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#355EF1] font-medium" : "text-[#334155]"}`}>全部部门</span>
            {tempValue === "" && <Check className="w-4 h-4 text-[#355EF1] flex-shrink-0" />}
          </div>
          {departments.map((dept) => (
            <InstanceDepartmentTreeNode key={dept.id} node={dept} level={0}
              selected={tempValue} expanded={expanded} onToggle={toggleExpand} onSelect={setTempValue} />
          ))}
        </div>
        <div className="border-t border-[#e5e5e5] px-3 py-2 flex items-center justify-between gap-2">
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
              onClick={handleConfirm}>确认</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


export default function AgentMonitor() {
  const [, setLocation] = useLocation();
  const { hasOneid } = useAdminMode();
  const [claws, setClaws] = useState<Claw[]>(() => {
    if (hasOneid) {
      // MOCK_CLAWS_WITH_DEPT 缺少 agentType/version/pluginVersions/tags，从 MOCK_CLAWS 补充
      const clawMap = new Map(MOCK_CLAWS.map((c) => [c.id, c]));
      return (MOCK_CLAWS_WITH_DEPT as any[]).map((d) => {
        const base = clawMap.get(d.id);
        return {
          ...d,
          agentType: base?.agentType ?? "OpenClaw",
          version: base?.version ?? "2026.3.28",
          pluginVersions: base?.pluginVersions ?? DEFAULT_PLUGIN_VERSIONS,
          tags: base?.tags,
        } as Claw;
      }).sort((a, b) => b.createTime.localeCompare(a.createTime));
    }
    return [...MOCK_CLAWS].sort((a, b) => b.createTime.localeCompare(a.createTime));
  });
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const ALL_AGENT_TYPES = Object.keys(AGENT_TYPE_DISPLAY);
  const [agentTypeFilter, setAgentTypeFilter] = useState<Set<string>>(new Set(ALL_AGENT_TYPES));

  // 列头筛选弹窗状态
  const [deptColFilterOpen, setDeptColFilterOpen] = useState(false);
  const [groupColFilterOpen, setGroupColFilterOpen] = useState(false);
  const [typeColFilterOpen, setTypeColFilterOpen] = useState(false);
  const [tempTypeFilter, setTempTypeFilter] = useState<Set<string>>(new Set());

  // 状态卡片筛选
  const [activeCardFilter, setActiveCardFilter] = useState<"all" | "running" | "shutdown" | "other">("all");

  // 状态列筛选
  const ALL_STATUSES: ClawStatus[] = ["creating", "createFail", "running", "loading", "loadFail", "shutdown", "maintaining", "pending"];
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ClawStatus>>(new Set(ALL_STATUSES));
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [filterPosition, setFilterPosition] = useState<{ top: number; left: number } | null>(null);

  // 表格横向滚动 — 仅保留祖先 flex 容器 min-width:0 兜底，固定列/阴影由全局 Table 组件提供
  const tableScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    // 给 flex 父容器加 min-width:0 防止 table 撑开页面
    let parent = el.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (style.display === 'flex' || style.display === 'inline-flex') {
        // 给 flex 容器的子元素（main）加约束
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          if (child.tagName === 'MAIN' || getComputedStyle(child).flex !== '0 1 auto') {
            child.style.minWidth = '0';
            child.style.overflow = 'hidden';
          }
        }
        break;
      }
      parent = parent.parentElement;
    }
  }, []);

  // 操作对话框
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [shutdownTarget, setShutdownTarget] = useState<string | null>(null);
  const [reinstallTarget, setReinstallTarget] = useState<string | null>(null);
  const [reinstallInput, setReinstallInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [batchDeleteInput, setBatchDeleteInput] = useState("");

  // 批量更新
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchUpgradeDialog, setShowBatchUpgradeDialog] = useState(false);
  // 「版本更新记录」侧边栏（点击新版本推送提醒打开）
  const [showUpdateRecordsDrawer, setShowUpdateRecordsDrawer] = useState(false);
  // 批量升级失败结果弹窗
  const [showUpgradeResultDialog, setShowUpgradeResultDialog] = useState(false);
  const [upgradeFailedAgents, setUpgradeFailedAgents] = useState<{ name: string; instanceId: string; agentType: string; reason: string }[]>([]);

  // 命令下发弹窗（取代旧抽屉）
  // dispatchPresetIds = null 表示 Dialog 关闭；非 null（即使是空数组）表示打开。
  // 通过工具栏「命令下发」按钮触发：勾选了实例则预填，否则为空，进入「先选命令再选实例」流程。
  const [dispatchPresetIds, setDispatchPresetIds] = useState<string[] | null>(null);

  // 配置默认标签
  interface TencentTag { key: string; value: string; }
  // 标签键 -> 可选值列表（模拟腾讯云标签库）
  const tagKeyValues: Record<string, string[]> = {
    'qcs:tag:thpc:node:creator':      ['alice', 'bob', 'charlie'],
    'qcs:tag:thpc:node:clusterId':    ['cluster-001', 'cluster-002'],
    'qcs:tag:thpc:node:nodeId':       ['node-a1', 'node-b2', 'node-c3'],
    'qcs:tag:thpc:workspace:creator': ['alice', 'dave'],
    'kaijian':                        ['kaijian', 'test'],
    'acs:tag:createdby':              ['system', 'user'],
    'tke_managed_by':                 ['tke', 'manual'],
    'niumengtao':                     ['体验', '正式', '测试'],
    '所属产品':                        ['gpulab', 'openclaw', 'tke'],
    'env':                            ['production', 'staging', 'dev'],
    '负责人':                          ['alice', 'bob', 'charlie'],
    '业务线':                          ['AI', 'Platform', 'Infra'],
  };
  const tagKeys = Object.keys(tagKeyValues);
  const [showTagConfigDialog, setShowTagConfigDialog] = useState(false);
  // 已确认的标签列表（key-value 对）
  const [selectedTags, setSelectedTags] = useState<TencentTag[]>([]);
  // 弹窗内编辑行（每行 key/value 可独立设置）
  const [editingTagRows, setEditingTagRows] = useState<TencentTag[]>([{ key: '', value: '' }]);
  // 各行下拉框搜索/开关状态（key 为行索引）
  const [tagKeySearchByRow, setTagKeySearchByRow] = useState<Record<number, string>>({});
  const [tagKeyDropdownOpenByRow, setTagKeyDropdownOpenByRow] = useState<Record<number, boolean>>({});
  const [tagValueDropdownOpenByRow, setTagValueDropdownOpenByRow] = useState<Record<number, boolean>>({});


  // 版本列筛选

  // 判断某实例是否可更新（仅运行中）
  const isUpgradable = (claw: Claw) => claw.status === "running";

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      // 全选勾选当前筛选结果的所有页所有实例，不限状态
      if (checked) { allFilteredIds.forEach(id => next.add(id)); }
      else { allFilteredIds.forEach(id => next.delete(id)); }
      return next;
    });
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  // agentType 映射：Claw 中的 agentType → ImageManagement 中的 agentType
  const CLAW_TO_IMAGE_AGENT_TYPE: Record<string, string> = {
    'OpenClaw':    'OpenClaw',
    'Hermes':      'HermesAgent',
    'LightclawACE': 'LightClawACE',
  };
  const confirmBatchUpgrade = () => {
    const ids = Array.from(selectedIds);
    const selectedClaws = claws.filter(c => ids.includes(c.id));
    // 读取镜像管理中的生效镜像（若 localStorage 为空，使用默认公共镜像，全部生效）
    let images: { agentType: string; active: boolean }[] = [];
    try {
      const raw = localStorage.getItem('admin_images');
      if (raw) {
        images = JSON.parse(raw);
      } else {
        // 默认公共镜像全部生效
        images = [
          { agentType: 'OpenClaw',    active: true },
          { agentType: 'HermesAgent', active: true },
          { agentType: 'LightClawACE', active: true },
        ];
      }
    } catch { /* ignore */ }
    // 统计每种 agentType 是否有生效镜像
    const activeImageTypes = new Set(images.filter(i => i.active).map(i => i.agentType));
    // 分组：可升级 vs 无法升级
    const failed: { name: string; instanceId: string; agentType: string; reason: string }[] = [];
    const upgradableIds: string[] = [];
    for (const c of selectedClaws) {
      const imageAgentType = CLAW_TO_IMAGE_AGENT_TYPE[c.agentType] ?? c.agentType;
      if (!activeImageTypes.has(imageAgentType)) {
        failed.push({ name: c.name, instanceId: c.instanceId, agentType: c.agentType, reason: `当前没有生效的 ${c.agentType} 镜像，以下 agent 无法升级` });
      } else {
        upgradableIds.push(c.id);
      }
    }
    setShowBatchUpgradeDialog(false);
    if (failed.length > 0) {
      setUpgradeFailedAgents(failed);
      setShowUpgradeResultDialog(true);
    }
    if (upgradableIds.length > 0) {
      setClaws(prev => prev.map(c => upgradableIds.includes(c.id) ? { ...c, status: 'upgrading' as ClawStatus } : c));
      setSelectedIds(new Set());
      toast.success(`已开始升级 ${upgradableIds.length} 个实例`);
    } else if (failed.length === 0) {
      setSelectedIds(new Set());
    }
  };

  // 详情抽屉
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // 监控抽屉
  const [showMonitorDrawer, setShowMonitorDrawer] = useState(false);
  const [selectedClaw, setSelectedClaw] = useState<Claw | null>(null);
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });

  // 监听 localStorage 变化，实现跨页面同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "globalClsEnabled") {
        setClsEnabled(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 计算统计数据
  const countByStatus = (status: ClawStatus | ClawStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return claws.filter(c => statuses.includes(c.status)).length;
  };

  const totalCount = claws.length;
  const runningCount = countByStatus("running");
  const shutdownCount = countByStatus("shutdown");
  const otherCount = countByStatus(["creating", "loading", "createFail", "loadFail", "maintaining", "pending"]);

  // 根据卡片筛选限制状态列筛选的可选项
  const getAvailableStatuses = (): ClawStatus[] => {
    switch (activeCardFilter) {
      case "running": return ["running"];
      case "shutdown": return ["shutdown"];
      case "other": return ["creating", "loading", "createFail", "loadFail", "maintaining", "pending"];
      case "all": return ["creating", "createFail", "running", "loading", "loadFail", "shutdown", "maintaining", "pending"];
    }
  };

  const handleCardFilterChange = (filter: "all" | "running" | "shutdown" | "other") => {
    setActiveCardFilter(filter);
    setPage(1);
    // 重置状态列筛选为当前卡片允许的全选状态
    const availableStatuses: ClawStatus[] = (() => {
      switch (filter) {
        case "running": return ["running"];
        case "shutdown": return ["shutdown"];
        case "other": return ["creating", "loading", "createFail", "loadFail", "maintaining", "pending"];
        case "all": return ["creating", "createFail", "running", "loading", "loadFail", "shutdown", "maintaining", "pending"];
      }
    })();
    setSelectedStatuses(new Set(availableStatuses));
  };

  const handleStatusFilterChange = (status: ClawStatus, checked: boolean) => {
    const newStatuses = new Set(selectedStatuses);
    if (checked) {
      newStatuses.add(status);
    } else {
      newStatuses.delete(status);
    }
    setSelectedStatuses(newStatuses);
  };

  const handleStatusFilterReset = () => {
    const available = getAvailableStatuses();
    setSelectedStatuses(new Set(available));
  };

  const handleStatusFilterConfirm = () => {
    setShowStatusFilter(false);
    setPage(1);
  };

  // 筛选逻辑
  const timeFiltered = claws.filter((c) => {
    const matchFrom = !dateFrom || c.createTime >= dateFrom;
    const matchTo = !dateTo || c.createTime <= dateTo;
    return matchFrom && matchTo;
  });

  const searchFiltered = timeFiltered.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.creator.includes(search) || c.instanceId.includes(search);
    return matchSearch;
  });

  // 部门筛选（OneID 模式）
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

  const deptFiltered = hasOneid ? searchFiltered.filter((c) => {
    if (!departmentFilter) return true;
    const allowedIds = findDeptAndChildren(MOCK_DEPARTMENTS, departmentFilter);
    return c.departmentId ? allowedIds.includes(c.departmentId) : false;
  }) : searchFiltered;

  // 分组筛选
  const groupFiltered = deptFiltered.filter((c) => {
    if (!groupFilter) return true;
    const currentGroups = hasOneid ? MOCK_GROUPS : MOCK_MANUAL_GROUPS;
    const trees = buildGroupTree(currentGroups);
    // 找到选中分组节点及其所有子孙 id
    const findNode = (nodes: GroupTreeNode[], id: string): GroupTreeNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        const hit = findNode(n.children, id);
        if (hit) return hit;
      }
      return null;
    };
    const targetNode = findNode(trees, groupFilter);
    if (!targetNode) return true;
    const allowedGroupIds = new Set(getGroupDescendantIds(targetNode));
    // 检查 agent 创建者是否属于这些分组
    const creatorGroupIds = getCreatorAllGroupIds(c.creator, hasOneid);
    return creatorGroupIds.some((gid) => allowedGroupIds.has(gid));
  });

  // Agent 类型筛选
  const typeFiltered = groupFiltered.filter((c) => {
    if (agentTypeFilter.size === 0 || agentTypeFilter.size === ALL_AGENT_TYPES.length) return true;
    return agentTypeFilter.has(c.agentType);
  });

  const cardFiltered = typeFiltered.filter((c) => {
    switch (activeCardFilter) {
      case "running": return c.status === "running";
      case "shutdown": return c.status === "shutdown";
      case "other": return ["creating", "loading", "createFail", "loadFail", "maintaining", "pending"].includes(c.status);
      case "all": return true;
    }
  });

  const statusFiltered = cardFiltered.filter((c) => {
    if (selectedStatuses.size === 0 || selectedStatuses.size === ALL_STATUSES.length) return true;
    return selectedStatuses.has(c.status);
  });


  const versionFiltered = statusFiltered;

  const totalPages = Math.max(1, Math.ceil(versionFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = versionFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // 当前页是否存在任何带标签的实例；若全无标签则整列（表头 + 单元格）隐藏
  const hasAnyTagColumn = paginated.some((c) => c.tags && c.tags.length > 0);

  // 当前页所有实例 id
  const pageIds = paginated.map(c => c.id);
  // 全筛选结果的所有 id（全选范围）
  const allFilteredIds = versionFiltered.map(c => c.id);
  // 全选状态：当前筛选结果所有实例全部被勾选
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.has(id));
  // 部分勾选：有且仅有部分实例被勾选（不显示 indeterminate，直接显示未勾选）
  const isIndeterminate = false;

  // 批量更新按钮禁用逻辑
  const selectedCount = selectedIds.size;
  const selectedClaws = claws.filter(c => selectedIds.has(c.id));
  const hasNonRunning = selectedClaws.some(c => !isUpgradable(c));
  const hasNonAgent = selectedClaws.some(c => c.agentType !== 'OpenClaw');
  const batchDisabled = selectedCount === 0 || selectedCount > 20 || hasNonRunning || hasNonAgent;
  const batchDeleteDisabled = selectedCount === 0;
  const batchTooltip = selectedCount === 0
    ? '请先选择实例'
    : selectedCount > 20
    ? '批量更新数量不可大丠20'
    : hasNonAgent
    ? '仅OpenClaw支持更新'
    : hasNonRunning
    ? '仅运行中的实例支持更新'
    : '';

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("列表已刷新");
    }, 1000);
  };

  const handleOpenTerminal = (claw: Claw) => {
    window.open(`/terminal/${claw.id}`, "_blank");
  };

  const handleRestart = (claw: Claw) => {
    toast.success(`正在重启 ${claw.name}...`);
  };

  const handleReinstallClick = (claw: Claw) => {
    setReinstallTarget(claw.id);
    setReinstallInput("");
  };

  const confirmReinstall = () => {
    if (!reinstallTarget) return;
    const claw = claws.find(c => c.id === reinstallTarget);
    setClaws(claws.map(c => c.id === reinstallTarget ? { ...c, status: "running" as ClawStatus } : c));
    setReinstallTarget(null);
    setReinstallInput("");
    toast.success(`正在重新安装 ${claw?.name}...`);
  };

  const confirmShutdown = () => {
    if (!shutdownTarget) return;
    const claw = claws.find(c => c.id === shutdownTarget);
    setClaws(claws.map(c => c.id === shutdownTarget ? { ...c, status: "shutdown" as ClawStatus } : c));
    setShutdownTarget(null);
    toast.success(`已关机 ${claw?.name}`);
  };

  const handleDeleteClick = (claw: Claw) => {
    setDeleteTarget(claw.id);
    setDeleteInput("");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const claw = claws.find(c => c.id === deleteTarget);
    setClaws(claws.filter(c => c.id !== deleteTarget));
    setDeleteTarget(null);
    setDeleteInput("");
    toast.success(`已删除 ${claw?.name}`);
  };

  // ── Agent 详情抽屉数据（可编辑） ─────────────────────────────────────────
  // 每个 claw 一份独立详情，编辑后保留在内存（管控端 demo 不持久化）。

  /** 已接入通道：除了基本展示字段，还保留一份凭证录入值 */
  interface ConnectedChannel {
    /** 通道展示名，与 CHANNEL_OPTIONS.label 对应，作为唯一标识 */
    name: string;
    /** 通道 value（CHANNEL_OPTIONS.value），便于反查 fields 定义 */
    value: string;
    /** 凭证字段值：按 ChannelField.key 存储 */
    fieldValues: Record<string, string>;
    bots: string[];
  }

  /**
   * 单条已应用模型：对应"模型配置"页中的一条记录。
   * - modelConfigId：关联管控端模型表 id；被删除/隐藏时按 Q3(c) 完全无感处理，仍用冗余字段展示
   * - providerLabel / versionLabel：展示态冗余，避免管控端模型变更后失去展示文案
   * - isCustom：是否自定义模型（展示"自定义模型"一级文案 + 小字为模型名）
   * - primary：是否主模型；整个列表至多一条 primary=true
   */
  interface AppliedModelItem {
    id: number;
    modelConfigId: string;
    providerLabel: string;
    versionLabel: string;
    isCustom: boolean;
    primary: boolean;
    addedAt: number;
  }

  interface ClawDetail {
    /** 已应用模型列表：可能为空（无模型）、只主、主+备 */
    appliedModels: AppliedModelItem[];
    /** 已接入通道列表 */
    connectedChannels: ConnectedChannel[];
    installedSkills: string[];
  }

  /** 基于 clawId 稳定分布，模拟三种场景：hash%3 → 0=空 / 1=只主 / 2=主+备 */
  const hashClawId = (s: string): number => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const buildDefaultClawDetail = (clawId: string): ClawDetail => {
    const scenario = hashClawId(clawId) % 3;
    const baseTs = Date.now();
    const appliedModels: AppliedModelItem[] =
      scenario === 0
        ? []
        : scenario === 1
        ? [
            {
              id: 1,
              modelConfigId: "1",
              providerLabel: "腾讯云 DeepSeek",
              versionLabel: "DeepSeek V3 0324",
              isCustom: false,
              primary: true,
              addedAt: baseTs,
            },
          ]
        : [
            {
              id: 1,
              modelConfigId: "1",
              providerLabel: "腾讯云 DeepSeek",
              versionLabel: "DeepSeek V3 0324",
              isCustom: false,
              primary: true,
              addedAt: baseTs,
            },
            {
              id: 2,
              modelConfigId: "2",
              providerLabel: "腾讯混元",
              versionLabel: "Hunyuan Turbo",
              isCustom: false,
              primary: false,
              addedAt: baseTs - 60_000,
            },
          ];
    return {
      appliedModels,
      connectedChannels: [
        { name: "飞书", value: "feishu", fieldValues: { appId: "cli_a1b2c3", appSecret: "fsk_xxxxxx" }, bots: [] },
      ],
      installedSkills: [
        "feishu-doc", "feishu-drive", "feishu-perm", "feishu-wiki",
        "feishu-calendar", "feishu-message", "feishu-task",
      ],
    };
  };

  const [clawDetailMap, setClawDetailMap] = useState<Record<string, ClawDetail>>({});

  /** 读取某个 claw 的详情（不存在则按 clawId hash 生成默认快照，不写入 map 以避免 render 期间 setState） */
  const getClawDetail = (clawId: string): ClawDetail => {
    return clawDetailMap[clawId] ?? buildDefaultClawDetail(clawId);
  };

  /** 用 updater 形式更新某个 claw 的详情，缺失时基于默认值初始化 */
  const updateClawDetail = (
    clawId: string,
    updater: (prev: ClawDetail) => ClawDetail,
  ) => {
    setClawDetailMap(prev => {
      const current = prev[clawId] ?? buildDefaultClawDetail(clawId);
      return { ...prev, [clawId]: updater(current) };
    });
  };

  /** 生成下一个模型 entry id：取当前列表最大 id + 1 */
  const nextModelEntryId = (list: AppliedModelItem[]): number => {
    return list.reduce((max, m) => (m.id > max ? m.id : max), 0) + 1;
  };

  // ── 订阅"模型配置"页的数据（仅 visible=true 的对外可见） ───────────────────
  const adminModels = useAdminModels();
  const visibleAdminModels = useMemo(() => adminModels.filter(m => m.visible), [adminModels]);

  /**
   * 把可见模型按"厂商"分组：
   *   - 普通厂商：按 provider 分组，组 key = provider，组 label = 同 provider 第一条 name
   *   - 自定义模型（provider === __custom__）：聚合到单一"自定义模型"组下，每条作为一个版本
   * 厂商一级显示顺序：先按出现顺序，自定义模型组始终放最后。
   */
  interface ProviderGroup {
    key: string;           // provider 值；自定义模型组固定为 __custom__
    label: string;         // 一级 Select 显示文本
    models: ModelRow[];    // 该厂商下所有可见模型记录
    isCustom: boolean;
  }

  const providerGroups = useMemo<ProviderGroup[]>(() => {
    const orderedKeys: string[] = [];
    const buckets = new Map<string, ModelRow[]>();
    for (const m of visibleAdminModels) {
      const key = m.provider;
      if (!buckets.has(key)) {
        buckets.set(key, []);
        orderedKeys.push(key);
      }
      buckets.get(key)!.push(m);
    }
    const groups: ProviderGroup[] = [];
    let customGroup: ProviderGroup | null = null;
    for (const key of orderedKeys) {
      const models = buckets.get(key)!;
      if (key === CUSTOM_PROVIDER_VALUE) {
        customGroup = {
          key,
          label: "自定义模型",
          models,
          isCustom: true,
        };
      } else {
        groups.push({
          key,
          // 同 provider 的多条记录 name 理论上一致，取第一条
          label: models[0].name,
          models,
          isCustom: false,
        });
      }
    }
    if (customGroup) groups.push(customGroup);
    return groups;
  }, [visibleAdminModels]);

  // ── 模型编辑态 ───────────────────────────────────────────────────────────
  /**
   * 模型编辑上下文：
   * - idle：未进入编辑态
   * - add：点击右上角"添加备选/设为主模型"按钮 → 底部 inline 新增卡
   * - replace：点击某条模型行的 ✏️ → 底部 inline 卡用于替换该条
   */
  type ModelActionContext =
    | { kind: "idle" }
    | { kind: "add" }
    | { kind: "replace"; modelEntryId: number };
  const [modelAction, setModelAction] = useState<ModelActionContext>({ kind: "idle" });
  const modelEditing = modelAction.kind !== "idle";

  /** 一级草稿：厂商 key（即 provider 值） */
  const [modelDraftProvider, setModelDraftProvider] = useState<string>("");
  /** 二级草稿：具体模型记录 id */
  const [modelDraftModelId, setModelDraftModelId] = useState<string>("");

  /** 模型操作二次确认弹窗（复用用户端三种类型） */
  const [modelConfirmDialog, setModelConfirmDialog] = useState<{
    open: boolean;
    type: "set-primary" | "delete" | "delete-backup";
    modelEntryId: number | null;
  }>({ open: false, type: "set-primary", modelEntryId: null });

  /** 把一个管控端 ModelRow + 其所在组转换成 AppliedModelItem 的展示字段 */
  const toAppliedModelFields = (
    group: ProviderGroup,
    model: ModelRow,
  ): Pick<AppliedModelItem, "modelConfigId" | "providerLabel" | "versionLabel" | "isCustom"> => ({
    modelConfigId: model.id,
    providerLabel: group.label,
    // 自定义模型：一级展示"自定义模型"，二级用模型 name；普通模型二级用 version
    versionLabel: group.isCustom ? model.name : model.version,
    isCustom: group.isCustom,
  });

  /** 进入"添加"模式：默认草稿回填首组首项 */
  const startAddModel = () => {
    if (providerGroups.length === 0) {
      setModelDraftProvider("");
      setModelDraftModelId("");
      setModelAction({ kind: "add" });
      return;
    }
    const g0 = providerGroups[0];
    setModelDraftProvider(g0.key);
    setModelDraftModelId(g0.models[0]?.id ?? "");
    setModelAction({ kind: "add" });
  };

  /** 进入"替换"模式：按被替换条目当前的 modelConfigId 回填；找不到则回退首组首项 */
  const startReplaceModel = (entry: AppliedModelItem) => {
    if (providerGroups.length === 0) {
      setModelDraftProvider("");
      setModelDraftModelId("");
      setModelAction({ kind: "replace", modelEntryId: entry.id });
      return;
    }
    let targetGroup: ProviderGroup | undefined;
    let targetModel: ModelRow | undefined;
    for (const g of providerGroups) {
      const m = g.models.find(x => x.id === entry.modelConfigId);
      if (m) { targetGroup = g; targetModel = m; break; }
    }
    if (!targetGroup || !targetModel) {
      targetGroup = providerGroups[0];
      targetModel = targetGroup.models[0];
    }
    setModelDraftProvider(targetGroup.key);
    setModelDraftModelId(targetModel.id);
    setModelAction({ kind: "replace", modelEntryId: entry.id });
  };

  const cancelEditModel = () => setModelAction({ kind: "idle" });

  const saveEditModel = () => {
    if (!selectedClaw) return;
    const group = providerGroups.find(g => g.key === modelDraftProvider);
    const model = group?.models.find(m => m.id === modelDraftModelId);
    if (!group || !model) {
      toast.error("请选择有效的模型厂商和版本");
      return;
    }
    const fields = toAppliedModelFields(group, model);
    const action = modelAction;
    const current = getClawDetail(selectedClaw.id);
    const list = current.appliedModels;
    // 重复校验：同一条模型配置不可重复添加（替换时允许命中自己）
    const dupe = list.find(m => m.modelConfigId === fields.modelConfigId
      && !(action.kind === "replace" && m.id === action.modelEntryId));
    if (dupe) {
      toast.error("该模型已在列表中，请勿重复添加");
      return;
    }
    const hadPrimaryBefore = list.some(m => m.primary);
    updateClawDetail(selectedClaw.id, prev => {
      if (action.kind === "add") {
        const hasPrimary = prev.appliedModels.some(m => m.primary);
        const newEntry: AppliedModelItem = {
          id: nextModelEntryId(prev.appliedModels),
          ...fields,
          // 无主模型时新加的直接成为主模型；否则作为备选
          primary: !hasPrimary,
          addedAt: Date.now(),
        };
        return { ...prev, appliedModels: [...prev.appliedModels, newEntry] };
      }
      if (action.kind === "replace") {
        return {
          ...prev,
          appliedModels: prev.appliedModels.map(m => m.id === action.modelEntryId
            ? { ...m, ...fields }
            : m),
        };
      }
      return prev;
    });
    const _isOpenClawSave = selectedClaw?.agentType === 'OpenClaw';
    if (action.kind === "add") {
      toast.success(hadPrimaryBefore ? "备选模型已添加" : (_isOpenClawSave ? "已设为主模型" : "模型已添加成功"));
    } else {
      toast.success("模型已更新");
    }
    setModelAction({ kind: "idle" });
  };

  /** 切换一级厂商时，把二级草稿重置为该厂商的第一项 */
  const handleDraftProviderChange = (value: string) => {
    setModelDraftProvider(value);
    const group = providerGroups.find(g => g.key === value);
    if (group && group.models.length > 0) {
      setModelDraftModelId(group.models[0].id);
    } else {
      setModelDraftModelId("");
    }
  };

  /** 确认二次确认 Dialog 的操作 */
  const runModelConfirm = () => {
    if (!selectedClaw) return;
    const { type, modelEntryId } = modelConfirmDialog;
    if (modelEntryId === null) {
      setModelConfirmDialog(prev => ({ ...prev, open: false }));
      return;
    }
    updateClawDetail(selectedClaw.id, prev => {
      const list = prev.appliedModels;
      if (type === "set-primary") {
        return {
          ...prev,
          appliedModels: list.map(m => ({ ...m, primary: m.id === modelEntryId })),
        };
      }
      if (type === "delete-backup") {
        return { ...prev, appliedModels: list.filter(m => m.id !== modelEntryId) };
      }
      // type === "delete" (主模型)：删除后首条备选自动升主
      const next = list.filter(m => m.id !== modelEntryId);
      const wasPrimary = list.find(m => m.id === modelEntryId)?.primary ?? false;
      if (wasPrimary && next.length > 0 && !next.some(m => m.primary)) {
        next[0] = { ...next[0], primary: true };
      }
      return { ...prev, appliedModels: next };
    });
    setModelConfirmDialog(prev => ({ ...prev, open: false }));
    // 如果当前正在替换的正是被删除的这条，取消编辑态
    if (modelAction.kind === "replace" && modelAction.modelEntryId === modelEntryId) {
      setModelAction({ kind: "idle" });
    }
    const _isOpenClaw = selectedClaw?.agentType === 'OpenClaw';
    if (type === "set-primary") toast.success("已设为主模型");
    else if (type === "delete-backup") toast.success("备选模型已删除");
    else toast.success(_isOpenClaw ? "主模型已删除，已自动升级备选模型" : "模型删除成功");
  };

  // ── 通道编辑态 ───────────────────────────────────────────────────────────
  /** 是否处于"新增通道"模式（展示底部 inline 选择条） */
  const [channelAdding, setChannelAdding] = useState(false);
  const [channelDraft, setChannelDraft] = useState<string>("");
  /** 新增通道时正在录入的凭证字段值 */
  const [channelDraftFields, setChannelDraftFields] = useState<Record<string, string>>({});
  /** 待移除的通道 name（触发 AlertDialog 二次确认） */
  const [channelRemoveTarget, setChannelRemoveTarget] = useState<string | null>(null);
  /** 当前展开查看/编辑凭证的通道 name（null 表示全部收起） */
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  /** 当前展开通道的编辑草稿值；null 表示未进入编辑态（只读查看） */
  const [channelEditDraft, setChannelEditDraft] = useState<Record<string, string> | null>(null);
  /** 密码字段可见性：用 "channelName:fieldKey" 作为 key */
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (channelName: string, fieldKey: string) => {
    const key = `${channelName}:${fieldKey}`;
    setVisibleSecrets(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isSecretVisible = (channelName: string, fieldKey: string): boolean => {
    return visibleSecrets.has(`${channelName}:${fieldKey}`);
  };

  /** 加密显示：保留前 3 字符，后面用 •••••• 替代 */
  const maskSecret = (val: string): string => {
    if (!val) return "—";
    if (val.length <= 3) return val;
    return val.slice(0, 3) + "••••••";
  };

  // ── 订阅"通道配置"页的可见性数据 ─────────────────────────────────────────
  const [builtinChannelVisibility, setBuiltinChannelVisibility] = useState<Record<string, boolean>>(
    () => loadBuiltinChannelVisibility(),
  );
  useEffect(() => {
    return onBuiltinChannelVisibilityChange(() => {
      setBuiltinChannelVisibility(loadBuiltinChannelVisibility());
    });
  }, []);

  const [visibleCustomChannels, setVisibleCustomChannels] = useState<AdminCustomChannel[]>(
    () => loadVisibleCustomChannels(),
  );
  useEffect(() => {
    return onCustomChannelsChange(() => {
      setVisibleCustomChannels(loadVisibleCustomChannels());
    });
  }, []);

  /**
   * 用户/Agent 可见的通道列表（内置 + 自定义）。
   *   - 内置通道：用 builtinId 或 value 查 builtinChannelVisibility，缺省按 true 处理
   *   - 自定义通道：来自管控端"通道配置"页，且 visible=true（loadVisibleCustomChannels 已过滤）
   */
  const availableChannelOptions = useMemo<ChannelConfig[]>(() => {
    const builtins = CHANNEL_OPTIONS.filter((ch) => {
      const key = ch.builtinId ?? ch.value;
      return builtinChannelVisibility[key] !== false;
    });
    const customs: ChannelConfig[] = visibleCustomChannels.map((cc) => ({
      value: `admin_custom_${cc.id}`,
      label: cc.name,
      descText: `企业自定义通道（Channel ID: ${cc.channelId}）`,
      detailUrl: "#",
      adminCustomMode: true as const,
      adminCustomId: cc.id,
      fields: cc.credentialFields.map((f) => ({
        key: f.key || f.id,
        label: f.label,
        secret: true,
      })),
    }));
    return [...builtins, ...customs];
  }, [builtinChannelVisibility, visibleCustomChannels]);

  /**
   * 通道反查表：用 channel.value 查 ChannelConfig（含 fields 定义）
   * - 内置通道：6 个全集（包括当前不可见的，避免已添加通道行失去字段定义）
   * - 自定义通道：所有"可见"的（loadVisibleCustomChannels 已过滤；不可见的暂不反查）
   * 注：现实场景中，自定义通道一旦被删除，已添加到 Agent 的同名通道将无 fields 元数据。
   */
  const channelLookup = useMemo<Map<string, ChannelConfig>>(() => {
    const map = new Map<string, ChannelConfig>();
    for (const ch of CHANNEL_OPTIONS) map.set(ch.value, ch);
    for (const ch of availableChannelOptions) {
      if (ch.adminCustomMode) map.set(ch.value, ch);
    }
    return map;
  }, [availableChannelOptions]);

  const startAddChannel = (detail: ClawDetail) => {
    // 默认选中第一个尚未被添加的通道；全部已添加时留空
    const existing = new Set(detail.connectedChannels.map(c => c.name));
    const firstAvailable = availableChannelOptions.find(c => !existing.has(c.label));
    setChannelDraft(firstAvailable?.value ?? "");
    setChannelDraftFields({});
    setChannelAdding(true);
    setExpandedChannel(null); // 收起已展开的通道，避免视觉混乱
    setChannelEditDraft(null);
  };

  const cancelAddChannel = () => {
    setChannelAdding(false);
    setChannelDraft("");
    setChannelDraftFields({});
  };

  /** 切换新增草稿中选择的通道 */
  const handleChannelDraftChange = (value: string) => {
    setChannelDraft(value);
    setChannelDraftFields({});
  };

  const confirmAddChannel = () => {
    if (!selectedClaw) return;
    const ch = availableChannelOptions.find(c => c.value === channelDraft);
    if (!ch) {
      toast.error("请选择要添加的通道");
      return;
    }
    const detail = getClawDetail(selectedClaw.id);
    if (detail.connectedChannels.some(c => c.name === ch.label)) {
      toast.error(`「${ch.label}」已添加，请勿重复`);
      return;
    }
    // 校验 fields（如有）必须填齐
    const requiredFields = ch.fields ?? [];
    const missing = requiredFields.find(f => !(channelDraftFields[f.key] ?? "").trim());
    if (missing) {
      toast.error(`请填写「${missing.label}」`);
      return;
    }
    updateClawDetail(selectedClaw.id, prev => ({
      ...prev,
      connectedChannels: [
        ...prev.connectedChannels,
        {
          name: ch.label,
          value: ch.value,
          fieldValues: { ...channelDraftFields },
          bots: [],
        },
      ],
    }));
    setChannelAdding(false);
    setChannelDraft("");
    setChannelDraftFields({});
    toast.success(`已添加通道「${ch.label}」`);
  };

  const confirmRemoveChannel = () => {
    if (!selectedClaw || !channelRemoveTarget) return;
    const targetName = channelRemoveTarget;
    updateClawDetail(selectedClaw.id, prev => ({
      ...prev,
      connectedChannels: prev.connectedChannels.filter(c => c.name !== targetName),
    }));
    // 如果被删除的通道正展开，顺手收起
    if (expandedChannel === targetName) {
      setExpandedChannel(null);
      setChannelEditDraft(null);
    }
    setChannelRemoveTarget(null);
    toast.success(`已移除通道「${targetName}」`);
  };

  /** 展开/收起某个通道的凭证展示区（同一时刻只展开一个） */
  const toggleExpandChannel = (channel: ConnectedChannel) => {
    if (expandedChannel === channel.name) {
      setExpandedChannel(null);
      setChannelEditDraft(null);
    } else {
      setExpandedChannel(channel.name);
      setChannelEditDraft(null); // 默认进入只读查看态
    }
  };

  /** 进入某个已接入通道的编辑态（只读 → 编辑） */
  const startEditChannel = (channel: ConnectedChannel) => {
    setExpandedChannel(channel.name);
    setChannelEditDraft({ ...channel.fieldValues });
  };

  const cancelEditChannel = () => {
    setChannelEditDraft(null);
  };

  const saveEditChannel = (channel: ConnectedChannel) => {
    if (!selectedClaw || !channelEditDraft) return;
    const chConfig = channelLookup.get(channel.value);
    const requiredFields = chConfig?.fields ?? [];
    const missing = requiredFields.find(f => !(channelEditDraft[f.key] ?? "").trim());
    if (missing) {
      toast.error(`请填写「${missing.label}」`);
      return;
    }
    updateClawDetail(selectedClaw.id, prev => ({
      ...prev,
      connectedChannels: prev.connectedChannels.map(c =>
        c.name === channel.name ? { ...c, fieldValues: { ...channelEditDraft } } : c,
      ),
    }));
    setChannelEditDraft(null);
    toast.success(`「${channel.name}」凭证已更新`);
  };

  const handleOpenDrawer = (claw: Claw) => {
    setSelectedClaw(claw);
    setShowDetailDrawer(true);
    // 切换实例时重置所有编辑态，避免上一个实例残留
    setModelAction({ kind: "idle" });
    setModelConfirmDialog({ open: false, type: "set-primary", modelEntryId: null });
    setChannelAdding(false);
    setChannelDraft("");
    setChannelDraftFields({});
    setExpandedChannel(null);
    setChannelEditDraft(null);
    setVisibleSecrets(new Set());
  };

  const handleRefreshDrawer = () => {
    if (!selectedClaw) return;
    setDrawerLoading(true);
    setTimeout(() => {
      setDrawerLoading(false);
      toast.success("信息已刷新");
    }, 1500);
  };

  const handleOpenMonitor = (claw: Claw) => {
    setSelectedClaw(claw);
    setShowMonitorDrawer(true);
  };

  const isStatusDisabled = (status: ClawStatus): boolean => {
    const available = getAvailableStatuses();
    return !available.includes(status);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="page-enter min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div className="shrink-0 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#0A0A0A] whitespace-nowrap">Agent 列表</h1>
              {/* 新版本推送提醒（点击打开版本更新记录侧边栏） */}
              <ImageUpdateBellEntry onClick={() => setShowUpdateRecordsDrawer(true)} />
            </div>
            <p className="text-sm text-[#737373] mt-1 whitespace-nowrap">查看和管理所有企业用户创建的 Agent 云服务器。</p>
          </div>
          <div className="flex items-center gap-2">
            <DatePicker
              value={dateFrom}
              onChange={(v) => { setDateFrom(v); setPage(1); }}
            />
            <span className="text-[#A3A3A3] text-sm">—</span>
            <DatePicker
              value={dateTo}
              onChange={(v) => { setDateTo(v); setPage(1); }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                className="h-9 px-3 text-sm rounded-[4px] border border-[#e5e5e5] bg-white text-[#737373] hover:text-[#355EF1] hover:border-[#355EF1] transition-colors whitespace-nowrap"
              >
                清除筛选
              </button>
            )}
            <Button
              variant="claw-outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              title="刷新列表"
              className="w-9 h-9"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* 状态统计卡片 */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          {/* 总数 */}
          <button
            onClick={() => handleCardFilterChange("all")}
            className={`bg-white rounded-[4px] border px-6 py-5 flex flex-col gap-4 text-left transition-colors ${
              activeCardFilter === "all" ? "border-[#1447E6]" : "border-[#E5E5E5] hover:border-[#1447E6]"
            }`}
          >
            <div className="flex items-center gap-1">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4375 2.1377C9.21415 2.1377 9.84375 2.76729 9.84375 3.54395V5.15625H14.4385C15.2151 5.15631 15.8447 5.78589 15.8447 6.5625V9.67383H16.5371C17.0031 9.67383 17.3809 10.0516 17.3809 10.5176C17.3807 10.9835 17.003 11.3613 16.5371 11.3613H15.8447V14.4375C15.8447 15.2141 15.2151 15.8437 14.4385 15.8438H3.55957C2.78303 15.8436 2.15332 15.2141 2.15332 14.4375V11.3613H1.46289C0.996982 11.3613 0.619273 10.9835 0.619141 10.5176C0.619141 10.0516 0.9969 9.67383 1.46289 9.67383H2.15332V6.5625C2.15332 5.78593 2.78303 5.15638 3.55957 5.15625H8.15625V3.8252H6.04688C5.58097 3.8252 5.20326 3.44732 5.20312 2.98145C5.20312 2.51546 5.58088 2.1377 6.04688 2.1377H8.4375ZM3.84082 14.1562H14.1572V6.84375H3.84082V14.1562ZM6.75 8.87109C7.21599 8.87109 7.59375 9.24885 7.59375 9.71484V11.29C7.59338 11.7557 7.21576 12.1338 6.75 12.1338C6.28424 12.1338 5.90662 11.7557 5.90625 11.29V9.71484C5.90625 9.24885 6.28401 8.87109 6.75 8.87109ZM11.25 8.87109C11.716 8.87109 12.0938 9.24885 12.0938 9.71484V11.29C12.0934 11.7557 11.7158 12.1338 11.25 12.1338C10.7842 12.1338 10.4066 11.7557 10.4062 11.29V9.71484C10.4062 9.24885 10.784 8.87109 11.25 8.87109Z" fill="url(#icon_total)"/><defs><linearGradient id="icon_total" x1="16" y1="16" x2="14" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor="#0080FF"/><stop offset="1" stopColor="#202020"/></linearGradient></defs></svg>
              <span className="text-sm font-medium text-[#0A0A0A] leading-[22px] tracking-[0.07px]">总数</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A] leading-normal" style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}>{totalCount}</p>
          </button>

          {/* 运行中 */}
          <button
            onClick={() => handleCardFilterChange("running")}
            className={`bg-white rounded-[4px] border px-6 py-5 flex flex-col gap-4 text-left transition-colors ${
              activeCardFilter === "running" ? "border-[#1447E6]" : "border-[#E5E5E5] hover:border-[#1447E6]"
            }`}
          >
            <div className="flex items-center gap-1">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.2998 1.6875C16.1697 1.6875 16.875 2.44302 16.875 3.375V11.8125C16.875 12.7445 16.1697 13.5 15.2998 13.5H9.84375V14.9062H12C12.466 14.9062 12.8438 15.284 12.8438 15.75C12.8438 16.216 12.466 16.5938 12 16.5938H6C5.53401 16.5938 5.15625 16.216 5.15625 15.75C5.15625 15.284 5.53401 14.9062 6 14.9062H8.15625V13.5H2.7002L2.53906 13.4912C1.74482 13.4048 1.125 12.6863 1.125 11.8125V3.375C1.125 2.50124 1.74482 1.78266 2.53906 1.69629L2.7002 1.6875H15.2998ZM2.8125 11.8125H15.1875V3.375H2.8125V11.8125ZM10.6533 5.40332C10.9828 5.07382 11.5172 5.07384 11.8467 5.40332C12.1762 5.73283 12.1762 6.26717 11.8467 6.59668L8.84668 9.59668C8.51717 9.92615 7.98282 9.92617 7.65332 9.59668L6.15332 8.09668C5.82385 7.76718 5.82386 7.23282 6.15332 6.90332C6.48282 6.57382 7.01717 6.57384 7.34668 6.90332L8.25 7.80664L10.6533 5.40332Z" fill="url(#icon_running)"/><defs><radialGradient id="icon_running" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.44798 9.14064) scale(13.427 563.02)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
              <span className="text-sm font-medium text-[#0A0A0A] leading-[22px] tracking-[0.07px]">运行中</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A] leading-normal" style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}>{runningCount}</p>
          </button>

          {/* 已关机 */}
          <button
            onClick={() => handleCardFilterChange("shutdown")}
            className={`bg-white rounded-[4px] border px-6 py-5 flex flex-col gap-4 text-left transition-colors ${
              activeCardFilter === "shutdown" ? "border-[#1447E6]" : "border-[#E5E5E5] hover:border-[#1447E6]"
            }`}
          >
            <div className="flex items-center gap-1">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.65345 2.38477C1.98295 2.05531 2.51732 2.05529 2.84681 2.38477L13.0011 12.5391L13.0021 12.5361L14.1974 13.7314L14.1964 13.7344L16.3468 15.8848C16.6762 16.2143 16.6762 16.7486 16.3468 17.0781C16.0173 17.4075 15.4829 17.4075 15.1534 17.0781L12.9142 14.8389C11.7646 15.6096 10.4045 16.0312 9.00013 16.0312C7.13536 16.0312 5.34705 15.2903 4.02845 13.9717C2.70984 12.6531 1.96888 10.8648 1.96888 9C1.96888 7.57678 2.40035 6.24293 3.19349 5.11816L1.65345 3.57812C1.32399 3.24865 1.32404 2.71427 1.65345 2.38477ZM4.41321 6.33789C3.92181 7.13042 3.65638 8.03988 3.65638 9C3.65638 10.4172 4.21967 11.7762 5.22181 12.7783C6.22394 13.7804 7.58291 14.3437 9.00013 14.3438C9.95388 14.3437 10.8806 14.0875 11.6906 13.6152L4.41321 6.33789ZM12.2081 3.12988C12.4228 3.08177 12.6487 3.11904 12.8361 3.23438C14.8672 4.55486 16.0314 6.65803 16.0314 9C16.0314 10.1751 15.7346 11.3183 15.1867 12.334L13.923 11.0703C14.1967 10.4209 14.3439 9.71855 14.3439 9C14.3439 7.24222 13.4582 5.65082 11.9142 4.64746C11.7332 4.52263 11.6082 4.33191 11.5656 4.11621C11.523 3.90039 11.5665 3.67649 11.6867 3.49219C11.8067 3.30809 11.9937 3.17812 12.2081 3.12988ZM9.00013 0.84375C9.22386 0.843782 9.4386 0.932622 9.59681 1.09082C9.755 1.24905 9.84388 1.46375 9.84388 1.6875V5.625C9.84388 5.84875 9.755 6.06345 9.59681 6.22168C9.4386 6.37988 9.22386 6.46872 9.00013 6.46875C8.77639 6.46874 8.56167 6.37987 8.40345 6.22168C8.24522 6.06345 8.15638 5.84877 8.15638 5.625V1.6875C8.15638 1.46373 8.24522 1.24905 8.40345 1.09082C8.56167 0.93263 8.77639 0.843756 9.00013 0.84375Z" fill="url(#icon_shutdown)"/><defs><radialGradient id="icon_shutdown" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.64638 9.08447) scale(12.9475 622.515)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
              <span className="text-sm font-medium text-[#0A0A0A] leading-[22px] tracking-[0.07px]">已关机</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A] leading-normal" style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}>{shutdownCount}</p>
          </button>

          {/* 其他 */}
          <HoverCard openDelay={120} closeDelay={120}>
            <HoverCardTrigger asChild>
              <button
                onClick={() => handleCardFilterChange("other")}
                className={`bg-white rounded-[4px] border px-6 py-5 flex flex-col gap-4 text-left transition-colors ${
                  activeCardFilter === "other" ? "border-[#1447E6]" : "border-[#E5E5E5] hover:border-[#1447E6]"
                }`}
              >
                <div className="flex items-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.59375 5.90625C7.59375 5.68375 7.65973 5.46624 7.78335 5.28123C7.90697 5.09623 8.08267 4.95203 8.28823 4.86689C8.4938 4.78174 8.72 4.75946 8.93823 4.80287C9.15646 4.84627 9.35691 4.95342 9.51425 5.11076C9.67158 5.26809 9.77873 5.46854 9.82214 5.68677C9.86555 5.905 9.84327 6.1312 9.75812 6.33677C9.67297 6.54234 9.52878 6.71804 9.34377 6.84165C9.15876 6.96527 8.94126 7.03125 8.71875 7.03125C8.42038 7.03125 8.13424 6.91272 7.92326 6.70174C7.71228 6.49077 7.59375 6.20462 7.59375 5.90625ZM16.5938 9C16.5938 10.5019 16.1484 11.9701 15.314 13.2189C14.4796 14.4676 13.2936 15.441 11.906 16.0157C10.5184 16.5905 8.99158 16.7408 7.51854 16.4478C6.04549 16.1548 4.69242 15.4316 3.63041 14.3696C2.56841 13.3076 1.84517 11.9545 1.55217 10.4815C1.25916 9.00842 1.40954 7.48157 1.98429 6.094C2.55905 4.70642 3.53236 3.52044 4.78114 2.68603C6.02993 1.85162 7.4981 1.40625 9 1.40625C11.0133 1.40848 12.9435 2.20925 14.3671 3.63287C15.7907 5.0565 16.5915 6.9867 16.5938 9ZM14.9063 9C14.9063 7.83185 14.5599 6.68994 13.9109 5.71866C13.2619 4.74739 12.3395 3.99037 11.2602 3.54334C10.181 3.09631 8.99345 2.97934 7.84775 3.20724C6.70205 3.43513 5.64966 3.99765 4.82365 4.82365C3.99765 5.64965 3.43513 6.70205 3.20724 7.84775C2.97935 8.99345 3.09631 10.181 3.54334 11.2602C3.99037 12.3394 4.74739 13.2619 5.71867 13.9109C6.68994 14.5599 7.83186 14.9062 9 14.9062C10.5659 14.9046 12.0672 14.2818 13.1745 13.1745C14.2818 12.0672 14.9046 10.5659 14.9063 9ZM9.84375 11.5791V9.28125C9.84375 8.90829 9.6956 8.5506 9.43187 8.28688C9.16815 8.02316 8.81046 7.875 8.4375 7.875C8.23824 7.8747 8.04531 7.94494 7.89287 8.07326C7.74043 8.20158 7.63833 8.37972 7.60464 8.57611C7.57095 8.7725 7.60786 8.97447 7.70882 9.14626C7.80978 9.31805 7.96828 9.44857 8.15625 9.51469V11.8125C8.15625 12.1855 8.30441 12.5431 8.56813 12.8069C8.83186 13.0706 9.18954 13.2188 9.5625 13.2188C9.76176 13.219 9.9547 13.1488 10.1071 13.0205C10.2596 12.8922 10.3617 12.714 10.3954 12.5176C10.4291 12.3213 10.3921 12.1193 10.2912 11.9475C10.1902 11.7757 10.0317 11.6452 9.84375 11.5791Z" fill="url(#icon_other)"/><defs><radialGradient id="icon_other" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3.64626 9.00001) scale(12.9475 573.644)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
                  <span className="text-sm font-medium text-[#0A0A0A] leading-[22px] tracking-[0.07px]">其他</span>
                </div>
                <p className="text-2xl font-bold text-[#0A0A0A] leading-normal" style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}>{otherCount}</p>
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="end"
              sideOffset={12}
              className="w-[320px] rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.12)]"
            >
              <div className="space-y-4">
                {OTHER_STATUS_GROUPS.map((group, index) => (
                  <div
                    key={group.title}
                    className={index === 0 ? "space-y-2.5" : "space-y-2.5 border-t border-[#EEF2F6] pt-4"}
                  >
                    <MetaText as="div">{group.title}：</MetaText>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {group.items.map((item) => (
                        <StatusTag
                          key={item.label}
                          mode="text"
                          variant={item.variant}
                        >
                          {item.label}
                        </StatusTag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* 工具栏（独立于表格卡片） */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <Input
                  placeholder="搜索名称、ID 或创建人"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            {/* 批量更新按钮（次级样式，避免抢主操作） */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    onClick={() => !batchDisabled && setShowBatchUpgradeDialog(true)}
                    disabled={batchDisabled}
                    variant="claw-outline"
                    size="claw"
                    className="px-3 gap-1.5"
                  >
                    <CircleArrowUp className="w-3.5 h-3.5" />
                    批量更新
                    {selectedCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 bg-[#f0f3ff] text-[#355EF1] rounded text-xs">{selectedCount}</span>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {batchDisabled && batchTooltip && (
                <TooltipContent side="bottom" className="text-xs">{batchTooltip}</TooltipContent>
              )}
            </Tooltip>
            {/* 批量删除按钮（次级样式 + 红色文字提示危险性） */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    onClick={() => {
                      if (selectedCount > 0 && !batchDeleteDisabled) {
                        setBatchDeleteInput("");
                        setShowBatchDeleteDialog(true);
                      }
                    }}
                    disabled={batchDeleteDisabled}
                    variant="claw-outline"
                    size="claw"
                    className={`px-3 gap-1.5 ${
                      batchDeleteDisabled ? "" : "!text-[#d42a1e] hover:!text-[#b91c1c]"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    批量删除
                    {selectedCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 bg-[#fdecea] text-[#d42a1e] rounded text-xs">{selectedCount}</span>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {batchDeleteDisabled && selectedCount === 0 && (
                <TooltipContent side="bottom" className="text-xs">请先选择实例</TooltipContent>
              )}
            </Tooltip>
            {/* 命令下发：
              * - 勾选实例时：变为主按钮，点击直接打开下发弹窗（预填实例 → 让用户挑命令）
              * - 未勾选时：保持二级菜单，命令列表/执行记录跳转到独立页 /admin/agent-commands
              */}
            {selectedCount > 0 ? (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      // 仅取运行中的实例，过滤掉异常状态
                      const runningIds = selectedClaws
                        .filter((c) => c.status === "running")
                        .map((c) => c.instanceId);
                      if (runningIds.length === 0) {
                        toast.error("所选实例中没有运行中的 Agent，无法下发命令");
                        return;
                      }
                      if (runningIds.length < selectedCount) {
                        toast.info(`已自动跳过 ${selectedCount - runningIds.length} 台非运行中实例`);
                      }
                      setDispatchPresetIds(runningIds);
                    }}
                    variant="claw-primary"
                    size="claw"
                    className="px-3 gap-1.5"
                  >
                    <TerminalSquare className="w-3.5 h-3.5" />
                    命令下发
                    <span className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">{selectedCount}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  对已选 {selectedCount} 台实例下发命令
                </TooltipContent>
              </Tooltip>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="claw-outline" size="claw" className="px-3 gap-1.5">
                    <TerminalSquare className="w-3.5 h-3.5" />
                    命令下发
                    <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-[#A3A3A3]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="cursor-pointer py-2.5"
                    onClick={() => setDispatchPresetIds([])}
                  >
                    <div>
                      <div className="text-[14px] font-medium text-[#020617]">立即下发命令</div>
                      <div className="text-[12px] text-[#737373] mt-0.5">挑选命令模板并选择目标实例</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer py-2.5"
                    onClick={() => setLocation("/admin/agent-commands?tab=list")}
                  >
                    <div>
                      <div className="text-[14px] font-medium text-[#020617]">命令列表</div>
                      <div className="text-[12px] text-[#737373] mt-0.5">管理命令模板（沉淀团队 SOP）</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer py-2.5"
                    onClick={() => setLocation("/admin/agent-commands?tab=history")}
                  >
                    <div>
                      <div className="text-[14px] font-medium text-[#020617]">执行记录</div>
                      <div className="text-[12px] text-[#737373] mt-0.5">查看历史下发任务与单机输出</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="claw-outline"
              size="claw"
              onClick={() => {
                // 已有标签 → 加载为编辑行；无标签 → 一行空白
                setEditingTagRows(selectedTags.length > 0 ? [...selectedTags] : [{ key: '', value: '' }]);
                setTagKeySearchByRow({});
                setTagKeyDropdownOpenByRow({});
                setTagValueDropdownOpenByRow({});
                setShowTagConfigDialog(true);
              }}
              className="px-3 gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              配置默认标签
            </Button>
            {/* 智能体迁移按钮 */}
            <Link href="/admin/agent-migration">
              <Button variant="claw-outline" size="claw" className="px-3 gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                智能体迁移
              </Button>
            </Link>
          </div>

        {/* 表格卡片 */}
        <SurfaceCard className="overflow-hidden">
          <Table
            containerRef={tableScrollRef}
            className="text-sm"
            scrollX="max-content"
          >
            <TableHeader>
              <TableRow>
                {/* 复选框列 - 固定左侧（多列同侧固定的第一列，不显示阴影） */}
                <TableHead fixed="left" fixedShadow={false} className="whitespace-nowrap px-4" style={{ width: '56px', minWidth: '56px' }}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
                      onCheckedChange={(v) => handleSelectAll(!!v)}
                      aria-label="全选"
                    />
                  </div>
                </TableHead>
                {/* 名称 / ID 列 - 固定左侧（边界列，显示阴影），偏移 56px 错开复选框列 */}
                <TableHead fixed="left" className="whitespace-nowrap px-4" style={{ left: 56, width: '240px', minWidth: '240px', maxWidth: '240px' }}>名称 / ID</TableHead>
                <TableHead className="whitespace-nowrap" style={{ minWidth: '120px' }}>
                  <div className="flex items-center gap-2 relative z-40">
                    当前状态
                    <button
                      ref={filterButtonRef}
                      className="p-1 hover:bg-[#f5f5f5] rounded-[4px]"
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setFilterPosition({
                          top: rect.bottom + 4,
                          left: rect.left
                        });
                        setShowStatusFilter(!showStatusFilter);
                      }}
                    >
                      <Filter className="w-3.5 h-3.5 text-[#A3A3A3]" />
                    </button>
                    {showStatusFilter && filterPosition && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowStatusFilter(false)}
                          style={{ pointerEvents: 'auto' }}
                        />
                        <SurfaceOverlay
                          className="fixed w-56 rounded-[4px] z-50 will-change-transform"
                          style={{
                            top: `${filterPosition.top}px`,
                            left: `${filterPosition.left}px`,
                            pointerEvents: 'auto',
                          }}
                        >
                          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                            {["creating", "createFail", "running", "loading", "loadFail", "shutdown", "maintaining", "pending"].map((status) => (
                              <label key={status} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                  checked={selectedStatuses.has(status as ClawStatus)}
                                  onCheckedChange={(checked) => handleStatusFilterChange(status as ClawStatus, !!checked)}
                                  disabled={isStatusDisabled(status as ClawStatus)}
                                />
                                <span className={`text-sm ${isStatusDisabled(status as ClawStatus) ? "text-[#A3A3A3]" : "text-[#334155]"}`}>
                                  {STATUS_CONFIG[status as ClawStatus].label}
                                </span>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-[#e5e5e5] p-2 flex gap-2">
                            <Button variant="claw-outline" size="claw-sm" onClick={handleStatusFilterReset} className="flex-1">
                              重置
                            </Button>
                            <Button variant="claw-primary" size="claw-sm" onClick={handleStatusFilterConfirm} className="flex-1">
                              确认
                            </Button>
                          </div>
                        </SurfaceOverlay>
                      </>
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap" style={{ width: '208px', minWidth: '160px', maxWidth: '208px' }}>创建人</TableHead>
                {hasOneid && (
                  <TableHead className="whitespace-nowrap" style={{ width: 200, maxWidth: 200 }}>
                    <Popover open={deptColFilterOpen} onOpenChange={setDeptColFilterOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 group/dept">
                          <span>部门</span>
                          <Filter className={`w-3.5 h-3.5 transition-colors ${departmentFilter ? 'text-[#355EF1]' : 'text-[#A3A3A3] group-hover/dept:text-[#737373]'}`} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0" align="start" side="bottom">
                        <DepartmentColumnFilter
                          departments={MOCK_DEPARTMENTS}
                          value={departmentFilter}
                          onConfirm={(v) => { setDepartmentFilter(v); setPage(1); setDeptColFilterOpen(false); }}
                          onCancel={() => setDeptColFilterOpen(false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableHead>
                )}
                <TableHead className="whitespace-nowrap" style={{ width: 200, maxWidth: 200 }}>
                  <Popover open={groupColFilterOpen} onOpenChange={setGroupColFilterOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1 group/grp">
                        <span>分组</span>
                        <Filter className={`w-3.5 h-3.5 transition-colors ${groupFilter ? 'text-[#355EF1]' : 'text-[#A3A3A3] group-hover/grp:text-[#737373]'}`} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start" side="bottom">
                      <GroupColumnFilter
                        groups={hasOneid ? MOCK_GROUPS : MOCK_MANUAL_GROUPS}
                        value={groupFilter}
                        hasOneid={hasOneid}
                        onConfirm={(v) => { setGroupFilter(v); setPage(1); setGroupColFilterOpen(false); }}
                        onCancel={() => setGroupColFilterOpen(false)}
                      />
                    </PopoverContent>
                  </Popover>
                </TableHead>
                <TableHead className="whitespace-nowrap" style={{ minWidth: '140px' }}>创建时间</TableHead>
                <TableHead className="whitespace-nowrap" style={{ minWidth: '130px' }}>
                  <Popover open={typeColFilterOpen} onOpenChange={(open) => {
                    setTypeColFilterOpen(open);
                    if (open) setTempTypeFilter(new Set(agentTypeFilter));
                  }}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1 group/type">
                        <span>Agent类型</span>
                        <Filter className={`w-3.5 h-3.5 transition-colors ${agentTypeFilter.size > 0 && agentTypeFilter.size < ALL_AGENT_TYPES.length ? 'text-[#355EF1]' : 'text-[#A3A3A3] group-hover/type:text-[#737373]'}`} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="start" side="bottom">
                      <div className="p-3 space-y-2">
                        {Object.entries(AGENT_TYPE_DISPLAY).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempTypeFilter.has(key)}
                              onCheckedChange={(checked) => {
                                setTempTypeFilter(prev => {
                                  const next = new Set(prev);
                                  if (checked) next.add(key); else next.delete(key);
                                  return next;
                                });
                              }}
                            />
                            <span className="text-sm text-[#334155]">{label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="border-t border-[#e5e5e5] p-2 flex gap-2">
                        <Button variant="claw-outline" size="claw-sm" className="flex-1" onClick={() => {
                          setTempTypeFilter(new Set(ALL_AGENT_TYPES));
                          setAgentTypeFilter(new Set(ALL_AGENT_TYPES));
                          setPage(1);
                          setTypeColFilterOpen(false);
                        }}>重置</Button>
                        <Button variant="claw-primary" size="claw-sm" className="flex-1" onClick={() => {
                          setAgentTypeFilter(new Set(tempTypeFilter));
                          setPage(1);
                          setTypeColFilterOpen(false);
                        }}>确认</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableHead>
                <TableHead className="whitespace-nowrap" style={{ minWidth: '100px' }}>Agent 版本</TableHead>
                {hasAnyTagColumn && (
                  <TableHead className="whitespace-nowrap" style={{ minWidth: '60px' }}>标签</TableHead>
                )}
                <TableHead fixed="right" className="whitespace-nowrap" style={{ width: '240px', minWidth: '240px' }}>
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={(hasOneid ? 13 : 12) - (hasAnyTagColumn ? 0 : 1)} className="px-6 py-12 text-center text-sm text-[#A3A3A3]">
                    暂无符合条件的 Agent
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((claw) => {
                  const isRunning = claw.status === "running";
                  const statusConfig = STATUS_CONFIG[claw.status];

                  const upgradable = isUpgradable(claw);
                  // 所有状态均可勾选，不再禁用复选框
                  const checkboxDisabled = false;
                  const checkboxTooltip = "";

                  return (
                    <TableRow key={claw.id}>
                      {/* 复选框 - 固定左侧（非边界列） */}
                      <TableCell fixed="left" fixedShadow={false} className="py-4 px-4 whitespace-nowrap" style={{ width: '56px', minWidth: '56px' }}>
                        <Checkbox
                          checked={selectedIds.has(claw.id)}
                          onCheckedChange={(v) => handleSelectOne(claw.id, !!v)}
                        />
                      </TableCell>
                      {/* 名称/ID - 固定左侧（边界列），偏移 56px */}
                      <TableCell fixed="left" className="px-4 py-4" style={{ left: 56, width: '240px', minWidth: '240px', maxWidth: '240px' }}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0 flex-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[14px] font-medium text-[#09090b] truncate max-w-[150px]">{claw.name}</div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs break-all">{claw.name}</TooltipContent>
                            </Tooltip>
                            <button
                              onClick={() => handleOpenDrawer(claw)}
                              className="text-[12px] font-mono cursor-pointer text-[#1447E6] hover:underline"
                            >
                              {claw.instanceId}
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      {/* 状态列 */}
                      <TableCell className="px-4 py-4">
                        <StatusTag mode="text" variant={statusConfig.tagVariant}>
                          {statusConfig.label}
                        </StatusTag>
                      </TableCell>
                      {/* 创建人 */}
                      <TableCell className="px-4 py-4" style={{ maxWidth: '208px' }}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-default">{claw.creator}</span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start">
                            <span className="text-xs">{claw.creator}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {/* 部门 - 仅 OneID 模式显示 */}
                      {hasOneid && (
                        <TableCell className="px-4 py-4">
                          {(() => {
                            const deptPaths = getCreatorDeptPaths(claw.creator);
                            if (deptPaths.length === 0) return <span className="text-sm text-[#A3A3A3]">—</span>;
                            if (deptPaths.length === 1) {
                              return (
                                <span className="text-sm text-[#334155] truncate block max-w-[200px]" title={deptPaths[0].path}>
                                  {deptPaths[0].path}
                                </span>
                              );
                            }
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 max-w-[200px] cursor-default">
                                    <span className="text-sm text-[#334155] truncate">{deptPaths[0].path}</span>
                                    <span className="text-xs text-[#737373] tabular-nums shrink-0">+{deptPaths.length - 1}</span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="max-w-[360px] p-0">
                                  <div className="py-2">
                                    {deptPaths.map((dp, idx) => (
                                      <div key={idx} className="px-3 py-1.5 text-sm">
                                        <span className="text-gray-200 mr-1">{idx + 1}.</span>
                                        <span className="text-white">{dp.path}</span>
                                        {dp.isPrimary && (
                                          <span className="ml-2 inline-flex items-center text-[10px] font-medium text-[#355EF1] bg-blue-500/20 rounded px-1.5 py-0.5">
                                            主部门
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })()}
                        </TableCell>
                      )}
                      {/* 分组 */}
                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          if (hasOneid) {
                            const item = getCreatorGroupItemOneid(claw.creator);
                            if (!item) return <span className="text-sm text-[#A3A3A3]">—</span>;
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block max-w-[200px] cursor-default truncate text-sm text-[#334155]">
                                    {item.path}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="max-w-[380px] text-xs leading-relaxed">
                                  {item.path}
                                </TooltipContent>
                              </Tooltip>
                            );
                          } else {
                            const item = getCreatorGroupItemManual(claw.creator);
                            if (!item) return <span className="text-sm text-[#A3A3A3]">—</span>;
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block max-w-[200px] cursor-default truncate text-sm text-[#334155]">
                                    {item.path}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="max-w-[380px] text-xs leading-relaxed">
                                  {item.path}
                                </TooltipContent>
                              </Tooltip>
                            );
                          }
                        })()}
                      </TableCell>
                      {/* 创建时间 */}
                      <TableCell className="px-4 py-4 whitespace-nowrap">{claw.createTime}</TableCell>
                      {/* 智能体 */}
                      <TableCell className="px-4 py-4">
                        {AGENT_TYPE_DISPLAY[claw.agentType] ?? claw.agentType}
                      </TableCell>
                      {/* Agent 版本 */}
                      <TableCell className="px-4 py-4">
                        <Badge variant="secondary" className="font-mono">{claw.version}</Badge>
                      </TableCell>
                      {/* 标签（当前页无任何带标签的实例时整列隐藏） */}
                      {hasAnyTagColumn && (
                        <TableCell className="px-4 py-4">
                          {claw.tags && claw.tags.length > 0 ? (
                            <HoverCard openDelay={100} closeDelay={150}>
                              <HoverCardTrigger asChild>
                                <button className="inline-flex items-center text-[#737373] hover:text-[#334155] transition-colors">
                                  <Tag className="w-4 h-4" />
                                </button>
                              </HoverCardTrigger>
                              <HoverCardContent side="top" align="center" className="p-0 w-56 bg-white border border-[#E5E5E5] rounded-[4px] overflow-hidden">
                                <div className="grid grid-cols-2 bg-[#fafafa] border-b border-[#e5e5e5] px-3 py-2">
                                  <span className="text-xs font-semibold text-[#334155]">标签键</span>
                                  <span className="text-xs font-semibold text-[#334155]">标签值</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                  {claw.tags.map((tag, i) => (
                                    <div key={i} className="grid grid-cols-2 px-3 py-2 gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-xs text-[#334155] truncate block max-w-full cursor-default">{tag.key}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="left"><span>{tag.key}</span></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-xs text-[#737373] truncate block max-w-full cursor-default">{tag.value}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="right"><span>{tag.value}</span></TooltipContent>
                                      </Tooltip>
                                    </div>
                                  ))}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <Tag className="w-4 h-4 text-gray-200" />
                          )}
                        </TableCell>
                      )}
                      {/* 操作 - 全局 TableActionCell 内部按钮强制 link 蓝色样式（详见 SKILL §15 操作列规则） */}
                      <TableActionCell fixed="right" style={{ minWidth: '240px' }} actionsClassName="h-5">
                          {/* 终端 */}
                          {!isRunning ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[14px] text-[rgba(20,71,230,0.4)] cursor-not-allowed whitespace-nowrap">终端</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                仅运行中的实例可进入终端
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button variant="link" onClick={() => handleOpenTerminal(claw)}>
                              终端
                            </Button>
                          )}

                          {/* 关机/开机 */}
                          {claw.status === "running" ? (
                            <Button variant="link" onClick={() => setShutdownTarget(claw.id)}>
                              关机
                            </Button>
                          ) : claw.status === "shutdown" ? (
                            <Button variant="link" onClick={() => setShutdownTarget(claw.id)}>
                              开机
                            </Button>
                          ) : (
                            <span className="text-[14px] text-[rgba(20,71,230,0.4)] whitespace-nowrap">开机</span>
                          )}

                          {/* 删除 */}
                          {["creating", "loading", "pending"].includes(claw.status) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[14px] text-[rgba(20,71,230,0.4)] cursor-not-allowed whitespace-nowrap">删除</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                当前状态不可删除
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button variant="link" onClick={() => handleDeleteClick(claw)}>
                              删除
                            </Button>
                          )}

                          {/* 更多操作 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="link">
                                更多
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className={`cursor-pointer focus:bg-[#fafafa] ${isRunning ? "text-gray-900 focus:text-gray-900 [&_svg:not([class*='text-'])]:text-gray-900" : "text-[#A3A3A3] opacity-40 cursor-not-allowed [&_svg:not([class*='text-'])]:text-[#A3A3A3]"}`}
                                disabled={!isRunning}
                                onClick={() => handleRestart(claw)}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <BodyText as="span" tone="inherit">重启</BodyText>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`cursor-pointer focus:bg-[#fafafa] ${["running", "shutdown"].includes(claw.status) ? "text-gray-900 focus:text-gray-900 [&_svg:not([class*='text-'])]:text-gray-900" : "text-[#A3A3A3] opacity-40 cursor-not-allowed [&_svg:not([class*='text-'])]:text-[#A3A3A3]"}`}
                                disabled={!["running", "shutdown"].includes(claw.status)}
                                onClick={() => handleReinstallClick(claw)}
                              >
                                <HardDriveDownload className="w-3.5 h-3.5" />
                                <BodyText as="span" tone="inherit">重新安装 Agent</BodyText>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-gray-900 focus:bg-[#fafafa] focus:text-gray-900 [&_svg:not([class*='text-'])]:text-gray-900"
                                onClick={() => handleOpenMonitor(claw)}
                              >
                                <Activity className="w-3.5 h-3.5" />
                                <BodyText as="span" tone="inherit">监控</BodyText>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableActionCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#f0f0f0]">
            <Pagination
              total={versionFiltered.length}
              current={safePage}
              pageSize={PAGE_SIZE}
              showTotal={(total) => `共 ${total} 条记录`}
              className="w-full justify-between"
              hideOnSinglePage
              onChange={(page) => { setPage(page); }}
            />
          </div>
        </SurfaceCard>

      </div>

      {/* 关机/开机确认弹窗 */}
      {(() => {
        const target = claws.find(c => c.id === shutdownTarget);
        const isRunning = target?.status === "running";

        // 关机 → 警示弹窗（AlertDialog）
        if (isRunning) {
          return (
            <AlertDialog open={!!shutdownTarget} onOpenChange={() => setShutdownTarget(null)}>
              <AlertDialogContent className="sm:max-w-[420px]">
                <button
                  type="button"
                  aria-label="关闭"
                  onClick={() => setShutdownTarget(null)}
                  className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
                >
                  <X className="size-5" />
                  <span className="sr-only">关闭</span>
                </button>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#0A0A0A]">确认关机</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <p className="text-sm text-[#525252]">
                      关机后该 Agent「{target?.name}」
                      <span className="text-[#DC2626] font-medium">将无法使用，直到重新开机</span>
                      。确认关机吗？
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShutdownTarget(null)}>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmShutdown}>确认关机</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        }

        // 开机 → 普通弹窗
        return (
          <Dialog open={!!shutdownTarget} onOpenChange={() => setShutdownTarget(null)}>
            <DialogContent className="sm:max-w-[360px]">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-[#0A0A0A]">
                  确认开机
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-[#737373] leading-relaxed">
                开机后该 Agent「{target?.name}」将重新运行。确认开机吗？
              </p>
              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setShutdownTarget(null)}>取消</Button>
                <Button variant="dialog-confirm" onClick={confirmShutdown}>确认开机</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* 重新安装确认弹窗（警示弹窗） */}
      <AlertDialog open={!!reinstallTarget} onOpenChange={() => setReinstallTarget(null)}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setReinstallTarget(null)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">重新安装 Agent</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-[#525252]">
                将使用最新镜像重新安装「{claws.find(c => c.id === reinstallTarget)?.name}」，清除当前所有配置且无法恢复，
                <span className="text-[#DC2626] font-medium">
                  安装完成后需重新配置模型和通道。
                </span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#0A0A0A]">请输入「重装」以确认</label>
            <Input
              value={reinstallInput}
              onChange={(e) => setReinstallInput(e.target.value)}
              placeholder="输入「重装」"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReinstallTarget(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReinstall}
              disabled={reinstallInput !== "重装"}
            >
              确认重新安装
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认弹窗（警示弹窗） */}
      {(() => {
        const deleteTargetClaw = claws.find(c => c.id === deleteTarget);
        const isCreateFail = deleteTargetClaw?.status === "createFail";
        const isRunning = deleteTargetClaw?.status === "running";
        return (
          <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent className="sm:max-w-[420px]">
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setDeleteTarget(null)}
                className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
              >
                <X className="size-5" />
                <span className="sr-only">关闭</span>
              </button>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#0A0A0A]">确认删除</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  {isCreateFail ? (
                    <p className="text-sm text-[#525252]">
                      此操作将移除「{deleteTargetClaw?.name}」该创建失败的记录，底层资源将由系统自动回收。
                    </p>
                  ) : (
                    <p className="text-sm text-[#525252]">
                      此操作不可撤销。「{deleteTargetClaw?.name}」
                      <span className="text-[#DC2626] font-medium">
                        实例及相关数据将被永久删除，已配置的模型、通道和插件将全部清除且无法恢复。
                      </span>
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {isRunning && (
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#0A0A0A]">请输入「删除」以确认</label>
                  <Input
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="输入「删除」"
                  />
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteTarget(null)}>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={confirmDelete}
                  disabled={isRunning && deleteInput !== "删除"}
                >
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      })()}

      {/* 批量删除确认弹窗（警示弹窗） */}
      <AlertDialog
        open={showBatchDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowBatchDeleteDialog(false);
            setBatchDeleteInput("");
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => {
              setShowBatchDeleteDialog(false);
              setBatchDeleteInput("");
            }}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">批量删除</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-[#525252]">
                此操作不可撤销。共 <span className="font-semibold text-[#0A0A0A] tabular-nums">{selectedCount}</span> 个
                <span className="text-[#DC2626] font-medium">
                  实例及相关数据将被永久删除，已配置的模型、通道和插件将全部清除且无法恢复
                </span>
                。
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            {selectedCount > 0 && (
              <div className="space-y-3">
                <label className="text-[14px] font-medium text-[#0A0A0A]">
                  待删除实例（<span className="tabular-nums">{selectedCount}</span> 个）
                </label>
                <div className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden">
                  <div className="max-h-[260px] overflow-y-auto scrollbar-on-hover">
                    <Table density="compact">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60%]">名称 / ID</TableHead>
                          <TableHead className="w-[40%]">Agent 类型</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClaws.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="whitespace-normal">
                              <div className="min-w-0">
                                <div className="text-sm text-[#0A0A0A] break-words">{c.name}</div>
                                <div className="font-mono text-xs text-[#A3A3A3] break-all">{c.instanceId}</div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              <span className="text-xs text-[#334155] break-words">{AGENT_TYPE_DISPLAY[c.agentType] ?? c.agentType}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[14px] font-medium text-[#0A0A0A]">请输入「删除」以确认</label>
              <Input
                value={batchDeleteInput}
                onChange={(e) => setBatchDeleteInput(e.target.value)}
                placeholder="输入「删除」"
                autoFocus
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowBatchDeleteDialog(false);
                setBatchDeleteInput("");
              }}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={batchDeleteInput !== "删除" || selectedCount === 0}
              onClick={() => {
                setClaws((prev) => prev.filter((c) => !selectedIds.has(c.id)));
                const removed = selectedCount;
                setSelectedIds(new Set());
                setShowBatchDeleteDialog(false);
                setBatchDeleteInput("");
                toast.success(`已删除 ${removed} 个实例`);
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量更新确认弹窗 */}
      <Dialog open={showBatchUpgradeDialog} onOpenChange={setShowBatchUpgradeDialog}>
        <DialogContent className="rounded-[4px] sm:max-w-[680px]">
          <DialogHeader className="pb-5">
            <DialogTitle className="text-[16px] font-semibold text-[#0A0A0A]">批量更新</DialogTitle>
            <DialogDescription className="text-xs leading-[1.5] text-[#737373]">
              将 <span className="font-din font-bold tabular-nums text-[#020617]">{selectedIds.size}</span> 个实例更新至当前用户可见镜像版本。
            </DialogDescription>
          </DialogHeader>
          <Alert variant="warning" className="border-0 bg-[#FFF7ED] px-4 py-3">
            <CircleAlert />
            <AlertDescription className="space-y-1.5">
              <p>更新预计需要 5～10 分钟，期间 Agent 实例不可使用。</p>
              <p>请先确认目标镜像已设为生效状态；更新后模型、通道、技能、记忆及用户个人数据不会丢失。</p>
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-between pt-1">
            <p className="text-sm font-medium text-[#0A0A0A]">待更新实例</p>
            <p className="text-xs text-[#737373]">可移除不需要更新的实例</p>
          </div>
          <div className="max-h-[300px] overflow-y-auto scrollbar-on-hover">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-[#F5F5F5]">
                  <th className="sticky top-0 z-10 bg-white px-2 py-2.5 text-left text-xs font-medium text-[#737373]">实例</th>
                  <th className="sticky top-0 z-10 bg-white px-3 py-2.5 text-left text-xs font-medium text-[#737373]">Agent 类型</th>
                  <th className="sticky top-0 z-10 bg-white px-3 py-2.5 text-left text-xs font-medium text-[#737373]">版本</th>
                  <th className="sticky top-0 z-10 bg-white px-3 py-2.5 text-left text-xs font-medium text-[#737373]">状态</th>
                  <th className="sticky top-0 z-10 bg-white px-2 py-2.5 text-right text-xs font-medium text-[#737373]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {claws.filter(c => selectedIds.has(c.id)).map(c => {
                  const sc = STATUS_CONFIG[c.status];
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-[#FAFAFA]">
                      <td className="py-3 pl-2 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1447E6]">
                            <span className="font-din text-xs font-bold">{c.agentType.slice(0, 1)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[#0A0A0A]">{c.name}</div>
                            <div className="font-mono text-xs text-[#A3A3A3]">{c.instanceId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-[#334155]">{AGENT_TYPE_DISPLAY[c.agentType] ?? c.agentType}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs text-[#334155]">{c.version}</span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusTag mode="dot" variant={sc.tagVariant}>
                          {sc.label}
                        </StatusTag>
                      </td>
                      <td className="py-3 pl-3 pr-2 text-right">
                        <button
                          onClick={() => setSelectedIds(prev => { const n = new Set(prev); n.delete(c.id); return n; })}
                          className="whitespace-nowrap text-xs text-[#737373] transition-colors hover:text-red-600"
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowBatchUpgradeDialog(false)}>取消</Button>
            <Button variant="dialog-confirm" onClick={confirmBatchUpgrade}>
              确认更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* 批量升级失败结果弹窗 */}
      <Dialog open={showUpgradeResultDialog} onOpenChange={setShowUpgradeResultDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#0A0A0A]">下发失败提醒</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-[4px] px-4 py-3">
            <p>当前没有生效的 OpenClaw 镜像，以下 agent 无法升级。</p>
            <p>请先前往「镜像管理」页面将目标镜像指定为生效状态。</p>
          </div>
          <p className="text-sm text-[#737373]">任务已提交，以下 <span className="font-semibold text-red-600">{upgradeFailedAgents.length}</span> 个实例无法执行</p>
          <div className="max-h-64 overflow-y-auto border border-[#e5e5e5] rounded-[4px] scrollbar-on-hover">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]/60">
                  <th className="text-left px-4 py-2 text-xs font-medium text-[#737373]">实例</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-[#737373]">Agent类型</th>
                   <th className="text-left px-4 py-2 text-xs font-medium text-[#737373]">下发失败原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upgradeFailedAgents.map((a, idx) => (
                  <tr key={idx} className="hover:bg-[#f5f5f5]/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[4px] bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white" style={{ fontSize: '10px' }}>C</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#0A0A0A] truncate">{a.name}</div>
                          <div className="text-xs text-[#A3A3A3] font-mono">{a.instanceId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium text-[#737373]">{AGENT_TYPE_DISPLAY[a.agentType] ?? a.agentType}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-red-600">当前没有生效的 {AGENT_TYPE_DISPLAY[a.agentType] ?? a.agentType} 镜像</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button onClick={() => setShowUpgradeResultDialog(false)}>
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 配置默认标签弹窗 */}
      <Dialog
        open={showTagConfigDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowTagConfigDialog(false);
            setTagKeySearchByRow({});
            setTagKeyDropdownOpenByRow({});
            setTagValueDropdownOpenByRow({});
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              配置默认标签
            </DialogTitle>
          </DialogHeader>

          {/* 提示语 */}
          <Alert variant="info">
            <Info className="w-4 h-4" />
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1 leading-relaxed text-xs">
                <li>当前仅支持使用<a href="https://console.cloud.tencent.com/tag/taglist" target="_blank" rel="noopener noreferrer" className="text-[#355EF1] hover:underline mx-0.5" onClick={(e) => e.stopPropagation()}>腾讯云控制台</a>已创建的标签。</li>
                <li>将在用户端新建实例时自动配置勾选的标签（仅限新建实例，已创建实例暂不支持绑定标签）。</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* 多行标签编辑 */}
          <div className="space-y-2 mt-4">
            <div className="text-sm font-medium text-[#020617]">标签列表</div>
            {editingTagRows.map((row, rowIdx) => {
              const isLastRow = rowIdx === editingTagRows.length - 1;
              const minusDisabled = editingTagRows.length <= 1;
              const keySearch = tagKeySearchByRow[rowIdx] ?? '';
              const keyOpen = tagKeyDropdownOpenByRow[rowIdx] ?? false;
              const valueOpen = tagValueDropdownOpenByRow[rowIdx] ?? false;

              const setRowKey = (k: string) => {
                setEditingTagRows((prev) => prev.map((r, i) => (i === rowIdx ? { key: k, value: '' } : r)));
                setTagKeySearchByRow((prev) => ({ ...prev, [rowIdx]: '' }));
                setTagKeyDropdownOpenByRow((prev) => ({ ...prev, [rowIdx]: false }));
              };
              const setRowValue = (v: string) => {
                setEditingTagRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, value: v } : r)));
                setTagValueDropdownOpenByRow((prev) => ({ ...prev, [rowIdx]: false }));
              };

              return (
                <div key={rowIdx} className="flex items-center gap-2">
                  {/* 标签键下拉 */}
                  <div className="relative flex-1 min-w-0">
                    <Popover
                      open={keyOpen}
                      onOpenChange={(o) => setTagKeyDropdownOpenByRow((prev) => ({ ...prev, [rowIdx]: o }))}
                    >
                      <PopoverTrigger asChild>
                        <button
                          className="w-full min-w-0 flex items-center justify-between h-9 px-3 text-sm border border-[#E5E5E5] rounded-[4px] bg-white hover:border-[#1447E6] transition-colors overflow-hidden"
                          onClick={() => setTagKeyDropdownOpenByRow((prev) => ({ ...prev, [rowIdx]: !keyOpen }))}
                        >
                          <span className={`truncate min-w-0 flex-1 text-left ${row.key ? 'text-[#0A0A0A]' : 'text-[#A3A3A3]'}`}>{row.key || '选择标签键'}</span>
                          {row.key && (
                            <span
                              role="button"
                              aria-label="清除标签键"
                              className="flex-shrink-0 ml-1 text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTagRows((prev) => prev.map((r, i) => (i === rowIdx ? { key: '', value: '' } : r)));
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <ChevronDown className="w-4 h-4 text-[#737373] flex-shrink-0 ml-1" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start" side="bottom">
                        {/* 搜索框 */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e5e5e5]">
                          <Search className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
                          <input
                            autoFocus
                            className="flex-1 text-sm outline-none placeholder:text-[#A3A3A3]"
                            placeholder="搜索标签键..."
                            value={keySearch}
                            onChange={(e) => setTagKeySearchByRow((prev) => ({ ...prev, [rowIdx]: e.target.value }))}
                          />
                        </div>
                        {/* 标签键列表 */}
                        <div className="max-h-52 overflow-y-auto py-1" onWheel={(e) => e.stopPropagation()}>
                          {tagKeys
                            .filter(k => k.toLowerCase().includes(keySearch.toLowerCase()))
                            .map(k => (
                              <button
                                key={k}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f5] transition-colors ${
                                  row.key === k ? 'text-[#355EF1] font-medium bg-[#eff4ff]/50' : 'text-[#334155]'
                                }`}
                                onClick={() => setRowKey(k)}
                              >
                                {k}
                              </button>
                            ))
                          }
                          {tagKeys.filter(k => k.toLowerCase().includes(keySearch.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-sm text-[#A3A3A3] text-center">无匹配结果</div>
                          )}
                        </div>
                        <div className="px-3 py-1.5 border-t border-[#e5e5e5] text-xs text-[#A3A3A3]">共 {tagKeys.length} 条</div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <span className="text-[#A3A3A3] text-sm flex-shrink-0">:</span>

                  {/* 标签値下拉（必须先选键） */}
                  <div className="relative flex-1 min-w-0">
                    {row.key ? (
                      <Popover
                        open={valueOpen}
                        onOpenChange={(o) => setTagValueDropdownOpenByRow((prev) => ({ ...prev, [rowIdx]: o }))}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="w-full min-w-0 flex items-center justify-between h-9 px-3 text-sm border border-[#E5E5E5] rounded-[4px] bg-white hover:border-[#1447E6] transition-colors overflow-hidden"
                            onClick={() => setTagValueDropdownOpenByRow((prev) => ({ ...prev, [rowIdx]: !valueOpen }))}
                          >
                            <span className={`truncate min-w-0 flex-1 text-left ${row.value ? 'text-[#0A0A0A]' : 'text-[#A3A3A3]'}`}>{row.value || '选择标签值'}</span>
                            {row.value && (
                              <span
                                role="button"
                                aria-label="清除标签值"
                                className="flex-shrink-0 ml-1 text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTagRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, value: '' } : r)));
                                }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-[#737373] flex-shrink-0 ml-1" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0" align="start" side="bottom">
                          <div className="max-h-44 overflow-y-auto py-1" onWheel={(e) => e.stopPropagation()}>
                            {(tagKeyValues[row.key] || []).map(v => (
                              <button
                                key={v}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f5] transition-colors ${
                                  row.value === v ? 'text-[#355EF1] font-medium bg-[#eff4ff]/50' : 'text-[#334155]'
                                }`}
                                onClick={() => setRowValue(v)}
                              >
                                {v}
                              </button>
                            ))}
                            {(tagKeyValues[row.key] || []).length === 0 && (
                              <div className="px-4 py-3 text-sm text-[#A3A3A3] text-center">暂无可用值</div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="w-full h-9 px-3 flex items-center text-sm border border-[#E5E5E5] rounded-[4px] bg-[#FAFAFA] text-[#A3A3A3] cursor-not-allowed truncate">
                        请先选择标签键
                      </div>
                    )}
                  </div>

                  {/* 加号按钮（仅末行展示新增动作；其它行也展示但点击同样在末尾新增） */}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={isLastRow && (!row.key || !row.value)}
                    onClick={() => setEditingTagRows((prev) => [...prev, { key: '', value: '' }])}
                    aria-label="新增一行"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  {/* 减号按钮 */}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={minusDisabled}
                    onClick={() => {
                      setEditingTagRows((prev) => prev.filter((_, i) => i !== rowIdx));
                      setTagKeySearchByRow((prev) => {
                        const next = { ...prev };
                        delete next[rowIdx];
                        return next;
                      });
                      setTagKeyDropdownOpenByRow((prev) => {
                        const next = { ...prev };
                        delete next[rowIdx];
                        return next;
                      });
                      setTagValueDropdownOpenByRow((prev) => {
                        const next = { ...prev };
                        delete next[rowIdx];
                        return next;
                      });
                    }}
                    aria-label="删除该行"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>


          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTagConfigDialog(false);
                setTagKeySearchByRow({});
                setTagKeyDropdownOpenByRow({});
                setTagValueDropdownOpenByRow({});
              }}
            >
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                // 过滤掉未填完的行
                const valid = editingTagRows.filter((r) => r.key && r.value);
                // 去重：同一 key 只保留第一个
                const seenKeys = new Set<string>();
                const dedup = valid.filter((r) => {
                  if (seenKeys.has(r.key)) return false;
                  seenKeys.add(r.key);
                  return true;
                });
                setSelectedTags(dedup);
                setShowTagConfigDialog(false);
                setTagKeySearchByRow({});
                setTagKeyDropdownOpenByRow({});
                setTagValueDropdownOpenByRow({});
                toast.success(
                  dedup.length > 0
                    ? `已配置 ${dedup.length} 个默认标签，新建实例将自动打 tag`
                    : '已清空默认标签配置'
                );
              }}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent 详情抽屉 */}
      <Drawer
        open={showDetailDrawer && !!selectedClaw}
        onOpenChange={(open) => setShowDetailDrawer(open)}
        direction="right"
      >
        {selectedClaw && (
          <DrawerContent className="data-[vaul-drawer-direction=right]:w-[480px] data-[vaul-drawer-direction=right]:sm:max-w-none max-w-[calc(100vw-24px)] h-full rounded-none bg-background p-0">
            {/* 抽屉头 */}
            <DrawerHeader className="flex flex-row items-center justify-between gap-4 p-4 bg-background text-left">
              <DrawerTitle asChild>
                <PanelTitle as="h2">Agent 详情</PanelTitle>
              </DrawerTitle>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-900 hover:text-gray-950"
                  onClick={handleRefreshDrawer}
                  disabled={drawerLoading}
                  aria-label="刷新"
                >
                  <RefreshCw className={`w-4 h-4 ${drawerLoading ? "animate-spin" : ""}`} />
                </Button>
                <DrawerClose asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-gray-900 hover:text-gray-950"
                    aria-label="关闭"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            {/* 抽屉内容 */}
            <DrawerBody>
              <div className="p-4 space-y-6">
                {/* 名称/ID 部分 */}
                <div className="min-w-0 space-y-1.5">
                    <PanelTitle as="div" className="truncate leading-tight">{selectedClaw.name}</PanelTitle>
                    <div className="flex items-center gap-2">
                      <CodeText>{selectedClaw.instanceId}</CodeText>
                      <MetaText
                        as="button"
                        tone="brand"
                        className="inline-flex items-center gap-0.5 whitespace-nowrap hover:text-[#355EF1]"
                        onClick={() => window.open(`https://console.cloud.tencent.com/cvm/instance/detail?rid=1&id=${selectedClaw.instanceId}`, "_blank")}
                      >
                        去腾讯云控制台管理
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </MetaText>
                    </div>
                  </div>
                {/* 已应用模型 */}
                {(() => {
                  const detail = getClawDetail(selectedClaw.id);
                  const models = detail.appliedModels;
                  const hasPrimary = models.some(m => m.primary);
                  const primaryList = models.filter(m => m.primary);
                  const backupList = [...models.filter(m => !m.primary)].sort((a, b) => b.addedAt - a.addedAt);
                  // 是否为 OpenClaw 类型：OpenClaw 支持主模型 + 备选模型；其他类型只能配置一个模型
                  const isOpenClaw = selectedClaw.agentType === 'OpenClaw';
                  // 非 OpenClaw 且已有模型时不展示添加按鈕；OpenClaw 按现有逻辑
                  const canAddMore = isOpenClaw || models.length === 0;
                  const addButtonLabel = isOpenClaw
                    ? (hasPrimary ? "添加备选模型" : "添加主模型")
                    : "添加模型";
                  const isAdding = modelAction.kind === "add";

                  /** 卡片内两级 Select + 保存/取消（替换态 / 新增态共用） */
                  const renderInlineEditForm = () => (
                    <div className="bg-muted/30 p-3">
                      {providerGroups.length === 0 ? (
                        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-[4px] px-3 py-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <MetaText as="p" className="text-amber-700 leading-relaxed">
                            当前「模型配置」页中没有对用户可见的模型，请前往该页面添加或开启模型可见性。
                          </MetaText>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-background">
                          <div className="border-b border-[#f0f0f0] px-3 py-2">
                            <MetaMedium>模型配置</MetaMedium>
                          </div>
                          <div className="divide-y divide-[#f0f0f0]">
                            <div className="px-3 py-2 space-y-1.5">
                              <MetaMedium as="label">模型厂商</MetaMedium>
                              <Select value={modelDraftProvider} onValueChange={handleDraftProviderChange}>
                                <SelectTrigger className="w-full bg-background border-[#e5e5e5] h-8 text-xs">
                                  <SelectValue placeholder="选择模型厂商" />
                                </SelectTrigger>
                                <SelectContent>
                                  {providerGroups.map((g) => (
                                    <SelectItem key={g.key} value={g.key}>{g.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="px-3 py-2 space-y-1.5">
                              <MetaMedium as="label">模型名称</MetaMedium>
                              <Select value={modelDraftModelId} onValueChange={setModelDraftModelId}>
                                <SelectTrigger className="w-full bg-background border-[#e5e5e5] h-8 text-xs">
                                  <SelectValue placeholder="选择模型名称" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(providerGroups.find(g => g.key === modelDraftProvider)?.models ?? []).map((m) => {
                                    const isCustom = m.provider === CUSTOM_PROVIDER_VALUE;
                                    return (
                                      <SelectItem key={m.id} value={m.id}>
                                        {isCustom ? m.name : m.version}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 border-t border-[#f0f0f0] px-3 py-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={cancelEditModel}>
                              取消
                            </Button>
                            <Button
                              size="sm"
                              variant="dialog-confirm"
                              className="h-7 px-2 text-xs"
                              onClick={saveEditModel}
                              disabled={!modelDraftProvider || !modelDraftModelId}
                            >
                              保存
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );

                  /** 渲染一行模型卡：替换态下卡片内直接变为编辑表单 */
                  const renderModelRow = (model: AppliedModelItem, isPrimary: boolean) => {
                    const isReplacingThis = modelAction.kind === "replace" && modelAction.modelEntryId === model.id;
                    return (
                      <div
                        key={model.id}
                        className={isReplacingThis
                          ? "bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden"
                          : "px-4 py-3 bg-white rounded-[4px] border border-[#e5e5e5] transition-colors"}
                      >
                        {isReplacingThis ? (
                          renderInlineEditForm()
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                              <BodyMedium className="truncate leading-tight">
                                {model.providerLabel}
                              </BodyMedium>
                              {model.versionLabel && (
                                <MetaText tone="weak" className="leading-tight mt-0.5 truncate">
                                  {model.versionLabel}
                                </MetaText>
                              )}
                            </div>
                            {isOpenClaw && (isPrimary ? (
                              <StatusTag mode="fill" variant="green">主模型</StatusTag>
                            ) : (
                              <StatusTag mode="fill" variant="gray">备选模型</StatusTag>
                            ))}
                            <div className="flex items-center gap-1 shrink-0">
                              {isOpenClaw && !isPrimary && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => setModelConfirmDialog({ open: true, type: "set-primary", modelEntryId: model.id })}
                                      className="p-1 rounded text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
                                    >
                                      <ArrowLeftRight className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                    设为主模型
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {!isOpenClaw && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => startReplaceModel(model)}
                                    className="p-1 rounded text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                  替换
                                </TooltipContent>
                              </Tooltip>
                              )}
                              {isOpenClaw && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => setModelConfirmDialog({
                                      open: true,
                                      type: isPrimary ? "delete" : "delete-backup",
                                      modelEntryId: model.id,
                                    })}
                                    className="p-1 rounded text-[#A3A3A3] hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                  删除模型
                                </TooltipContent>
                              </Tooltip>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <MetaText as="div">已应用模型（{models.length}）</MetaText>
                        {!isAdding && canAddMore && (
                          <MetaText
                            as="button"
                            tone="brand"
                            onClick={startAddModel}
                            className="flex items-center gap-1 hover:text-[#355EF1] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            {addButtonLabel}
                          </MetaText>
                        )}
                      </div>

                      {/* 空态（无模型且不在新增态） */}
                      {models.length === 0 && !isAdding && (
                        <MetaText as="div" tone="weak" className="px-4 py-6 bg-background rounded-[4px] border border-dashed border-[#e5e5e5] text-center">
                          暂未配置模型
                        </MetaText>
                      )}

                      {/* 主模型分组 */}
                      {primaryList.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {primaryList.map((m) => renderModelRow(m, true))}
                        </div>
                      )}

                      {/* 备选模型分组 */}
                      {backupList.length > 0 && (
                        <div>
                          <div className="space-y-1.5">
                            {backupList.map((m) => renderModelRow(m, false))}
                          </div>
                        </div>
                      )}

                      {/* 新增态：底部 inline 卡（替换态已在行内展示，不再重复渲染） */}
                      {isAdding && (
                        <div className="mt-2 bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden">
                          {renderInlineEditForm()}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* 已接入通道 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <MetaText as="div">已接入通道（{getClawDetail(selectedClaw.id).connectedChannels.length}）</MetaText>
                    {!channelAdding && (
                      <MetaText
                        as="button"
                        tone="brand"
                        className="flex items-center gap-1 hover:text-[#355EF1] transition-colors"
                        onClick={() => startAddChannel(getClawDetail(selectedClaw.id))}
                      >
                        <Plus className="w-3 h-3" />
                        添加通道
                      </MetaText>
                    )}
                  </div>
                  <div className="space-y-2">
                    {getClawDetail(selectedClaw.id).connectedChannels.map((channel) => {
                      const chConfig = channelLookup.get(channel.value);
                      const fields = chConfig?.fields ?? [];
                      const isExpanded = expandedChannel === channel.name;
                      const isEditingThis = isExpanded && channelEditDraft !== null;
                      return (
                        <div key={channel.name} className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden">
                          {/* 行头：通道名 + 展开/折叠按钮 */}
                          <div className="group px-4 py-3 flex items-center gap-3">
                            <button
                              onClick={() => toggleExpandChannel(channel)}
                              className="text-[#A3A3A3] hover:text-[#737373] transition-colors flex-shrink-0"
                              title={isExpanded ? "收起" : "展开查看凭证"}
                            >
                              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                            <BodyMedium className="flex-1">{channel.name}</BodyMedium>
                            <button
                              onClick={() => setChannelRemoveTarget(channel.name)}
                              className="text-[#A3A3A3] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="移除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* 展开区域：凭证查看 / 编辑 */}
                          {isExpanded && (
                            <div className="border-t border-[#e5e5e5] bg-muted/30 p-3">
                              {fields.length === 0 ? (
                                <div className="flex items-start gap-2.5 bg-[#eff4ff] border border-blue-100 rounded-[4px] px-3 py-2.5">
                                  <Info className="w-4 h-4 text-[#355EF1] mt-0.5 shrink-0" />
                                  <MetaText as="p" tone="brand" className="leading-relaxed">
                                    该通道无需凭证配置（由租户在用户端完成扫码授权）。
                                  </MetaText>
                                </div>
                              ) : (
                                <div className="overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-background">
                                  <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] px-3 py-2">
                                    <MetaMedium>凭证信息</MetaMedium>
                                    {!isEditingThis && (
                                      <MetaText
                                        as="button"
                                        tone="brand"
                                        className="inline-flex items-center gap-1 hover:text-[#355EF1]"
                                        onClick={() => startEditChannel(channel)}
                                      >
                                        <Pencil className="w-3 h-3" />
                                        编辑凭证
                                      </MetaText>
                                    )}
                                  </div>

                                  <div className="divide-y divide-[#f0f0f0]">
                                    {fields.map((field) => {
                                      const visible = isSecretVisible(channel.name, field.key);
                                      if (isEditingThis) {
                                        // 编辑态：Input + 密码可见切换
                                        return (
                                          <div key={field.key} className="px-3 py-2 space-y-1.5">
                                            <MetaMedium as="label">{field.label}</MetaMedium>
                                            <div className="relative">
                                              <Input
                                                type={field.secret && !visible ? "password" : "text"}
                                                value={channelEditDraft![field.key] ?? ""}
                                                onChange={(e) => setChannelEditDraft(prev => ({ ...(prev ?? {}), [field.key]: e.target.value }))}
                                                className="bg-background border-[#e5e5e5] text-xs h-8 pr-9"
                                              />
                                              {field.secret && (
                                                <button
                                                  type="button"
                                                  onClick={() => toggleSecretVisibility(channel.name, field.key)}
                                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                                                >
                                                  {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      // 只读态：key - value（secret 自动 mask）
                                      const rawValue = channel.fieldValues[field.key] ?? "";
                                      const displayValue = field.secret && !visible ? maskSecret(rawValue) : (rawValue || "—");
                                      return (
                                        <div key={field.key} className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 px-3 py-2">
                                          <MetaText className="truncate" title={field.label}>{field.label}</MetaText>
                                          <div className="min-w-0 flex items-center gap-1.5">
                                            <CodeText tone="emphasis" className="min-w-0 break-all">{displayValue}</CodeText>
                                            {field.secret && rawValue && (
                                              <button
                                                type="button"
                                                onClick={() => toggleSecretVisibility(channel.name, field.key)}
                                                className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                                                title={visible ? "隐藏" : "查看"}
                                              >
                                                {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {isEditingThis && (
                                    <div className="flex justify-end gap-2 border-t border-[#f0f0f0] px-3 py-2">
                                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={cancelEditChannel}>
                                        取消
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="dialog-confirm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => saveEditChannel(channel)}
                                      >
                                        保存
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {getClawDetail(selectedClaw.id).connectedChannels.length === 0 && !channelAdding && (
                      <MetaText as="div" tone="weak" className="px-4 py-6 bg-background rounded-[4px] border border-dashed border-[#e5e5e5] text-center">
                        暂未接入通道
                      </MetaText>
                    )}
                    {/* 新增通道面板 */}
                    {channelAdding && (() => {
                      const existing = new Set(getClawDetail(selectedClaw.id).connectedChannels.map(c => c.name));
                      const available = availableChannelOptions.filter(c => !existing.has(c.label));
                      const currentCh = availableChannelOptions.find(c => c.value === channelDraft);
                      const isWechatLike = currentCh?.wechatMode;
                      return (
                        <div className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden">
                          <div className="bg-muted/30 p-3">
                            <div className="overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-background">
                              <div className="border-b border-[#f0f0f0] px-3 py-2">
                                <MetaMedium>通道配置</MetaMedium>
                              </div>
                              <div className="divide-y divide-[#f0f0f0]">
                                {/* 通道选择 */}
                                <div className="px-3 py-2 space-y-1.5">
                                  <MetaMedium as="label">通道类型</MetaMedium>
                                  <Select value={channelDraft} onValueChange={handleChannelDraftChange}>
                                    <SelectTrigger className="w-full bg-background border-[#e5e5e5] h-8 text-xs">
                                      <SelectValue placeholder="选择要添加的通道" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {available.length === 0 ? (
                                        <MetaText as="div" tone="weak" className="px-3 py-6 text-center">
                                          所有通道均已添加
                                        </MetaText>
                                      ) : (
                                        available.map((c) => (
                                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* 无凭证字段的通道（微信）：提示框 */}
                                {currentCh && isWechatLike && (
                                  <div className="px-3 py-2">
                                    <div className="flex items-start gap-2.5 bg-[#eff4ff] border border-blue-100 rounded-[4px] px-3 py-2.5">
                                      <Info className="w-4 h-4 text-[#355EF1] mt-0.5 shrink-0" />
                                      <MetaText as="p" tone="brand" className="leading-relaxed">
                                        微信通道通过扫码授权接入，管控端仅创建占位记录，实际扫码绑定由租户在用户端完成。
                                      </MetaText>
                                    </div>
                                  </div>
                                )}

                                {/* 凭证字段录入 */}
                                {currentCh && !isWechatLike && (currentCh.fields ?? []).length > 0 && (
                                  (currentCh.fields ?? []).map((field) => {
                                    const visible = isSecretVisible("__draft__", field.key);
                                    return (
                                      <div key={field.key} className="px-3 py-2 space-y-1.5">
                                        <MetaMedium as="label">{field.label}</MetaMedium>
                                        <div className="relative">
                                          <Input
                                            type={field.secret && !visible ? "password" : "text"}
                                            value={channelDraftFields[field.key] ?? ""}
                                            onChange={(e) => setChannelDraftFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.label}
                                            className="bg-background border-[#e5e5e5] text-xs h-8 pr-9"
                                          />
                                          {field.secret && (
                                            <button
                                              type="button"
                                              onClick={() => toggleSecretVisibility("__draft__", field.key)}
                                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                                            >
                                              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              <div className="flex justify-end gap-2 border-t border-[#f0f0f0] px-3 py-2">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={cancelAddChannel}>
                                  取消
                                </Button>
                                <Button
                                  size="sm"
                                  variant="dialog-confirm"
                                  className="h-7 px-2 text-xs"
                                  onClick={confirmAddChannel}
                                  disabled={!channelDraft}
                                >
                                  确认添加
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {/* 已安装技能 */}
                <div>
                  <MetaText as="div" className="mb-2">已安装技能（{getClawDetail(selectedClaw.id).installedSkills.length}）</MetaText>
                  {getClawDetail(selectedClaw.id).installedSkills.length === 0 ? (
                    <MetaText as="div" tone="weak" className="px-4 py-6 bg-background rounded-[4px] border border-dashed border-[#e5e5e5] text-center">
                      暂未安装技能
                    </MetaText>
                  ) : (
                    <div className="overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-background">
                      <Table density="compact">
                        <TableHeader>
                          <TableRow>
                            <TableHead>技能名称</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getClawDetail(selectedClaw.id).installedSkills.map((skill) => (
                            <TableRow key={skill}>
                              <TableCell>
                                <MiniBodyText>{skill}</MiniBodyText>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </DrawerBody>
          </DrawerContent>
        )}
      </Drawer>

      {/* 移除通道二次确认 */}
      <AlertDialog open={!!channelRemoveTarget} onOpenChange={(open) => { if (!open) setChannelRemoveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除通道</AlertDialogTitle>
            <AlertDialogDescription>
              移除「{channelRemoveTarget}」后，该 Agent 将无法通过此通道收发消息。该操作不会删除通道下已有的凭证配置，可在用户端重新接入。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmRemoveChannel}
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 模型操作二次确认（设为主/删主/删备）—— 与用户端 OpenClawDetail 保持一致 */}
      <Dialog
        open={modelConfirmDialog.open}
        onOpenChange={(open) => !open && setModelConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#355EF1]">
              {modelConfirmDialog.type === "delete"
                ? "确认删除主模型"
                : modelConfirmDialog.type === "delete-backup"
                ? "确认删除备选模型"
                : "切换主模型"}
            </DialogTitle>
            <DialogDescription className="text-[#737373] leading-relaxed pt-1">
              {modelConfirmDialog.type === "delete"
                ? "删除后将自动切换备选模型作为主模型，切换过程中将导致相关的 Gateway 服务重启"
                : modelConfirmDialog.type === "delete-backup"
                ? "删除后将导致相关的 Gateway 服务重启，确认删除么"
                : "将此模型设为主模型后，原主模型将降为备选模型。切换过程中会自动重启 Gateway 服务，是否继续？"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModelConfirmDialog(prev => ({ ...prev, open: false }))}
            >
              取消
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={runModelConfirm}
            >
              {modelConfirmDialog.type === "delete" || modelConfirmDialog.type === "delete-backup"
                ? "确认删除"
                : "确认设置"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 监控抽屉 */}
      {showMonitorDrawer && selectedClaw && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowMonitorDrawer(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[640px] bg-white shadow-lg overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] bg-white">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">{selectedClaw.name} - 监控</h2>
              <button
                onClick={() => setShowMonitorDrawer(false)}
                className="p-1 hover:bg-[#f5f5f5] rounded"
              >
                <X className="w-5 h-5 text-[#A3A3A3]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tokens 分析区 */}
              <div>
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Tokens 分析</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "输入 Tokens", value: "1,234", icon: ArrowUp,    color: "from-indigo-500 to-indigo-600" },
                    { label: "输出 Tokens", value: "5,678", icon: ArrowDown,   color: "from-purple-500 to-purple-600" },
                    { label: "总 Tokens",   value: "6,912", icon: Zap,         color: "from-blue-600 to-purple-600" },
                  ].map((stat) => (
                    <div key={stat.label}
                      className="bg-white rounded-[4px] border border-[#e5e5e5] p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-[4px] bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                          <stat.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs text-[#A3A3A3]">{stat.label}</p>
                      </div>
                      <p className="text-xl font-bold text-[#0A0A0A]">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLocation('/admin/tokens-monitor')}
                  className="mt-4 text-sm text-[#355EF1] hover:text-[#355EF1] flex items-center gap-1"
                >
                  查看完整 Tokens 监控 <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 分隔线 */}
              {clsEnabled && <div className="border-t border-[#e5e5e5]" />}

              {/* 会话记录区 - 仅当 CLS 日志服务开启时显示 */}
              {clsEnabled && (
                <div>
                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">会话记录</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "总会话数", value: "42",  icon: MessageCircle, color: "from-blue-500 to-blue-600" },
                      { label: "平均轮次", value: "8.5", icon: RotateCw,     color: "from-cyan-500 to-cyan-600" },
                    ].map((stat) => (
                      <div key={stat.label}
                        className="bg-white rounded-[4px] border border-[#e5e5e5] p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-7 h-7 rounded-[4px] bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                            <stat.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-xs text-[#A3A3A3]">{stat.label}</p>
                        </div>
                        <p className="text-xl font-bold text-[#0A0A0A]">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* 会话摘要表格 */}
                  <div className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden"
                  >
                    <table className="w-full text-sm table-fixed">
                      <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '28%' }} />
                        <col style={{ width: '24%' }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-gray-50 bg-[#fafafa]/50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide">会话</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide">类型</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide">模型</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide">最新时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#e5e5e5] hover:bg-[#f5f5f5]/60 transition-colors">
                          <td className="px-4 py-3 text-[#0A0A0A] font-mono text-xs truncate">c3b2ac3c</td>
                          <td className="px-4 py-3 text-[#737373] text-xs truncate">Feishu Dm</td>
                          <td className="px-4 py-3 text-[#737373] text-xs truncate">hunyuan-turbos-latest</td>
                          <td className="px-4 py-3 text-[#737373] text-xs">2026-03-09 17:49</td>
                        </tr>
                        <tr className="border-b border-[#e5e5e5] hover:bg-[#f5f5f5]/60 transition-colors">
                          <td className="px-4 py-3 text-[#0A0A0A] font-mono text-xs truncate">81c87c7b</td>
                          <td className="px-4 py-3 text-[#737373] text-xs truncate">QQ Dm</td>
                          <td className="px-4 py-3 text-[#737373] text-xs truncate">hunyuan-turbos-latest</td>
                          <td className="px-4 py-3 text-[#737373] text-xs">2026-03-09 10:07</td>
                        </tr>
                        <tr className="hover:bg-[#f5f5f5]/60 transition-colors">
                          <td className="px-4 py-3 text-[#0A0A0A] font-mono text-xs truncate">267e462d</td>
                          <td className="px-4 py-3 text-[#737373] text-xs truncate">CLI</td>
                          <td className="px-4 py-3 text-[#737373] text-xs truncate">deepseek-v3.2</td>
                          <td className="px-4 py-3 text-[#737373] text-xs">2026-03-08 12:54</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => setLocation('/admin/session-management')}
                    className="mt-4 text-sm text-[#355EF1] hover:text-[#355EF1] flex items-center gap-1"
                  >
                    查看完整会话管理 <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes breathing {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-breathing {
          animation: breathing 2s ease-in-out infinite;
        }
      `}</style>

      {/* 命令下发弹窗（取代旧抽屉）：
        * - 从工具栏「命令下发」主按钮触发，预填已选实例
        * - 用户在弹窗内选择命令模板 → 选执行策略 → 提交
        */}
      <DispatchCommandDialog
        open={dispatchPresetIds !== null}
        onOpenChange={(v) => !v && setDispatchPresetIds(null)}
        command={null}
        presetInstanceIds={dispatchPresetIds ?? undefined}
        onDispatched={() => {
          // 下发成功后清空选中状态，便于用户继续操作
          setSelectedIds(new Set());
        }}
      />

      {/* 版本更新记录侧边栏（点击新版本推送提醒打开，默认开启「仅看可推送新版本」） */}
      <UpdateRecordsDrawerForAgentList
        open={showUpdateRecordsDrawer}
        onOpenChange={setShowUpdateRecordsDrawer}
      />
    </TooltipProvider>
  );
}

// ─── 工具栏新版本提醒入口（与 Agent 类型页同款黄色横幅，点击触发外部回调） ─────
function ImageUpdateBellEntry({ onClick }: { onClick: () => void }) {
  return <NewVersionPushNotice onViewAllRecords={onClick} />;
}

// ─── 版本更新记录侧边栏（适配 Agent 列表页：从 useOutdatedTypes 构造 pushable） ─────
function UpdateRecordsDrawerForAgentList({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const outdated = useOutdatedTypes();
  const pushable: PushableItem[] = outdated.map((o) => ({
    agentType: o.agentType,
    agentTypeLabel: o.agentTypeLabel,
    enabledVersion: o.enabledVersion,
    outdatedInstanceCount: o.outdatedCount,
    allUpToDate: o.outdatedCount === 0,
    imageSource: o.imageSource,
    imageName: o.enabledImageName,
    enabledImage: o.enabledImageId ? { id: o.enabledImageId } : undefined,
  }));
  return (
    <UpdateRecordsDrawer
      open={open}
      onOpenChange={onOpenChange}
      onPush={() => { /* Agent 列表页不直接触发推送，仅查看 */ }}
      pushable={pushable}
      initialPushableOnly
    />
  );
}
