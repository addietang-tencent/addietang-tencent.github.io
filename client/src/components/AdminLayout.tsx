/**
 * AdminLayout - 管控端布局
 * Design: 「流动蓝图」Fluid Blueprint
 * - 浅灰色背景 (#F0F2F8)
 * - 左侧固定导航栏 (256px)，白色背景
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
  Server,
  Activity,
  BarChart3,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  ExternalLink,
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

const NAV_GROUPS = [
  {
    label: "基础信息",
    items: [
      { label: "基础信息配置", path: "/admin/basic-info", icon: Settings },
      { label: "成员管理", path: "/admin/members", icon: Users },
    ],
  },
  {
    label: "企业版 OpenClaw 配置",
    items: [
      { label: "模型配置", path: "/admin/model-config", icon: Brain },
      { label: "通道配置", path: "/admin/channel-config", icon: MessageSquare },
      { label: "文档管理", path: "/admin/doc-management", icon: FileText },
    ],
  },
  {
    label: "底层云端设备配置",
    items: [
      { label: "云服务器管理", path: "/admin/server-management", icon: Server },
    ],
  },
  {
    label: "运营监控",
    items: [
      { label: "OpenClaw 监控", path: "/admin/openclaw-monitor", icon: Activity },
      { label: "Tokens 监控", path: "/admin/tokens-monitor", icon: BarChart3 },
    ],
  },
  {
    label: "操作审计",
    items: [
      { label: "操作记录", path: "/admin/audit-log", icon: ClipboardList },
    ],
  },
];

const CURRENT_ADMIN = "alice@acompany.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
                      const Icon = item.icon;
                      return (
                        <Link key={item.path} href={item.path}>
                          <div
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                              isActive
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                            style={isActive ? { borderLeft: "2px solid #007AFF", paddingLeft: "calc(0.75rem - 2px)" } : {}}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                            {item.label}
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
