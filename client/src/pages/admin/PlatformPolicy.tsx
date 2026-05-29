/**
 * PlatformPolicy - 平台策略页面
 * 基础信息 → 平台策略
 * 包含：用户配额 / 模型配额 / 功能权限开关
 * 全宽卡片布局，每张卡片支持按分组设置多行规则 + 全部用户兜底行
 */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertOperationInfoIcon, AlertInfoIcon } from "@/components/ui/alert";
import {
  Check, X,
  HelpCircle as _HelpCircle, Info,
  Plus, Trash2, Search,
  ChevronDown, ChevronRight, Minus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableActionCell } from "@/components/ui/table";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { StatusTag } from "@/components/ui/status-tag";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from "@/components/ui/dialog";
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
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from "./MemberManagement/mock";
import { buildGroupTree, type GroupTreeNode } from "./MemberManagement/health";
import type { UserGroup, GroupSource } from "./MemberManagement/types";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type TokenLimit = number | "unlimited";

// 网络管理页默认安全组的本地快照（用于平台策略读/补规则）
type SnapshotInboundRule = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  policy: string;
  remark?: string;
};
type DefaultSecurityGroupSnapshot = {
  id?: string;
  name?: string;
  inboundRules: SnapshotInboundRule[];
};

// 端口字段是否覆盖指定目标端口：支持 "ALL" / "80,443" / "6000-7000" / "6080"
function doesPortCoverTarget(port: string, target: number): boolean {
  const trimmed = (port || "").trim();
  if (!trimmed) return false;
  if (trimmed.toUpperCase() === "ALL") return true;
  if (trimmed.includes(",")) return trimmed.split(",").some((p) => doesPortCoverTarget(p, target));
  if (trimmed.includes("-")) {
    const [s, e] = trimmed.split("-").map((x) => Number(x.trim()));
    if (Number.isFinite(s) && Number.isFinite(e)) return s <= target && target <= e;
    return false;
  }
  return Number(trimmed) === target;
}
// 入站规则是否放通了目标端口（源 0.0.0.0/0、允许、TCP/ALL）
function isInboundRuleCoverPort(rule: SnapshotInboundRule, target: number): boolean {
  if (!rule) return false;
  if (rule.source !== "0.0.0.0/0") return false;
  if (rule.policy !== "允许") return false;
  const proto = (rule.protocol || "").toUpperCase();
  if (proto !== "TCP" && proto !== "ALL") return false;
  return doesPortCoverTarget(rule.port, target);
}

interface PolicyRule<T> {
  id: string;
  groupIds: string[]; // 空数组 = 全部用户
  value: T;
}

// ─── 分组数据 ─────────────────────────────────────────────────────────────────

const ALL_GROUPS: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];

