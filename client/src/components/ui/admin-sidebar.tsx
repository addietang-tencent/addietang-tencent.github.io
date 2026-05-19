import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminSidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
};

const AdminSidebarContext = React.createContext<AdminSidebarContextValue | null>(null);

function useAdminSidebar() {
  const context = React.useContext(AdminSidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within AdminSidebarProvider.");
  }
  return context;
}

function AdminSidebarProvider({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  children,
}: {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      onCollapsedChange?.(nextCollapsed);
      if (collapsedProp === undefined) {
        setInternalCollapsed(nextCollapsed);
      }
    },
    [collapsedProp, onCollapsedChange]
  );

  const toggleSidebar = React.useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, toggleSidebar }),
    [collapsed, setCollapsed, toggleSidebar]
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

const AdminSidebar = React.forwardRef<HTMLElement, React.ComponentProps<"aside">>(
  ({ className, style, ...props }, ref) => {
    const { collapsed } = useAdminSidebar();

    return (
      <aside
        ref={ref}
        data-slot="admin-sidebar"
        data-state={collapsed ? "collapsed" : "expanded"}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r bg-[var(--admin-sidebar-bg)] transition-[width] duration-300",
          "border-[var(--admin-sidebar-border)]",
          collapsed ? "w-[var(--admin-sidebar-width-collapsed)]" : "w-[var(--admin-sidebar-width)]",
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
AdminSidebar.displayName = "AdminSidebar";

const AdminSidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="admin-sidebar-header"
      className={cn(
        "flex h-[var(--admin-sidebar-header-height)] shrink-0 items-center justify-between border-b border-[var(--admin-sidebar-border)] px-4",
        className
      )}
      {...props}
    />
  )
);
AdminSidebarHeader.displayName = "AdminSidebarHeader";

const AdminSidebarLogo = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      width="36"
      height="28"
      viewBox="0 0 36 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M23.6238 20.7044L23.6252 20.7055L20.4357 24.3263C18.6332 26.3722 16.038 27.5442 13.3114 27.5442H9.73657V23.6673H13.3114C14.9247 23.6673 16.4602 22.9739 17.5267 21.7634L20.8349 18.0085C21.8951 16.8052 23.4215 16.1157 25.0252 16.1157H26.7467C27.1043 16.1157 27.2948 16.5374 27.0584 16.8057L23.6238 20.7044Z" fill="url(#admin-sidebar-logo-a)" />
      <path d="M26.2641 12.2392H22.6892C21.076 12.2393 19.5405 12.9326 18.474 14.1431L15.1658 17.898C14.1056 19.1013 12.5792 19.7908 10.9754 19.7908H9.24722C8.88966 19.7908 8.69918 19.3691 8.93554 19.1008L12.1913 15.4055C12.2138 15.3827 12.2357 15.3593 12.257 15.3351L15.565 11.5802C17.3674 9.53434 19.9626 8.36233 22.6892 8.3623H26.2641V12.2392Z" fill="url(#admin-sidebar-logo-b)" />
      <path d="M26.2644 8.36292C31.5608 8.36308 35.8542 12.6573 35.8543 17.9537C35.854 23.1556 31.713 27.3896 26.5467 27.5397C26.5374 27.5399 26.5276 27.5394 26.5183 27.5397V27.5406H26.5008V27.5436H23.699C23.3415 27.5435 23.1512 27.1214 23.3875 26.8531L26.0301 23.8541C26.1336 23.7366 26.2818 23.6686 26.4383 23.6666L26.4392 23.6637C29.5129 23.5717 31.9771 21.0504 31.9773 17.9537C31.9773 14.7985 29.4197 12.24 26.2644 12.2399V8.36292Z" fill="url(#admin-sidebar-logo-c)" />
      <path d="M17.9992 0.0976562C21.9114 0.0976562 25.3907 1.94864 27.611 4.82213C27.8145 5.08551 27.62 5.45547 27.2872 5.45547H26.2944C26.2843 5.45545 26.2742 5.4552 26.2641 5.4552H22.8936C22.7803 5.4552 22.67 5.42001 22.5758 5.35719C21.2655 4.48395 19.6919 3.97458 17.9992 3.97458C13.4637 3.97466 9.78227 7.62843 9.73635 12.153V12.2398C6.58097 12.2398 4.02296 14.7979 4.02292 17.9532C4.02296 21.1086 6.58097 23.6664 9.73635 23.6664V27.5433C4.43981 27.5433 0.146034 23.2498 0.145996 17.9532C0.146024 13.8692 2.69891 10.3818 6.29591 8.99895C7.71347 3.86665 12.416 0.0977252 17.9992 0.0976562Z" fill="#1447E6" />
      <defs>
        <linearGradient id="admin-sidebar-logo-a" x1="11.6207" y1="25.6058" x2="28.3904" y2="25.6058" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1447E6" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
        <linearGradient id="admin-sidebar-logo-b" x1="24.3799" y1="10.3007" x2="7.60998" y2="10.3007" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1447E6" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
        <linearGradient id="admin-sidebar-logo-c" x1="28.3202" y1="12.5381" x2="28.3483" y2="27.0011" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1447E6" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
      </defs>
    </svg>
  )
);
AdminSidebarLogo.displayName = "AdminSidebarLogo";

