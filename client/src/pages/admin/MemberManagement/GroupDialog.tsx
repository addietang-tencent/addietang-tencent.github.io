/**
 * 分组弹窗组件
 *   - 新建分组（GroupFormDialog）
 *   - 编辑分组（GroupFormDialog mode="edit"）
 *   - 添加子分组（GroupFormDialog mode="addChild"）
 *   - 删除分组确认（DeleteGroupDialog）
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserGroup } from "./types";
import {
  buildGroupTree,
  type GroupTreeNode,
  getResourcesOfGroup,
} from "./health";

// ─── 树形选择器（单选，用于选择上级分组） ────────────────────
function ParentTreeSelector({
  groups,
  value,
  onChange,
  disabled,
  excludeIds,
}: {
  groups: UserGroup[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  /** 排除的分组 id 集合（编辑时排除自身及子孙） */
  excludeIds?: Set<string>;
}) {
  const tree = useMemo(
    () => buildGroupTree(groups.filter((g) => g.source === "manual")),
    [groups]
  );

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 默认展开所有
    const s = new Set<string>();
    const walk = (nodes: GroupTreeNode[]) => {
      nodes.forEach((n) => {
        s.add(n.id);
        walk(n.children);
      });
    };
    walk(tree);
    return s;
  });

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node: GroupTreeNode): React.ReactNode => {
    if (excludeIds?.has(node.id)) return null;
    const isSelected = value === node.id;
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1.5 h-8 px-2 rounded-md cursor-pointer text-sm transition-colors ${
            isSelected
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          style={{ paddingLeft: 8 + node.depth * 16 }}
          onClick={() => {
            if (disabled) return;
            onChange(isSelected ? null : node.id);
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <FolderTree className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate flex-1">{node.name}</span>
          {isSelected && (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#007AFF" }} />
          )}
        </div>
        {hasChildren && isExpanded && node.children.map(renderNode)}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg max-h-[180px] overflow-y-auto p-1.5">
      {tree.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-3">
          暂无可选分组
        </div>
      ) : (
        <>
          {/* "无上级"选项 */}
          <div
            className={`flex items-center gap-1.5 h-8 px-2 rounded-md cursor-pointer text-sm transition-colors ${
              value === null
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => {
              if (!disabled) onChange(null);
            }}
          >
            <span className="w-4 h-4 shrink-0" />
            <span className="text-gray-400 text-xs">—</span>
            <span className="truncate flex-1">无上级（一级分组）</span>
            {value === null && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#007AFF" }} />
            )}
          </div>
          {tree.map(renderNode)}
        </>
      )}
    </div>
  );
}

// ─── 新建 / 编辑 / 添加子分组弹窗 ──────────────────────────
export interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: UserGroup[];
  /** "create" | "edit" | "addChild" */
  mode: "create" | "edit" | "addChild";
  /** 编辑/添加子分组时的参考分组 */
  target?: { id: string; name: string; parentId: string | null } | null;
  onConfirm: (name: string, parentId: string | null) => void;
}

export function GroupFormDialog({
  open,
  onOpenChange,
  groups,
  mode,
  target,
  onConfirm,
}: GroupFormDialogProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);

  // 初始化
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && target) {
      setName(target.name);
      setParentId(target.parentId);
    } else if (mode === "addChild" && target) {
      setName("");
      setParentId(target.id);
    } else {
      setName("");
      setParentId(null);
    }
  }, [open, mode, target]);

  // 编辑时排除自身及子孙（不能把自己设为自己或子孙的子节点）
  const excludeIds = useMemo(() => {
    if (mode !== "edit" || !target) return undefined;
    const s = new Set<string>();
    const tree = buildGroupTree(groups.filter((g) => g.source === "manual"));
    const walk = (nodes: GroupTreeNode[]) => {
      for (const n of nodes) {
        if (n.id === target.id) {
          // 排除自身及所有子孙
          const addAll = (node: GroupTreeNode) => {
            s.add(node.id);
            node.children.forEach(addAll);
          };
          addAll(n);
          return;
        }
        walk(n.children);
      }
    };
    walk(tree);
    return s;
  }, [mode, target, groups]);

  const isDuplicate = groups.some(
    (g) =>
      g.name.trim() === name.trim() &&
      g.source === "manual" &&
      (mode !== "edit" || g.id !== target?.id)
  );

  const isValid = name.trim().length > 0 && !isDuplicate;

  const title =
    mode === "create"
      ? "新建分组"
      : mode === "edit"
        ? "编辑分组"
        : "添加子分组";

  const confirmText =
    mode === "create" ? "确认创建" : mode === "edit" ? "保存" : "确认创建";

  // addChild 模式下，上级分组选中且锁定
  const parentLocked = mode === "addChild";

  // 锁定时显示上级名称
  const lockedParentName = parentLocked && target
    ? groups.find((g) => g.id === target.id)?.name ?? target.name
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* 分组名称 */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-1.5 block">
              分组名称
            </label>
            <input
              type="text"
              placeholder="请输入分组名称"
              className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-50 placeholder:text-gray-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {isDuplicate && name.trim() && (
              <p className="text-xs text-red-500 mt-1">分组名称已存在</p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              分组名称为唯一标识，不能与已有分组重名，创建后支持修改
            </p>
          </div>

          {/* 上级分组 */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-1.5 block">
              上级分组
              <span className="text-xs text-gray-400 font-normal ml-1">
                （选填，不选则为一级分组）
              </span>
            </label>
            {parentLocked && lockedParentName ? (
              <div className="h-9 flex items-center px-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
                <FolderTree className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                {lockedParentName}
              </div>
            ) : (
              <ParentTreeSelector
                groups={groups}
                value={parentId}
                onChange={setParentId}
                excludeIds={excludeIds}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            disabled={!isValid}
            onClick={() => {
              if (!isValid) return;
              onConfirm(name.trim(), parentId);
            }}
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            className="text-white"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 删除分组确认弹窗 ──────────────────────────────────────
export interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: { id: string; name: string } | null;
  memberCount: number;
  groups: UserGroup[];
  onConfirm: (groupId: string) => void;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
  memberCount,
  groups,
  onConfirm,
}: DeleteGroupDialogProps) {
  const [configRefreshing, setConfigRefreshing] = useState(false);

  // 获取关联的资源配置
  const relatedResources = useMemo(
    () => (group ? getResourcesOfGroup(group.id) : []),
    [group]
  );

  const hasRelatedConfigs = relatedResources.length > 0;

  // 按 kind 分组
  const configSummary = useMemo(() => {
    const map = new Map<string, number>();
    relatedResources.forEach((r) => {
      map.set(r.kind, (map.get(r.kind) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [relatedResources]);

  const kindLabel: Record<string, string> = {
    model: "可见模型",
    channel: "可见通道",
    securityGroup: "安全组",
    vpc: "VPC",
    memory: "记忆",
    image: "镜像",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>删除分组</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">分组名称</span>
            <span className="text-sm font-medium text-gray-900">
              {group?.name}
            </span>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">分组内用户数</span>
            <span className="text-sm font-semibold text-gray-800">
              {memberCount} 人
            </span>
          </div>

          {/* 已应用配置 */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">已应用配置</span>
              <button
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="刷新"
                onClick={() => {
                  setConfigRefreshing(true);
                  setTimeout(() => setConfigRefreshing(false), 1200);
                }}
              >
                {configRefreshing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {hasRelatedConfigs ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {configSummary.map(([kind, count]) => (
                  <span key={kind} className="badge-shutdown">
                    {kindLabel[kind] ?? kind}({count})
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-green-600">无关联配置</span>
            )}
          </div>

          {/* 状态提示 */}
          {hasRelatedConfigs ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 space-y-2">
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                以上配置的应用范围包含该分组，请先前往对应配置页面移除该分组后再执行删除。
              </p>
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                删除分组后，组内用户不会被删除，仅解除分组关联。
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-700">
              该分组无关联配置，可安全删除。删除后组内用户不会被删除，仅解除分组关联。
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          {!hasRelatedConfigs && (
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => group && onConfirm(group.id)}
            >
              确认删除
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
