/**
 * AdminLayout - 管控端布局
 * Design: 「流动蓝图」Fluid Blueprint
 * - 浅灰色背景 (#F0F2F8)
 * - 左侧固定导航栏 (256px)，白色背景
 * - 主色 #007AFF，导航分组
 */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SITE_CONFIG } from "@/lib/mockData";
import {
  Settings,
  Users,
  Brain,
  MessageSquare,
  FileText,
  HardDrive,
  ShieldCheck,
  Activity,
  BarChart3,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  ExternalLink,
  Puzzle,
  Gauge,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// 标记为"即将开放"的菜单项路径
const COMING_SOON_PATHS = new Set([
  "/admin/ops-observation",
  "/admin/security-management",
  "/admin/session-management",
]);

const NAV_GROUPS = [
  {
    label: "基础信息",
    items: [
      { label: "基础信息配置", path: "/admin/basic-info", icon: Settings },
      { label: "成员管理", path: "/admin/members", icon: Users },
    ],
  },
  {
    label: "OpenClaw 权限配置",
    items: [
      { label: "模型配置", path: "/admin/model-config", icon: Brain },
      { label: "通道配置", path: "/admin/channel-config", icon: MessageSquare },
      { label: "技能配置", path: "/admin/skill-config", icon: Puzzle },
    ],
  },
  {
    label: "云设备配置",
    items: [
      { label: "镜像管理", path: "/admin/image-management", icon: HardDrive },
      { label: "网络管理", path: "/admin/security-group", icon: ShieldCheck },
    ],
  },
  {
    label: "运营监控",
    items: [
      { label: "OpenClaw 监控", path: "/admin/openclaw-monitor", icon: Activity },
      { label: "Tokens 监控", path: "/admin/tokens-monitor", icon: BarChart3 },
      { label: "运维观测", path: "/admin/ops-observation", icon: Gauge },
    ],
  },
  {
    label: "安全审计",
    items: [
      { label: "安全管理", path: "/admin/security-management", icon: Shield },
      { label: "会话管理", path: "/admin/session-management", icon: MessageSquare },
      { label: "操作记录", path: "/admin/audit-log", icon: ClipboardList },
    ],
  },

];

const CURRENT_ADMIN = "alice@acompany.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const savedScrollTop = useRef<number>(0);

  // 路由变化时恢复侧边栏滚动位置
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // 先恢复之前保存的滚动位置
    nav.scrollTop = savedScrollTop.current;
  }, [location]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F2F8" }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-40"
        style={{ boxShadow: "1px 0 0 0 rgba(0,0,0,0.04)" }}>
        {/* Logo */}
        <div className="px-5 border-b border-gray-100">
          <div className="h-16 flex items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                🦞
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">管控端</p>
                <p className="text-xs text-gray-400">OpenClaw Enterprise</p>
              </div>
            </div>
          </div>
          {/* 前往员工端 */}
          <Link href="/my-openclaw">
            <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 cursor-pointer group">
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-blue-600" />
              <span>前往员工端</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav
          ref={navRef}
          className="flex-1 overflow-y-auto py-4 px-3"
          onScroll={(e) => { savedScrollTop.current = (e.currentTarget as HTMLElement).scrollTop; }}
        >
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups.has(group.label);
            return (
              <div key={group.label} className="mb-4">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                >
                  <span>{group.label}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = location === item.path || location.startsWith(item.path + "/");
                      const isComingSoon = COMING_SOON_PATHS.has(item.path);
                      const Icon = item.icon;

                      // 确定样式
                      let bgClass = "";
                      let textClass = "";
                      let iconClass = "";
                      let borderStyle = {};

                      if (isComingSoon) {
                        // "即将开放"项的样式
                        if (isActive) {
                          // Active状态：浅灰色背景 + 灰色边框
                          bgClass = "bg-gray-100";
                          textClass = "text-gray-600";
                          iconClass = "text-gray-400";
                          borderStyle = { borderLeft: "2px solid #D1D5DB", paddingLeft: "calc(0.75rem - 2px)" };
                        } else {
                          // 未active状态：无背景色，颜色与普通菜单项一致
                          bgClass = "hover:bg-gray-50";
                          textClass = "text-gray-600 hover:text-gray-900";
                          iconClass = "text-gray-400";
                        }
                      } else {
                        // 普通项的样式
                        if (isActive) {
                          bgClass = "bg-blue-50";
                          textClass = "text-blue-600";
                          iconClass = "text-blue-600";
                          borderStyle = { borderLeft: "2px solid #007AFF", paddingLeft: "calc(0.75rem - 2px)" };
                        } else {
                          bgClass = "hover:bg-gray-50";
                          textClass = "text-gray-600 hover:text-gray-900";
                          iconClass = "text-gray-400";
                        }
                      }

                      return (
                        <Link key={item.path} href={item.path}>
                          <div
                            className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${bgClass} ${textClass}`}
                            style={borderStyle}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${iconClass}`} />
                              <span className="truncate">{item.label}</span>
                              {isComingSoon && (
                                <span className="font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ml-1" style={{ fontSize: '10px' }}>
                                  即将开放
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-gray-100 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="text-xs font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                    {CURRENT_ADMIN.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-gray-900 truncate">{CURRENT_ADMIN}</p>
                  <p className="text-xs text-gray-400">管理员</p>
                </div>
                <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuItem onClick={() => toast.info("已退出登录")} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
