/**
 * AgentCard - 单个 Agent 卡片
 * 严格对齐 Figma node 358:2387「卡片」：
 *   - 容器：padding 20px、gap 24px (column)、border-radius 4px、shadow 双层
 *   - 头部行：左 (48 头像 + gap 16 + 文字 column gap 4)；右三点菜单
 *   - 元信息组：column gap 4
 *     · 第 1 行：[角色徽章 #FFF→#F9FBFC 边 #DAE0E9 R2 padding 2x6] | 类型：xxx | ID：xxx [复制]
 *     · 第 2 行：分组：xxx
 *   - 底部行：左 创建时间 (#737373)；右 [详细配置 120x36] + [刷新 48x36]
 *     · 两个按钮统一使用 Figma「按钮」ComponentSet 317:1051 的 `claw-outline` 变体（详见 ui/button.tsx）
 *   - 无底部分隔线（依靠 column gap-24 留白即可）
 *
 * 所有业务逻辑（删除/重启/重装/移除角色/重试/打开终端/打开面板）通过 props 暴露。
 */
import { useState } from "react";
import { Link } from "wouter";
import {
  MoreVertical,
  Settings,
  RefreshCw,
  Trash2,
  RotateCcw,
  HardDriveDownload,
  Terminal,
  UserMinus,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/Surface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AgentAvatar } from "./AgentAvatar";
import {
  StatusBadge,
  STATUS_DISABLED,
  STATUS_GRAY_AVATAR,
  type OpenClawStatus,
} from "./StatusBadge";

export interface AgentCardItem {
  id: string;
  instanceId: string;
  name: string;
  status: OpenClawStatus;
  createdAt: string;
  agentType?: "openclaw" | "hermes" | "lightclawace";
  roleName?: string;
  groupId?: string;
  groupName?: string;
  memoryStatus?: "none" | "free" | "pro";
}

export interface AgentCardCallbacks {
  onClickCard: (claw: AgentCardItem) => void;
  onRefresh: (e: React.MouseEvent, id: string, name: string) => void;
  onRestart: (claw: AgentCardItem) => void;
  onReinstall: (claw: AgentCardItem) => void;
  onDelete: (claw: AgentCardItem) => void;
  onRemoveRole: (claw: AgentCardItem) => void;
  onRetry: (id: string, name: string) => void;
  /** 点击对话按钮进入对话视图 */
  onChat: (claw: AgentCardItem) => void;
  /** 打开终端权限（综合双模式逻辑） */
  canOpenTerminal: (claw: AgentCardItem) => boolean;
  /** 当前是否在刷新中 */
  refreshing: boolean;
  /** 多分组模式开关，影响"分组"行展示 */
  groupMode: "normal" | "multi-group";
}

interface AgentCardProps extends AgentCardCallbacks {
  claw: AgentCardItem;
}

const TYPE_LABEL: Record<NonNullable<AgentCardItem["agentType"]>, string> = {
  openclaw: "OpenClaw",
  hermes: "Hermes Agent",
  lightclawace: "Lightclaw ACE",
};

