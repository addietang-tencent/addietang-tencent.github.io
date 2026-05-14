/**
 * TenantLayout - 租户端布局
 * Design: 「流动蓝图」Fluid Blueprint
 * - 用户端背景：linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%) (v2)
 * - 顶部固定导航栏 (64px)
 * - 主色 #1447E6
 */
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { SITE_CONFIG } from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRight, Bell, Check, ChevronDown, Copy, HelpCircle, KeyRound, LogOut, Settings, UserCog, X,
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/contexts/UserRoleContext";

// 中央 Tab 导航（Figma 358:2322 中央 segmented：我的 Agent / 技能广场 / 模型额度）
const CENTER_NAV_ITEMS = [
  { label: "我的 Agent", path: "/my-openclaw" },
  { label: "技能广场", path: "/skill-square" },
  { label: "模型额度", path: "/model-quota" },
];

// 右侧图标导航：帮助文档保留为右侧"使用指南"入口（对齐 Figma 358:2322 右侧）
const HELP_DOC_PATH = "/help-docs";

const CURRENT_USER = "alice@acompany.com";

// ==================== 通知类型定义 ====================

type NotificationCategory = "success" | "failure" | "notice";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
  /** 可选：点击"前往查看"跳转的目标路径（如 /admin/security-group） */
  actionHref?: string;
  /** 可选：跳转按钮文案，默认"前往查看" */
  actionLabel?: string;
}

