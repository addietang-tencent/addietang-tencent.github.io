/**
 * UpdateRecordsDrawer - 「版本更新记录」右侧抽屉
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StatusTag, type StatusTagColor } from "@/components/ui/status-tag";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BodyMedium,
  BodyText,
  CompactText,
  CodeText,
  MetaMedium,
  MetaText,
  MiniBodyText,
  PanelTitle,
} from "@/components/ui/Typography";
import { Bell, Disc3, X } from "lucide-react";
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
  /** 启用镜像 id（用于精确匹配时间线卡片，避免同 agentType 下其它镜像被误判为"可推送"） */
  enabledImage?: { id: string };
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
  /** 进入侧边栏时是否默认开启「仅看可推送新版本」开关（如：从黄色「新版本更新推送提醒」横幅触发时为 true） */
  initialPushableOnly?: boolean;
}

// ─── 镜像标签颜色：仅按 Agent 类型区分，不按具体镜像 / OS 版本扩展色彩 ────
type ImageColorToken = { variant: StatusTagColor; dot: string };

const AGENT_TYPE_COLOR_MAP: Record<string, ImageColorToken> = {
  OpenClaw: { variant: "blue", dot: "bg-[var(--brand-blue)]" },
  HermesAgent: { variant: "teal", dot: "bg-teal-500" },
  LightClawACE: { variant: "violet", dot: "bg-violet-500" },
};

function getAgentTypeColor(agentType: string): ImageColorToken {
  return AGENT_TYPE_COLOR_MAP[agentType] ?? { variant: "gray", dot: "bg-[#0A0A0A]" };
}

