/**
 * ScopePopover - 通用应用范围编辑组件（树形多选版）
 * 从 ModelConfig.tsx 中提取的公共组件，支持模型配置、通道配置等页面复用。
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { toast } from "sonner";
import { Pencil, Check, X, ChevronRight, ChevronDown, Minus } from "lucide-react";
import type { UserGroup } from "@/pages/admin/MemberManagement/types";
import { buildGroupTree, type GroupTreeNode } from "@/pages/admin/MemberManagement/health";

// ─── 分组路径工具函数 ─────────────────────────────────────
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

// ─── 树形多选节点的选中状态 ─────────────────────────────
type CheckState = "checked" | "unchecked" | "indeterminate";

function getCheckState(
  node: GroupTreeNode,
  selectedIds: Set<string>
): CheckState {
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

/** 获取子孙所有 id（含自身） */
function getDescendantIds(node: GroupTreeNode): string[] {
  const ids: string[] = [node.id];
  node.children.forEach((c) => ids.push(...getDescendantIds(c)));
  return ids;
}

// ─── 组件接口 ─────────────────────────────────────────────
export interface ScopePopoverProps {
  /** 当前应用范围 */
  visibilityScope: "all" | "groups";
  /** 当前选中的分组 id 列表 */
  visibilityGroupIds: string[];
  /** 所有可选分组 */
  groups: UserGroup[];
  /** 保存回调 */
  onSave: (scope: "all" | "groups", groupIds: string[]) => void;
  /** 是否显示"应用范围"文字标签，默认 true */
  showLabel?: boolean;
}

