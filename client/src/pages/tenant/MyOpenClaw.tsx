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
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus, MoreVertical, Settings, RefreshCw, HardDriveDownload, Trash2,
  Zap, Bot, X, RotateCcw, Terminal, Bell, AlertCircle, ChevronDown, ChevronUp, UserMinus,
  LayoutGrid, MessageSquare, Monitor, Copy, Users, Check, ArrowRight, ArrowLeft, Pencil,

  ChevronLeft, ChevronRight,
} from "lucide-react";
import ChatView from "./ChatView";
import { MOCK_ROLES } from "@/lib/mockData";
import type { Role } from "@/lib/mockData";
import { loadClawList, saveClawList, notifyClawListChange } from "@/lib/openclawStore";

const DISABLED_TIP = "您的 OpenClaw 已被管理员停用，无法操作";
const LAUNCH_FAILED_TIP = "创建失败，无法操作";

// [006] 列表分页：每页默认 30 条，与后端 GET /openclaw/list 默认 page_size 保持一致
const PAGE_SIZE = 30;
const RENAME_NAME_MAX_LENGTH = 30;


// 8 种状态配置
type OpenClawStatus = "creating" | "createFail" | "running" | "shutdown" | "loading" | "loadFail" | "maintaining" | "pending";

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
      roles: ["通用助手", "客服助手", "技术顾问", "运营助手", "数据分析师", "产品经理", "文案创作"],
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
      roles: ["通用助手", "技术顾问", "数据分析师"],
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
      roles: ["通用助手", "客服助手"],
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

const STATUS_CONFIG: Record<OpenClawStatus, {
  label: string;
  dotColor?: string;
  bgColor: string;
  textColor: string;
  tooltipText?: string;
  isDisabled: boolean;
  isGrayAvatar: boolean;
}> = {
  creating: {
    label: "创建中",
    dotColor: "#007AFF",
    bgColor: "rgba(0,122,255,0.10)",
    textColor: "#0055cc",
    tooltipText: "正在创建中，请稍候",
    isDisabled: true,
    isGrayAvatar: false,
  },
  createFail: {
    label: "创建失败",
    dotColor: "#FF3B30",
    bgColor: "rgba(255,59,48,0.10)",
    textColor: "#c0392b",
    tooltipText: "创建失败，可删除后重新创建",
    isDisabled: true,
    isGrayAvatar: true,
  },
  running: {
    label: "运行中",
    dotColor: "#34C759",
    bgColor: "rgba(52,199,89,0.12)",
    textColor: "#1a8c3a",
    isDisabled: false,
    isGrayAvatar: false,
  },
  shutdown: {
    label: "已关机",
    dotColor: "#9CA3AF",
    bgColor: "rgba(156,163,175,0.15)",
    textColor: "#4b5563",
    tooltipText: "已关机，如需恢复请联系管理员",
    isDisabled: true,
    isGrayAvatar: true,
  },
  loading: {
    label: "加载中",
    dotColor: "#007AFF",
    bgColor: "rgba(0,122,255,0.10)",
    textColor: "#0055cc",
    tooltipText: "加载中，请稍候",
    isDisabled: true,
    isGrayAvatar: false,
  },
  loadFail: {
    label: "加载失败",
    dotColor: "#FF3B30",
    bgColor: "rgba(255,59,48,0.10)",
    textColor: "#c0392b",
    tooltipText: "加载失败，可点击重试恢复",
    isDisabled: true,
    isGrayAvatar: true,
  },
  maintaining: {
    label: "维护中",
    dotColor: "#FF9500",
    bgColor: "rgba(255,149,0,0.10)",
    textColor: "#b8640a",
    tooltipText: "维护中，请稍候",
    isDisabled: true,
    isGrayAvatar: false,
  },
  pending: {
    label: "待处理",
    dotColor: "#FF3B30",
    bgColor: "rgba(255,59,48,0.10)",
    textColor: "#c0392b",
    tooltipText: "已停用，请联系管理员处理",
    isDisabled: true,
    isGrayAvatar: true,
  },
};

