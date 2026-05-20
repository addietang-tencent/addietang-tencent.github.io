/**
 * UpdateRecordsDrawer - 「查看全部更新记录」弹窗
 *
 * 注：组件名保留 Drawer 仅为兼容历史 import，实际形态已改为 Dialog 弹窗
 * （与公共镜像更新记录弹窗 PublicImageHistoryDialog 保持一致的呈现方式）
 *
 * 展示所有 Agent 类型的镜像更新历史，让管理员能在一个地方浏览全部版本变化。
 *
 * 功能：
 *   - 按 Agent 类型筛选
 *   - 时间线展示（首次上线 / 更新到 vX.Y.Z）
 *   - 推送状态徽章 + 撤回入口
 *   - 未推送的当前版本可点击"推送此类型最新版本"
 */
import { useMemo, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, Calendar, RotateCcw, Sparkles, Disc3, Bell } from "lucide-react";
import { toast } from "sonner";
import {
  setActivePush,
  listActivePushes,
  clearActivePush,
  type ActivePush,
} from "@/lib/upgradePushStore";
import {
  buildUpdateRecords,
  formatVersion,
  type UpdateRecord,
} from "./UpdateRecordSidebar";

export interface PushableItem {
  agentType: string;
  agentTypeLabel: string;
  enabledVersion: string;
  outdatedInstanceCount: number;
  allUpToDate: boolean;
  imageSource: "public" | "custom";
  imageName: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 触发推送弹窗（默认选中传入的 agent 类型） */
  onPush: (defaultAgentType?: string) => void;
  /** 可推送的 Agent 类型列表 */
  pushable?: PushableItem[];
  /** 默认打开的 tab */
  defaultTab?: "current" | "history";
}

