/**
 * 左侧分组列表（多层级树 + 搜索）
 *
 * 视觉规范（流动蓝图）：
 *   - 行高 32~36，每一层左缩进 16px
 *   - 右侧：人数（text-xs gray-400）
 *   - 活跃行：borderLeft: 2px solid #007AFF + bg-blue-50 text-blue-700
 *   - 按来源分桶：组织架构 / 用户组 / 自建分组，段头用一个极简小标题
 *   - 底部固定「未分组」项
 */
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Search,
  UserX,
  RefreshCw,
  Loader2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserGroup, UserOrg } from "./types";
import {
  buildGroupTree,
  getUsersOfGroupDeep,
  type GroupTreeNode,
} from "./health";

/** 特殊 id：未分组 */
export const UNASSIGNED_GROUP_ID = "__unassigned__";

interface GroupListProps {
  groups: UserGroup[];
  users: UserOrg[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** OneID 模式下，组织架构是否已同步 */
  deptSynced?: boolean;
  /** 点击「同步组织架构作为分组」 */
  onSyncDepts?: () => void;
  /** 同步中 */
  isSyncingDepts?: boolean;
  /** 是否 OneID 模式（显示组织架构+自定义分组两个桶） */
  hasOneid?: boolean;
  /** 是否普通模式（显示新建分组按钮 + 行操作） */
  isManualMode?: boolean;
  /** 新建分组 */
  onCreateGroup?: () => void;
  /** 添加子分组 */
  onAddChildGroup?: (parentId: string) => void;
  /** 编辑分组 */
  onEditGroup?: (groupId: string) => void;
  /** 删除分组 */
  onDeleteGroup?: (groupId: string) => void;
  /** 收起左侧面板 */
  onCollapse?: () => void;
  /** 异常分组 id 集合（红点标记：包含自身 + 子分组 + 父分组冒泡） */
  anomalousGroupIds?: Set<string>;
  /** 直接异常分组 id 集合（自身 + 子分组，不含父分组冒泡；用于 Tooltip 区分文案） */
  directAnomalousGroupIds?: Set<string>;
  /** 刷新同步回调（触发重新同步以检测异常） */
  onRefreshSync?: () => void;
}

// ─── 单行节点 ────────────────────────────────────────────
interface RowProps {
  node: GroupTreeNode;
  users: UserOrg[];
  groups: UserGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  keyword: string;
  /** 是否显示人数（默认 true） */
  showCount?: boolean;
  /** 是否普通模式（显示行操作） */
  isManualMode?: boolean;
  onAddChildGroup?: (parentId: string) => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  /** 异常分组 id 集合 */
  anomalousGroupIds?: Set<string>;
  /** 直接异常分组 id 集合（自身+子分组，不含父分组冒泡） */
  directAnomalousGroupIds?: Set<string>;
}

function GroupRow(props: RowProps) {
  const {
    node,
    users,
    groups,
    selectedId,
    onSelect,
    expanded,
    onToggle,
    keyword,
    showCount = true,
    isManualMode,
    onAddChildGroup,
    onEditGroup,
    onDeleteGroup,
    anomalousGroupIds,
    directAnomalousGroupIds,
  } = props;

  // 递归渲染子节点
  const childRows = node.children.map((c) => (
    <GroupRow key={c.id} {...props} node={c} />
  ));

  // 是否被关键字命中（自身或任意后代）
  const matchKeyword = (n: GroupTreeNode): boolean => {
    if (!keyword.trim()) return true;
    const kw = keyword.trim().toLowerCase();
    if (n.name.toLowerCase().includes(kw)) return true;
    return n.children.some(matchKeyword);
  };

  if (!matchKeyword(node)) return null;

  const isActive = selectedId === node.id;
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  // 人数统计口径与右侧 NodeContentPanel 一致：聚合自身及所有子孙
  const count = getUsersOfGroupDeep(node.id, groups, users).length;

  return (
    <>
      <div
        className={`group flex items-center gap-1.5 h-9 pr-3 text-sm cursor-pointer rounded-lg mx-1 mb-0.5 transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        style={{
          paddingLeft: 10 + node.depth * 16,
        }}
        onClick={() => onSelect(node.id)}
      >
        {/* 展开箭头 */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
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

        <span className="truncate" title={node.name}>
          {node.name}
        </span>
        {showCount && (
          <span className={`text-[11px] tabular-nums shrink-0 ${isActive ? "text-blue-400" : "text-gray-400"}`}>
            ({count})
          </span>
        )}

        {/* 异常红点标记 */}
        {anomalousGroupIds?.has(node.id) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative shrink-0 ml-1">
                <span className="block w-2 h-2 rounded-full bg-red-500" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs max-w-[260px]">
              {directAnomalousGroupIds?.has(node.id)
                ? "该分组对应的部门已在腾讯统一身份管理平台被删除，但仍有配置未解绑"
                : "该部门下有分组已在腾讯统一身份管理平台被删除，但仍有配置未解绑"}
            </TooltipContent>
          </Tooltip>
        )}

        <span className="flex-1" />

        {/* 操作按钮：非只读分组（manual 或自建 oneid-group）显示 */}
        {isManualMode && !node.readonly && (
          <span className="flex items-center gap-0.5 shrink-0">
            {/* 添加子分组 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${isActive ? "text-blue-400 hover:text-blue-600 hover:bg-blue-100" : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChildGroup?.(node.id);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                添加子分组
              </TooltipContent>
            </Tooltip>
            {/* 更多操作 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${isActive ? "text-blue-400 hover:text-blue-600 hover:bg-blue-100" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                <DropdownMenuItem
                  className="text-xs gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGroup?.(node.id);
                  }}
                >
                  <Pencil className="w-3 h-3" />
                  编辑分组
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs gap-2 text-red-600 focus:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup?.(node.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  删除分组
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        )}
      </div>

      {hasChildren && isExpanded && childRows}
    </>
  );
}

// ─── 分桶标题 ────────────────────────────────────────────
function BucketHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-4 pb-1.5">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </span>
      <span className="text-xs text-gray-300 tabular-nums">· {count}</span>
    </div>
  );
}

// ─── 主组件 ─────────────────────────────────────────────
export default function GroupList({
  groups,
  users,
  selectedId,
  onSelect,
  deptSynced,
  onSyncDepts,
  isSyncingDepts,
  hasOneid,
  isManualMode,
  onCreateGroup,
  onAddChildGroup,
  onEditGroup,
  onDeleteGroup,
  anomalousGroupIds,
  directAnomalousGroupIds,
  onRefreshSync,
}: GroupListProps) {
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 默认展开所有顶层节点
    const s = new Set<string>();
    groups.forEach((g) => {
      if (g.parentId === null) s.add(g.id);
    });
    return s;
  });

  // OneID 模式下，组织架构和用户组区域各自可独立收起/展开
  const [deptSectionCollapsed, setDeptSectionCollapsed] = useState(false);
  const [ogSectionCollapsed, setOgSectionCollapsed] = useState(false);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 按来源分桶
  const buckets = useMemo(() => {
    const deptGroups = groups.filter((g) => g.source === "oneid-dept");
    const ogGroups = groups.filter((g) => g.source === "oneid-group");
    const manualGroups = groups.filter((g) => g.source === "manual");
    return {
      dept: buildGroupTree(deptGroups),
      og: buildGroupTree(ogGroups),
      manual: buildGroupTree(manualGroups),
    };
  }, [groups]);

  // 计算未分组用户数：不属于当前已加载分组的用户
  const unassignedCount = useMemo(() => {
    const loadedGroupIds = new Set(groups.map((g) => g.id));
    if (loadedGroupIds.size === 0) return users.length; // 没有任何分组 → 全部都是未分组
    return users.filter(
      (u) => !u.groupIds.some((gid) => loadedGroupIds.has(gid))
    ).length;
  }, [users, groups]);

  const isUnassignedActive = selectedId === UNASSIGNED_GROUP_ID;

  return (
    <div className="flex flex-col h-full">
      {/* 第一行：标题"分组" + 新建按钮 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <span className="text-lg font-semibold text-gray-900">分组</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2.5 h-7 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          onClick={onCreateGroup}
        >
          <Plus className="w-3.5 h-3.5" />
          新建
        </button>
      </div>

      {/* 第二行：搜索框 + 刷新按钮 */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索分组..."
              className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-50 placeholder:text-gray-400"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          {/* 刷新按钮 */}
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shrink-0"
            onClick={() => {
              if (onRefreshSync) {
                onRefreshSync();
              } else {
                toast.success("分组列表已刷新");
              }
            }}
            title="刷新"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto pb-3">
        {/* 组织架构桶 —— OneID 模式才显示 */}
        {deptSynced !== undefined && (
          <>
            {deptSynced ? (
              /* 已同步：正常渲染，可折叠 */
              <>
                <div
                  className="flex items-center gap-1.5 px-4 pt-4 pb-1.5 cursor-pointer select-none"
                  onClick={() => setDeptSectionCollapsed(!deptSectionCollapsed)}
                >
                  <span className="text-gray-400">
                    {deptSectionCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    部门
                  </span>
                </div>
                {!deptSectionCollapsed && buckets.dept.map((n) => (
                  <GroupRow
                    key={n.id}
                    node={n}
                    users={users}
                    groups={groups}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    expanded={expanded}
                    onToggle={toggle}
                    keyword={keyword}
                    anomalousGroupIds={anomalousGroupIds}
                    directAnomalousGroupIds={directAnomalousGroupIds}
                  />
                ))}
              </>
            ) : (
              /* 未同步：显示空白引导 + 同步按钮，标题可折叠 */
              <>
                <div
                  className="flex items-center gap-1.5 px-4 pt-4 pb-1.5 cursor-pointer select-none"
                  onClick={() => setDeptSectionCollapsed(!deptSectionCollapsed)}
                >
                  <span className="text-gray-400">
                    {deptSectionCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    部门
                  </span>
                </div>
                {!deptSectionCollapsed && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-gray-400 mb-3">
                      尚未同步部门
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-7"
                      onClick={onSyncDepts}
                      disabled={isSyncingDepts}
                    >
                      {isSyncingDepts ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      {isSyncingDepts ? "同步中..." : "同步部门作为分组"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 自定义分组桶 —— OneID 模式下显示 manual 分组，支持 CRUD */}
        {hasOneid && (
          <>
            <div
              className="flex items-center gap-1.5 px-4 pt-4 pb-1.5 cursor-pointer select-none"
              onClick={() => setOgSectionCollapsed(!ogSectionCollapsed)}
            >
              <span className="text-gray-400">
                {ogSectionCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                自定义分组
              </span>
            </div>
            {!ogSectionCollapsed && (
              buckets.manual.length > 0 ? (
                buckets.manual.map((n) => (
                  <GroupRow
                    key={n.id}
                    node={n}
                    users={users}
                    groups={groups}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    expanded={expanded}
                    onToggle={toggle}
                    keyword={keyword}
                    isManualMode={true}
                    showCount={false}
                    onAddChildGroup={onAddChildGroup}
                    onEditGroup={onEditGroup}
                    onDeleteGroup={onDeleteGroup}
                    anomalousGroupIds={anomalousGroupIds}
                    directAnomalousGroupIds={directAnomalousGroupIds}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-gray-400 mb-3">
                    暂无自定义分组
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-7"
                    onClick={onCreateGroup}
                  >
                    <Plus className="w-3 h-3" />
                    新建分组
                  </Button>
                </div>
              )
            )}
          </>
        )}

        {/* 自建分组桶（仅普通模式下直接渲染，OneID 模式下在"自定义分组"桶内已渲染） */}
        {deptSynced === undefined && buckets.manual.length > 0 && (
          <>
            {buckets.manual.map((n) => (
              <GroupRow
                key={n.id}
                node={n}
                users={users}
                groups={groups}
                selectedId={selectedId}
                onSelect={onSelect}
                expanded={expanded}
                onToggle={toggle}
                keyword={keyword}
                isManualMode={isManualMode}
                onAddChildGroup={onAddChildGroup}
                onEditGroup={onEditGroup}
                onDeleteGroup={onDeleteGroup}
                anomalousGroupIds={anomalousGroupIds}
              />
            ))}
          </>
        )}

        {groups.length === 0 && deptSynced !== false && (
          <div className="px-4 py-10 text-center text-xs text-gray-400">
            暂无分组，可新建自建分组
          </div>
        )}
      </div>

      {/* 底部固定：未分组 */}
      <div className="border-t border-gray-100 shrink-0">
        <div
          className={`group flex items-center gap-1.5 h-9 px-4 text-sm cursor-pointer transition-colors ${
            isUnassignedActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => onSelect(UNASSIGNED_GROUP_ID)}
        >
          <UserX className={`w-3.5 h-3.5 shrink-0 ${isUnassignedActive ? "text-blue-500" : "text-gray-400"}`} />
          <span className="truncate">未分组</span>
          <span className={`text-[11px] tabular-nums shrink-0 ${isUnassignedActive ? "text-blue-400" : "text-gray-400"}`}>
            ({unassignedCount})
          </span>
        </div>
      </div>
    </div>
  );
}

function countDescendants(n: GroupTreeNode): number {
  return n.children.reduce(
    (acc, c) => acc + 1 + countDescendants(c),
    0
  );
}
