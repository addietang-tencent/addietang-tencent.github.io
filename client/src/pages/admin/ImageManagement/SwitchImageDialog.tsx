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
 *   - DialogContent size="lg"（720px，对应「复杂表单/含表格列表/多列内容」档位）
 *   - DialogHeader / DialogBody / DialogFooter 标准结构
 *   - Footer 按钮：取消（outline，左）+ 确认（default，右）
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  History,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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

  const publicCount = view.publicRow?.allImages.length ?? 0;
  const customCount = view.customRow.allImages.length;
  const enabledInPublic = view.enabled.source === "public";
  const enabledInCustom = view.enabled.source === "custom";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
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
            // 自定义类型：无 Tab，直接展示自定义镜像列表
            <CustomList
              row={view.customRow}
              pendingId={pendingId}
              onSelect={setPendingId}
              onEditImage={onEditImage}
              onDeleteImage={onDeleteImage}
              onImportCustom={onImportCustom}
            />
          ) : (
            <div className="space-y-3">
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
                          ({publicCount})
                        </span>
                        {enabledInPublic && (
                          <CheckCircle2 className="w-3 h-3 ml-1 text-[#1447E6]" />
                        )}
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
                          ({customCount})
                        </span>
                        {enabledInCustom && (
                          <CheckCircle2 className="w-3 h-3 ml-1 text-[#1447E6]" />
                        )}
                      </SegmentOption>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      由企业自行制作和维护
                    </TooltipContent>
                  </Tooltip>
                </SegmentGroup>
                <div className="ml-auto">
                  <PublicRefreshButton />
                </div>
              </div>

              {tab === "public" ? (
                view.publicRow && view.publicRow.allImages.length > 0 ? (
                  <ImageList
                    images={view.publicRow.allImages}
                    accent="blue"
                    pendingId={pendingId}
                    onSelect={setPendingId}
                    renderActions={(img) => (
                      <>
                        <button
                          onClick={() => onViewPublicHistory(img.id)}
                          className="px-2 py-1 text-[11px] text-[#1447E6] hover:bg-[#1447E6]/10 rounded inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                          <History className="w-3 h-3" />
                          版本更新记录
                        </button>
                        <DeleteIconButton
                          disabled={!!(img.isEffective || img.isVirtual)}
                          disabledReason={
                            img.isEffective
                              ? "用户可见的镜像不可删除"
                              : img.isVirtual
                                ? "腾讯云提供的镜像，未启用过无需删除"
                                : ""
                          }
                          onClick={() => onDeleteImage(img.id)}
                        />
                      </>
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
                  onImportCustom={onImportCustom}
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
  onImportCustom,
}: {
  row: AgentTypeView["customRow"];
  pendingId: string;
  onSelect: (imageId: string) => void;
  onEditImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onImportCustom: () => void;
}) {
  const all = row.allImages
    .filter((i) => i.source === "custom")
    .sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <button
          onClick={onImportCustom}
          className="px-2.5 py-1 text-[11px] text-white rounded inline-flex items-center gap-1 transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{
            background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)", // allow-inline-gradient: 主操作按钮使用主 CTA 渐变
          }}
        >
          <Plus className="w-3 h-3" />
          导入自定义镜像
        </button>
      </div>

      {all.length > 0 ? (
        <ImageList
          images={all}
          accent="purple"
          allowSelectIfMissingVersion={false}
          pendingId={pendingId}
          onSelect={onSelect}
          renderActions={(img) => {
            const missingVersion = !img.agentVersion?.trim();
            return (
              <>
                {missingVersion && (
                  <button
                    onClick={() => onEditImage(img.id)}
                    className="px-2 py-1 text-[11px] text-[#1447E6] hover:bg-[#1447E6]/10 rounded transition-colors whitespace-nowrap"
                  >
                    编辑补齐版本
                  </button>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onEditImage(img.id)}
                      className="p-1 text-[#A3A3A3] hover:text-[#1447E6] transition-colors rounded"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>编辑镜像信息</TooltipContent>
                </Tooltip>
                <DeleteIconButton
                  disabled={img.isEffective}
                  disabledReason="用户可见的镜像不可删除"
                  onClick={() => onDeleteImage(img.id)}
                />
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

// ─── 通用镜像列表（弹窗内单选） ─────────────────────────────────────
const ACCENT_COLORS = {
  blue: {
    ringChecked: "border-[#1447E6] bg-[#1447E6]",
    bgChecked: "bg-[#1447E6]/5",
  },
  purple: {
    ringChecked: "border-purple-500 bg-purple-500",
    bgChecked: "bg-purple-50/60",
  },
} as const;

function ImageList({
  images,
  accent,
  allowSelectIfMissingVersion = true,
  pendingId,
  onSelect,
  renderActions,
}: {
  images: ViewImage[];
  accent: "blue" | "purple";
  allowSelectIfMissingVersion?: boolean;
  pendingId: string;
  onSelect: (imageId: string) => void;
  renderActions: (img: ViewImage) => React.ReactNode;
}) {
  const colors = ACCENT_COLORS[accent];

  return (
    <div className="rounded-[3px] border border-[#E5E5E5] bg-white overflow-hidden">
      {images.map((img, idx) => {
        const checked = pendingId === img.id;
        const missingVersion = !img.agentVersion?.trim();
        const selectable = allowSelectIfMissingVersion || !missingVersion;
        const imgType = img.source === "public" ? "公共" : "自定义";
        return (
          <div
            key={img.id}
            onClick={() => selectable && onSelect(img.id)}
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
              idx > 0 ? "border-t border-[#F5F5F5]" : ""
            } ${
              checked
                ? colors.bgChecked
                : selectable
                  ? "bg-white hover:bg-[#FAFAFA] cursor-pointer"
                  : "bg-amber-50/20"
            }`}
          >
            {/* 单选圆点 */}
            <span
              className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${
                checked
                  ? colors.ringChecked
                  : selectable
                    ? "border-[#A3A3A3] bg-white"
                    : "border-[#E5E5E5] bg-[#FAFAFA]"
              }`}
            >
              {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>

            {/* 版本（含缺版本号警告） */}
            <div className="basis-0 grow shrink-0 min-w-[100px] max-w-[130px]">
              {missingVersion ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap cursor-help">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      缺版本号
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px] text-xs">
                    缺少版本号，无法对用户可见，请编辑后补齐
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-[13px] font-medium text-gray-900 whitespace-nowrap">
                  v{img.agentVersion}
                </span>
              )}
            </div>

            {/* 镜像类型 */}
            <div className="basis-0 grow shrink-0 min-w-[70px] max-w-[90px]">
              <StatusTag mode="fill"
                variant={imgType === "公共" ? "blue" : "gray"}
                className="text-[10px] h-4 px-1.5"
              >
                {imgType}
              </StatusTag>
            </div>

            {/* 镜像（名称 + ID 副位含状态、当前生效徽章）—— 占主要空间 */}
            <div className="basis-0 grow-[3] min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-medium text-gray-900 truncate">
                  {img.name}
                </span>
                {img.isEffective && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#1447E6]/10 text-[#1447E6] whitespace-nowrap">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    当前生效
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
                <span className="font-mono truncate">{img.id}</span>
                <span className="text-gray-300">·</span>
                <ImageStatusBadge status={img.status} />
              </div>
            </div>

            {/* 导入时间 */}
            <div className="basis-0 grow shrink-0 min-w-[90px] max-w-[110px] text-[11px] text-gray-500 font-mono tabular-nums whitespace-nowrap">
              {img.createTime ? img.createTime.split(" ")[0] : "—"}
            </div>

            {/* 操作 */}
            <div
              className="basis-0 grow-[1.5] shrink-0 min-w-[120px] flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {renderActions(img)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 删除按钮 ───────────────────────────────────────────────────────
function DeleteIconButton({
  disabled,
  disabledReason,
  onClick,
}: {
  disabled: boolean;
  disabledReason: string;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex p-1 cursor-not-allowed">
            <Trash2 className="w-3.5 h-3.5 text-gray-200" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[220px] text-xs">
          {disabledReason}
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="p-1 text-[#0A0A0A] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        删除此镜像
      </TooltipContent>
    </Tooltip>
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

  // 弹窗关闭时本组件会随之卸载，未完成的 mock 计时器需要清掉，避免在卸载后调用 setState/toast
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    // mock：1.2 秒后完成；真实场景下走刷新接口
    timerRef.current = setTimeout(() => {
      setRefreshing(false);
      toast.success("已刷新公共镜像列表");
      timerRef.current = null;
    }, 1200);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-2 py-1 text-[11px] text-[#0A0A0A] inline-flex items-center gap-1 transition-colors whitespace-nowrap disabled:opacity-60"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          刷新
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
        重新拉取腾讯云提供的公共镜像列表（如新加白账号生效后可用）
      </TooltipContent>
    </Tooltip>
  );
}
