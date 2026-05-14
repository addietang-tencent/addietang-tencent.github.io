/**
 * StatusBadge - Agent 卡片状态标签
 * 8 种状态：creating / createFail / running / shutdown / loading / loadFail / maintaining / pending
 * 严格对齐 Figma node I358:2387;358:877「状态标签」：
 *   - 透明背景（无 fill）、border-radius 2px、padding 2px 0、高度 20px、gap 4px
 *   - 文字：PingFang SC Regular 12/20、颜色 #020617（黑字）
 *   - 仅左侧 6×6 圆点用状态色（运行中绿/创建中蓝呼吸/失败红/关机灰/维护橙）
 *   - loading 用旋转半圆 spinner
 */
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
  /** 仅圆点颜色按状态变化，文字与背景统一为黑字透明底 */
  dotColor: string;
  tooltipText?: string;
}

export const STATUS_VISUAL: Record<OpenClawStatus, StatusConfigItem> = {
  creating: {
    label: "创建中",
    dotColor: "#1447E6",
    tooltipText: "正在创建中，请稍候",
  },
  createFail: {
    label: "创建失败",
    dotColor: "#FF3B30",
    tooltipText: "创建失败，可删除后重新创建",
  },
  running: {
    label: "运行中",
    dotColor: "#34C759",
  },
  shutdown: {
    label: "已关机",
    dotColor: "#9CA3AF",
    tooltipText: "已关机，如需恢复请联系管理员",
  },
  loading: {
    label: "加载中",
    dotColor: "#1447E6",
    tooltipText: "加载中，请稍候",
  },
  loadFail: {
    label: "加载失败",
    dotColor: "#FF3B30",
    tooltipText: "加载失败，可点击重试恢复",
  },
  maintaining: {
    label: "维护中",
    dotColor: "#FF9500",
    tooltipText: "维护中，请稍候",
  },
  pending: {
    label: "待处理",
    dotColor: "#FF3B30",
    tooltipText: "已停用，请联系管理员处理",
  },
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

export const StatusDot = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_VISUAL[status];

  if (status === "loading") {
    return (
      <span
        className="inline-block flex-shrink-0 animate-spin"
        style={{
          width: 6,
          height: 6,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: `${cfg.dotColor} transparent transparent transparent`,
          borderRadius: "50%",
        }}
      />
    );
  }

  if (status === "creating") {
    return (
      <span
        className="inline-block flex-shrink-0 rounded-full"
        style={{
          width: 6,
          height: 6,
          background: cfg.dotColor,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    );
  }

  return (
    <span
      className="inline-block flex-shrink-0 rounded-full"
      style={{ width: 6, height: 6, background: cfg.dotColor }}
    />
  );
};

export const StatusBadge = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_VISUAL[status];

  // Figma 358:877: 透明底 + 黑字 + 圆点
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
      <StatusDot status={status} />
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