function getGroupPath(groupId: string, groups: UserGroup[]): string {
  const g = groups.find((x) => x.id === groupId);
  if (!g) return groupId;
  const parts: string[] = [g.name];
  let current = g;
  while (current.parentId) {
    const parent = groups.find((x) => x.id === current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(" / ");
}

// ─── 树工具函数 ──────────────────────────────────────────────────────────────

type CheckState = "checked" | "unchecked" | "indeterminate";

/** 节点本身或其任一祖先被选中 */
function isNodeOrAncestorSelected(
  node: GroupTreeNode,
  selectedIds: Set<string>,
  groupMap: Map<string, UserGroup>
): boolean {
  if (selectedIds.has(node.id)) return true;
  let cur: UserGroup | undefined = groupMap.get(node.id);
  while (cur && cur.parentId) {
    if (selectedIds.has(cur.parentId)) return true;
    cur = groupMap.get(cur.parentId);
  }
  return false;
}

/** 任一子孙被选中（不含自身） */
function hasSelectedDescendant(node: GroupTreeNode, selectedIds: Set<string>): boolean {
  for (const c of node.children) {
    if (selectedIds.has(c.id)) return true;
    if (hasSelectedDescendant(c, selectedIds)) return true;
  }
  return false;
}

/** 三态：本身被选=checked；祖先被选=checked；有子孙被选=indeterminate；其他=unchecked */
function getCheckState(
  node: GroupTreeNode,
  selectedIds: Set<string>,
  groupMap: Map<string, UserGroup>
): CheckState {
  if (selectedIds.has(node.id)) return "checked";
  // 祖先被选中 → 自动视为 checked
  let cur: UserGroup | undefined = groupMap.get(node.id);
  while (cur && cur.parentId) {
    if (selectedIds.has(cur.parentId)) return "checked";
    cur = groupMap.get(cur.parentId);
  }
  if (hasSelectedDescendant(node, selectedIds)) return "indeterminate";
  return "unchecked";
}

function getDescendantIds(node: GroupTreeNode): string[] {
  const ids: string[] = [node.id];
  node.children.forEach((c) => ids.push(...getDescendantIds(c)));
  return ids;
}

/**
 * 递归向上聚合：若某父节点的所有直接可用（非 disabled）子节点都已被选中，
 * 则将这些子节点 id 全部移除，换成该父节点 id。继续向上直到无法再聚合。
 */
function aggregateSelection(
  selected: Set<string>,
  roots: GroupTreeNode[],
  disabledIds: Set<string>
): Set<string> {
  const result = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    const walk = (node: GroupTreeNode) => {
      if (node.children.length === 0) return;
      // 先递归处理子节点（自底向上）
      node.children.forEach(walk);
      // 若本节点尚未被选中
      if (result.has(node.id)) return;
      // 所有直接子节点都必须可聚合：非 disabled 且都已选中
      const hasDisabled = node.children.some((c) => disabledIds.has(c.id));
      if (hasDisabled) return;
      const allSelected = node.children.every((c) => result.has(c.id));
      if (!allSelected) return;
      // 聚合：移除所有直接子节点，加入本节点
      node.children.forEach((c) => result.delete(c.id));
      result.add(node.id);
      changed = true;
    };
    roots.forEach(walk);
  }
  return result;
}

const SOURCE_LABELS: Record<GroupSource, string> = {
  "oneid-dept": "部门",
  "oneid-group": "用户组",
  "manual": "自定义分组",
};
// 选择框内只展示部门和自定义分组（不含用户组）
const SOURCE_ORDER: GroupSource[] = ["oneid-dept", "manual"];

// ─── 分组选择器（带标签输入框 + 树形 Popover，勾选即生效） ─────────────────────

function GroupTagSelector({
  selectedIds,
  disabledIds,
  onChange,
}: {
  selectedIds: string[];
  disabledIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState(false);

  // 只保留部门和自定义分组（不含用户组）
  const visibleGroups = useMemo(
    () => ALL_GROUPS.filter((g) => SOURCE_ORDER.includes(g.source)),
    []
  );
  const groupMap = useMemo(
    () => new Map(visibleGroups.map((g) => [g.id, g])),
    [visibleGroups]
  );

  // 按 source 分桶 + 建树
  const groupsBySource = useMemo(() => {
    const buckets: Record<string, UserGroup[]> = { "oneid-dept": [], manual: [] };
    visibleGroups.forEach((g) => { if (buckets[g.source]) buckets[g.source].push(g); });
    return buckets;
  }, [visibleGroups]);
  const activeSources = useMemo(
    () => SOURCE_ORDER.filter((s) => (groupsBySource[s] || []).length > 0),
    [groupsBySource]
  );
  const treesMap = useMemo(() => {
    const map: Record<string, GroupTreeNode[]> = {};
    activeSources.forEach((s) => { map[s] = buildGroupTree(groupsBySource[s] || []); });
    return map;
  }, [activeSources, groupsBySource]);

  // 所有可见分组的根（用于聚合算法遍历）
  const allRoots = useMemo(
    () => activeSources.flatMap((s) => treesMap[s] || []),
    [activeSources, treesMap]
  );

  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds]);

  // 打开时：默认展开已选祖先 + 根节点
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setSearch("");
      const expandSet = new Set<string>();
      selectedIds.forEach((gid) => {
        let cur = groupMap.get(gid);
        while (cur && cur.parentId) {
          expandSet.add(cur.parentId);
          cur = groupMap.get(cur.parentId);
        }
      });
      activeSources.forEach((s) => {
        treesMap[s]?.forEach((root) => expandSet.add(root.id));
      });
      setExpanded(expandSet);
    }
    setOpen(v);
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 查找节点所在树的某个具体 GroupTreeNode（用于取它的 children / 子孙）
  const findTreeNode = (id: string): GroupTreeNode | null => {
    const walk = (nodes: GroupTreeNode[]): GroupTreeNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        const found = walk(n.children);
        if (found) return found;
      }
      return null;
    };
    return walk(allRoots);
  };

  /**
   * 点击节点：
   * - 本身已选 → 移除
   * - 祖先已选（自动 checked）→ 展开祖先为除当前路径外的兄弟子节点
   * - 半选（indeterminate）→ 清空所有子孙，加入自身
   * - 未选 → 加入自身
   * 最后执行递归向上聚合
   */
  const toggleNode = (node: GroupTreeNode) => {
    if (disabledSet.has(node.id)) return;
    const ids = new Set(selectedIds);

    // 祖先中被选中的最近一个
    let ancestorSelectedId: string | null = null;
    let cur: UserGroup | undefined = groupMap.get(node.id);
    while (cur && cur.parentId) {
      if (ids.has(cur.parentId)) { ancestorSelectedId = cur.parentId; break; }
      cur = groupMap.get(cur.parentId);
    }

    if (ids.has(node.id)) {
      // 本身已选 → 移除
      ids.delete(node.id);
    } else if (ancestorSelectedId) {
      // 祖先已选中 → 展开该祖先：移除祖先，加入祖先到 node 路径上所有节点的"兄弟"
      // 即：沿 祖先 → node 的路径，每一步把当前节点的所有非路径子节点都选上，最终排除 node
      ids.delete(ancestorSelectedId);
      // 从 ancestorSelectedId 沿路径走到 node
      // 构造 node → ancestor 的路径
      const pathNodes: UserGroup[] = [];
      let p: UserGroup | undefined = groupMap.get(node.id);
      while (p && p.id !== ancestorSelectedId) {
        pathNodes.push(p);
        p = p.parentId ? groupMap.get(p.parentId) : undefined;
      }
      // 反转为 ancestor下的第一层 → ... → node 的父级
      pathNodes.reverse();
      // 起点：祖先节点的 tree
      let cursor = findTreeNode(ancestorSelectedId);
      // 从祖先一层层下降，将每层的"非下一跳"子节点选上
      for (let i = 0; i < pathNodes.length; i++) {
        const nextHopId = pathNodes[i].id;
        if (!cursor) break;
        cursor.children.forEach((c) => {
          if (c.id !== nextHopId && !disabledSet.has(c.id)) ids.add(c.id);
        });
        cursor = cursor.children.find((c) => c.id === nextHopId) || null;
      }
      // 最后一步：在 node 的父层已处理，node 本身不加入
    } else {
      // 本身未选 + 祖先也没选
      const state = hasSelectedDescendant(node, ids) ? "indeterminate" : "unchecked";
      if (state === "indeterminate") {
        // 清空所有子孙（包括 disabled 的也要清，避免残留）
        getDescendantIds(node).forEach((d) => ids.delete(d));
      }
      // 加入自身
      ids.add(node.id);
    }

    // 递归向上聚合
    const aggregated = aggregateSelection(ids, allRoots, disabledSet);
    onChange(Array.from(aggregated));
  };

  // 搜索过滤
  const matchedIds = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(
      visibleGroups
        .filter((g) => g.name.toLowerCase().includes(q) || getGroupPath(g.id, visibleGroups).toLowerCase().includes(q))
        .map((g) => g.id)
    );
  }, [search, visibleGroups]);
  const isVisible = (node: GroupTreeNode): boolean => {
    if (!matchedIds) return true;
    if (matchedIds.has(node.id)) return true;
    return node.children.some(isVisible);
  };

  const renderNode = (node: GroupTreeNode, depth: number) => {
    if (!isVisible(node)) return null;
    const checkState = getCheckState(node, new Set(selectedIds), groupMap);
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isDisabled = disabledSet.has(node.id);

    const nameSpan = <span className="text-xs text-gray-700 truncate">{node.name}</span>;

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => !isDisabled && toggleNode(node)}
          disabled={isDisabled}
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-colors text-left ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
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
          <Checkbox
            checked={checkState === "checked" ? true : checkState === "indeterminate" ? "indeterminate" : false}
            className="size-3.5"
            tabIndex={-1}
          />
          {isDisabled ? (
            <Tooltip>
              <TooltipTrigger asChild>{nameSpan}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="text-xs max-w-[240px] leading-relaxed">
                该分组已设置策略，每个分组只允许有一个平台策略
              </TooltipContent>
            </Tooltip>
          ) : (
            nameSpan
          )}
        </button>
        {hasChildren && isExpanded && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          data-state={open ? "open" : "closed"}
          className="group relative w-full min-h-9 px-3 py-[5px] rounded-[4px] border border-[#E5E5E5] bg-white hover:border-[#1447E6] data-[state=open]:border-[#1447E6] transition-colors cursor-pointer flex items-center flex-wrap gap-1 pr-8 text-sm"
        >
          {selectedIds.length === 0 ? (
            <span className="text-[#A3A3A3]">请选择分组</span>
          ) : (
            selectedIds.map((id) => {
              const path = getGroupPath(id, ALL_GROUPS);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#0A0A0A] text-[11px] max-w-full"
                >
                  <span className="truncate">{path}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(selectedIds.filter((x) => x !== id));
                    }}
                    className="text-[#A3A3A3] hover:text-[#0A0A0A] shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
          {/* 右侧图标：默认 ChevronDown；hover 且有已选时显示清空 */}
          {hover && selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#A3A3A3] hover:bg-[#737373] flex items-center justify-center shrink-0"
              title="清空"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          ) : (
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#737373] transition-transform duration-200 group-data-[state=open]:rotate-180 pointer-events-none" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 rounded-[4px] border border-[#E5E5E5] shadow-md"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
        sideOffset={4}
      >
        <div className="p-2.5 border-b border-[#E5E5E5]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3] pointer-events-none" />
            <Input
              type="text"
              placeholder="搜索分组"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#737373]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto p-1.5">
          {activeSources.length === 0 ? (
            <p className="text-xs text-[#A3A3A3] text-center py-4">暂无分组</p>
          ) : (
            activeSources.map((source) => {
              const trees = treesMap[source] || [];
              const hasVisibleTrees = trees.some(isVisible);
              if (!hasVisibleTrees) return null;
              return (
                <div key={source} className="mb-1.5 last:mb-0">
                  <div className="px-2 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">{SOURCE_LABELS[source]}</div>
                  {trees.map((root) => renderNode(root, 0))}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 分组名称展示（保存后的只读态：独立 tag + 最多 5 个 + 溢出 +N） ──────────

function GroupBadges({ groupIds }: { groupIds: string[] }) {
  const paths = useMemo(
    () => groupIds.map((id) => getGroupPath(id, ALL_GROUPS)),
    [groupIds]
  );

  if (groupIds.length === 0) return <span className="text-xs text-gray-500 font-medium">预设策略</span>;

  const maxVisible = 5;
  const visible = paths.slice(0, maxVisible);
  const overflow = paths.length - maxVisible;
  const tooltipText = paths.join("\n");

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((name, i) => (
        <Badge key={i} variant="outline" className="shrink-0 max-w-[160px] cursor-default">
          <span className="truncate">{name}</span>
        </Badge>
      ))}
      {overflow > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="shrink-0 cursor-default">+{overflow}</Badge>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="max-w-[360px] text-xs leading-relaxed whitespace-pre-line">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ─── 通用选项指示器（label + 当前值 badge + 编辑 Popover + 信息 Tooltip） ───────

interface LabeledOption<T extends string> {
  value: T;
  label: string;
}

function LabeledOptionIndicator<T extends string>({
  label,
  value,
  options,
  onSave,
  tooltipContent,
  saveToastFormatter,
}: {
  label: string;
  value: T;
  options: LabeledOption<T>[];
  onSave: (v: T) => void;
  tooltipContent: React.ReactNode;
  /** 保存后的 toast 文案生成器，参数为新选中项的 label */
  saveToastFormatter?: (nextLabel: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T>(value);

  const handleOpenChange = (v: boolean) => {
    if (v) setDraft(value);
    setOpen(v);
  };
  const handleConfirm = () => {
    onSave(draft);
    setOpen(false);
    const nextLabel = options.find((o) => o.value === draft)?.label ?? "";
    toast.success(saveToastFormatter ? saveToastFormatter(nextLabel) : `已切换为${nextLabel}`);
  };

  const currentLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">{label}</span>
      <StatusTag mode="fill" variant="gray">{currentLabel}</StatusTag>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="link-dark" size="sm" className="h-auto px-0" title={`编辑${label}`}>编辑</Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5">
            <SegmentGroup className="w-full">
              {options.map((opt) => (
                <SegmentOption
                  key={opt.value}
                  active={draft === opt.value}
                  onClick={() => setDraft(opt.value)}
                  className="flex-1"
                >
                  {opt.label}
                </SegmentOption>
              ))}
            </SegmentGroup>
          </div>
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-[#e5e5e5]">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" className="h-7 text-xs px-3" onClick={handleConfirm}>确认</Button>
          </div>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild><span className="cursor-default"><Info className="w-3 h-3 text-gray-400" /></span></TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[320px] leading-relaxed">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── 访问方式指示器（基于 LabeledOptionIndicator） ────────────────────────────

function AccessModeIndicator({ mode, onSave }: { mode: "public" | "private"; onSave: (m: "public" | "private") => void }) {
  return (
    <LabeledOptionIndicator<"public" | "private">
      label="访问方式"
      value={mode}
      options={[
        { value: "public", label: "公网访问" },
        { value: "private", label: "私网访问" },
      ]}
      onSave={onSave}
      tooltipContent={
        <>
          <p className="mb-1.5 text-justify"><span className="font-medium">公网访问：</span>用户通过公网直接访问 Agent 面板（WebUI），连接云服务器公网 IP。适用于大多数场景，推荐选择。</p>
          <p className="text-justify"><span className="font-medium">私网访问：</span>用户通过同一私有网络访问 Agent 面板（WebUI），连接云服务器内网 IP。使用前需先自行将企业内网与腾讯云私有网络（VPC）打通，并在「网络管理」中将云服务器绑定至该 VPC。配置完成后，企业用户可通过企业内网访问面板，但无法通过公网访问。</p>
        </>
      }
    />
  );
}

// ─── 时间维度指示器（基于 LabeledOptionIndicator） ────────────────────────────

function TimeDimensionIndicator({ mode, onSave }: { mode: "daily" | "monthly"; onSave: (m: "daily" | "monthly") => void }) {
  return (
    <LabeledOptionIndicator<"daily" | "monthly">
      label="时间维度"
      value={mode}
      options={[
        { value: "daily", label: "每日" },
        { value: "monthly", label: "每月" },
      ]}
      onSave={onSave}
      tooltipContent={
        <>
          <p className="mb-1.5"><span className="font-medium">每日：</span>每日全局 Tokens 到达上限即暂停服务，按自然日统计，每天 0 点重置。</p>
          <p><span className="font-medium">每月：</span>每月全局 Tokens 到达上限即暂停服务，按自然月统计，每月 1 号 0 点重置。</p>
        </>
      }
    />
  );
}

// ─── 统一的行容器 ─────────────────────────────────────────────────────────────
const ROW_CLASS = "flex items-center gap-3 h-10";
// 编辑行：允许分组标签撑开高度（多标签时换行）
const EDIT_ROW_CLASS = "flex items-center gap-3 min-h-10 py-1.5";

// ─── 子组件：配额策略卡片 ────────────────────────────────────────────────────

/**
 * Token 配额值编辑器：触发器是一个仿 Select 的下拉按钮，
 * 点击后弹出 Popover：顶部 SegmentGroup（无限制/自定义），
 * 选择自定义时显示 Input；底部右对齐取消/确认按钮。
 * 仅在点击「确认」时通过 onCommit 同步外部状态。
 */
function TokenValueEditor({
  mode,
  valStr,
  onCommit,
}: {
  mode: "custom" | "unlimited";
  valStr: string;
  onCommit: (nextMode: "custom" | "unlimited", nextValStr: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftMode, setDraftMode] = useState<"custom" | "unlimited">(mode);
  const [draftValStr, setDraftValStr] = useState<string>(valStr);

  // 每次打开时，用当前外部值初始化草稿
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftMode(mode);
      setDraftValStr(valStr);
    }
    setOpen(v);
  };

  const handleConfirm = () => {
    if (draftMode === "custom") {
      const n = parseInt(draftValStr, 10);
      if (isNaN(n) || n < 0) {
        toast.error("请输入有效数值");
        return;
      }
    }
    onCommit(draftMode, draftMode === "unlimited" ? "" : draftValStr);
    setOpen(false);
  };

  const triggerLabel =
    mode === "unlimited"
      ? "无限制"
      : valStr === ""
        ? ""
        : Number(valStr).toLocaleString();
  const isPlaceholder = mode === "custom" && valStr === "";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-state={open ? "open" : "closed"}
          className="group relative w-32 h-9 px-3 pr-8 rounded-[4px] border border-[#E5E5E5] bg-white hover:border-[#1447E6] data-[state=open]:border-[#1447E6] transition-colors cursor-pointer flex items-center text-left text-sm"
        >
          <span
            className={`truncate ${isPlaceholder ? "text-[#A3A3A3]" : "text-[#0A0A0A]"} tabular-nums`}
          >
            {isPlaceholder ? "请输入" : triggerLabel}
          </span>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#737373] transition-transform duration-200 group-data-[state=open]:rotate-180 pointer-events-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 rounded-[4px] border border-[#E5E5E5] shadow-md"
        align="start"
        sideOffset={4}
        style={{ width: 240 }}
      >
        <div className="px-3.5 pt-3.5 pb-3 space-y-2.5">
          <SegmentGroup className="w-full">
            <SegmentOption
              active={draftMode === "unlimited"}
              onClick={() => setDraftMode("unlimited")}
              className="flex-1"
            >
              无限制
            </SegmentOption>
            <SegmentOption
              active={draftMode === "custom"}
              onClick={() => setDraftMode("custom")}
              className="flex-1"
            >
              自定义
            </SegmentOption>
          </SegmentGroup>
          {draftMode === "unlimited" && (
            <p className="text-xs text-[#737373] leading-relaxed">不限制数量上限</p>
          )}
          {draftMode === "custom" && (
            <Input
              type="number"
              autoFocus
              value={draftValStr}
              onChange={(e) => setDraftValStr(e.target.value)}
              className="h-9 text-xs bg-white"
              placeholder="请输入数量"
            />
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-[#E5E5E5]">
          <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>取消</Button>
          <Button
            size="sm"
            variant="dialog-confirm"
            className="h-7 text-xs px-3"
            disabled={draftMode === "custom" && draftValStr.trim() === ""}
            onClick={handleConfirm}
          >
            确认
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface QuotaPolicyCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  type: "integer" | "token";
  rules: PolicyRule<TokenLimit>[];
  onRulesChange: (rules: PolicyRule<TokenLimit>[]) => void;
  extraContent?: React.ReactNode;
  /** 可选：在配额列右侧追加「时间维度」列（卡片级单值，所有行共用） */
  timeDimension?: {
    value: "daily" | "monthly";
    onChange: (v: "daily" | "monthly") => void;
  };
}

function QuotaPolicyCard({ icon, iconBg, title, description, type, rules, onRulesChange, extraContent, timeDimension }: QuotaPolicyCardProps) {
  // integer 类型（如 Agent 数量上限）不需要无限制/自定义切换，配额列可以缩短，让分组列更长
  const valueColClass = type === "integer" ? "w-32" : "w-60";

  // 卡片级编辑态：编辑期间所有规则都可改
  const [cardEditing, setCardEditing] = useState(false);
  const [editRules, setEditRules] = useState<PolicyRule<TokenLimit>[]>([]);
  const [editValueStrs, setEditValueStrs] = useState<Record<string, string>>({});
  const [editModes, setEditModes] = useState<Record<string, "custom" | "unlimited">>({});

  const fallbackRule = rules.find((r) => r.groupIds.length === 0)!;
  const groupRules = rules.filter((r) => r.groupIds.length > 0);

  const displayValue = (v: TokenLimit) => {
    if (v === "unlimited" || v === -1) return "无限制";
    const num = Number(v).toLocaleString();
    return type === "integer" ? `${num} 个` : num;
  };

  // 在编辑态下，分组冲突依据当前草稿
  const getDisabledIds = (excludeRuleId: string) =>
    editRules.filter((r) => r.groupIds.length > 0 && r.id !== excludeRuleId).flatMap((r) => r.groupIds);

  const buildBlankGroupRule = (): PolicyRule<TokenLimit> => ({
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    groupIds: [],
    value: type === "integer" ? 3 : 100000,
  });

  const startCardEdit = () => {
    let initial = [...rules];
    // 没有分组规则时，自动展示一行空白，无需显式「添加」
    if (!initial.some((r) => r.groupIds.length > 0)) {
      const blank = buildBlankGroupRule();
      const fbIdx = initial.findIndex((r) => r.id === fallbackRule.id);
      initial = [...initial.slice(0, fbIdx), blank, ...initial.slice(fbIdx)];
    }
    const strs: Record<string, string> = {};
    const modes: Record<string, "custom" | "unlimited"> = {};
    initial.forEach((r) => {
      strs[r.id] = r.value === "unlimited" ? "" : String(r.value);
      modes[r.id] = r.value === "unlimited" ? "unlimited" : "custom";
    });
    setEditRules(initial);
    setEditValueStrs(strs);
    setEditModes(modes);
    setCardEditing(true);
  };

  const cancelCardEdit = () => {
    setCardEditing(false);
    setEditRules([]);
    setEditValueStrs({});
    setEditModes({});
  };

  const saveCardEdit = () => {
    const finalRules: PolicyRule<TokenLimit>[] = [];
    for (const r of editRules) {
      const isFallback = r.id === fallbackRule.id;
      const mode = editModes[r.id] ?? "custom";
      const valStr = editValueStrs[r.id] ?? "";
      let finalValue: TokenLimit;
      if (type === "token" && mode === "unlimited") {
        finalValue = "unlimited";
      } else {
        const n = parseInt(valStr, 10);
        if (isNaN(n) || n < 0) {
          toast.error(`请输入有效数值（${isFallback ? "预设策略" : "分组策略"}）`);
          return;
        }
        if (type === "integer" && n > 999) {
          toast.error("请输入 0-999 之间的整数");
          return;
        }
        finalValue = n;
      }
      if (!isFallback && r.groupIds.length === 0) {
        // 编辑态下若新增空白行未被填写，跳过（视为不保存该行）
        continue;
      }
      finalRules.push({ ...r, value: finalValue });
    }
    const finalGroupRules = finalRules.filter((r) => r.id !== fallbackRule.id);
    const finalFallback = finalRules.find((r) => r.id === fallbackRule.id)!;
    onRulesChange([...finalGroupRules, finalFallback]);
    toast.success("策略已保存");
    cancelCardEdit();
  };

  const updateGroups = (id: string, groupIds: string[]) =>
    setEditRules((prev) => prev.map((r) => (r.id === id ? { ...r, groupIds } : r)));
  const updateValueStr = (id: string, valStr: string) =>
    setEditValueStrs((prev) => ({ ...prev, [id]: valStr }));
  const updateMode = (id: string, mode: "custom" | "unlimited") =>
    setEditModes((prev) => ({ ...prev, [id]: mode }));

  const removeRule = (id: string) => {
    setEditRules((prev) => prev.filter((r) => r.id !== id));
    setEditValueStrs((prev) => { const { [id]: _omit, ...rest } = prev; return rest; });
    setEditModes((prev) => { const { [id]: _omit, ...rest } = prev; return rest; });
  };

  const addBlankGroupRow = () => {
    const blank = buildBlankGroupRule();
    setEditRules((prev) => {
      const fbIdx = prev.findIndex((r) => r.id === fallbackRule.id);
      return [...prev.slice(0, fbIdx), blank, ...prev.slice(fbIdx)];
    });
    setEditValueStrs((prev) => ({ ...prev, [blank.id]: type === "integer" ? "3" : "100000" }));
    setEditModes((prev) => ({ ...prev, [blank.id]: "custom" }));
  };

  // 编辑态：值编辑控件
  const renderValueEditor = (ruleId: string) => {
    const mode = editModes[ruleId] ?? "custom";
    const valStr = editValueStrs[ruleId] ?? "";
    if (type === "integer") {
      return (
        <Input
          type="number"
          value={valStr}
          onChange={(e) => updateValueStr(ruleId, e.target.value)}
          className="h-9 text-xs bg-white w-32"
          placeholder="0-999"
        />
      );
    }
    return (
      <TokenValueEditor
        mode={mode}
        valStr={valStr}
        onCommit={(nextMode, nextValStr) => {
          updateMode(ruleId, nextMode);
          updateValueStr(ruleId, nextValStr);
        }}
      />
    );
  };

  const editFallback = editRules.find((r) => r.id === fallbackRule.id);
  const editGroupRules = editRules.filter((r) => r.id !== fallbackRule.id);

  return (
    <Card className="overflow-hidden h-full py-0 gap-0">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold text-[#020617]">{title}</h3>
            <p className="text-[12px] text-[#737373] leading-relaxed mt-1">{description}</p>
          </div>
          {cardEditing ? (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="claw-outline" size="claw-sm" onClick={cancelCardEdit}>取消</Button>
              <Button variant="dialog-confirm" size="claw-sm" onClick={saveCardEdit}>保存</Button>
            </div>
          ) : (
            <Button variant="claw-outline" size="claw-sm" className="shrink-0" onClick={startCardEdit}>
              编辑
            </Button>
          )}
        </div>
      </div>

      {cardEditing ? (
        /* 编辑态：预设策略灰底卡片 + 分组策略灰底卡片 */
        <div className="px-5 pb-4 space-y-2">
          {/* 预设策略 */}
          {editFallback && (
            <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
              <Table density="compact" autoFixedColumns={false}>
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col />
                  <col style={{ width: 160 }} />
                  {timeDimension && <col style={{ width: 120 }} />}
                  <col style={{ width: 80 }} />
                </colgroup>
                <TableBody>
                  <TableRow className="border-0">
                    <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                    <TableCell><Badge variant="outline">{editGroupRules.some(r => r.groupIds.length > 0) ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">{renderValueEditor(editFallback.id)}</div>
                    </TableCell>
                    {timeDimension && (
                      <TableCell>
                        <Select value={timeDimension.value} onValueChange={(v) => timeDimension.onChange(v as "daily" | "monthly")}>
                          <SelectTrigger className="h-9 w-full text-sm bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">每日</SelectItem>
                            <SelectItem value="monthly">每月</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                    <TableActionCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* 分组策略 + 添加按钮 */}
          <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
            {editGroupRules.length > 0 && (
              <Table density="compact" autoFixedColumns={false}>
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col />
                  <col style={{ width: 160 }} />
                  {timeDimension && <col style={{ width: 120 }} />}
                  <col style={{ width: 80 }} />
                </colgroup>
                <TableBody>
                  {editGroupRules.map((rule, idx) => (
                    <TableRow key={rule.id} className={idx < editGroupRules.length - 1 ? "border-b border-[#EFEFEF]" : "border-0"}>
                      <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                      <TableCell>
                        <GroupTagSelector
                          selectedIds={rule.groupIds}
                          disabledIds={getDisabledIds(rule.id)}
                          onChange={(ids) => updateGroups(rule.id, ids)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">{renderValueEditor(rule.id)}</div>
                      </TableCell>
                      {timeDimension && (
                        <TableCell className="text-[13px] text-[#020617]">{timeDimension.value === "daily" ? "每日" : "每月"}</TableCell>
                      )}
                      <TableActionCell>
                        <Button variant="link" size="sm" onClick={() => removeRule(rule.id)}>删除</Button>
                      </TableActionCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* 添加分组按钮 —— 拉通底部 */}
            <button
              type="button"
              onClick={addBlankGroupRow}
              className={`w-full flex items-center justify-center gap-1 px-3 py-2.5 text-[13px] text-[#737373] ${editGroupRules.length > 0 ? "border-t border-dashed border-[#D4D4D4]" : ""} hover:text-[#020617] transition-colors`}
            >
              <Plus className="w-3.5 h-3.5" />添加分组策略
            </button>
          </div>
        </div>
      ) : (
        /* 视图态 */
        <div className="px-5 pb-4 space-y-2">
          {/* 预设策略 */}
          <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col />
                <col style={{ width: 160 }} />
              </colgroup>
              <TableBody>
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                  <TableCell><Badge variant="outline">{groupRules.length > 0 ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                  <TableCell className="text-[13px] text-[#020617] font-medium tabular-nums">
                    {displayValue(fallbackRule.value)}{timeDimension && `/${timeDimension.value === "daily" ? "每日" : "每月"}`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 分组策略 */}
          {groupRules.length > 0 && (
            <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
              <Table density="compact" autoFixedColumns={false}>
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col />
                  <col style={{ width: 160 }} />
                </colgroup>
                <TableBody>
                  {groupRules.map((rule, idx) => (
                    <TableRow key={rule.id} className={`hover:bg-transparent ${idx < groupRules.length - 1 ? "border-b border-[#EFEFEF]" : "border-0"}`}>
                      <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                      <TableCell><GroupBadges groupIds={rule.groupIds} /></TableCell>
                      <TableCell className="text-[13px] text-[#020617] font-medium tabular-nums">
                        {displayValue(rule.value)}{timeDimension && `/${timeDimension.value === "daily" ? "每日" : "每月"}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* 卡片底部 footer */}
      {extraContent && (
        <CardFooter className="px-5 pt-0 pb-3 flex-col items-start gap-3">
          {extraContent}
        </CardFooter>
      )}
    </Card>
  );
}

// ─── 子组件：策略编辑卡片（PolicyEditCard） ──────────────────────────────────

interface AccessModeRowConfig {
  /** 当前访问方式 */
  mode: "public" | "private";
  /** 保存回调 */
  onModeChange: (m: "public" | "private") => void;
  /** info tooltip 内容 */
  tooltipContent: React.ReactNode;
}

interface TogglePolicyCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: React.ReactNode;
  rules: PolicyRule<boolean>[];
  /** 返回 false 表示变更被拒绝（如前置校验失败），卡片不会弹成功 toast / 不会关闭编辑态 */
  onRulesChange: (rules: PolicyRule<boolean>[]) => boolean | void;
  extraContent?: React.ReactNode;
  /** 标题右侧附加内容（如 Tag + 查看详情按钮） */
  titleExtra?: React.ReactNode;
  /** 指定哪一行（rule.id）正在 loading：该行权限列显示「配置中，请勿关闭」 */
  loadingRuleId?: string | null;
  /** 可选：在预设策略行上方插入一行「访问方式」 */
  accessModeRow?: AccessModeRowConfig;
  /** 可选：禁用编辑按钮并在预设策略区域显示提示信息（ReactNode 支持 link） */
  disabledMessage?: React.ReactNode;
}

function PolicyEditCard({ icon, iconBg, title, description, rules, onRulesChange, extraContent, titleExtra, loadingRuleId, accessModeRow, disabledMessage }: TogglePolicyCardProps) {
  // 任一行处于 loading 时，权限列加宽以容纳"配置中，请勿关闭"文案
  const valueColClass = loadingRuleId ? "w-32" : "w-24";
  // 卡片级编辑态
  const [cardEditing, setCardEditing] = useState(false);
  const [editFallbackValue, setEditFallbackValue] = useState<boolean>(true);
  const [editGroupRules, setEditGroupRules] = useState<PolicyRule<boolean>[]>([]);
  // 访问方式草稿（仅在 accessModeRow 存在时使用）
  const [editAccessMode, setEditAccessMode] = useState<"public" | "private">("public");

  const fallbackRule = rules.find((r) => r.groupIds.length === 0)!;
  const groupRules = rules.filter((r) => r.groupIds.length > 0);
  // 视图态：分组规则的值 = 兜底值的相反（「例外」语义）
  // 编辑态：以草稿兜底为基准
  const editGroupRuleValue = !editFallbackValue;

  const buildBlankGroupRule = (): PolicyRule<boolean> => ({
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    groupIds: [],
    value: !editFallbackValue,
  });

  const startCardEdit = () => {
    let initial = [...groupRules];
    if (initial.length === 0) {
      // 没有分组规则时，自动放一行空白可填
      initial = [{ id: `rule-${Date.now()}`, groupIds: [], value: !fallbackRule.value }];
    }
    setEditFallbackValue(fallbackRule.value);
    setEditGroupRules(initial);
    if (accessModeRow) setEditAccessMode(accessModeRow.mode);
    setCardEditing(true);
  };

  const cancelCardEdit = () => {
    setCardEditing(false);
    setEditGroupRules([]);
  };

  const saveCardEdit = () => {
    // 仅保留填了分组的规则；统一以草稿兜底的相反值作为分组值（例外语义）
    const finalGroupRules = editGroupRules
      .filter((r) => r.groupIds.length > 0)
      .map((r) => ({ ...r, value: !editFallbackValue }));
    const finalFallback: PolicyRule<boolean> = { ...fallbackRule, value: editFallbackValue };
    const result = onRulesChange([...finalGroupRules, finalFallback]);
    if (result === false) return;
    // 同步保存访问方式
    if (accessModeRow) accessModeRow.onModeChange(editAccessMode);
    toast.success("策略已保存");
    cancelCardEdit();
  };

  const updateGroups = (id: string, groupIds: string[]) =>
    setEditGroupRules((prev) => prev.map((r) => (r.id === id ? { ...r, groupIds } : r)));

  const removeRule = (id: string) =>
    setEditGroupRules((prev) => prev.filter((r) => r.id !== id));

  const addBlankGroupRow = () =>
    setEditGroupRules((prev) => [...prev, buildBlankGroupRule()]);

  const getDisabledIds = (excludeRuleId: string) =>
    editGroupRules.filter((r) => r.groupIds.length > 0 && r.id !== excludeRuleId).flatMap((r) => r.groupIds);

  const renderFallbackEditor = () => (
    <Select value={editFallbackValue ? "on" : "off"} onValueChange={(v) => setEditFallbackValue(v === "on")}>
      <SelectTrigger className="h-7 w-[80px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="on">开启</SelectItem>
        <SelectItem value="off">关闭</SelectItem>
      </SelectContent>
    </Select>
  );

  // 行内 loading 文字
  const renderLoading = () => (
    <span className="inline-flex items-center gap-1.5 text-xs text-blue-500 font-medium whitespace-nowrap">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />配置中，请勿关闭
    </span>
  );

  return (
    <Card className="overflow-hidden h-full py-0 gap-0">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`shrink-0${disabledMessage ? " grayscale opacity-100" : ""}`}>{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 overflow-visible">
              <h3 className="text-[14px] font-semibold text-[#020617] whitespace-nowrap">{title}</h3>
              {titleExtra}
            </div>
            <p className="text-[12px] text-[#737373] leading-relaxed mt-1">{description}</p>
          </div>
          {cardEditing ? (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="claw-outline" size="claw-sm" onClick={cancelCardEdit}>取消</Button>
              <Button variant="dialog-confirm" size="claw-sm" onClick={saveCardEdit}>保存</Button>
            </div>
          ) : (
            <Button variant="claw-outline" size="claw-sm" className="shrink-0" onClick={startCardEdit} disabled={!!loadingRuleId || !!disabledMessage}>
              编辑
            </Button>
          )}
        </div>
      </div>

      {disabledMessage ? (
        /* 禁用态：显示提示信息 */
        <div className="px-5 pb-4 space-y-2">
          <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col />
                <col style={{ width: 100 }} />
              </colgroup>
              <TableBody>
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">全部用户</Badge>
                      <span className="text-[13px] text-[#A3A3A3]">{disabledMessage}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusTag mode="fill" variant="gray">关闭</StatusTag>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      ) : cardEditing ? (
        /* 编辑态 */
        <div className="px-5 pb-4 space-y-2">
          {/* 预设策略 */}
          <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col />
                {accessModeRow && <col style={{ width: 140 }} />}
                <col style={{ width: 100 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <TableBody>
                <TableRow className="border-0">
                  <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                  <TableCell><Badge variant="outline">{editGroupRules.some(r => r.groupIds.length > 0) ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                  {accessModeRow && (
                    <TableCell>
                      <Select value={editAccessMode} onValueChange={(v: "public" | "private") => setEditAccessMode(v)}>
                        <SelectTrigger className="h-7 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div><SelectItem value="public">公网访问</SelectItem></div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[280px] text-xs leading-relaxed">
                              <p><span className="font-semibold">公网访问：</span>用户通过公网直接访问 Agent 面板（WebUI），连接云服务器公网 IP。适用于大多数场景，<span className="text-white font-semibold">推荐选择</span>。</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div><SelectItem value="private">私网访问</SelectItem></div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[280px] text-xs leading-relaxed">
                              <p><span className="font-semibold">私网访问：</span>用户通过同一私有网络访问 Agent 面板（WebUI），连接云服务器内网 IP。使用前需先自行将企业内网与腾讯云私有网络（VPC）打通，并在「网络管理」中将云服务器绑定至该 VPC。配置完成后，企业用户可通过企业内网访问面板，但无法通过公网访问。</p>
                            </TooltipContent>
                          </Tooltip>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center">{renderFallbackEditor()}</div>
                  </TableCell>
                  <TableActionCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 分组策略 + 添加按钮 */}
          <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col />
                {accessModeRow && <col style={{ width: 140 }} />}
                <col style={{ width: 100 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <TableBody>
                {editGroupRules.map((rule, idx) => (
                  <TableRow key={rule.id} className={idx < editGroupRules.length - 1 ? "border-b border-[#EFEFEF]" : "border-0"}>
                    <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                    <TableCell>
                      <GroupTagSelector
                        selectedIds={rule.groupIds}
                        disabledIds={getDisabledIds(rule.id)}
                        onChange={(ids) => updateGroups(rule.id, ids)}
                      />
                    </TableCell>
                    {accessModeRow && (
                      <TableCell className="text-[13px] text-[#020617]">
                        {editAccessMode === "public" ? "公网访问" : "私网访问"}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center">
                        <StatusTag mode="fill" variant={editGroupRuleValue ? "green" : "gray"}>{editGroupRuleValue ? "开启" : "关闭"}</StatusTag>
                      </div>
                    </TableCell>
                    <TableActionCell>
                      <Button variant="link" size="sm" onClick={() => removeRule(rule.id)}>删除</Button>
                    </TableActionCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* 添加分组按钮 —— 拉通底部 */}
            <button
              type="button"
              onClick={addBlankGroupRow}
              disabled={!!loadingRuleId}
              className="w-full flex items-center justify-center gap-1 px-3 py-2.5 text-[13px] text-[#737373] border-t border-dashed border-[#D4D4D4] hover:text-[#020617] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />添加分组策略
            </button>
          </div>
        </div>
      ) : (
        /* 视图态 */
        <div className="px-5 pb-4 space-y-2">
          {/* 预设策略 */}
          <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col />
                {accessModeRow && <col style={{ width: 140 }} />}
                <col style={{ width: 100 }} />
              </colgroup>
              <TableBody>
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                  <TableCell><Badge variant="outline">{groupRules.length > 0 ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                  {accessModeRow && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-[#020617]">
                        {accessModeRow.mode === "public" ? "公网访问" : "私网访问"}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default"><Info className="w-3.5 h-3.5 text-[#A3A3A3]" /></span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
                            <p className="mb-1.5"><span className="font-semibold">公网访问：</span>用户通过公网直接访问 Agent 面板（WebUI），连接云服务器公网 IP。适用于大多数场景，<span className="text-white font-semibold">推荐选择</span>。</p>
                            <p><span className="font-semibold">私网访问：</span>用户通过同一私有网络访问 Agent 面板（WebUI），连接云服务器内网 IP。使用前需先自行将企业内网与腾讯云私有网络（VPC）打通，并在「网络管理」中将云服务器绑定至该 VPC。配置完成后，企业用户可通过企业内网访问面板，但无法通过公网访问。</p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    {loadingRuleId === fallbackRule.id
                      ? renderLoading()
                      : <StatusTag mode="fill" variant={fallbackRule.value ? "green" : "gray"}>{fallbackRule.value ? "开启" : "关闭"}</StatusTag>}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 分组策略 */}
          {groupRules.length > 0 && (
            <div className="rounded-[4px] bg-[#FAFAFA] overflow-hidden">
              <Table density="compact" autoFixedColumns={false}>
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col />
                  {accessModeRow && <col style={{ width: 140 }} />}
                  <col style={{ width: 100 }} />
                </colgroup>
                <TableBody>
                  {groupRules.map((rule, idx) => (
                    <TableRow key={rule.id} className={`hover:bg-transparent ${idx < groupRules.length - 1 ? "border-b border-[#EFEFEF]" : "border-0"}`}>
                      <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                      <TableCell><GroupBadges groupIds={rule.groupIds} /></TableCell>
                      {accessModeRow && (
                        <TableCell className="text-[13px] text-[#020617]">
                          {accessModeRow.mode === "public" ? "公网访问" : "私网访问"}
                        </TableCell>
                      )}
                      <TableCell>
                        {loadingRuleId === rule.id
                          ? renderLoading()
                          : <StatusTag mode="fill" variant={rule.value ? "green" : "gray"}>{rule.value ? "开启" : "关闭"}</StatusTag>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* 卡片底部 footer */}
      {extraContent && (
        <CardFooter className="px-5 pt-0 pb-3 flex-col items-start gap-3">
          {extraContent}
        </CardFooter>
      )}
    </Card>
  );
}

// 保持向后兼容的别名
const TogglePolicyCard = PolicyEditCard;

// ─── Hover 气泡组件（白底黑字，hover 触发） ─────────────────────────────────

function HoverPopover({ trigger, children, width = 280 }: { trigger: React.ReactNode; children: React.ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          {trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="p-3 bg-white text-[#020617] shadow-md border border-[#E5E5E5]"
        style={{ width }}
        align="start"
        sideOffset={6}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

// ─── 卡片级 Hover 气泡（hover 整个卡片时在卡片下方显示等宽气泡） ─────────────

function CardHoverPopover({ children, popoverContent }: { children: React.ReactNode; popoverContent: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-3 bg-white text-[#020617] shadow-md border border-[#E5E5E5] w-[var(--radix-popover-trigger-width)] max-h-[180px] overflow-y-auto"
        align="start"
        sideOffset={4}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}

// ─── 方案2 侧边栏编辑器：配额类（直接展示编辑态表格，无卡片包裹） ──────────

function SheetQuotaEditor({
  card,
  timeDimension,
  onDone,
  hideActions,
  saveRef,
  addRef,
  onDisableChange,
}: {
  card: { key: string; type: "integer" | "token"; rules: PolicyRule<TokenLimit>[]; onRulesChange: (rules: PolicyRule<TokenLimit>[]) => void };
  timeDimension?: { value: "daily" | "monthly"; onChange: (v: "daily" | "monthly") => void };
  onDone: () => void;
  hideActions?: boolean;
  saveRef?: React.MutableRefObject<(() => void) | null>;
  addRef?: React.MutableRefObject<(() => void) | null>;
  onDisableChange?: (disabled: boolean) => void;
}) {
  const fallbackRule = card.rules.find((r) => r.groupIds.length === 0)!;
  const [editRules, setEditRules] = useState<PolicyRule<TokenLimit>[]>(() => {
    let initial = [...card.rules];
    if (!initial.some((r) => r.groupIds.length > 0)) {
      const blank: PolicyRule<TokenLimit> = { id: `rule-${Date.now()}`, groupIds: [], value: card.type === "integer" ? 3 : 100000 };
      const fbIdx = initial.findIndex((r) => r.id === fallbackRule.id);
      initial = [...initial.slice(0, fbIdx), blank, ...initial.slice(fbIdx)];
    }
    return initial;
  });
  const [editValueStrs, setEditValueStrs] = useState<Record<string, string>>(() => {
    const strs: Record<string, string> = {};
    editRules.forEach((r) => { strs[r.id] = r.value === "unlimited" ? "" : String(r.value); });
    return strs;
  });
  const [editModes, setEditModes] = useState<Record<string, "custom" | "unlimited">>(() => {
    const modes: Record<string, "custom" | "unlimited"> = {};
    editRules.forEach((r) => { modes[r.id] = r.value === "unlimited" ? "unlimited" : "custom"; });
    return modes;
  });

  const editFallback = editRules.find((r) => r.id === fallbackRule.id);
  const editGroupRules = editRules.filter((r) => r.id !== fallbackRule.id);

  const getDisabledIds = (excludeRuleId: string) =>
    editRules.filter((r) => r.groupIds.length > 0 && r.id !== excludeRuleId).flatMap((r) => r.groupIds);

  const updateGroups = (id: string, groupIds: string[]) =>
    setEditRules((prev) => prev.map((r) => (r.id === id ? { ...r, groupIds } : r)));
  const updateValueStr = (id: string, valStr: string) =>
    setEditValueStrs((prev) => ({ ...prev, [id]: valStr }));
  const updateMode = (id: string, mode: "custom" | "unlimited") =>
    setEditModes((prev) => ({ ...prev, [id]: mode }));
  const removeRule = (id: string) => {
    setEditRules((prev) => prev.filter((r) => r.id !== id));
    setEditValueStrs((prev) => { const { [id]: _omit, ...rest } = prev; return rest; });
    setEditModes((prev) => { const { [id]: _omit, ...rest } = prev; return rest; });
  };
  const addBlankGroupRow = () => {
    const blank: PolicyRule<TokenLimit> = { id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, groupIds: [], value: card.type === "integer" ? 3 : 100000 };
    setEditRules((prev) => {
      const fbIdx = prev.findIndex((r) => r.id === fallbackRule.id);
      return [...prev.slice(0, fbIdx), blank, ...prev.slice(fbIdx)];
    });
    setEditValueStrs((prev) => ({ ...prev, [blank.id]: card.type === "integer" ? "3" : "100000" }));
    setEditModes((prev) => ({ ...prev, [blank.id]: "custom" }));
  };

  const renderValueEditor = (ruleId: string) => {
    const mode = editModes[ruleId] ?? "custom";
    const valStr = editValueStrs[ruleId] ?? "";
    if (card.type === "integer") {
      return <Input type="number" value={valStr} onChange={(e) => updateValueStr(ruleId, e.target.value)} className="h-9 text-xs bg-white w-32" placeholder="0-999" />;
    }
    return (
      <TokenValueEditor mode={mode} valStr={valStr} onCommit={(nextMode, nextValStr) => { updateMode(ruleId, nextMode); updateValueStr(ruleId, nextValStr); }} />
    );
  };

  const handleSave = () => {
    const finalRules: PolicyRule<TokenLimit>[] = [];
    for (const r of editRules) {
      const isFallback = r.id === fallbackRule.id;
      const mode = editModes[r.id] ?? "custom";
      const valStr = editValueStrs[r.id] ?? "";
      // 过滤掉空值的分组策略行（适用范围为空 或 配额值为空）
      if (!isFallback) {
        if (r.groupIds.length === 0) continue;
        if (mode === "custom" && valStr.trim() === "") continue;
      } else {
        // 预设策略行：值为空时跳过本次保存（保留原值）
        if (mode === "custom" && valStr.trim() === "") continue;
      }
      let finalValue: TokenLimit;
      if (card.type === "token" && mode === "unlimited") {
        finalValue = "unlimited";
      } else {
        const n = parseInt(valStr, 10);
        if (isNaN(n) || n < 0) continue;
        if (card.type === "integer" && n > 999) continue;
        finalValue = n;
      }
      finalRules.push({ ...r, value: finalValue });
    }
    const finalGroupRules = finalRules.filter((r) => r.id !== fallbackRule.id);
    const finalFallbackRule = finalRules.find((r) => r.id === fallbackRule.id) ?? fallbackRule;
    card.onRulesChange([...finalGroupRules, finalFallbackRule]);
    toast.success("策略已保存");
    onDone();
  };

  // 暴露 save/add 给外部
  if (saveRef) saveRef.current = handleSave;
  if (addRef) addRef.current = addBlankGroupRow;

  // 通知外部按钮不再禁用
  useEffect(() => { if (onDisableChange) onDisableChange(false); }, []);

  return (
    <div className="space-y-4">
      {/* 合并的策略表格 */}
      <div className="rounded-[4px] bg-white border border-[#E5E5E5]">
        <Table density="compact" autoFixedColumns={false}>
          <colgroup>
            <col style={{ width: 80 }} />
            <col />
            <col style={{ width: 140 }} />
            {timeDimension && <col style={{ width: 100 }} />}
            <col style={{ width: 100 }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>策略类型</TableHead>
              <TableHead>适用范围</TableHead>
              <TableHead>配额值</TableHead>
              {timeDimension && (
                <TableHead>
                  <span className="inline-flex items-center gap-1">
                    时间维度
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default"><Info className="w-3.5 h-3.5 text-gray-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[320px] leading-relaxed">
                        达到上限后暂停服务，{timeDimension.value === "daily" ? "每天 0 点重置" : "每月 1 号 0 点重置"}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </TableHead>
              )}
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 预设策略行 */}
            {editFallback && (
              <TableRow className="border-0">
                <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                <TableCell><Badge variant="outline">{editGroupRules.some(r => r.groupIds.length > 0) ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                <TableCell><div className="flex items-center gap-1">{renderValueEditor(editFallback.id)}</div></TableCell>
                {timeDimension && (
                  <TableCell>
                    <Select value={timeDimension.value} onValueChange={(v) => timeDimension.onChange(v as "daily" | "monthly")}>
                      <SelectTrigger className="h-9 w-full text-sm bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">每日</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
                <TableActionCell />
              </TableRow>
            )}
            {/* 分组策略行 */}
            {editGroupRules.map((rule, idx) => (
              <TableRow key={rule.id} className="border-0">
                <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                <TableCell>
                  <GroupTagSelector selectedIds={rule.groupIds} disabledIds={getDisabledIds(rule.id)} onChange={(ids) => updateGroups(rule.id, ids)} />
                </TableCell>
                <TableCell><div className="flex items-center gap-1">{renderValueEditor(rule.id)}</div></TableCell>
                {timeDimension && <TableCell className="text-[13px] text-[#020617]">{timeDimension.value === "daily" ? "每日" : "每月"}</TableCell>}
                <TableActionCell><Button variant="link" size="sm" onClick={() => removeRule(rule.id)}>删除</Button></TableActionCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 添加分组策略 - 表格下方全宽虚线幽灵按钮 */}
        <button
          type="button"
          onClick={addBlankGroupRow}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[13px] text-[#020617] bg-white border-t border-dashed border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />添加分组策略
        </button>
      </div>

      {/* 操作按钮 */}
      {!hideActions && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="claw-outline" size="claw-sm" onClick={onDone}>取消</Button>
          <Button variant="dialog-confirm" size="claw-sm" onClick={handleSave}>保存</Button>
        </div>
      )}
    </div>
  );
}

// ─── 方案2 侧边栏编辑器：开关类（直接展示编辑态表格，无卡片包裹） ──────────

function SheetToggleEditor({
  card,
  onDone,
  hideActions,
  saveRef,
  addRef,
  onDisableChange,
}: {
  card: { key: string; title: string; rules: PolicyRule<boolean>[]; onRulesChange: (rules: PolicyRule<boolean>[]) => boolean | void };
  cardKey: string;
  onDone: () => void;
  hideActions?: boolean;
  saveRef?: React.MutableRefObject<(() => void) | null>;
  addRef?: React.MutableRefObject<(() => void) | null>;
  onDisableChange?: (disabled: boolean) => void;
}) {
  const fallbackRule = card.rules.find((r) => r.groupIds.length === 0)!;
  const groupRules = card.rules.filter((r) => r.groupIds.length > 0);

  const [editFallbackValue, setEditFallbackValue] = useState<boolean>(fallbackRule.value);
  const [editGroupRules, setEditGroupRules] = useState<PolicyRule<boolean>[]>(() => {
    if (groupRules.length === 0) return [{ id: `rule-${Date.now()}`, groupIds: [], value: !fallbackRule.value }];
    return [...groupRules];
  });

  const editGroupRuleValue = !editFallbackValue;

  const getDisabledIds = (excludeRuleId: string) =>
    editGroupRules.filter((r) => r.groupIds.length > 0 && r.id !== excludeRuleId).flatMap((r) => r.groupIds);

  const updateGroups = (id: string, groupIds: string[]) =>
    setEditGroupRules((prev) => prev.map((r) => (r.id === id ? { ...r, groupIds } : r)));
  const removeRule = (id: string) =>
    setEditGroupRules((prev) => prev.filter((r) => r.id !== id));
  const addBlankGroupRow = () =>
    setEditGroupRules((prev) => [...prev, { id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, groupIds: [], value: !editFallbackValue }]);

  const handleSave = () => {
    const finalGroupRules = editGroupRules
      .filter((r) => r.groupIds.length > 0)
      .map((r) => ({ ...r, value: !editFallbackValue }));
    const finalFallback: PolicyRule<boolean> = { ...fallbackRule, value: editFallbackValue };
    const result = card.onRulesChange([...finalGroupRules, finalFallback]);
    if (result === false) return;
    toast.success("策略已保存");
    onDone();
  };

  // 暴露 save/add 给外部
  if (saveRef) saveRef.current = handleSave;
  if (addRef) addRef.current = addBlankGroupRow;

  // 通知外部按钮不再禁用
  useEffect(() => { if (onDisableChange) onDisableChange(false); }, []);

  return (
    <div className="space-y-4">
      {/* 合并的策略表格 */}
      <div className="rounded-[4px] bg-white border border-[#E5E5E5]">
        <Table density="compact" autoFixedColumns={false}>
          <colgroup>
            <col style={{ width: 80 }} />
            <col />
            <col style={{ width: 120 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>策略类型</TableHead>
              <TableHead>适用范围</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 预设策略行 */}
            <TableRow className="border-0">
              <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
              <TableCell><Badge variant="outline">{editGroupRules.some(r => r.groupIds.length > 0) ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
              <TableCell>
                <Select value={editFallbackValue ? "on" : "off"} onValueChange={(v) => setEditFallbackValue(v === "on")}>
                  <SelectTrigger className="h-9 w-[120px] text-sm bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on"><StatusTag mode="fill" variant="green">开启</StatusTag></SelectItem>
                    <SelectItem value="off"><StatusTag mode="fill" variant="gray">关闭</StatusTag></SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableActionCell />
            </TableRow>
            {/* 分组策略行 */}
            {editGroupRules.map((rule, idx) => (
              <TableRow key={rule.id} className="border-0">
                <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                <TableCell>
                  <GroupTagSelector selectedIds={rule.groupIds} disabledIds={getDisabledIds(rule.id)} onChange={(ids) => updateGroups(rule.id, ids)} />
                </TableCell>
                <TableCell>
                  <StatusTag mode="fill" variant={editGroupRuleValue ? "green" : "gray"}>{editGroupRuleValue ? "开启" : "关闭"}</StatusTag>
                </TableCell>
                <TableActionCell><Button variant="link" size="sm" onClick={() => removeRule(rule.id)}>删除</Button></TableActionCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 添加分组策略 - 表格下方全宽虚线幽灵按钮 */}
        <button
          type="button"
          onClick={addBlankGroupRow}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[13px] text-[#020617] bg-white border-t border-dashed border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />添加分组策略
        </button>
      </div>

      {/* 操作按钮 */}
      {!hideActions && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="claw-outline" size="claw-sm" onClick={onDone}>取消</Button>
          <Button variant="dialog-confirm" size="claw-sm" onClick={handleSave}>保存</Button>
        </div>
      )}
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function PlatformPolicy() {
  const [, navigate] = useLocation();

  // 平台策略页：让 inset main 显式作为滚动容器，并解除 wrapper 的 overflow 限制
  // 这样 sticky 锚点导航可相对 main 视口顶部吸顶
  useEffect(() => {
    const inset = document.querySelector('[data-slot="admin-sidebar-inset"]') as HTMLElement | null;
    if (!inset) return;
    const wrapper = inset.querySelector(':scope > div') as HTMLElement | null;

    // 保存原值
    const prevInset = {
      height: inset.style.height,
      maxHeight: inset.style.maxHeight,
      overflowY: inset.style.overflowY,
    };
    const prevWrapper = {
      overflow: wrapper?.style.overflow ?? "",
      overflowX: wrapper?.style.overflowX ?? "",
      overflowY: wrapper?.style.overflowY ?? "",
    };

    // 1) inset 显式 100vh + overflow-y:auto，使其成为唯一稳定滚动容器
    inset.style.height = "100vh";
    inset.style.maxHeight = "100vh";
    inset.style.overflowY = "auto";
    // 2) wrapper 解除所有 overflow 限制
    if (wrapper) {
      wrapper.style.overflow = "visible";
      wrapper.style.overflowX = "visible";
      wrapper.style.overflowY = "visible";
    }

    return () => {
      inset.style.height = prevInset.height;
      inset.style.maxHeight = prevInset.maxHeight;
      inset.style.overflowY = prevInset.overflowY;
      if (wrapper) {
        wrapper.style.overflow = prevWrapper.overflow;
        wrapper.style.overflowX = prevWrapper.overflowX;
        wrapper.style.overflowY = prevWrapper.overflowY;
      }
    };
  }, []);

  // ── 用户配额规则 ──
  const [clawRules, setClawRules] = useState<PolicyRule<TokenLimit>[]>([
    { id: "claw-fallback", groupIds: [], value: 3 },
  ]);
  const [tokenRules, setTokenRules] = useState<PolicyRule<TokenLimit>[]>([
    { id: "token-fallback", groupIds: [], value: 500000 },
  ]);

  // ── 模型配额规则 ──
  const [globalTokenRules, setGlobalTokenRules] = useState<PolicyRule<TokenLimit>[]>([
    { id: "global-fallback", groupIds: [], value: 1000000 },
  ]);
  // 全局 Tokens 时间维度（每日/不限时）
  const [globalTokenTimeDim, setGlobalTokenTimeDim] = useState<"daily" | "monthly">(() => {
    const v = localStorage.getItem("admin_global_token_time_dim");
    return v === "monthly" ? "monthly" : "daily"; // 旧值（如 unlimited）回退为 daily
  });
  // 初次挂载时把当前分组策略同步到 localStorage，确保 TokensMonitor 能读到
  useEffect(() => {
    const groupRules = globalTokenRules
      .filter((r) => r.groupIds.length > 0)
      .map((r) => ({ id: r.id, groupIds: r.groupIds, value: r.value }));
    const serialized = JSON.stringify(groupRules);
    localStorage.setItem("admin_global_token_group_rules", serialized);
    window.dispatchEvent(new StorageEvent("storage", { key: "admin_global_token_group_rules", newValue: serialized, storageArea: localStorage }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleGlobalTokenRulesChange = (next: PolicyRule<TokenLimit>[]) => {
    setGlobalTokenRules(next);
    const fallback = next.find((r) => r.groupIds.length === 0);
    if (fallback) {
      if (fallback.value === "unlimited") {
        localStorage.setItem("globalLimitMode", "unlimited");
        window.dispatchEvent(new StorageEvent("storage", { key: "globalLimitMode", newValue: "unlimited", storageArea: localStorage }));
      } else {
        localStorage.setItem("globalLimitMode", "custom");
        localStorage.setItem("globalLimit", String(fallback.value));
        window.dispatchEvent(new StorageEvent("storage", { key: "globalLimitMode", newValue: "custom", storageArea: localStorage }));
      }
    }
    // 同步分组策略（除兜底行之外）到 localStorage，供 TokensMonitor 读取
    const groupRules = next
      .filter((r) => r.groupIds.length > 0)
      .map((r) => ({ id: r.id, groupIds: r.groupIds, value: r.value }));
    const serialized = JSON.stringify(groupRules);
    localStorage.setItem("admin_global_token_group_rules", serialized);
    window.dispatchEvent(new StorageEvent("storage", { key: "admin_global_token_group_rules", newValue: serialized, storageArea: localStorage }));
  };

  // ── 功能权限开关规则 ──
  const [configModelRules, setConfigModelRules] = useState<PolicyRule<boolean>[]>([{ id: "cm-fallback", groupIds: [], value: true }]);
  const [configChannelRules, setConfigChannelRules] = useState<PolicyRule<boolean>[]>([{ id: "cc-fallback", groupIds: [], value: true }]);
  const [customModelRules, setCustomModelRules] = useState<PolicyRule<boolean>[]>([{ id: "cust-fallback", groupIds: [], value: false }]);
  const [terminalRules, setTerminalRules] = useState<PolicyRule<boolean>[]>([{ id: "term-fallback", groupIds: [], value: false }]);
  // 允许员工自助更新 Agent 版本（用户端 OpenClawDetail 读取同一 key）
  // 默认值 true（新企业符合既有产品行为：员工有"一键更新"按钮）
  const [selfUpgradeRules, setSelfUpgradeRules] = useState<PolicyRule<boolean>[]>(() => {
    const raw = localStorage.getItem("admin_allow_self_upgrade");
    const value = raw === null ? true : raw === "true";
    return [{ id: "selfup-fallback", groupIds: [], value }];
  });
  const handleSelfUpgradeRulesChange = (next: PolicyRule<boolean>[]): boolean | void => {
    setSelfUpgradeRules(next);
    const enabled = next.some((r) => r.value);
    localStorage.setItem("admin_allow_self_upgrade", enabled ? "true" : "false");
  };
  const [panelRules, setPanelRules] = useState<PolicyRule<boolean>[]>(() => [
    { id: "panel-fallback", groupIds: [], value: localStorage.getItem("admin_allow_panel_access") === "true" },
  ]);
  const [chatViewRules, setChatViewRules] = useState<PolicyRule<boolean>[]>([{ id: "chat-fallback", groupIds: [], value: true }]);
  const [cloudBrowserRules, setCloudBrowserRules] = useState<PolicyRule<boolean>[]>(() => [
    { id: "cb-fallback", groupIds: [], value: localStorage.getItem("admin_allow_cloud_browser") === "true" },
  ]);
  const [lobsterDoctorRules, setLobsterDoctorRules] = useState<PolicyRule<boolean>[]>(() => [
    // 与「允许用户访问 Agent 云端浏览器」同款持久化策略：从 localStorage 恢复开关状态，
    // 避免管控端切换开关后用户端无法感知（用户端 OpenClawDetail 读同一个 key）。
    { id: "ld-fallback", groupIds: [], value: localStorage.getItem("admin_allow_lobster_doctor") !== "false" },
  ]);
  const [modelQuotaRules, setModelQuotaRules] = useState<PolicyRule<boolean>[]>([{ id: "mq-fallback", groupIds: [], value: true }]);

  // ── Agent 面板属性 ──
  const [panelAccessMode, setPanelAccessMode] = useState<"public" | "private">(() =>
    (localStorage.getItem("admin_panel_access_mode") as "public" | "private") || "public"
  );
  const [panelPort, setPanelPort] = useState<string | null>(() => localStorage.getItem("admin_panel_port"));
  const [panelLoadingRuleId, setPanelLoadingRuleId] = useState<string | null>(null);
  // 本次自动追加的 面板端口 放通规则 id（用于在卡片内展示"已自动添加"提示）
  const [panelSgRuleId, setPanelSgRuleId] = useState<string | null>(() => localStorage.getItem("admin_panel_sg_rule_id"));

  // 计算面板规则是否已开启（任一规则值为 true）
  const isPanelEnabled = (rs: PolicyRule<boolean>[]) => rs.some((r) => r.value);

  // 检查是否已配置安全组
  const hasSecurityGroup = useMemo(() => {
    const snapshotRaw = localStorage.getItem("admin_default_security_group_snapshot");
    if (!snapshotRaw) return false;
    try {
      const snapshot = JSON.parse(snapshotRaw);
      return snapshot && Array.isArray(snapshot.inboundRules);
    } catch { return false; }
  }, []);
  // 找到触发开启的那一行（next 中 value=true 但 prev 中 false 的第一行；找不到则返回兜底行）
  const findTriggeredEnableRule = (prev: PolicyRule<boolean>[], next: PolicyRule<boolean>[]) => {
    const prevMap = new Map(prev.map((r) => [r.id, r.value]));
    const enabledRow = next.find((r) => r.value && !prevMap.get(r.id));
    return enabledRow?.id ?? next.find((r) => r.value)?.id ?? null;
  };

  const handlePanelRulesChange = (next: PolicyRule<boolean>[]): boolean | void => {
    const prev = panelRules;
    const wasEnabled = isPanelEnabled(prev);
    const willEnable = isPanelEnabled(next);

    // 关闭 → 开启：执行开启流程（校验安全组 + loading + 分配端口 + 补规则）
    if (!wasEnabled && willEnable) {
      const snapshotRaw = localStorage.getItem("admin_default_security_group_snapshot");
      let snapshot: DefaultSecurityGroupSnapshot | null = null;
      if (snapshotRaw) {
        try { snapshot = JSON.parse(snapshotRaw) as DefaultSecurityGroupSnapshot; } catch { snapshot = null; }
      }
      if (!snapshot || !Array.isArray(snapshot.inboundRules)) {
        toast.error("请先前往网络管理配置 ClawPro 的安全组，再开启该功能");
        return false; // 回滚：不应用本次规则变更，卡片也不弹成功 toast
      }
      // 应用规则变更并进入 loading
      setPanelRules(next);
      localStorage.setItem("admin_allow_panel_access", "true");
      const triggeredId = findTriggeredEnableRule(prev, next);
      setPanelLoadingRuleId(triggeredId);
      setTimeout(() => {
        const randomPort = String(Math.floor(Math.random() * 1000) + 9000);
        const portNum = Number(randomPort);
        const hasCovered = snapshot!.inboundRules.some((r) => isInboundRuleCoverPort(r, portNum));
        if (!hasCovered) {
          const newRule: SnapshotInboundRule = {
            id: `panel-${Date.now()}`,
            source: "0.0.0.0/0",
            protocol: "TCP",
            port: randomPort,
            policy: "允许",
            remark: "Agent 面板访问",
          };
          const nextSnapshot: DefaultSecurityGroupSnapshot = {
            ...snapshot!,
            inboundRules: [...snapshot!.inboundRules, newRule],
          };
          localStorage.setItem("admin_default_security_group_snapshot", JSON.stringify(nextSnapshot));
          localStorage.setItem("admin_panel_sg_rule_id", newRule.id);
          setPanelSgRuleId(newRule.id);
        } else {
          localStorage.removeItem("admin_panel_sg_rule_id");
          setPanelSgRuleId(null);
        }
        setPanelPort(randomPort);
        localStorage.setItem("admin_panel_port", randomPort);
        setPanelLoadingRuleId(null);
        toast.success("已开启用户端访问 Agent 面板");
      }, 3000);
      return;
    }

    // 开启 → 关闭：清理端口和自动补规则标记
    if (wasEnabled && !willEnable) {
      setPanelRules(next);
      localStorage.setItem("admin_allow_panel_access", "false");
      setPanelPort(null);
      localStorage.removeItem("admin_panel_port");
      localStorage.removeItem("admin_panel_sg_rule_id");
      setPanelSgRuleId(null);
      toast.success("已禁止用户端访问 Agent 面板");
      return;
    }

    // 其他情况（已开启状态下规则增删/值变更，或都是关闭态）：直接应用
    setPanelRules(next);
  };

  // ── Agent 云端浏览器属性 ──
  const [cloudBrowserSgRuleId, setCloudBrowserSgRuleId] = useState<string | null>(() =>
    localStorage.getItem("admin_cloud_browser_sg_rule_id"),
  );
  const isCloudBrowserEnabled = (rs: PolicyRule<boolean>[]) => rs.some((r) => r.value);

  const handleCloudBrowserRulesChange = (next: PolicyRule<boolean>[]): boolean | void => {
    const wasEnabled = isCloudBrowserEnabled(cloudBrowserRules);
    const willEnable = isCloudBrowserEnabled(next);

    // 关闭 → 开启：校验安全组并尝试补 6080 放通规则
    if (!wasEnabled && willEnable) {
      const snapshotRaw = localStorage.getItem("admin_default_security_group_snapshot");
      let snapshot: DefaultSecurityGroupSnapshot | null = null;
      if (snapshotRaw) {
        try { snapshot = JSON.parse(snapshotRaw) as DefaultSecurityGroupSnapshot; } catch { snapshot = null; }
      }
      if (!snapshot || !Array.isArray(snapshot.inboundRules)) {
        toast.error("请先前往网络管理配置 ClawPro 的安全组，再开启该功能");
        return false;
      }

      // 判断是否已有 6080 放通规则
      const hasCovered = snapshot.inboundRules.some((r) => isInboundRuleCoverPort(r, 6080));
      if (!hasCovered) {
        const newRule: SnapshotInboundRule = {
          id: `cb-${Date.now()}`,
          source: "0.0.0.0/0",
          protocol: "TCP",
          port: "6080",
          policy: "允许",
          remark: "云端浏览器访问",
        };
        const nextSnapshot: DefaultSecurityGroupSnapshot = {
          ...snapshot,
          inboundRules: [...snapshot.inboundRules, newRule],
        };
        localStorage.setItem("admin_default_security_group_snapshot", JSON.stringify(nextSnapshot));
        localStorage.setItem("admin_cloud_browser_sg_rule_id", newRule.id);
        setCloudBrowserSgRuleId(newRule.id);
      } else {
        localStorage.removeItem("admin_cloud_browser_sg_rule_id");
        setCloudBrowserSgRuleId(null);
      }

      setCloudBrowserRules(next);
      localStorage.setItem("admin_allow_cloud_browser", "true");
      toast.success("已开启 Agent 云端浏览器");
      return;
    }

    // 开启 → 关闭：清掉"自动添加"标记（规则保留在安全组中）
    if (wasEnabled && !willEnable) {
      setCloudBrowserRules(next);
      localStorage.setItem("admin_allow_cloud_browser", "false");
      localStorage.removeItem("admin_cloud_browser_sg_rule_id");
      setCloudBrowserSgRuleId(null);
      toast.success("已关闭 Agent 云端浏览器");
      return;
    }

    // 其他情况：直接应用
    setCloudBrowserRules(next);
  };

  // ── 龙虾医生开关持久化（与云端浏览器同款模式）────────────────────────────
  // 动机：用户端 OpenClawDetail 通过读取 localStorage 的 "admin_allow_lobster_doctor"
  //       决定是否渲染「龙虾医生对话卡片」，并监听 storage 事件实现跨 tab 响应。
  //       而此前本页的 onRulesChange 仅 setState、未 persist，导致：
  //         ① 管控端开启后切到用户端仍看不到龙虾医生；
  //         ② 再次回到管控端时 state 复位到初始 false（因无持久化源）；
  //       形成"开关打不开、也留不住"的双重断裂。此 handler 负责打通该链路。
  const isLobsterDoctorEnabled = (rs: PolicyRule<boolean>[]) => rs.some((r) => r.value);
  const handleLobsterDoctorRulesChange = (next: PolicyRule<boolean>[]): boolean | void => {
    const wasEnabled = isLobsterDoctorEnabled(lobsterDoctorRules);
    const willEnable = isLobsterDoctorEnabled(next);
    setLobsterDoctorRules(next);
    if (!wasEnabled && willEnable) {
      localStorage.setItem("admin_allow_lobster_doctor", "true");
      toast.success("已开启龙虾医生");
    } else if (wasEnabled && !willEnable) {
      localStorage.setItem("admin_allow_lobster_doctor", "false");
      toast.success("已关闭龙虾医生");
    }
  };

  // ── Tab 方案切换 ──
  const [activeTab, setActiveTab] = useState<"plan1" | "plan2" | "plan21" | "plan22" | "plan3" | "plan4">("plan4");
  // ── 方案4 锚点导航聚焦 ──
  const [activeAnchor, setActiveAnchor] = useState<string>("claw");
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerHighlight = (key: string) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightKey(key);
    highlightTimerRef.current = setTimeout(() => setHighlightKey(null), 1500);
  };
  // ── 方案1 子 tab ──
  const [plan1SubTab, setPlan1SubTab] = useState<"quota" | "permission">("quota");

  // ── 方案2 侧边栏编辑状态 ──
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetEditingCard, setSheetEditingCard] = useState<{
    type: "quota" | "toggle";
    title: string;
    cardKey: string;
  } | null>(null);
  const [plan2IsEditing, setPlan2IsEditing] = useState(false);
  const [plan2EditingRowId, setPlan2EditingRowId] = useState<string | null>(null);
  const [plan2IsAddingRow, setPlan2IsAddingRow] = useState(false);
  const [plan2RowDraft, setPlan2RowDraft] = useState<{ mode: "custom" | "unlimited"; valStr: string; toggleVal?: boolean; groupIds?: string[] }>({ mode: "custom", valStr: "" });
  const plan2SaveRef = useRef<(() => void) | null>(null);
  const plan2AddRef = useRef<(() => void) | null>(null);
  const [plan2DisableActions, setPlan2DisableActions] = useState(false);

  // ── 方案3 二级编辑页状态 ──
  const [plan3EditingKey, setPlan3EditingKey] = useState<string | null>(null);
  const [plan3ResetCount, setPlan3ResetCount] = useState(0);
  const [plan3IsEditing, setPlan3IsEditing] = useState(false);
  const plan3SaveRef = useRef<(() => void) | null>(null);

  // ── 龙虾医生详情弹窗 ──
  const [showLobsterDoctorDialog, setShowLobsterDoctorDialog] = useState(false);

  // ── 方案2/方案3 共用的卡片数据定义 ──
  const quotaCards = [
    { key: "claw", icon: "/assets/admin-platform-policy/user-agent-limit.svg", iconClass: "w-[42px]", title: "单用户 Agent 数量上限", description: "单用户最多可以创建的 Agent 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整", type: "integer" as const, rules: clawRules, onRulesChange: setClawRules },
    { key: "token", icon: "/assets/admin-platform-policy/user-daily-token-limit.svg", iconClass: "w-10", title: "单用户每日 Tokens 上限", description: "单用户每日最多可消耗的 Tokens 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整", type: "token" as const, rules: tokenRules, onRulesChange: setTokenRules },
    { key: "global", icon: "/assets/admin-platform-policy/global-token-limit.svg", iconClass: "w-10", title: "全局 Tokens 上限", description: "全局 Tokens 指所有企业用户使用所有模型所消耗的总 Tokens 数量，达到上限后将暂停服务", type: "token" as const, rules: globalTokenRules, onRulesChange: handleGlobalTokenRulesChange },
  ];

  const toggleCards = [
    { key: "configModel", icon: "/assets/admin-platform-policy/allow-config-model.svg", title: "允许用户「配置模型」", navTitle: "配置模型", description: "开启后，用户可在 Agent 详细配置中自行选择和切换模型。关闭后，模型配置区域将锁定，用户无法调整", rules: configModelRules, onRulesChange: setConfigModelRules },
    { key: "configChannel", icon: "/assets/admin-platform-policy/allow-config-channel.svg", title: "允许用户「配置通道」", navTitle: "配置通道", description: "开启后，用户可在 Agent 详细配置中自行添加和管理通道。关闭后，通道配置区域将锁定，用户无法调整", rules: configChannelRules, onRulesChange: setConfigChannelRules },
    { key: "customModel", icon: "/assets/admin-platform-policy/allow-custom-model.svg", title: "允许用户「添加自定义模型」", navTitle: "添加自定义模型", description: "开启后，用户可在 Agent 中自行添加自定义模型，不在企业管控和 Tokens 覆盖范围内", rules: customModelRules, onRulesChange: setCustomModelRules },
    { key: "terminal", icon: "/assets/admin-platform-policy/allow-agent-terminal.svg", title: "允许用户「进入 Agent 终端」", navTitle: "进入 Agent 终端", description: "开启后，所有用户在用户端可看到「进入终端」选项，进入对应 Agent 云服务器的终端", rules: terminalRules, onRulesChange: setTerminalRules },
    { key: "selfUpgrade", icon: "/assets/admin-platform-policy/allow-agent-self-upgrade.svg", title: "允许用户「自助更新版本」", navTitle: "自助更新版本", description: "开启后，员工可在 Agent 详细配置中点击「一键更新」自助更新到管理员设置的版本", rules: selfUpgradeRules, onRulesChange: handleSelfUpgradeRulesChange },
    { key: "panel", icon: "/assets/admin-platform-policy/allow-agent-panel.svg", title: "允许用户「访问 Agent 面板」", navTitle: "访问 Agent 面板", description: "开启后，系统会为企业分配一个随机端口并自动添加一条安全组规则放通该端口", rules: panelRules, onRulesChange: handlePanelRulesChange },
    { key: "chatView", icon: "/assets/admin-platform-policy/allow-chat-view.svg", title: "允许用户「使用对话视图」", navTitle: "使用对话视图", description: "开启后，用户可在「我的 Agent」中使用对话视图，通过浏览器与 AI 对话", rules: chatViewRules, onRulesChange: setChatViewRules },
    { key: "cloudBrowser", icon: "/assets/admin-platform-policy/allow-cloud-browser.svg", title: "允许用户「访问云端浏览器」", navTitle: "访问云端浏览器", description: "开启后，用户可在对话视图里访问云端浏览器，查看 AI 浏览器执行过程并进入操作", rules: cloudBrowserRules, onRulesChange: handleCloudBrowserRulesChange },
    { key: "lobsterDoctor", icon: "/assets/admin-platform-policy/allow-lobster-doctor.svg", title: "允许用户「使用龙虾医生」", navTitle: "使用龙虾医生", description: "开启后，所有用户在用户端可免费使用「龙虾医生」AI 诊断功能", rules: lobsterDoctorRules, onRulesChange: handleLobsterDoctorRulesChange },
    { key: "modelQuota", icon: "/assets/admin-platform-policy/allow-model-quota.svg", title: "允许用户「查看模型额度」", navTitle: "查看模型额度", description: "开启后，用户可在顶部导航栏看到「模型额度」入口，查看个人的 Token 使用情况", rules: modelQuotaRules, onRulesChange: setModelQuotaRules },
  ];

  // ── 方案4：滚动监听 — 内容区滚动时自动同步右侧锚点导航高亮 ──
  // 程序化滚动锁：点击锚点触发 smooth scroll 期间，暂停 observer 自动更新（避免闪烁）
  const programmaticScrollUntilRef = useRef<number>(0);
  useEffect(() => {
    if (activeTab !== "plan4") return;
    const container = document.querySelector('[data-slot="admin-sidebar-inset"]') as HTMLElement | null;
    if (!container) return;

    const anchorKeys: string[] = [...quotaCards.map(c => c.key), ...toggleCards.map(c => c.key)];
    const observed: HTMLElement[] = [];
    anchorKeys.forEach(key => {
      const el = document.getElementById(`plan4-${key}`);
      if (el) observed.push(el);
    });
    if (observed.length === 0) return;

    // 激活线：距 root 顶部 10vh，底部 60vh — 形成顶部细带，命中其中的卡片即为当前锚点
    const topOffset = Math.round(window.innerHeight * 0.1);
    const bottomOffset = Math.round(window.innerHeight * 0.6);
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < programmaticScrollUntilRef.current) return;
        const visible = entries
          .filter(e => e.isIntersecting)
          .map(e => ({ key: (e.target as HTMLElement).id.replace(/^plan4-/, ""), top: e.boundingClientRect.top }))
          .sort((a, b) => a.top - b.top);
        if (visible.length > 0) {
          setActiveAnchor(visible[0].key);
        }
      },
      {
        root: container,
        rootMargin: `-${topOffset}px 0px -${bottomOffset}px 0px`,
        threshold: 0,
      }
    );
    observed.forEach(el => observer.observe(el));

    // 滚动到底部 / 接近底部时强制锚定最后一项
    // 因为 observer 激活带在视口顶部 10vh 处，靠近底部时最后一张卡片可能永远进不到激活带
    const lastKey = toggleCards.length > 0 ? toggleCards[toggleCards.length - 1].key : (quotaCards.length > 0 ? quotaCards[quotaCards.length - 1].key : null);
    const onScroll = () => {
      if (Date.now() < programmaticScrollUntilRef.current) return;
      if (!lastKey) return;

      // 判定"已抵达底部区域"：满足以下任一条件
      // 1) 容器自身已滚到底（容忍 8px）
      const containerReachedBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 8;
      // 2) 最后一张卡片的底部已进入视口下半部分（兜底，应对容器没有真正滚到底的情况）
      const lastEl = document.getElementById(`plan4-${lastKey}`);
      let lastVisibleEnough = false;
      if (lastEl) {
        const rect = lastEl.getBoundingClientRect();
        // 卡片底部在视口内（rect.bottom <= viewport height）即视为最后一项已完整可见
        lastVisibleEnough = rect.bottom <= window.innerHeight + 8;
      }
      if (containerReachedBottom || lastVisibleEnough) {
        setActiveAnchor(lastKey);
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    // 初始触发一次（页面打开时若已在底部）
    onScroll();

    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", onScroll);
    };
  }, [activeTab, quotaCards.length, toggleCards.length]);

  // ── 方案2：固定高度摘要卡片 ──
  const FixedHeightQuotaCard = ({ card }: { card: typeof quotaCards[number] }) => {
    const fallback = card.rules.find((r) => r.groupIds.length === 0);
    const groupRules = card.rules.filter((r) => r.groupIds.length > 0);
    const groupRulesCount = groupRules.length;
    const displayValue = (v: TokenLimit) => {
      if (v === "unlimited" || v === -1) return "无限制";
      return card.type === "integer" ? `${Number(v).toLocaleString()} 个` : Number(v).toLocaleString();
    };
    const handleCardClick = () => {
      setSheetEditingCard({ type: "quota", title: card.title, cardKey: card.key });
      setPlan2IsEditing(activeTab === "plan22");
      setSheetOpen(true);
    };
    const popoverContent = (
      <div className="border border-[#E5E5E5] rounded">
        <Table density="compact" autoFixedColumns={false}>
          <colgroup><col style={{ width: 70 }} /><col /><col style={{ width: 80 }} /></colgroup>
          <TableBody>
            <TableRow className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">预设策略</TableCell><TableCell className="text-[12px]"><span className="inline-block bg-[#F5F5F5] text-[#262626] text-[11px] px-1.5 py-0.5 rounded">全部用户</span></TableCell><TableCell className="text-[12px] text-right">{fallback ? displayValue(fallback.value) : "-"}</TableCell></TableRow>
            {groupRules.filter(r => r.groupIds.length > 0).map((r, idx) => (
              <TableRow key={r.id} className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">分组策略{idx + 1}</TableCell><TableCell className="text-[12px] whitespace-normal"><div className="flex flex-wrap gap-1">{r.groupIds.map(id => <span key={id} className="inline-block bg-[#F5F5F5] text-[#262626] text-[11px] px-1.5 py-0.5 rounded">{getGroupPath(id, ALL_GROUPS)}</span>)}</div></TableCell><TableCell className="text-[12px] text-right">{displayValue(r.value)}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
    return (
      <CardHoverPopover popoverContent={popoverContent}>
        <Card className="overflow-hidden h-[180px] py-0 gap-0 flex flex-col cursor-pointer hover:border-[#1447E6] transition-colors" onClick={handleCardClick}>
          <div className="px-5 pt-5 pb-4 flex-1 min-h-0 flex flex-col">
            <div className="flex items-start gap-3">
              <img src={card.icon} className={`shrink-0 ${card.iconClass}`} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-semibold text-[#020617] truncate">{card.title}</h3>
                <p className="text-[12px] text-[#737373] leading-relaxed mt-1 line-clamp-2">{card.description}</p>
              </div>
            </div>
            {/* 策略摘要 - 灰色底卡片 */}
            <div className="mt-6 rounded-[4px] bg-[#FAFAFA] px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[12px]">
                <span className="text-[#737373]">预设策略：<span className="text-[#020617] font-medium">{fallback ? displayValue(fallback.value) : "-"}</span>{card.key === "global" && <span className="text-[#737373]">/{globalTokenTimeDim === "daily" ? "每日" : "每月"}</span>}</span>
                <span className="text-[#737373]">分组策略：<span className="text-[#020617] font-medium">{groupRulesCount} 条</span></span>
              </div>
              <span className="text-[12px] text-[#1447E6] inline-flex items-center gap-0.5">
                配置详情<ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </CardHoverPopover>
    );
  };

  const FixedHeightToggleCard = ({ card }: { card: typeof toggleCards[number] }) => {
    const fallback = card.rules.find((r) => r.groupIds.length === 0);
    const groupRules = card.rules.filter((r) => r.groupIds.length > 0);
    const groupRulesCount = groupRules.length;
    const handleCardClick = () => {
      setSheetEditingCard({ type: "toggle", title: card.title, cardKey: card.key });
      setPlan2IsEditing(activeTab === "plan22");
      setSheetOpen(true);
    };
    const popoverContent = (
      <div className="border border-[#E5E5E5] rounded">
        <Table density="compact" autoFixedColumns={false}>
          <colgroup><col style={{ width: 70 }} /><col /><col style={{ width: 70 }} /></colgroup>
          <TableBody>
            <TableRow className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">预设策略</TableCell><TableCell className="text-[12px]"><span className="inline-block bg-[#F5F5F5] text-[#262626] text-[11px] px-1.5 py-0.5 rounded">全部用户</span></TableCell><TableCell className="text-[12px] text-right"><StatusTag mode="fill" variant={fallback?.value ? "green" : "gray"}>{fallback?.value ? "开启" : "关闭"}</StatusTag></TableCell></TableRow>
            {groupRules.filter(r => r.groupIds.length > 0).map((r, idx) => (
              <TableRow key={r.id} className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">分组策略{idx + 1}</TableCell><TableCell className="text-[12px] whitespace-normal"><div className="flex flex-wrap gap-1">{r.groupIds.map(id => <span key={id} className="inline-block bg-[#F5F5F5] text-[#262626] text-[11px] px-1.5 py-0.5 rounded">{getGroupPath(id, ALL_GROUPS)}</span>)}</div></TableCell><TableCell className="text-[12px] text-right"><StatusTag mode="fill" variant={r.value ? "green" : "gray"}>{r.value ? "开启" : "关闭"}</StatusTag></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
    return (
      <CardHoverPopover popoverContent={popoverContent}>
        <Card className="overflow-hidden h-[180px] py-0 gap-0 flex flex-col cursor-pointer hover:border-[#1447E6] transition-colors" onClick={handleCardClick}>
          <div className="px-5 pt-5 pb-4 flex-1 min-h-0 flex flex-col">
            <div className="flex items-start gap-3">
              <img src={card.icon} className="shrink-0 w-10" />
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-semibold text-[#020617] truncate">{card.title}</h3>
                <p className="text-[12px] text-[#737373] leading-relaxed mt-1 line-clamp-2">{card.description}</p>
              </div>
            </div>
            {/* 策略摘要 - 灰色底卡片 */}
            <div className="mt-6 rounded-[4px] bg-[#FAFAFA] px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[12px]">
                <span className="text-[#737373] inline-flex items-center gap-1">预设策略：<StatusTag mode="fill" variant={fallback?.value ? "green" : "gray"}>{fallback?.value ? "开启" : "关闭"}</StatusTag></span>
                <span className="text-[#737373]">分组策略：<span className="text-[#020617] font-medium">{groupRulesCount} 条</span></span>
              </div>
              <span className="text-[12px] text-[#1447E6] inline-flex items-center gap-0.5">
                配置详情<ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </CardHoverPopover>
    );
  };

  // ── 方案3：三列卡片（复用方案2样式），点击编辑进入二级页 ──
  const Plan3QuotaCard = ({ card }: { card: typeof quotaCards[number] }) => {
    const fallback = card.rules.find((r) => r.groupIds.length === 0);
    const groupRules = card.rules.filter((r) => r.groupIds.length > 0);
    const groupRulesCount = groupRules.length;
    const displayValue = (v: TokenLimit) => {
      if (v === "unlimited" || v === -1) return "无限制";
      return card.type === "integer" ? `${Number(v).toLocaleString()} 个` : Number(v).toLocaleString();
    };
    const popoverContent = (
      <Table density="compact" autoFixedColumns={false}>
        <colgroup><col style={{ width: 70 }} /><col /><col style={{ width: 80 }} /></colgroup>
        <TableHeader>
          <TableRow><TableHead>策略类型</TableHead><TableHead>适用范围</TableHead><TableHead className="text-right">配额值</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">预设策略</TableCell><TableCell className="text-[12px]">全部用户</TableCell><TableCell className="text-[12px] text-right">{fallback ? displayValue(fallback.value) : "-"}</TableCell></TableRow>
          {groupRules.map((r) => (
            <TableRow key={r.id} className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">分组策略</TableCell><TableCell className="text-[12px] whitespace-normal">{r.groupIds.map(id => getGroupPath(id, ALL_GROUPS)).join("、")}</TableCell><TableCell className="text-[12px] text-right">{displayValue(r.value)}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    );
    return (
      <CardHoverPopover popoverContent={popoverContent}>
        <Card className="overflow-hidden h-[180px] py-0 gap-0 flex flex-col">
          <div className="px-4 pt-4 pb-3 flex-1 min-h-0">
            <div className="flex items-start gap-2.5">
              <img src={card.icon} className={`shrink-0 ${card.iconClass}`} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-semibold text-[#020617] truncate">{card.title}</h3>
                <p className="text-[11px] text-[#737373] leading-relaxed mt-1 line-clamp-2">{card.description}</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 flex items-center justify-between border-t border-[#f0f0f0] pt-2.5">
            <div className="flex items-center gap-3 text-[12px]">
              <span className="text-[#737373]">预设：<span className="text-[#020617] font-medium">{fallback ? displayValue(fallback.value) : "-"}</span></span>
              <span className="text-[#737373]">分组：<span className="text-[#020617] font-medium">{groupRulesCount} 条</span></span>
            </div>
            <Button variant="claw-outline" size="claw-sm" onClick={() => { setPlan3EditingKey(card.key); setPlan3IsEditing(false); }}>编辑</Button>
          </div>
        </Card>
      </CardHoverPopover>
    );
  };

  const Plan3ToggleCard = ({ card }: { card: typeof toggleCards[number] }) => {
    const fallback = card.rules.find((r) => r.groupIds.length === 0);
    const groupRules = card.rules.filter((r) => r.groupIds.length > 0);
    const groupRulesCount = groupRules.length;
    const popoverContent = (
      <Table density="compact" autoFixedColumns={false}>
        <colgroup><col style={{ width: 70 }} /><col /><col style={{ width: 70 }} /></colgroup>
        <TableHeader>
          <TableRow><TableHead>策略类型</TableHead><TableHead>适用范围</TableHead><TableHead className="text-right">权限</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">预设策略</TableCell><TableCell className="text-[12px]">全部用户</TableCell><TableCell className="text-[12px] text-right"><StatusTag mode="fill" variant={fallback?.value ? "green" : "gray"}>{fallback?.value ? "开启" : "关闭"}</StatusTag></TableCell></TableRow>
          {groupRules.map((r) => (
            <TableRow key={r.id} className="border-0 [&_td]:!align-top"><TableCell className="text-[12px]">分组策略</TableCell><TableCell className="text-[12px] whitespace-normal">{r.groupIds.map(id => getGroupPath(id, ALL_GROUPS)).join("、")}</TableCell><TableCell className="text-[12px] text-right"><StatusTag mode="fill" variant={r.value ? "green" : "gray"}>{r.value ? "开启" : "关闭"}</StatusTag></TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    );
    return (
      <CardHoverPopover popoverContent={popoverContent}>
        <Card className="overflow-hidden h-[180px] py-0 gap-0 flex flex-col">
          <div className="px-4 pt-4 pb-3 flex-1 min-h-0">
            <div className="flex items-start gap-2.5">
              <img src={card.icon} className="shrink-0 w-9" />
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-semibold text-[#020617] truncate">{card.title}</h3>
                <p className="text-[11px] text-[#737373] leading-relaxed mt-1 line-clamp-2">{card.description}</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 flex items-center justify-between border-t border-[#f0f0f0] pt-2.5">
            <div className="flex items-center gap-3 text-[12px]">
              <span className="text-[#737373] inline-flex items-center gap-1">预设：<StatusTag mode="fill" variant={fallback?.value ? "green" : "gray"}>{fallback?.value ? "开启" : "关闭"}</StatusTag></span>
              <span className="text-[#737373]">分组：<span className="text-[#020617] font-medium">{groupRulesCount} 条</span></span>
            </div>
            <Button variant="claw-outline" size="claw-sm" onClick={() => { setPlan3EditingKey(card.key); setPlan3IsEditing(false); }}>编辑</Button>
          </div>
        </Card>
      </CardHoverPopover>
    );
  };

  // 方案3 所有卡片合并列表（用于二级页导航）
  const allPlan3Cards = useMemo(() => [
    ...quotaCards.map(c => ({ ...c, cardType: "quota" as const })),
    ...toggleCards.map(c => ({ ...c, cardType: "toggle" as const })),
  ], [quotaCards, toggleCards]);

  // 方案3 二级页：渲染只读视图
  const renderPlan3ReadOnly = () => {
    if (!plan3EditingKey) return null;
    const quotaCard = quotaCards.find(c => c.key === plan3EditingKey);
    if (quotaCard) {
      const fallback = quotaCard.rules.find(r => r.groupIds.length === 0);
      const groupRules = quotaCard.rules.filter(r => r.groupIds.length > 0);
      const displayValue = (v: TokenLimit) => {
        if (v === "unlimited" || v === -1) return "无限制";
        return quotaCard.type === "integer" ? `${Number(v).toLocaleString()} 个` : Number(v).toLocaleString();
      };
      return (
        <div className="rounded-[4px] bg-white border border-[#E5E5E5]">
          <Table density="compact" autoFixedColumns={false}>
            <colgroup>
              <col style={{ width: 80 }} />
              <col />
              <col style={{ width: 140 }} />
              {plan3EditingKey === "global" && <col style={{ width: 100 }} />}
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>策略类型</TableHead>
                <TableHead>适用范围</TableHead>
                <TableHead>配额值</TableHead>
                {plan3EditingKey === "global" && <TableHead>时间维度</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fallback && (
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                  <TableCell><Badge variant="outline">{groupRules.length > 0 ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                  <TableCell className="text-[13px] text-[#020617] font-medium">{displayValue(fallback.value)}</TableCell>
                  {plan3EditingKey === "global" && <TableCell className="text-[13px] text-[#020617]">{globalTokenTimeDim === "daily" ? "每日" : "每月"}</TableCell>}
                </TableRow>
              )}
              {groupRules.map((rule, idx) => (
                <TableRow key={rule.id} className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                  <TableCell><GroupBadges groupIds={rule.groupIds} /></TableCell>
                  <TableCell className="text-[13px] text-[#020617] font-medium">{displayValue(rule.value)}</TableCell>
                  {plan3EditingKey === "global" && <TableCell className="text-[13px] text-[#020617]">{globalTokenTimeDim === "daily" ? "每日" : "每月"}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    const toggleCard = toggleCards.find(c => c.key === plan3EditingKey);
    if (toggleCard) {
      const fallback = toggleCard.rules.find(r => r.groupIds.length === 0);
      const groupRules = toggleCard.rules.filter(r => r.groupIds.length > 0);
      return (
        <div className="rounded-[4px] bg-white border border-[#E5E5E5]">
          <Table density="compact" autoFixedColumns={false}>
            <colgroup>
              <col style={{ width: 80 }} />
              <col />
              <col style={{ width: 120 }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>策略类型</TableHead>
                <TableHead>适用范围</TableHead>
                <TableHead>权限</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fallback && (
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                  <TableCell><Badge variant="outline">{groupRules.length > 0 ? <><span>全部用户</span><span className="ml-1 text-[#A3A3A3] font-normal">分组策略用户除外</span></> : "全部用户"}</Badge></TableCell>
                  <TableCell><StatusTag mode="fill" variant={fallback.value ? "green" : "gray"}>{fallback.value ? "开启" : "关闭"}</StatusTag></TableCell>
                </TableRow>
              )}
              {groupRules.map((rule, idx) => (
                <TableRow key={rule.id} className="hover:bg-transparent border-0">
                  <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                  <TableCell><GroupBadges groupIds={rule.groupIds} /></TableCell>
                  <TableCell><StatusTag mode="fill" variant={rule.value ? "green" : "gray"}>{rule.value ? "开启" : "关闭"}</StatusTag></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    return null;
  };

  // 方案3 二级页：渲染编辑态表格
  const renderPlan3Editor = () => {
    if (!plan3EditingKey) return null;
    const editorKey = `${plan3EditingKey}-${plan3ResetCount}`;
    const quotaCard = quotaCards.find(c => c.key === plan3EditingKey);
    if (quotaCard) {
      const timeDimension = plan3EditingKey === "global" ? {
        value: globalTokenTimeDim,
        onChange: (m: "daily" | "monthly") => { setGlobalTokenTimeDim(m); localStorage.setItem("admin_global_token_time_dim", m); },
      } : undefined;
      return (
        <SheetQuotaEditor
          key={editorKey}
          card={quotaCard}
          timeDimension={timeDimension}
          onDone={() => { setPlan3IsEditing(false); setPlan3ResetCount(c => c + 1); }}
          hideActions
          saveRef={plan3SaveRef}
        />
      );
    }
    const toggleCard = toggleCards.find(c => c.key === plan3EditingKey);
    if (toggleCard) {
      return (
        <SheetToggleEditor
          key={editorKey}
          card={toggleCard}
          cardKey={plan3EditingKey}
          onDone={() => { setPlan3IsEditing(false); setPlan3ResetCount(c => c + 1); }}
          hideActions
          saveRef={plan3SaveRef}
        />
      );
    }
    return null;
  };

  // ── 渲染弹窗编辑内容（方案2）──
  const renderSheetContent = () => {
    if (!sheetEditingCard) return null;
    const { type, cardKey } = sheetEditingCard;
    if (type === "quota") {
      const card = quotaCards.find((c) => c.key === cardKey);
      if (!card) return null;
      const timeDimension = cardKey === "global" ? {
        value: globalTokenTimeDim,
        onChange: (m: "daily" | "monthly") => { setGlobalTokenTimeDim(m); localStorage.setItem("admin_global_token_time_dim", m); },
      } : undefined;
      return (
        <div className="space-y-3">
          {/* 编辑提示 + 取消/保存按钮（plan22 隐藏，由弹窗 footer 提供保存按钮） */}
          {activeTab !== "plan22" && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#020617] font-medium">正在编辑</span>
              <div className="flex items-center gap-2">
                <Button variant="claw-outline" size="claw-sm" onClick={() => setPlan2IsEditing(false)}>取消</Button>
                <Button variant="dialog-confirm" size="claw-sm" onClick={() => plan2SaveRef.current?.()}>保存</Button>
              </div>
            </div>
          )}
          <SheetQuotaEditor
            card={card}
            timeDimension={timeDimension}
            onDone={() => setPlan2IsEditing(false)}
            hideActions
            saveRef={plan2SaveRef}
            addRef={plan2AddRef}
            onDisableChange={setPlan2DisableActions}
          />
        </div>
      );
    }
    if (type === "toggle") {
      const card = toggleCards.find((c) => c.key === cardKey);
      if (!card) return null;
      return (
        <div className="space-y-3">
          {/* 编辑提示 + 取消/保存按钮（plan22 隐藏） */}
          {activeTab !== "plan22" && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#020617] font-medium">正在编辑</span>
              <div className="flex items-center gap-2">
                <Button variant="claw-outline" size="claw-sm" onClick={() => setPlan2IsEditing(false)}>取消</Button>
                <Button variant="dialog-confirm" size="claw-sm" onClick={() => plan2SaveRef.current?.()}>保存</Button>
              </div>
            </div>
          )}
          <SheetToggleEditor
            card={card}
            cardKey={cardKey}
            onDone={() => setPlan2IsEditing(false)}
            hideActions
            saveRef={plan2SaveRef}
            addRef={plan2AddRef}
            onDisableChange={setPlan2DisableActions}
          />
        </div>
      );
    }
    return null;
  };

  // ── 渲染弹窗只读内容（方案2）──
  const renderPlan2ReadOnly = () => {
    if (!sheetEditingCard) return null;
    const { type, cardKey } = sheetEditingCard;

    const startRowEdit = (ruleId: string, currentValue: TokenLimit | boolean, currentGroupIds?: string[]) => {
      setPlan2EditingRowId(ruleId);
      if (typeof currentValue === "boolean") {
        setPlan2RowDraft({ mode: "custom", valStr: "", toggleVal: currentValue, groupIds: currentGroupIds ?? [] });
      } else if (currentValue === "unlimited") {
        setPlan2RowDraft({ mode: "unlimited", valStr: "", groupIds: currentGroupIds ?? [] });
      } else {
        setPlan2RowDraft({ mode: "custom", valStr: String(currentValue), groupIds: currentGroupIds ?? [] });
      }
    };

    const cancelRowEdit = () => setPlan2EditingRowId(null);

    if (type === "quota") {
      const card = quotaCards.find((c) => c.key === cardKey);
      if (!card) return null;
      const fallback = card.rules.find(r => r.groupIds.length === 0 && r.id.includes("fallback"));
      const groupRules = card.rules.filter(r => r !== fallback);
      const displayValue = (v: TokenLimit) => {
        if (v === "unlimited" || v === -1) return "无限制";
        return card.type === "integer" ? `${Number(v).toLocaleString()} 个` : Number(v).toLocaleString();
      };

      const saveRowEdit = (ruleId: string) => {
        let finalValue: TokenLimit;
        if (card.type === "token" && plan2RowDraft.mode === "unlimited") {
          finalValue = "unlimited";
        } else {
          const n = parseInt(plan2RowDraft.valStr, 10);
          if (isNaN(n) || n < 0) { toast.error("请输入有效数值"); return; }
          if (card.type === "integer" && n > 999) { toast.error("请输入 0-999 之间的整数"); return; }
          finalValue = n;
        }
        // 添加新行时同步保存 groupIds，编辑已有行时仅修改 value
        card.onRulesChange(card.rules.map(r => r.id === ruleId
          ? (plan2IsAddingRow
            ? { ...r, value: finalValue, groupIds: plan2RowDraft.groupIds ?? r.groupIds }
            : { ...r, value: finalValue })
          : r));
        setPlan2EditingRowId(null);
        setPlan2IsAddingRow(false);
        toast.success("已保存");
      };

      const renderRowValue = (rule: PolicyRule<TokenLimit>) => {
        if (plan2EditingRowId === rule.id) {
          return card.type === "integer" ? (
            <Input type="number" value={plan2RowDraft.valStr} onChange={(e) => setPlan2RowDraft(d => ({ ...d, valStr: e.target.value }))} className="h-8 w-28 text-xs bg-white" placeholder="0-999" />
          ) : (
            <TokenValueEditor mode={plan2RowDraft.mode} valStr={plan2RowDraft.valStr} onCommit={(m, v) => setPlan2RowDraft({ mode: m, valStr: v })} />
          );
        }
        return <span className="text-[13px] text-[#020617] font-medium">{displayValue(rule.value)}</span>;
      };

      const renderRowScope = (rule: PolicyRule<TokenLimit>, isFallback: boolean) => {
        if (isFallback) {
          return <span className="text-[13px] text-[#020617]">{groupRules.length > 0 ? "全部用户(分组策略用户除外)" : "全部用户"}</span>;
        }
        // 仅在添加新行时允许编辑适用范围
        if (plan2EditingRowId === rule.id && plan2IsAddingRow) {
          const disabledIds = groupRules.filter(r => r.id !== rule.id && r.groupIds.length > 0).flatMap(r => r.groupIds);
          return <GroupTagSelector selectedIds={plan2RowDraft.groupIds ?? []} disabledIds={disabledIds} onChange={(ids) => setPlan2RowDraft(d => ({ ...d, groupIds: ids }))} />;
        }
        return rule.groupIds.length > 0 ? <GroupBadges groupIds={rule.groupIds} /> : <span className="text-[13px] text-[#A3A3A3]">请选择分组</span>;
      };

      const renderRowActions = (rule: PolicyRule<TokenLimit>, isFallback: boolean) => {
        if (plan2EditingRowId === rule.id) {
          const noGroup = plan2IsAddingRow && (!plan2RowDraft.groupIds || plan2RowDraft.groupIds.length === 0);
          const noValue = plan2RowDraft.mode === "custom" && plan2RowDraft.valStr.trim() === "";
          const disableSave = noValue || noGroup;
          return (
            <div className="flex items-center gap-2">
              <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={() => {
                // 取消时如果是新增行则一并删除
                if (plan2IsAddingRow) {
                  card.onRulesChange(card.rules.filter(r => r.id !== rule.id));
                }
                setPlan2EditingRowId(null);
                setPlan2IsAddingRow(false);
              }}>取消</Button>
              <Button variant="link" size="sm" className={`h-auto px-0 text-[12px] ${disableSave ? "text-[#A3A3A3] pointer-events-none" : "text-[#1447E6]"}`} disabled={disableSave} onClick={() => saveRowEdit(rule.id)}>保存</Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={() => startRowEdit(rule.id, rule.value, rule.groupIds)}>编辑</Button>
            {!isFallback && <Button variant="link" size="sm" className="h-auto px-0 text-[12px] text-red-500" onClick={() => { card.onRulesChange(card.rules.filter(r => r.id !== rule.id)); toast.success("已删除"); }}>删除</Button>}
          </div>
        );
      };

      const isInlineEdit = activeTab === "plan21";
      return (
        <div className="space-y-3">
          {/* 汇总 + 编辑按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[13px]">
              <span className="text-[#737373]">预设策略：<span className="text-[#020617] font-medium">{fallback ? displayValue(fallback.value) : "-"}</span>{cardKey === "global" && <span className="text-[#737373]">/{globalTokenTimeDim === "daily" ? "每日" : "每月"}</span>}</span>
              <span className="text-[#737373]">分组策略：<span className="text-[#020617] font-medium">{groupRules.filter(r => r.groupIds.length > 0).length} 个</span></span>
            </div>
            {!isInlineEdit && (
              <Button variant="claw-outline" size="claw-sm" onClick={() => setPlan2IsEditing(true)}>编辑</Button>
            )}
          </div>
          <div className="rounded-[4px] bg-white border border-[#E5E5E5]">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup><col style={{ width: 80 }} /><col /><col style={{ width: 160 }} />{cardKey === "global" && <col style={{ width: 100 }} />}{isInlineEdit && <col style={{ width: 100 }} />}</colgroup>
              <TableHeader>
                <TableRow><TableHead>策略类型</TableHead><TableHead>适用范围</TableHead><TableHead>配额值</TableHead>{cardKey === "global" && (
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      时间维度
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default"><Info className="w-3.5 h-3.5 text-gray-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[320px] leading-relaxed">
                          达到上限后暂停服务，{globalTokenTimeDim === "daily" ? "每天 0 点重置" : "每月 1 号 0 点重置"}
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </TableHead>
                )}{isInlineEdit && <TableHead>操作</TableHead>}</TableRow>
              </TableHeader>
              <TableBody>
                {fallback && (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                    <TableCell>{isInlineEdit ? renderRowScope(fallback, true) : <span className="text-[13px] text-[#020617]">{groupRules.length > 0 ? "全部用户(分组策略用户除外)" : "全部用户"}</span>}</TableCell>
                    <TableCell>{isInlineEdit ? renderRowValue(fallback) : <span className="text-[13px] text-[#020617] font-medium">{displayValue(fallback.value)}</span>}</TableCell>
                    {cardKey === "global" && <TableCell className="text-[13px] text-[#020617]">{globalTokenTimeDim === "daily" ? "每日" : "每月"}</TableCell>}
                    {isInlineEdit && <TableCell>{renderRowActions(fallback, true)}</TableCell>}
                  </TableRow>
                )}
                {groupRules.filter(r => r.groupIds.length > 0 || plan2EditingRowId === r.id).map((rule, idx) => (
                  <TableRow key={rule.id} className="hover:bg-transparent border-0">
                    <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                    <TableCell>{isInlineEdit ? renderRowScope(rule, false) : <GroupBadges groupIds={rule.groupIds} />}</TableCell>
                    <TableCell>{isInlineEdit ? renderRowValue(rule) : <span className="text-[13px] text-[#020617] font-medium">{displayValue(rule.value)}</span>}</TableCell>
                    {cardKey === "global" && <TableCell className="text-[13px] text-[#020617]">{globalTokenTimeDim === "daily" ? "每日" : "每月"}</TableCell>}
                    {isInlineEdit && <TableCell>{renderRowActions(rule, false)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* plan21 下表格底部添加分组策略按钮 */}
            {isInlineEdit && (
              <button
                type="button"
                onClick={() => {
                  const blank: PolicyRule<TokenLimit> = { id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, groupIds: [], value: card.type === "integer" ? 3 : 100000 };
                  card.onRulesChange([...card.rules.filter(r => r.id !== fallback?.id), blank, ...(fallback ? [fallback] : [])]);
                  setPlan2IsAddingRow(true);
                  startRowEdit(blank.id, blank.value, []);
                }}
                disabled={plan2EditingRowId !== null}
                className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[13px] text-[#020617] bg-white border-t border-dashed border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />添加分组策略
              </button>
            )}
          </div>
        </div>
      );
    }

    if (type === "toggle") {
      const card = toggleCards.find((c) => c.key === cardKey);
      if (!card) return null;
      const fallback = card.rules.find(r => r.groupIds.length === 0 && r.id.includes("fallback"));
      const allGroupRules = card.rules.filter(r => r !== fallback);

      const isInlineEdit = activeTab === "plan21";
      const toggleGroupValue = !(fallback?.value); // 分组策略权限与预设相反
      const startToggleRowEdit = (rule: PolicyRule<boolean>) => {
        setPlan2EditingRowId(rule.id);
        setPlan2RowDraft({ mode: "custom", valStr: "", toggleVal: rule.value, groupIds: rule.groupIds });
      };
      const renderToggleRowScope = (rule: PolicyRule<boolean>, isFallback: boolean) => {
        if (isFallback) return <span className="text-[13px] text-[#020617]">{allGroupRules.filter(r => r.groupIds.length > 0).length > 0 ? "全部用户(分组策略用户除外)" : "全部用户"}</span>;
        // 仅在添加新行时允许编辑适用范围
        if (plan2EditingRowId === rule.id && plan2IsAddingRow) {
          const disabledIds = allGroupRules.filter(r => r.id !== rule.id && r.groupIds.length > 0).flatMap(r => r.groupIds);
          return <GroupTagSelector selectedIds={plan2RowDraft.groupIds ?? []} disabledIds={disabledIds} onChange={(ids) => setPlan2RowDraft(d => ({ ...d, groupIds: ids }))} />;
        }
        return rule.groupIds.length > 0 ? <GroupBadges groupIds={rule.groupIds} /> : <span className="text-[13px] text-[#A3A3A3]">请选择分组</span>;
      };
      const renderToggleRowValue = (rule: PolicyRule<boolean>, isFallback: boolean) => {
        if (isFallback && plan2EditingRowId === rule.id) {
          return (
            <Select value={plan2RowDraft.toggleVal ? "on" : "off"} onValueChange={(v) => setPlan2RowDraft(d => ({ ...d, toggleVal: v === "on" }))}>
              <SelectTrigger className="h-9 w-[120px] text-sm bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on"><StatusTag mode="fill" variant="green">开启</StatusTag></SelectItem>
                <SelectItem value="off"><StatusTag mode="fill" variant="gray">关闭</StatusTag></SelectItem>
              </SelectContent>
            </Select>
          );
        }
        const v = isFallback ? rule.value : toggleGroupValue;
        return <StatusTag mode="fill" variant={v ? "green" : "gray"}>{v ? "开启" : "关闭"}</StatusTag>;
      };
      const renderToggleRowActions = (rule: PolicyRule<boolean>, isFallback: boolean) => {
        if (plan2EditingRowId === rule.id) {
          const noGroup = plan2IsAddingRow && !isFallback && (!plan2RowDraft.groupIds || plan2RowDraft.groupIds.length === 0);
          return (
            <div className="flex items-center gap-2">
              <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={() => {
                if (plan2IsAddingRow) {
                  card.onRulesChange(card.rules.filter(r => r.id !== rule.id) as PolicyRule<boolean>[]);
                }
                setPlan2EditingRowId(null);
                setPlan2IsAddingRow(false);
              }}>取消</Button>
              <Button variant="link" size="sm" className={`h-auto px-0 text-[12px] ${noGroup ? "text-[#A3A3A3] pointer-events-none" : "text-[#1447E6]"}`} disabled={noGroup} onClick={() => {
                if (isFallback) {
                  // 仅修改预设值（同时联动分组策略行的相反值）
                  card.onRulesChange(card.rules.map(r => r.id === rule.id ? { ...r, value: !!plan2RowDraft.toggleVal } : { ...r, value: !plan2RowDraft.toggleVal }));
                } else if (plan2IsAddingRow) {
                  // 添加新行时保存 groupIds
                  card.onRulesChange(card.rules.map(r => r.id === rule.id ? { ...r, groupIds: plan2RowDraft.groupIds!, value: toggleGroupValue } : r));
                }
                setPlan2EditingRowId(null);
                setPlan2IsAddingRow(false);
                toast.success("已保存");
              }}>保存</Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={() => startToggleRowEdit(rule)}>编辑</Button>
            {!isFallback && <Button variant="link" size="sm" className="h-auto px-0 text-[12px] text-red-500" onClick={() => { card.onRulesChange(card.rules.filter(r => r.id !== rule.id) as PolicyRule<boolean>[]); toast.success("已删除"); }}>删除</Button>}
          </div>
        );
      };

      return (
        <div className="space-y-3">
          {/* 特殊卡片附加信息 */}
          {cardKey === "panel" && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[13px]">
                <span className="text-[#737373]">访问方式：</span>
                <span className="text-[#020617] font-medium">{panelAccessMode === "private" ? "私网访问" : "公网访问"}</span>
              </div>
              {panelPort && (
                <Alert variant="info" className="w-full">
                  <AlertInfoIcon />
                  <AlertDescription className="text-xs">
                    {panelSgRuleId ? `已分配随机端口 ${panelPort} 并自动添加安全组放通规则` : `已分配随机端口 ${panelPort}`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          {cardKey === "cloudBrowser" && isCloudBrowserEnabled(cloudBrowserRules) && cloudBrowserSgRuleId && (
            <Alert variant="info" className="w-full">
              <AlertInfoIcon />
              <AlertDescription className="text-xs">已为安全组添加 6080 端口放通规则</AlertDescription>
            </Alert>
          )}
          {/* 汇总 + 编辑按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[13px]">
              <span className="text-[#737373] inline-flex items-center gap-1">预设策略：<StatusTag mode="fill" variant={fallback?.value ? "green" : "gray"}>{fallback?.value ? "开启" : "关闭"}</StatusTag></span>
              <span className="text-[#737373]">分组策略：<span className="text-[#020617] font-medium">{allGroupRules.filter(r => r.groupIds.length > 0).length} 个</span></span>
            </div>
            {!isInlineEdit && (
              <Button variant="claw-outline" size="claw-sm" onClick={() => setPlan2IsEditing(true)}>编辑</Button>
            )}
          </div>
          <div className="rounded-[4px] bg-white border border-[#E5E5E5]">
            <Table density="compact" autoFixedColumns={false}>
              <colgroup><col style={{ width: 80 }} /><col /><col style={{ width: 140 }} />{isInlineEdit && <col style={{ width: 100 }} />}</colgroup>
              <TableHeader>
                <TableRow><TableHead>策略类型</TableHead><TableHead>适用范围</TableHead><TableHead>权限</TableHead>{isInlineEdit && <TableHead>操作</TableHead>}</TableRow>
              </TableHeader>
              <TableBody>
                {fallback && (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell className="text-[13px] text-[#737373]">预设策略</TableCell>
                    <TableCell>{isInlineEdit ? renderToggleRowScope(fallback, true) : <span className="text-[13px] text-[#020617]">{allGroupRules.length > 0 ? "全部用户(分组策略用户除外)" : "全部用户"}</span>}</TableCell>
                    <TableCell>{isInlineEdit ? renderToggleRowValue(fallback, true) : <StatusTag mode="fill" variant={fallback.value ? "green" : "gray"}>{fallback.value ? "开启" : "关闭"}</StatusTag>}</TableCell>
                    {isInlineEdit && <TableCell>{renderToggleRowActions(fallback, true)}</TableCell>}
                  </TableRow>
                )}
                {allGroupRules.filter(r => r.groupIds.length > 0 || plan2EditingRowId === r.id).map((rule, idx) => (
                  <TableRow key={rule.id} className="hover:bg-transparent border-0">
                    <TableCell className="text-[13px] text-[#737373]">分组策略{idx + 1}</TableCell>
                    <TableCell>{isInlineEdit ? renderToggleRowScope(rule, false) : <GroupBadges groupIds={rule.groupIds} />}</TableCell>
                    <TableCell>{isInlineEdit ? renderToggleRowValue(rule, false) : <StatusTag mode="fill" variant={rule.value ? "green" : "gray"}>{rule.value ? "开启" : "关闭"}</StatusTag>}</TableCell>
                    {isInlineEdit && <TableCell>{renderToggleRowActions(rule, false)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* plan21 下表格底部添加分组策略按钮 */}
            {isInlineEdit && (
              <button
                type="button"
                onClick={() => {
                  const blank: PolicyRule<boolean> = { id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, groupIds: [], value: toggleGroupValue };
                  card.onRulesChange([...card.rules.filter(r => r.id !== fallback?.id), blank, ...(fallback ? [fallback] : [])]);
                  setPlan2IsAddingRow(true);
                  startToggleRowEdit(blank);
                }}
                disabled={plan2EditingRowId !== null}
                className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[13px] text-[#020617] bg-white border-t border-dashed border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />添加分组策略
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-enter space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">平台策略</h1>
        <p className="text-sm text-gray-500 mt-1">管理平台默认配额、全局限制和功能权限开关，支持按分组设置不同策略</p>
      </div>

      {/* 优先级说明信息条 */}
      <Alert variant="operation-info">
        <AlertOperationInfoIcon />
        <AlertDescription>
          <ul className="space-y-1 list-disc pl-4">
            <li>无需按分组设置策略时，直接使用<span className="font-medium">「预设策略」</span>，全部用户应用该策略。</li>
            <li>需要按分组设置策略时，添加<span className="font-medium">「分组策略」</span>，优先采用本分组策略；本分组无则采用最近的上级分组策略；均无则使用<span className="font-medium">「预设策略」</span>。</li>
            <li>若用户属于多个分组，用户将在用户端创建 Agent 时自行选择分组，该 Agent 即拥有所选分组对应的策略权限。</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* ════════════ 方案1：Tab 切换（配额设置 / 功能权限开关） ════════════ */}
      {activeTab === "plan1" && (
        <div className="space-y-6">
          <SegmentGroup>
            <SegmentOption active={plan1SubTab === "quota"} onClick={() => setPlan1SubTab("quota")}>配额设置</SegmentOption>
            <SegmentOption active={plan1SubTab === "permission"} onClick={() => setPlan1SubTab("permission")}>功能权限开关</SegmentOption>
          </SegmentGroup>

          {plan1SubTab === "quota" && (
            <div className="grid grid-cols-1 gap-4 max-w-[960px]">
              <QuotaPolicyCard
                icon={<img src="/assets/admin-platform-policy/user-agent-limit.svg" className="shrink-0 w-[42px]" />}
                iconBg=""
                title="单用户 Agent 数量上限"
                description="单用户最多可以创建的 Agent 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整"
                type="integer"
                rules={clawRules}
                onRulesChange={setClawRules}
              />
              <QuotaPolicyCard
                icon={<img src="/assets/admin-platform-policy/user-daily-token-limit.svg" className="shrink-0 w-10" />}
                iconBg=""
                title="单用户每日 Tokens 上限"
                description="单用户每日最多可消耗的 Tokens 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整"
                type="token"
                rules={tokenRules}
                onRulesChange={setTokenRules}
              />
              <QuotaPolicyCard
                icon={<img src="/assets/admin-platform-policy/global-token-limit.svg" className="shrink-0 w-10" />}
                iconBg=""
                title="全局 Tokens 上限"
                description="全局 Tokens 指所有企业用户使用所有模型所消耗的总 Tokens 数量，达到上限后将暂停服务"
                type="token"
                rules={globalTokenRules}
                onRulesChange={handleGlobalTokenRulesChange}
                timeDimension={{
                  value: globalTokenTimeDim,
                  onChange: (m) => { setGlobalTokenTimeDim(m); localStorage.setItem("admin_global_token_time_dim", m); },
                }}
              />
            </div>
          )}

          {plan1SubTab === "permission" && (
            <div className="grid grid-cols-1 gap-4 max-w-[960px]">
              <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-config-model.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户配置模型" description="开启后，用户可在 Agent 详细配置中自行选择和切换模型。关闭后，模型配置区域将锁定，用户无法调整（适用于管理员已统一预配置模型的场景）" rules={configModelRules} onRulesChange={setConfigModelRules} />
              <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-config-channel.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户配置通道" description="开启后，用户可在 Agent 详细配置中自行添加和管理通道。关闭后，通道配置区域将锁定，用户无法调整（适用于管理员已统一预配置通道的场景）" rules={configChannelRules} onRulesChange={setConfigChannelRules} />
              <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-custom-model.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户添加自定义模型" description="开启后，用户可在 Agent 中自行添加自定义模型，不在企业管控和 Tokens 覆盖范围内（注意需要先开启「允许用户配置模型」）" rules={customModelRules} onRulesChange={setCustomModelRules} />
              <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-agent-terminal.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户进入 Agent 终端" description="开启后，所有用户在用户端可看到「进入终端」选项，进入对应 Agent 云服务器的终端" rules={terminalRules} onRulesChange={setTerminalRules} />
              <TogglePolicyCard
                icon={<img src="/assets/admin-platform-policy/allow-agent-self-upgrade.svg" className="shrink-0 w-10" />}
                iconBg=""
                title="允许员工自助更新 Agent 版本"
                description="开启后，员工可在 Agent 详细配置中点击「一键更新」自助更新到管理员设置的版本。关闭后，所有更新动作只能由管理员推送或批量发起"
                rules={selfUpgradeRules}
                onRulesChange={handleSelfUpgradeRulesChange}
              />
              <TogglePolicyCard
                icon={<img src="/assets/admin-platform-policy/allow-agent-panel.svg" className="shrink-0 w-10" />}
                iconBg=""
                title="允许用户访问 Agent 面板"
                description="开启后，系统会为企业分配一个随机端口并自动添加一条安全组规则放通该端口，用户可通过该端口访问 Agent 面板"
                rules={panelRules}
                onRulesChange={handlePanelRulesChange}
                loadingRuleId={panelLoadingRuleId}
                accessModeRow={{
                  mode: panelAccessMode,
                  onModeChange: (m) => { setPanelAccessMode(m); localStorage.setItem("admin_panel_access_mode", m); },
                  tooltipContent: (
                    <>
                      <p className="mb-1.5 text-justify"><span className="font-medium">公网访问：</span>用户通过公网直接访问 Agent 面板（WebUI），连接云服务器公网 IP。适用于大多数场景，推荐选择。</p>
                      <p className="text-justify"><span className="font-medium">私网访问：</span>用户通过同一私有网络访问 Agent 面板（WebUI），连接云服务器内网 IP。使用前需先自行将企业内网与腾讯云私有网络（VPC）打通，并在「网络管理」中将云服务器绑定至该 VPC。配置完成后，企业用户可通过企业内网访问面板，但无法通过公网访问。</p>
                    </>
                  ),
                }}
                extraContent={
                  panelPort ? (
                    <Alert variant="info" className="w-full">
                      <AlertInfoIcon />
                      <AlertDescription>
                        {panelSgRuleId
                          ? `已为您分配随机端口 ${panelPort} 并自动为默认安全组添加该端口放通规则，`
                          : `已为您分配随机端口 ${panelPort}，`}
                        如用户端仍无法访问面板，请在网络管理的
                        <button onClick={() => navigate("/admin/security-group")} className="underline underline-offset-2 font-medium hover:text-blue-900 transition-colors mx-0.5">安全组规则</button>
                        处检查是否生效
                      </AlertDescription>
                    </Alert>
                  ) : undefined
                }
              />
              <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-chat-view.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户使用对话视图" description="开启后，用户可在「我的 Agent」中使用对话视图，通过浏览器与 AI 对话（建议提前配置默认模型，用户创建 Agent 后 AI 即可正常回复）" rules={chatViewRules} onRulesChange={setChatViewRules} />
              <TogglePolicyCard
                icon={<img src="/assets/admin-platform-policy/allow-cloud-browser.svg" className="shrink-0 w-10" />}
                iconBg=""
                title="允许用户访问 Agent 云端浏览器"
                description="开启后，用户可在「我的 Agent」对话视图里访问云端浏览器，查看 AI 浏览器执行过程并进入操作（注意需要先开启「允许用户使用对话视图」）"
                rules={cloudBrowserRules}
                onRulesChange={handleCloudBrowserRulesChange}
                extraContent={
                  isCloudBrowserEnabled(cloudBrowserRules) && cloudBrowserSgRuleId ? (
                    <div className="inline-flex items-start gap-2.5 bg-blue-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-blue-700 leading-relaxed">
                        已为您当前的安全组添加该功能所需的 6080 端口放通规则，如用户端仍无法访问，请在网络管理的
                        <button onClick={() => navigate("/admin/security-group")} className="underline underline-offset-2 font-medium hover:text-blue-900 transition-colors mx-0.5">安全组规则</button>
                        处检查是否生效
                      </span>
                    </div>
                  ) : undefined
                }
              />
              <TogglePolicyCard
                icon={<img src="/assets/admin-platform-policy/allow-lobster-doctor.svg" className="shrink-0 w-10" />}
                iconBg=""
                title="允许用户使用龙虾医生"
                description="开启后，所有用户在用户端可免费使用「龙虾医生」AI 诊断功能，自动检测并对话式修复 Agent 运行问题"
                rules={lobsterDoctorRules}
                onRulesChange={handleLobsterDoctorRulesChange}
                titleExtra={
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto px-0 text-[13px] shrink-0"
                    onClick={() => setShowLobsterDoctorDialog(true)}
                  >
                    使用说明（每次使用产生费用）
                  </Button>
                }
              />
              <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-model-quota.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户查看模型额度" description="开启后，用户可在顶部导航栏看到「模型额度」入口，查看个人的 Token 使用情况" rules={modelQuotaRules} onRulesChange={setModelQuotaRules} />
            </div>
          )}
        </div>
      )}

      {/* ════════════ 方案2 / 方案2-1 / 方案2-2：三列布局 + 固定高度卡片 + 弹窗（方案2-1 行内编辑、方案2-2 默认进入编辑态） ════════════ */}
      {(activeTab === "plan2" || activeTab === "plan21" || activeTab === "plan22") && (
        <div className="space-y-8">
          <section>
            <h2 className="text-[16px] font-semibold text-[#020617] mb-4">配额设置</h2>
            <div className="grid grid-cols-3 gap-4">
              {quotaCards.map((card) => (
                <FixedHeightQuotaCard key={card.key} card={card} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#020617] mb-4">功能权限开关</h2>
            <div className="grid grid-cols-3 gap-4">
              {toggleCards.map((card) => (
                <FixedHeightToggleCard key={card.key} card={card} />
              ))}
            </div>
          </section>

          {/* 方案2 编辑弹窗 */}
          <Dialog open={sheetOpen} onOpenChange={(v) => { setSheetOpen(v); if (!v) { setPlan2IsEditing(false); setPlan2EditingRowId(null); setPlan2IsAddingRow(false); } }}>
            <DialogContent className="sm:max-w-[960px]">
              <DialogHeader>
                <DialogTitle>{sheetEditingCard?.title ?? "策略详情"}</DialogTitle>
              </DialogHeader>
              <DialogBody className="overflow-y-auto max-h-[60vh]">
                {(plan2IsEditing && activeTab !== "plan21") ? renderSheetContent() : renderPlan2ReadOnly()}
              </DialogBody>
              {!plan2IsEditing && activeTab !== "plan21" && activeTab !== "plan22" && (
                <DialogFooter>
                  <Button variant="dialog-confirm" size="claw-sm" onClick={() => setSheetOpen(false)}>完成</Button>
                </DialogFooter>
              )}
              {plan2IsEditing && activeTab !== "plan21" && activeTab !== "plan22" && (
                <DialogFooter>
                  <Button variant="dialog-confirm" size="claw-sm" disabled>完成</Button>
                </DialogFooter>
              )}
              {activeTab === "plan22" && (
                <DialogFooter>
                  <Button variant="claw-outline" size="claw-sm" onClick={() => setSheetOpen(false)}>取消</Button>
                  <Button variant="dialog-confirm" size="claw-sm" onClick={() => { plan2SaveRef.current?.(); setSheetOpen(false); }}>保存</Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ════════════ 方案3：三列卡片 + 点击编辑进入二级页面 ════════════ */}
      {activeTab === "plan3" && !plan3EditingKey && (
        <div className="space-y-8">
          <section>
            <h2 className="text-[16px] font-semibold text-[#020617] mb-4">配额设置</h2>
            <div className="grid grid-cols-3 gap-4">
              {quotaCards.map((card) => (
                <Plan3QuotaCard key={card.key} card={card} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#020617] mb-4">功能权限开关</h2>
            <div className="grid grid-cols-3 gap-4">
              {toggleCards.map((card) => (
                <Plan3ToggleCard key={card.key} card={card} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 方案3 二级编辑页面 */}
      {activeTab === "plan3" && plan3EditingKey && (
        <div className="space-y-4">
          {/* 返回面包屑 */}
          <div className="flex items-center gap-2">
            <Button variant="link" size="sm" className="h-auto px-0 text-[13px] text-[#737373]" onClick={() => setPlan3EditingKey(null)}>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />返回策略列表
            </Button>
            <span className="text-[#d4d4d4]">/</span>
            <span className="text-[13px] text-[#020617] font-medium">
              {allPlan3Cards.find(c => c.key === plan3EditingKey)?.title ?? "编辑策略"}
            </span>
          </div>

          {/* 左导航 + 右编辑区：统一外框 */}
          <div className="flex min-h-[520px] border border-[#E5E5E5] rounded-[4px] bg-white overflow-hidden">
            {/* 左侧导航 */}
            <div className="w-[220px] shrink-0 border-r border-[#E5E5E5] overflow-y-auto">
              <div className="p-3 space-y-0.5">
                <div className="px-3 py-2 text-[11px] font-medium text-[#A3A3A3] uppercase tracking-wide">配额设置</div>
                {quotaCards.map((card) => (
                  <button
                    key={card.key}
                    onClick={() => { setPlan3EditingKey(card.key); setPlan3IsEditing(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-[13px] transition-colors ${plan3EditingKey === card.key ? "bg-[#f0f4ff] text-[#1447E6] font-medium" : "text-[#020617] hover:bg-[#f5f5f5]"}`}
                  >
                    {card.title}
                  </button>
                ))}
                <div className="px-3 py-2 text-[11px] font-medium text-[#A3A3A3] uppercase tracking-wide mt-3">功能权限开关</div>
                {toggleCards.map((card) => (
                  <button
                    key={card.key}
                    onClick={() => { setPlan3EditingKey(card.key); setPlan3IsEditing(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-[13px] transition-colors ${plan3EditingKey === card.key ? "bg-[#f0f4ff] text-[#1447E6] font-medium" : "text-[#020617] hover:bg-[#f5f5f5]"}`}
                  >
                    {card.title}
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧编辑区 */}
            <div className="flex-1 min-w-0 p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[15px] font-semibold text-[#020617]">
                  {allPlan3Cards.find(c => c.key === plan3EditingKey)?.title}
                </h3>
                {plan3IsEditing ? (
                  <div className="flex items-center gap-2">
                    <Button variant="claw-outline" size="claw-sm" onClick={() => { setPlan3IsEditing(false); setPlan3ResetCount(c => c + 1); }}>取消</Button>
                    <Button variant="dialog-confirm" size="claw-sm" onClick={() => plan3SaveRef.current?.()}>保存</Button>
                  </div>
                ) : (
                  <Button variant="claw-outline" size="claw-sm" onClick={() => setPlan3IsEditing(true)}>编辑</Button>
                )}
              </div>
              <p className="text-[12px] text-[#737373] leading-relaxed mb-4">
                {allPlan3Cards.find(c => c.key === plan3EditingKey)?.description}
              </p>
              {plan3IsEditing ? renderPlan3Editor() : renderPlan3ReadOnly()}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ 方案4：锚点导航 + 瀑布流单列卡片 ════════════ */}
      {activeTab === "plan4" && (
        <div className="flex gap-[36px]">
          {/* 左侧瀑布流卡片（页面整体滚动，左侧不再独立滚动） */}
          <div id="plan4-scroll-container" className="flex-1 min-w-0 space-y-8">
            <section id="plan4-section-quota">
              <h2 className="text-[16px] font-semibold text-[#020617] mb-4">配额设置</h2>
              <div className="space-y-4">
                <div id="plan4-claw" className={`rounded-lg transition-shadow ${highlightKey === "claw" ? "anchor-highlight" : ""}`}>
                  <QuotaPolicyCard
                    icon={<img src="/assets/admin-platform-policy/user-agent-limit.svg" className="shrink-0 w-[42px]" />}
                    iconBg=""
                    title="单用户 Agent 数量上限"
                    description="单用户最多可以创建的 Agent 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整"
                    type="integer"
                    rules={clawRules}
                    onRulesChange={setClawRules}
                  />
                </div>
                <div id="plan4-token" className={`rounded-lg transition-shadow ${highlightKey === "token" ? "anchor-highlight" : ""}`}>
                  <QuotaPolicyCard
                    icon={<img src="/assets/admin-platform-policy/user-daily-token-limit.svg" className="shrink-0 w-10" />}
                    iconBg=""
                    title="单用户每日 Tokens 上限"
                    description="单用户每日最多可消耗的 Tokens 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整"
                    type="token"
                    rules={tokenRules}
                    onRulesChange={setTokenRules}
                  />
                </div>
                <div id="plan4-global" className={`rounded-lg transition-shadow ${highlightKey === "global" ? "anchor-highlight" : ""}`}>
                  <QuotaPolicyCard
                    icon={<img src="/assets/admin-platform-policy/global-token-limit.svg" className="shrink-0 w-10" />}
                    iconBg=""
                    title="全局 Tokens 上限"
                    description="全局 Tokens 指所有企业用户使用所有模型所消耗的总 Tokens 数量，达到上限后将暂停服务"
                    type="token"
                    rules={globalTokenRules}
                    onRulesChange={handleGlobalTokenRulesChange}
                    timeDimension={{
                      value: globalTokenTimeDim,
                      onChange: (m) => { setGlobalTokenTimeDim(m); localStorage.setItem("admin_global_token_time_dim", m); },
                    }}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[16px] font-semibold text-[#020617] mb-4">功能权限开关</h2>
              <div className="space-y-4">
                <div id="plan4-configModel" className={`rounded-lg transition-shadow ${highlightKey === "configModel" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-config-model.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「配置模型」" description="开启后，用户可在 Agent 详细配置中自行选择和切换模型。关闭后，模型配置区域将锁定，用户无法调整（适用于管理员已统一预配置模型的场景）" rules={configModelRules} onRulesChange={setConfigModelRules} />
                </div>
                <div id="plan4-configChannel" className={`rounded-lg transition-shadow ${highlightKey === "configChannel" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-config-channel.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「配置通道」" description="开启后，用户可在 Agent 详细配置中自行添加和管理通道。关闭后，通道配置区域将锁定，用户无法调整（适用于管理员已统一预配置通道的场景）" rules={configChannelRules} onRulesChange={setConfigChannelRules} />
                </div>
                <div id="plan4-customModel" className={`rounded-lg transition-shadow ${highlightKey === "customModel" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-custom-model.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「添加自定义模型」" description="开启后，用户可在 Agent 中自行添加自定义模型，不在企业管控和 Tokens 覆盖范围内（注意需要先开启「配置模型」）" rules={customModelRules} onRulesChange={setCustomModelRules} />
                </div>
                <div id="plan4-terminal" className={`rounded-lg transition-shadow ${highlightKey === "terminal" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-agent-terminal.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「进入 Agent 终端」" description="开启后，所有用户在用户端可看到「进入终端」选项，进入对应 Agent 云服务器的终端" rules={terminalRules} onRulesChange={setTerminalRules} />
                </div>
                <div id="plan4-selfUpgrade" className={`rounded-lg transition-shadow ${highlightKey === "selfUpgrade" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-agent-self-upgrade.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「自助更新版本」" description="开启后，员工可在 Agent 详细配置中点击「一键更新」自助更新到管理员设置的版本。关闭后，所有更新动作只能由管理员推送或批量发起" rules={selfUpgradeRules} onRulesChange={handleSelfUpgradeRulesChange} />
                </div>
                <div id="plan4-panel" className={`rounded-lg transition-shadow ${highlightKey === "panel" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-agent-panel.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「访问 Agent 面板」" description="开启后，系统会为企业分配一个随机端口并自动添加一条安全组规则放通该端口，用户可通过该端口访问 Agent 面板" rules={panelRules} onRulesChange={handlePanelRulesChange} loadingRuleId={panelLoadingRuleId} accessModeRow={hasSecurityGroup ? { mode: panelAccessMode, onModeChange: (m) => { setPanelAccessMode(m); localStorage.setItem("admin_panel_access_mode", m); }, tooltipContent: "选择用户访问 Agent 面板的网络方式" } : undefined} disabledMessage={!hasSecurityGroup ? <>请先前往 <button onClick={() => navigate("/admin/security-group?tab=security")} className="text-[#1447E6] hover:underline">网络管理/安全组</button> 配置至少一个安全组，再开启该功能</> : undefined} />
                </div>
                <div id="plan4-chatView" className={`rounded-lg transition-shadow ${highlightKey === "chatView" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-chat-view.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「使用对话视图」" description="开启后，用户可在「我的 Agent」中使用对话视图，通过浏览器与 AI 对话（建议提前配置默认模型，用户创建 Agent 后 AI 即可正常回复）" rules={chatViewRules} onRulesChange={setChatViewRules} />
                </div>
                <div id="plan4-cloudBrowser" className={`rounded-lg transition-shadow ${highlightKey === "cloudBrowser" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-cloud-browser.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「访问云端浏览器」" description="开启后，用户可在对话视图里访问云端浏览器，查看 AI 浏览器执行过程并进入操作（注意需要先开启「对话视图」）" rules={cloudBrowserRules} onRulesChange={handleCloudBrowserRulesChange} disabledMessage={!hasSecurityGroup ? <>请先前往 <button onClick={() => navigate("/admin/security-group?tab=security")} className="text-[#1447E6] hover:underline">网络管理/安全组</button> 配置至少一个安全组，再开启该功能</> : undefined} />
                </div>
                <div id="plan4-lobsterDoctor" className={`rounded-lg transition-shadow ${highlightKey === "lobsterDoctor" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-lobster-doctor.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「使用龙虾医生」" description={<>开启后，所有用户在用户端可免费使用「龙虾医生」AI 诊断功能，自动检测并对话式修复 Agent 运行问题。<span className="text-[#020617] font-medium">龙虾医生每次诊断会产生费用消耗</span>，详见 <button onClick={(e) => { e.stopPropagation(); setShowLobsterDoctorDialog(true); }} className="text-[#1447E6] hover:underline">使用说明</button></>} rules={lobsterDoctorRules} onRulesChange={handleLobsterDoctorRulesChange} />
                </div>
                <div id="plan4-modelQuota" className={`rounded-lg transition-shadow ${highlightKey === "modelQuota" ? "anchor-highlight" : ""}`}>
                  <TogglePolicyCard icon={<img src="/assets/admin-platform-policy/allow-model-quota.svg" className="shrink-0 w-10" />} iconBg="" title="允许用户「查看模型额度」" description="开启后，用户可在顶部导航栏看到「模型额度」入口，查看个人的 Token 使用情况" rules={modelQuotaRules} onRulesChange={setModelQuotaRules} />
                </div>
              </div>
            </section>
            {/* 底部占位，确保最后的卡片也能滚动到顶部 */}
            <div className="h-[10vh] shrink-0" />
          </div>

          {/* 右侧锚点导航 - 滚动到顶部后吸顶 */}
          <div className="w-[16vw] shrink-0 self-start sticky top-[11vh] z-10">
            <div className="max-h-[calc(100vh-11vh-32px)] overflow-y-auto py-2">
              {/* 导航列表 */}
              <div>
                <p className="text-[11px] text-[#A3A3A3] pl-3 py-1.5 uppercase tracking-wide">配额设置</p>
                <div className="ml-3 relative before:absolute before:left-0 before:top-[8px] before:bottom-[8px] before:w-px before:bg-[#E5E5E5]">
                  {/* 滑动高亮指示条 */}
                  {(() => {
                    const idx = quotaCards.findIndex(c => c.key === activeAnchor);
                    if (idx < 0) return null;
                    const ITEM_H = 36; // py-2 (8+8) + text-[13px] line-height ~20 = 36
                    return (
                      <span
                        aria-hidden
                        className="absolute left-0 top-0 w-[2px] h-4 bg-[#020617] rounded-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateY(${idx * ITEM_H + (ITEM_H - 16) / 2}px)` }}
                      />
                    );
                  })()}
                  {quotaCards.map((card, idx) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => {
                        setActiveAnchor(card.key);
                        triggerHighlight(card.key);
                        const targetId = idx === 0 ? 'plan4-section-quota' : `plan4-${card.key}`;
                        const el = document.getElementById(targetId);
                        const container = document.querySelector('[data-slot="admin-sidebar-inset"]') as HTMLElement | null;
                        if (el && container) {
                          const targetTop = container.scrollTop + el.getBoundingClientRect().top - container.getBoundingClientRect().top - window.innerHeight * 0.1;
                          programmaticScrollUntilRef.current = Date.now() + 800;
                          container.scrollTo({ top: targetTop, behavior: 'smooth' });
                        }
                      }}
                      className={`group block w-full text-left pl-4 pr-4 py-2 text-[13px] whitespace-nowrap transition-colors relative ${activeAnchor === card.key ? "text-[#020617] font-medium" : "text-[#020617]"}`}
                    >
                      <span aria-hidden className="pointer-events-none absolute left-[5px] right-[3px] top-0 bottom-0 rounded-[4px] bg-transparent group-hover:bg-white/50 transition-colors" />
                      <span className="relative">{card.title}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#A3A3A3] pl-3 py-1.5 mt-3 uppercase tracking-wide">功能权限开关</p>
                <div className="ml-3 relative before:absolute before:left-0 before:top-[8px] before:bottom-[8px] before:w-px before:bg-[#E5E5E5]">
                  {/* 滑动高亮指示条 */}
                  {(() => {
                    const idx = toggleCards.findIndex(c => c.key === activeAnchor);
                    if (idx < 0) return null;
                    const ITEM_H = 36;
                    return (
                      <span
                        aria-hidden
                        className="absolute left-0 top-0 w-[2px] h-4 bg-[#020617] rounded-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateY(${idx * ITEM_H + (ITEM_H - 16) / 2}px)` }}
                      />
                    );
                  })()}
                  {toggleCards.map((card) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => {
                        setActiveAnchor(card.key);
                        triggerHighlight(card.key);
                        const el = document.getElementById(`plan4-${card.key}`);
                        const container = document.querySelector('[data-slot="admin-sidebar-inset"]') as HTMLElement | null;
                        if (el && container) {
                          const targetTop = container.scrollTop + el.getBoundingClientRect().top - container.getBoundingClientRect().top - window.innerHeight * 0.1;
                          programmaticScrollUntilRef.current = Date.now() + 800;
                          container.scrollTo({ top: targetTop, behavior: 'smooth' });
                        }
                      }}
                      className={`group block w-full text-left pl-4 pr-4 py-2 text-[13px] whitespace-nowrap transition-colors relative ${activeAnchor === card.key ? "text-[#020617] font-medium" : "text-[#020617]"}`}
                    >
                      <span aria-hidden className="pointer-events-none absolute left-[5px] right-[3px] top-0 bottom-0 rounded-[4px] bg-transparent group-hover:bg-white/50 transition-colors" />
                      <span className="relative">{card.navTitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 龙虾医生详情弹窗 */}
      <Dialog open={showLobsterDoctorDialog} onOpenChange={setShowLobsterDoctorDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>龙虾医生使用说明</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-5 text-[14px] text-[#334155] leading-relaxed">
            <Alert variant="info">
              <AlertInfoIcon />
              <AlertDescription>龙虾医生每次诊断会产生部分底层资源费用和 Token 消耗，请注意费用消耗</AlertDescription>
            </Alert>
            <div className="space-y-3">
              <p className="text-[14px] font-semibold text-[#020617]">费用消耗说明</p>
              <ol className="space-y-2 pl-5 list-decimal text-[14px] text-[#334155]">
                <li><span className="font-medium text-[#020617]">资源费用：</span>底层云资源费用可在 <a href="https://console.cloud.tencent.com/expense" target="_blank" rel="noopener noreferrer" className="text-[#1447E6] hover:underline">腾讯云费用中心</a> 查看</li>
                <li><span className="font-medium text-[#020617]">Token 消耗：</span>诊断消耗的 Token 计入对应用户的 Token 消耗，可在 <button onClick={() => { setShowLobsterDoctorDialog(false); navigate("/admin/tokens-monitor"); }} className="text-[#1447E6] hover:underline">Tokens 监控</button> 查看</li>
                <li><span className="font-medium text-[#020617]">诊断模型：</span>诊断所用模型将按照当前已启用的模型顺序使用，可前往 <button onClick={() => { setShowLobsterDoctorDialog(false); navigate("/admin/model-config"); }} className="text-[#1447E6] hover:underline">模型配置</button> 调整</li>
              </ol>
            </div>
            <div className="space-y-3">
              <p className="text-[14px] font-semibold text-[#020617]">工作原理</p>
              <p className="text-[14px] text-[#334155]">当用户点击「开始诊断」后，ClawPro 平台将完成以下步骤：</p>
              <ol className="space-y-2 pl-5 list-decimal text-[14px] text-[#334155]">
                <li>创建一个临时按量计费的龙虾医生 Agent 节点</li>
                <li>通过该节点对用户的目标 Agent 进行检测和修复</li>
                <li>诊断结束后，临时节点自动销毁，不留存任何数据</li>
              </ol>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="claw-outline"
              size="claw-sm"
              onClick={() => setShowLobsterDoctorDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              size="claw-sm"
              onClick={() => setShowLobsterDoctorDialog(false)}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
