/**
 * TenantLayout - 租户端布局
 *
 * Design: 「流动蓝图」Fluid Blueprint
 * - 用户端背景：v5 使用设计稿提供的新背景图片 /tenant_bg.png（客户端背景.3d165716d3）
 *   · 淡蓝渐变 + cover 铺满 + fixed 固定
 *   · 顶部柔和蓝紫色云雾，过渡到底部白色
 * - 顶部固定导航栏 (64px) — 基于可复用的 TopNav 组合（对照 Figma 358:2322 还原）
 * - 主色 #1447E6
 *
 * 顶部导航相关的视觉/交互全部下沉到 `@/components/topnav`，
 * 本文件只关心：
 *   1) 路由 / 角色相关的状态接入（active tab、isAdmin、modelQuotaEnabled、groupMode）
 *   2) 通知数据（mock）的来源
 *   3) UserMenu 内的下拉菜单项业务文案
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { KeyRound, LogOut, UserCog, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useUserRole } from "@/contexts/UserRoleContext";
import {
  TopNav,
  NavDivider,
  CenterTabs,
  NavIconButton,
  SwitchAdminIcon,
  NotificationPanel,
  HelpPanel,
  UserMenu,
  type Notification,
} from "@/components/topnav";

// 中央 Tab 导航（Figma 358:2322 中央 segmented：我的 Agent / 技能广场 / 模型额度）
const CENTER_NAV_ITEMS = [
  { label: "我的 Agent", value: "/my-openclaw" },
  { label: "技能广场", value: "/skill-square" },
  { label: "模型额度", value: "/model-quota" },
];

const CURRENT_USER = "alice@acompany.com";

// ==================== Mock 通知 ====================

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", message: "『Alice的工作助手』TAT 执行命令错误：脚本返回非零退出码 (exit code 1)", timestamp: "2026-03-26 11:05", category: "failure", read: false },
  { id: "n2", message: "『Noah的分析助手』命令执行超时，已自动终止（超时阈值 60s）", timestamp: "2026-03-26 10:42", category: "failure", read: false },
  { id: "n3", message: "『Bob的数据分析』重启失败，实例状态异常，请联系管理员", timestamp: "2026-03-26 09:30", category: "failure", read: false },
  { id: "n4", message: "『Eve的编程助手』TAT Agent 离线，命令下发失败", timestamp: "2026-03-25 17:15", category: "failure", read: false },
  { id: "n5", message: "『Alice的工作助手』API 密钥存在泄露风险，请立即轮换", timestamp: "2026-03-25 14:00", category: "failure", read: false },
  { id: "n6", message: "检测到异常登录行为：账号 bob@bcompany.com 于境外 IP 登录，请确认", timestamp: "2026-03-24 08:55", category: "failure", read: false },
  { id: "n7", message: "『Alice的工作助手』已成功删除", timestamp: "2026-03-23 15:30", category: "success", read: false },
  { id: "n8", message: "『Noah的分析助手』创建成功，已进入运行状态", timestamp: "2026-03-22 10:10", category: "success", read: false },
  { id: "n9", message: "『Bob的数据分析』配置更新成功", timestamp: "2026-03-21 09:00", category: "success", read: false },
  { id: "n10", message: "平台版本已更新至 v2.4.0，新增多模型切换与指令库功能，点击查看更新日志", timestamp: "2026-03-20 09:00", category: "notice", read: false },
];

// [004] 独立化升级完成消息（仅对"兼具管理员身份"的用户端账号推送）
const MIGRATION_NOTIFICATION: Notification = {
  id: "sg-migration-done",
  message: "ClawPro 安全组独立化升级已完成，原规则与绑定 Agent 已迁移至 ClawPro-Default",
  timestamp: "2026-05-05 15:00",
  category: "notice",
  read: false,
  actionHref: "/admin/security-group",
  actionLabel: "前往查看",
};

// ==================== TenantLayout ====================

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { isAdmin, toggleRole } = useUserRole();

  // 多分组模式
  const [groupMode, setGroupMode] = useState<"normal" | "multi-group">(() => {
    return (localStorage.getItem("openclaw_group_mode") as "normal" | "multi-group") || "normal";
  });
  const handleGroupModeChange = (mode: "normal" | "multi-group") => {
    setGroupMode(mode);
    localStorage.setItem("openclaw_group_mode", mode);
    window.dispatchEvent(new StorageEvent("storage", { key: "openclaw_group_mode", newValue: mode }));
  };

  // 重置密码弹窗
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleResetPwd = () => {
    if (!oldPwd || !newPwd || !confirmPwd) { toast.error("请填写所有字段"); return; }
    if (newPwd !== confirmPwd) { toast.error("两次输入的新密码不一致"); return; }
    if (newPwd.length < 8) { toast.error("新密码长度不能少于 8 位"); return; }
    toast.success("密码重置成功");
    setResetPwdOpen(false);
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
  };
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "openclaw_group_mode") {
        setGroupMode((e.newValue as "normal" | "multi-group") || "normal");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 模型额度开关
  const [modelQuotaEnabled, setModelQuotaEnabled] = useState(() => {
    const v = localStorage.getItem("admin_allow_model_quota");
    return v !== null ? v === "true" : true;
  });
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "admin_allow_model_quota") {
        setModelQuotaEnabled(e.newValue !== null ? e.newValue === "true" : true);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 过滤后的中央 Tab
  const visibleCenterNavItems = CENTER_NAV_ITEMS.filter(
    (item) => !(item.value === "/model-quota" && !modelQuotaEnabled)
  );

  // 给中央 Tab 设置基于"路由前缀"的匹配
  const centerItemsWithMatcher = visibleCenterNavItems.map((item) => ({
    ...item,
    matches: (current: string) => {
      if (item.value === "/my-openclaw") {
        // 详情页路由 /openclaw/:id 和 /openclaw-guide 也属于"我的 Agent"
        return current.startsWith("/my-openclaw") || current.startsWith("/openclaw");
      }
      return current.startsWith(item.value);
    },
  }));

  // 通知数据（管理员多推一条独立化消息）
  const notificationData: Notification[] = isAdmin
    ? [MIGRATION_NOTIFICATION, ...MOCK_NOTIFICATIONS]
    : MOCK_NOTIFICATIONS;

  return (
    <div
      className="min-h-screen"
      style={{
        // v5：新背景图片 — cover 铺满整个视口，固定不随滚动
        backgroundColor: "#FFFFFF",
        backgroundImage: "url(/tenant_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* [Figma 358:2322] Top Navigation 64px：左 Logo + 中央 Tab + 右图标 */}
      <TopNav
        center={
          <CenterTabs
            items={centerItemsWithMatcher}
            activeValue={location}
            onChange={(value) => navigate(value)}
          />
        }
        right={
          <>
            {/* 使用指南 */}
            <HelpPanel />

            <NavDivider />

            {/* 消息中心 */}
            <NotificationPanel notifications={notificationData} isAdmin={isAdmin} />

            <NavDivider />

            {/* 切换管控端：管理员可见 */}
            {isAdmin && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/admin/basic-info" className="flex min-w-0 shrink overflow-hidden">
                      <NavIconButton
                        icon={<SwitchAdminIcon />}
                        label="管控端"
                        pill
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    前往管控端
                  </TooltipContent>
                </Tooltip>
                <NavDivider />
              </>
            )}

            {/* 用户菜单 */}
            <UserMenu username={CURRENT_USER}>
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">当前账号</p>
                <p className="text-sm font-medium text-gray-900 truncate">{CURRENT_USER}</p>
                <span
                  className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                    isAdmin ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isAdmin ? "管理员" : "普通成员"}
                </span>
              </div>
              {/* 所在分组 */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5">所在分组</p>
                <div className="flex flex-wrap gap-1">
                  {groupMode === "multi-group" ? (
                    <>
                      <span
                        className="inline-block text-xs px-1.5 py-0.5 rounded-[4px] font-medium bg-white text-[#737373] border border-gray-200"
                      >A公司 / 技术部 / 前端组</span>
                      <span
                        className="inline-block text-xs px-1.5 py-0.5 rounded-[4px] font-medium bg-white text-[#737373] border border-gray-200"
                      >A公司 / 技术部 / AI 组</span>
                      <span
                        className="inline-block text-xs px-1.5 py-0.5 rounded-[4px] font-medium bg-white text-[#737373] border border-gray-200"
                      >前端研发同学</span>
                    </>
                  ) : (
                    <span
                      className="inline-block text-xs px-1.5 py-0.5 rounded-[4px] font-medium bg-white text-[#737373] border border-gray-200"
                    >默认</span>
                  )}
                </div>
              </div>
              {/* 分组模式切换 */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5">分组模式</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGroupModeChange("normal")}
                    className={`text-xs px-2 py-1 rounded-[4px] font-medium transition-colors ${
                      groupMode === "normal"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-white text-[#737373] border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    普通
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGroupModeChange("multi-group")}
                    className={`text-xs px-2 py-1 rounded-[4px] font-medium transition-colors ${
                      groupMode === "multi-group"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-white text-[#737373] border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    多分组
                  </button>
                </div>
              </div>
              <DropdownMenuItem onClick={() => setResetPwdOpen(true)}>
                <KeyRound className="w-4 h-4 mr-2 text-black" />
                重置密码
              </DropdownMenuItem>
              {/* 演示用：切换角色 */}
              <DropdownMenuItem
                onClick={() => {
                  toggleRole();
                  toast.info(`已切换为${isAdmin ? "普通成员" : "管理员"}视角`);
                }}
              >
                <UserCog className="w-4 h-4 mr-2 text-[#0A0A0A]" />
                切换为{isAdmin ? "普通成员" : "管理员"}视角
              </DropdownMenuItem>
              {/* 仅管理员：保留旧版"管理后台"快捷入口 */}
              {isAdmin && (
                <DropdownMenuItem onClick={() => (window.location.href = "/admin/basic-info")}>
                  <SwitchAdminIcon size={16} className="mr-2 text-[#0A0A0A]" />
                  前往管控端
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("已退出登录")}
                className="text-[#0A0A0A]"
              >
                <LogOut className="w-4 h-4 mr-2 text-[#0A0A0A]" />
                退出登录
              </DropdownMenuItem>
            </UserMenu>
          </>
        }
      />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">{children}</main>

      {/* 重置密码弹窗 */}
      <Dialog open={resetPwdOpen} onOpenChange={(open) => { setResetPwdOpen(open); if (!open) { setOldPwd(""); setNewPwd(""); setConfirmPwd(""); setShowOld(false); setShowNew(false); setShowConfirm(false); } }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">重置密码</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-[#525252]">当前密码</Label>
              <div className="relative">
                <Input
                  type={showOld ? "text" : "password"}
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  placeholder="请输入当前密码"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A]">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[#525252]">新密码</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="请输入新密码（至少 8 位）"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A]">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[#525252]">确认新密码</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A]">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="tenant-outline" onClick={() => setResetPwdOpen(false)}>
              取消
            </Button>
            <Button variant="tenant-primary" onClick={handleResetPwd}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
