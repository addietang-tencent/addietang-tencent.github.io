/**
 * AgentTypesTable - 所有 Agent 类型在一张大表里
 *
 * 列定义（6 列）：
 *   Agent 类型 | Agent 版本 | 镜像 | 应用范围 | 用户可见 | 操作
 *
 *   - 「镜像」列复合：镜像类型标签 + 名称 + 切换按钮（h-6 icon+「切换」，与「版本更新记录」同尺寸）+ ID + 导入时间 + 状态徽章
 *   - 「Agent 版本」列：版本号 + 维护方标签；公共版本带 📜 版本更新记录入口
 *   - 「应用范围」列：每类型一个 Popover，决定该类型的镜像对哪些用户可见
 *   - 「操作」列：「设为首选 / 删除」两枚文字按钮（link-dark）；不可执行时禁用并 Tooltip 提示原因
 *     · 设为首选：已是首选 / 尚未选择镜像 → 禁用
 *     · 删除：系统预设类型 → 禁用
 *
 * 行模型：每个 Agent 类型一行（不再有手风琴展开行）；
 *   点击镜像列中的「切换镜像」会弹出 SwitchImageDialog（标准弹窗组件 size=lg），
 *   在弹窗内单选目标镜像 → 点击「确认切换」完成切换。
 *
 * 样式规范：使用 @/components/ui/table 标准 Table 组件（禁止裸 <table>）
 *  - TableHeader bg-[#fafafa]、TableHead h-[54px] 14px/semibold/#09090b
 *  - TableRow 内置 hover:bg-[#fafafa] 和 border-b border-[#f0f0f0]
 *  - 「切换」与「版本更新记录」同款入口：h-6 圆角白底灰边 + icon + 文字
 *  - 「设为首选 / 删除」使用 Button variant="link-dark"（文字按钮，删除态用红色）
 *
 * 注意：本表已剔除「配置功能脚本」相关入口，自研内核（native）类型不再有该按钮
 */
import { useMemo, useState, type ReactNode } from "react";
import {
  History,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusTag } from "@/components/ui/status-tag";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActionCell,
} from "@/components/ui/table";
import SwitchImageDialog from "./SwitchImageDialog";
import { ImageStatusBadge } from "./ImageStatusBadge";
import type { AgentTypeView, ViewImage } from "./deriveAgentTypeView";
import type { CustomAgentType } from "./types";

// ─── 主组件 ───────────────────────────────────────────────────────────
export interface AgentTypeRowData {
  agentType: string;
  view: AgentTypeView;
  label: string;
  isDefault: boolean;
  customType?: CustomAgentType;
  /** 兼容内核 / 自研内核展示标签（如"OpenClaw" 或 undefined） */
  kernelBaseLabel?: string;
}

interface Props {
  rows: AgentTypeRowData[];

  // 类型级操作
  onSetDefaultType: (agentType: string) => void;
  onRemoveCustomType: (agentType: string) => void;

  // 镜像级操作
  onEnableImage: (imageId: string, agentType: string) => void;
  onDisableImage: (imageId: string) => void;
  onSelectImage: (imageId: string, agentType: string) => void;
  onEditImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onViewPublicHistory: (publicImageId: string) => void;
  onImportCustom: (agentType: string) => void;

  // 应用范围渲染槽：由父组件按 agentType 渲染各自的 Popover
  renderScope: (agentType: string) => ReactNode;
}

