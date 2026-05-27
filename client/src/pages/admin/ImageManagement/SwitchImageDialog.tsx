/**
 * SwitchImageDialog - 切换镜像弹窗
 *
 * 交互：
 *   1. 点击主表「切换镜像」按钮 → 打开本弹窗
 *   2. 弹窗内通过单选选择目标镜像（仅更新本地待提交状态，不立即生效）
 *   3. 点「确认切换」→ 调用 onConfirm 完成切换并关闭弹窗
 *   4. 点「取消」/ 关闭按钮 / 点击遮罩 → 不做任何修改
 *
 * 使用项目最新规范：
 *   - DialogContent size="xl"（920px，对应「含多列数据表格/Tabs+列表管理」档位）
 *   - DialogHeader / DialogBody / DialogFooter 标准结构
 *   - Footer 按钮：取消（outline，左）+ 确认（default，右）
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  History,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusTag } from "@/components/ui/status-tag";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableActionCell,
} from "@/components/ui/table";
import { ImageStatusBadge } from "./ImageStatusBadge";
import { getCurrentVersion } from "./publicImageRecords";
import type { AgentTypeView, ViewImage } from "./deriveAgentTypeView";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 当前 Agent 类型展示名（如「OpenClaw」），副标题展示 */
  agentTypeLabel: string;
  view: AgentTypeView;
  isCustomAgentType: boolean;

  /** 用户点击「确认切换」时调用，传出最终选定的 imageId */
  onConfirm: (imageId: string) => void;

  /** 弹窗内仍可触发的辅助操作（不会关闭弹窗） */
  onEditImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onViewPublicHistory: (imageId: string) => void;
  onImportCustom: () => void;
}