const NOTIFICATION_CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; icon: React.ReactNode; bgColor: string; textColor: string }
> = {
  success: {
    label: "成功",
    icon: <span style={{ fontFamily: '"微软雅黑", "Microsoft YaHei", sans-serif' }}>✓</span>,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  failure: {
    label: "错误",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  notice: {
    label: "通知",
    icon: <span style={{ fontFamily: '"微软雅黑", "Microsoft YaHei", sans-serif' }}>ℹ</span>,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    message: "『Alice的工作助手』TAT 执行命令错误：脚本返回非零退出码 (exit code 1)",
    timestamp: "2026-03-26 11:05",
    category: "failure",
    read: false,
  },
  {
    id: "n2",
    message: "『Noah的分析助手』命令执行超时，已自动终止（超时阈值 60s）",
    timestamp: "2026-03-26 10:42",
    category: "failure",
    read: false,
  },
  {
    id: "n3",
    message: "『Bob的数据分析』重启失败，实例状态异常，请联系管理员",
    timestamp: "2026-03-26 09:30",
    category: "failure",
    read: false,
  },
  {
    id: "n4",
    message: "『Eve的编程助手』TAT Agent 离线，命令下发失败",
    timestamp: "2026-03-25 17:15",
    category: "failure",
    read: false,
  },
  {
    id: "n5",
    message: "『Alice的工作助手』API 密钥存在泄露风险，请立即轮换",
    timestamp: "2026-03-25 14:00",
    category: "failure",
    read: false,
  },
  {
    id: "n6",
    message: "检测到异常登录行为：账号 bob@bcompany.com 于境外 IP 登录，请确认",
    timestamp: "2026-03-24 08:55",
    category: "failure",
    read: false,
  },
  {
    id: "n7",
    message: "『Alice的工作助手』已成功删除",
    timestamp: "2026-03-23 15:30",
    category: "success",
    read: false,
  },
  {
    id: "n8",
    message: "『Noah的分析助手』创建成功，已进入运行状态",
    timestamp: "2026-03-22 10:10",
    category: "success",
    read: false,
  },
  {
    id: "n9",
    message: "『Bob的数据分析』配置更新成功",
    timestamp: "2026-03-21 09:00",
    category: "success",
    read: false,
  },
  {
    id: "n10",
    message: "平台版本已更新至 v2.4.0，新增多模型切换与指令库功能，点击查看更新日志",
    timestamp: "2026-03-20 09:00",
    category: "notice",
    read: false,
  },
];

// ==================== 通知面板组件 ====================

// [004] 独立化升级完成消息（仅对"兼具管理员身份"的用户端账号推送）
//   - 展示条件：isAdmin=true（普通员工看不到，不懂、点了会 403）
//   - 交互行为：与其他铃铛通知一致——用户自行点 X 删除 / 点"已读"变灰 / 点"前往查看"跳管控端
//     删除和已读均为当前 Session 内内存态，与管控端蓝条的 ack 状态解耦
const MIGRATION_NOTIFICATION: Notification = {
  id: "sg-migration-done",
  message:
    "ClawPro 安全组独立化升级已完成，原规则与绑定 Agent 已迁移至 ClawPro-Default",
  timestamp: "2026-05-05 15:00",
  category: "notice",
  read: false,
  actionHref: "/admin/security-group",
  actionLabel: "前往查看",
};

function NotificationPanel({ isAdmin }: { isAdmin: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | NotificationCategory>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // [004] 仅"兼具管理员身份"的用户端账号展示独立化升级完成消息
    //   普通员工看不到（不懂、点了会 403）
    //   删除/已读行为与其他通知一致：内存态，不持久化，刷新后恢复
    if (isAdmin) {
      // 放在最新时间点（最顶部），管理员打开铃铛立刻能看到
      setNotifications([MIGRATION_NOTIFICATION, ...MOCK_NOTIFICATIONS]);
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [isAdmin]);

  const hasUnread = notifications.some((n) => !n.read);

  // 点击弹窗外部关闭
  useEffect(() => {
    if (!showPanel) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showPanel]);

  const handleOpen = () => {
    setShowPanel((prev) => !prev);
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleCopy = (notif: Notification) => {
    navigator.clipboard.writeText(notif.message).then(() => {
      setCopiedId(notif.id);
      // 复制后自动标为已读
      handleMarkRead(notif.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const tabs: { key: "all" | NotificationCategory; label: string }[] = [
    { key: "all",     label: "全部" },
    { key: "success", label: "成功" },
    { key: "failure", label: "错误" },
  ];

  const filteredNotifs = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  // Tab 角标只计未读数量
  const unreadCountFor = (key: "all" | NotificationCategory) =>
    key === "all"
      ? notifications.filter((n) => !n.read).length
      : notifications.filter((n) => n.category === key && !n.read).length;

  return (
    <div className="relative">
      {/* Bell 触发按钮 */}
      <button
        onClick={handleOpen}
        className="w-9 h-9 rounded-[4px] flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
      >
        <Bell style={{ width: "18px", height: "18px" }} />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* 通知面板 */}
      {showPanel && (
        <div
          ref={panelRef}
          className="fixed right-4 top-[118px] w-80 bg-white rounded-[4px] shadow-xl border border-gray-100 flex flex-col z-[200]"
          style={{ maxHeight: filteredNotifs.length > 4 ? "400px" : undefined }}
        >
          {/* Header + Tabs */}
          <div className="px-3 pt-3 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-semibold text-gray-900 text-xs">消息通知</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  全部删除
                </button>
                <span className="text-gray-200 text-xs">|</span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  全部已读
                </button>
              </div>
            </div>
            {/* Filter Tabs */}
            <div className="flex gap-0.5 border-b border-gray-100">
              {tabs.map((tab) => {
                const count = unreadCountFor(tab.key);
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                      "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-t-md transition-colors relative",
                      isActive
                        ? "text-blue-600 bg-blue-50/60"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={[
                          "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold",
                          isActive
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 消息列表（可滚动） */}
          <div
            className="overflow-y-auto flex-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db #f3f4f6" }}
          >
            {filteredNotifs.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">暂无消息</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredNotifs.map((notif) => {
                  const catCfg = NOTIFICATION_CATEGORY_CONFIG[notif.category];
                  const isCopied = copiedId === notif.id;
                  return (
                    <div
                      key={notif.id}
                      className="px-3 py-2.5 hover:bg-gray-50/70 transition-colors relative"
                      onMouseEnter={() => setHoveredId(notif.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={[
                            "text-xs flex-1 leading-relaxed line-clamp-2 transition-colors",
                            notif.read ? "text-gray-400" : "text-gray-700",
                          ].join(" ")}
                          title={notif.message}
                        >
                          {notif.message}
                        </p>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={[
                              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium",
                              catCfg.bgColor,
                              catCfg.textColor,
                            ].join(" ")}
                          >
                            {catCfg.icon}
                            {catCfg.label}
                          </span>
                          <span className="text-gray-400" style={{ fontSize: "11px" }}>
                            {notif.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* [004] 带跳转的通知：显示"前往查看"按钮（hover 时浮现），
                              点击跳转 + 自动标已读 */}
                          {notif.actionHref && hoveredId === notif.id && (
                            <Link href={notif.actionHref}>
                              <button
                                onClick={() => {
                                  handleMarkRead(notif.id);
                                  setShowPanel(false);
                                }}
                                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="前往查看"
                              >
                                {notif.actionLabel || "前往查看"}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </Link>
                          )}
                          {/* 标为已读：hover 时浮现，已读后隐藏 */}
                          {!notif.read && hoveredId === notif.id && (
                            <button
                              onClick={() => handleMarkRead(notif.id)}
                              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="标为已读"
                            >
                              <Check className="w-3 h-3" />
                              已读
                            </button>
                          )}
                          {notif.category === "failure" && (
                            <button
                              onClick={() => handleCopy(notif)}
                              className={[
                                "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors",
                                isCopied
                                  ? "text-green-600 bg-green-50"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                              ].join(" ")}
                              title="复制详情"
                            >
                              {isCopied ? (
                                <><Check className="w-3 h-3" />已复制</>
                              ) : (
                                <><Copy className="w-3 h-3" />复制</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TenantLayout ====================

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, toggleRole } = useUserRole();

  // 读取多分组模式状态
  const [groupMode, setGroupMode] = useState<"normal" | "multi-group">(() => {
    return (localStorage.getItem("openclaw_group_mode") as "normal" | "multi-group") || "normal";
  });
  // 监听 localStorage 变化（从 MyOpenClaw 切换时同步）
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "openclaw_group_mode") {
        setGroupMode((e.newValue as "normal" | "multi-group") || "normal");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => { window.removeEventListener("storage", handleStorage); };
  }, []);

  // 读取管控端「允许用户查看模型额度」开关状态（默认开启）
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

  // 根据开关过滤导航项（仅影响中央 Tab 的"模型额度"）
  const visibleCenterNavItems = CENTER_NAV_ITEMS.filter((item) => {
    if (item.path === "/model-quota" && !modelQuotaEnabled) return false;
    return true;
  });

  // 中央 Tab 当前激活索引（用于滑块定位）
  const activeCenterIndex = visibleCenterNavItems.findIndex((item) =>
    location.startsWith(item.path)
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)" }}>
      {/* [Figma 358:2320] 顶部深色客户端条 50px - #2C2C2C */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] flex items-center"
        style={{
          height: "50px",
          background: "#2C2C2C",
          padding: "0 28px",
        }}
      >
        <span
          className="text-white"
          style={{
            fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: 1,
          }}
        >
          客户端界面
        </span>
      </div>

      {/* [Figma 358:2322] Top Navigation 64px：左 Logo + 中央 Tab + 右图标 */}
      <header
        className="fixed left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md"
        style={{
          top: "50px",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="h-full flex items-center justify-between px-7">
          {/* Logo & Brand（左侧固定区） */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group min-w-[200px]">
              <div className="w-8 h-8 rounded-[4px] flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)" }}>
                🦞
              </div>
              <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {SITE_CONFIG.name}
              </span>
            </div>
          </Link>

          {/* 中央 Tab 导航（Figma 358:2322 中央 segmented） */}
          <nav
            className="flex items-center gap-1 p-1 rounded-[4px]"
            style={{ background: "#F5F5F5" }}
          >
            {visibleCenterNavItems.map((item, idx) => {
              const isActive = idx === activeCenterIndex;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`px-3 py-[7px] rounded-[3px] text-sm font-normal transition-all duration-150 ${
                      isActive
                        ? "bg-white text-[#020617]"
                        : "text-[#334155] hover:text-[#020617]"
                    }`}
                    style={
                      isActive
                        ? { boxShadow: "0px 1.11px 2.22px rgba(0,0,0,0.05)" }
                        : undefined
                    }
                  >
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* 右侧图标区：使用指南 + 消息通知 + 管理后台 + 用户菜单 */}
          <div className="flex items-center gap-2 min-w-[200px] justify-end">
            {/* 使用指南（=帮助文档，保留原型功能） */}
            <Link href={HELP_DOC_PATH}>
              <button
                className="w-9 h-9 rounded-[4px] flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="使用指南"
              >
                <HelpCircle style={{ width: "18px", height: "18px" }} />
              </button>
            </Link>

            {/* 消息中心 */}
            <NotificationPanel isAdmin={isAdmin} />

            {/* 管理后台按钮：仅管理员可见 */}
            {isAdmin && (
              <Link href="/admin/basic-info">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-gray-200 text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150">
                  <Settings className="w-3.5 h-3.5" />
                  管理后台
                </button>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] hover:bg-gray-50 transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs font-medium text-white"
                      style={{ background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)" }}>
                      {CURRENT_USER.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 max-w-[140px] truncate">{CURRENT_USER}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">当前账号</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{CURRENT_USER}</p>
                  <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                    isAdmin ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {isAdmin ? "管理员" : "普通成员"}
                  </span>
                </div>
                {/* 所在分组 - 始终显示 */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-1.5">所在分组</p>
                  <div className="flex flex-wrap gap-1">
                    {groupMode === "multi-group" ? (
                      <>
                        <span className="inline-block text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "rgba(88,86,214,0.10)", color: "#1447E6" }}>
                          A公司 / 技术部 / 前端组
                        </span>
                        <span className="inline-block text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "rgba(88,86,214,0.10)", color: "#1447E6" }}>
                          A公司 / 技术部 / AI 组
                        </span>
                        <span className="inline-block text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "rgba(88,86,214,0.10)", color: "#1447E6" }}>
                          前端研发同学
                        </span>
                      </>
                    ) : (
                      <span className="inline-block text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "rgba(88,86,214,0.10)", color: "#1447E6" }}>
                        默认
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenuItem onClick={() => window.location.href = '/reset-password'}>
                  <KeyRound className="w-4 h-4 mr-2 text-gray-500" />
                  重置密码
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* 演示用：切换角色 */}
                <DropdownMenuItem onClick={() => {
                  toggleRole();
                  toast.info(`已切换为${isAdmin ? "普通成员" : "管理员"}视角`);
                }}>
                  <UserCog className="w-4 h-4 mr-2 text-gray-500" />
                  切换为{isAdmin ? "普通成员" : "管理员"}视角
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("已退出登录")} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content：上偏移 = 客户端条 50 + 导航 64 = 114px */}
      <main className="pt-[114px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
