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
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserGroup, UserOrg, AnomalousGroup } from "./types";
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
  /** 初始化未完成分组 id 集合（橙色点标记：包含自身 + 父分组冒泡） */
  uninitializedGroupIds?: Set<string>;
  /** 直接初始化未完成分组 id 集合（自身，不含父分组冒泡；用于 Tooltip 区分文案） */
  directUninitializedGroupIds?: Set<string>;
  /** 网络配置待更新分组 id 集合（橙色点标记：仅命中分组自身，不冒泡父子） */
  networkOutdatedGroupIds?: Set<string>;
  /** 异常分组详情 Map（groupId -> AnomalousGroup），用于动态 Tooltip 文案 */
  anomalousGroupDetails?: Map<string, AnomalousGroup>;
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
  /** 初始化未完成分组 id 集合（橙色点：包含自身+父分组冒泡） */
  uninitializedGroupIds?: Set<string>;
  /** 直接初始化未完成分组 id 集合（自身，不含父分组冒泡） */
  directUninitializedGroupIds?: Set<string>;
  /** 网络配置待更新分组 id 集合（橙色点：仅命中分组自身，不冒泡父子） */
  networkOutdatedGroupIds?: Set<string>;
  /** 筛选函数：判断节点是否匹配当前筛选条件 */
  filterFn?: (node: GroupTreeNode) => boolean;
  /** 异常分组详情 Map（groupId -> AnomalousGroup），用于动态 Tooltip 文案 */
  anomalousGroupDetails?: Map<string, AnomalousGroup>;
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
    uninitializedGroupIds,
    directUninitializedGroupIds,
    networkOutdatedGroupIds,
    filterFn,
    anomalousGroupDetails,
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
  // 筛选条件过滤
  if (filterFn && !filterFn(node)) return null;

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

        {/* 异常红点标记
            方案D：父分组的冒泡红点仅在收起状态下显示，展开后隐藏（子分组自己标记了） */}
        {anomalousGroupIds?.has(node.id) &&
          // 如果是冒泡节点（非直接异常），仅在收起时显示
          (directAnomalousGroupIds?.has(node.id) || !isExpanded) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative shrink-0 ml-1">
                <span className="block w-2 h-2 rounded-full bg-red-500" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs max-w-[260px]">
              {directAnomalousGroupIds?.has(node.id)
                ? (() => {
                    const detail = anomalousGroupDetails?.get(node.id);
                    const hasConfig = detail ? detail.boundConfigs.length > 0 : true;
                    const hasAgent = detail ? detail.agentInstanceCount > 0 : false;
                    const reasons = [
                      hasConfig ? "配置未解绑" : null,
                      hasAgent ? "Agent 实例未删除" : null,
                    ].filter(Boolean).join("、");
                    return `该分组对应的部门已在腾讯统一身份管理平台被删除，但仍有${reasons}`;
                  })()
                : (() => {
                    const hasConfig = Array.from(anomalousGroupDetails?.values() ?? []).some((d) => d.boundConfigs.length > 0);
                    const hasAgent = Array.from(anomalousGroupDetails?.values() ?? []).some((d) => d.agentInstanceCount > 0);
                    const reasons = [
                      hasConfig ? "配置未解绑" : null,
                      hasAgent ? "Agent 实例未删除" : null,
                    ].filter(Boolean).join("、");
                    return `该部门下有分组已在腾讯统一身份管理平台被删除，但仍有${reasons}，展开查看`;
                  })()}
            </TooltipContent>
          </Tooltip>
        )}

        {/* 初始化未完成橙色点标记（不与异常红点同时显示）
            方案D：父分组的冒泡标记仅在收起状态下显示，展开后隐藏（子分组自己标记了）
            互斥优化：若本节点同时命中"网络配置待更新"，让位给后者，避免同一分组出现两个橙点。 */}
        {!anomalousGroupIds?.has(node.id) &&
          !networkOutdatedGroupIds?.has(node.id) &&
          uninitializedGroupIds?.has(node.id) &&
          // 如果是冒泡节点（非直接未初始化），仅在收起时显示
          (directUninitializedGroupIds?.has(node.id) || !isExpanded) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative shrink-0 ml-1">
                <span className="block w-2 h-2 rounded-full bg-amber-500" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs max-w-[260px]">
              {directUninitializedGroupIds?.has(node.id)
                ? "该分组未完成初始化配置"
                : "该分组下有子分组未完成初始化配置，展开查看"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* 网络配置待更新橙色点标记（VPC / 子网被云端删除）
            - 仅命中分组自身展示，不冒泡父分组、不下发子分组、不影响兄弟分组
            - 与异常红点互斥（异常红点优先级最高）
            - 与「初始化未完成橙点」共同命中时，本橙点优先（更具体可定位），
              初始化橙点会通过 networkOutdatedGroupIds 让位条件主动隐藏。 */}
        {!anomalousGroupIds?.has(node.id) &&
          networkOutdatedGroupIds?.has(node.id) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative shrink-0 ml-1">
                <span className="block w-2 h-2 rounded-full bg-amber-500" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs max-w-[260px]">
              该分组的网络配置待更新
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem
                        className={`text-xs gap-2 ${hasChildren ? "text-gray-400 cursor-not-allowed" : "text-red-600 focus:text-red-600"}`}
                        disabled={hasChildren}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasChildren) onDeleteGroup?.(node.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                        删除分组
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  {hasChildren && (
                    <TooltipContent side="right" className="text-xs">
                      请先删除该分组下的子分组
                    </TooltipContent>
                  )}
                </Tooltip>
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

/** 筛选类型 */
type FilterType = "all" | "uninitialized" | "anomalous";

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
  uninitializedGroupIds,
  directUninitializedGroupIds,
  networkOutdatedGroupIds,
  anomalousGroupDetails,
}: GroupListProps) {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [filterOpen, setFilterOpen] = useState(false);
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

  // 筛选匹配：节点自身或其任意后代匹配当前 filter
  const matchFilter = (n: GroupTreeNode): boolean => {
    if (filter === "all") return true;
    if (filter === "uninitialized") {
      // 自身或后代有初始化未完成
      if (directUninitializedGroupIds?.has(n.id)) return true;
      return n.children.some(matchFilter);
    }
    if (filter === "anomalous") {
      // 自身或后代异常
      if (directAnomalousGroupIds?.has(n.id)) return true;
      return n.children.some(matchFilter);
    }
    return true;
  };

  // 筛选切换时，自动展开所有包含匹配节点的祖先路径
  React.useEffect(() => {
    if (filter === "all") return;
    // 收集所有需要展开的节点：如果一个节点的后代中有匹配项，则该节点需要展开
    const needExpand = new Set<string>();
    const collectExpandIds = (nodes: GroupTreeNode[]): boolean => {
      let hasMatch = false;
      for (const n of nodes) {
        const childHasMatch = collectExpandIds(n.children);
        const selfMatch =
          filter === "uninitialized"
            ? directUninitializedGroupIds?.has(n.id)
            : directAnomalousGroupIds?.has(n.id);
        if (selfMatch || childHasMatch) {
          hasMatch = true;
          // 如果子节点有匹配，则当前节点需要展开
          if (childHasMatch) {
            needExpand.add(n.id);
          }
        }
      }
      return hasMatch;
    };
    const allTrees = [...buckets.dept, ...buckets.og, ...buckets.manual];
    collectExpandIds(allTrees);
    if (needExpand.size > 0) {
      setExpanded((prev) => {
        const next = new Set(prev);
        needExpand.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [filter]);

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
          {/* 筛选按钮 */}
          <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-8 h-8 flex items-center justify-center rounded-lg border bg-white transition-colors shrink-0 ${
                  filter !== "all"
                    ? "border-blue-300 text-blue-600 bg-blue-50"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                title="筛选"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem
                className={`text-xs gap-2 ${filter === "all" ? "font-medium text-blue-600" : ""}`}
                onClick={() => setFilter("all")}
              >
                全部
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`text-xs gap-2 ${filter === "uninitialized" ? "font-medium text-blue-600" : ""}`}
                onClick={() => setFilter("uninitialized")}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                初始化未完成
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`text-xs gap-2 ${filter === "anomalous" ? "font-medium text-blue-600" : ""}`}
                onClick={() => setFilter("anomalous")}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                异常
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    uninitializedGroupIds={uninitializedGroupIds}
                    directUninitializedGroupIds={directUninitializedGroupIds}
                    networkOutdatedGroupIds={networkOutdatedGroupIds}
                    filterFn={matchFilter}
                    anomalousGroupDetails={anomalousGroupDetails}
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

        {/* 自定义分组桶 —— OneID 模式下显示 oneid-group + manual 分组，支持 CRUD */}
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
              [...buckets.og, ...buckets.manual].length > 0 ? (
                [...buckets.og, ...buckets.manual].map((n) => (
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
                    uninitializedGroupIds={uninitializedGroupIds}
                    directUninitializedGroupIds={directUninitializedGroupIds}
                    networkOutdatedGroupIds={networkOutdatedGroupIds}
                    filterFn={matchFilter}
                    anomalousGroupDetails={anomalousGroupDetails}
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
                directAnomalousGroupIds={directAnomalousGroupIds}
                uninitializedGroupIds={uninitializedGroupIds}
                directUninitializedGroupIds={directUninitializedGroupIds}
                networkOutdatedGroupIds={networkOutdatedGroupIds}
                filterFn={matchFilter}
                anomalousGroupDetails={anomalousGroupDetails}
              />
            ))}
          </>
        )}

        {groups.length === 0 && deptSynced !== false && (
          <div className="px-4 py-10 text-center text-xs text-gray-400">
            暂无分组，可新建自建分组
          </div>
        )}

        {/* 筛选无结果占位符 */}
        {filter !== "all" && groups.length > 0 && (() => {
          const allTrees = [...buckets.dept, ...buckets.og, ...buckets.manual];
          const hasAnyMatch = allTrees.some(matchFilter);
          if (hasAnyMatch) return null;
          return (
            <div className="px-4 py-10 text-center">
              <Filter className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">
                暂无符合筛选条件的分组
              </p>
            </div>
          );
        })()}
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
