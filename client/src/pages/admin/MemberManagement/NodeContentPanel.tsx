/**
 * 右侧节点内容面板：用户列表 Tab + 配置总览 Tab
 *
 * 配置总览（v2）：
 *   - 三大核心初始化检查：可见模型 / 可见通道 / 安全组
 *     每项显示：✅ 正常 / ⚠️ 异常；异常时给出「前往对应页配置」跳转
 *   - 按 12 种配置项聚合展示（模型/通道/安全组/技能/Agent工具/记忆/网盘/镜像/VPC/公网/CLS/平台策略）
 *     每条标注来源：本分组 / 继承自某分组 / 平台默认
 *   - 初始化校验仅模型/通道/安全组三项
 */
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Lock,
  Plus,
  UserMinus,
  Info,
  Cpu,
  Radio,
  Shield,
  Sparkles,
  Wrench,
  Brain,
  HardDrive,
  Box,
  Network,
  Globe,
  FileText,
  Settings,
} from "lucide-react";
import { Link } from "wouter";
import type {
  UserOrg,
  UserOverrideInfo,
  UserGroup,
  ConfigCategory,
  ConfigEntry,
} from "./types";
import { getPrimaryDeptPath, getConfigEntries, CONFIG_CATEGORY_META } from "./mock";
import {
  getGroupHealth,
  MISSING_LABEL,
} from "./health";

const PAGE_SIZE = 10;

type Tab = "members" | "config";

interface NodeContentPanelProps {
  /** 当前分组 id */
  nodeId: string;
  nodeName: string;
  /** 当前节点所属来源（oneid-dept / oneid-group / manual） */
  nodeSource: "oneid-dept" | "oneid-group" | "manual";
  nodeReadonly: boolean;
  /** 节点所在分组全集（用于祖先继承判定 + 展示主部门路径） */
  groups: UserGroup[];
  /** 本节点路径（面包屑） */
  nodePath: string;
  /** 已过滤到本节点的用户列表 */
  users: UserOrg[];
  /** 保留但当前不在此面板展示（用户列表已精简掉覆盖状态列与查看配置按钮）。
   *  未来需要在此面板恢复冲突裁决入口时可再使用。 */
  overrides?: Record<string, UserOverrideInfo>;
  onResolveConflict?: (userId: string, winnerResourceId: string) => void;
  /** 是否为 OneID 模式 */
  hasOneid?: boolean;
  /** 是否为普通模式 */
  isManualMode?: boolean;
  /** 全部用户（添加用户到分组弹窗用） */
  allUsers?: UserOrg[];
  /** 添加用户到分组的回调 */
  onAddUsersToGroup?: (userIds: string[]) => void;
  /** 从分组中移除用户的回调 */
  onRemoveFromGroup?: (userId: string) => void;
}

// ─── 核心维度 meta（初始化检查卡用） ─────────────────────
const CORE_CHECK_META = {
  model: {
    label: "配置至少一个可见模型",
    path: "/admin/model-config",
    desc: "当前缺失，建议前往配置",
  },
  channel: {
    label: "配置至少一个可见通道",
    path: "/admin/channel-config",
    desc: "当前缺失，建议前往配置",
  },
  securityGroup: {
    label: "配置安全组",
    path: "/admin/security-group",
    desc: "当前缺失，建议前往配置",
  },
} as const;

// ─── 配置项图标映射 ──────────────────────────────────────
const CATEGORY_ICON: Record<ConfigCategory, React.ComponentType<{ className?: string }>> = {
  model: Cpu,
  channel: Radio,
  securityGroup: Shield,
  skill: Sparkles,
  agentTool: Wrench,
  memory: Brain,
  drive: HardDrive,
  image: Box,
  vpc: Network,
  publicNetwork: Globe,
  cls: FileText,
  platformPolicy: Settings,
};

// 配置项展示顺序
const CATEGORY_ORDER: ConfigCategory[] = [
  "model", "channel", "securityGroup", "skill", "agentTool",
  "memory", "drive", "image", "vpc", "publicNetwork", "cls", "platformPolicy",
];

