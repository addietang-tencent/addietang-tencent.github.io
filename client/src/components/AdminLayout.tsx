import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, ChevronRight, Layers, LogOut, MoreHorizontal } from "lucide-react";
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
import { ADMIN_NAV_GROUPS, type AdminNavItem, type AdminNavSubGroup } from "@/config/adminNav";

const CURRENT_ADMIN = {
  name: "jingsujiang",
  role: "管理员",
};

/** badge 预设短语集合（其余值视为自定义文字） */
const PRESET_BADGE_VARIANTS = new Set(["new", "coming-soon"]);

function GoTenantIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6.8326 9.8327H4.8326C2.9917 9.8327 1.49927 11.3251 1.49927 13.166V13.8327H6.8665M12.1939 14.1673L14.5007 11.8339L12.1939 9.5007M13.8326 11.834H8.8313M10.1659 4.8327C10.1659 6.4895 8.8228 7.8327 7.1659 7.8327C5.5091 7.8327 4.1659 6.4895 4.1659 4.8327C4.1659 3.1758 5.5091 1.8327 7.1659 1.8327C8.8228 1.8327 10.1659 3.1758 10.1659 4.8327Z"
        stroke="currentColor"
        strokeLinecap="square"
      />
    </svg>
  );
}

function isActiveRoute(location: string, href: string) {
  return location === href || location.startsWith(`${href}/`);
}

/** 渲染单个菜单项（含图标、文字、徽章）
 *  isSubItem=true 时：左边距加深 + 不显示自身图标（与 main 行为一致）
 */
function renderNavItem(item: AdminNavItem, location: string, isSubItem = false) {
  const isActive = isActiveRoute(location, item.href);

  let badgeNode: ReactNode = null;
  if (item.badge) {
    if (PRESET_BADGE_VARIANTS.has(item.badge)) {
      badgeNode = <AdminSidebarBadge variant={item.badge as "new" | "coming-soon"} />;
    } else {
      // 自定义文字徽章：复用同一组件，传入 children 覆盖默认文案
      badgeNode = <AdminSidebarBadge variant="coming-soon">{item.badge}</AdminSidebarBadge>;
    }
  }

  return (
    <AdminSidebarMenuItem key={item.href}>
      <AdminSidebarMenuButton
        asChild
        isActive={isActive}
        className={isSubItem ? "pl-7" : undefined}
      >
        <Link href={item.href}>
          {!isSubItem && (
            item.iconSrc ? (
              <img src={item.iconSrc} alt="" className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <span className="size-4 shrink-0" aria-hidden="true" />
            )
          )}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {badgeNode}
        </Link>
      </AdminSidebarMenuButton>
    </AdminSidebarMenuItem>
  );
}

/** 二级子分组：渲染为「可折叠的菜单项」（带图标 + 文字 + 折叠箭头），打开后子项缩进显示 */
function SubGroupBlock({ subGroup, location }: { subGroup: AdminNavSubGroup; location: string }) {
  const [open, setOpen] = useState(subGroup.defaultExpanded ?? true);
  const Icon = subGroup.icon === "Layers" ? Layers : Layers; // 目前仅 Layers，后续如需扩展可加映射

  return (
    <>
      <AdminSidebarMenuItem>
        <AdminSidebarMenuButton
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? "收起" : "展开"}${subGroup.label}`}
        >
          <Icon className="size-4 shrink-0 text-[var(--admin-sidebar-muted)]" />
          <span className="min-w-0 flex-1 truncate">{subGroup.label}</span>
          {open ? (
            <ChevronDown className="size-3 shrink-0 text-[var(--admin-sidebar-muted)]" />
          ) : (
            <ChevronRight className="size-3 shrink-0 text-[var(--admin-sidebar-muted)]" />
          )}
        </AdminSidebarMenuButton>
      </AdminSidebarMenuItem>
      {open && subGroup.items.map((item) => renderNavItem(item, location, true))}
    </>
  );
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
                <Link href="/" aria-label="返回首页">
                  <AdminSidebarLogo className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-5 tracking-[0.005em] text-[var(--admin-sidebar-foreground)] group-hover:text-[#355EF1]">管控端</p>
                    <p className="truncate text-xs font-normal leading-5 tracking-[0.015em] text-[var(--admin-sidebar-muted)] group-hover:text-[#355EF1]">ClawPro Admin</p>
                  </div>
                </Link>
              </AdminSidebarBrand>

              <AdminSidebarHeaderAction asChild className="mt-2 size-auto w-full gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] font-normal">
                <Link href="/my-openclaw">
                  <GoTenantIcon />
                  <span>前往用户端</span>
                </Link>
              </AdminSidebarHeaderAction>
            </AdminSidebarHeader>

            <AdminSidebarContent aria-label="管理后台导航">
              {ADMIN_NAV_GROUPS.map((group) => (
                <AdminSidebarGroup key={group.label} defaultOpen>
                  <AdminSidebarGroupTrigger>{group.label}</AdminSidebarGroupTrigger>
                  <AdminSidebarGroupContent>
                    <AdminSidebarMenu>
                      {/* 一级菜单项 */}
                      {group.items?.map((item) => renderNavItem(item, location))}
                      {/* 二级子分组：作为可折叠菜单项混排在一级里 */}
                      {group.subGroups?.map((sub) => (
                        <SubGroupBlock key={sub.label} subGroup={sub} location={location} />
                      ))}
                    </AdminSidebarMenu>
                  </AdminSidebarGroupContent>
                </AdminSidebarGroup>
              ))}
            </AdminSidebarContent>

            <AdminSidebarFooter>
              <AdminSidebarUser name={CURRENT_ADMIN.name} role={CURRENT_ADMIN.role} />
              <DropdownMenu modal={false}>
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
            <div className="px-9 py-8">{children}</div>
          </AdminSidebarInset>
        </div>
      </AdminSidebarProvider>
    </AdminModeProvider>
  );
}
