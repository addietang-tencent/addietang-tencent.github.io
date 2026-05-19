/**
 * ImageManagement - 管控端 Agent 类型 / 镜像管理页（扁平表格 + 行内展开版）
 *
 * 心智路径：
 *   1. 进入页面 → 看到所有 Agent 类型表格
 *   2. 每行 = 一个 Agent 类型（含当前生效镜像信息 + 应用范围）
 *   3. 系统预设类型（OpenClaw / Hermes / LightClaw ACE）固有，自定义类型可加可删
 *   4. 「用户可见 Switch」决定该类型对用户开放
 *   5. 「应用范围」决定该类型对哪些用户/分组可见（沿用 OneID 群组三态）
 *   6. 「查看镜像」展开行内二级 Tab：公共镜像候选 / 已导入自定义镜像
 *
 * 关键约束：
 *   - 同 Agent 类型下只能有一个镜像启用（active=true）
 *   - 删除自定义类型前必须先清空类型下的镜像 + 不能是用户端首选类型
 *   - 公共镜像不可删除 / 不可编辑
 *   - 创建 native（自研）类型必须勾选确认"允许用户进入终端"
 */
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Info,
  RefreshCw,
  ExternalLink,
  Search,
  ChevronsUpDown,
  Plus,
  Sparkles,
  Star,
  Wrench,
  Check,
  X as XIcon,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Pencil,
  Minus,
  Users,
} from "lucide-react";

import AgentTypesTable, {
  type AgentTypeRowData,
} from "./ImageManagement/AgentTypesTable";
import PublicImageHistoryDialog from "./ImageManagement/PublicImageHistoryDialog";
import UpdateRecordSidebar from "./ImageManagement/UpdateRecordSidebar";
import UpdateRecordsDrawer from "./ImageManagement/UpdateRecordsDrawer";
import PushUpgradeDialog, {
  type PushableAgentType,
} from "./ImageManagement/PushUpgradeDialog";
import { loadCustomTypes, saveCustomTypes, nowStr } from "./ImageManagement/customAgentStore";
import type { CustomAgentType, KernelBase } from "./ImageManagement/types";
import {
  AGENT_VERSIONS,
  getImageMeta,
} from "./VersionManagement/mockData";
import {
  deriveAgentTypeView,
  IMG_TO_VERSION_KEY,
  getHardenedImageId,
  type ImageRow,
} from "./ImageManagement/deriveAgentTypeView";
import { pruneOnVersionChange } from "@/lib/upgradePushStore";
import type { UserGroup } from "./MemberManagement/types";
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from "./MemberManagement/mock";
import { buildGroupTree, type GroupTreeNode } from "./MemberManagement/health";

// ─── 系统预设 Agent 类型 ────────────────────────────────────────────────
interface AgentTypeConfig {
  value: string;
  label: string;
  isSystem: boolean;
  versionPlaceholder: string;
  versionRegex: RegExp | null;
}

const SYSTEM_AGENT_TYPES: AgentTypeConfig[] = [
  { value: "OpenClaw",     label: "OpenClaw",      isSystem: true, versionPlaceholder: "如 2026.4.2", versionRegex: /^\d{4}\.\d{1,2}\.\d{1,2}$/ },
  { value: "HermesAgent",  label: "Hermes Agent",  isSystem: true, versionPlaceholder: "如 0.8.0",    versionRegex: /^\d+\.\d+\.\d+$/ },
  { value: "LightClawACE", label: "LightClaw ACE", isSystem: true, versionPlaceholder: "如 1.0.2",    versionRegex: /^\d+\.\d+\.\d+$/ },
];

const DEFAULT_AGENT_TYPE = "OpenClaw";

// 自定义内核（native）创建提醒文案
const NATIVE_KERNEL_NOTICE_TITLE = "管控台部分功能在该类型上不可用";
const NATIVE_KERNEL_NOTICE_LINES = [
  "1. 员工端需要登录\"终端\"配置模型/通道/技能，不支持管控台快捷配置；",
  "2. 管控端部分功能不可用：如 Agent 工具库、记忆管理、网盘管理、运维观测、AI Agent 安全、会话管理 等功能将不可用",
];

function validateVersion(config: AgentTypeConfig, version: string): boolean {
  if (!config.versionRegex) return version.trim().length > 0;
  if (!config.versionRegex.test(version)) return false;
  if (config.value === "OpenClaw") {
    const [y, m, d] = version.split(".").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }
  return true;
}

// 兼容内核选项（创建自定义类型时用）
interface KernelOption {
  value: KernelBase;
  title: string;
  description: string;
}
const KERNEL_OPTIONS: KernelOption[] = [
  { value: "OpenClaw",     title: "兼容 OpenClaw",      description: "该类型与 OpenClaw 完全兼容，管控台功能与 OpenClaw 保持一致" },
  { value: "HermesAgent",  title: "兼容 Hermes Agent",  description: "该类型与 Hermes Agent 完全兼容，管控台功能与 Hermes Agent 保持一致" },
  { value: "LightClawACE", title: "兼容 LightClaw ACE", description: "该类型与 LightClaw ACE 完全兼容，管控台功能与 LightClaw ACE 保持一致" },
  { value: "native",       title: "自定义内核 / 不兼容上述已知类型", description: "完全自研，与上述已知 Agent 内核均不兼容；部分管控台功能将不可用，详见下方说明" },
];

const kernelBaseLabel = (kb: KernelBase): string | undefined => {
  if (kb === "OpenClaw") return "OpenClaw";
  if (kb === "HermesAgent") return "Hermes Agent";
  if (kb === "LightClawACE") return "LightClaw ACE";
  return undefined;
};

// ─── Mock 镜像数据 ─────────────────────────────────────────────────────
// ─── 公共镜像 mock：使用真实 ID（参考产研发版记录）──────────────────────
// 每条 agentVersion 取该镜像最新更新记录中的版本号
const PUBLIC_IMAGES: { id: string; name: string; agentType: string; agentVersion: string; os: string; activeByDefault: boolean }[] = [
  // OpenClaw 系列（4 个）
  { id: "img-idzg74s9", name: "OpenClaw on Ubuntu 24.04",                          agentType: "OpenClaw",     agentVersion: "2026.4.23", os: "Ubuntu 24.04 x86_64",          activeByDefault: true  },
  { id: "img-nmg7pw1r", name: "OpenClaw on TencentOS Server 4",                    agentType: "OpenClaw",     agentVersion: "2026.4.23", os: "TencentOS Server 4 x86_64",    activeByDefault: false },
  { id: "img-pf18atu9", name: "OpenClaw on TencentOS Server 4 For Tencent",        agentType: "OpenClaw",     agentVersion: "2026.4.23", os: "TencentOS Server 4 (TKernel5)", activeByDefault: false },
  // Hermes Agent 系列（2 个）
  { id: "img-al484uhr", name: "Hermes Agent on Ubuntu 24.04",                      agentType: "HermesAgent",  agentVersion: "v0.12.0",   os: "Ubuntu 24.04 x86_64",          activeByDefault: true  },
  { id: "img-ppz9gfjn", name: "Hermes Agent on TencentOS Server 4",                agentType: "HermesAgent",  agentVersion: "v0.12.0",   os: "TencentOS Server 4 x86_64",    activeByDefault: false },
  // LightClaw ACE（1 个）
  { id: "img-0dvlda3b", name: "LightClaw ACE on TencentOS Server 4",               agentType: "LightClawACE", agentVersion: "v0.1.8",    os: "TencentOS Server 4 x86_64",    activeByDefault: true  },
];

const PUBLIC_IMAGE_ROWS: ImageRow[] = PUBLIC_IMAGES.map((p) => ({
  id: p.id, name: p.name, status: "available", type: "public",
  agentType: p.agentType, agentVersion: p.agentVersion, os: p.os,
  createTime: "2026-04-30 17:11:52", active: p.activeByDefault,
}));

