/**
 * TenantLayout - 租户端布局
 * Design: 「流动蓝图」Fluid Blueprint
 * - 白色系背景 (#FAFBFF)
 * - 顶部固定导航栏 (64px)
 * - 主色 #007AFF
 */
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "我的 OpenClaw", path: "/my-openclaw" },
  { label: "模型额度", path: "/model-quota" },
  { label: "帮助文档", path: "/help-docs" },
];

const CURRENT_USER = "zhangsan@a-company.com";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

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
            {NAV_ITEMS.map((item) => {
              const isActive = location.startsWith(item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

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
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">当前账号</p>
                <p className="text-sm font-medium text-gray-900 truncate">{CURRENT_USER}</p>
              </div>
              <DropdownMenuItem onClick={() => window.location.href = '/reset-password'}>
                <KeyRound className="w-4 h-4 mr-2 text-gray-500" />
                重置密码
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("已退出登录")} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