export default function UpdateRecordsDrawer({ open, onOpenChange, onPush: _onPush, pushable = [], initialFilter, initialPushableOnly = false }: Props) {
  /** 仅显示当前可推送给员工的版本记录 */
  const [showPushableOnly, setShowPushableOnly] = useState(initialPushableOnly);

  useEffect(() => { if (open) setShowPushableOnly(initialPushableOnly); }, [open, initialPushableOnly]);

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

  /** 当前可推送的"启用镜像版本"键集合：`${imageId}::${version}` —— 仅命中真正启用的镜像 */
  const pushableImageVersionKeys = useMemo(() => {
    const set = new Set<string>();
    pushable.filter((p) => !p.allUpToDate && p.enabledImage?.id).forEach((p) => {
      set.add(`${p.enabledImage!.id}::${p.enabledVersion}`);
    });
    return set;
  }, [pushable]);

  const filtered = useMemo(() => {
    let list = records;
    if (filter.kind === "type") list = list.filter((r) => r.agentType === filter.value);
    else if (filter.kind === "image") list = list.filter((r) => r.imageId === filter.value);
    if (showPushableOnly) {
      // 命中"用户可见 + 启用版本 + 有过期实例"的镜像记录
      list = list.filter((r) => pushableImageVersionKeys.has(`${r.imageId}::${r.version}`));
      // 同一镜像可能存在多条相同 version 的发布记录（不同 releaseDate），仅保留最新一条，
      // 保证卡片数量与提示卡中「可推送镜像数」一一对应
      const seen = new Set<string>();
      list = list.filter((r) => {
        const key = `${r.imageId}::${r.version}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return list;
  }, [records, filter, showPushableOnly, pushableImageVersionKeys]);

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

  const pushableList = useMemo(() => {
    return pushable.filter(
      (p) =>
        !p.allUpToDate
        && !!p.enabledImage?.id
        && pushableImageVersionKeys.has(`${p.enabledImage.id}::${p.enabledVersion}`),
    );
  }, [pushable, pushableImageVersionKeys]);

  const pushedPushableCount = useMemo(() => {
    return pushableList.filter((p) =>
      activePushes.some(
        (ap) => ap.agentType === p.agentType && ap.version === p.enabledVersion,
      ),
    ).length;
  }, [activePushes, pushableList]);

  const allPushablePushed = pushableList.length > 0 && pushedPushableCount === pushableList.length;

  const handlePushAll = () => {
    if (pushableList.length === 0) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const pushedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    pushableList.forEach((p) => {
      setActivePush({
        agentType: p.agentType,
        agentTypeLabel: p.agentTypeLabel,
        version: p.enabledVersion,
        imageSource: p.imageSource,
        imageName: p.imageName,
        pushedAt,
        pushedBy: "admin@company.com",
        message: `管理员推荐升级到 v${p.enabledVersion}`,
      });
    });

    setActivePushes(listActivePushes());
    toast.success(`已推送 ${pushableList.length} 个 Agent 类型的最新版本更新提醒`);
  };

  const handleRevokeAll = () => {
    if (pushableList.length === 0) return;
    pushableList.forEach((p) => clearActivePush(p.agentType));
    setActivePushes(listActivePushes());
    toast.success(`已撤回 ${pushableList.length} 个 Agent 类型的推送提醒`);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full max-w-[calc(100vw-24px)] rounded-none bg-background p-0 data-[vaul-drawer-direction=right]:w-[480px] data-[vaul-drawer-direction=right]:sm:max-w-none">
        <DrawerHeader className="shrink-0 gap-7 bg-background p-4 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <DrawerTitle asChild>
                <PanelTitle as="h2">版本更新记录</PanelTitle>
              </DrawerTitle>
              <DrawerDescription asChild>
                <CompactText as="p" tone="muted" className="w-full">
                  集中查看各 Agent 镜像的版本演进、当前最新版本，以及员工端更新提醒状态。
                </CompactText>
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="关闭"
                className="h-7 w-7 shrink-0 p-0 text-gray-900 hover:text-gray-950"
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[4px] border border-[#E5E5E5] bg-background px-3 py-2.5 select-none">
            <MetaText as="span" tone="muted">
              仅看可推送版本
            </MetaText>
            <Switch
              checked={showPushableOnly}
              onCheckedChange={setShowPushableOnly}
            />
          </label>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-6 p-4">
            {showPushableOnly ? (
              pushableList.length > 0 ? (
                <div className="rounded-[4px] border border-[var(--alert-info-border)] bg-[var(--alert-info-bg)] px-3 py-2.5 text-[var(--alert-info-foreground)]">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 shrink-0 text-[var(--alert-info-icon)]" />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <MetaText as="p" tone="inherit" className="min-w-0 flex-1 leading-relaxed">
                        当前有 <MetaMedium as="span" tone="inherit" className="tabular-nums">{pushableList.length}</MetaMedium> 个镜像可推送新版本，<MetaMedium as="span" tone="inherit" className="tabular-nums">{pushedPushableCount}</MetaMedium> 个已提醒员工
                      </MetaText>
                      <div className="flex shrink-0 items-center gap-2">
                        {!allPushablePushed && (
                          <MetaText
                            as="button"
                            type="button"
                            tone="brand"
                            onClick={handlePushAll}
                            className="inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            一键推送
                          </MetaText>
                        )}
                        {allPushablePushed && (
                          <Button
                            type="button"
                            variant="link-dark"
                            onClick={handleRevokeAll}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-xs"
                          >
                            全部撤回
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[4px] border border-dashed border-[#D8DEE8] bg-background px-4 py-6 text-center">
                  <PanelTitle as="div">当前没有可推送的新版本</PanelTitle>
                  <BodyText as="div" tone="secondary" className="mt-1">
                    所有用户可见镜像都已经是最新版本，或暂无可在员工端触达的升级提醒。
                  </BodyText>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <MetaMedium as="div" tone="muted">Agent 类型</MetaMedium>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilter({ kind: "all", value: "" })}
                      className={`inline-flex h-7 items-center rounded-[4px] border px-2.5 transition-colors ${
                        filter.kind === "all"
                          ? "border-gray-900 bg-background text-gray-900"
                          : "border-[#E5E5E5] bg-background text-gray-500 hover:border-gray-900 hover:text-gray-900"
                      }`}
                    >
                      <MetaMedium as="span" className="text-inherit">全部</MetaMedium>
                    </button>
                    {types.map((t) => {
                      const isActive =
                        (filter.kind === "type" && filter.value === t.agentType)
                        || (filter.kind === "image"
                          && records.find((r) => r.imageId === filter.value)?.agentType === t.agentType);

                      return (
                        <button
                          key={t.agentType}
                          type="button"
                          onClick={() => setFilter({ kind: "type", value: t.agentType })}
                          className={`inline-flex h-7 items-center rounded-[4px] border px-2.5 transition-colors ${
                            isActive
                              ? "border-gray-900 bg-background text-gray-900"
                              : "border-[#E5E5E5] bg-background text-gray-500 hover:border-gray-900 hover:text-gray-900"
                          }`}
                        >
                          <MetaMedium as="span" className="text-inherit">{t.label}</MetaMedium>
                          <MetaText as="span" className="ml-1 tabular-nums text-inherit opacity-75">
                            {imagesByType.get(t.agentType)?.length ?? 0} 镜像
                          </MetaText>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {imageOptionsForActiveType.length > 0 && (
                  <div className="space-y-1.5">
                    <MetaMedium as="div" tone="muted">镜像</MetaMedium>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFilter({ kind: "type", value: activeTypeForImageFilter })}
                        className={`inline-flex h-7 items-center rounded-[4px] border px-2.5 transition-colors ${
                          filter.kind === "type"
                            ? "border-gray-900 bg-background text-gray-900"
                            : "border-[#E5E5E5] bg-background text-gray-500 hover:border-gray-900 hover:text-gray-900"
                        }`}
                      >
                        <MetaMedium as="span" className="text-inherit">全部镜像</MetaMedium>
                      </button>
                      {imageOptionsForActiveType.map((img) => {
                        const c = getAgentTypeColor(activeTypeForImageFilter);
                        const isActive = filter.kind === "image" && filter.value === img.imageId;

                        return (
                          <button
                            key={img.imageId}
                            type="button"
                            onClick={() => setFilter({ kind: "image", value: img.imageId })}
                            className={`inline-flex h-7 items-center gap-1.5 rounded-[4px] border px-2.5 transition-colors ${
                              isActive
                                ? "border-gray-900 bg-background text-gray-900"
                                : "border-[#E5E5E5] bg-background text-gray-500 hover:border-gray-900 hover:text-gray-900"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${c.dot}`} />
                            <MetaText as="span" className="max-w-[180px] truncate text-inherit">{img.imageName}</MetaText>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <MetaText as="div" tone="muted">共 {filtered.length} 条记录</MetaText>

              {filtered.length === 0 ? (
                <div className="rounded-[4px] border border-dashed border-[#D8DEE8] bg-background px-4 py-8 text-center">
                  <PanelTitle as="div">暂无更新记录</PanelTitle>
                  <BodyText as="div" tone="secondary" className="mt-1">
                    当前筛选条件下没有匹配到镜像更新版本，可以切换筛选范围后再看。
                  </BodyText>
                </div>
              ) : (
                <div className="relative">
                  <div aria-hidden className="absolute bottom-3 left-[11px] top-3 w-px bg-[#E5E5E5]" />
                  <ol className="space-y-3">
                    {filtered.map((r, idx) => {
                      const push = findPush(r);
                      const isFirstRelease = r.type === "firstRelease";
                      const isLatestOfImage = latestIdxPerImage.get(r.imageId) === idx;
                      const c = getAgentTypeColor(r.agentType);
                      const typePushable = pushable.find((it) => it.agentType === r.agentType);
                      const outdatedCount = typePushable?.outdatedInstanceCount ?? 0;

                      return (
                        <li key={`${r.imageId}-${r.version}-${r.releaseDate}-${idx}`} className="relative pl-8">
                          <span
                            aria-hidden
                            className="absolute left-[3px] top-5 flex size-4 items-center justify-center rounded-full border border-[#E5E5E5] bg-background"
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                push
                                  ? "bg-[var(--brand-blue)]"
                                  : isFirstRelease
                                    ? "bg-violet-500"
                                    : "bg-[#D0D5DD]"
                              }`}
                            />
                          </span>

                          <div
                            className={`rounded-[4px] border p-5 transition-colors ${
                              push
                                ? "border-[#C7D7FE] bg-[#F5F8FF]"
                                : "border-[#E5E5E5] bg-background"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <StatusTag
                                        mode="soft"
                                        variant={c.variant}
                                        icon={<Disc3 />}
                                        className="max-w-full justify-start rounded-full"
                                      >
                                        <span className="max-w-[210px] truncate">
                                          {r.imageName}
                                        </span>
                                      </StatusTag>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[260px] text-xs">
                                      <BodyMedium as="div" tone="inherit">{r.imageName}</BodyMedium>
                                      <CodeText tone="inherit" className="mt-1 block opacity-80">{r.imageId}</CodeText>
                                      <MetaText as="div" tone="inherit" className="mt-1 opacity-80">
                                        所属 Agent 类型：{r.agentTypeLabel}
                                      </MetaText>
                                    </TooltipContent>
                                  </Tooltip>

                                  {isLatestOfImage && !isFirstRelease && (
                                    <StatusTag mode="soft" variant="gray" className="rounded-full">
                                      最新版本
                                    </StatusTag>
                                  )}

                                </div>

                                <div className="space-y-1">
                                  <PanelTitle as="div" className="leading-6">
                                    {formatVersion(r.version)}
                                  </PanelTitle>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <MetaText as="span" tone="muted">
                                      属于 <MetaText as="span" tone="muted">{r.agentTypeLabel}</MetaText>
                                    </MetaText>
                                    <MetaText as="span" tone="weak">|</MetaText>
                                    <CodeText tone="muted">{r.imageId}</CodeText>
                                    <MetaText as="span" tone="weak">|</MetaText>
                                    <MetaText as="span" tone="muted">{r.releaseDate} 更新</MetaText>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {r.description ? (
                              <MiniBodyText as="p" tone="secondary" className="mt-3 leading-relaxed">
                                {r.description}
                              </MiniBodyText>
                            ) : (
                              <MetaText as="div" tone="weak" className="mt-3 italic leading-relaxed">
                                {isFirstRelease ? "镜像首次上线" : `更新到 ${formatVersion(r.version)} 版本`}
                              </MetaText>
                            )}

                            {push ? (
                              <div className="mt-4 flex items-center justify-start gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRevoke(push)}
                                      className="h-7 w-fit px-2.5 text-xs has-[>svg]:px-2.5"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 256 256"
                                        className="size-3.5 fill-current"
                                        aria-hidden="true"
                                      >
                                        <path d="M244,56v48a12,12,0,0,1-12,12H184a12,12,0,1,1,0-24H201.1l-19-17.38c-.13-.12-.26-.24-.38-.37A76,76,0,1,0,127,204h1a75.53,75.53,0,0,0,52.15-20.72,12,12,0,0,1,16.49,17.45A99.45,99.45,0,0,1,128,228h-1.37A100,100,0,1,1,198.51,57.06L220,76.72V56a12,12,0,0,1,24,0Z" />
                                      </svg>
                                      撤回
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-[220px]">
                                    撤回后用户端的“可更新”徽章会立即消失。
                                  </TooltipContent>
                                </Tooltip>
                                <MetaText as="span" tone="brand" className="font-medium">
                                  正在提醒员工更新
                                </MetaText>
                              </div>
                            ) : isLatestOfImage ? (
                              <div className="mt-4 flex justify-start">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDirectPush(r)}
                                      className="h-7 w-fit px-2.5 text-xs has-[>svg]:px-2.5"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 256 256"
                                        className="size-3.5 fill-current"
                                        aria-hidden="true"
                                      >
                                        <path d="M229.7,82.84l-175.94-54-.16-.05A20,20,0,0,0,28,48V192a20,20,0,0,0,19.94,20,20.38,20.38,0,0,0,5.66-.81l.16,0,78.24-24V196a20,20,0,0,0,20,20h32a20,20,0,0,0,20-20V165.06l25.7-7.89A20.1,20.1,0,0,0,244,138V102A20.1,20.1,0,0,0,229.7,82.84ZM52,186.58V53.43L132,78V162ZM180,192H156V179.78l24-7.36Zm40-56.95-64,19.63V85.33L220,105Z" />
                                      </svg>
                                      推送 {r.agentTypeLabel} 最新版本
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
                                    <BodyText as="div" tone="inherit">点击后将直接推送该版本更新提醒给员工。</BodyText>
                                    <BodyText as="div" tone="inherit" className="mt-1 opacity-80">
                                      推送后，{r.agentTypeLabel} 下共 {outdatedCount} 个旧版本 Agent，将在用户端收到更新提醒。
                                    </BodyText>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
