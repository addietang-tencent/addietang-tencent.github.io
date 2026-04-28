/**
 * 左侧分组列表（多层级树 + 健康圆点 + 初始化已完成/未完成筛选 + 搜索）
 *
 * 视觉规范（流动蓝图）：
 *   - 行高 32~36，每一层左缩进 16px
 *   - 右侧：人数（text-xs gray-400）+ 健康圆点（emerald-500 / amber-500）
 *   - 活跃行：borderLeft: 2px solid #007AFF + bg-blue-50 text-blue-700
 *   - 按来源分桶：组织架构 / 用户组 / 自建分组，段头用一个极简小标题
 *   - 底部固定「未分组」项
 */
import React, { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  Users,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Search,
  UserX,
  RefreshCw,
  Loader2,
  Filter,
  ExternalLink,
  Check,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  getGroupHealth,
  getUsersOfGroupDeep,
  MISSING_LABEL,
  type GroupTreeNode,
} from "./health";

type HealthFilter = "all" | "healthy" | "unhealthy";

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
  /** OneID 模式下，用户组是否已同步 */
  ogSynced?: boolean;
  /** 点击刷新用户组 */
  onRefreshOg?: () => void;
  /** 用户组刷新中 */
  isRefreshingOg?: boolean;
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
}

// ─── 健康圆点 ────────────────────────────────────────────
function HealthDot({
  groupId,
  groups,
}: {
  groupId: string;
  groups: UserGroup[];
}) {
  const health = getGroupHealth(groupId, groups);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`w-2 h-2 rounded-full inline-block ${
            health.healthy ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {health.healthy
          ? "初始化已完成：可见模型 / 可见通道 / 安全组 均已配置（含上层继承与平台默认兜底）"
          : `初始化未完成：缺少 ${health.missing.map((m) => MISSING_LABEL[m]).join("、")}`}
      </TooltipContent>
    </Tooltip>
  );
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
  healthFilter: HealthFilter;
  keyword: string;
  /** 是否普通模式（显示行操作） */
  isManualMode?: boolean;
  onAddChildGroup?: (parentId: string) => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
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
    healthFilter,
    keyword,
    isManualMode,
    onAddChildGroup,
    onEditGroup,
    onDeleteGroup,
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

  // 是否满足健康过滤（自身或任意后代）
  const matchHealth = (n: GroupTreeNode): boolean => {
    if (healthFilter === "all") return true;
    const selfHealthy = getGroupHealth(n.id, groups).healthy;
    if (healthFilter === "healthy" && selfHealthy) return true;
    if (healthFilter === "unhealthy" && !selfHealthy) return true;
    return n.children.some(matchHealth);
  };

  if (!matchKeyword(node) || !matchHealth(node)) return null;

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
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        style={{
          borderLeft: isActive ? "2px solid #007AFF" : "2px solid transparent",
          paddingLeft: 8 + node.depth * 16,
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

        <span className="flex-1 truncate" title={node.name}>
          {node.name}
        </span>

        {/* 操作按钮：仅普通模式的 manual 分组显示 */}
        {isManualMode && node.source === "manual" && (
          <span className="flex items-center gap-0.5 shrink-0">
            {/* 添加子分组 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
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
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
                  编辑
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
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        )}

        <span className="text-xs text-gray-400 tabular-nums shrink-0">
          {count}
        </span>
        <HealthDot groupId={node.id} groups={groups} />
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
  ogSynced,
  onRefreshOg,
  isRefreshingOg,
  isManualMode,
  onCreateGroup,
  onAddChildGroup,
  onEditGroup,
  onDeleteGroup,
}: GroupListProps) {
  const [keyword, setKeyword] = useState("");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 默认展开所有顶层节点
    const s = new Set<string>();
    groups.forEach((g) => {
      if (g.parentId === null) s.add(g.id);
    });
    return s;
  });

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

  const totalCount = groups.length;

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
      {/* 普通模式：新建分组按钮 */}
      {isManualMode && (
        <div className="px-3 pt-3 pb-0">
          <Button
            className="w-full gap-1.5 text-xs h-8 text-white"
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            onClick={onCreateGroup}
          >
            <Plus className="w-3.5 h-3.5" />
            新建分组
          </Button>
        </div>
      )}

      {/* 搜索 + 健康筛选（胶囊形搜索框 + 筛选icon下拉） */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
                  healthFilter !== "all"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem
                className="text-xs gap-2 justify-between"
                onClick={() => setHealthFilter("all")}
              >
                全部
                {healthFilter === "all" && <Check className="w-3 h-3 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs gap-2 justify-between"
                onClick={() => setHealthFilter("healthy")}
              >
                <span className="flex items-center gap-1.5">
                  初始化已完成
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                </span>
                {healthFilter === "healthy" && <Check className="w-3 h-3 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs gap-2 justify-between"
                onClick={() => setHealthFilter("unhealthy")}
              >
                <span className="flex items-center gap-1.5">
                  初始化未完成
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                </span>
                {healthFilter === "unhealthy" && <Check className="w-3 h-3 text-blue-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto pb-3">
        {/* 组织架构桶 —— 未同步时显示空白 + 同步按钮 */}
        {(deptSynced === undefined || deptSynced) ? (
          /* 已同步或非 OneID 模式：正常渲染 */
          buckets.dept.length > 0 && (
            <>
              <BucketHeader
                icon={<Building2 className="w-3.5 h-3.5" />}
                title="组织架构"
                count={buckets.dept.reduce(
                  (acc, r) => acc + 1 + countDescendants(r),
                  0
                )}
              />
              {buckets.dept.map((n) => (
                <GroupRow
                  key={n.id}
                  node={n}
                  users={users}
                  groups={groups}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expanded={expanded}
                  onToggle={toggle}
                  healthFilter={healthFilter}
                  keyword={keyword}
                />
              ))}
            </>
          )
        ) : (
          /* 未同步：显示空白引导 + 同步按钮 */
          <>
            <BucketHeader
              icon={<Building2 className="w-3.5 h-3.5" />}
              title="组织架构"
              count={0}
            />
            <div className="px-4 py-6 text-center">
              <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-3">
                尚未同步组织架构
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
                {isSyncingDepts ? "同步中..." : "同步组织架构作为分组"}
              </Button>
            </div>
          </>
        )}

        {/* 用户组桶 —— 未同步时显示空白 + 前往创建 + 刷新 */}
        {(ogSynced === undefined || ogSynced) ? (
          /* 已同步或非 OneID 模式：正常渲染 */
          buckets.og.length > 0 && (
            <>
              <BucketHeader
                icon={<Users className="w-3.5 h-3.5" />}
                title="用户组"
                count={buckets.og.length}
              />
              {buckets.og.map((n) => (
                <GroupRow
                  key={n.id}
                  node={n}
                  users={users}
                  groups={groups}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expanded={expanded}
                  onToggle={toggle}
                  healthFilter={healthFilter}
                  keyword={keyword}
                />
              ))}
            </>
          )
        ) : (
          /* 未同步：显示空白引导 + 前往创建 + 刷新 */
          <>
            <BucketHeader
              icon={<Users className="w-3.5 h-3.5" />}
              title="用户组"
              count={0}
            />
            <div className="px-4 py-6 text-center">
              <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-3">
                暂无用户组
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-7"
                  onClick={() => window.open("https://oneid.example.com/groups", "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                  前往创建用户组
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-7 h-7 p-0"
                  onClick={onRefreshOg}
                  disabled={isRefreshingOg}
                >
                  {isRefreshingOg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {buckets.manual.length > 0 && (
          <>
            <BucketHeader
              icon={<FolderTree className="w-3.5 h-3.5" />}
              title="自建分组"
              count={buckets.manual.reduce(
                (acc, r) => acc + 1 + countDescendants(r),
                0
              )}
            />
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
                healthFilter={healthFilter}
                keyword={keyword}
                isManualMode={isManualMode}
                onAddChildGroup={onAddChildGroup}
                onEditGroup={onEditGroup}
                onDeleteGroup={onDeleteGroup}
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
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          style={{
            borderLeft: isUnassignedActive ? "2px solid #007AFF" : "2px solid transparent",
          }}
          onClick={() => onSelect(UNASSIGNED_GROUP_ID)}
        >
          <UserX className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="flex-1 truncate">未分组</span>
          <span className="text-xs text-gray-400 tabular-nums shrink-0">
            {unassignedCount}
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
