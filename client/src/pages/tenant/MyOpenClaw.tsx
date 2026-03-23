/**
 * MyOpenClaw - 我的 OpenClaw 页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 快速上手引导（始终显示，可手动关闭）
 * - OpenClaw 卡片列表（只展示名称、状态、创建时间）
 * - 创建 OpenClaw 弹窗
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Zap, Bot, X, RotateCcw, Terminal
} from "lucide-react";
import { MOCK_OPENCLAW_LIST } from "@/lib/mockData";

const DISABLED_TIP = "您的 OpenClaw 已被管理员停用，无法操作";
const LAUNCH_FAILED_TIP = "创建失败，无法操作";

// 实例状态配置：颜色分组参考云厂商规范
// 绿色：正常运行 | 蓝色：过渡进行中 | 橙色：救援模式 | 灰色：已停止 | 红色：异常/失败
// 实例状态配置：无边框，背景色使用rgba半透明，文字颜色较深，参考原有badge样式
const STATUS_CONFIG: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
  // 绿色 - 正常运行
  RUNNING:                    { label: "运行中",       dotColor: "#34C759", bgColor: "rgba(52,199,89,0.12)",    textColor: "#1a8c3a" },
  running:                    { label: "运行中",       dotColor: "#34C759", bgColor: "rgba(52,199,89,0.12)",    textColor: "#1a8c3a" },
  // 蓝色 - 过渡进行中
  PENDING:                    { label: "创建中",       dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  STARTING:                   { label: "开机中",       dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  STOPPING:                   { label: "关机中",       dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  REBOOTING:                  { label: "重启中",       dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  TERMINATING:                { label: "销毁中",       dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  ENTER_SERVICE_LIVE_MIGRATE: { label: "进入在线迁移", dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  SERVICE_LIVE_MIGRATE:       { label: "在线迁移中",   dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  EXIT_SERVICE_LIVE_MIGRATE:  { label: "退出在线迁移", dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  pending:                    { label: "创建中",       dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)",    textColor: "#0055cc" },
  // 橙色 - 救援模式
  ENTER_RESCUE_MODE:          { label: "进入救援模式", dotColor: "#FF9500", bgColor: "rgba(255,149,0,0.10)",    textColor: "#b8640a" },
  RESCUE_MODE:                { label: "救援模式中",   dotColor: "#FF9500", bgColor: "rgba(255,149,0,0.10)",    textColor: "#b8640a" },
  EXIT_RESCUE_MODE:           { label: "退出救援模式", dotColor: "#FF9500", bgColor: "rgba(255,149,0,0.10)",    textColor: "#b8640a" },
  // 灰色 - 已停止
  STOPPED:                    { label: "已关机",       dotColor: "#9CA3AF", bgColor: "rgba(156,163,175,0.15)",  textColor: "#4b5563" },
  SHUTDOWN:                   { label: "停止待销毁",   dotColor: "#9CA3AF", bgColor: "rgba(156,163,175,0.15)",  textColor: "#4b5563" },
  stopped:                    { label: "已停用",       dotColor: "#9CA3AF", bgColor: "rgba(156,163,175,0.15)",  textColor: "#4b5563" },
  // 红色 - 异常/失败
  LAUNCH_FAILED:              { label: "创建失败",     dotColor: "#FF3B30", bgColor: "rgba(255,59,48,0.10)",    textColor: "#c0392b" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status];
  const label = cfg?.label ?? status;
  const dotColor = cfg?.dotColor ?? "#9CA3AF";
  const bgColor = cfg?.bgColor ?? "rgba(156,163,175,0.15)";
  const textColor = cfg?.textColor ?? "#4b5563";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
      style={{ background: bgColor, color: textColor }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
        style={{ background: dotColor }}
      />
      {label}
    </span>
  );
};

export default function MyOpenClaw() {
  const [, navigate] = useLocation();
  const [claws, setClaws] = useState(MOCK_OPENCLAW_LIST);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(true);
  // 二次确认弹窗
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reinstallConfirm, setReinstallConfirm] = useState<{ name: string } | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  // 从管控端同步的「允许成员进入终端」开关（从 localStorage 读取，与管控端开关联动）
  const [allowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });

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
    const newClaw = {
      id: `oc-${Date.now()}`,
      name: newName.trim(),
      status: "pending",
      createdAt: new Date().toLocaleString("zh-CN"),
      model: "",
      modelVersion: "",
      channels: [],
      skills: [],
    };
    setClaws([...claws, newClaw]);
    setNewName("");
    setShowCreate(false);
    toast.success(`「${newClaw.name}」创建成功！请进入详细配置页完成配置。`);
  };

  const handleDelete = (id: string, name: string) => {
    setClaws(claws.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    toast.success(`「${name}」已删除`);
  };

  const handleRestart = (name: string) => {
    toast.success(`「${name}」正在重启...`);
  };

  const handleUpdate = (name: string) => {
    setReinstallConfirm(null);
    toast.success(`「${name}」正在重新安装 OpenClaw...`);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <TenantLayout>
        <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
          {/* Quick Start Guide - 始终显示，可手动关闭 */}
          {showQuickStart && (
            <div className="mb-8 rounded-2xl p-6 border border-blue-100 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.04), rgba(88,86,214,0.04))" }}>
              <div className="absolute top-0 right-0 w-48 h-48 orb-blue opacity-30 pointer-events-none" />
              <div className="relative z-10">
              {/* Close Button - z-20 确保在内层内容之上 */}
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
            <Button
              onClick={() => setShowCreate(true)}
              className="text-white btn-primary-glow"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              创建 OpenClaw
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {claws.map((claw) => {
                // 灰色（已停止）和红色（失败）状态应用禁用样式
                const isDisabled = ["stopped", "STOPPED", "SHUTDOWN", "LAUNCH_FAILED"].includes(claw.status);
                const isCreating = ["pending", "PENDING"].includes(claw.status);
                const isLaunchFailed = claw.status === "LAUNCH_FAILED";
                const isStopped = claw.status === "stopped" || claw.status === "STOPPED"; // 保持向后兼容
                const disabledTip = isLaunchFailed ? LAUNCH_FAILED_TIP : isCreating ? "创建中，无法操作" : DISABLED_TIP;
                return (
                  <div key={claw.id}
                    className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 group relative ${!isDisabled ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"} ${isDisabled ? "opacity-60" : ""}`}
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
                    onClick={() => { if (!isDisabled && !isCreating) navigate(`/openclaw/${claw.id}`); }}
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
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
                          {/* 三个点菜单 */}
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
                              {/* 重启 - 禁用时禁用 */}
                              {isDisabled || isCreating ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                        <RotateCcw className="w-4 h-4 mr-2 text-gray-400" />
                                        重启
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="w-max text-xs">
                                    {disabledTip}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <DropdownMenuItem onClick={() => handleRestart(claw.name)}>
                                  <RotateCcw className="w-4 h-4 mr-2 text-gray-500" />
                                  重启
                                </DropdownMenuItem>
                              )}
                              {/* 更新版本 - 禁用时禁用 */}
                              {isDisabled || isCreating ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                        <HardDriveDownload className="w-4 h-4 mr-2 text-gray-400" />
                                         重新安装 OpenClaw
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="w-max text-xs">
                                    {disabledTip}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReinstallConfirm({ name: claw.name }); }}>
                                   <HardDriveDownload className="w-4 h-4 mr-2 text-gray-500" />
                                   重新安装 OpenClaw
                                </DropdownMenuItem>
                              )}
                              {/* 进入终端 - 仅当管控端开启「允许成员进入终端」时显示 */}
                              {allowTerminal && (
                                <>
                                  {isDisabled || isCreating ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                            <Terminal className="w-4 h-4 mr-2 text-gray-400" />
                                            进入终端
                                          </DropdownMenuItem>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="w-max text-xs">
                                        {disabledTip}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={(e) => { e.stopPropagation(); window.open(`/terminal/${claw.id}`, "_blank"); }}
                                    >
                                      <Terminal className="w-4 h-4 mr-2 text-gray-500" />
                                      进入终端
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              <DropdownMenuSeparator />
                              {/* 删除 - 创建中禁用 */}
                              {isCreating ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                        <Trash2 className="w-4 h-4 mr-2 text-gray-400" />
                                        删除
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="w-max text-xs">
                                    创建中，无法操作
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: claw.id, name: claw.name }); }}
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
                      {/* 只展示名称和创建时间 */}
                      <h3 className={`font-semibold text-base mb-1 transition-colors ${isDisabled ? "text-gray-400" : "text-gray-900 group-hover:text-blue-600"}`}>
                        {claw.name}
                      </h3>
                      <p className="text-xs text-gray-400">创建于 {claw.createdAt}</p>
                    </div>

                    {/* Card Actions - 详细配置按钮（outline 浅色样式） */}
                    <div className="px-5 pb-4 border-t border-gray-50 pt-3">
                      {isDisabled || isCreating ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs opacity-40 cursor-not-allowed"
                                disabled
                              >
                                <Settings className="w-3.5 h-3.5 mr-1.5" />
                                详细配置
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="w-max text-xs">
                            {disabledTip}
                          </TooltipContent>
                        </Tooltip>
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

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                确认删除
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-2">
              <p className="text-sm text-gray-600">
                确定要删除 <span className="font-medium text-gray-900">{deleteConfirm?.name}</span> 吗？
              </p>
              <p className="text-sm text-red-500 font-medium">删除后无法恢复，请谨慎操作。</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>取消</Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(deleteConfirm!.id, deleteConfirm!.name)}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reinstall Confirm Dialog */}
        <Dialog open={!!reinstallConfirm} onOpenChange={(open) => { if (!open) setReinstallConfirm(null); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HardDriveDownload className="w-4 h-4 text-amber-500" />
                重新安装 OpenClaw
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-3">
              <p className="text-sm text-gray-600">
                确定要重新安装「<span className="font-medium text-gray-900">{reinstallConfirm?.name}</span>」吗？
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-sm text-amber-700 font-medium">重新安装将使用最新镜像版本，<span className="font-bold">当前所有配置和数据将会丢失且无法恢复</span>，请谨慎操作。</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReinstallConfirm(null)}>取消</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handleUpdate(reinstallConfirm!.name)}
              >
                确认重新安装
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
      </TenantLayout>
    </TooltipProvider>
  );
}
