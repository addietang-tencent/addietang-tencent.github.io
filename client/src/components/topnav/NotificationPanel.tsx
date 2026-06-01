/**
 * NotificationPanel - 顶部导航的消息通知（右侧抽屉，非模态）
 *
 * 组件结构严格遵循 shadcn/ui Sheet 规范（https://ui.shadcn.com/docs/components/sheet）：
 *   Sheet
 *   ├── SheetTrigger（铃铛按钮）
 *   └── SheetContent
 *       ├── SheetHeader
 *       │   ├── SheetTitle + 全局操作（全部已读 / 全部删除）
 *       │   └── SheetDescription (sr-only)
 *       └── （主体内容：Tabs + 列表）
 *
 * 项目设计系统对齐：
 *   - §5.1 L3 浮层（Sheet 内部已使用 var(--shadow-overlay)）
 *   - §8.6 Tab 切换（Tabs + Segmented Control 灰底白滑块）
 *   - §8.1 按钮（Button claw-* / ghost 变体）
 *   - §1.4 五档文字色阶
 */
import React, { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Info,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/Surface";
import NavIconButton from "./NavIconButton";
import { BellIcon } from "./NavIcons";

export type NotificationCategory = "success" | "failure" | "notice";

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
  actionHref?: string;
  actionLabel?: string;
}

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; Icon: React.ComponentType<{ className?: string }>; iconColor: string; bgColor: string; textColor: string }
> = {
  success: {
    label: "操作成功",
    Icon: CheckCircle2,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  failure: {
    label: "操作报错",
    Icon: XCircle,
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  notice: {
    label: "通知公告",
    Icon: Info,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
};

export interface NotificationPanelProps {
  /** 初始通知列表（组件内部维护本地态：标记已读/删除均为本地，刷新即恢复） */
  notifications: Notification[];
  /** 是否管理员（保留对外参数，便于上层根据角色决定推送哪些通知） */
  isAdmin?: boolean;
}

type TabKey = "all" | NotificationCategory;

export default function NotificationPanel({
  notifications: initialNotifications,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const hasUnread = notifications.some((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const handleMarkAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleDelete = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleClearAll = () => setNotifications([]);

  const handleCopy = (notif: Notification) => {
    navigator.clipboard.writeText(notif.message).then(() => {
      setCopiedId(notif.id);
      handleMarkRead(notif.id);
      setTimeout(() => setCopiedId(null), 1000);
    });
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "notice", label: "通知公告" },
    { key: "failure", label: "操作报错" },
    { key: "success", label: "操作成功" },
  ];


  const listFor = (key: TabKey) =>
    key === "all" ? notifications : notifications.filter((n) => n.category === key);

  // ─── 单条通知渲染（被各 Tab 复用） ──────────────────────────────────────
  const renderList = (list: Notification[]) => {
    if (list.length === 0) {
      return (
        <div className="py-24 text-center">
          <BellIcon size={48} style={{ color: "#E5E5E5", margin: "0 auto" }} />
          <p className="text-xs text-[#A3A3A3] mt-3">暂无消息</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 p-3">
        {list.map((notif) => {
          const catCfg = CATEGORY_CONFIG[notif.category];
          const isCopied = copiedId === notif.id;
          return (
            <SurfaceCard
              key={notif.id}
              className="bg-white px-3 py-2.5 border border-[#F4F5F8] transition-colors hover:bg-[#F5F5F5]"
              style={{ boxShadow: "none" }}
              onMouseEnter={() => setHoveredId(notif.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div>
                <p
                  className={[
                    "text-xs leading-relaxed line-clamp-2 transition-colors",
                    notif.read ? "text-[#A3A3A3]" : "text-[#334155]",
                  ].join(" ")}
                  title={notif.message}
                >
                  {notif.message}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={[
                      "inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-medium whitespace-nowrap",
                      catCfg.bgColor,
                      catCfg.textColor,
                    ].join(" ")}
                  >
                    {catCfg.label}
                  </span>
                  <span className="text-[#A3A3A3] text-[11px]">{notif.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                  {!notif.read && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRead(notif.id)}
                          className={`h-6 w-6 p-0 text-[#A3A3A3] hover:text-[#334155] hover:bg-[#F5F5F5] [&_svg]:size-3.5 transition-opacity ${hoveredId === notif.id ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                          aria-label="标为已读"
                        >
                          <Check />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>已读</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notif.id)}
                        className={`h-6 w-6 p-0 text-[#A3A3A3] hover:text-red-600 hover:bg-transparent [&_svg]:size-3.5 transition-opacity ${hoveredId === notif.id ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                        aria-label="删除"
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>删除</TooltipContent>
                  </Tooltip>
                  {notif.category === "failure" && (
                    <Tooltip open={isCopied || undefined}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(notif)}
                          className="h-6 w-6 p-0 text-[#A3A3A3] hover:text-[#334155] hover:bg-[#F5F5F5] [&_svg]:size-3.5"
                          aria-label="复制"
                        >
                          <Copy />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isCopied ? "复制成功" : "复制"}</TooltipContent>
                    </Tooltip>
                  )}
                  </TooltipProvider>
                </div>
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={showPanel} onOpenChange={setShowPanel} modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <NavIconButton
              icon={
                <span className="inline-flex items-start gap-[2px]">
                  <BellIcon />
                  {hasUnread && (
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        marginTop: -4,
                        minWidth: 16,
                        height: 14,
                        padding: "0 4px",
                        borderRadius: 40,
                        background: "#E7EDFC",
                        fontFamily: "PingFang SC, sans-serif",
                        fontWeight: 500,
                        fontSize: 10,
                        lineHeight: "16px",
                        color: "#202020",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
              }
              title="消息通知"
            />
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          消息通知
        </TooltipContent>
      </Tooltip>

      <SheetContent
        side="right"
        showOverlay={false}
        className="!w-[420px] !max-w-none !top-[64px] !bottom-0 !h-[calc(100vh-64px)] p-0 flex flex-col gap-0 border-t [&>[data-slot=sheet-close]]:hidden"
      >
        {/* ───── shadcn 规范：SheetHeader > SheetTitle + SheetDescription ───── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-[#E5E5E5] gap-0 space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-[#0A0A0A]">
              消息通知
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={!hasUnread}
                className="h-7 px-2 gap-1 text-xs text-[#334155] hover:text-[#1447E6] hover:bg-[#EFF6FF]"
              >
                <Check className="w-3.5 h-3.5" />
                全部已读
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="h-7 px-2 gap-1 text-xs text-[#334155] hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                全部删除
              </Button>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="关闭"
                  className="h-7 w-7 text-[#737373] hover:text-[#0A0A0A]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </SheetClose>
            </div>
          </div>
          <SheetDescription className="sr-only">
            查看与管理您的系统通知，包括操作成功、操作报错、通知公告三大类。
          </SheetDescription>
        </SheetHeader>

        {/* ───── 主体内容：Tabs（Segmented Control）+ 滚动列表 ───── */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
          className="flex flex-col flex-1 min-h-0 gap-0"
        >
          {/* §8.6 Tab 切换（Segmented Control，0522 胶囊版） */}
          <div className="px-3 pt-3 pb-1">
            <TabsList
              className="flex items-center gap-1 p-1 h-auto rounded-full w-full bg-muted"
            >
              {tabs.map((tab) => {
                const count = tab.key === "all"
                  ? notifications.filter((n) => !n.read).length
                  : notifications.filter((n) => n.category === tab.key && !n.read).length;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex-1 rounded-full px-3 py-1 text-xs font-normal whitespace-nowrap text-muted-foreground hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-[var(--shadow-segment)] transition-colors flex items-center justify-center gap-1"
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className="text-muted-foreground">{count}</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div
            className="overflow-y-auto flex-1 min-h-0"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db #f3f4f6" }}
          >
            {tabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="m-0">
                {renderList(listFor(tab.key))}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
