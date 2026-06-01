/**
 * MyOpenClaw - 我的 OpenClaw 页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 快速上手引导（始终显示，可手动关闭）
 * - OpenClaw 卡片列表（支持 8 种状态）
 * - 创建 OpenClaw 弹窗
 * - 通知 Bell 图标和面板
 * - 操作确认弹窗（重启、重装、删除）
 * - 自动轮询状态转换
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TextSwitch, TextSwitchOption } from "@/components/ui/segment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SurfaceInner } from "@/components/ui/Surface";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Bot, Bell, X, AlertCircle, ChevronUp,
  Copy, Users, Check, ArrowRight, ArrowLeft,
  Sparkles, Heart,
} from "lucide-react";
import AgentChat from "./AgentChat";
// 注：旧版对话视图 `ChatView` 暂不再渲染，相关业务逻辑保留在 `./ChatView`，需要时再接入
import { MOCK_ROLES } from "@/lib/mockData";
import type { Role } from "@/lib/mockData";
import { loadClawList, saveClawList, notifyClawListChange } from "@/lib/openclawStore";
import { HeroBanner } from "@/components/agent/HeroBanner";
import { QuickStartGuide } from "@/components/agent/QuickStartGuide";
import { ViewModeSegmented } from "@/components/agent/ViewModeSegmented";
import { AgentCard } from "@/components/agent/AgentCard";
import { AgentAvatar } from "@/components/agent/AgentAvatar";

const DISABLED_TIP = "您的 OpenClaw 已被管理员停用，无法操作";
const LAUNCH_FAILED_TIP = "创建失败，无法操作";

// [006] 列表分页：每页默认 30 条，与后端 GET /openclaw/list 默认 page_size 保持一致
const PAGE_SIZE = 30;
const AGENT_NAME_MAX_BYTES = 128;

const getAgentNameByteLength = (value: string) => new TextEncoder().encode(value).length;

// 8 种状态配置
type OpenClawStatus = "creating" | "createFail" | "running" | "shutdown" | "loading" | "loadFail" | "maintaining" | "pending";
const RUNNING_ONLY_ACTION_STATUSES: OpenClawStatus[] = ["running"];
const RENAME_ALLOWED_STATUSES: OpenClawStatus[] = ["running", "shutdown"];
const canRunOnlyAction = (status: OpenClawStatus) => RUNNING_ONLY_ACTION_STATUSES.includes(status);
const canRenameStatus = (status: OpenClawStatus) => RENAME_ALLOWED_STATUSES.includes(status);


interface OpenClawItem {

  id: string;
  instanceId: string;
  name: string;
  status: OpenClawStatus;
  createdAt: string;
  model: string;
  modelVersion: string;
  channels: any[];
  skills: any[];
  op?: string; // 操作标记：restart, reinstall
  roleName?: string; // 角色名称
  memoryStatus?: 'none' | 'free' | 'pro'; // 记忆状态
  agentType?: "openclaw" | "hermes" | "lightclawace"; // Agent 类型
  groupId?: string;   // 所属分组 ID（多分组模式）
  groupName?: string; // 所属分组名称（多分组模式）
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

// ==================== 多分组模式类型与Mock数据 ====================
type UserGroupMode = "normal" | "multi-group";

interface UserGroup {
  id: string;
  name: string;         // 分组全称
  type: "department" | "custom"; // 部门 / 自定义分组
  isPrimary: boolean;   // 是否主部门
  depth: number;        // 层级深度
  permissions: {
    allowTerminal: boolean;
    allowChatView: boolean;
    agentTypes: ("openclaw" | "hermes" | "lightclawace")[];
    roles: string[];    // 可用角色列表
    panelAccess: "full" | "partial" | "limited"; // 详细配置面板访问级别
  };
}

// Alice 所属的 3 个分组
// 注：permissions.roles 的角色名必须与 MOCK_ROLES（lib/mockData.ts）中的 role.name 完全一致，
// 否则创建弹窗里的角色身份过滤 (selectedGroup.permissions.roles.includes(role.name)) 会全部 miss。
// MOCK_ROLES 当前 visible:true 的角色：行业分析师 / 开发工程师 / 设计师 / 项目经理 / 内容创作者。
// "通用助手" 是兜底选项，不通过 permissions.roles 控制（弹窗中始终展示）。
const MOCK_USER_GROUPS: UserGroup[] = [
  {
    id: "grp-fe",
    name: "A公司 / 技术部 / 前端组",
    type: "department",
    isPrimary: true,
    depth: 3,
    permissions: {
      allowTerminal: true,
      allowChatView: true,
      agentTypes: ["openclaw", "hermes", "lightclawace"],
      roles: ["行业分析师", "开发工程师", "设计师", "项目经理", "内容创作者"],
      panelAccess: "full",
    },
  },
  {
    id: "grp-ai",
    name: "A公司 / 技术部 / AI 组",
    type: "department",
    isPrimary: false,
    depth: 3,
    permissions: {
      allowTerminal: true,
      allowChatView: true,
      agentTypes: ["openclaw", "hermes", "lightclawace"],
      roles: ["行业分析师", "开发工程师", "项目经理"],
      panelAccess: "partial",
    },
  },
  {
    id: "grp-custom",
    name: "前端研发同学",
    type: "custom",
    isPrimary: false,
    depth: 1,
    permissions: {
      allowTerminal: false,
      allowChatView: false,
      agentTypes: ["openclaw"],
      roles: ["开发工程师", "设计师"],
      panelAccess: "limited",
    },
  },
];

// 获取默认选中的分组：优先选主部门，否则选层级最浅的
const getDefaultGroup = (groups: UserGroup[]): UserGroup => {
  const primary = groups.find(g => g.isPrimary);
  if (primary) return primary;
  return [...groups].sort((a, b) => a.depth - b.depth)[0];
};

// 状态视觉配置已迁移到 components/agent/StatusBadge.tsx，本页直接使用 AGENT_STATUS_DISABLED 判定禁用

export default function MyOpenClaw() {
  const [, navigate] = useLocation();
  const [claws, setClawsRaw] = useState<OpenClawItem[]>(() => loadClawList() as OpenClawItem[]);
  // 包装 setClaws，每次更新同步到 store
  const setClaws = (v: OpenClawItem[] | ((prev: OpenClawItem[]) => OpenClawItem[])) => {
    setClawsRaw((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      saveClawList(next);
      notifyClawListChange();
      return next;
    });
  };
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(true);

  // ===== 多分组模式 =====
  const [groupMode, setGroupMode] = useState<UserGroupMode>(() => {
    return (localStorage.getItem("openclaw_group_mode") as UserGroupMode) || "normal";
  });
  const handleGroupModeChange = (mode: UserGroupMode) => {
    setGroupMode(mode);
    localStorage.setItem("openclaw_group_mode", mode);
    // 通知同页面其他组件
    window.dispatchEvent(new StorageEvent("storage", { key: "openclaw_group_mode", newValue: mode }));
  };
  // 创建弹窗步骤（多分组模式下用）
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup>(() => getDefaultGroup(MOCK_USER_GROUPS));

  // 视图模式
  const [viewMode, setViewMode] = useState<"card" | "chat">(() => {
    return (localStorage.getItem("openclaw_view_mode") as "card" | "chat") || "chat";
  });
  const handleViewModeChange = (mode: "card" | "chat") => {
    setViewMode(mode);
    localStorage.setItem("openclaw_view_mode", mode);
  };

  // 全屏模式
  const [isFullscreen, setIsFullscreen] = useState(false);
  const handleToggleFullscreen = () => setIsFullscreen(prev => !prev);

  // Agent 类型
  const [agentType, setAgentType] = useState<"openclaw" | "hermes" | "lightclawace">("openclaw");
  const [typeExpanded, setTypeExpanded] = useState(false);

  // 角色选择
  const [roleExpanded, setRoleExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const visibleRoles = MOCK_ROLES.filter((r) => r.visible);



  // 通知相关
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // 确认弹窗
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; status: OpenClawStatus; memoryStatus?: 'none' | 'free' | 'pro' } | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [restartConfirm, setRestartConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reinstallConfirm, setReinstallConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reinstallConfirmInput, setReinstallConfirmInput] = useState("");
  const [renameConfirm, setRenameConfirm] = useState<{ id: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [removeRoleConfirm, setRemoveRoleConfirm] = useState<{ id: string; name: string; roleName: string } | null>(null);


  // 开启面板弹窗
  const [panelDialog, setPanelDialog] = useState<{ id: string; name: string } | null>(null);

  // 卡片视图 Agent 类型子 Tab
  const [activeAgentTab, setActiveAgentTab] = useState<"openclaw" | "hermes" | "lightclawace">("openclaw");

  // [006] 当前分页页码
  const [page, setPage] = useState(1);

  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  
  // 从管控端同步的开关
  const [allowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });

  // 自动轮询
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化通知（模拟）
  useEffect(() => {
    // Mock 通知消息：7 条删除相关通知
    const mockNotifications: Notification[] = [
      // 场景 1: 被管理员在腾讯云控制台删除
      { id: "notif-1", message: "「Noah的分析助手」已被删除", timestamp: "2026-03-26 10:30" },
      { id: "notif-2", message: "「Eve的编程助手」已被删除", timestamp: "2026-03-26 09:15" },
      { id: "notif-3", message: "「Leo的创意助手」已被删除", timestamp: "2026-03-26 08:45" },
      { id: "notif-4", message: "「Alice的工作助手」已被删除", timestamp: "2026-03-26 07:20" },
      // 场景 2: 被管理员在管控端删除
      { id: "notif-5", message: "「Bob的数据分析」已被管理员删除", timestamp: "2026-03-25 18:20" },
      { id: "notif-6", message: "「Carol的内容创作」已被管理员删除", timestamp: "2026-03-25 15:45" },
      { id: "notif-7", message: "「David的代码生成」已被管理员删除", timestamp: "2026-03-25 12:10" },
    ];
    setNotifications(mockNotifications);
    setHasUnread(true);
  }, []);

  // 自动轮询逻辑
  useEffect(() => {
    const startPolling = () => {
      pollingTimerRef.current = setInterval(() => {
        setClaws(prevClaws =>
          prevClaws.map(claw => {
            // creating -> running 或 createFail
            if (claw.status === "creating") {
              const rand = Math.random();
              return rand > 0.1 ? { ...claw, status: "running" } : { ...claw, status: "createFail" };
            }
            // loading -> running 或 loadFail
            if (claw.status === "loading") {
              const rand = Math.random();
              return rand > 0.1 ? { ...claw, status: "running" } : { ...claw, status: "loadFail" };
            }
            // maintaining -> running
            if (claw.status === "maintaining") {
              return { ...claw, status: "running" };
            }
            return claw;
          })
        );
      }, 3000); // 每 3 秒轮询一次
    };

    startPolling();
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const handleRefreshStatus = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (refreshingIds.has(id)) return;
    setRefreshingIds(prev => { const next = new Set(prev); next.add(id); return next; });
    setTimeout(() => {
      setRefreshingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      toast.success(`「${name}」状态已刷新`);
    }, 1500);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("请输入 OpenClaw 名称");
      return;
    }
    const ts = Date.now();
    const newClaw: OpenClawItem = {
      id: `oc-${ts}`,
      instanceId: `ins-${ts.toString(36).slice(-8)}`,
      name: newName.trim(),
      status: "creating",
      agentType: agentType,
      createdAt: new Date().toLocaleString("zh-CN"),
      model: "",
      modelVersion: "",
      channels: [],
      skills: [],
      roleName: selectedRole?.name ?? "通用助手",
      memoryStatus: 'none',
      groupId: groupMode === "multi-group" ? selectedGroup.id : "default",
      groupName: groupMode === "multi-group" ? selectedGroup.name : "默认",
    };
    setClaws([newClaw, ...claws]);
    setNewName("");
    setSelectedRole(null);
    setRoleExpanded(false);
    setShowCreate(false);
    setCreateStep(1);
    setPage(1); // [006] 创建后跳回第 1 页，展示刚创建的实例
    toast.success(`「${newClaw.name}」创建中...`);
  };

  const handleDelete = (id: string, name: string) => {
    setClaws(claws.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    setDeleteConfirmInput("");
    toast.success(`「${name}」已删除`);
  };

  const handleRemoveRole = (id: string, name: string) => {
    setClaws(claws.map((c) => c.id === id ? { ...c, roleName: "通用助手" } : c));
    setRemoveRoleConfirm(null);
    toast.success(`「${name}」已移除角色，回退为通用助手`);
  };

  const handleRestart = (id: string, name: string) => {
    setClaws(claws.map(c => c.id === id ? { ...c, status: "loading" as OpenClawStatus } : c));
    setRestartConfirm(null);
    toast.success(`「${name}」正在重启...`);
  };

  const handleReinstall = (id: string, name: string) => {
    setClaws(claws.map(c => c.id === id ? { ...c, status: "loading" as OpenClawStatus, op: "reinstall" } : c));
    setReinstallConfirm(null);
    setReinstallConfirmInput("");
    toast.success(`「${name}」正在重新安装...`);
  };

  const openRenameDialog = (claw: { id: string; name: string }) => {
    const target = claws.find((item) => item.id === claw.id);
    if (!target || !canRenameStatus(target.status)) return;
    setRenameConfirm(claw);
    setRenameInput(claw.name);
  };


  const handleRenameInputChange = (value: string) => {
    const noLineBreakValue = value.replace(/[\r\n]/g, "");
    setRenameInput(noLineBreakValue);
  };

  const renameTrimmedValue = renameInput.trim();
  const renameInputBytes = getAgentNameByteLength(renameInput);
  const isRenameOverByteLimit = renameInputBytes > AGENT_NAME_MAX_BYTES;
  const isRenameConfirmDisabled = renameTrimmedValue.length === 0 || isRenameOverByteLimit;

  const handleRenameConfirm = () => {
    if (!renameConfirm || isRenameConfirmDisabled) return;

    try {
      const targetExists = claws.some((claw) => claw.id === renameConfirm.id);
      if (!targetExists) {
        throw new Error("target-not-found");
      }

      setClaws(claws.map((claw) => {
        if (claw.id !== renameConfirm.id) return claw;
        return {
          ...claw,
          name: renameTrimmedValue,
        };
      }));

      setRenameConfirm(null);
      setRenameInput("");
    } catch {
      toast.error("重命名失败，请重试");
    }
  };

  const handleRetry = (id: string, name: string) => {

    setClaws(claws.map(c => c.id === id ? { ...c, status: "loading" as OpenClawStatus } : c));
    toast.success(`「${name}」正在重试...`);
  };

  const handleAddNotification = (message: string) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date().toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
    };
    setNotifications(prev => [notification, ...prev]);
    setHasUnread(true);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleOpenNotificationPanel = () => {
    setShowNotificationPanel(true);
    setHasUnread(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <TenantLayout>
        {/* SKILL §7.4 响应式：min-w-[1200px] 保最低可用宽度 / max-w-[1920px] 大屏限宽
            页面段落对齐（Figma 1077:33419）：所有主区块统一 padding-left/right = 120px，
            禁止段内再叠加 px-[42px]/w-20 双层缩进 */}
        <div className="min-w-[1200px]">
          <div className="max-w-[1920px] mx-auto page-enter">
            <div
              className="relative min-h-[calc(100vh-64px)]"
              style={{ paddingLeft: "120px", paddingRight: "120px", paddingTop: "20px", paddingBottom: "75px" }}
            >
          {/* Hero Banner - Figma 358:2325 / 363:5079
              QuickStart 关闭后传入 onShowQuickStart 回调，副文右侧会出现「查看步骤指引」按钮 */}
          <HeroBanner
            onShowQuickStart={
              !showQuickStart ? () => setShowQuickStart(true) : undefined
            }
          />

          {/* Quick Start Guide - Figma 358:2341 */}
          {showQuickStart && (
            <QuickStartGuide onClose={() => setShowQuickStart(false)} />
          )}

          {/* Section Header - 标题 + 视图切换（左） + 分组模式 + 创建按钮（右），合并为一行
              QuickStart 展开时，由 QuickStartGuide 自带的 mb-5 提供与 hero 之间的段间距；
              QuickStart 关闭时，QuickStartGuide 不渲染，需在此补 mt-5 让 hero 与 section 之间保持一致段间距 */}
          <div className={`flex items-center justify-between mb-4 ${!showQuickStart ? "mt-5" : ""}`}>
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] leading-[26px] font-medium text-foreground">
                我的 Agent
                <span className="text-muted-foreground font-normal">（{claws.length}）</span>
              </h2>
              {/* 视图切换：管理视图 / 对话视图 */}
              <ViewModeSegmented value={viewMode} onChange={handleViewModeChange} />
            </div>
            {/* TextSwitch 与按钮之间 32px 间距（Figma 1077:33979 layout_JMOUG3 gap=32） */}
            <div className="flex items-center gap-8">
              {/* 文字切换器：普通 / 多分组（Figma 1077:33980 文字版，弱切换语义） */}
              <TextSwitch className="hidden md:inline-flex">
                <TextSwitchOption
                  active={groupMode === "normal"}
                  onClick={() => handleGroupModeChange("normal")}
                  title="切换到普通用户模式"
                >
                  普通
                </TextSwitchOption>
                <TextSwitchOption
                  active={groupMode === "multi-group"}
                  onClick={() => handleGroupModeChange("multi-group")}
                  title="切换到多分组用户模式"
                >
                  多分组
                </TextSwitchOption>
              </TextSwitch>
              {/* 创建 Agent 按钮：Figma 1077:33984，黑→蓝渐变 + h-10 + px-18 + icon-text gap 8 */}
              <Button
                onClick={() => {
                  if (groupMode === "multi-group") {
                    setCreateStep(1);
                    setSelectedGroup(getDefaultGroup(MOCK_USER_GROUPS));
                  }
                  setShowCreate(true);
                }}
                variant="tenant-primary"
                size="claw-lg"
              >
                <Plus className="w-4 h-4" />
                创建 Agent
              </Button>
            </div>
          </div>

          {/* Content Area - 段落左右内边距由父级 120px 统一控制，本层不再额外缩进 */}
          <div className="relative pb-8">
            {/* Main Content */}
              {viewMode === "chat" ? (
                /* 新版对话卡片视图：Figma 1003:22598 还原稿（AgentChat）。
                 * 注：视觉先替换到位，原 ChatView 的业务逻辑（claws / 状态机 / resize / 权限）
                 * 后续按需接入 AgentChat。 */
                <AgentChat embedded />
              ) : (() => {
                const allClaws = claws;
                // [006] 分页切片：先按创建时间倒序，再按当前页切出 30 条
                const sortedClaws = [...allClaws].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                const totalPages = Math.max(1, Math.ceil(sortedClaws.length / PAGE_SIZE));
                const safePage = Math.min(page, totalPages);
                const paginatedClaws = sortedClaws.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
                return (
                  <div>
                    {/* 单页展示所有实例（不按 agent 类型分 Tab） */}
                    {allClaws.length === 0 ? (
                      <div className="text-center py-24">
                        <Bot className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">暂无实例</p>
                        <Button onClick={() => setShowCreate(true)} variant="tenant-outline">
                          <Plus className="w-4 h-4 mr-1.5" />
                          创建 Agent
                        </Button>
                      </div>
                    ) : (
                      <>
                      {/* Figma 446:2990/446:2994 - 卡片三列布局，gap 20px */}
                      <div className="grid grid-cols-3 gap-5">
                        {paginatedClaws.map((claw) => (
                          <AgentCard
                            key={claw.id}
                            claw={claw}
                            onClickCard={(c) => navigate(`/openclaw/${c.id}`)}
                            onRefresh={(e, id, name) => handleRefreshStatus(e, id, name)}
                            onRestart={(c) => setRestartConfirm({ id: c.id, name: c.name })}
                            onReinstall={(c) => setReinstallConfirm({ id: c.id, name: c.name })}
                            onDelete={(c) => {
                              setDeleteConfirm({
                                id: c.id,
                                name: c.name,
                                status: c.status,
                                memoryStatus: c.memoryStatus,
                              });
                              setDeleteConfirmInput("");
                            }}
                            onRemoveRole={(c) =>
                              setRemoveRoleConfirm({ id: c.id, name: c.name, roleName: c.roleName! })
                            }
                            onRetry={(id, name) => handleRetry(id, name)}
                            onChat={() => setViewMode("chat")}
                            canOpenTerminal={(c) => {
                              const clawGroup =
                                MOCK_USER_GROUPS.find((g) => g.id === (c.groupId || "grp-fe")) ||
                                null;
                              return groupMode === "multi-group" && clawGroup
                                ? clawGroup.permissions.allowTerminal
                                : allowTerminal;
                            }}
                            refreshing={refreshingIds.has(claw.id)}
                            groupMode={groupMode}
                          />
                        ))}
                    </div>
                    {/* [006] 分页控件 */}
                    {totalPages > 1 && (
                    <div className="relative mt-6 px-6 py-3">
                      <Pagination
                        total={sortedClaws.length}
                        current={safePage}
                        pageSize={PAGE_SIZE}
                        showTotal={(total) => `共 ${total} 个实例`}
                        className="w-full justify-between"
                        onChange={(p) => setPage(p)}
                      />
                    </div>
                    )}
                    </>
                  )}
                  </div>
                );
              })()}
          </div>

            {/* /内容区（120px padding）闭合 */}
          </div>
          </div>
        </div>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="fixed inset-0 z-50" onClick={() => setShowNotificationPanel(false)}>
            <div className="absolute right-6 top-[150px] w-80 bg-card rounded-[8px] shadow-lg border border-border z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Header - Fixed */}
              <div className="p-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-xs">消息通知</h3>
                  <button
                    onClick={() => handleClearAllNotifications()}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    全部删除
                  </button>
                </div>
              </div>

              {/* Notifications List - Scrollable */}
              <div className="overflow-y-auto" style={{
                maxHeight: notifications.length > 5 ? 'calc(5 * 60px)' : 'auto',
                scrollbarWidth: 'thin',
                paddingRight: '4px'
              }}>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">暂无消息</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-muted/50 transition-colors" style={{minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-foreground/80 flex-1 line-clamp-2">{notif.message}</p>
                          <button
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1" style={{fontSize: '11px'}}>{notif.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rename Dialog */}
        <Dialog
          open={!!renameConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setRenameConfirm(null);
              setRenameInput("");
            }
          }}
        >
          <DialogContent
            className="sm:max-w-[420px]"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">重命名 Agent</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                支持中英文、数字、空格及常用符号。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rename-agent-input" className="text-sm font-medium text-gray-700">名称</Label>
              <Input
                id="rename-agent-input"
                value={renameInput}
                placeholder="请输入 Agent 名称"
                aria-invalid={isRenameOverByteLimit}
                className={isRenameOverByteLimit ? "border-red-500 focus-visible:ring-red-500" : undefined}
                onChange={(e) => handleRenameInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRenameConfirm();
                  }
                }}
              />
              <p
                className={`text-xs min-h-5 ${isRenameOverByteLimit ? "text-red-500" : "text-transparent"}`}
                aria-live="polite"
              >
                {isRenameOverByteLimit ? "名称不能超过 128 字节" : ""}
              </p>

            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRenameConfirm(null);
                  setRenameInput("");
                }}
              >
                取消
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                disabled={isRenameConfirmDisabled}
                onClick={handleRenameConfirm}
              >
                确认
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restart Confirm Dialog */}
        <Dialog open={!!restartConfirm} onOpenChange={(open) => { if (!open) setRestartConfirm(null); }}>

          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">确认重启</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground leading-relaxed">
              重启后该 OpenClaw「{restartConfirm?.name}」将短暂不可用，期间 IM 消息无法回复，确认重启吗？
            </p>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="tenant-outline" onClick={() => setRestartConfirm(null)}>取消</Button>
              <Button
                variant="tenant-destructive"
                onClick={() => handleRestart(restartConfirm!.id, restartConfirm!.name)}
              >
                确认重启
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reinstall Confirm Dialog */}
        <Dialog open={!!reinstallConfirm} onOpenChange={(open) => { if (!open) setReinstallConfirm(null); }}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">确认重新安装</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground leading-relaxed">
              将使用最新镜像重新安装「{reinstallConfirm?.name}」，清除当前所有配置且无法恢复，安装完成后需重新配置模型和通道。
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">请输入「重装」以确认</label>
              <Input
                tenant
                placeholder="输入「重装」"
                value={reinstallConfirmInput}
                onChange={(e) => setReinstallConfirmInput(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="tenant-outline" onClick={() => setReinstallConfirm(null)}>取消</Button>
              <Button
                variant="tenant-destructive"
                disabled={reinstallConfirmInput !== "重装"}
                onClick={() => handleReinstall(reinstallConfirm!.id, reinstallConfirm!.name)}
              >
                确认重新安装
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                {deleteConfirm?.status === "createFail" ? "删除记录" : "确认删除"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {deleteConfirm?.status === "createFail"
                ? `此操作将移除「${deleteConfirm?.name}」该创建失败的记录，底层资源将由系统自动回收。`
                : `此操作不可撤销。「${deleteConfirm?.name}」实例及相关数据将被永久删除，已配置的模型、通道和插件将全部清除且无法恢复。`}
            </p>
            {/* 记忆数据清理提示 - 仅当该 OpenClaw 开启了记忆功能时显示 */}
            {deleteConfirm?.status !== "createFail" && deleteConfirm?.memoryStatus && deleteConfirm.memoryStatus !== 'none' && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-[4px] px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  该 OpenClaw 已开启 Memory {deleteConfirm.memoryStatus === 'pro' ? 'Pro' : 'Free'}，相关记忆数据也将被一并清理。
                </p>
              </div>
            )}
            {deleteConfirm?.status === "running" && (
              <div>
                <label className="text-sm font-medium text-foreground">请输入「删除」以确认</label>
                <Input
                  tenant
                  placeholder="输入「删除」"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button variant="tenant-outline" onClick={() => setDeleteConfirm(null)}>取消</Button>
              <Button
                variant="tenant-destructive"
                disabled={deleteConfirm?.status === "running" && deleteConfirmInput !== "删除"}
                onClick={() => handleDelete(deleteConfirm!.id, deleteConfirm!.name)}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Role Confirm Dialog */}
        <Dialog open={!!removeRoleConfirm} onOpenChange={(open) => { if (!open) setRemoveRoleConfirm(null); }}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">移除角色</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground leading-relaxed">
              确定要移除「{removeRoleConfirm?.name}」的角色「{removeRoleConfirm?.roleName}」吗？
            </p>
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-[4px] px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-primary leading-relaxed">
                移除角色不会删除已有的技能配置，Agent 将回退为「通用助手」。
              </p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="tenant-outline" onClick={() => setRemoveRoleConfirm(null)}>取消</Button>
              <Button
                variant="tenant-destructive"
                onClick={() => handleRemoveRole(removeRoleConfirm!.id, removeRoleConfirm!.name)}
              >
                确认移除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Panel Dialog - 开启面板 */}
        <Dialog open={!!panelDialog} onOpenChange={(open) => { if (!open) setPanelDialog(null); }}>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">开启面板</DialogTitle>
            </DialogHeader>
            {/* 安全警告 */}
            <div className="bg-orange-50 border border-orange-100 rounded-[4px] px-4 py-3">
              <p className="text-sm font-semibold text-orange-600 leading-relaxed">
                访问链接已生成，该链接含有您的 API Key 和加密配置，请勿分享给第三方，以防隐私泄露或资产损失。
              </p>
            </div>
            {/* 信息行 */}
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 shrink-0">WebSocket URL</span>
                <span className="flex-1 text-sm text-foreground font-mono truncate">
                  http://43.139.137.45:38341/knmnz8?token=8512b8ef...
                </span>
                <button
                  className="p-1.5 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { navigator.clipboard.writeText("http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"); toast.success("已复制"); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 shrink-0">网关令牌</span>
                <span className="flex-1 text-sm text-foreground font-mono truncate">
                  8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb
                </span>
                <button
                  className="p-1.5 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { navigator.clipboard.writeText("8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"); toast.success("已复制"); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* 说明文字 */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              用浏览器打开 WebSocket URL，如面板需要填入网关令牌，则将网关令牌复制并粘贴过去，即可进入面板。
            </p>
            <DialogFooter>
              <Button
                variant="tenant-primary"
                className="w-full"
                onClick={() => { window.open("http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb", "_blank"); }}
              >
                立即访问
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog —— 单弹窗：分组 / 名称 / 类型 / 角色（角色介绍内联展示） */}
        <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) { setTypeExpanded(false); setRoleExpanded(false); setSelectedRole(null); setAgentType("openclaw"); setCreateStep(1); } }}>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>
                创建 Agent
              </DialogTitle>
              <DialogDescription className="sr-only">
                创建 Agent：选择所属分组、填写名称、选择类型与角色身份
              </DialogDescription>
            </DialogHeader>

            {/* ===== 单步表单：所属分组 + 名称 + 类型 + 角色（含介绍卡） ===== */}
            <div className="py-2 space-y-5">
              {/* 所属分组下拉框（仅多分组模式显示） */}
              {groupMode === "multi-group" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">所属分组</Label>
                  <p className="text-xs text-muted-foreground">
                    您属于多个分组，不同分组对应不同的 Agent 配置和权限，请确认要使用的分组
                  </p>
                  <Select
                    value={selectedGroup.id}
                    onValueChange={(value) => {
                      const group = MOCK_USER_GROUPS.find(g => g.id === value);
                      if (group) {
                        setSelectedGroup(group);
                        // 重置 agent 类型为该分组允许的第一个（如果当前类型不被允许）
                        if (!group.permissions.agentTypes.includes(agentType)) {
                          setAgentType(group.permissions.agentTypes[0]);
                        }
                        // 重置角色（如果当前角色不被新分组允许）
                        if (selectedRole && !group.permissions.roles.includes(selectedRole.name)) {
                          setSelectedRole(null);
                        }
                      }
                    }}
                  >
                    <SelectTrigger tenant className="w-full">
                      <SelectValue placeholder="选择所属分组" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USER_GROUPS.map((group) => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="claw-name" className="text-sm font-medium text-foreground">
                  Agent 名称
                </Label>
                <Input
                  tenant
                  id="claw-name"
                  placeholder="请输入文本内容"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
              </div>

              {/* Agent Type —— 始终内联展示 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Agent 类型</Label>
                <RadioGroup
                  value={agentType}
                  onValueChange={(value) => {
                    setAgentType(value as "openclaw" | "hermes" | "lightclawace");
                    if (value !== "openclaw") {
                      setSelectedRole(null);
                    }
                  }}
                  className="flex flex-wrap gap-2"
                >
                  {([["openclaw", "OpenClaw"], ["hermes", "Hermes Agent"], ["lightclawace", "Lightclaw ACE"]] as const)
                    .filter(([value]) => groupMode !== "multi-group" || selectedGroup.permissions.agentTypes.includes(value))
                    .map(([value, label]) => (
                      <div key={value} className="flex items-center">
                        <RadioGroupItem value={value} id={`agent-type-${value}`} className="peer sr-only" />
                        <Label
                          htmlFor={`agent-type-${value}`}
                          className="flex items-center justify-center h-6 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-[#020617] hover:bg-[#F5F5F5] hover:border-[#E3E3E3] hover:text-[#020617] cursor-pointer peer-data-[state=checked]:bg-[#020617] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-[#020617] peer-data-[state=checked]:hover:bg-[#020617] peer-data-[state=checked]:hover:text-white transition-colors"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>

              {/* Role Selection —— 始终内联展示 + 选中后展示介绍卡 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">角色身份</Label>
                <RadioGroup
                  value={selectedRole?.id ?? "__general__"}
                  onValueChange={(value) => {
                    if (value === "__general__") {
                      setSelectedRole(null);
                      return;
                    }
                    const role = visibleRoles.find((r) => r.id === value);
                    setSelectedRole(role ?? null);
                  }}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="__general__" id="role-general" className="peer sr-only" />
                    <Label
                      htmlFor="role-general"
                      className="flex items-center justify-center whitespace-nowrap h-6 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-[#020617] hover:bg-[#F5F5F5] hover:border-[#E3E3E3] hover:text-[#020617] cursor-pointer peer-data-[state=checked]:bg-[#020617] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-[#020617] peer-data-[state=checked]:hover:bg-[#020617] peer-data-[state=checked]:hover:text-white transition-colors"
                    >
                      通用助手
                    </Label>
                  </div>
                  {visibleRoles
                    .filter((role) => groupMode !== "multi-group" || selectedGroup.permissions.roles.includes(role.name))
                    .map((role) => (
                      <div key={role.id} className="flex items-center">
                        <RadioGroupItem value={role.id} id={`role-${role.id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="flex items-center justify-center whitespace-nowrap h-6 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-[#020617] hover:bg-[#F5F5F5] hover:border-[#E3E3E3] hover:text-[#020617] cursor-pointer peer-data-[state=checked]:bg-[#020617] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-[#020617] peer-data-[state=checked]:hover:bg-[#020617] peer-data-[state=checked]:hover:text-white transition-colors"
                        >
                          {role.name}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>

                {/* Role Detail —— 选中具体角色后展示介绍卡片；未选（通用助手）展示通用介绍 */}
                {(() => {
                  // 通用助手兜底文案（与具体角色介绍卡复用同一视觉容器）
                  const generalIntro = {
                    name: "通用助手",
                    skills: "web-search、file-reader、code-runner",
                    soul: "无固定行业偏好的通用 AI 伙伴，擅长日常问答、信息检索与轻量创作，按需切换专业度",
                  };
                  const display = selectedRole
                    ? {
                        name: selectedRole.name,
                        skills: selectedRole.skills.map((s) => s.name).join("、"),
                        soul: selectedRole.soul,
                      }
                    : generalIntro;

                  return (
                    <SurfaceInner className="mt-3 overflow-hidden bg-[#FAFAFA] relative rounded-[12px]">
                      <div className="p-4 space-y-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <AgentAvatar
                            roleName={display.name}
                            size={28}
                          />
                          <p className="text-sm font-semibold text-[#0A0A0A]">
                            {display.name}角色介绍
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-[#0A0A0A]">
                            角色技能
                          </p>
                          <p className="text-xs text-[#334155] leading-relaxed">
                            {display.skills}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-[#0A0A0A]">
                            角色风格
                          </p>
                          <p className="text-xs text-[#334155] leading-relaxed">
                            {display.soul}
                          </p>
                        </div>
                      </div>
                    </SurfaceInner>
                  );
                })()}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="tenant-outline"
                onClick={() => setShowCreate(false)}
              >
                取消
              </Button>
              <Button
                variant="tenant-dialog-confirm"
                onClick={handleCreate}
              >
                确认创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CSS for animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 1; }
          }
        `}</style>
      </TenantLayout>
    </TooltipProvider>
  );
}
