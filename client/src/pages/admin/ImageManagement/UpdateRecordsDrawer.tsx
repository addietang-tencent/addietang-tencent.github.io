/**
 * UpdateRecordsDrawer - 「版本更新」侧边栏
 *
 * 注：组件名保留 Drawer 仅为兼容历史 import，实际形态为右侧 Sheet 面板。
 *
 * 展示所有 Agent 类型的镜像更新历史，让管理员能在一个地方浏览全部版本变化。
 *
 * 功能：
 *   - 顶部开关：「查看可推送版本」—— 仅显示当前可推送给员工的版本记录
 *   - 按 Agent 类型 / 镜像筛选（支持外部传入 initialFilter，进入时自动定位到指定镜像）
 *   - 时间线展示（首次上线 / 更新到 vX.Y.Z）
 *   - 卡片合并展示：版本号 + 当前版本徽章 + 发布说明（合并自原弹窗"版本更新记录"内容）
 *   - 推送状态徽章 + 撤回入口
 *   - 未推送的当前版本可点击"推送此类型最新版本"
 */
import { useMemo, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SmallIconStateButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, RotateCcw, Disc3 } from "lucide-react";
import { toast } from "sonner";
import {
  listActivePushes,
  clearActivePush,
  setActivePush,
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

/** 外部传入的初始筛选条件：进入侧边栏时自动定位 */
export type DrawerInitialFilter =
  | { kind: "all"; value?: string }
  | { kind: "type"; value: string }
  | { kind: "image"; value: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 触发推送弹窗（默认选中传入的 agent 类型） */
  onPush: (defaultAgentType?: string) => void;
  /** 可推送的 Agent 类型列表 */
  pushable?: PushableItem[];
  /** 进入侧边栏时的初始筛选（如：从某行的"版本更新记录"按钮触发，自动筛选到该镜像） */
  initialFilter?: DrawerInitialFilter;
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

export default function UpdateRecordsDrawer({ open, onOpenChange, onPush: _onPush, pushable = [], initialFilter }: Props) {
  /** 仅显示当前可推送给员工的版本记录 */
  const [showPushableOnly, setShowPushableOnly] = useState(false);

  useEffect(() => { if (open) setShowPushableOnly(false); }, [open]);

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

  // 外部传入初始筛选时（如点击表格中的"版本更新记录"按钮），打开抽屉自动定位
  useEffect(() => {
    if (!open) return;
    if (initialFilter) {
      setFilter({ kind: initialFilter.kind, value: initialFilter.value ?? "" });
    } else {
      setFilter({ kind: "all", value: "" });
    }
  }, [open, initialFilter]);

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

  /** 当前可推送版本的命中集合：agentType -> enabledVersion（仅含尚有过期 Agent 的类型） */
  const pushableVersionByType = useMemo(() => {
    const map = new Map<string, string>();
    pushable.filter((p) => !p.allUpToDate).forEach((p) => {
      map.set(p.agentType, p.enabledVersion);
    });
    return map;
  }, [pushable]);

  const filtered = useMemo(() => {
    let list = records;
    if (filter.kind === "type") list = list.filter((r) => r.agentType === filter.value);
    else if (filter.kind === "image") list = list.filter((r) => r.imageId === filter.value);
    if (showPushableOnly) {
      list = list.filter((r) => pushableVersionByType.get(r.agentType) === r.version);
    }
    return list;
  }, [records, filter, showPushableOnly, pushableVersionByType]);

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

  /** 直接推送：不弹窗，立即写入推送状态并刷新 */
  const handleDirectPush = (r: UpdateRecord) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const pushedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    setActivePush({
      agentType: r.agentType,
      agentTypeLabel: r.agentTypeLabel,
      version: r.version,
      imageName: r.imageName,
      imageSource: "public",
      pushedAt,
      pushedBy: "admin@company.com",
      message: `管理员推荐升级到 v${r.version}`,
    });
    setActivePushes(listActivePushes());
    toast.success(`已推送「${r.agentTypeLabel} v${r.version}」更新提醒`);
  };

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
            全部更新记录
          </SheetTitle>
        </SheetHeader>

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
            <ol className="relative space-y-3 ml-2 border-l border-[#E5E5E5] pl-5">
              {filtered.map((r, idx) => {
                const push = findPush(r);
                const isFirstRelease = r.type === "firstRelease";
                const isLatestOfImage = latestIdxPerImage.get(r.imageId) === idx;
                const c = hashImageColor(r.imageId);
                return (
                  <li key={`${r.imageId}-${r.version}-${r.releaseDate}-${idx}`} className="relative">
                    <span
                      className={`absolute -left-[26px] top-2 w-2.5 h-2.5 rounded-full ${
                        push
                          ? "bg-[#1447E6]"
                          : isFirstRelease
                            ? "bg-purple-500"
                            : "bg-[#D4D4D4]"
                      }`}
                    />
                    <div
                      className={`rounded-[4px] p-3 border ${
                        push
                          ? "bg-[#1447E6]/5 border-[#1447E6]/20"
                          : "bg-white border-[#E5E5E5]"
                      }`}
                    >
                      {/* 第一行：镜像彩色徽章（左）+ 状态标签（右上角：当前版本） */}
                      <div className="flex items-center justify-between gap-2">
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
                            <div className="font-mono text-[#A3A3A3] mt-0.5">{r.imageId}</div>
                            <div className="text-[#A3A3A3] mt-0.5">
                              所属 Agent 类型：{r.agentTypeLabel}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        {isLatestOfImage && !isFirstRelease && (
                          <Badge variant="outline" className="shrink-0">当前版本</Badge>
                        )}
                      </div>

                      {/* 第二行：版本号 */}
                      <div className="text-base font-semibold text-[#0A0A0A] mt-1.5">
                        {formatVersion(r.version)}
                      </div>

                      {/* 第三行：所属 Agent 类型 | 镜像 ID | 发布日期 */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-[#737373]">
                        <span>
                          属于 <span className="font-medium">{r.agentTypeLabel}</span>
                        </span>
                        <span className="text-gray-200">|</span>
                        <span className="font-mono">{r.imageId}</span>
                        <span className="text-gray-200">|</span>
                        <span>{r.releaseDate}</span>
                      </div>

                      {/* 第四行：发布说明（合并自原"版本更新记录"弹窗的 description） */}
                      {r.description ? (
                        <p className="text-[11px] text-[#525252] mt-1.5 leading-relaxed">
                          {r.description}
                        </p>
                      ) : (
                        <div className="text-[11px] text-[#A3A3A3] mt-1.5 leading-relaxed italic">
                          {isFirstRelease
                            ? "镜像首次上线"
                            : `更新到 ${formatVersion(r.version)} 版本`}
                        </div>
                      )}

                      {push ? (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#1447E6]">
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
                              <SmallIconStateButton
                                icon={Megaphone}
                                label={`推送 ${r.agentTypeLabel} 最新版本`}
                                onClick={() => handleDirectPush(r)}
                                className="h-5 px-1.5 text-[10px] gap-1 [&_svg]:w-2.5 [&_svg]:h-2.5"
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[280px]">
                              点击后将直接推送该版本更新提醒给员工
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


      </SheetContent>
    </Sheet>
  );
}