// ─── 镜像彩色徽章：稳定 hash → 颜色，使同一镜像在视觉上保持一致 ────
const IMAGE_COLOR_PALETTE = [
  { bg: "bg-sky-50",      text: "text-sky-700",      border: "border-sky-200",      dot: "bg-sky-500"      },
  { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200",  dot: "bg-emerald-500"  },
  { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200",   dot: "bg-violet-500"   },
  { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200",    dot: "bg-amber-500"    },
  { bg: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-200",     dot: "bg-rose-500"     },
  { bg: "bg-cyan-50",     text: "text-cyan-700",     border: "border-cyan-200",     dot: "bg-cyan-500"     },
];

function hashImageColor(imageId: string): typeof IMAGE_COLOR_PALETTE[number] {
  let h = 0;
  for (let i = 0; i < imageId.length; i++) h = (h * 31 + imageId.charCodeAt(i)) >>> 0;
  return IMAGE_COLOR_PALETTE[h % IMAGE_COLOR_PALETTE.length];
}

export default function UpdateRecordsDrawer({ open, onOpenChange, onPush, pushable = [], defaultTab = "current" }: Props) {
  const [activeTab, setActiveTab] = useState<"current" | "history">(defaultTab);

  useEffect(() => { if (open) setActiveTab(defaultTab); }, [open, defaultTab]);

  // 活跃推送列表
  const [activePushes, setActivePushes] = useState<ActivePush[]>(() => listActivePushes());
  useEffect(() => {
    if (!open) return;
    setActivePushes(listActivePushes());
    const interval = setInterval(() => setActivePushes(listActivePushes()), 1000);
    return () => clearInterval(interval);
  }, [open]);
  /** 筛选粒度：按 Agent 类型 或 按具体镜像 */
  const [filter, setFilter] = useState<{ kind: "all" | "type" | "image"; value: string }>({
    kind: "all",
    value: "",
  });

  const records = useMemo(() => buildUpdateRecords(), []);

  /** Agent 类型选项 */
  const types = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => map.set(r.agentType, r.agentTypeLabel));
    return Array.from(map.entries()).map(([agentType, label]) => ({ agentType, label }));
  }, [records]);

  /** 镜像选项（按 Agent 类型分组） */
  const imagesByType = useMemo(() => {
    const grouped = new Map<string, { imageId: string; imageName: string }[]>();
    records.forEach((r) => {
      const list = grouped.get(r.agentType) ?? [];
      if (!list.some((x) => x.imageId === r.imageId)) {
        list.push({ imageId: r.imageId, imageName: r.imageName });
      }
      grouped.set(r.agentType, list);
    });
    return grouped;
  }, [records]);

  const filtered = useMemo(() => {
    if (filter.kind === "all") return records;
    if (filter.kind === "type") return records.filter((r) => r.agentType === filter.value);
    return records.filter((r) => r.imageId === filter.value);
  }, [records, filter]);

  /**
   * 计算"每个镜像的最新一条记录索引"——按镜像聚合时，
   * 仅在每个镜像最新版本处展示「推送此镜像最新版本」入口。
   * （旧逻辑按 agentType 聚合，会让同类型多镜像中只有最早出现的那个能被点击，存在歧义）
   */
  const latestIdxPerImage = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r, idx) => {
      if (!map.has(r.imageId)) map.set(r.imageId, idx);
    });
    return map;
  }, [filtered]);

  const findPush = (r: UpdateRecord): ActivePush | undefined =>
    activePushes.find((p) => p.agentType === r.agentType && p.version === r.version);

  const handleRevoke = (push: ActivePush) => {
    clearActivePush(push.agentType);
    toast.success(`已撤回「${push.agentTypeLabel} v${push.version}」的推送提醒`);
  };

  // 当前激活的镜像筛选选项（仅在选中具体类型时才展开镜像二级筛选）
  const activeTypeForImageFilter =
    filter.kind === "type"
      ? filter.value
      : filter.kind === "image"
        ? records.find((r) => r.imageId === filter.value)?.agentType ?? ""
        : "";

  const imageOptionsForActiveType = activeTypeForImageFilter
    ? imagesByType.get(activeTypeForImageFilter) ?? []
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="right" showOverlay={false} className="sm:max-w-[420px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-3 shrink-0">
          <SheetTitle className="text-base">
            版本更新
          </SheetTitle>
        </SheetHeader>

        {/* Tab 切换 */}
        <div className="px-6 pb-3">
          <SegmentGroup>
            <SegmentOption active={activeTab === "current"} onClick={() => setActiveTab("current")}>
              新版本推送
              {pushable.filter(p => !p.allUpToDate).length > 0 && (
                <span className="ml-1 text-[#A3A3A3]">({pushable.filter(p => !p.allUpToDate).length})</span>
              )}
            </SegmentOption>
            <SegmentOption active={activeTab === "history"} onClick={() => setActiveTab("history")}>
              全部更新记录
            </SegmentOption>
          </SegmentGroup>
        </div>

        {/* 当前更新 Tab */}
        {activeTab === "current" && (
          <div className="px-6 pb-4 space-y-3">
            {pushable.filter(p => !p.allUpToDate).length === 0 ? (
              <p className="text-xs text-[#A3A3A3] text-center py-6">当前没有版本更新</p>
            ) : (
              pushable.filter(p => !p.allUpToDate).map(p => {
                const isPushing = activePushes.some(ap => ap.agentType === p.agentType);
                return (
                  <div key={p.agentType} className="px-3 py-2.5 rounded-[4px] border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E5E5]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-medium text-[#0A0A0A] truncate">{p.agentTypeLabel}</span>
                        <span className="text-xs text-[#A3A3A3] font-mono tabular-nums">v{p.enabledVersion}</span>
                        {isPushing && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-[#1447E6]/10 text-[10px] font-medium text-[#1447E6]">
                            正在提醒员工更新
                          </span>
                        )}
                      </div>
                      {isPushing ? (
                        <button
                          onClick={() => { clearActivePush(p.agentType); setActivePushes(listActivePushes()); toast.success(`已撤回「${p.agentTypeLabel}」的推送提醒`); }}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] text-[11px] text-[#737373] border border-[#E5E5E5] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          撤回
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
                            setActivePush({ agentType: p.agentType, agentTypeLabel: p.agentTypeLabel, version: p.enabledVersion, imageName: p.imageName, imageSource: p.imageSource, pushedAt: ts, message: `管理员推荐更新到 v${p.enabledVersion}` } as ActivePush);
                            setActivePushes(listActivePushes());
                            toast.success(`已向「${p.agentTypeLabel}」推送更新提醒`);
                          }}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium text-[#1447E6] border border-[#1447E6]/30 hover:bg-[#1447E6]/5 transition-colors shrink-0"
                        >
                          <Megaphone className="w-2.5 h-2.5" />
                          推送提醒
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#737373] leading-relaxed">
                      推送后，使用 <span className="font-medium text-[#0A0A0A]">{p.agentTypeLabel}</span> 且版本低于 <span className="font-mono text-[#1447E6]">v{p.enabledVersion}</span> 的 <span className="font-medium text-[#0A0A0A]">{p.outdatedInstanceCount}</span> 个 Agent，将在用户端收到更新提醒。
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 历史更新 Tab */}
        {activeTab === "history" && (
          <>
        {/* 筛选区 */}
        <div className="px-6 pb-3 space-y-2 shrink-0">
          {/* 第一级：Agent 类型 */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
              Agent 类型
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter({ kind: "all", value: "" })}
              className={`text-xs px-2.5 py-1 rounded-[3px] border transition-colors ${
                filter.kind === "all"
                  ? "border-[#1447E6]/40 bg-[#1447E6]/5 text-[#1447E6]"
                  : "border-[#E5E5E5] bg-white text-[#334155] hover:border-[#1447E6]/40"
              }`}
            >
              全部
            </button>
            {types.map((t) => {
              const isActive =
                filter.kind === "type" && filter.value === t.agentType
                || filter.kind === "image"
                  && records.find((r) => r.imageId === filter.value)?.agentType === t.agentType;
              return (
                <button
                  key={t.agentType}
                  onClick={() => setFilter({ kind: "type", value: t.agentType })}
                  className={`text-xs px-2.5 py-1 rounded-[3px] border transition-colors ${
                    isActive
                      ? "border-[#1447E6]/40 bg-[#1447E6]/5 text-[#1447E6]"
                      : "border-[#E5E5E5] bg-white text-[#334155] hover:border-[#1447E6]/40"
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-[10px] text-[#A3A3A3] tabular-nums">
                    · {imagesByType.get(t.agentType)?.length ?? 0} 镜像
                  </span>
                </button>
              );
            })}
            </div>
          </div>

          {/* 第二级：镜像（按选中的 Agent 类型展开） */}
          {imageOptionsForActiveType.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
                镜像
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilter({ kind: "type", value: activeTypeForImageFilter })}
                className={`text-xs px-2.5 py-1 rounded-[3px] border transition-colors ${
                  filter.kind === "type"
                    ? "border-[#1447E6]/40 bg-[#1447E6]/5 text-[#1447E6]"
                    : "border-[#E5E5E5] bg-white text-[#334155] hover:border-[#1447E6]/40"
                }`}
              >
                全部镜像
              </button>
              {imageOptionsForActiveType.map((img) => {
                const c = hashImageColor(img.imageId);
                const isActive = filter.kind === "image" && filter.value === img.imageId;
                return (
                  <button
                    key={img.imageId}
                    onClick={() => setFilter({ kind: "image", value: img.imageId })}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-[3px] border transition-colors ${
                      isActive
                        ? `${c.bg} ${c.text} ${c.border}`
                        : "border-[#E5E5E5] bg-white text-[#334155] hover:border-[#A3A3A3]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <span className="truncate max-w-[180px]">{img.imageName}</span>
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* 时间线 */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#A3A3A3]">暂无更新记录</div>
          ) : (
            <ol className="relative space-y-3 ml-2 border-l-2 border-[#F5F5F5] pl-5">
              {filtered.map((r, idx) => {
                const push = findPush(r);
                const isFirstRelease = r.type === "firstRelease";
                const isLatestOfImage = latestIdxPerImage.get(r.imageId) === idx;
                const c = hashImageColor(r.imageId);
                return (
                  <li key={`${r.imageId}-${r.version}-${r.releaseDate}-${idx}`} className="relative">
                    <span
                      className={`absolute -left-[26px] top-2 w-3 h-3 rounded-full border-2 ${
                        push
                          ? "bg-[#1447E6] border-[#1447E6]/30"
                          : isFirstRelease
                            ? "bg-purple-500 border-purple-200"
                            : "bg-white border-[#A3A3A3]"
                      }`}
                    />
                    <div
                      className={`rounded-[4px] p-3 border ${
                        push
                          ? "bg-[#1447E6]/5 border-[#1447E6]/20"
                          : "bg-white border-[#E5E5E5]"
                      }`}
                    >
                      {/* 第一行：镜像彩色徽章 + 版本号 + 首次上线 + 日期 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-default ${c.bg} ${c.text} ${c.border}`}
                            >
                              <Disc3 className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[200px]">{r.imageName}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <div className="font-medium">{r.imageName}</div>
                            <div className="font-mono text-gray-300 mt-0.5">{r.imageId}</div>
                            <div className="text-gray-300 mt-0.5">
                              所属 Agent 类型：{r.agentTypeLabel}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-mono font-semibold text-sm text-[#0A0A0A] tabular-nums">
                          {formatVersion(r.version)}
                        </span>
                        {isFirstRelease && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            <Sparkles className="w-2.5 h-2.5" />
                            首次上线
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#A3A3A3] ml-auto">
                          <Calendar className="w-2.5 h-2.5" />
                          <span className="font-mono tabular-nums">{r.releaseDate}</span>
                        </span>
                      </div>

                      {/* 第二行：所属 Agent 类型 + 镜像 ID（弱化为副标识） */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-[#737373]">
                          属于 <span className="font-medium text-[#334155]">{r.agentTypeLabel}</span>
                        </span>
                        <span className="text-[#A3A3A3] text-[11px]">·</span>
                        <span className="text-[11px] text-[#A3A3A3] font-mono">{r.imageId}</span>
                      </div>

                      {/* 第三行：发布说明 */}
                      <div className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                        {isFirstRelease
                          ? "镜像首次上线"
                          : `更新到 ${formatVersion(r.version)} 版本`}
                      </div>

                      {push ? (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#1447E6]/10 text-[#1447E6] border border-[#1447E6]/20">
                            <Megaphone className="w-2.5 h-2.5" />
                            正在提醒员工更新此版本
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleRevoke(push)}
                                className="inline-flex items-center gap-0.5 text-[10px] text-[#737373] hover:text-red-500 transition-colors"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                撤回
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[220px]">
                              撤回后用户端的"可更新"徽章将立即消失
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : isLatestOfImage ? (
                        <div className="mt-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onPush(r.agentType)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#1447E6] hover:bg-[#1447E6]/10 transition-colors"
                              >
                                <Megaphone className="w-2.5 h-2.5" />
                                推送 {r.agentTypeLabel} 最新版本
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[280px]">
                              推送会基于该 Agent 类型的当前启用版本进行（启用版本由「Agent 类型」管理页决定）
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <SheetFooter className="px-6 pb-4 pt-3 border-t border-[#F5F5F5] shrink-0">
          <Button variant="claw-outline" size="claw-sm" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