// ─── 获取用户所有 oneid-dept 类型部门的完整路径 ────────────
function getUserDeptPaths(
  user: UserOrg,
  groups: UserGroup[]
): Array<{ path: string; isPrimary: boolean }> {
  const deptGroupIds = user.groupIds.filter((gid) => {
    const g = groups.find((g) => g.id === gid);
    return g?.source === "oneid-dept";
  });
  if (deptGroupIds.length === 0) return [];
  return deptGroupIds.map((gid) => ({
    path: getPrimaryDeptPath(gid, groups),
    isPrimary: gid === user.primaryGroupId,
  })).sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));
}

export default function NodeContentPanel({
  nodeId,
  nodeName,
  nodeSource,
  nodeReadonly,
  groups,
  nodePath,
  users,
  hasOneid = false,
  isManualMode = false,
  allUsers = [],
  onAddUsersToGroup,
  onRemoveFromGroup,
}: NodeContentPanelProps) {
  const [tab, setTab] = useState<Tab>("members");
  const [page, setPage] = useState(1);

  // 添加用户到分组弹窗
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addSelected, setAddSelected] = useState<string[]>([]);

  // 从分组中移除确认弹窗
  const [removeDialog, setRemoveDialog] = useState<{
    userId: string;
    groupName: string;
  } | null>(null);

  React.useEffect(() => {
    setPage(1);
    setTab("members");
  }, [nodeId]);

  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const health = getGroupHealth(nodeId, groups);

  // 节点来源文案
  const sourceLabel =
    nodeSource === "oneid-dept"
      ? "OneID 组织架构节点"
      : nodeSource === "oneid-group"
      ? "OneID 用户组"
      : "自建分组";

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const groupName = (id: string) => groupMap.get(id)?.name ?? id;

  // 添加用户弹窗的过滤逻辑
  const addFilteredUsers = useMemo(() => {
    let list = allUsers;
    if (addSearch.trim()) {
      const kw = addSearch.trim().toLowerCase();
      list = list.filter((u) => u.userId.toLowerCase().includes(kw));
    }
    return list;
  }, [allUsers, addSearch]);

  const handleAddConfirm = () => {
    if (addSelected.length === 0) return;
    onAddUsersToGroup?.(addSelected);
    setShowAddDialog(false);
    setAddSearch("");
    setAddSelected([]);
  };

  const handleRemoveConfirm = () => {
    if (removeDialog) {
      onRemoveFromGroup?.(removeDialog.userId);
      setRemoveDialog(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 节点头：名称 + 人数 + 健康状态徽章 + 只读锁标记 + 来源标签 + 路径 */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">{nodeName}</h2>
          <span className="text-sm text-gray-400 tabular-nums">
            · {users.length} 人
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${
              health.healthy
                ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                : "text-amber-600 bg-amber-50 border border-amber-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health.healthy ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {health.healthy ? "初始化已完成" : "初始化未完成"}
          </span>
          {nodeReadonly && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
              <Lock className="w-3 h-3" />
              只读
            </span>
          )}
          <span className="text-xs text-gray-400">{sourceLabel}</span>
        </div>
        <div className="text-xs text-gray-500">路径：{nodePath}</div>
        {!health.healthy && (
          <div className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              本分组缺少：
              <span className="font-medium">
                {health.missing.map((m) => MISSING_LABEL[m]).join("、")}
              </span>
              。本节点下的用户将依赖上层/平台默认兜底，建议补全或在「配置总览」中快速前往对应页配置。
            </p>
          </div>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="px-6 pt-3">
        <div className="inline-flex items-center rounded-lg p-1 gap-0.5 bg-white border border-gray-200 h-9">
          <button
            type="button"
            onClick={() => setTab("members")}
            className={`h-7 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
              tab === "members"
                ? "font-semibold text-gray-900 bg-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            用户列表
          </button>
          <button
            type="button"
            onClick={() => setTab("config")}
            className={`h-7 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
              tab === "config"
                ? "font-semibold text-gray-900 bg-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            配置总览
          </button>
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tab === "members" && (
          <>
            {/* 卡片 */}
            <div
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* 卡片 header：分组名 + 添加用户按钮（仅普通模式） */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900">{nodeName}</h3>
                {isManualMode && nodeId !== "__unassigned__" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-gray-200"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    添加用户到分组
                  </Button>
                )}
              </div>

              {/* 表格 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        用户 ID
                      </th>
                      {hasOneid && (
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          组织架构
                        </th>
                      )}
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        分组
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        角色
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        状态
                      </th>
                      {isManualMode && (
                        <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          操作
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={hasOneid ? 5 : isManualMode ? 5 : 4}
                          className="px-6 py-12 text-center text-sm text-gray-400"
                        >
                          暂无用户
                        </td>
                      </tr>
                    ) : (
                      pagedUsers.map((u) => {
                        const userGroups = u.groupIds
                          .map((gid) => groupMap.get(gid))
                          .filter(Boolean) as UserGroup[];
                        const manualGroups = userGroups.filter((g) => g.source === "manual");
                        const deptPaths = hasOneid ? getUserDeptPaths(u, groups) : [];
                        return (
                          <tr
                            key={u.userId}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            {/* 用户 ID */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {u.userId}
                              </span>
                            </td>

                            {/* 组织架构（仅 OneID 模式） */}
                            {hasOneid && (
                              <td className="px-4 py-4">
                                {deptPaths.length === 0 ? (
                                  <span className="text-sm text-gray-300">—</span>
                                ) : deptPaths.length === 1 ? (
                                  <span
                                    className="text-sm text-gray-600 truncate block max-w-[180px]"
                                    title={deptPaths[0].path}
                                  >
                                    {deptPaths[0].path}
                                  </span>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-sm text-gray-600 truncate block max-w-[180px] cursor-default">
                                        {deptPaths[0].path}
                                        <span className="text-xs text-gray-400 ml-1">
                                          +{deptPaths.length - 1}
                                        </span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="bottom"
                                      align="start"
                                      className="max-w-[360px] p-0"
                                    >
                                      <div className="py-2">
                                        {deptPaths.map((dp, idx) => (
                                          <div
                                            key={idx}
                                            className="px-3 py-1.5 text-sm"
                                          >
                                            <span className="text-gray-200 mr-1">
                                              {idx + 1}.
                                            </span>
                                            <span className="text-white">
                                              {dp.path}
                                            </span>
                                            {dp.isPrimary && (
                                              <span className="ml-2 inline-flex items-center text-[10px] font-medium text-blue-400 bg-blue-500/20 rounded px-1.5 py-0.5">
                                                主部门
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </td>
                            )}

                            {/* 分组 */}
                            <td className="px-4 py-4">
                              {(() => {
                                // OneID 模式：显示组织架构 + 用户组；普通模式：只显示自建分组
                                const displayGroups = hasOneid
                                  ? userGroups.filter((g) => g.source === "oneid-dept" || g.source === "oneid-group")
                                  : manualGroups;
                                if (displayGroups.length === 0)
                                  return <span className="text-sm text-gray-300">—</span>;

                                // 来源样式映射
                                const sourceStyle = (source: string) => {
                                  if (source === "oneid-dept")
                                    return "bg-blue-50 text-blue-700 border-blue-100";
                                  if (source === "oneid-group")
                                    return "bg-violet-50 text-violet-700 border-violet-100";
                                  return "bg-gray-50 text-gray-700 border-gray-100";
                                };

                                // 获取显示名称：组织架构显示完整路径，用户组显示名称
                                const getDisplayName = (g: UserGroup) =>
                                  g.source === "oneid-dept"
                                    ? getPrimaryDeptPath(g.id, groups)
                                    : g.name;

                                const firstName = getDisplayName(displayGroups[0]);

                                return (
                                  <div className="flex items-center gap-1 max-w-[260px]">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className={`text-xs rounded-full px-2 py-0.5 border truncate max-w-[200px] inline-block cursor-default ${sourceStyle(displayGroups[0].source)}`}
                                        >
                                          {firstName}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {firstName}
                                        {hasOneid && (
                                          <span className="text-gray-300 ml-1">
                                            ({displayGroups[0].source === "oneid-dept" ? "组织架构" : "用户组"})
                                          </span>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                    {displayGroups.length > 1 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-xs text-gray-400 cursor-default shrink-0">
                                            +{displayGroups.length - 1}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[360px] p-0">
                                          <div className="py-1.5">
                                            {displayGroups.map((g, idx) => (
                                              <div key={idx} className="px-3 py-1 flex items-center gap-2 text-sm">
                                                <span
                                                  className={`text-[10px] rounded-full px-1.5 py-0.5 border shrink-0 ${
                                                    g.source === "oneid-dept"
                                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                                      : "bg-violet-500/20 text-violet-300 border-violet-500/30"
                                                  }`}
                                                >
                                                  {g.source === "oneid-dept" ? "架构" : "用户组"}
                                                </span>
                                                <span className="text-white truncate">{getDisplayName(g)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* 角色 */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={
                                  u.role === "admin"
                                    ? "border-blue-200 text-blue-600 bg-blue-50"
                                    : "border-gray-200 text-gray-500"
                                }
                              >
                                {u.role === "admin" ? "管理员" : "用户"}
                              </Badge>
                            </td>

                            {/* 状态 */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              {u.status === "active" ? (
                                <span className="badge-running text-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                  正常
                                </span>
                              ) : (
                                <span className="badge-stopped text-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                  禁用
                                </span>
                              )}
                            </td>

                            {/* 操作（仅普通模式） */}
                            {isManualMode && (
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                  {nodeId !== "__unassigned__" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                          onClick={() =>
                                            setRemoveDialog({
                                              userId: u.userId,
                                              groupName: nodeName,
                                            })
                                          }
                                        >
                                          <UserMinus className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>从分组中移除</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 底部：共 N 名用户 + 分页 */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50">
                <span className="text-xs text-blue-600">
                  共 {total} 名用户
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const isActive = p === page;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(() => p)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          }`}
                          style={
                            isActive
                              ? {
                                  background:
                                    "linear-gradient(135deg, #007AFF, #5856D6)",
                                }
                              : undefined
                          }
                        >
                          {p}
                        </button>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "config" && (
          <ConfigOverviewTab
            nodeId={nodeId}
            groups={groups}
            health={health}
          />
        )}
      </div>

      {/* 添加用户到分组弹窗（普通模式） */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setAddSearch("");
            setAddSelected([]);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              添加用户到「{nodeName}」
            </DialogTitle>
          </DialogHeader>
          {/* 多分组规则提示 */}
          <div className="flex items-center gap-1.5 px-2.5 py-2 bg-blue-50 border border-blue-100 rounded-lg">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-xs text-blue-600">
              一个用户支持加入多个分组，可按分组设置不同的配置与权限
            </span>
          </div>
          <div className="py-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索用户 ID..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="pl-9 bg-white border-gray-200"
                autoFocus
              />
            </div>
            <div className="max-h-[420px] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50 bg-white">
              {addFilteredUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  没有可添加的用户
                </p>
              ) : (
                addFilteredUsers.map((m) => {
                  const isInCurrentGroup = m.groupIds.includes(nodeId);
                  const isDisabled = isInCurrentGroup;
                  const memberGroupNames = m.groupIds
                    .map((gid) => groupName(gid))
                    .filter(Boolean);
                  const groupDisplay =
                    memberGroupNames.length === 0
                      ? "未分组"
                      : memberGroupNames.slice(0, 2).join("、") +
                        (memberGroupNames.length > 2
                          ? ` +${memberGroupNames.length - 2}`
                          : "");
                  const tooltipText = isInCurrentGroup
                    ? "该用户已在当前分组"
                    : "";
                  const row = (
                    <label
                      key={m.userId}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed bg-gray-100"
                          : "bg-white hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <Checkbox
                        checked={isInCurrentGroup || addSelected.includes(m.userId)}
                        disabled={isDisabled}
                        onCheckedChange={() => {
                          if (isDisabled) return;
                          setAddSelected((prev) =>
                            prev.includes(m.userId)
                              ? prev.filter((id) => id !== m.userId)
                              : [...prev, m.userId]
                          );
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-900 block truncate">
                          {m.userId}
                        </span>
                        <span className="text-xs text-gray-400 block truncate">
                          {groupDisplay}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            m.role === "admin"
                              ? "border-blue-200 text-blue-600 bg-blue-50 text-xs"
                              : "border-gray-200 text-gray-500 text-xs"
                          }
                        >
                          {m.role === "admin" ? "管理员" : "用户"}
                        </Badge>
                        {m.status === "active" ? (
                          <span className="badge-running text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            正常
                          </span>
                        ) : (
                          <span className="badge-stopped text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            禁用
                          </span>
                        )}
                      </div>
                    </label>
                  );
                  return isDisabled ? (
                    <Tooltip key={m.userId}>
                      <TooltipTrigger asChild>{row}</TooltipTrigger>
                      <TooltipContent>{tooltipText}</TooltipContent>
                    </Tooltip>
                  ) : (
                    row
                  );
                })
              )}
            </div>
            {addSelected.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  已选择 {addSelected.length} 名用户
                </span>
                <button
                  className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                  onClick={() => setAddSelected([])}
                >
                  清除选择
                </button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setAddSearch("");
                setAddSelected([]);
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddConfirm}
              disabled={addSelected.length === 0}
              className="text-white"
              style={{
                background: "linear-gradient(135deg, #007AFF, #5856D6)",
              }}
            >
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 从分组中移除确认弹窗 */}
      <Dialog
        open={!!removeDialog}
        onOpenChange={(open) => {
          if (!open) setRemoveDialog(null);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>从分组中移除</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">用户 ID</span>
                <span className="text-sm font-medium text-gray-900">
                  {removeDialog?.userId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">分组名称</span>
                <span className="text-sm font-medium text-gray-900">
                  {removeDialog?.groupName}
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-600 leading-relaxed">
              移除后，该用户在此分组下的可见范围和权限将被收回。用户不会被删除，仅解除与该分组的关联。
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog(null)}>
              取消
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleRemoveConfirm}
            >
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 配置总览 Tab ───────────────────────────────────────
interface ConfigOverviewTabProps {
  nodeId: string;
  groups: UserGroup[];
  health: { healthy: boolean; missing: Array<"model" | "channel" | "securityGroup"> };
}

/** 来源标签 */
function SourceBadge({ source }: { source: ConfigEntry["source"] }) {
  if (source.type === "platformDefault") {
    return (
      <span className="inline-flex items-center text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 shrink-0">
        平台默认
      </span>
    );
  }
  if (source.type === "local") {
    return (
      <span className="inline-flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 shrink-0">
        本分组
      </span>
    );
  }
  // inherited
  return (
    <span className="inline-flex items-center text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
      继承自 {source.groupName}
    </span>
  );
}

/** 公网配置项的特殊展示 */
function PublicNetworkDetail({ meta }: { meta: Record<string, string | number | boolean> }) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span>
        公网 IP：
        <span className={`font-medium ${meta.allocated ? "text-emerald-600" : "text-gray-400"}`}>
          {meta.allocated ? "已分配" : "未分配"}
        </span>
      </span>
      <span className="text-gray-200">|</span>
      <span>计费：<span className="font-medium text-gray-700">{String(meta.billingMode)}</span></span>
      <span className="text-gray-200">|</span>
      <span>带宽上限：<span className="font-medium text-gray-700 tabular-nums">{String(meta.bandwidthCap)} Mbps</span></span>
    </div>
  );
}

/** 平台策略条目的特殊展示 */
function PolicyEntryValue({ entry }: { entry: ConfigEntry }) {
  if (!entry.meta) return null;
  if ("enabled" in entry.meta) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${entry.meta.enabled ? "text-emerald-600" : "text-gray-400"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${entry.meta.enabled ? "bg-emerald-500" : "bg-gray-300"}`} />
        {entry.meta.enabled ? "已开启" : "已关闭"}
      </span>
    );
  }
  if ("value" in entry.meta) {
    const val = entry.meta.value as number;
    return (
      <span className="text-xs font-medium text-gray-700 tabular-nums">
        {val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
      </span>
    );
  }
  return null;
}

function ConfigOverviewTab({
  nodeId,
  groups,
  health,
}: ConfigOverviewTabProps) {
  // 获取当前节点的全部配置条目
  const configEntries = useMemo(() => getConfigEntries(nodeId, groups), [nodeId, groups]);

  // 按 category 分组
  const byCategory = useMemo(() => {
    const map = new Map<ConfigCategory, ConfigEntry[]>();
    configEntries.forEach((e) => {
      const list = map.get(e.category) ?? [];
      list.push(e);
      map.set(e.category, list);
    });
    return map;
  }, [configEntries]);

  // 三大核心检查卡
  const checks: Array<{
    key: "model" | "channel" | "securityGroup";
    status: "ok" | "missing";
  }> = (["model", "channel", "securityGroup"] as const).map((k) => ({
    key: k,
    status: health.missing.includes(k) ? "missing" : "ok",
  }));

  return (
    <div className="space-y-5">
      {/* 初始化检查 */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">初始化检查</div>
            <div className="text-xs text-gray-500 mt-0.5">
              可见模型 / 可见通道 / 安全组 三项核心配置是否就绪（含上层继承与平台默认兜底）
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${
              health.healthy
                ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                : "text-amber-600 bg-amber-50 border border-amber-100"
            }`}
          >
            {health.healthy ? "全部就绪" : `缺 ${health.missing.length} 项`}
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {checks.map((c) => {
            const meta = CORE_CHECK_META[c.key];
            return (
              <div
                key={c.key}
                className="flex items-center gap-3 px-6 py-3.5"
              >
                {c.status === "ok" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {meta.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.status === "ok"
                      ? "已就绪（本节点 / 上层继承 / 平台默认 任一命中）"
                      : meta.desc}
                  </div>
                </div>
                {c.status === "missing" && (
                  <Link href={meta.path}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                    >
                      前往配置
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 按配置项聚合的配置列表 */}
      <div className="space-y-3">
        {CATEGORY_ORDER.map((cat) => {
          const entries = byCategory.get(cat);
          if (!entries || entries.length === 0) return null;
          const catMeta = CONFIG_CATEGORY_META[cat];
          const IconComp = CATEGORY_ICON[cat];
          return (
            <div
              key={cat}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* 配置项 header */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${catMeta.bg} flex items-center justify-center`}>
                    <IconComp className={`w-3.5 h-3.5 ${catMeta.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {catMeta.label}
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {entries.length} 条
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {catMeta.description}
                    </div>
                  </div>
                </div>
                <Link
                  href={catMeta.path}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  管理 <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* 条目列表 */}
              <div className="divide-y divide-gray-50">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-6 py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {entry.label}
                        </span>
                        {entry.subLabel && (
                          <span className="text-[10px] text-gray-400 bg-gray-50 rounded px-1.5 py-0.5 shrink-0">
                            {entry.subLabel}
                          </span>
                        )}
                        <SourceBadge source={entry.source} />
                      </div>
                      {/* 特殊展示 */}
                      {cat === "publicNetwork" && entry.meta && (
                        <div className="mt-1.5">
                          <PublicNetworkDetail meta={entry.meta} />
                        </div>
                      )}
                      {cat === "vpc" && entry.subLabel && (
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">
                          CIDR: {entry.subLabel}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {cat === "platformPolicy" && <PolicyEntryValue entry={entry} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