export default function AgentTypesTable({
  rows,
  onSetDefaultType,
  onRemoveCustomType,
  onEnableImage,
  onDisableImage,
  onSelectImage,
  onEditImage,
  onDeleteImage,
  onViewPublicHistory,
  onImportCustom,
  renderScope,
}: Props) {
  // 当前打开切换弹窗的 agentType（null = 未打开）
  const [dialogAgentType, setDialogAgentType] = useState<string | null>(null);
  const dialogRow = useMemo(
    () =>
      dialogAgentType
        ? rows.find((r) => r.agentType === dialogAgentType) ?? null
        : null,
    [rows, dialogAgentType]
  );

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      <Table className="table-auto">
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 300, minWidth: 300, maxWidth: 300 }}>
              Agent 类型
            </TableHead>
            <TableHead style={{ minWidth: 170 }}>Agent 版本</TableHead>
            <TableHead style={{ minWidth: 220 }}>镜像</TableHead>
            <TableHead style={{ minWidth: 160 }}>应用范围</TableHead>
            <TableHead style={{ minWidth: 100 }}>用户可见</TableHead>
            <TableHead style={{ minWidth: 100, width: "1%" }}>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <AgentTypeRow
              key={row.agentType}
              row={row}
              onOpenSwitchDialog={() => setDialogAgentType(row.agentType)}
              onSetDefaultType={() => onSetDefaultType(row.agentType)}
              onRemoveCustomType={() => onRemoveCustomType(row.agentType)}
              onEnableImage={(imgId) => onEnableImage(imgId, row.agentType)}
              onDisableImage={onDisableImage}
              onViewPublicHistory={onViewPublicHistory}
              scopeSlot={renderScope(row.agentType)}
            />
          ))}
        </TableBody>
      </Table>

      {dialogRow && (
        <SwitchImageDialog
          open={!!dialogAgentType}
          onOpenChange={(open) => {
            if (!open) setDialogAgentType(null);
          }}
          agentTypeLabel={dialogRow.label}
          view={dialogRow.view}
          isCustomAgentType={!!dialogRow.customType}
          onConfirm={(imageId) =>
            onSelectImage(imageId, dialogRow.agentType)
          }
          onEditImage={onEditImage}
          onDeleteImage={onDeleteImage}
          onViewPublicHistory={onViewPublicHistory}
          onImportCustom={() => onImportCustom(dialogRow.agentType)}
        />
      )}
    </div>
  );
}