export const AgentCard = ({
  claw,
  onClickCard,
  onRefresh,
  onRestart,
  onReinstall,
  onDelete,
  onRemoveRole,
  onRetry,
  onChat,
  canOpenTerminal,
  refreshing,
  groupMode,
}: AgentCardProps) => {
  const isDisabled = STATUS_DISABLED[claw.status];
  const isGrayAvatar = STATUS_GRAY_AVATAR[claw.status];
  const isLoadFail = claw.status === "loadFail";
  const isNonOpenclaw =
    claw.agentType === "hermes" || claw.agentType === "lightclawace";
  const typeLabel = TYPE_LABEL[claw.agentType ?? "openclaw"];

  const [copied, setCopied] = useState(false);
  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(claw.instanceId).then(() => {
      setCopied(true);
      toast.success(`已复制 ${claw.instanceId}`);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <SurfaceCard
      hover={!isDisabled}
      className={`group relative flex flex-col ${
        !isDisabled ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        padding: "20px",
        gap: "24px",
      }}
      onClick={() => {
        if (!isDisabled) onClickCard(claw);
      }}
    >
      {/* ===== 头部行：头像 + 名称/状态 + 右上角操作（刷新+更多） ===== */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <AgentAvatar
            roleName={claw.roleName}
            agentName={claw.name}
            size={48}
            grayed={isGrayAvatar}
          />
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3
              className={`truncate transition-colors ${
                isGrayAvatar
                  ? "text-muted-foreground"
                  : "text-[#0A0A0A] group-hover:text-[#355EF1]"
              }`}
              style={{
                fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "22px",
              }}
              title={claw.name}
            >
              {claw.name}
            </h3>
            <StatusBadge status={claw.status} />
          </div>
        </div>

        {/* 右上角：刷新 + 更多菜单 */}
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#F5F5F5] transition-colors flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh(e, claw.id, claw.name);
            }}
            disabled={refreshing}
            aria-label="刷新状态"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-7 h-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#F5F5F5] transition-colors flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              aria-label="更多操作"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {/* 刷新状态 */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRefresh(e, claw.id, claw.name);
              }}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 text-muted-foreground ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              刷新状态
            </DropdownMenuItem>

            {/* 重启 */}
            {claw.status === "running" ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRestart(claw);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2 text-muted-foreground" />
                重启
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled
                className="opacity-40 cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重启
              </DropdownMenuItem>
            )}

            {/* 重新安装 */}
            {claw.status === "running" ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onReinstall(claw);
                }}
              >
                <HardDriveDownload className="w-4 h-4 mr-2 text-muted-foreground" />
                {isNonOpenclaw ? "重新安装 Agent" : "重新安装 OpenClaw"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled
                className="opacity-40 cursor-not-allowed"
              >
                <HardDriveDownload className="w-4 h-4 mr-2" />
                {isNonOpenclaw ? "重新安装 Agent" : "重新安装 OpenClaw"}
              </DropdownMenuItem>
            )}

            {/* 进入终端 */}
            {canOpenTerminal(claw) &&
              (claw.status === "running" ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/terminal/${claw.id}`, "_blank");
                  }}
                >
                  <Terminal className="w-4 h-4 mr-2 text-muted-foreground" />
                  进入终端
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled
                  className="opacity-40 cursor-not-allowed"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  进入终端
                </DropdownMenuItem>
              ))}

            {/* 移除角色 */}
            {claw.roleName &&
              claw.roleName !== "通用助手" &&
              claw.status === "running" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRole(claw);
                  }}
                >
                  <UserMinus className="w-4 h-4 mr-2 text-muted-foreground" />
                  移除角色
                </DropdownMenuItem>
              )}

            <DropdownMenuSeparator />

            {/* 删除 */}
            {["creating", "loading", "pending"].includes(claw.status) ? (
              <DropdownMenuItem
                disabled
                className="opacity-40 cursor-not-allowed text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(claw);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* ===== 元信息组：column gap 4，含两行 ===== */}
      <div className="flex flex-col" style={{ gap: "4px" }}>
        {/* 元信息第 1 行：Agent 标签徽章 | 类型 | ID + 复制
            Agent 标签徽章 = roleName（如「设计师」「开发工程师」「通用助手」），
            对齐 Figma 358:2392，徽章常驻显示（默认「通用助手」），不会因 roleName 缺省而隐藏 */}
        <div
          className="flex items-center flex-wrap"
          style={{
            gap: "4px",
            fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "20px",
            color: "#334155",
          }}
        >
          <span
            className="inline-flex items-center"
            style={{
              padding: "2px 6px",
              borderRadius: "2px",
              border: "1px solid #DAE0E9",
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 100%)",
              color: "#334155",
            }}
          >
            {claw.roleName || "通用助手"}
          </span>
          <span style={{ color: "#E2E8F0" }}>｜</span>
          <span>类型：{typeLabel}</span>
          <span style={{ color: "#E2E8F0" }}>｜</span>
          <span className="inline-flex items-center" style={{ gap: "6px" }}>
            ID：{claw.instanceId}
            <button
              type="button"
              onClick={handleCopyId}
              className="w-3 h-3 inline-flex items-center justify-center rounded-[2px] text-[#737373] hover:text-[#0A0A0A] transition-colors"
              aria-label="复制 ID"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </span>
        </div>

        {/* 元信息第 2 行：分组 */}
        <div
          className="truncate"
          style={{
            fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "20px",
            color: "#334155",
          }}
        >
          分组：
          {groupMode === "multi-group"
            ? claw.groupName || "A公司 / 技术部 / 前端组"
            : "默认"}
        </div>
      </div>

      {/* ===== 底部行：时间 + 操作按钮（无分隔线） ===== */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="truncate"
          style={{
            fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "20px",
            color: "#737373",
          }}
        >
          {claw.createdAt} 创建
        </span>
        <div className="flex items-center flex-shrink-0" style={{ gap: "12px" }}>
          {isLoadFail ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRetry(claw.id, claw.name);
              }}
              variant="claw-outline"
              size="claw"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重试
            </Button>
          ) : isDisabled ? (
            <Button
              variant="claw-outline"
              size="claw"
              className="opacity-40 cursor-not-allowed"
              disabled
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                <path d="M9.53796 2H6.46178L6.10863 3.76579C5.81461 3.89729 5.53694 4.05843 5.27938 4.24533L3.57275 3.66799L2.03467 6.33202L3.38795 7.52131C3.37177 7.67884 3.3635 7.83855 3.3635 8C3.3635 8.16151 3.37177 8.32116 3.38795 8.47869L2.03467 9.668L3.57275 12.332L5.27939 11.7547C5.53694 11.9416 5.81462 12.1027 6.10863 12.2342L6.46178 14H9.53796L9.89109 12.2342C10.1851 12.1027 10.4628 11.9416 10.7203 11.7547L12.427 12.332L13.965 9.668L12.6118 8.47869C12.628 8.32116 12.6362 8.16151 12.6362 8C12.6362 7.83855 12.628 7.67884 12.6118 7.52131L13.965 6.33202L12.427 3.66799L10.7203 4.24533C10.4628 4.05843 10.1851 3.89729 9.89109 3.76579L9.53796 2ZM7.99978 10.1818C6.79479 10.1818 5.81796 9.20496 5.81796 8C5.81796 6.79501 6.79479 5.81818 7.99978 5.81818C9.20474 5.81818 10.1816 6.79501 10.1816 8C10.1816 9.20496 9.20474 10.1818 7.99978 10.1818Z" fill="url(#paint0_radial_824_3059)"/>
                <defs>
                  <radialGradient id="paint0_radial_824_3059" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.965 8) rotate(-180) scale(11.9304 19.9444)">
                    <stop offset="0.748539" stopColor="#202020"/>
                    <stop offset="1" stopColor="#1447E6"/>
                  </radialGradient>
                </defs>
              </svg>
              详细配置
            </Button>
          ) : (
            <Link href={`/openclaw/${claw.id}`} onClick={(e) => e.stopPropagation()}>
              <Button variant="claw-outline" size="claw">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path d="M9.53796 2H6.46178L6.10863 3.76579C5.81461 3.89729 5.53694 4.05843 5.27938 4.24533L3.57275 3.66799L2.03467 6.33202L3.38795 7.52131C3.37177 7.67884 3.3635 7.83855 3.3635 8C3.3635 8.16151 3.37177 8.32116 3.38795 8.47869L2.03467 9.668L3.57275 12.332L5.27939 11.7547C5.53694 11.9416 5.81462 12.1027 6.10863 12.2342L6.46178 14H9.53796L9.89109 12.2342C10.1851 12.1027 10.4628 11.9416 10.7203 11.7547L12.427 12.332L13.965 9.668L12.6118 8.47869C12.628 8.32116 12.6362 8.16151 12.6362 8C12.6362 7.83855 12.628 7.67884 12.6118 7.52131L13.965 6.33202L12.427 3.66799L10.7203 4.24533C10.4628 4.05843 10.1851 3.89729 9.89109 3.76579L9.53796 2ZM7.99978 10.1818C6.79479 10.1818 5.81796 9.20496 5.81796 8C5.81796 6.79501 6.79479 5.81818 7.99978 5.81818C9.20474 5.81818 10.1816 6.79501 10.1816 8C10.1816 9.20496 9.20474 10.1818 7.99978 10.1818Z" fill="url(#paint0_radial_824_3059b)"/>
                  <defs>
                    <radialGradient id="paint0_radial_824_3059b" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.965 8) rotate(-180) scale(11.9304 19.9444)">
                      <stop offset="0.748539" stopColor="#202020"/>
                      <stop offset="1" stopColor="#1447E6"/>
                    </radialGradient>
                  </defs>
                </svg>
                详细配置
              </Button>
            </Link>
          )}
          {/* 第二个方形按钮：对话（48x36，仅图标） */}
          <Button
            variant="claw-outline"
            size="claw-square"
            onClick={(e) => {
              e.stopPropagation();
              onChat(claw);
            }}
            disabled={isDisabled}
            aria-label="开始对话"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
              <path d="M7.99988 14.5C11.5897 14.5 14.4999 11.5898 14.4999 8C14.4999 4.41015 11.5897 1.5 7.99988 1.5C4.41003 1.5 1.49988 4.41015 1.49988 8C1.49988 9.73056 2.17615 11.3031 3.27884 12.4679L2.14988 14.5H7.99988Z" fill="url(#paint0_radial_824_3063)"/>
              <rect x="7.66602" y="6.16699" width="1.5" height="2" rx="0.75" fill="#D9D9D9"/>
              <rect x="10.666" y="6.16699" width="1.5" height="2" rx="0.75" fill="#D9D9D9"/>
              <defs>
                <radialGradient id="paint0_radial_824_3063" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14.4999 8) rotate(-180) scale(13 21.6065)">
                  <stop offset="0.748539" stopColor="#202020"/>
                  <stop offset="1" stopColor="#1447E6"/>
                </radialGradient>
              </defs>
            </svg>
          </Button>
        </div>
      </div>
    </SurfaceCard>
  );
};
