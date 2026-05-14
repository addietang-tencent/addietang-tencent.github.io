export type AdminNavBadge = "new" | "coming-soon";

export type AdminNavItem = {
  label: string;
  href: string;
  iconSrc?: string | null;
  badge?: AdminNavBadge;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
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
      { label: "记忆管理", href: "/admin/memory-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/memory-management.svg` },
      { label: "网盘管理", href: "/admin/file-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/file-management.svg` },
    ],
  },
  {
    label: "云设备配置",
    items: [
      { label: "Agent 模板", href: "/admin/agent-template", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/agent-template.svg` },
      { label: "镜像管理", href: "/admin/image-management", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/image-management.svg` },
      { label: "网络管理", href: "/admin/security-group", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/network-management.svg` },
      { label: "云开发管理", href: "/admin/cloud-dev", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/cloud-dev.svg`, badge: "coming-soon" },
    ],
  },
  {
    label: "运营监控",
    items: [
      { label: "Agent 列表", href: "/admin/openclaw-monitor", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/agent-list.svg` },
      { label: "Tokens 监控", href: "/admin/tokens-monitor", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/tokens-monitor.svg` },
      { label: "运维观测", href: "/admin/ops-observation", iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/ops-observation.svg`, badge: "new" },
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
