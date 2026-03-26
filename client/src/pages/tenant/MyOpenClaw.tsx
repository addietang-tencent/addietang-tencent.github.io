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
  Zap, Bot, X, RotateCcw, Terminal, Bell, AlertCircle, AlertTriangle, Info
} from "lucide-react";
import { MOCK_OPENCLAW_LIST } from "@/lib/mockData";

// Cast mock data to correct type
const MOCK_OPENCLAW_LIST_TYPED = MOCK_OPENCLAW_LIST as OpenClawItem[];

const DISABLED_TIP = "您的 OpenClaw 已被管理员停用，无法操作";
const LAUNCH_FAILED_TIP = "创建失败，无法操作";

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
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

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
  const [claws, setClaws] = useState<OpenClawItem[]>(MOCK_OPENCLAW_LIST_TYPED);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(true);

  // 通知相关
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // 确认弹窗
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; status: OpenClawStatus } | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [restartConfirm, setRestartConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reinstallConfirm, setReinstallConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reinstallConfirmInput, setReinstallConfirmInput] = useState("");

  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  
  // 从管控端同步的开关
  const [allowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });

  // 自动轮询
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化通知（模拟）
  useEffect(() => {
    // 可以从后端加载通知
    setHasUnread(false);
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
      createdAt: new Date().toLocaleString("zh-CN"),
      model: "",
      modelVersion: "",
      channels: [],
      skills: [],
    };
    setClaws([...claws, newClaw]);
    setNewName("");
    setShowCreate(false);
    toast.success(`「${newClaw.name}」创建中...`);
  };

  const handleDelete = (id: string, name: string) => {
    setClaws(claws.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    setDeleteConfirmInput("");
    toast.success(`「${name}」已删除`);
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
                <div className="flex items-start gap-8">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">创建我的 OpenClaw</p>
                      <p className="text-xs text-gray-500 mt-0.5">点击「创建 OpenClaw」，为它取一个名字</p>
                    </div>
                  </div>
                  <div className="w-8 h-px bg-blue-200 mt-3.5 flex-shrink-0" />
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">进入详细配置</p>
                      <p className="text-xs text-gray-500 mt-0.5">点击 OpenClaw 卡片，配置模型和通道</p>
                    </div>
                  </div>
                  <div className="w-8 h-px bg-blue-200 mt-3.5 flex-shrink-0" />
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">开始使用</p>
                      <p className="text-xs text-gray-500 mt-0.5">配置完成后，即可通过聊天软件与AI对话</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的 OpenClaw</h1>
              <p className="text-sm text-gray-500 mt-1">管理你的 AI 智能助理</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Bell Notification Button */}
              <div className="relative">
                <button
                  onClick={handleOpenNotificationPanel}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              </div>
              <Button
                onClick={() => setShowCreate(true)}
                className="text-white btn-primary-glow"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                创建 OpenClaw
              </Button>
            </div>
          </div>

          {/* OpenClaw Cards */}
          {claws.length === 0 ? (
            <div className="text-center py-24">
              <Bot className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">还没有 OpenClaw，快来创建第一个吧！</p>
              <Button onClick={() => setShowCreate(true)} variant="outline">
                <Plus className="w-4 h-4 mr-1.5" />
                创建 OpenClaw
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {claws.map((claw) => {
                const cfg = STATUS_CONFIG[claw.status];
                const isDisabled = cfg.isDisabled;
                const isGrayAvatar = cfg.isGrayAvatar;
                const isLoadFail = claw.status === "loadFail";

                return (
                  <div key={claw.id}
                    className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 group relative ${!isDisabled ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"}`}
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
                    onClick={() => { if (!isDisabled) navigate(`/openclaw/${claw.id}`); }}
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-opacity ${isGrayAvatar ? "opacity-40" : ""}`}
                          style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))" }}>
                          🦞
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
                                  重新安装 OpenClaw
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                  <HardDriveDownload className="w-4 h-4 mr-2 text-gray-400" />
                                  重新安装 OpenClaw
                                </DropdownMenuItem>
                              )}

                              {/* Terminal */}
                              {allowTerminal && (
                                <>
                                  {claw.status === "running" ? (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/terminal/${claw.id}`, "_blank"); }}>
                                      <Terminal className="w-4 h-4 mr-2 text-gray-500" />
                                      进入终端
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                      <Terminal className="w-4 h-4 mr-2 text-gray-400" />
                                      进入终端
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}

                              <DropdownMenuSeparator />

                              {/* Delete */}
                              {claw.status === "pending" ? (
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
                      <h3 className={`font-semibold text-base mb-0.5 transition-colors ${isGrayAvatar ? "text-gray-400" : "text-gray-900 group-hover:text-blue-600"}`}>
                        {claw.name}
                      </h3>
                      <p className={`text-xs mb-0.5 transition-colors ${isGrayAvatar ? "text-gray-400" : "text-gray-400"}`}>{claw.instanceId}</p>
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
          )}
        </div>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="fixed inset-0 z-50" onClick={() => setShowNotificationPanel(false)}>
            <div className="absolute right-6 top-20 w-96 bg-white rounded-2xl shadow-lg border border-gray-100 z-50"
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">消息通知</h3>
                  <button
                    onClick={() => handleClearAllNotifications()}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    全部删除
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">暂无消息</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-700 flex-1">{notif.message}</p>
                          <button
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Restart Confirm Dialog */}
        <Dialog open={!!restartConfirm} onOpenChange={(open) => { if (!open) setRestartConfirm(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <button
                onClick={() => setRestartConfirm(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                确认重启
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <p className="text-sm text-gray-600">
                确定要重启「<span className="font-medium text-gray-900">{restartConfirm?.name}</span>」吗？
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <div className="flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 重启期间助手将短暂不可用</li>
                    <li>• 期间 IM 消息无法回复</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRestartConfirm(null)}>取消</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleRestart(restartConfirm!.id, restartConfirm!.name)}
              >
                确认重启
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reinstall Confirm Dialog */}
        <Dialog open={!!reinstallConfirm} onOpenChange={(open) => { if (!open) setReinstallConfirm(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <button
                onClick={() => setReinstallConfirm(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <DialogTitle className="flex items-center gap-2">
                <HardDriveDownload className="w-4 h-4 text-amber-500" />
                确认重新安装
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <p className="text-sm text-gray-600">
                确定要重新安装「<span className="font-medium text-gray-900">{reinstallConfirm?.name}</span>」的 OpenClaw 吗？
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <div className="flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 将使用最新镜像版本重新安装 OpenClaw</li>
                    <li>• 所有配置和数据将丢失，无法恢复</li>
                    <li>• 安装完成后需要重新配置模型和通道</li>
                  </ul>
                </div>
              </div>
              <div>
                <Label htmlFor="reinstall-confirm" className="text-xs text-gray-600">
                  请输入「<span className="font-medium">重装</span>」以确认操作
                </Label>
                <Input
                  id="reinstall-confirm"
                  placeholder="输入「重装」"
                  value={reinstallConfirmInput}
                  onChange={(e) => setReinstallConfirmInput(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReinstallConfirm(null)}>取消</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                {deleteConfirm?.status === "createFail" ? "删除记录" : "确认删除"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <p className="text-sm text-gray-600">
                {deleteConfirm?.status === "createFail"
                  ? `确认删除「${deleteConfirm?.name}」的创建失败记录？`
                  : `删除后「${deleteConfirm?.name}」将被立即彻底销毁，数据无法恢复。`}
              </p>
              <div className={`rounded-lg px-4 py-3 border ${deleteConfirm?.status === "createFail" ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex gap-3">
                  {deleteConfirm?.status === "createFail" ? (
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <ul className={`text-sm space-y-1 ${deleteConfirm?.status === "createFail" ? "text-blue-700" : "text-red-700"}`}>
                    {deleteConfirm?.status === "createFail" ? (
                      <>
                        <li>• 底层实例将由平台自动回收</li>
                        <li>• ClawPro 侧记录将被清除</li>
                      </>
                    ) : (
                      <>
                        <li>• 已配置的模型、通道和插件将全部清除</li>
                        <li>• 此操作不可撤销</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              {deleteConfirm?.status !== "createFail" && deleteConfirm?.status === "running" && (
                <div>
                  <Label htmlFor="delete-confirm" className="text-xs text-gray-600">
                    请输入「<span className="font-medium">删除</span>」以确认操作
                  </Label>
                  <Input
                    id="delete-confirm"
                    placeholder="输入「删除」"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end gap-2">
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

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                  🦞
                </div>
                创建 OpenClaw
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="claw-name" className="text-sm font-medium text-gray-700">
                OpenClaw 名称
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
              <Button
                onClick={handleCreate}
                className="text-white"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              >
                创建
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
