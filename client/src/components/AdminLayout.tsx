import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ExternalLink, LogOut, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import AdminModeToggle from "@/components/AdminModeToggle";
import AdminNoticeBar from "@/components/AdminNoticeBar";
import {
  AdminSidebar,
  AdminSidebarBadge,
  AdminSidebarBrand,
  AdminSidebarContent,
  AdminSidebarFooter,
  AdminSidebarFooterAction,
  AdminSidebarGroup,
  AdminSidebarGroupContent,
  AdminSidebarGroupTrigger,
  AdminSidebarHeader,
  AdminSidebarHeaderAction,
  AdminSidebarInset,
  AdminSidebarLogo,
  AdminSidebarMenu,
  AdminSidebarMenuButton,
  AdminSidebarMenuItem,
  AdminSidebarProvider,
  AdminSidebarUser,
} from "@/components/ui/admin-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminModeProvider } from "@/contexts/AdminModeContext";
import { ADMIN_NAV_GROUPS } from "@/config/adminNav";

const CURRENT_ADMIN = {
  name: "jingsujiang",
  role: "管理员",
};

function isActiveRoute(location: string, href: string) {
  return location === href || location.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <AdminModeProvider>
      <AdminSidebarProvider>
        <div className="flex min-h-screen admin-theme" style={{ background: "#FFFFFF" }}>
          <AdminSidebar>
            <AdminSidebarHeader>
              <AdminSidebarBrand asChild>
                <Link href="/" aria-label="返回首页" className="group">
                  <AdminSidebarLogo className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-5 tracking-[0.005em] text-[var(--admin-sidebar-foreground)] group-hover:text-[#1447e6]">管控端</p>
                    <p className="truncate text-xs font-normal leading-5 tracking-[0.015em] text-[var(--admin-sidebar-muted)] group-hover:text-[#1447e6]">ClawPro Admin</p>
                  </div>
                </Link>
              </AdminSidebarBrand>

              <AdminSidebarHeaderAction asChild title="前往用户端">
                <Link href="/my-openclaw" aria-label="前往用户端" className="!border !border-[#e3e3e3] !rounded-[4px] !bg-white hover:!text-[#1447e6]">
                  <ExternalLink />
                </Link>
              </AdminSidebarHeaderAction>
            </AdminSidebarHeader>

            <AdminSidebarContent aria-label="管理后台导航">
              {ADMIN_NAV_GROUPS.map((group) => (
                <AdminSidebarGroup key={group.label} defaultOpen>
                  <AdminSidebarGroupTrigger>{group.label}</AdminSidebarGroupTrigger>
                  <AdminSidebarGroupContent>
                    <AdminSidebarMenu>
                      {group.items.map((item) => {
                        const isActive = isActiveRoute(location, item.href);

                        return (
                          <AdminSidebarMenuItem key={item.href}>
                            <AdminSidebarMenuButton asChild isActive={isActive}>
                              <Link href={item.href}>
                                {item.iconSrc ? (
                                  <img src={item.iconSrc} alt="" className="size-4 shrink-0" aria-hidden="true" />
                                ) : (
                                  <span className="size-4 shrink-0" aria-hidden="true" />
                                )}
                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                {item.badge && <AdminSidebarBadge variant={item.badge} />}
                              </Link>
                            </AdminSidebarMenuButton>
                          </AdminSidebarMenuItem>
                        );
                      })}
                    </AdminSidebarMenu>
                  </AdminSidebarGroupContent>
                </AdminSidebarGroup>
              ))}
            </AdminSidebarContent>

            <AdminSidebarFooter>
              <AdminSidebarUser name={CURRENT_ADMIN.name} role={CURRENT_ADMIN.role} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AdminSidebarFooterAction aria-label="更多管理操作">
                    <MoreHorizontal />
                  </AdminSidebarFooterAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-64">
                  <DropdownMenuLabel className="text-xs text-gray-500">成员管理模式</DropdownMenuLabel>
                  <div className="px-1 py-2" onClick={(event) => event.stopPropagation()}>
                    <AdminModeToggle collapsed={false} />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.info("已退出登录")} variant="destructive">
                    <LogOut className="size-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AdminSidebarFooter>
          </AdminSidebar>

          <AdminSidebarInset>
            <AdminNoticeBar />
            <div className="p-6">{children}</div>
          </AdminSidebarInset>
        </div>
      </AdminSidebarProvider>
    </AdminModeProvider>
  );
}