export function ScopePopover({
  visibilityScope,
  visibilityGroupIds,
  groups,
  onSave,
  showLabel = true,
}: ScopePopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<"all" | "groups">(visibilityScope);
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>(visibilityGroupIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 按展示分区分桶构建树（oneid-group + manual 合并为 "custom"）
  type DisplayBucket = "dept" | "custom";
  const groupsByBucket = useMemo(() => {
    const buckets: Record<DisplayBucket, UserGroup[]> = { dept: [], custom: [] };
    groups.forEach((g) => {
      if (g.source === "oneid-dept") buckets.dept.push(g);
      else buckets.custom.push(g);
    });
    return buckets;
  }, [groups]);

  const activeBuckets = useMemo(() => {
    const order: DisplayBucket[] = ["dept", "custom"];
    return order.filter((b) => groupsByBucket[b].length > 0);
  }, [groupsByBucket]);

  const BUCKET_LABELS: Record<DisplayBucket, string> = { dept: "部门", custom: "自定义分组" };

  // 每个分区的树
  const treesMap = useMemo(() => {
    const map: Record<string, GroupTreeNode[]> = {};
    activeBuckets.forEach((b) => { map[b] = buildGroupTree(groupsByBucket[b]); });
    return map;
  }, [activeBuckets, groupsByBucket]);

  // 是否有可展示的分组
  const hasGroups = activeBuckets.length > 0;

  // 每次打开时同步当前状态
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(visibilityScope);
      setDraftGroupIds([...visibilityGroupIds]);
      setSearchQuery("");
      // 默认展开所有已选分组的祖先
      const expandSet = new Set<string>();
      const groupMap = new Map(groups.map((g) => [g.id, g]));
      visibilityGroupIds.forEach((gid) => {
        let cur = groupMap.get(gid);
        while (cur && cur.parentId) {
          expandSet.add(cur.parentId);
          cur = groupMap.get(cur.parentId);
        }
      });
      // 也展开根节点
      activeBuckets.forEach((b) => {
        treesMap[b]?.forEach((root) => expandSet.add(root.id));
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

  // 树节点 check/uncheck 逻辑
  const toggleNode = (node: GroupTreeNode) => {
    const ids = new Set(draftGroupIds);
    const state = getCheckState(node, ids);
    const descendants = getDescendantIds(node);
    if (state === "checked") {
      descendants.forEach((d) => ids.delete(d));
    } else {
      descendants.forEach((d) => ids.add(d));
    }
    setDraftGroupIds(Array.from(ids));
  };

  const handleClearSelection = () => {
    setDraftGroupIds([]);
    setSearchQuery("");
  };

  // 确认按钮是否可点击
  const isConfirmDisabled = draftScope === "groups" && draftGroupIds.length === 0;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onSave(
      draftScope,
      draftScope === "all" ? [] : draftGroupIds,
    );
    setOpen(false);
    toast.success("应用范围已更新");
  };

  // 搜索过滤
  const matchedGroupIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return new Set(
      groups
        .filter((g) => g.name.toLowerCase().includes(q) || getGroupPath(g.id, groups).toLowerCase().includes(q))
        .map((g) => g.id)
    );
  }, [searchQuery, groups]);

  const isNodeVisible = (node: GroupTreeNode): boolean => {
    if (!matchedGroupIds) return true;
    if (matchedGroupIds.has(node.id)) return true;
    return node.children.some(isNodeVisible);
  };

  // 渲染一个树节点
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
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-[4px] hover:bg-gray-50 transition-colors text-left"
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {hasChildren ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
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

  // 已选分组标签（子孙全选时自动合并为父分组）
  const selectedTags = useMemo(() => {
    const selectedSet = new Set(draftGroupIds);
    const collectEffective = (nodes: GroupTreeNode[]): string[] => {
      const result: string[] = [];
      for (const node of nodes) {
        const state = getCheckState(node, selectedSet);
        if (state === "checked") {
          result.push(node.id);
        } else if (state === "indeterminate") {
          result.push(...collectEffective(node.children));
        }
      }
      return result;
    };
    const effectiveIds: string[] = [];
    activeBuckets.forEach((b) => { effectiveIds.push(...collectEffective(treesMap[b] || [])); });
    return effectiveIds.map((gid) => ({ id: gid, path: getGroupPath(gid, groups) }));
  }, [draftGroupIds, groups, activeBuckets, treesMap]);

  // 已保存的分组名称（用于徽章展示）
  const selectedGroupPaths = useMemo(() => {
    const selectedSet = new Set(visibilityGroupIds);
    const collectEffective = (nodes: GroupTreeNode[]): string[] => {
      const result: string[] = [];
      for (const node of nodes) {
        const state = getCheckState(node, selectedSet);
        if (state === "checked") {
          result.push(node.id);
        } else if (state === "indeterminate") {
          result.push(...collectEffective(node.children));
        }
      }
      return result;
    };
    const effectiveIds: string[] = [];
    activeBuckets.forEach((b) => { effectiveIds.push(...collectEffective(treesMap[b] || [])); });
    return effectiveIds.map((gid) => getGroupPath(gid, groups));
  }, [groups, visibilityGroupIds, activeBuckets, treesMap]);

  // 徽章
  const renderBadges = () => {
    if (visibilityScope === "all") {
      return (
        <StatusTag variant="gray">
          全部用户
        </StatusTag>
      );
    }

    if (selectedGroupPaths.length === 0) {
      return (
        <StatusTag variant="gray">
          全部用户
        </StatusTag>
      );
    }

    const firstName = selectedGroupPaths[0];
    const rest = selectedGroupPaths.length - 1;
    const tooltipText = selectedGroupPaths.join("\n");

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <span className="badge-shutdown max-w-[140px] truncate inline-block align-middle">
              {firstName}
            </span>
            {rest > 0 && (
              <span className="badge-shutdown whitespace-nowrap">
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
      {showLabel && <span className="text-xs text-gray-400">应用范围</span>}
      {renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="self-center text-gray-300 hover:text-blue-500 transition-colors"
            title="编辑应用范围"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 flex flex-col max-h-[420px]" align="start" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-0">
            {/* Segment 切换 */}
            <SegmentGroup className="w-full">
              <SegmentOption active={draftScope === "all"} onClick={() => setDraftScope("all")} className="flex-1">
                全部用户
              </SegmentOption>
              <SegmentOption active={draftScope === "groups"} onClick={() => setDraftScope("groups")} className="flex-1">
                按分组
              </SegmentOption>
            </SegmentGroup>

            {/* 分组列表（仅 groups 模式） */}
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
                    {/* 合并搜索框 + 已选标签 */}
                    <div
                      className="group relative flex flex-wrap items-center gap-1 px-2 py-1.5 border border-gray-200 rounded-[4px] bg-gray-50 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-colors max-h-[80px] overflow-y-auto"
                    >
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-[4px] border border-blue-100 shrink-0 max-w-[200px]"
                        >
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
                              const idsToRemove = targetNode ? new Set(getDescendantIds(targetNode)) : new Set([tag.id]);
                              setDraftGroupIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
                            }}
                            className="text-blue-400 hover:text-blue-600 shrink-0"
                          >
                            <X className="w-2.5 h-2.5" />
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
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 分组树形列表 */}
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

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-[#e5e5e5] shrink-0">
            <Button variant="claw-outline" className="h-7 text-xs px-3 gap-1" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              variant="claw-primary"
              className="h-7 text-xs px-3 gap-1"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
            >
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
