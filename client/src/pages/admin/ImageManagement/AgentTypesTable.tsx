/**
 * AgentTypesTable - 所有 Agent 类型在一张大表里
 *
 * 列定义（6 列）：
 *   Agent 类型 | Agent 版本 | 镜像 | 应用范围 | 用户可见 | 操作
 *
 *   - 「镜像」列复合：镜像类型标签 + 名称 + 切换按钮（h-6 icon+「切换」，与「版本更新记录」同尺寸）+ ID + 导入时间 + 状态徽章
 *   - 「Agent 版本」列：版本号 + 维护方标签；公共版本带 📜 版本更新记录入口
 *   - 「应用范围」列：每类型一个 Popover，决定该类型的镜像对哪些用户可见
 *   - 「操作」列：「推送新版本 / 设为首选 / 删除」三枚文字按钮（link 蓝色文字）；不可执行时禁用并 Tooltip 提示原因
 *     · 推送新版本：未选择镜像 / 用户不可见 / 全员已最新 → 禁用
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
 *  - 操作列使用 Button variant="link"（统一品牌蓝文字按钮，删除不再用红色覆盖）
 *
 * 注意：本表已剔除「配置功能脚本」相关入口，自研内核（native）类型不再有该按钮
 */
import { useMemo, useState, type ReactNode } from "react";
import {
  History,
  Pencil,
  Megaphone,
  RotateCcw,
} from "lucide-react";
import { Button, SmallIconStateButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { IMG_TO_VERSION_KEY } from "./deriveAgentTypeView";
import type { CustomAgentType } from "./types";
import { AGENT_VERSIONS } from "../VersionManagement/mockData";

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
  onPushUpgrade: (agentType: string) => void;
  /** 撤回某 Agent 类型当前正在生效的推送 */
  onRevokePush?: (agentType: string) => void;

  // 镜像级操作
  onEnableImage: (imageId: string, agentType: string) => void;
  onDisableImage: (imageId: string) => void;
  onSelectImage: (imageId: string, agentType: string) => void;
  onEditImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onViewPublicHistory: (publicImageId: string) => void;
  onImportCustom: (agentType: string) => void;

  /** 各 Agent 类型的可推送状态（agentType -> 过期实例信息 + 是否在推送中） */
  pushableByType?: Map<
    string,
    { outdatedInstanceCount: number; allUpToDate: boolean; isActivePushing?: boolean }
  >;

  // 应用范围渲染槽：由父组件按 agentType 渲染各自的 Popover
  renderScope: (agentType: string) => ReactNode;
}

