/**
 * StatusBadge - Agent 卡片状态标签
 * 8 种状态：creating / createFail / running / shutdown / loading / loadFail / maintaining / pending
 *
 * 严格对齐 Figma node 358:598「运行 icon」组件集合：
 *   - 16×16 SVG 状态图标 + 12/20 黑字（#020617）
 *   - 透明底、border-radius 2px、padding 2px 0、height 20px、gap 4px
 *   - loading 状态：箭头图标自旋
 *   - 其余状态：静态 SVG（运行中/创建中/创建失败/已关机/加载失败/维护中/待处理）
 */
import type { CSSProperties, ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type OpenClawStatus =
  | "creating"
  | "createFail"
  | "running"
  | "shutdown"
  | "loading"
  | "loadFail"
  | "maintaining"
  | "pending";

interface StatusConfigItem {
  label: string;
  tooltipText?: string;
}

export const STATUS_VISUAL: Record<OpenClawStatus, StatusConfigItem> = {
  creating: { label: "创建中", tooltipText: "正在创建中，请稍候" },
  createFail: { label: "创建失败", tooltipText: "创建失败，可删除后重新创建" },
  running: { label: "运行中" },
  shutdown: { label: "已关机", tooltipText: "已关机，如需恢复请联系管理员" },
  loading: { label: "加载中", tooltipText: "加载中，请稍候" },
  loadFail: { label: "加载失败", tooltipText: "加载失败，可点击重试恢复" },
  maintaining: { label: "维护中", tooltipText: "维护中，请稍候" },
  pending: { label: "待处理", tooltipText: "已停用，请联系管理员处理" },
};

/** 是否禁用交互（按钮、卡片点击）。从 STATUS_VISUAL 派生方便页面使用 */
export const STATUS_DISABLED: Record<OpenClawStatus, boolean> = {
  creating: true,
  createFail: true,
  running: false,
  shutdown: true,
  loading: true,
  loadFail: true,
  maintaining: true,
  pending: true,
};

/** 头像是否灰显 */
export const STATUS_GRAY_AVATAR: Record<OpenClawStatus, boolean> = {
  creating: false,
  createFail: true,
  running: false,
  shutdown: true,
  loading: false,
  loadFail: true,
  maintaining: false,
  pending: true,
};

/* -------------------------------------------------------------------------- */
/*                              状态 SVG（inline）                              */
/*  内容来源：client/src/assets/agent-card/status-*.svg（来自 Figma 官方导出）       */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string; style?: CSSProperties };

const SIZE = 16;
const SVG_BASE = {
  width: SIZE,
  height: SIZE,
  viewBox: "0 0 16 16",
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg",
};

const RunningIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <circle cx="8" cy="8" r="5.25" stroke="#16A34A" strokeWidth="1.5" />
    <path
      d="M5.0332 8.45264C5.39402 7.95189 6.3374 7.22542 7.5 8.00049C8.99978 9.00031 9.50022 9.00034 11 8.00049C10.9997 9.65713 9.6567 11.0005 8 11.0005C6.49696 11.0005 5.25139 9.89479 5.0332 8.45264Z"
      fill="#16A34A"
    />
  </svg>
);

const CreatingIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path d="M8 10L11 14H5L8 10Z" fill="#1447E6" />
    <path
      d="M8 2C11.3137 2 14 4.68629 14 8C14 9.96275 13.0566 11.7042 11.5996 12.7988L10.7002 11.5996C11.7929 10.7786 12.5 9.47202 12.5 8C12.5 5.51472 10.4853 3.5 8 3.5C5.51472 3.5 3.5 5.51472 3.5 8C3.5 9.47174 4.20645 10.7786 5.29883 11.5996L4.39941 12.7988C2.94273 11.7041 2 9.96247 2 8C2 4.68629 4.68629 2 8 2Z"
      fill="#1447E6"
    />
    <path
      d="M8 5C9.65685 5 11 6.34315 11 8C11 8.98151 10.5265 9.85014 9.79785 10.3975L8.89844 9.19824C9.26283 8.92458 9.5 8.49079 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.49051 6.73655 8.92456 7.10059 9.19824L6.20117 10.3975C5.47283 9.85011 5 8.98123 5 8C5 6.34315 6.34315 5 8 5Z"
      fill="#1447E6"
    />
  </svg>
);

const CreateFailIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path
      d="M4.93262 2.6875H11.0664L14.1338 8L11.0664 13.3125H4.93262L1.86523 8L4.93262 2.6875Z"
      stroke="#D42A1E"
      strokeWidth="1.5"
    />
    <path d="M8 5V8.5" stroke="#D42A1E" strokeWidth="1.5" />
    <path d="M8 9.5V11" stroke="#D42A1E" strokeWidth="1.5" />
  </svg>
);

const ShutdownIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path d="M8.75 2V8H7.25V2H8.75Z" fill="#858D99" />
    <path
      d="M10 2.3418C12.3303 3.1655 14 5.38761 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 5.38761 3.66968 3.1655 6 2.3418V3.96777C4.51828 4.70413 3.5 6.23314 3.5 8C3.5 10.4853 5.51472 12.5 8 12.5C10.4853 12.5 12.5 10.4853 12.5 8C12.5 6.23314 11.4817 4.70413 10 3.96777V2.3418Z"
      fill="#858D99"
    />
  </svg>
);

const LoadingIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path
      d="M7.32836 3.83878C6.56716 3.83878 5.89552 4.01855 5.26866 4.33316C3.56716 5.00732 2.35821 6.71518 2.35821 8.69271C2.35821 9.72642 2.67164 10.6253 3.20896 11.3893C2.44776 10.4006 2 9.14215 2 7.79383C2 4.46799 4.68657 1.77136 8 1.77136C9.52239 1.77136 10.9104 2.35563 11.9403 3.25451L10.2836 4.91743C9.47761 4.24327 8.44776 3.83878 7.32836 3.83878ZM12.5224 3.83878C13.1493 4.60282 13.5522 5.63653 13.5522 6.71518C13.5522 7.47923 13.3731 8.15338 13.0597 8.7826C12.3881 10.4905 10.6866 11.7039 8.71642 11.7039C7.32836 11.7039 6.02985 11.0747 5.1791 10.1309L3.52239 11.7489C4.64179 13.0073 6.20895 13.7714 8 13.7714C11.3134 13.7714 14 11.0747 14 7.74889C14 6.26574 13.4179 4.91743 12.5224 3.83878Z"
      fill="#1447E6"
    />
  </svg>
);

const LoadFailIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path
      d="M7.32836 3.83878C6.56716 3.83878 5.89552 4.01855 5.26866 4.33316C3.56716 5.00732 2.35821 6.71518 2.35821 8.69271C2.35821 9.72642 2.67164 10.6253 3.20896 11.3893C2.44776 10.4006 2 9.14215 2 7.79383C2 4.46799 4.68657 1.77136 8 1.77136C9.52239 1.77136 10.9104 2.35563 11.9403 3.25451L10.2836 4.91743C9.47761 4.24327 8.44776 3.83878 7.32836 3.83878ZM12.5224 3.83878C13.1493 4.60282 13.5522 5.63653 13.5522 6.71518C13.5522 7.47923 13.3731 8.15338 13.0597 8.7826C12.3881 10.4905 10.6866 11.7039 8.71642 11.7039C7.32836 11.7039 6.02985 11.0747 5.1791 10.1309L3.52239 11.7489C4.64179 13.0073 6.20895 13.7714 8 13.7714C11.3134 13.7714 14 11.0747 14 7.74889C14 6.26574 13.4179 4.91743 12.5224 3.83878Z"
      fill="#D42A1E"
    />
    <path d="M8 5V8.5" stroke="#D42A1E" strokeWidth="1.5" />
    <path d="M8 9.5V11" stroke="#D42A1E" strokeWidth="1.5" />
  </svg>
);

const MaintainingIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path
      d="M12.1323 3.63629C14.2311 5.60449 14.6656 8.85537 13.0189 11.3305C11.789 13.1793 9.71098 14.1236 7.64351 13.9944L7.1978 14.6644L5.94892 13.8335L6.87389 12.4432L7.73714 12.4979C9.29308 12.5951 10.8491 11.884 11.7701 10.4997C12.6336 9.20174 12.7336 7.61778 12.1766 6.27784L9.82794 9.8082L5.66502 7.03871L8.01367 3.50835C6.5626 3.5124 5.1403 4.21666 4.2768 5.51462C3.35587 6.8989 3.30123 8.60888 3.99213 10.0064L4.37613 10.7815L3.45117 12.1718L2.20229 11.341L2.648 10.671C1.72994 8.81406 1.798 6.53252 3.02792 4.68378C4.67459 2.2086 7.84089 1.35327 10.4672 2.52849L7.74474 6.62068L9.40991 7.72847L12.1323 3.63629Z"
      fill="#EB8C33"
    />
  </svg>
);

const PendingIcon = (p: IconProps) => (
  <svg {...SVG_BASE} {...p}>
    <path
      d="M12.5 8C12.5 5.51472 10.4853 3.5 8 3.5C5.51472 3.5 3.5 5.51472 3.5 8C3.5 10.4853 5.51472 12.5 8 12.5V14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14V12.5C10.4853 12.5 12.5 10.4853 12.5 8Z"
      fill="#858D99"
    />
    <path d="M4.80005 7.19995H6.30005V8.69995H4.80005V7.19995Z" fill="#858D99" />
    <path d="M7.30005 7.19995H8.80005V8.69995H7.30005V7.19995Z" fill="#858D99" />
    <path
      d="M9.80005 7.19995H11.3V8.69995H9.80005V7.19995Z"
      fill="#858D99"
    />
  </svg>
);

const STATUS_ICONS: Record<OpenClawStatus, (p: IconProps) => ReactElement> = {
  creating: CreatingIcon,
  createFail: CreateFailIcon,
  running: RunningIcon,
  shutdown: ShutdownIcon,
  loading: LoadingIcon,
  loadFail: LoadFailIcon,
  maintaining: MaintainingIcon,
  pending: PendingIcon,
};

/**
 * 单独导出图标，方便其他位置（如详情页、列表）按需复用同一套视觉。
 */
export const StatusIcon = ({ status }: { status: OpenClawStatus }) => {
  const Icon = STATUS_ICONS[status];
  if (!Icon) return null;
  // loading：自旋；creating：保留呼吸感
  if (status === "loading") {
    return (
      <span
        className="inline-flex flex-shrink-0 animate-spin"
        style={{ width: SIZE, height: SIZE, lineHeight: 0 }}
      >
        <Icon />
      </span>
    );
  }
  if (status === "creating") {
    return (
      <span
        className="inline-flex flex-shrink-0"
        style={{
          width: SIZE,
          height: SIZE,
          lineHeight: 0,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      >
        <Icon />
      </span>
    );
  }
  return (
    <span
      className="inline-flex flex-shrink-0"
      style={{ width: SIZE, height: SIZE, lineHeight: 0 }}
    >
      <Icon />
    </span>
  );
};

/** @deprecated 仅为向后兼容保留，请使用 StatusIcon */
export const StatusDot = StatusIcon;

export const StatusBadge = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_VISUAL[status] ?? { label: status || "未知" };

  // Figma 358:877: 透明底 + 黑字 + 16px icon + 4px gap
  const badge = (
    <span
      className="inline-flex items-center whitespace-nowrap flex-shrink-0"
      style={{
        gap: "4px",
        padding: "2px 0",
        height: "20px",
        borderRadius: "2px",
        background: "transparent",
        color: "#020617",
        fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "20px",
      }}
    >
      <StatusIcon status={status} />
      {cfg.label}
    </span>
  );

  if (cfg.tooltipText && status !== "running") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{badge}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {cfg.tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
};