const CUSTOM_IMAGES = [
  { id: "img-cust00001", name: "openclaw-custom-v1.0" },
  { id: "img-cm9xkd24",  name: "hermes-custom-v0.7" },
  { id: "img-q8r3s7t0",  name: "lightclaw-prod-2025Q4" },
  { id: "img-m3n4o5p6",  name: "openclaw-dev-latest" },
  { id: "img-a7v2zk0w",  name: "agent-test-v2.0" },
];

const MOCK_IMAGES: ImageRow[] = [
  ...PUBLIC_IMAGE_ROWS,
  // 演示用自定义镜像
  { id: "img-cust00001", name: "openclaw-custom-v1.0",   status: "available", type: "custom", agentType: "OpenClaw", agentVersion: "2025.9.1", os: "CentOS 7.9 64位", createTime: "2025-09-15 14:22:35", active: false },
  { id: "img-cust00002", name: "legacy-image-v1",        status: "available", type: "custom", agentType: "OpenClaw", agentVersion: "",         os: "CentOS 7.9 64位", createTime: "2025-06-01 12:00:00", active: false },
];

function normalizeImages(imgs: ImageRow[]): ImageRow[] {
  return imgs.map((img) => (img.agentType ? img : { ...img, agentType: "OpenClaw" }));
}

// ─── 应用范围（按 Agent 类型维度） ───────────────────────────────────────
interface ImageScopeData {
  visibilityScope: "all" | "groups";
  visibilityGroupIds: string[];
}

const ALL_GROUPS: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];