export default function AgentTypesTable({
  rows,
  onSetDefaultType,
  onRemoveCustomType,
  onPushUpgrade,
  onRevokePush,
  onEnableImage,
  onDisableImage,
  onSelectImage,
  onEditImage,
  onDeleteImage,
  onViewPublicHistory,
  onImportCustom,
  pushableByType,
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
      <Table className="table-auto" scrollX={1280}>
        <TableHeader>
          <TableRow>
            <TableHead fixed="left" style={{ width: 300, minWidth: 300, maxWidth: 300 }}>
              Agent 类型
            </TableHead>
            <TableHead style={{ minWidth: 170 }}>Agent 版本</TableHead>
            <TableHead style={{ minWidth: 320 }}>镜像</TableHead>
            <TableHead style={{ minWidth: 100 }}>镜像状态</TableHead>
            <TableHead style={{ minWidth: 160 }}>应用范围</TableHead>
            <TableHead style={{ minWidth: 100 }}>用户可见</TableHead>
            <TableHead fixed="right" style={{ minWidth: 220, width: "1%" }}>操作</TableHead>
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
              onPushUpgrade={() => onPushUpgrade(row.agentType)}
              onRevokePush={onRevokePush ? () => onRevokePush(row.agentType) : undefined}
              onEnableImage={(imgId) => onEnableImage(imgId, row.agentType)}
              onDisableImage={onDisableImage}
              onViewPublicHistory={onViewPublicHistory}
              pushableInfo={pushableByType?.get(row.agentType)}
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
  onPushUpgrade,
  onRevokePush,
  onEnableImage,
  onDisableImage,
  onViewPublicHistory,
  pushableInfo,
  scopeSlot,
}: {
  row: AgentTypeRowData;
  onOpenSwitchDialog: () => void;
  onSetDefaultType: () => void;
  onRemoveCustomType: () => void;
  onPushUpgrade: () => void;
  onRevokePush?: () => void;
  onEnableImage: (imgId: string) => void;
  onDisableImage: (imgId: string) => void;
  onViewPublicHistory: (imgId: string) => void;
  pushableInfo?: { outdatedInstanceCount: number; allUpToDate: boolean; isActivePushing?: boolean };
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
        fixed="left"
        className="py-4 align-top whitespace-normal"
        style={{
          width: 300,
          minWidth: 300,
          maxWidth: 300,
        }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
            {label}
          </span>
        </div>
        {(isDefault || isNative || (customType && !isNative && kernelBaseLabel)) && (
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {isDefault && (
              <Badge className="h-5 px-2 py-[2px] text-xs font-normal bg-[#1447E6] text-white border-transparent hover:bg-[#1447E6]/90">
                用户端首选
              </Badge>
            )}
            {isNative && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <StatusTag variant="gray">自定义内核</StatusTag>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                  完全自研内核：管控台部分功能不可用，用户需通过终端配置
                </TooltipContent>
              </Tooltip>
            )}
            {customType && !isNative && kernelBaseLabel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <StatusTag variant="gray">兼容 {kernelBaseLabel}</StatusTag>
                  </span>
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
            agentType={view.agentType}
            agentLabel={label}
            onViewHistory={() => onViewPublicHistory(selected.id)}
          />
        ) : (
          <span className="text-[12px] text-gray-400">—</span>
        )}
      </TableCell>

      {/* 3. 镜像（合并：类型标签 + 名称 + 切换镜像按钮 + ID） */}
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

      {/* 4. 镜像状态（独立列） */}
      <TableCell className="py-4 align-top">
        {selected ? (
          <ImageStatusBadge status={selected.status} />
        ) : (
          <span className="text-[12px] text-gray-400">—</span>
        )}
      </TableCell>

      {/* 5. 应用范围（外部注入） */}
      <TableCell className="py-4 align-top whitespace-normal">
        {scopeSlot}
      </TableCell>

      {/* 6. 用户可见 */}
      <TableCell className="py-4 align-top">
        {isDefault ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1.5 cursor-not-allowed">
                <Switch checked disabled />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              用户端首选 Agent 必须保持用户可见
            </TooltipContent>
          </Tooltip>
        ) : selected ? (
          isEnabled ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={handleSwitchToggle}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                取消用户可见后，系统将不再推送 Agent 版本更新信息
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleSwitchToggle}
              />
            </span>
          )
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

      {/* 6. 操作：「设为首选 / 删除」两枚文字按钮（条件不满足时禁用） */}
      <TableActionCell fixed="right" className="py-4 align-top">
        <div className="flex items-center gap-4">
          {/* 设为首选 — 已是首选 / 尚未选择镜像 / 用户不可见 时禁用并提示 */}
          <span className="inline-flex shrink-0 justify-start">
          {(() => {
            const disabledReason = isDefault
              ? "已是用户端首选"
              : !selected
                ? "请先选择镜像"
                : !isEnabled
                  ? "用户不可见的 Agent 类型不可设为首选"
                  : null;
            if (disabledReason) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="link" size="sm" disabled>
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
                variant="link"
                size="sm"
                onClick={onSetDefaultType}
              >
                设为首选
              </Button>
            );
          })()}
          </span>

          {/* 删除 — 仅自定义类型可删除；系统预设类型禁用并提示 */}
          <span className="inline-flex shrink-0">
          {isCustom ? (
            <Button
              variant="link"
              size="sm"
              onClick={onRemoveCustomType}
              
            >
              删除
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="link"
                    size="sm"
                    disabled
                    
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
          </span>
        </div>
      </TableActionCell>
    </TableRow>
  );
}

// ─── Agent 版本单元（版本号 + 更新记录入口） ───────────
function AgentVersionCell({
  image,
  agentType,
  onViewHistory,
}: {
  image: ViewImage;
  agentType: string;
  agentLabel: string;
  onViewHistory?: () => void;
}) {
  const isPublic = image.source === "public";
  const versionKey = IMG_TO_VERSION_KEY[agentType];
  const versionList = versionKey
    ? AGENT_VERSIONS.filter((v) => v.agentType === versionKey)
    : [];
  const hasHistory = isPublic && !!onViewHistory && versionList.length > 0;
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          v{image.agentVersion}
        </span>
        {onViewHistory && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={!hasHistory}
                onClick={onViewHistory}
                className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded-[4px] text-[#737373] hover:text-[#020617] hover:bg-[#f5f5f5] transition-colors disabled:cursor-not-allowed disabled:text-[#A3A3A3] disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
                aria-label="版本更新记录"
              >
                <History className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {hasHistory ? "版本更新记录" : "暂无版本更新记录"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {isPublic && (
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
      <div className="flex items-center gap-1.5 min-w-0">
        <StatusTag variant={isPublic ? "blue" : "gray"}>
          {isPublic ? "公共" : "自定义"}
        </StatusTag>
        <span className="text-sm font-medium text-gray-900 truncate min-w-0">
          {image.name}
        </span>
        {/* 切换镜像 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onSwitchImage}
              className="cursor-pointer self-center text-[#A3A3A3] hover:text-[#355EF1] transition-colors shrink-0"
              aria-label="切换镜像"
              title="切换镜像"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            切换镜像
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-0.5 flex-wrap">
        <span className="truncate">{image.id}</span>
      </div>
    </div>
  );
}
