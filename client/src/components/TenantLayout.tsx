/**
 * TenantLayout - 租户端布局
 * Design: 「流动蓝图」Fluid Blueprint
 * - 白色系背景 (#FAFBFF)
 * - 顶部固定导航栏 (64px)
 * - 主色 #007AFF
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
  Bell, Check, ChevronDown, Copy, KeyRound, LogOut, Settings, UserCog, X,
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/contexts/UserRoleContext";

const NAV_ITEMS = [
  { label: "我的 Agent", path: "/my-openclaw", newTab: false },
  { label: "模型额度", path: "/model-quota", newTab: false },
  { label: "帮助文档", path: "/help-docs", newTab: false },
];

const CURRENT_USER = "alice@acompany.com";

// ==================== 通知类型定义 ====================

type NotificationCategory = "success" | "failure" | "notice";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
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

function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | NotificationCategory>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(MOCK_NOTIFICATIONS);
  }, []);

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
        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
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
          className="fixed right-4 top-[68px] w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col z-[200]"
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
                        <p className={[
                          "text-xs flex-1 leading-relaxed line-clamp-2 transition-colors",
                          notif.read ? "text-gray-400" : "text-gray-700",
                        ].join(" ")}>
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

  // 根据开关过滤导航项
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.path === "/model-quota" && !modelQuotaEnabled) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "#FAFBFF" }}>
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                🦞
              </div>
              <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {SITE_CONFIG.name}
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const isActive = !item.newTab && location.startsWith(item.path);
              const btnClass = `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`;
              if (item.newTab) {
                return (
                  <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer">
                    <button className={btnClass}>{item.label}</button>
                  </a>
                );
              }
              return (
                <Link key={item.path} href={item.path}>
                  <button className={btnClass}>{item.label}</button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Bell + Admin Button + User Menu */}
          <div className="flex items-center gap-2">
            {/* 消息中心 */}
            <NotificationPanel />

            {/* 管理后台按钮：仅管理员可见 */}
            {isAdmin && (
              <Link href="/admin/basic-info">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150">
                  <Settings className="w-3.5 h-3.5" />
                  管理后台
                </button>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs font-medium text-white"
                      style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
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

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