const AdminSidebarBrand = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { asChild?: boolean }>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        data-slot="admin-sidebar-brand"
        className={cn(
          "flex min-w-0 items-center gap-2.5 rounded-[4px] text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]",
          className
        )}
        {...props}
      />
    );
  }
);
AdminSidebarBrand.displayName = "AdminSidebarBrand";

const AdminSidebarHeaderAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-slot="admin-sidebar-header-action"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-[var(--admin-sidebar-action-border)] bg-[var(--admin-sidebar-action-bg)] text-[var(--admin-sidebar-foreground)] outline-none transition-[background,border-color,color,box-shadow] duration-150 hover:text-[var(--admin-sidebar-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] [&>svg]:size-4",
          className
        )}
        {...props}
      />
    );
  }
);
AdminSidebarHeaderAction.displayName = "AdminSidebarHeaderAction";

const AdminSidebarContent = React.forwardRef<HTMLElement, React.ComponentProps<"nav">>(
  ({ className, onScroll, onWheel, ...props }, ref) => {
    const [isScrolling, setIsScrolling] = React.useState(false);
    const hideTimerRef = React.useRef<ReturnType<typeof window.setTimeout> | null>(null);

    const showScrollbarTemporarily = React.useCallback(() => {
      setIsScrolling(true);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        hideTimerRef.current = null;
      }, 700);
    }, []);

    React.useEffect(() => {
      return () => {
        if (hideTimerRef.current) {
          window.clearTimeout(hideTimerRef.current);
        }
      };
    }, []);

    return (
      <nav
        ref={ref}
        data-slot="admin-sidebar-content"
        data-scrolling={isScrolling ? "true" : "false"}
        className={cn("scrollbar-on-hover min-h-0 flex-1 overflow-y-auto px-4 py-4", className)}
        onScroll={(event) => {
          showScrollbarTemporarily();
          onScroll?.(event);
        }}
        onWheel={(event) => {
          showScrollbarTemporarily();
          onWheel?.(event);
        }}
        {...props}
      />
    );
  }
);
AdminSidebarContent.displayName = "AdminSidebarContent";

type AdminSidebarGroupContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AdminSidebarGroupContext = React.createContext<AdminSidebarGroupContextValue | null>(null);

function useAdminSidebarGroup() {
  const context = React.useContext(AdminSidebarGroupContext);
  if (!context) {
    throw new Error("useAdminSidebarGroup must be used within AdminSidebarGroup.");
  }
  return context;
}

const AdminSidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { defaultOpen?: boolean }>(
  ({ defaultOpen = true, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const value = React.useMemo(() => ({ open, setOpen }), [open]);

    return (
      <AdminSidebarGroupContext.Provider value={value}>
        <div
          ref={ref}
          data-slot="admin-sidebar-group"
          data-state={open ? "open" : "closed"}
          className={cn("mb-5 last:mb-0", className)}
          {...props}
        />
      </AdminSidebarGroupContext.Provider>
    );
  }
);
AdminSidebarGroup.displayName = "AdminSidebarGroup";

const AdminSidebarGroupTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useAdminSidebarGroup();

    return (
      <button
        ref={ref}
        type="button"
        data-slot="admin-sidebar-group-trigger"
        data-state={open ? "open" : "closed"}
        className={cn(
          "mb-2 flex h-5 w-full items-center justify-between px-2 text-left text-xs font-normal tracking-[0.015em] text-[var(--admin-sidebar-muted)] outline-none transition-colors hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        <span>{children}</span>
        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>
    );
  }
);
AdminSidebarGroupTrigger.displayName = "AdminSidebarGroupTrigger";

const AdminSidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="admin-sidebar-group-label"
      className={cn("mb-2 h-5 px-2 text-xs font-normal tracking-[0.015em] text-[var(--admin-sidebar-muted)]", className)}
      {...props}
    />
  )
);
AdminSidebarGroupLabel.displayName = "AdminSidebarGroupLabel";

const AdminSidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    const { open } = useAdminSidebarGroup();
    if (!open) return null;

    return (
      <div
        ref={ref}
        data-slot="admin-sidebar-group-content"
        className={cn("w-full", className)}
        {...props}
      />
    );
  }
);
AdminSidebarGroupContent.displayName = "AdminSidebarGroupContent";

const AdminSidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="admin-sidebar-menu"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    />
  )
);
AdminSidebarMenu.displayName = "AdminSidebarMenu";

const AdminSidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="admin-sidebar-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
);
AdminSidebarMenuItem.displayName = "AdminSidebarMenuItem";

