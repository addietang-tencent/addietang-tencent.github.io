/**
 * AdminLayout - 管控端布局
 * Design: 「流动蓝图」Fluid Blueprint
 * - 浅灰色背景 (#F0F2F8)
 * - 左侧固定导航栏 (256px)，白色背景，可缩进
 * - 主色 #007AFF，导航分组
 */
import { useState } from "react";
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
  ChevronLeft,
  MemoryStick,
  FolderOpen,
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

// 标记为「即将开放」的菜单项路径（灰色选中态，标签文案「即将开放」）
const COMING_SOON_PATHS = new Set([
  "/admin/memory-management",
  "/admin/file-management",
]);

// 标记为「功能上新」的菜单项路径（蓝色选中态，标签文案「功能上新」，橙色标签）
const NEW_FEATURE_PATHS = new Set([
  "/admin/ops-observation",
  "/admin/security-management",
  "/admin/session-management",
]);

const NAV_GROUPS = [
  {
    label: "基础信息",
    items: [
      { label: "基础信息配置", path: "/admin/basic-info", icon: Settings },
      { label: "用户管理", path: "/admin/members", icon: Users },
    ],
  },
  {
    label: "OpenClaw 配置",
    items: [
      { label: "模型配置", path: "/admin/model-config", icon: Brain },
      { label: "通道配置", path: "/admin/channel-config", icon: MessageSquare },
      { label: "技能配置", path: "/admin/skill-config", icon: Puzzle },
      { label: "记忆管理", path: "/admin/memory-management", icon: MemoryStick },
      { label: "文件管理", path: "/admin/file-management", icon: FolderOpen },
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
      { label: "AI Agent 安全", path: "/admin/security-management", icon: Shield },
      { label: "会话管理", path: "/admin/session-management", icon: MessageSquare },
      { label: "操作记录", path: "/admin/audit-log", icon: ClipboardList },
    ],
  },

];

const CURRENT_ADMIN = "alice@acompany.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
      <aside className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
        style={{ boxShadow: "1px 0 0 0 rgba(0,0,0,0.04)" }}>
        {/* Logo */}
        {!sidebarCollapsed && (
          <>
            <Link href="/">
            <div className="px-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
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
            </div>
            </Link>
              {/* 前往用户端 */}
              <div className="px-5">
              <Link href="/my-openclaw">
                <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 cursor-pointer group">
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-blue-600" />
                  <span>前往用户端</span>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* Navigation */}
        {!sidebarCollapsed && (
        <nav className="flex-1 overflow-y-auto py-4 px-3">
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
                      const isNewFeature = NEW_FEATURE_PATHS.has(item.path);
                      const Icon = item.icon;

                      // 确定样式
                      let bgClass = "";
                      let textClass = "";
                      let iconClass = "";
                      let borderStyle = {};

                      // 始终保留 2px 左边框占位（transparent），active 时显示颜色
                      const borderColor = isComingSoon
                        ? (isActive ? "#D1D5DB" : "transparent")
                        : (isActive ? "#007AFF" : "transparent");
                      borderStyle = { borderLeft: `2px solid ${borderColor}`, paddingLeft: "calc(0.75rem - 2px)" };

                      if (isComingSoon) {
                        // 即将开放：选中灰色
                        if (isActive) {
                          bgClass = "bg-gray-100";
                          textClass = "text-gray-600";
                          iconClass = "text-gray-400";
                        } else {
                          bgClass = "hover:bg-gray-50";
                          textClass = "text-gray-600 hover:text-gray-900";
                          iconClass = "text-gray-400";
                        }
                      } else {
                        // 正常项 & 功能上新：选中蓝色
                        if (isActive) {
                          bgClass = "bg-blue-50";
                          textClass = "text-blue-600";
                          iconClass = "text-blue-600";
                        } else {
                          bgClass = "hover:bg-gray-50";
                          textClass = "text-gray-600 hover:text-gray-900";
                          iconClass = "text-gray-400";
                        }
                      }

                      return (
                        <Link key={item.path} href={item.path}>
                          <div
                            className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer relative z-0 ${bgClass} ${textClass}`}
                            style={borderStyle}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0 relative z-10">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${iconClass}`} />
                              <span className="truncate">{item.label}</span>
                              {isComingSoon && (
                                <span className="font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ml-1" style={{ fontSize: '10px' }}>
                                  即将开放
                                </span>
                              )}
                            {isNewFeature && (
                                <span className="font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ml-1 relative z-10" style={{ fontSize: '10px', color: '#fff', background: '#007AFF', letterSpacing: '0.02em' }}>
                                  new
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
        )}
        
        {/* Collapsed Sidebar - Clickable Area */}
        {sidebarCollapsed && (
          <>
            <div className="h-16 flex items-center justify-between border-b border-gray-100 px-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                onClick={() => setSidebarCollapsed(false)}
                title="展开侧边栏">
                🦞
              </div>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                title="展开侧边栏"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1" />
          </>
        )}

        {/* User Footer */}
        {!sidebarCollapsed && (
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
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? "ml-20" : "ml-64"
      }`}>
        {/* Top Bar with Collapse Button */}
        {sidebarCollapsed && (
          <div className="h-16 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-30" style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.04)" }}>
            <div className="ml-auto">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                title="展开侧边栏"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className={sidebarCollapsed ? "p-6 pt-0" : "p-6"}>
          {children}
        </div>
      </main>
      
      {/* Collapse Button in Header when Sidebar is Expanded */}
      {!sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="fixed top-4 left-56 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 z-50"
          title="收起侧边栏"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