// ─── 单行 ────────────────────────────────────────────────────────────
function AgentTypeRow({
  row,
  onOpenSwitchDialog,
  onSetDefaultType,
  onRemoveCustomType,
  onEnableImage,
  onDisableImage,
  onViewPublicHistory,
  scopeSlot,
}: {
  row: AgentTypeRowData;
  onOpenSwitchDialog: () => void;
  onSetDefaultType: () => void;
  onRemoveCustomType: () => void;
  onEnableImage: (imgId: string) => void;
  onDisableImage: (imgId: string) => void;
  onViewPublicHistory: (imgId: string) => void;
  scopeSlot: ReactNode;
}) {
  const { view, label, isDefault, customType, kernelBaseLabel } = row;
  const isNative = customType?.kernelBase === "native";
  const isCustom = !!customType;

  const selected = view.selectedImage;
  const isEnabled = view.enabled.isEnabled;

  const handleSwitchToggle = (next: boolean) => {
    if (!selected) return;
    if (next) onEnableImage(selected.id);
    else onDisableImage(selected.id);
  };

  return (
    <TableRow
      id={`section-${row.agentType}`}
      data-anchor={row.agentType}
      className="group"
    >
      {/* 1. Agent 类型 */}
      <TableCell
        className="py-4 align-top whitespace-normal"
        style={{ width: 300, minWidth: 300, maxWidth: 300 }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
            {label}
          </span>
          {isDefault && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span><StatusTag variant="blue">用户端首选</StatusTag></span>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                用户端首选 Agent 类型
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {(isNative || (customType && !isNative && kernelBaseLabel)) && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {isNative && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><StatusTag variant="gray">自定义内核</StatusTag></span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                  完全自研内核：管控台部分功能不可用，用户需通过终端配置
                </TooltipContent>
              </Tooltip>
            )}
            {customType && !isNative && kernelBaseLabel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><StatusTag variant="gray">兼容 {kernelBaseLabel}</StatusTag></span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
                  与 {kernelBaseLabel} 完全兼容，管控台功能保持一致
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </TableCell>

      {/* 2. Agent 版本 */}
      <TableCell className="py-4 align-top">
        {selected ? (
          <AgentVersionCell
            image={selected}
            onViewHistory={() => onViewPublicHistory(selected.id)}
          />
        ) : (
          <span className="text-[12px] text-gray-400">—</span>
        )}
      </TableCell>

      {/* 3. 镜像（合并：类型标签 + 名称 + 切换镜像按钮 + ID + 导入时间 + 状态） */}
      <TableCell className="py-4 align-top whitespace-normal">
        {selected ? (
          <ImageCombinedCell
            image={selected}
            onSwitchImage={onOpenSwitchDialog}
          />
        ) : (
          <span className="text-[12px] text-gray-400">尚未选择镜像</span>
        )}
      </TableCell>

      {/* 4. 应用范围（外部注入） */}
      <TableCell className="py-4 align-top whitespace-normal">
        {scopeSlot}
      </TableCell>

      {/* 5. 用户可见 */}
      <TableCell className="py-4 align-top">
        {selected ? (
          <span className="inline-flex items-center gap-1.5">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleSwitchToggle}
            />
          </span>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1.5 cursor-not-allowed">
                <Switch checked={false} disabled />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              请先选择一个镜像
            </TooltipContent>
          </Tooltip>
        )}
      </TableCell>

      {/* 6. 操作：「设为首选 / 删除」两枚文字按钮（无镜像 / 已是首选 / 系统预设类型时禁用） */}
      <TableActionCell className="py-4 align-top">
        <div className="flex items-center gap-3">
          {/* 设为首选 — 已是首选 或 尚未选择镜像 时禁用并提示 */}
          {(() => {
            const disabledReason = isDefault
              ? "已是用户端首选"
              : !selected
                ? "请先选择镜像"
                : null;
            if (disabledReason) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="link-dark" size="sm" disabled>
                        设为首选
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {disabledReason}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return (
              <Button
                variant="link-dark"
                size="sm"
                onClick={onSetDefaultType}
              >
                设为首选
              </Button>
            );
          })()}

          {/* 删除 — 仅自定义类型可删除；系统预设类型禁用并提示 */}
          {isCustom ? (
            <Button
              variant="link-dark"
              size="sm"
              onClick={onRemoveCustomType}
              className="text-red-600 hover:text-red-700"
            >
              删除
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="link-dark"
                    size="sm"
                    disabled
                    className="disabled:text-red-300"
                  >
                    删除
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                系统预设类型不可删除
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableActionCell>
    </TableRow>
  );
}

// ─── Agent 版本单元（版本号 + 维护标签 + 公共更新记录入口） ───────────
function AgentVersionCell({
  image,
  onViewHistory,
}: {
  image: ViewImage;
  onViewHistory: () => void;
}) {
  const isPublic = image.source === "public";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          v{image.agentVersion}
        </span>
        {isPublic && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onViewHistory}
                className="inline-flex items-center gap-1 h-6 px-2 rounded bg-white border border-[#E5E5E5] text-[12px] text-[#525252] hover:border-[#1447E6] hover:text-[#020617] transition-colors shrink-0"
              >
                <History className="w-3.5 h-3.5 text-[#737373]" />
                <span>有更新</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              查看版本更新记录
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ─── 镜像复合单元 ─────────────────────────────────────────────────────
function ImageCombinedCell({
  image,
  onSwitchImage,
}: {
  image: ViewImage;
  onSwitchImage: () => void;
}) {
  const isPublic = image.source === "public";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusTag variant={isPublic ? "blue" : "gray"} className="text-[10px] h-4 px-1.5">
          {isPublic ? "公共" : "自定义"}
        </StatusTag>
        <span className="text-sm font-medium text-gray-900 truncate">
          {image.name}
        </span>
        {/* 切换镜像（与「版本更新记录」入口同尺寸：h-6 圆角白底灰边） */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onSwitchImage}
              className="inline-flex items-center gap-1 h-6 px-2 rounded bg-white border border-[#E5E5E5] text-[#737373] hover:text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors shrink-0 text-[12px] whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3 h-3" />
              切换
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            切换镜像
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
        <span className="font-mono truncate">{image.id}</span>
        <span className="text-gray-300">·</span>
        <ImageStatusBadge status={image.status} />
        {/* 仅自定义镜像展示导入时间，公共镜像不展示（公共镜像无"导入"语义） */}
        {!isPublic && image.createTime && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 whitespace-nowrap">
              导入 {image.createTime.split(" ")[0]}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