const adminSidebarMenuButtonVariants = cva(
  "flex h-[var(--admin-sidebar-item-height)] w-full items-center gap-2 rounded-[var(--admin-sidebar-item-radius)] px-2 text-left text-[13px] leading-5 tracking-[0.005em] text-[var(--admin-sidebar-foreground)] outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] data-[active=true]:font-medium [&>img]:size-4 [&>img]:shrink-0 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        default: "",
        muted: "text-[var(--admin-sidebar-muted)]",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
);

const AdminSidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof adminSidebarMenuButtonVariants> & {
      asChild?: boolean;
      isActive?: boolean;
    }
>(({ asChild = false, isActive = false, tone, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="admin-sidebar-menu-button"
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(adminSidebarMenuButtonVariants({ tone }), className)}
      {...props}
    />
  );
});
AdminSidebarMenuButton.displayName = "AdminSidebarMenuButton";

const AdminSidebarBadge = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span"> & { variant?: "new" | "coming-soon" }>(
  ({ variant = "new", className, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="admin-sidebar-badge"
      data-variant={variant}
      className={cn(
        "ml-auto inline-flex h-[18px] shrink-0 items-center justify-center rounded-[2px] bg-[var(--admin-sidebar-badge-bg)] px-1 text-[10px] font-semibold leading-none tracking-[0.015em] text-[var(--admin-sidebar-muted)]",
        variant === "new" ? "w-[31px] font-['Open_Sans']" : "w-auto",
        className
      )}
      {...props}
    >
      {children ?? (variant === "new" ? "New" : "即将开放")}
    </span>
  )
);
AdminSidebarBadge.displayName = "AdminSidebarBadge";

const AdminSidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="admin-sidebar-footer"
      className={cn(
        "flex h-[var(--admin-sidebar-footer-height)] shrink-0 items-center gap-2 border-t border-[var(--admin-sidebar-border)] px-6",
        className
      )}
      {...props}
    />
  )
);
AdminSidebarFooter.displayName = "AdminSidebarFooter";

const AdminSidebarUser = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { name: string; role: string; fallback?: string }>(
  ({ name, role, fallback, className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="admin-sidebar-user"
      className={cn("flex min-w-0 flex-1 items-center gap-2.5", className)}
      {...props}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-green-600 to-green-700 font-mono text-sm text-white">
        {fallback ?? name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-5 tracking-[0.005em] text-[var(--admin-sidebar-foreground)]">{name}</p>
        <p className="truncate text-xs font-normal leading-5 tracking-[0.015em] text-[var(--admin-sidebar-foreground)]">{role}</p>
      </div>
    </div>
  )
);
AdminSidebarUser.displayName = "AdminSidebarUser";

const AdminSidebarFooterAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-slot="admin-sidebar-footer-action"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--admin-sidebar-muted)] outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] [&>svg]:size-4",
          className
        )}
        {...props}
      />
    );
  }
);
AdminSidebarFooterAction.displayName = "AdminSidebarFooterAction";

const AdminSidebarInset = React.forwardRef<HTMLElement, React.ComponentProps<"main">>(
  ({ className, style, ...props }, ref) => {
    const { collapsed } = useAdminSidebar();

    return (
      <main
        ref={ref}
        data-slot="admin-sidebar-inset"
        data-state={collapsed ? "collapsed" : "expanded"}
        className={cn("min-h-screen flex-1 min-w-0 overflow-x-hidden transition-[margin-left] duration-300", className)}
        style={{ marginLeft: collapsed ? "var(--admin-sidebar-width-collapsed)" : "var(--admin-sidebar-width)", ...style }}
        {...props}
      />
    );
  }
);
AdminSidebarInset.displayName = "AdminSidebarInset";

const AdminSidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ asChild = false, className, children, onClick, ...props }, ref) => {
    const { toggleSidebar } = useAdminSidebar();
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-slot="admin-sidebar-trigger"
        className={cn(
          "flex size-8 items-center justify-center rounded-lg text-[var(--admin-sidebar-muted)] transition-colors hover:bg-gray-50 hover:text-gray-900 [&>svg]:size-4",
          className
        )}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        {children ?? <PanelLeft className="size-4" />}
      </Comp>
    );
  }
);
AdminSidebarTrigger.displayName = "AdminSidebarTrigger";

export {
  AdminSidebar,
  AdminSidebarBadge,
  AdminSidebarBrand,
  AdminSidebarContent,
  AdminSidebarFooter,
  AdminSidebarFooterAction,
  AdminSidebarGroup,
  AdminSidebarGroupContent,
  AdminSidebarGroupLabel,
  AdminSidebarGroupTrigger,
  AdminSidebarHeader,
  AdminSidebarHeaderAction,
  AdminSidebarInset,
  AdminSidebarLogo,
  AdminSidebarMenu,
  AdminSidebarMenuButton,
  AdminSidebarMenuItem,
  AdminSidebarProvider,
  AdminSidebarTrigger,
  AdminSidebarUser,
  useAdminSidebar,
};
