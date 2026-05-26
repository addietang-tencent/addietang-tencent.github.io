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
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button, SmallIconStateButton } from "@/components/ui/button";
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
import { SurfaceInner } from "@/components/ui/Surface";
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
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* 当前生效镜像信息卡片 */}
              {effectiveImage && (
                <SurfaceInner className="px-5 py-4">
                  <div className="text-xs font-medium text-[#737373] mb-2">当前生效镜像</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusTag variant={effectiveImage.source === "public" ? "blue" : "gray"}>
                      {effectiveImage.source === "public" ? "公共" : "自定义"}
                    </StatusTag>
                    <span className="text-sm font-medium text-[#0A0A0A]">
                      {effectiveImage.name}
                    </span>
                    <span className="text-[#E5E5E5]">|</span>
                    <span className="text-sm text-[#525252]">
                      {effectiveImage.id}
                    </span>
                    <span className="text-[#E5E5E5]">|</span>
                    <span className="inline-flex items-center gap-1 text-sm text-[#525252]">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      可用
                    </span>
                    <span className="text-[#E5E5E5]">|</span>
                    <span className="text-sm text-[#525252]">
                      v{effectiveImage.agentVersion}
                    </span>
                    {effectiveImage.source === "public" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <SmallIconStateButton
                              state="default"
                              label=""
                              icon={History}
                              onClick={() => onViewPublicHistory(effectiveImage.id)}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">版本更新记录</TooltipContent>
                      </Tooltip>
                    )}
                    {effectiveImage.createTime && (
                      <>
                        <span className="text-[#E5E5E5]">|</span>
                        <span className="text-sm text-[#525252]">
                          {effectiveImage.createTime.split(" ")[0]} 创建
                        </span>
                      </>
                    )}
                  </div>
                </SurfaceInner>
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
                    renderActions={(img) => (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="link-dark"
                              disabled={!!(img.isEffective || img.isVirtual)}
                              onClick={() => onDeleteImage(img.id)}
                            >
                              删除
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!!(img.isEffective || img.isVirtual) && (
                          <TooltipContent side="left" className="max-w-[220px] text-xs">
                            {img.isEffective
                              ? "用户可见的镜像不可删除"
                              : "腾讯云提供的镜像，未启用过无需删除"}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
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
}: {
  row: AgentTypeView["customRow"];
  pendingId: string;
  onSelect: (imageId: string) => void;
  onEditImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
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
          renderActions={(img) => {
            const missingVersion = !img.agentVersion?.trim();
            return (
              <>
                {missingVersion && (
                  <Button
                    variant="link-dark"
                    onClick={() => onEditImage(img.id)}
                  >
                    编辑补齐版本
                  </Button>
                )}
                <Button
                  variant="link-dark"
                  onClick={() => onEditImage(img.id)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  编辑
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="link-dark"
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
  renderActions: (img: ViewImage) => React.ReactNode;
}) {
  return (
    <RadioGroup value={pendingId} onValueChange={onSelect}>
      <Table containerClassName="rounded-[3px] border border-[#E5E5E5]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>镜像</TableHead>
            <TableHead>版本</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
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

                {/* 镜像：类型标签 + 名称 + ID + 状态 */}
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
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <span className="truncate">{img.id}</span>
                    <span className="text-gray-200">|</span>
                    <ImageStatusBadge status={img.status} />
                  </div>
                </TableCell>

                {/* 版本 */}
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
                    {onViewHistory && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <SmallIconStateButton
                              state={img.source === "public" ? "default" : "disabled"}
                              label=""
                              icon={History}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (img.source === "public") onViewHistory(img.id);
                              }}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {img.source === "public" ? "版本更新记录" : "自定义镜像暂无版本更新记录"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>

                {/* 创建时间 */}
                <TableCell className="text-sm font-medium text-gray-900 tabular-nums">
                  {img.createTime ? img.createTime.split(" ")[0] : "—"}
                </TableCell>

                {/* 操作列 */}
                <TableActionCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-2">
                    {renderActions(img)}
                  </div>
                </TableActionCell>
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
