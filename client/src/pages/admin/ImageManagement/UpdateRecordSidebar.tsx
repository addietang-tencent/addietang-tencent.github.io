/**
 * UpdateRecordSidebar - 镜像配置页右侧栏（精简版）
 *
 * 内容（自上而下）：
 *   1. Agent 类型锚点导航
 *   2. 镜像新版本提醒条：当存在"启用版本 ≠ 实例版本"的 Agent 类型时展示一行
 *      · 文案：OpenClaw 新版本 v2026.4.23 上线，可以更新（动态）
 *      · 复用 useOutdatedTypes 与 Agent 列表保持判断口径一致
 *   3. 「推送更新」按钮（触发 PushUpgradeDialog）
 *   4. 正在推送中的列表 + 撤回（仅在有推送时展示）
 *   5. 「查看全部更新记录」链接（触发 Dialog 弹窗）
 */
import { useEffect, useState } from "react";
import { Star, Megaphone, ChevronRight, Sparkles, RotateCcw, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

import { useOutdatedTypes } from "../BatchUpdateNotice";
import {
  buildFlatUpdateRecords,
  type FlatUpdateRecord,
} from "./publicImageRecords";
import {
  setActivePush,
  listActivePushes,
  clearActivePush,
  type ActivePush,
} from "@/lib/upgradePushStore";

interface Props {
  /** 已展示的 Agent 类型列表（用于锚点） */
  views: { agentType: string; isEnabled: boolean; version: string | null }[];
  /** 类型 ID → 展示名 */
  getTypeLabel: (agentType: string) => string;
  /** 当前用户端首选类型 */
  defaultAgentType: string;
  /** 触发推送弹窗 */
  onPush: () => void;
  /** 触发"查看全部更新记录"弹窗 */
  onViewAll: () => void;
  /** 布局方向：默认 vertical（右侧栏）；horizontal 用于标题下横幅 */
  orientation?: "vertical" | "horizontal";
  /** 最小化回调 */
  onMinimize?: () => void;
  /** 可推送的 Agent 类型列表 */
  pushable?: { agentType: string; agentTypeLabel: string; enabledVersion: string; outdatedInstanceCount: number; allUpToDate: boolean; imageSource: "public" | "custom"; imageName: string }[];
}

// ─── 公共镜像更新记录条目（兼容历史名称导出，便于其他文件复用） ───
export type UpdateRecord = FlatUpdateRecord;

/** 扁平化所有公共镜像的更新记录（按时间倒序） */
export function buildUpdateRecords(): UpdateRecord[] {
  return buildFlatUpdateRecords();
}

// ─── 主组件 ───────────────────────────────────────────────────
export default function UpdateRecordSidebar({
  views,
  getTypeLabel,
  defaultAgentType,
  onPush,
  onViewAll,
  orientation = "vertical",
  onMinimize,
  pushable = [],
}: Props) {
  // 复用与 Agent 列表页相同的"是否有镜像更新"判断
  const outdatedTypes = useOutdatedTypes();
  const hasUpdate = outdatedTypes.length > 0;

  // 订阅活跃推送
  const [activePushes, setActivePushes] = useState<ActivePush[]>(() => listActivePushes());
  useEffect(() => {
    const refresh = () => setActivePushes(listActivePushes());
    window.addEventListener("upgrade-push-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("upgrade-push-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleRevoke = (push: ActivePush) => {
    clearActivePush(push.agentType);
    toast.success(`已撤回「${push.agentTypeLabel} v${push.version}」的推送提醒`);
  };

  // ─── 横向布局（标题右上角合并卡片）────────────────────────────
  if (orientation === "horizontal") {
    // 当既无更新也无活跃推送时，仅展示一行简短按钮（不上卡片）
    if (!hasUpdate && activePushes.length === 0) {
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onPush}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)" }} // allow-inline-gradient: 主 CTA 使用主渐变
          >
            <Megaphone className="w-3.5 h-3.5" />
            推送更新
          </button>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-[3px] text-xs text-[#334155] hover:bg-[#FAFAFA] transition-colors"
          >
            <span>查看全部更新记录</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
          </button>
        </div>
      );
    }

    // 有更新或有活跃推送：合并成一个卡片
    return (
      <div className="rounded-[4px] border border-gray-200 bg-white overflow-hidden relative">
        {/* 关闭按钮 */}
        {onMinimize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMinimize}
              className="absolute top-2 right-2 p-1 rounded-[3px] text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">折叠</TooltipContent>
        </Tooltip>
        )}
        {/* Agent 新版本卡片列表 */}
        <div className="px-3 py-2.5 space-y-2">
          <div className="text-xs font-semibold text-[#0A0A0A] mb-4">{activePushes.length > 0 ? "有新版本上线（正在提醒员工更新）" : "有新版本上线，请尽快更新"}</div>
          {pushable.filter(p => !p.allUpToDate).map(p => {
            const isPushing = activePushes.some(ap => ap.agentType === p.agentType);
            return (
              <div key={p.agentType} className="px-2.5 py-2 rounded-[4px] border border-gray-200 bg-[#FAFAFA]">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[12px] font-medium text-[#0A0A0A] truncate">{p.agentTypeLabel}</span>
                    <span className="text-[10px] text-[#A3A3A3] font-mono tabular-nums">v{p.enabledVersion}</span>
                    {isPushing && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-[#1447E6]/10 text-[9px] font-medium text-[#1447E6]">
                        正在提醒员工更新
                      </span>
                    )}
                  </div>
                  {isPushing ? (
                    <button
                      onClick={() => {
                        clearActivePush(p.agentType);
                        toast.success(`已撤回「${p.agentTypeLabel}」的推送提醒`);
                      }}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] text-[10px] text-[#737373] border border-gray-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      撤回
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
                        setActivePush({ agentType: p.agentType, agentTypeLabel: p.agentTypeLabel, version: p.enabledVersion, imageName: p.imageName, imageSource: p.imageSource, pushedAt: ts, message: `管理员推荐更新到 v${p.enabledVersion}` } as ActivePush);
                        toast.success(`已向「${p.agentTypeLabel}」推送更新提醒`);
                      }}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] text-[10px] font-medium text-[#1447E6] border border-[#1447E6]/30 hover:bg-[#1447E6]/5 transition-colors shrink-0"
                    >
                      <Megaphone className="w-2.5 h-2.5" />
                      推送提醒
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#737373] leading-relaxed">
                  推送后，使用 <span className="font-medium text-[#0A0A0A]">{p.agentTypeLabel}</span> 且版本低于 <span className="font-mono text-[#1447E6]">v{p.enabledVersion}</span> 的 <span className="font-medium text-[#0A0A0A]">{p.outdatedInstanceCount}</span> 个 Agent，将在用户端收到更新提醒。
                </p>
              </div>
            );
          })}
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-[11px] text-[#1447E6] hover:opacity-80 mt-1"
          >
            查看全部更新记录
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // ─── 纵向布局（默认右侧栏）────────────────────────────────
  return (
    <div className="space-y-5">
      {/* 1. Agent 类型导航 */}
      <div>
        <div className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wide mb-2 px-3">
          Agent 类型
        </div>
        <nav className="flex flex-col gap-0.5">
          {views.map(({ agentType, isEnabled, version }) => {
            const isDef = defaultAgentType === agentType;
            return (
              <button
                key={agentType}
                onClick={() => {
                  const el = document.getElementById(`section-${agentType}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-[3px] text-left text-sm transition-colors text-[#334155] hover:bg-[#FAFAFA]"
              >
                {isDef ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] shrink-0"
                        style={{ background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)" }} // allow-inline-gradient: 首选徽章使用主 CTA 渐变
                      >
                        <Star className="w-3 h-3 text-white" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      用户端首选 Agent 类型
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center w-5 h-5 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full inline-block ${
                            isEnabled ? "bg-green-500" : "bg-[#A3A3A3]"
                          }`}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      {isEnabled ? `用户可见 v${version}` : "用户不可见"}
                    </TooltipContent>
                  </Tooltip>
                )}
                <span className="truncate">{getTypeLabel(agentType)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. 镜像新版本提醒（仅在有更新时展示） */}
      {hasUpdate && (
        <div className="border-t border-[#F5F5F5] pt-4 px-3">
          <div className="rounded-[4px] border border-amber-200 bg-amber-50/50 px-3 py-2.5">
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-amber-900 leading-snug">
                  有新版本上线
                </div>
                <ul className="mt-1 space-y-0.5">
                  {outdatedTypes.slice(0, 3).map((t) => (
                    <li
                      key={t.agentType}
                      className="text-[11px] text-amber-800 leading-relaxed"
                    >
                      <span className="font-medium">{t.agentTypeLabel}</span>
                      <span className="ml-1 font-mono tabular-nums">
                        v{t.enabledVersion}
                      </span>
                    </li>
                  ))}
                </ul>
                {outdatedTypes.length > 3 && (
                  <div className="mt-1 text-[11px] text-amber-700">
                    等 {outdatedTypes.length} 个 Agent 类型
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 操作区：推送更新 + 正在推送列表 + 查看全部更新记录 */}
      <div className={hasUpdate ? "px-3" : "border-t border-[#F5F5F5] pt-4 px-3"}>
        <button
          onClick={onPush}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)" }} // allow-inline-gradient: 主 CTA 使用主渐变
        >
          <Megaphone className="w-3.5 h-3.5" />
          推送更新
        </button>

        {/* 正在推送中的列表（仅有推送时展示，每条带撤回） */}
        {activePushes.length > 0 && (
          <div className="mt-2 rounded-[4px] border border-[#1447E6]/20 bg-[#1447E6]/5 px-2.5 py-2">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#1447E6] uppercase tracking-wide mb-1.5">
              <Megaphone className="w-2.5 h-2.5" />
              正在提醒员工更新
            </div>
            <ul className="space-y-1.5">
              {activePushes.map((p) => (
                <li
                  key={p.agentType}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-[#0A0A0A] truncate">
                      {p.agentTypeLabel}
                    </div>
                    <div className="text-[10px] text-[#737373] font-mono tabular-nums truncate">
                      {formatVersion(p.version)} · {p.pushedAt.slice(0, 10)}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleRevoke(p)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-[#737373] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        撤回
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs max-w-[220px]">
                      撤回后用户端的"可更新"徽章将立即消失
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onViewAll}
          className="w-full mt-2 inline-flex items-center justify-between px-3 py-2 rounded-[3px] text-xs text-[#334155] hover:bg-[#FAFAFA] transition-colors"
        >
          <span>查看全部更新记录</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
        </button>
      </div>
    </div>
  );
}

// ─── 「查看全部」弹窗内的列表项导出，方便复用 ───────────────
export type { ActivePush };

/**
 * 统一展示版本号：
 *   - 已经带 v 前缀的（如 "v0.10.0"）保持不变
 *   - 不带 v 前缀的（如 "2026.4.23"）补一个 v
 */
export function formatVersion(version: string): string {
  if (!version) return "";
  return version.startsWith("v") || version.startsWith("V") ? version : `v${version}`;
}
