/**
 * 管控端导航配置
 * 数据驱动 AdminLayout 侧边栏渲染
 *
 * 注：badge 同时支持预设短语（"new" / "coming-soon"）和自定义文字（如 "原镜像管理"）
 * - 预设短语由 AdminSidebarBadge 组件渲染对应样式
 * - 自定义文字以普通灰色 chip 渲染
 */

export type AdminNavBadge = "new" | "coming-soon" | string;

export type AdminNavItem = {
  label: string;
  href: string;
  iconSrc?: string | null;
  badge?: AdminNavBadge;
};

/** 二级子分组（如「Agent 启动配置」嵌在「Agent 配置」下） */
export type AdminNavSubGroup = {
  label: string;
  /** lucide 图标名（如 "Layers"），可选；不填则用默认 */
  icon?: string;
  /** 默认展开 */
  defaultExpanded?: boolean;
  items: AdminNavItem[];
};

export type AdminNavGroup = {
  label: string;
  /** 直接归属于本组的菜单项 */
  items?: AdminNavItem[];
  /** 二级子分组（与 items 可共存） */
  subGroups?: AdminNavSubGroup[];
};

const ADMIN_SIDEBAR_ICON_BASE = "/assets/admin-sidebar";

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "基础信息",
    items: [
      { label: "基础信息配置", href: "/admin/basic-info", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/basic-info.svg` },
      { label: "平台策略", href: "/admin/platform-policy", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/platform-policy.svg` },
      { label: "用户管理", href: "/admin/members", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/user-management.svg` },
    ],
  },
  {
    label: "Agent 配置",
    items: [
      { label: "模型配置", href: "/admin/model-config", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/model-config.svg` },
      { label: "通道配置", href: "/admin/channel-config", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/channel-config.svg` },
      { label: "技能配置", href: "/admin/skill-config", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/skill-config.svg`, badge: "new" },
      { label: "Agent 工具库", href: "/admin/agent-tool-library", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/agent-tool-library.svg`, badge: "new" },
    ],
    subGroups: [
      {
        label: "Agent 启动配置",
        icon: "Layers",
        defaultExpanded: true,
        items: [
          { label: "Agent 类型", href: "/admin/agent-types", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/image-management.svg`, badge: "原镜像管理" },
          { label: "资源管理", href: "/admin/agent-template", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/agent-template.svg` },
          { label: "网络管理", href: "/admin/security-group", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/network-management.svg` },
        ],
      },
    ],
  },
  {
    label: "运维与观测",
    items: [
      { label: "Agent 列表", href: "/admin/openclaw-monitor", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/agent-list.svg` },
      { label: "Tokens 监控", href: "/admin/tokens-monitor", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/tokens-monitor.svg` },
      { label: "运维观测", href: "/admin/ops-observation", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/ops-observation.svg`, badge: "new" },
    ],
  },
  {
    label: "Agent 服务",
    items: [
      { label: "记忆管理", href: "/admin/memory-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/memory-management.svg` },
      { label: "网盘管理", href: "/admin/file-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/file-management.svg` },
      { label: "云开发管理", href: "/admin/cloud-dev", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/cloud-dev.svg`, badge: "coming-soon" },
    ],
  },
  {
    label: "安全审计",
    items: [
      { label: "AI Agent 安全", href: "/admin/security-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/ai-agent-security.svg`, badge: "new" },
      { label: "会话管理", href: "/admin/session-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/session-management.svg`, badge: "new" },
      { label: "操作记录", href: "/admin/audit-log", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/audit-log.svg` },
    ],
  },
];