// 状态点组件
const StatusDot = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_CONFIG[status];
  
  if (status === "loading") {
    // 旋转 spinner
    return (
      <span
        className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 animate-spin"
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: `${cfg.dotColor} transparent transparent transparent`,
          width: "6px",
          height: "6px",
          borderRadius: "50%",
        }}
      />
    );
  }

  if (status === "creating") {
    // 蓝色呼吸闪烁
    return (
      <span
        className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
        style={{
          background: cfg.dotColor,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    );
  }

  // 其他状态：静态实心点
  return (
    <span
      className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
      style={{ background: cfg.dotColor }}
    />
  );
};

const StatusBadge = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_CONFIG[status];
  const tooltipText = cfg.tooltipText;

  const badge = (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
      style={{ background: cfg.bgColor, color: cfg.textColor }}
    >
      <StatusDot status={status} />
      {cfg.label}
    </span>
  );

  if (tooltipText && status !== "running") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{badge}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
};

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
  const [removeRoleConfirm, setRemoveRoleConfirm] = useState<{ id: string; name: string; roleName: string } | null>(null);

  // 开启面板弹窗
  const [panelDialog, setPanelDialog] = useState<{ id: string; name: string } | null>(null);

  // 重命名弹窗
  const [renameDialog, setRenameDialog] = useState<{ id: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [showRenameFail, setShowRenameFail] = useState(false);

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

  const handleRetry = (id: string, name: string) => {
    setClaws(claws.map(c => c.id === id ? { ...c, status: "loading" as OpenClawStatus } : c));
    toast.success(`「${name}」正在重试...`);
  };

  const handleRenameById = (id: string, name: string) => {
    setClaws((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleOpenRename = (id: string, name: string) => {

    setRenameDialog({ id, name });
    setRenameInput(name);
  };

  const handleConfirmRename = () => {
    if (!renameDialog) return;
    const trimmedName = renameInput.trim();
    if (!trimmedName) return;

    try {
      setClaws((prev) => prev.map((c) => (c.id === renameDialog.id ? { ...c, name: trimmedName } : c)));
      setRenameDialog(null);
      setRenameInput("");
      toast.success("重命名成功");
    } catch (error) {
      console.error("rename openclaw failed", error);
      setShowRenameFail(true);
    }
  };

  const handleCancelRename = () => {
    setRenameDialog(null);
    setRenameInput("");
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
        <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
          {/* Quick Start Guide */}
          {showQuickStart && (
            <div className="mb-8 rounded-2xl p-6 border border-blue-100 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.04), rgba(88,86,214,0.04))" }}>
              <div className="absolute top-0 right-0 w-48 h-48 orb-blue opacity-30 pointer-events-none" />
              <div className="relative z-10">
                <button
                  onClick={() => setShowQuickStart(false)}
                  className="absolute top-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-20"
                  aria-label="关闭快速上手"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">快速上手</h3>
                </div>
                <div className="flex items-start gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">创建 Agent</p>
                      <p className="text-xs text-gray-500 mt-0.5">点击「创建 Agent」，为你的 Agent 取一个名字</p>
                    </div>
                  </div>
                  <div className="w-6 h-px bg-blue-200 mt-3.5 flex-shrink-0" />
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">配置模型</p>
                      <p className="text-xs text-gray-500 mt-0.5">进入「详细配置」，配置一个可用的 AI 模型</p>
                    </div>
                  </div>
                  <div className="w-6 h-px bg-blue-200 mt-3.5 flex-shrink-0" />
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">浏览器对话</p>
                      <p className="text-xs text-gray-500 mt-0.5">配置完成，即可在下方对话视图直接与 Agent 对话</p>
                    </div>
                  </div>
                  <div className="w-6 h-px bg-gray-200 mt-3.5 flex-shrink-0" />
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">+</div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">连接聊天软件<span className="text-[10px] font-normal text-gray-400 ml-1">可选</span></p>
                      <p className="text-xs text-gray-400 mt-0.5">在「详细配置」中开启通道，还可以通过企微/微信/飞书等与 OpenClaw 对话</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的 Agent</h1>
              <p className="text-sm text-gray-500 mt-1">管理你的 AI 智能助理</p>
            </div>
            <div className="flex items-center gap-3">
              {/* 模式切换 Segmented Control */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => handleGroupModeChange("normal")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    groupMode === "normal"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  普通用户
                </button>
                <button
                  onClick={() => handleGroupModeChange("multi-group")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1 ${
                    groupMode === "multi-group"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  多分组用户
                </button>
              </div>
              <Button
                onClick={() => {
                  if (groupMode === "multi-group") {
                    setCreateStep(1);
                    setSelectedGroup(getDefaultGroup(MOCK_USER_GROUPS));
                  }
                  setShowCreate(true);
                }}
                className="text-white btn-primary-glow"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                创建 Agent
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">
            {/* Floating Bookmark Tabs - positioned outside content area */}
            <div className="absolute flex flex-col gap-1 p-1 rounded-lg bg-white border border-gray-200"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", right: "calc(100% + 12px)", top: 0 }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleViewModeChange("card")}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 ${
                      viewMode === "card"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">管理视图</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleViewModeChange("chat")}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 ${
                      viewMode === "chat"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">对话视图</TooltipContent>
              </Tooltip>
            </div>

            {/* Main Content */}
              {viewMode === "chat" ? (
                <ChatView
                  claws={claws}
                  onDeleteConfirm={(claw) => { setDeleteConfirm({ id: claw.id, name: claw.name, status: claw.status }); setDeleteConfirmInput(""); }}
                  onRestartConfirm={(claw) => setRestartConfirm(claw)}
                  onReinstallConfirm={(claw) => setReinstallConfirm(claw)}
                  onRemoveRoleConfirm={(claw) => setRemoveRoleConfirm(claw)}
                  onRename={handleRenameById}
                  onRetry={handleRetry}
                  allowTerminal={allowTerminal}

                  refreshingIds={refreshingIds}
                  onRefreshStatus={handleRefreshStatus}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                  groupMode={groupMode}
                  getClawGroupPermissions={(claw) => {
                    if (groupMode !== "multi-group") return null;
                    // 没有 groupId 的 Agent 默认归属前端组（主部门）
                    const groupId = claw.groupId || "grp-fe";
                    const group = MOCK_USER_GROUPS.find(g => g.id === groupId);
                    if (!group) return null;
                    return {
                      allowTerminal: group.permissions.allowTerminal,
                      allowChatView: group.permissions.allowChatView,
                      panelAccess: group.permissions.panelAccess,
                    };
                  }}
                />
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
                        <Bot className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">暂无实例</p>
                        <Button onClick={() => setShowCreate(true)} variant="outline">
                          <Plus className="w-4 h-4 mr-1.5" />
                          创建 Agent
                        </Button>
                      </div>
                    ) : (
                      <>
                      <div className="grid grid-cols-3 gap-4">
              {paginatedClaws.map((claw) => {
                const cfg = STATUS_CONFIG[claw.status as OpenClawStatus];
                const isDisabled = cfg.isDisabled;
                const isGrayAvatar = cfg.isGrayAvatar;
                const isLoadFail = claw.status === "loadFail";
                const isNonOpenclaw = claw.agentType === "hermes" || claw.agentType === "lightclawace";

                return (
                  <div key={claw.id}
                    className={`bg-white rounded-2xl border border-gray-100 transition-all duration-200 group relative ${!isDisabled ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"}`}
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
                    onClick={() => { if (!isDisabled) navigate(`/openclaw/${claw.id}`); }}
                  >
                    {/* Agent Type Tag - 左上角融合卡片内 */}
                    <span
                      className={`absolute top-0 left-0 z-10 text-[10px] font-semibold px-3 py-1 whitespace-nowrap ${isGrayAvatar ? "opacity-40" : ""}`}
                      style={{
                        background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))",
                        color: "rgba(0,122,255,0.5)",
                        borderTopLeftRadius: "1rem",
                        borderBottomRightRadius: "0.75rem",
                        boxShadow: "none"
                      }}
                    >
                      {claw.agentType === "hermes" ? "Hermes Agent" : claw.agentType === "lightclawace" ? "Lightclaw ACE" : "OpenClaw"}
                    </span>
                    {/* Card Header */}
                    <div className="p-5 pt-8">
                      <div className="flex items-start justify-between mb-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-opacity ${isGrayAvatar ? "opacity-40" : ""}`}
                            style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))" }}>
                            <img src="/lobster_web_200.png" alt="Agent" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-nowrap">
                          <StatusBadge status={claw.status} />
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            onClick={(e) => handleRefreshStatus(e, claw.id, claw.name)}
                            title="刷新状态"
                          >
                            <RefreshCw className={`w-4 h-4 transition-transform ${refreshingIds.has(claw.id) ? 'animate-spin' : ''}`} />
                          </button>
                          {/* Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              {/* Restart */}
                              {claw.status === "running" ? (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRestartConfirm({ id: claw.id, name: claw.name }); }}>
                                  <RotateCcw className="w-4 h-4 mr-2 text-gray-500" />
                                  重启
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                  <RotateCcw className="w-4 h-4 mr-2 text-gray-400" />
                                  重启
                                </DropdownMenuItem>
                              )}

                              {/* Reinstall */}
                              {claw.status === "running" ? (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReinstallConfirm({ id: claw.id, name: claw.name }); }}>
                                  <HardDriveDownload className="w-4 h-4 mr-2 text-gray-500" />
                                  {isNonOpenclaw ? "重新安装 Agent" : "重新安装 OpenClaw"}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                  <HardDriveDownload className="w-4 h-4 mr-2 text-gray-400" />
                                  {isNonOpenclaw ? "重新安装 Agent" : "重新安装 OpenClaw"}
                                </DropdownMenuItem>
                              )}

                              {/* Terminal */}
                              {(() => {
                                const clawGroup = MOCK_USER_GROUPS.find(g => g.id === (claw.groupId || "grp-fe")) || null;
                                const canTerminal = groupMode === "multi-group" && clawGroup
                                  ? clawGroup.permissions.allowTerminal
                                  : allowTerminal;
                                if (!canTerminal) return null;
                                return claw.status === "running" ? (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/terminal/${claw.id}`, "_blank"); }}>
                                    <Terminal className="w-4 h-4 mr-2 text-gray-500" />
                                    进入终端
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                    <Terminal className="w-4 h-4 mr-2 text-gray-400" />
                                    进入终端
                                  </DropdownMenuItem>
                                );
                              })()}

                              {/* Remove Role */}
                              {claw.roleName && claw.roleName !== "通用助手" && claw.status === "running" ? (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRemoveRoleConfirm({ id: claw.id, name: claw.name, roleName: claw.roleName! }); }}>
                                  <UserMinus className="w-4 h-4 mr-2 text-gray-500" />
                                  移除角色
                                </DropdownMenuItem>
                              ) : null}

                              {claw.status === "running" || claw.status === "shutdown" ? (

                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenRename(claw.id, claw.name);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-2 text-gray-500" />
                                  重命名
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                  <Pencil className="w-4 h-4 mr-2 text-gray-400" />
                                  重命名
                                </DropdownMenuItem>
                              )}




                              <DropdownMenuSeparator />


                              {/* Delete */}
                              {["creating", "loading", "pending"].includes(claw.status) ? (
                                <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: claw.id, name: claw.name, status: claw.status }); setDeleteConfirmInput(""); }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Name and Info */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className={`font-semibold text-base mb-0.5 transition-colors truncate ${isGrayAvatar ? "text-gray-400" : "text-gray-900 group-hover:text-blue-600"}`}>
                            {claw.name}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[280px] break-all">
                          {claw.name}
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        {claw.roleName && (
                          <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.08), rgba(88,86,214,0.05))", color: "#5c6b7a", border: "1px solid rgba(0,122,255,0.1)" }}>
                            {claw.roleName}
                          </span>
                        )}
                        <p className={`text-xs transition-colors truncate ${isGrayAvatar ? "text-gray-400" : "text-gray-400"}`}>{claw.instanceId}</p>
                      </div>
                      {/* 分组信息 - 始终显示 */}
                      <p className={`text-xs transition-colors ${isGrayAvatar ? "text-gray-400" : "text-gray-400"}`}>
                        分组：{groupMode === "multi-group" ? (claw.groupName || "A公司 / 技术部 / 前端组") : "默认"}
                      </p>
                      <p className={`text-xs transition-colors ${isGrayAvatar ? "text-gray-400" : "text-gray-400"}`}>创建于 {claw.createdAt}</p>
                    </div>

                    {/* Card Actions */}
                    <div className="px-5 pb-4 border-t border-gray-50 pt-3">
                      {isLoadFail ? (
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleRetry(claw.id, claw.name); }}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          重试
                        </Button>
                      ) : isDisabled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs opacity-40 cursor-not-allowed"
                          disabled
                        >
                          <Settings className="w-3.5 h-3.5 mr-1.5" />
                          详细配置
                        </Button>
                      ) : (
                        <Link href={`/openclaw/${claw.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            <Settings className="w-3.5 h-3.5 mr-1.5" />
                            详细配置
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
                    </div>
                    {/* [006] 分页控件（对齐管控端-用户管理 MemberManagement.tsx 样式） */}
                    <div className="mt-6 px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400">共 {sortedClaws.length} 个实例，第 {safePage} / {totalPages} 页</span>
                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          {(() => {
                            const pages: (number | string)[] = [];
                            if (totalPages <= 7) {
                              for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                              pages.push(1);
                              if (safePage > 3) pages.push("...");
                              for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
                              if (safePage < totalPages - 2) pages.push("...");
                              pages.push(totalPages);
                            }
                            return pages.map((p, idx) =>
                              typeof p === "string" ? (
                                <span key={`ellipsis-${idx}`} className="h-7 w-7 flex items-center justify-center text-xs text-gray-400">…</span>
                              ) : (
                                <button
                                  key={p}
                                  className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${p === safePage ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                  style={p === safePage ? { background: "#007AFF" } : undefined}
                                  onClick={() => setPage(p as number)}
                                >{p}</button>
                              )
                            );
                          })()}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    </>
                  )}
                  </div>
                );
              })()}
          </div>
        </div>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="fixed inset-0 z-50" onClick={() => setShowNotificationPanel(false)}>
            <div className="absolute right-6 top-24 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Header - Fixed */}
              <div className="p-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-xs">消息通知</h3>
                  <button
                    onClick={() => handleClearAllNotifications()}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    全部删除
                  </button>
                </div>
              </div>

              {/* Notifications List - Scrollable */}
              <div className="overflow-y-auto" style={{
                maxHeight: notifications.length > 5 ? 'calc(5 * 60px)' : 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6',
                paddingRight: '4px'
              }}>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">暂无消息</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-gray-50 transition-colors" style={{minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-gray-700 flex-1 line-clamp-2">{notif.message}</p>
                          <button
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1" style={{fontSize: '11px'}}>{notif.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rename Dialog */}
        <Dialog open={!!renameDialog} onOpenChange={(open) => { if (!open) handleCancelRename(); }}>
          <DialogContent
            className="sm:max-w-[360px]"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">重命名 Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rename-agent-input" className="text-sm font-medium text-gray-700">名称</Label>
              <Input
                id="rename-agent-input"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value.slice(0, RENAME_NAME_MAX_LENGTH))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmRename();
                  }
                }}
                maxLength={RENAME_NAME_MAX_LENGTH}
                placeholder="请输入 Agent 名称"
                autoFocus
              />
              <p className="text-xs text-gray-400 text-right">
                {renameInput.length}/{RENAME_NAME_MAX_LENGTH}
              </p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={handleCancelRename}>取消</Button>
              <Button
                className="text-white"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                disabled={!renameInput.trim()}
                onClick={handleConfirmRename}
              >
                确认
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Fail Dialog */}
        <Dialog open={showRenameFail} onOpenChange={(open) => { if (!open) setShowRenameFail(false); }}>
          <DialogContent
            className="sm:max-w-[360px]"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">重命名失败</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 leading-relaxed">
                重命名失败，请重试
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
              <Button
                className="w-full"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                onClick={() => setShowRenameFail(false)}
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
              <DialogTitle className="text-base font-bold text-gray-900">确认重启</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 leading-relaxed">
              重启后该 OpenClaw「{restartConfirm?.name}」将短暂不可用，期间 IM 消息无法回复，确认重启吗？
            </p>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setRestartConfirm(null)}>取消</Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
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
              <DialogTitle className="text-base font-bold text-gray-900">确认重新安装</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 leading-relaxed">
              将使用最新镜像重新安装「{reinstallConfirm?.name}」，清除当前所有配置且无法恢复，安装完成后需重新配置模型和通道。
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">请输入「重装」以确认</label>
              <Input
                placeholder="输入「重装」"
                value={reinstallConfirmInput}
                onChange={(e) => setReinstallConfirmInput(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setReinstallConfirm(null)}>取消</Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
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
              <DialogTitle className="text-base font-bold text-gray-900">
                {deleteConfirm?.status === "createFail" ? "删除记录" : "确认删除"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 leading-relaxed">
                {deleteConfirm?.status === "createFail"
                ? `此操作将移除「${deleteConfirm?.name}」该创建失败的记录，底层资源将由系统自动回收。`
                : `此操作不可撤销。「${deleteConfirm?.name}」实例及相关数据将被永久删除，已配置的模型、通道和插件将全部清除且无法恢复。`}
            </p>
            {/* 记忆数据清理提示 - 仅当该 OpenClaw 开启了记忆功能时显示 */}
            {deleteConfirm?.status !== "createFail" && deleteConfirm?.memoryStatus && deleteConfirm.memoryStatus !== 'none' && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  该 OpenClaw 已开启 Memory {deleteConfirm.memoryStatus === 'pro' ? 'Pro' : 'Free'}，相关记忆数据也将被一并清理。
                </p>
              </div>
            )}
            {deleteConfirm?.status === "running" && (
              <div>
                <label className="text-sm font-medium text-gray-700">请输入「删除」以确认</label>
                <Input
                  placeholder="输入「删除」"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>取消</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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
              <DialogTitle className="text-base font-bold text-gray-900">移除角色</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 leading-relaxed">
              确定要移除「{removeRoleConfirm?.name}」的角色「{removeRoleConfirm?.roleName}」吗？
            </p>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600 leading-relaxed">
                移除角色不会删除已有的技能配置，Agent 将回退为「通用助手」。
              </p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setRemoveRoleConfirm(null)}>取消</Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
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
              <DialogTitle className="text-base font-bold text-gray-900">开启面板</DialogTitle>
            </DialogHeader>
            {/* 安全警告 */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-orange-600 leading-relaxed">
                访问链接已生成，该链接含有您的 API Key 和加密配置，请勿分享给第三方，以防隐私泄露或资产损失。
              </p>
            </div>
            {/* 信息行 */}
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24 shrink-0">WebSocket URL</span>
                <span className="flex-1 text-sm text-gray-800 font-mono truncate">
                  http://43.139.137.45:38341/knmnz8?token=8512b8ef...
                </span>
                <button
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => { navigator.clipboard.writeText("http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"); toast.success("已复制"); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24 shrink-0">网关令牌</span>
                <span className="flex-1 text-sm text-gray-800 font-mono truncate">
                  8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb
                </span>
                <button
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => { navigator.clipboard.writeText("8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"); toast.success("已复制"); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* 说明文字 */}
            <p className="text-sm text-gray-500 leading-relaxed">
              用浏览器打开 WebSocket URL，如面板需要填入网关令牌，则将网关令牌复制并粘贴过去，即可进入面板。
            </p>
            <DialogFooter>
              <Button
                className="w-full"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                onClick={() => { window.open("http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb", "_blank"); }}
              >
                立即访问
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) { setTypeExpanded(false); setRoleExpanded(false); setSelectedRole(null); setAgentType("openclaw"); setCreateStep(1); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                  🦞
                </div>
                创建 Agent
              </DialogTitle>
            </DialogHeader>

            {/* ===== 多分组模式 Step 1: 选择分组 ===== */}
            {groupMode === "multi-group" && createStep === 1 && (
              <div className="py-4 space-y-2.5">
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  您属于多个分组，不同分组对应不同的 Agent 配置和权限，请先选择要使用的分组：
                </p>
                {MOCK_USER_GROUPS.map((group) => {
                  const isSelected = selectedGroup.id === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all duration-150 ${
                        isSelected
                          ? "bg-blue-50/30"
                          : "border-gray-150 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                      }`}
                      style={isSelected ? { borderColor: "#007AFF" } : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isSelected ? "font-medium" : "text-gray-600"}`} style={isSelected ? { color: "#007AFF" } : undefined}>
                          {group.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5" style={{ color: "#007AFF" }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ===== Step 2 (多分组模式) 或 普通模式: 填写信息 ===== */}
            {(groupMode === "normal" || (groupMode === "multi-group" && createStep === 2)) && (
            <div className="py-4 space-y-4">
              {/* Name Input */}
              <div>
                <Label htmlFor="claw-name" className="text-sm font-medium text-gray-700">
                  Agent 名称
                </Label>
                <Input
                  id="claw-name"
                  placeholder="例如：工作助手、代码助手..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-2"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">
                  创建后可在详细配置页中配置模型、通道和技能
                </p>
              </div>

              {/* Agent Type - Collapsible Row */}
              <div>
                <button
                  type="button"
                  onClick={() => setTypeExpanded(!typeExpanded)}
                  className="w-full flex items-center justify-between py-1 group/type"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Agent 类型</span>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">可选</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      {agentType === "openclaw" ? "OpenClaw" : agentType === "hermes" ? "Hermes Agent" : "Lightclaw ACE"}
                    </span>
                    {typeExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-300" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                    )}
                  </div>
                </button>
                {typeExpanded && (
                  <div className="flex flex-wrap gap-2 pt-2 pb-1">
                    {([["openclaw", "OpenClaw"], ["hermes", "Hermes Agent"], ["lightclawace", "Lightclaw ACE"]] as const)
                      .filter(([value]) => groupMode !== "multi-group" || selectedGroup.permissions.agentTypes.includes(value))
                      .map(([value, label]) => {
                      const isSelected = agentType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setAgentType(value as "openclaw" | "hermes" | "lightclawace");
                            if (value !== "openclaw") {
                              setRoleExpanded(false);
                              setSelectedRole(null);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                            isSelected
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Role Selection - Collapsible Row */}
              {(
              <div>
                <button
                  type="button"
                  onClick={() => setRoleExpanded(!roleExpanded)}
                  className="w-full flex items-center justify-between py-1 group/role"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">角色身份</span>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">可选</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      {selectedRole ? selectedRole.name : "通用助手"}
                    </span>
                    {roleExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-300" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                    )}
                  </div>
                </button>

                {roleExpanded && (
                  <div className="pt-2 pb-1">
                    <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
                      <div className="flex flex-wrap gap-2">
                        {visibleRoles
                          .filter((role) => groupMode !== "multi-group" || selectedGroup.permissions.roles.includes(role.name))
                          .map((role) => {
                          const isSelected = selectedRole?.id === role.id;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => { setSelectedRole(isSelected ? null : role); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                                isSelected
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                              }`}
                            >
                              {role.name}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setSelectedRole(null)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                            !selectedRole
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          通用助手（默认）
                        </button>
                      </div>

                      {/* Role Detail */}
                      {selectedRole && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-blue-100"
                          style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.03), rgba(88,86,214,0.03))" }}>
                          <div className="px-3.5 py-3 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-blue-500 inline-block" />
                                角色技能
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedRole.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-white/80 text-gray-600 border border-gray-100"
                                  >
                                    {skill.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-blue-600 mb-1.5 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-blue-500 inline-block" />
                                角色灵魂
                              </p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedRole.soul}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
            )}

            <DialogFooter>
              {/* 多分组模式 Step 1: 下一步按钮 */}
              {groupMode === "multi-group" && createStep === 1 && (
                <>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
                  <Button
                    onClick={() => {
                      setCreateStep(2);
                      // 重置 agent 类型为该分组允许的第一个
                      if (!selectedGroup.permissions.agentTypes.includes(agentType)) {
                        setAgentType(selectedGroup.permissions.agentTypes[0]);
                      }
                    }}
                    className="text-white"
                    style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                  >
                    下一步
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </>
              )}
              {/* 多分组模式 Step 2: 返回 + 创建 */}
              {groupMode === "multi-group" && createStep === 2 && (
                <>
                  <Button variant="outline" onClick={() => setCreateStep(1)}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    上一步
                  </Button>
                  <Button
                    onClick={handleCreate}
                    className="text-white"
                    style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                  >
                    创建
                  </Button>
                </>
              )}
              {/* 普通模式: 取消 + 创建 */}
              {groupMode === "normal" && (
                <>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
                  <Button
                    onClick={handleCreate}
                    className="text-white"
                    style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                  >
                    创建
                  </Button>
                </>
              )}
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