function getGroupPath(groupId: string, groups: UserGroup[]): string {
  const map = new Map(groups.map((g) => [g.id, g]));
  const chain: string[] = [];
  let cur = map.get(groupId);
  while (cur) {
    chain.unshift(cur.name);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return chain.join("/");
}

type CheckState = "checked" | "unchecked" | "indeterminate";

function getCheckState(node: GroupTreeNode, selectedIds: Set<string>): CheckState {
  if (selectedIds.has(node.id)) return "checked";
  if (node.children.length === 0) return "unchecked";
  let hasChecked = false;
  let hasUnchecked = false;
  for (const c of node.children) {
    const s = getCheckState(c, selectedIds);
    if (s === "checked") hasChecked = true;
    else if (s === "unchecked") hasUnchecked = true;
    else { hasChecked = true; hasUnchecked = true; }
    if (hasChecked && hasUnchecked) return "indeterminate";
  }
  if (hasChecked && !hasUnchecked) return "checked";
  if (!hasChecked && hasUnchecked) return "unchecked";
  return "indeterminate";
}

function getDescendantIds(node: GroupTreeNode): string[] {
  const ids: string[] = [node.id];
  node.children.forEach((c) => ids.push(...getDescendantIds(c)));
  return ids;
}

function ImageScopePopover({
  scopeData,
  groups,
  onSave,
}: {
  scopeData: ImageScopeData;
  groups: UserGroup[];
  onSave: (scope: "all" | "groups", groupIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<"all" | "groups">(scopeData.visibilityScope);
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>(scopeData.visibilityGroupIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  type DisplayBucket = "dept" | "custom";
  const groupsByBucket = useMemo(() => {
    const buckets: Record<DisplayBucket, UserGroup[]> = { dept: [], custom: [] };
    groups.forEach((g) => { if (g.source === "oneid-dept") buckets.dept.push(g); else buckets.custom.push(g); });
    return buckets;
  }, [groups]);

  const activeBuckets = useMemo(() => {
    const order: DisplayBucket[] = ["dept", "custom"];
    return order.filter((b) => groupsByBucket[b].length > 0);
  }, [groupsByBucket]);

  const BUCKET_LABELS: Record<DisplayBucket, string> = { dept: "部门", custom: "自定义分组" };

  const treesMap = useMemo(() => {
    const map: Record<string, GroupTreeNode[]> = {};
    activeBuckets.forEach((b) => { map[b] = buildGroupTree(groupsByBucket[b]); });
    return map;
  }, [activeBuckets, groupsByBucket]);

  const hasGroups = activeBuckets.length > 0;

  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(scopeData.visibilityScope);
      setDraftGroupIds([...scopeData.visibilityGroupIds]);
      setSearchQuery("");
      const expandSet = new Set<string>();
      const groupMap = new Map(groups.map((g) => [g.id, g]));
      scopeData.visibilityGroupIds.forEach((gid) => {
        let cur = groupMap.get(gid);
        while (cur && cur.parentId) { expandSet.add(cur.parentId); cur = groupMap.get(cur.parentId); }
      });
      activeBuckets.forEach((b) => { treesMap[b]?.forEach((root) => expandSet.add(root.id)); });
      setExpanded(expandSet);
    }
    setOpen(v);
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const toggleNode = (node: GroupTreeNode) => {
    const ids = new Set(draftGroupIds);
    const state = getCheckState(node, ids);
    const descendants = getDescendantIds(node);
    if (state === "checked") { descendants.forEach((d) => ids.delete(d)); }
    else { descendants.forEach((d) => ids.add(d)); }
    setDraftGroupIds(Array.from(ids));
  };

  const handleClearSelection = () => { setDraftGroupIds([]); setSearchQuery(""); };

  const isConfirmDisabled = draftScope === "groups" && draftGroupIds.length === 0;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onSave(draftScope, draftScope === "all" ? [] : draftGroupIds);
    setOpen(false);
    toast.success("应用范围已更新");
  };

  const matchedGroupIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return new Set(
      groups
        .filter((g) => g.name.toLowerCase().includes(q) || getGroupPath(g.id, groups).toLowerCase().includes(q))
        .map((g) => g.id),
    );
  }, [searchQuery, groups]);

  const isNodeVisible = (node: GroupTreeNode): boolean => {
    if (!matchedGroupIds) return true;
    if (matchedGroupIds.has(node.id)) return true;
    return node.children.some(isNodeVisible);
  };

  const renderTreeNode = (node: GroupTreeNode, depth: number) => {
    if (!isNodeVisible(node)) return null;
    const selectedSet = new Set(draftGroupIds);
    const checkState = getCheckState(node, selectedSet);
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    return (
      <div key={node.id}>
        <button
          onClick={() => toggleNode(node)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {hasChildren ? (
            <span
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <span
            className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
              checkState === "checked"
                ? "bg-blue-500 border-blue-500"
                : checkState === "indeterminate"
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 bg-white"
            }`}
          >
            {checkState === "checked" && <Check className="w-2.5 h-2.5 text-white" />}
            {checkState === "indeterminate" && <Minus className="w-2.5 h-2.5 text-white" />}
          </span>
          <span className="text-xs text-gray-700 truncate">{node.name}</span>
        </button>
        {hasChildren && isExpanded && node.children.map((c) => renderTreeNode(c, depth + 1))}
      </div>
    );
  };

  const selectedTags = useMemo(() => {
    const selectedSet = new Set(draftGroupIds);
    const collectEffective = (nodes: GroupTreeNode[]): string[] => {
      const result: string[] = [];
      for (const node of nodes) {
        const state = getCheckState(node, selectedSet);
        if (state === "checked") { result.push(node.id); }
        else if (state === "indeterminate") { result.push(...collectEffective(node.children)); }
      }
      return result;
    };
    const effectiveIds: string[] = [];
    activeBuckets.forEach((b) => { effectiveIds.push(...collectEffective(treesMap[b] || [])); });
    return effectiveIds.map((gid) => ({ id: gid, path: getGroupPath(gid, groups) }));
  }, [draftGroupIds, groups, activeBuckets, treesMap]);

  const selectedGroupPaths = useMemo(() => {
    const selectedSet = new Set(scopeData.visibilityGroupIds);
    const collectEffective = (nodes: GroupTreeNode[]): string[] => {
      const result: string[] = [];
      for (const node of nodes) {
        const state = getCheckState(node, selectedSet);
        if (state === "checked") { result.push(node.id); }
        else if (state === "indeterminate") { result.push(...collectEffective(node.children)); }
      }
      return result;
    };
    const effectiveIds: string[] = [];
    activeBuckets.forEach((b) => { effectiveIds.push(...collectEffective(treesMap[b] || [])); });
    return effectiveIds.map((gid) => getGroupPath(gid, groups));
  }, [groups, scopeData.visibilityGroupIds, activeBuckets, treesMap]);

  const renderBadges = () => {
    if (scopeData.visibilityScope === "all" || selectedGroupPaths.length === 0) {
      // 默认态："全部用户"用图标+文字（无方框），与下方"按分组"徽章拉开层级
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 whitespace-nowrap">
          <Users className="w-3 h-3 text-gray-400" />
          全部用户
        </span>
      );
    }
    const firstName = selectedGroupPaths[0];
    const rest = selectedGroupPaths.length - 1;
    const tooltipText = selectedGroupPaths.join("\n");
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 max-w-[140px] truncate">
              {firstName}
            </span>
            {rest > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
                +{rest}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] text-xs leading-relaxed whitespace-pre-line">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5 min-h-[20px]">
      {renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button className="self-center text-gray-300 hover:text-blue-500 transition-colors" title="编辑应用范围">
            <Pencil className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 flex flex-col max-h-[420px]" align="end" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-0">
            <div className="flex gap-1.5">
              <button onClick={() => setDraftScope("all")} className={`flex-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${draftScope === "all" ? "border-blue-200 bg-blue-50 text-blue-600" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>全部用户</button>
              <button onClick={() => setDraftScope("groups")} className={`flex-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${draftScope === "groups" ? "border-blue-200 bg-blue-50 text-blue-600" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>按分组</button>
            </div>
            {draftScope === "groups" && (
              <div className="space-y-1.5">
                {!hasGroups ? (
                  <div className="text-center py-5 px-2">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      暂无分组，请前往
                      <a
                        href="/admin/members"
                        className="text-blue-500 hover:text-blue-600 hover:underline mx-0.5"
                        onClick={(e) => { e.preventDefault(); setOpen(false); window.location.href = "/admin/members"; }}
                      >
                        用户管理
                      </a>
                      建立分组
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="group relative flex flex-wrap items-center gap-1 px-2 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-colors max-h-[80px] overflow-y-auto">
                      {selectedTags.map((tag) => (
                        <span key={tag.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-xl border border-blue-100 shrink-0 max-w-[200px]">
                          <span className="truncate">{tag.path}</span>
                          <button
                            onClick={() => {
                              const findNode = (nodes: GroupTreeNode[]): GroupTreeNode | undefined => {
                                for (const n of nodes) {
                                  if (n.id === tag.id) return n;
                                  const found = findNode(n.children);
                                  if (found) return found;
                                }
                                return undefined;
                              };
                              let targetNode: GroupTreeNode | undefined;
                              for (const b of activeBuckets) {
                                targetNode = findNode(treesMap[b] || []);
                                if (targetNode) break;
                              }
                              const idsToRemove = targetNode
                                ? new Set(getDescendantIds(targetNode))
                                : new Set([tag.id]);
                              setDraftGroupIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
                            }}
                            className="text-blue-400 hover:text-blue-600 shrink-0"
                          >
                            <XIcon className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder={selectedTags.length === 0 ? "请输入分组名称" : ""}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 min-w-[60px] text-xs bg-transparent outline-none placeholder:text-gray-400"
                      />
                      {(selectedTags.length > 0 || searchQuery) && (
                        <button
                          onClick={handleClearSelection}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="清除全部"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-[220px] overflow-y-auto">
                      {activeBuckets.map((bucket) => {
                        const trees = treesMap[bucket];
                        if (!trees || trees.length === 0) return null;
                        const anyVisible = trees.some(isNodeVisible);
                        if (!anyVisible) return null;
                        return (
                          <div key={bucket} className="mb-1">
                            <div className="px-2 py-1 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                              {BUCKET_LABELS[bucket]}
                            </div>
                            {trees.map((root) => renderTreeNode(root, 0))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-[#e5e5e5] shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" className="h-7 text-xs px-3" disabled={isConfirmDisabled} onClick={handleConfirm}>确认</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── 顶部总览卡片 ───────────────────────────────────────────────────────
function OverviewStats({
  typeCount,
  enabledTypeCount,
  imageCount,
}: {
  typeCount: number;
  enabledTypeCount: number;
  imageCount: number;
}) {
  return (
    <div className="inline-flex items-center gap-4 px-4 py-2 rounded-lg bg-gray-50/80 border border-gray-100 text-xs text-gray-500">
      <span>
        Agent 类型 <span className="text-gray-900 font-semibold tabular-nums">{typeCount}</span>
      </span>
      <span className="text-gray-300">·</span>
      <span>
        已对用户可见 <span className="text-blue-600 font-semibold tabular-nums">{enabledTypeCount}</span>
      </span>
      <span className="text-gray-300">·</span>
      <span>
        镜像总数 <span className="text-gray-900 font-semibold tabular-nums">{imageCount}</span>
      </span>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────────────────────
export default function ImageManagement() {
  // 镜像列表（持久化）
  const [images, setImages] = useState<ImageRow[]>(() => {
    try {
      const raw = localStorage.getItem("admin_images_v3");
      if (raw) return JSON.parse(raw) as ImageRow[];
    } catch { /* ignore */ }
    // 首次访问：用默认 mock 数据并主动持久化，确保其他页面（如 OpenClawMonitor）能立即读到启用版本
    const initial = normalizeImages(MOCK_IMAGES);
    try {
      localStorage.setItem("admin_images_v3", JSON.stringify(initial));
    } catch { /* ignore */ }
    return initial;
  });
  const syncImages = (next: ImageRow[]) => {
    setImages(next);
    localStorage.setItem("admin_images_v3", JSON.stringify(next));
  };

  // 自定义类型（持久化）
  const [customTypes, setCustomTypes] = useState<CustomAgentType[]>(() => loadCustomTypes());

  // 已添加的 agentType（系统 + 自定义），用于控制展示顺序
  const [addedTypes, setAddedTypes] = useState<string[]>(() => {
    const systemIds = SYSTEM_AGENT_TYPES.map((t) => t.value);
    const customIds = loadCustomTypes().map((t) => t.id);
    return [...systemIds, ...customIds];
  });

  // 用户端首选类型
  const [defaultAgentType, setDefaultAgentType] = useState<string>(() => {
    try {
      const v = localStorage.getItem("admin_default_agent_type");
      if (v) return v;
    } catch { /* ignore */ }
    return DEFAULT_AGENT_TYPE;
  });
  const syncDefaultAgentType = (v: string) => {
    setDefaultAgentType(v);
    localStorage.setItem("admin_default_agent_type", v);
  };

  // 应用范围（按 agentType 维度）
  const [typeScopeMap, setTypeScopeMap] = useState<Record<string, ImageScopeData>>(() => {
    try {
      const raw = localStorage.getItem("admin_image_type_scope_v1");
      if (raw) return JSON.parse(raw) as Record<string, ImageScopeData>;
    } catch { /* ignore */ }
    return {};
  });
  const getTypeScope = (typeValue: string): ImageScopeData =>
    typeScopeMap[typeValue] ?? { visibilityScope: "all", visibilityGroupIds: [] };
  const handleScopeChange = (typeValue: string, scope: "all" | "groups", groupIds: string[]) => {
    const next = { ...typeScopeMap, [typeValue]: { visibilityScope: scope, visibilityGroupIds: groupIds } };
    setTypeScopeMap(next);
    localStorage.setItem("admin_image_type_scope_v1", JSON.stringify(next));
  };

  // 添加自定义类型弹窗
  const [showCreateCustomDialog, setShowCreateCustomDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newKernelBase, setNewKernelBase] = useState<KernelBase | null>(null);
  const [nativeAck, setNativeAck] = useState(false);
  const newTypeNameError = useMemo(() => {
    if (!newTypeName.trim()) return "";
    const v = newTypeName.trim();
    const allDisplayNames = [
      ...SYSTEM_AGENT_TYPES.map((t) => t.label),
      ...customTypes.map((t) => t.displayName),
    ];
    if (allDisplayNames.includes(v)) return "该类型名称已存在";
    if (v.length < 2 || v.length > 40) return "长度需在 2-40 个字符之间";
    return "";
  }, [newTypeName, customTypes]);
  const resetCreateDialog = () => {
    setNewTypeName("");
    setNewKernelBase(null);
    setNativeAck(false);
  };

  // 删除自定义类型二次确认
  const [removeCustomConfirm, setRemoveCustomConfirm] = useState<CustomAgentType | null>(null);

  // 导入自定义镜像弹窗
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importTargetAgentType, setImportTargetAgentType] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [importAgentType, setImportAgentType] = useState("");
  const [importAgentVersion, setImportAgentVersion] = useState("");
  const [versionError, setVersionError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showImageList, setShowImageList] = useState(false);
  const imageListRef = useRef<HTMLDivElement>(null);

  // 编辑单个镜像弹窗
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingImageId, setEditingImageId] = useState("");
  const [editAgentType, setEditAgentType] = useState("");
  const [editAgentVersion, setEditAgentVersion] = useState("");
  const [editVersionError, setEditVersionError] = useState("");

  // 公共镜像版本更新记录
  const [publicHistoryCtx, setPublicHistoryCtx] = useState<{
    imageId: string;
    imageName: string;
    agentType: string;
  } | null>(null);

  // 推送更新弹窗
  const [showPushDialog, setShowPushDialog] = useState(false);
  const [pushDefaultType, setPushDefaultType] = useState<string | undefined>(undefined);

  // 「查看全部更新记录」抽屉
  const [showAllRecordsDrawer, setShowAllRecordsDrawer] = useState(false);

  const openPushDialog = (defaultType?: string) => {
    setPushDefaultType(defaultType);
    setShowPushDialog(true);
  };

  // helpers
  const getTypeConfig = (value: string) => SYSTEM_AGENT_TYPES.find((t) => t.value === value);
  const isCustomType = (value: string) => customTypes.some((t) => t.id === value);
  const getCustomType = (value: string) => customTypes.find((t) => t.id === value);
  const getTypeLabel = (value: string) =>
    getTypeConfig(value)?.label ?? getCustomType(value)?.displayName ?? value;

  // 用于"导入/编辑"时按目标类型决定校验规则
  const getEffectiveTypeConfig = (value: string): AgentTypeConfig | null => {
    const sys = getTypeConfig(value);
    if (sys) return sys;
    const custom = getCustomType(value);
    if (!custom) return null;
    if (custom.kernelBase !== "native") {
      return SYSTEM_AGENT_TYPES.find((t) => t.value === custom.kernelBase) ?? null;
    }
    return {
      value: custom.id,
      label: custom.displayName,
      isSystem: false,
      versionPlaceholder: "如 1.0.0",
      versionRegex: /^\d+\.\d+\.\d+$/,
    };
  };

  const displayTypes = addedTypes.filter(
    (v) => SYSTEM_AGENT_TYPES.some((c) => c.value === v) || isCustomType(v),
  );

  // 派生视图
  const views = useMemo(
    () =>
      displayTypes.map((t) => ({
        agentType: t,
        view: deriveAgentTypeView(images, t),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, addedTypes, customTypes],
  );

  // 计算"可推送的 Agent 类型"列表（已启用某镜像 + 旧版本实例数 mock 推断）
  const pushable: PushableAgentType[] = useMemo(() => {
    return views
      .filter(({ view }) => view.enabled.isEnabled && view.enabled.version)
      .map(({ agentType, view }) => {
        const enabledVersion = view.enabled.version!;
        const enabledImage = images.find(
          (i) => i.agentType === agentType && i.active,
        );
        if (!enabledImage) return null;
        // mock：旧版本实例数 = hash(agentType + version) % 30 + 5（演示用稳定值）
        const seed = `${agentType}:${enabledVersion}`;
        let h = 0;
        for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        const outdatedInstanceCount = (h % 28) + 3;
        const allUpToDate = outdatedInstanceCount === 0;
        return {
          agentType,
          agentTypeLabel: getTypeLabel(agentType),
          enabledVersion,
          enabledImage,
          imageName: enabledImage.name,
          imageSource: enabledImage.type,
          outdatedInstanceCount,
          allUpToDate,
        } satisfies PushableAgentType;
      })
      .filter((x): x is PushableAgentType => x !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [views, images]);

  // 创建自定义类型
  const canCreateCustom = !!newTypeName.trim()
    && !newTypeNameError
    && !!newKernelBase
    && (newKernelBase !== "native" || nativeAck);

  const handleCreateCustomType = () => {
    if (!canCreateCustom || !newKernelBase) return;
    const slugBase = newTypeName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "custom";
    let slug = slugBase;
    let idx = 1;
    const existingIds = customTypes.map((t) => t.id);
    while (existingIds.includes(`custom-${slug}`)) {
      slug = `${slugBase}-${++idx}`;
    }
    const newType: CustomAgentType = {
      id: `custom-${slug}`,
      displayName: newTypeName.trim(),
      kernelBase: newKernelBase,
      createdAt: nowStr(),
      updatedAt: nowStr(),
      linkedInstanceCount: 0,
      createdBy: "alice@acompany.com",
      nativeTerminalAck: newKernelBase === "native" ? true : undefined,
    };
    const nextTypes = [...customTypes, newType];
    setCustomTypes(nextTypes);
    saveCustomTypes(nextTypes);
    if (!addedTypes.includes(newType.id)) {
      setAddedTypes([...addedTypes, newType.id]);
    }
    toast.success(`已添加自定义 Agent 类型「${newType.displayName}」`);
    resetCreateDialog();
    setShowCreateCustomDialog(false);
    setTimeout(() => {
      const el = document.getElementById(`section-${newType.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // 删除类型
  const handleRemoveType = (value: string) => {
    if (SYSTEM_AGENT_TYPES.some((t) => t.value === value)) {
      toast.error("系统预设 Agent 类型不可移除");
      return;
    }
    if (defaultAgentType === value) {
      toast.error("该类型是用户端首选类型，请先切换首选类型");
      return;
    }
    if (images.some((i) => i.agentType === value && i.active)) {
      toast.error("该类型下有用户可见的镜像，请先关闭用户可见");
      return;
    }
    if (isCustomType(value)) {
      const customType = getCustomType(value)!;
      setRemoveCustomConfirm(customType);
    }
  };

  const confirmRemoveCustomType = () => {
    if (!removeCustomConfirm) return;
    const value = removeCustomConfirm.id;
    const nextCustomTypes = customTypes.filter((t) => t.id !== value);
    setCustomTypes(nextCustomTypes);
    saveCustomTypes(nextCustomTypes);
    syncImages(images.filter((i) => i.agentType !== value));
    setAddedTypes(addedTypes.filter((v) => v !== value));
    if (typeScopeMap[value]) {
      const next = { ...typeScopeMap };
      delete next[value];
      setTypeScopeMap(next);
      localStorage.setItem("admin_image_type_scope_v1", JSON.stringify(next));
    }
    setRemoveCustomConfirm(null);
    toast.success(`已删除自定义 Agent 类型「${removeCustomConfirm.displayName}」`);
  };

  // 启用/关闭/编辑/导入/默认 等 handlers
  const handleEnableImage = (imageId: string, hintAgentType?: string) => {
    const existing = images.find((i) => i.id === imageId);
    if (existing) {
      if (!existing.agentVersion?.trim()) {
        toast.error("此镜像缺少版本号，无法对用户可见，请先编辑补齐");
        return;
      }
      syncImages(images.map((i) =>
        i.agentType === existing.agentType ? { ...i, active: i.id === imageId } : i,
      ));
      // 启用版本变了 → 撤回该类型的旧推送（如有）
      pruneOnVersionChange(existing.agentType, existing.agentVersion);
      toast.success(`已对用户可见「${existing.name}」（v${existing.agentVersion}）`);
      return;
    }
    const virtual = resolveVirtualPublicImage(imageId, hintAgentType);
    if (!virtual) { toast.error("镜像信息不完整，无法对用户可见"); return; }
    const newImage: ImageRow = {
      id: virtual.imageId, name: virtual.imageName, status: "available", type: "public",
      agentType: virtual.agentType, agentVersion: virtual.latestVersion,
      os: "CentOS 7.9 64位", createTime: nowStr(), active: true,
    };
    syncImages([
      ...images.map((i) => i.agentType === virtual.agentType ? { ...i, active: false } : i),
      newImage,
    ]);
    if (!addedTypes.includes(virtual.agentType)) setAddedTypes([...addedTypes, virtual.agentType]);
    pruneOnVersionChange(virtual.agentType, virtual.latestVersion);
    toast.success(`已对用户可见「${virtual.imageName}」（v${virtual.latestVersion}）`);
  };

  const resolveVirtualPublicImage = (imageId: string, hintAgentType?: string) => {
    const candidates: string[] = hintAgentType ? [hintAgentType] : Object.keys(IMG_TO_VERSION_KEY);
    for (const agentType of candidates) {
      const versionKey = IMG_TO_VERSION_KEY[agentType];
      if (!versionKey) continue;
      const meta = getImageMeta(versionKey);
      const latest = AGENT_VERSIONS.filter((v) => v.agentType === versionKey)
        .sort((a, b) => b.releaseTime.localeCompare(a.releaseTime))[0];
      if (!meta || !latest) continue;
      if (imageId === meta.imageId) {
        return { imageId: meta.imageId, imageName: meta.imageName, agentType, latestVersion: latest.version };
      }
      const hardenedId = getHardenedImageId(agentType);
      if (hardenedId && imageId === hardenedId) {
        return { imageId: hardenedId, imageName: `${meta.imageName} · 安全加固版`, agentType, latestVersion: latest.version };
      }
    }
    return null;
  };

  const handleDisableImage = (imageId: string) => {
    const target = images.find((i) => i.id === imageId);
    if (!target || !target.active) return;
    if (target.agentType === defaultAgentType) {
      toast.error(`${getTypeLabel(target.agentType)} 是用户端首选类型，必须保持有用户可见的镜像。请先切换其它镜像或修改首选类型`);
      return;
    }
    syncImages(images.map((i) => (i.id === imageId ? { ...i, active: false } : i)));
    // 关闭用户可见 → 没有启用版本，撤回该类型的旧推送
    pruneOnVersionChange(target.agentType, null);
    toast.success(`已关闭「${target.name}」用户可见，该 Agent 类型当前对用户不可见`);
  };

  const openPublicHistoryByImage = (imageId: string) => {
    const existing = images.find((i) => i.id === imageId);
    if (existing) {
      setPublicHistoryCtx({ imageId: existing.id, imageName: existing.name, agentType: existing.agentType });
      return;
    }
    const virtual = resolveVirtualPublicImage(imageId);
    if (virtual) setPublicHistoryCtx({ imageId: virtual.imageId, imageName: virtual.imageName, agentType: virtual.agentType });
  };

  const openImportFor = (agentType: string) => {
    setImportTargetAgentType(agentType);
    setImportAgentType(agentType);
    setImportAgentVersion("");
    setVersionError("");
    setSelectedImageId("");
    setShowImportDialog(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowImportDialog(open);
    if (!open) {
      setSelectedImageId(""); setImportAgentType(""); setImportAgentVersion("");
      setVersionError(""); setSearchQuery(""); setShowImageList(false); setImportTargetAgentType("");
    }
  };

  const handleClickOutsideImageList = (e: React.MouseEvent) => {
    if (imageListRef.current && !imageListRef.current.contains(e.target as Node)) setShowImageList(false);
  };

  const filteredImportImages = CUSTOM_IMAGES.filter((img) =>
    img.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success("镜像列表已刷新"); }, 1000);
  };

  const handleSelectImage = (imgId: string) => {
    setSelectedImageId(imgId); setShowImageList(false); setSearchQuery("");
  };

  const handleVersionChange = (v: string) => {
    setImportAgentVersion(v);
    if (v && importAgentType) {
      const config = getEffectiveTypeConfig(importAgentType);
      if (config && config.versionRegex && !config.versionRegex.test(v)) {
        setVersionError(`格式不正确，请输入 ${config.versionPlaceholder.replace("如 ", "")} 格式`);
      } else if (importAgentType === "OpenClaw" && config && !validateVersion(config, v)) {
        setVersionError("日期不合法");
      } else { setVersionError(""); }
    } else { setVersionError(""); }
  };

  const canImport =
    selectedImageId && importAgentType && importAgentVersion.trim() && !versionError;

  const handleImport = () => {
    if (!selectedImageId) { toast.error("请选择要关联的镜像"); return; }
    if (!importAgentType) { toast.error("请选择 Agent 类型"); return; }
    if (!importAgentVersion.trim()) { toast.error("请填写 Agent 版本"); return; }
    const config = getEffectiveTypeConfig(importAgentType);
    if (config && config.versionRegex && !validateVersion(config, importAgentVersion)) {
      toast.error("版本格式不正确"); return;
    }
    if (images.some((img) => img.id === selectedImageId)) { toast.error("该镜像已在列表中"); return; }
    const img = CUSTOM_IMAGES.find((i) => i.id === selectedImageId)!;
    const noneActive = !images.some((i) => i.agentType === importAgentType && i.active);
    const newImage: ImageRow = {
      id: img.id, name: img.name, status: "available", type: "custom",
      agentType: importAgentType, agentVersion: importAgentVersion.trim(),
      os: "CentOS 7.9 64位", createTime: nowStr(), active: noneActive,
    };
    syncImages([...images, newImage]);
    if (!addedTypes.includes(importAgentType)) setAddedTypes([...addedTypes, importAgentType]);
    handleDialogOpenChange(false);
    toast.success(noneActive
      ? `镜像「${img.name}」已导入至 ${getTypeLabel(importAgentType)} 并自动对用户可见`
      : `镜像「${img.name}」已导入至 ${getTypeLabel(importAgentType)}`);
  };

  const openEditDialog = (imgId: string) => {
    const img = images.find((i) => i.id === imgId);
    if (!img) return;
    if (img.type === "public") { toast.error("公共镜像不支持编辑"); return; }
    setEditingImageId(img.id);
    setEditAgentType(img.agentType);
    setEditAgentVersion(img.agentVersion);
    setEditVersionError("");
    setShowEditDialog(true);
  };

  const handleEditVersionChange = (v: string) => {
    setEditAgentVersion(v);
    if (v && editAgentType) {
      const config = getEffectiveTypeConfig(editAgentType);
      if (config && config.versionRegex && !config.versionRegex.test(v)) {
        setEditVersionError(`格式不正确，请输入 ${config.versionPlaceholder.replace("如 ", "")} 格式`);
      } else if (editAgentType === "OpenClaw" && config && !validateVersion(config, v)) {
        setEditVersionError("日期不合法");
      } else { setEditVersionError(""); }
    } else { setEditVersionError(""); }
  };

  const handleEditSave = () => {
    if (!editAgentType) { toast.error("请选择 Agent 类型"); return; }
    if (!editAgentVersion.trim()) { toast.error("请填写 Agent 版本"); return; }
    const config = getEffectiveTypeConfig(editAgentType);
    if (config && config.versionRegex && !validateVersion(config, editAgentVersion)) {
      toast.error("版本格式不正确"); return;
    }
    syncImages(images.map((i) =>
      i.id === editingImageId
        ? { ...i, agentType: editAgentType, agentVersion: editAgentVersion.trim() }
        : i,
    ));
    if (!addedTypes.includes(editAgentType)) setAddedTypes([...addedTypes, editAgentType]);
    setShowEditDialog(false);
    toast.success("镜像信息已更新");
  };

  const handleDeleteImage = (imgId: string) => {
    const img = images.find((i) => i.id === imgId);
    if (!img) return;
    if (img.type === "public") { toast.error("公共镜像不支持删除"); return; }
    if (img.active) {
      if (img.agentType === defaultAgentType) {
        toast.error("该镜像为用户端首选类型的启用镜像，无法删除"); return;
      }
      toast.error("当前用户可见的镜像无法删除，请先切换至其它镜像"); return;
    }
    syncImages(images.filter((i) => i.id !== imgId));
    toast.success("镜像已删除");
  };

  const handleSetDefaultType = (agentType: string) => {
    if (!images.some((i) => i.agentType === agentType && i.active)) {
      toast.error(`请先为 ${getTypeLabel(agentType)} 启用一个用户可见的镜像`);
      return;
    }
    syncDefaultAgentType(agentType);
    toast.success(`已将「${getTypeLabel(agentType)}」设为用户端首选类型`);
  };

  // ── 渲染 ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-enter flex gap-6">
        {/* 右侧 sticky 锚点导航（DOM 上放在主内容之后通过 order 控制位置） */}
        <aside className="hidden lg:block w-[180px] shrink-0 order-2">
          <div className="sticky top-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-3">Agent 类型</div>
            <nav className="flex flex-col gap-0.5 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
              {displayTypes.map((t) => {
                const typeImages = images.filter((i) => i.agentType === t.value);
                const count = typeImages.length;
                const hasActive = typeImages.some((i) => i.active);
                const isActive = activeAnchor === t.value;
                const isDefault = defaultAgentType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => scrollToType(t.value)}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      {isDefault ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0">
                              <Star className="w-2.5 h-2.5 text-white" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">用户端首选类型</TooltipContent>
                        </Tooltip>
                      ) : hasActive ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">用户端可选</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">用户端不可选</TooltipContent>
                        </Tooltip>
                      )}
                      <span className="truncate">{t.label}</span>
                    </span>
                    <span className={`text-[10px] shrink-0 ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 主内容区 */}
        <div className="flex-1 min-w-0 max-w-[1100px] order-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">镜像管理</h1>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              管理不同 Agent 类型的运行环境镜像。启用镜像后该类型在用户端可选，未启用则不可选。
            </p>
          </div>

        {/* 按 agentType 分组展示 */}
        <div className="space-y-6">
          {displayTypes.map((agentTypeObj) => {
            const agentType = agentTypeObj.value;
            // 公共镜像排在前面
            const typeImages = images
              .filter((i) => i.agentType === agentType)
              .sort((a, b) => {
                if (a.isPublic && !b.isPublic) return -1;
                if (!a.isPublic && b.isPublic) return 1;
                return 0;
              });
            const isDefault = defaultAgentType === agentType;
            const isCollapsed = collapsedTypes.has(agentType);
            const activeImg = typeImages.find((i) => i.active);
            const isCustom = !agentTypeObj.isOfficial;
            const isNativeKernel = agentTypeObj.kernel === "native";

            return (
              <div
                key={agentType}
                ref={(el) => { sectionRefs.current[agentType] = el; }}
                data-anchor={agentType}
                className={`rounded-xl border overflow-hidden transition-all scroll-mt-6 ${isDefault ? "border-blue-300 ring-1 ring-blue-200" : "border-[#e5e5e5]"}`}
              >
                {/* 标题栏 */}
                <div className={`flex items-center justify-between px-6 py-4 ${isDefault ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100" : "bg-white border-b border-gray-50"}`}>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button onClick={() => toggleCollapse(agentType)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <h2 className="font-semibold text-gray-900">{agentTypeObj.label}</h2>
                    <span className="text-xs text-gray-400">{typeImages.length} 个镜像</span>

                    {/* 自定义标签（官方不打） */}
                    {isCustom && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100 cursor-default">
                            自定义 Agent 类型
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">由企业自行定义和维护的 Agent 类型</TooltipContent>
                      </Tooltip>
                    )}

                    {/* 内核标签（仅自定义类型展示） */}
                    {isCustom && (
                      isNativeKernel ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100 cursor-default">
                              <Layers className="w-3 h-3" /> 自定义内核
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                            该类型不基于任何已知 Agent 内核，部分管控台功能不可用
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-default">
                              <Layers className="w-3 h-3" /> 兼容 {getKernel(agentTypeObj.kernel).label} 内核
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
                            该类型与 {getKernel(agentTypeObj.kernel).label} 完全兼容，管控台功能与 {getKernel(agentTypeObj.kernel).label} 保持一致。请务必先验证管控台功能可用性，排除不兼容问题
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}

                    {/* 自定义内核：温馨提示图标 */}
                    {isCustom && isNativeKernel && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center text-amber-500 cursor-help">
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[320px] text-xs leading-relaxed">
                          <div className="font-semibold mb-1">温馨提示</div>
                          <div className="mb-1">{NATIVE_KERNEL_NOTICE_TITLE}：</div>
                          {NATIVE_KERNEL_NOTICE_LINES.map((l, i) => (
                            <div key={i} className="mt-0.5">{l}</div>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* 用户端可选状态 */}
                    {activeImg ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100 cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> 用户端可选
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
                          当前启用：{activeImg.name}（{activeImg.agentVersion || "未知版本"}），支持用户创建该类型 Agent；一键升级将此镜像版本作为升级目标版本
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" /> 用户端不可选
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                          未启用镜像，用户端无法选择此类型创建 Agent。启用一个镜像即可开放
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* 用户端首选标记 */}
                    {isDefault && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white cursor-default">
                            <Star className="w-3 h-3" /> 用户端首选
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
                          用户创建 Agent 时会优先选此类型，也支持手动切换
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* 设为用户端首选按钮（移到左侧） */}
                    {!isDefault && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleSetDefaultType(agentType)}>
                            <Star className="w-3 h-3 mr-1" /> 设为用户端首选
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs leading-relaxed">设为用户端优先选择的 Agent 类型</TooltipContent>
                      </Tooltip>
                    )}

                    {/* 自定义类型可移除 */}
                    {isCustom && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => requestRemoveType(agentTypeObj)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            title="移除此 Agent 类型"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>移除此 Agent 类型</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* 右侧：应用范围 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ImageScopePopover
                      scopeData={getTypeScope(agentType)}
                      groups={ALL_GROUPS}
                      onSave={(scope, groupIds) => handleScopeChange(agentType, scope, groupIds)}
                    />
                  </div>
                </div>

                {/* 镜像列表 */}
                {!isCollapsed && (
                  <div className="bg-white">
                    {typeImages.length > 0 ? (
                      <>
                        <table className="w-full" style={{ tableLayout: "fixed" }}>
                          <colgroup>
                            <col style={{ width: "26%" }} />
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "14%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "22%" }} />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">镜像名称 / ID</th>
                              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 tracking-wide whitespace-nowrap">Agent 版本</th>
                              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">镜像类型</th>
                              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">状态</th>
                              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">操作系统</th>
                              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">导入时间</th>
                              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {typeImages.map((img) => (
                              <tr
                                key={img.id}
                                className={`hover:bg-gray-50/50 transition-colors ${img.isPublic ? "bg-blue-50/40" : ""}`}
                                style={img.isPublic ? { borderLeft: "3px solid #3B82F6" } : { borderLeft: "3px solid transparent" }}
                              >
                                <td className="px-6 py-4">
                                  <div className="min-w-0 overflow-hidden">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={img.name}>{img.name}</p>
                                    <p className="text-xs text-gray-400 font-mono truncate" title={img.id}>{img.id}</p>
                                    {img.isPublic && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap mt-1 cursor-default">腾讯云维护</span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[260px] text-xs leading-relaxed">由腾讯云维护，自动跟进平台程序版本更新，无需企业自行维护</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  {img.agentVersion ? (
                                    <span className="text-sm text-gray-700 font-mono">{img.agentVersion}</span>
                                  ) : img.active ? (
                                    <div className="flex items-start gap-1.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                        ⚠ 未填写版本
                                      </span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help inline-flex">
                                            <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                                          该镜像正在使用中但缺少版本信息，可能影响用户端版本显示。建议编辑填写版本
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400 leading-tight">
                                      <span className="text-orange-500">未填写</span>
                                      <br />
                                      <span>请编辑版本信息</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  {img.isPublic ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 cursor-default">公共</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[240px] text-xs leading-relaxed">由腾讯云维护，自动跟进平台程序版本更新，无需企业自行维护</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100 cursor-default">自定义</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[240px] text-xs leading-relaxed">由企业自行制作和维护，腾讯云不负责版本更新和维护</TooltipContent>
                                    </Tooltip>
                                  )}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  {(() => {
                                    const s = IMAGE_STATE_MAP[img.state] ?? { label: img.state, color: "text-yellow-700", bg: "bg-yellow-50", dot: "bg-yellow-400" };
                                    return (
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${s.dot} ${s.animate ? "animate-pulse" : ""}`} />
                                        {s.label}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-600" title={img.os}>{img.os}</td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {img.createTime ? (
                                    <div className="leading-tight">
                                      <span className="whitespace-nowrap">{img.createTime.split(" ")[0]}</span>
                                    </div>
                                  ) : "—"}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">启用</span>
                                      {!img.agentVersion && !img.active ? (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="inline-flex">
                                              <Switch checked={false} disabled className="opacity-40 cursor-not-allowed" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
                                            缺少 Agent 版本信息，无法启用。请编辑填写版本
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : !img.agentVersion && img.active ? (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="inline-flex">
                                              <Switch
                                                checked={img.active}
                                                onCheckedChange={() => handleToggleActive(img.id, agentType)}
                                              />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                                            <span className="text-amber-500 font-medium">⚠ 该镜像缺少版本信息</span>，建议编辑填写版本
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : (
                                        <Switch
                                          checked={img.active}
                                          onCheckedChange={() => handleToggleActive(img.id, agentType)}
                                        />
                                      )}
                                    </div>

                                    {/* 编辑按钮（仅自定义镜像） */}
                                    {!img.isPublic && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button onClick={() => openEditDialog(img)} className="text-gray-400 hover:text-blue-500 transition-colors" title="编辑镜像信息">
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>编辑 Agent 类型和版本</TooltipContent>
                                      </Tooltip>
                                    )}

                                    {/* 删除按钮 */}
                                    {img.isPublic ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-gray-200 cursor-not-allowed">
                                            <Trash2 className="w-4 h-4" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">公共镜像不可删除</TooltipContent>
                                      </Tooltip>
                                    ) : img.active ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-gray-200 cursor-not-allowed">
                                            <Trash2 className="w-4 h-4" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">启用中的镜像无法删除</TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <button
                                        onClick={() => handleDelete(img)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                        title="删除镜像"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* 分组底部：导入镜像 */}
                        <div className="px-6 py-3 border-t border-gray-50 flex justify-start">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => openImportForType(agentType)}>
                                <Plus className="w-3 h-3 mr-1" /> 导入镜像
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[240px] text-xs leading-relaxed">支持导入公共镜像（腾讯云维护）或自定义镜像（企业维护）</TooltipContent>
                          </Tooltip>
                        </div>
                      </>
                    ) : (
                      <div className="px-6 py-10 text-center">
                        <p className="text-sm text-gray-400 mb-2">暂无镜像</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => openImportForType(agentType)}>
                              <Plus className="w-3 h-3 mr-1" /> 导入镜像
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[240px] text-xs leading-relaxed">支持导入公共镜像（腾讯云维护）或自定义镜像（企业维护）</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

            {/* 底部：添加自定义 Agent 类型 */}
            <button
              onClick={openAddTypeDialog}
              className="w-full rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 transition-all py-6 flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold transition-colors" style={{ color: "#355EF1" }}>添加自定义 Agent 类型</span>
              <span className="text-xs text-gray-500">支持基于现有 Agent 内核扩展，或添加完全自定义的 Agent 类型</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 导入自定义镜像弹窗 ─── */}
      <Dialog open={showImportDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-500" />
              导入自定义镜像
              {importTargetAgentType && (
                <span className="text-xs text-gray-400 font-normal">
                  · {getTypeLabel(importTargetAgentType)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5 -mt-1">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              以下镜像均为已在腾讯云创建好的镜像。若需要创建新镜像，请前往{" "}
              <a
                href="https://console.cloud.tencent.com/cvm/image"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
              >
                腾讯云云服务器控制台 <ExternalLink className="w-3 h-3" />
              </a>{" "}
              操作后，再回此处刷新并关联。
            </p>
          </div>

          <div className="space-y-4 py-1" onClick={handleClickOutsideImageList}>
            <div className="space-y-2">
              <Label>选择镜像 <span className="text-red-400">*</span></Label>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowImageList(!showImageList); }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                >
                  <span>
                    {selectedImageId
                      ? CUSTOM_IMAGES.find((i) => i.id === selectedImageId)?.name
                      : "请选择要关联的镜像"}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
                  title="刷新镜像列表"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-gray-400">镜像大小不允许超过 50 GiB</p>
              {showImageList && (
                <div ref={imageListRef} className="border border-gray-200 rounded-xl bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="relative p-2 border-b border-[#e5e5e5]">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索镜像 ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredImportImages.length > 0 ? (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 sticky top-0">
                          自定义镜像 <span className="text-gray-400 font-normal">（企业维护）</span>
                        </div>
                        {filteredImportImages.map((img) => (
                          <div
                            key={img.id}
                            onClick={(e) => { e.stopPropagation(); handleSelectImage(img.id); }}
                            className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                              selectedImageId === img.id
                                ? "bg-blue-50 border-l-2 border-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-gray-900 truncate">{img.name}</span>
                              <span className="text-xs text-gray-400 font-mono shrink-0">{img.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-8 text-center text-sm text-gray-400">
                        未找到匹配的镜像
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 自定义镜像选中时的提示 */}
            {isCustomImageSelected && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  请确认 Agent 类型选择正确，类型不匹配将导致管控台功能无法使用。
                </p>
              </div>
            )}

            {/* Step 2: Agent 类型 */}
            <div className={`space-y-2 transition-opacity ${!selectedImageId ? "opacity-50 pointer-events-none" : ""}`}>
              <Label>Agent 类型 <span className="text-red-400">*</span></Label>
              {!selectedImageId ? (
                <div className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-sm text-gray-400">
                  请先选择镜像
                </div>
              ) : isPublicSelected ? (
                <div className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-sm text-gray-500">
                  {getTypeLabel(importAgentType)}
                  <span className="text-xs text-gray-400 ml-2">（公共镜像自动匹配）</span>
                </div>
              ) : (
                <Select value={importAgentType} onValueChange={(v) => { setImportAgentType(v); setImportAgentVersion(""); setVersionError(""); }}>
                  <SelectTrigger className="bg-gray-50 w-full"><SelectValue placeholder="请选择 Agent 类型" /></SelectTrigger>
                  <SelectContent>
                    {allTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-1.5">
                          {t.label}
                          {!t.isOfficial && <span className="text-[10px] text-purple-500">(自定义)</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Agent 版本 <span className="text-red-400">*</span></Label>
              {!selectedImageId ? (
                <div className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-sm text-gray-400">
                  请先选择镜像
                </div>
              ) : isPublicSelected ? (
                <div className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-sm text-gray-500 font-mono">
                  {importAgentVersion}
                  <span className="text-xs text-gray-400 ml-2 font-normal">（公共镜像自动匹配）</span>
                </div>
              ) : (
                <>
                  <Input
                    placeholder={importAgentType ? getKernel(importKernel).versionPlaceholder : "请先选择 Agent 类型"}
                    value={importAgentVersion}
                    onChange={(e) => handleVersionChange(e.target.value)}
                    className={`bg-gray-50 font-mono ${versionError ? "border-red-300 focus-visible:ring-red-500" : ""}`}
                    disabled={!importAgentType}
                  />
                  {versionError && <p className="text-xs text-red-500">{versionError}</p>}
                  {importAgentType && !versionError && (
                    <p className="text-xs text-gray-400">格式：{getKernel(importKernel).versionPlaceholder}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>取消</Button>
            <Button
              onClick={handleImport}
              disabled={!canImport}
            >
              导入并关联
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 编辑镜像信息弹窗 ─── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑镜像信息</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              修改该自定义镜像所属的 Agent 类型和版本号
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(() => {
              const editImg = images.find((i) => i.id === editingImageId);
              return editImg ? (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">镜像名称 / ID</p>
                    <p className="text-sm font-semibold text-gray-900">{editImg.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{editImg.id}</p>
                  </div>
                  <div className="px-4 py-2.5 flex items-center gap-4 text-xs text-gray-500 border-t border-[#e5e5e5]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">当前类型</span>
                      <span className="font-medium text-gray-700">{editImg.agentType ? getTypeLabel(editImg.agentType) : "未设置"}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">当前版本</span>
                      <span className="font-medium text-gray-700 font-mono">{editImg.agentVersion || "未设置"}</span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="space-y-2">
              <Label>Agent 类型 <span className="text-red-400">*</span></Label>
              <Select
                value={editAgentType}
                onValueChange={(v) => { setEditAgentType(v); setEditAgentVersion(""); setEditVersionError(""); }}
              >
                <SelectTrigger className="bg-gray-50 w-full">
                  <SelectValue placeholder="请选择 Agent 类型" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_AGENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                  {customTypes.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wide border-t border-gray-100 mt-1">
                        自定义类型
                      </div>
                      {customTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.displayName}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agent 版本 <span className="text-red-400">*</span></Label>
              <Input
                value={editAgentVersion}
                onChange={(e) => handleEditVersionChange(e.target.value)}
                placeholder={getEffectiveTypeConfig(editAgentType)?.versionPlaceholder ?? ""}
                className={`bg-gray-50 ${editVersionError ? "border-red-300 focus-visible:ring-red-500" : ""}`}
              />
              {editVersionError && <p className="text-xs text-red-500">{editVersionError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button
              onClick={handleEditSave}
              disabled={!editAgentType || !editAgentVersion.trim() || !!editVersionError}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 添加自定义 Agent 类型弹窗 ─── */}
      <Dialog open={showCreateCustomDialog} onOpenChange={(o) => { if (!o) resetCreateDialog(); setShowCreateCustomDialog(o); }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加自定义 Agent 类型</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              支持基于现有 Agent 内核扩展，或添加完全自研的 Agent 类型
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* 类型名称 */}
            <div>
              <Label className="text-xs">类型名称 <span className="text-red-400">*</span></Label>
              <Input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="例如：CustomClaw"
                maxLength={40}
                autoFocus
                className={`mt-1.5 ${newTypeNameError ? "border-red-300 focus-visible:ring-red-500" : ""}`}
              />
              {newTypeNameError ? (
                <p className="text-xs text-red-500 mt-1">{newTypeNameError}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">用户端展示的类型名称，可包含中英文，需保持唯一</p>
              )}
            </div>

            {/* 兼容内核 */}
            <div>
              <Label className="text-xs">兼容内核 <span className="text-red-400">*</span></Label>
              <div className="mt-2 space-y-2">
                {KERNEL_OPTIONS.map((opt) => {
                  const isSelected = newKernelBase === opt.value;
                  const isNative = opt.value === "native";
                  return (
                    <label
                      key={k.value}
                      htmlFor={`kernel-${k.value}`}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? (isNative ? "border-orange-300 bg-orange-50/40" : "border-blue-300 bg-blue-50/40")
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? (isNative ? "border-orange-500 bg-orange-500" : "border-blue-500 bg-blue-500")
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-0.5">{opt.title}</div>
                          <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 兼容内核 - 强提醒 */}
            {newTypeKernel !== "native" && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  自定义 Agent 请务必先验证管控台功能可用性，排除不兼容问题。
                </p>
              </div>
            )}

            {/* 自研（native）：风险提示 + 必勾选确认 */}
            {newKernelBase === "native" && (
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-orange-700 leading-relaxed space-y-1">
                    <p className="font-semibold">{NATIVE_KERNEL_NOTICE_TITLE}：</p>
                    {NATIVE_KERNEL_NOTICE_LINES.map((l, i) => (<p key={i}>{l}</p>))}
                  </div>
                </div>
                <label className="flex items-start gap-2 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <Checkbox
                    id="native-ack"
                    checked={nativeAck}
                    onCheckedChange={(c) => setNativeAck(!!c)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-gray-700 leading-relaxed">
                    我已知晓上述限制，且确认<span className="font-medium">允许用户进入该类型 Agent 的终端</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetCreateDialog(); setShowCreateCustomDialog(false); }}>
              取消
            </Button>
            <Button
              onClick={handleAddType}
              disabled={!newTypeLabel.trim() || (newTypeKernel === "native" && !nativeAck)}
            >
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 删除自定义类型 二次确认 ─── */}
      <Dialog open={!!removeCustomConfirm} onOpenChange={(o) => { if (!o) setRemoveCustomConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              删除自定义 Agent 类型
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              确认删除自定义类型「<span className="font-semibold">{removeCustomConfirm?.displayName}</span>」？
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              删除后该类型及其下镜像将不再展示，可重新添加。此操作不会影响已存在的腾讯云镜像数据。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingRemoveType(null)}>取消</Button>
            <Button
              onClick={confirmRemoveType}
              variant="destructive"
            >
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 公共镜像版本更新记录 ─── */}
      {publicHistoryCtx && (
        <PublicImageHistoryDialog
          open={!!publicHistoryCtx}
          imageId={publicHistoryCtx.imageId}
          imageName={publicHistoryCtx.imageName}
          agentType={publicHistoryCtx.agentType}
          onClose={() => setPublicHistoryCtx(null)}
        />
      )}

      {/* ─── 推送更新弹窗 ─── */}
      <PushUpgradeDialog
        open={showPushDialog}
        onOpenChange={(o) => {
          setShowPushDialog(o);
          if (!o) setPushDefaultType(undefined);
        }}
        pushable={pushable}
        defaultAgentType={pushDefaultType}
      />

      {/* ─── 镜像更新记录抽屉 ─── */}
      <UpdateRecordsDrawer
        open={showAllRecordsDrawer}
        onOpenChange={setShowAllRecordsDrawer}
        onPush={(defaultType) => {
          setShowAllRecordsDrawer(false);
          openPushDialog(defaultType);
        }}
      />
    </>
  );
}