export default function SwitchImageDialog({
  open,
  onOpenChange,
  agentTypeLabel,
  view,
  isCustomAgentType,
  onConfirm,
  onEditImage,
  onDeleteImage,
  onViewPublicHistory,
  onImportCustom,
}: Props) {
  // ─── 当前生效镜像 ID（短路查找，无须合并数组） ─────────────────────
  const effectiveId = useMemo(
    () =>
      view.publicRow?.allImages.find((i) => i.isEffective)?.id ??
      view.customRow.allImages.find((i) => i.isEffective)?.id ??
      "",
    [view.publicRow, view.customRow]
  );

  // 当前生效所在 Tab（仅系统预设类型用到）
  const enabledTab: "public" | "custom" =
    view.enabled.source === "custom" ? "custom" : "public";

  const [tab, setTab] = useState<"public" | "custom">(enabledTab);

  // ─── 待提交选中（不立即生效，确认后才切换） ─────────────────────
  const [pendingId, setPendingId] = useState<string>(effectiveId);

  // 仅在弹窗"由关到开"那一刻重置选中态与 Tab：
  // 防止外部 view 在弹窗开启期间变化（例如其它行启停镜像）时，把用户的待选改动覆盖掉。
  const prevOpen = useRef(open);
  useEffect(() => {
    if (open && !prevOpen.current) {
      setPendingId(effectiveId);
      setTab(enabledTab);
    }
    prevOpen.current = open;
  }, [open, effectiveId, enabledTab]);

  const canConfirm = !!pendingId && pendingId !== effectiveId;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(pendingId);
    onOpenChange(false);
  };

  // 当前生效镜像对象（用于信息卡片）
  const effectiveImage = useMemo(() => {
    if (!effectiveId) return null;
    return (
      view.publicRow?.allImages.find((i) => i.id === effectiveId) ??
      view.customRow.allImages.find((i) => i.id === effectiveId) ??
      null
    );
  }, [effectiveId, view.publicRow, view.customRow]);

  // 列表中过滤掉当前生效镜像
  const publicImages = useMemo(
    () => (view.publicRow?.allImages ?? []).filter((i) => !i.isEffective),
    [view.publicRow]
  );
  const customImages = useMemo(
    () => view.customRow.allImages.filter((i) => !i.isEffective),
    [view.customRow]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="xl"
        style={{
          maxHeight: "min(90vh, 780px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DialogHeader>
          <DialogTitle>
            切换镜像
            {agentTypeLabel && (
              <span className="text-xs text-gray-400 font-normal ml-2">
                · {agentTypeLabel}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1">
          {isCustomAgentType ? (
            // 自定义类型：无 Tab，顶部直接放导入按钮
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onImportCustom}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  导入自定义镜像
                </Button>
              </div>
              <CustomList
                row={view.customRow}
                pendingId={pendingId}
                onSelect={setPendingId}
                onEditImage={onEditImage}
                onDeleteImage={onDeleteImage}
                onViewHistory={onViewPublicHistory}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* 当前生效镜像信息卡片 —— 使用规范 Table 组件，结构与下方列表完全一致 */}
              {effectiveImage && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[#737373]">当前用户可见镜像</div>
                  <Table density="compact" containerClassName="rounded-[3px] border border-[#E5E5E5]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]" />
                        <TableHead>Agent 版本</TableHead>
                        <TableHead>镜像</TableHead>
                        <TableHead>镜像状态</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="w-[40px]" />
                        {/* Agent 版本：版本号 + History / 腾讯云维护 */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                              v{effectiveImage.agentVersion}
                            </span>
                            {effectiveImage.source === "public" && (() => {
                              const hasHistory = getCurrentVersion(effectiveImage.id) !== null;
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      disabled={!hasHistory}
                                      onClick={() => hasHistory && onViewPublicHistory(effectiveImage.id)}
                                      className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded-[4px] text-[#737373] hover:text-[#020617] hover:bg-[#f5f5f5] transition-colors disabled:cursor-not-allowed disabled:text-[#A3A3A3] disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
                                      aria-label="版本更新记录"
                                    >
                                      <History className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">
                                    {hasHistory ? "版本更新记录" : "暂无版本更新记录"}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })()}
                          </div>
                          {effectiveImage.source === "public" && (
                            <div className="mt-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <StatusTag variant="gray">腾讯云维护更新</StatusTag>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  由腾讯云持续维护更新，自动跟随官方版本
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </TableCell>

                        {/* 镜像：类型 + 名称 / ID */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <StatusTag variant={effectiveImage.source === "public" ? "blue" : "gray"}>
                              {effectiveImage.source === "public" ? "公共" : "自定义"}
                            </StatusTag>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[240px]">
                              {effectiveImage.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 font-mono truncate">
                            {effectiveImage.id}
                          </div>
                        </TableCell>

                        {/* 镜像状态 */}
                        <TableCell>
                          <ImageStatusBadge status={effectiveImage.status || "available"} />
                        </TableCell>

                        {/* 创建时间 */}
                        <TableCell className="text-sm font-medium text-gray-900 tabular-nums">
                          {effectiveImage.createTime ? effectiveImage.createTime.split(" ")[0] : "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex items-center gap-3">
                <SegmentGroup>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SegmentOption
                        active={tab === "public"}
                        onClick={() => setTab("public")}
                      >
                        公共镜像
                        <span className="ml-1.5 text-[#A3A3A3]">
                          ({publicImages.length})
                        </span>
                      </SegmentOption>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      由腾讯云持续维护更新，自动跟随官方版本
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SegmentOption
                        active={tab === "custom"}
                        onClick={() => setTab("custom")}
                      >
                        自定义镜像
                        <span className="ml-1.5 text-[#A3A3A3]">
                          ({customImages.length})
                        </span>
                      </SegmentOption>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      由企业自行制作和维护
                    </TooltipContent>
                  </Tooltip>
                </SegmentGroup>
                <div className="ml-auto flex items-center gap-2">
                  {tab === "custom" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onImportCustom}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      导入自定义镜像
                    </Button>
                  )}
                  <PublicRefreshButton />
                </div>
              </div>

              {tab === "public" ? (
                publicImages.length > 0 ? (
                  <ImageList
                    images={publicImages}
                    pendingId={pendingId}
                    onSelect={setPendingId}
                    onViewHistory={onViewPublicHistory}
                  />
                ) : (
                  <EmptyHint text="暂无公共镜像" />
                )
              ) : (
                <CustomList
                  row={view.customRow}
                  pendingId={pendingId}
                  onSelect={setPendingId}
                  onEditImage={onEditImage}
                  onDeleteImage={onDeleteImage}
                  onViewHistory={onViewPublicHistory}
                />
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="dialog-confirm" disabled={!canConfirm} onClick={handleConfirm}>
            确认切换
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 自定义镜像列表 ─────────────────────────────────────────────────────
function CustomList({
  row,
  pendingId,
  onSelect,
  onEditImage,
  onDeleteImage,
  onViewHistory,
}: {
  row: AgentTypeView["customRow"];
  pendingId: string;
  onSelect: (imageId: string) => void;
  onEditImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onViewHistory?: (imageId: string) => void;
}) {
  const all = row.allImages
    .filter((i) => i.source === "custom" && !i.isEffective)
    .sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <div className="space-y-2">
      {all.length > 0 ? (
        <ImageList
          images={all}
          allowSelectIfMissingVersion={false}
          pendingId={pendingId}
          onSelect={onSelect}
          onViewHistory={onViewHistory}
          renderActions={(img) => {
            return (
              <>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onEditImage(img.id)}
                >
                  编辑
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="link"
                        size="sm"
                        disabled={img.isEffective}
                        onClick={() => onDeleteImage(img.id)}
                      >
                        删除
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {img.isEffective && (
                    <TooltipContent side="left" className="max-w-[220px] text-xs">
                      用户可见的镜像不可删除
                    </TooltipContent>
                  )}
                </Tooltip>
              </>
            );
          }}
        />
      ) : (
        <EmptyHint text="尚未导入任何自定义镜像" />
      )}
    </div>
  );
}

// ─── 通用镜像列表（弹窗内单选，使用规范 Table + RadioGroupItem） ─────
function ImageList({
  images,
  allowSelectIfMissingVersion = true,
  pendingId,
  onSelect,
  onViewHistory,
  renderActions,
}: {
  images: ViewImage[];
  allowSelectIfMissingVersion?: boolean;
  pendingId: string;
  onSelect: (imageId: string) => void;
  onViewHistory?: (imageId: string) => void;
  renderActions?: (img: ViewImage) => React.ReactNode;
}) {
  return (
    <RadioGroup value={pendingId} onValueChange={onSelect}>
      <Table density="compact" containerClassName="rounded-[3px] border border-[#E5E5E5]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>Agent 版本</TableHead>
            <TableHead>镜像</TableHead>
            <TableHead>镜像状态</TableHead>
            <TableHead>创建时间</TableHead>
            {renderActions && <TableHead>操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((img) => {
            const checked = pendingId === img.id;
            const missingVersion = !img.agentVersion?.trim();
            const selectable = allowSelectIfMissingVersion || !missingVersion;
            const imgType = img.source === "public" ? "公共" : "自定义";
            return (
              <TableRow
                key={img.id}
                data-state={checked ? "selected" : undefined}
                className={selectable ? "cursor-pointer" : ""}
                onClick={() => selectable && onSelect(img.id)}
              >
                {/* 规范 Radio */}
                <TableCell className="w-[40px]">
                  <RadioGroupItem
                    value={img.id}
                    disabled={!selectable}
                    aria-label={`选择镜像 ${img.name}`}
                  />
                </TableCell>

                {/* Agent 版本 */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {missingVersion ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap cursor-help">
                            <AlertTriangle className="w-3 h-3" />
                            缺版本号
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px] text-xs">
                          缺少版本号，无法对用户可见，请编辑后补齐
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        v{img.agentVersion}
                      </span>
                    )}
                    {onViewHistory && (() => {
                      const hasHistory = img.source === "public" && getCurrentVersion(img.id) !== null;
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={!hasHistory}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasHistory) onViewHistory(img.id);
                              }}
                              className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded-[4px] text-[#737373] hover:text-[#020617] hover:bg-[#f5f5f5] transition-colors disabled:cursor-not-allowed disabled:text-[#A3A3A3] disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
                              aria-label="版本更新记录"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            {hasHistory ? "版本更新记录" : "暂无版本更新记录"}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}
                  </div>
                  {img.source === "public" && (
                    <div className="mt-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <StatusTag variant="gray">腾讯云维护更新</StatusTag>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          由腾讯云持续维护更新，自动跟随官方版本
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </TableCell>

                {/* 镜像：类型标签 + 名称 + ID + 状态（与 agent 类型页镜像列同款样式） */}
                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusTag variant={imgType === "公共" ? "blue" : "gray"}>
                      {imgType}
                    </StatusTag>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[240px]">
                      {img.name}
                    </span>
                    {img.isEffective && (
                      <StatusTag variant="green">
                        当前生效
                      </StatusTag>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
                    <span className="font-mono truncate">{img.id}</span>
                  </div>
                </TableCell>

                {/* 镜像状态 */}
                <TableCell>
                  <ImageStatusBadge status={img.status} />
                </TableCell>

                {/* 创建时间 */}
                <TableCell className="text-sm font-medium text-gray-900 tabular-nums">
                  {img.createTime ? img.createTime.split(" ")[0] : "—"}
                </TableCell>

                {/* 操作列 */}
                {renderActions && (
                  <TableActionCell
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      {renderActions(img)}
                    </div>
                  </TableActionCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </RadioGroup>
  );
}

// ─── 空提示 ─────────────────────────────────────────────────────────
function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-[3px] border border-dashed border-[#E5E5E5] px-3 py-6 text-center">
      <span className="text-xs text-[#A3A3A3]">{text}</span>
    </div>
  );
}

// ─── 公共镜像刷新按钮 ─────────────────────────────────────────────────
function PublicRefreshButton() {
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    timerRef.current = setTimeout(() => {
      setRefreshing(false);
      toast.success("已刷新公共镜像列表");
      timerRef.current = null;
    }, 1200);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
        重新拉取腾讯云提供的公共镜像列表（如新加白账号生效后可用）
      </TooltipContent>
    </Tooltip>
  );
}
