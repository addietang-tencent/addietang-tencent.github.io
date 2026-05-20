/**
 * AgentTypesTable - 所有 Agent 类型在一张大表里
 *
 * 列定义（6 列）：
 *   Agent 类型 | Agent 版本 | 镜像 | 用户可见 | 应用范围 | 操作
 *
 *   - 「镜像」列复合：镜像类型标签 + 名称 + ID + 导入时间 + 状态徽章
 *   - 「Agent 版本」列：版本号 + 维护方标签；公共版本带 📜 版本更新记录入口
 *   - 「应用范围」列：每类型一个 Popover，决定该类型的镜像对哪些用户可见
 *   - 「操作」列：类型级操作（设默认 / 删除）+ 切换镜像
 *
 * 行模型：每个 Agent 类型一行；点末尾「切换镜像」展开二级 Tab 列表（手风琴 + 互斥）
 *
 * 注意：本表已剔除「配置功能脚本」相关入口，自研内核（native）类型不再有该按钮
 */
import { useState, type ReactNode } from "react";
import {
  Star,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronRight,
  History,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusTag } from "@/components/ui/status-tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AgentTypeImagePicker from "./AgentTypeImagePicker";
import type { AgentTypeView, ViewImage } from "./deriveAgentTypeView";
import type { CustomAgentType } from "./types";

// ─── 状态映射 ─────────────────────────────────────────────────────────
function statusLabel(status: string): { text: string; tone: "ok" | "pending" | "error" } {
  switch (status) {
    case "available":
      return { text: "可用", tone: "ok" };
    case "creating":
      return { text: "创建中", tone: "pending" };
    case "failed":
    case "error":
      return { text: "异常", tone: "error" };
    default:
      return { text: "可用", tone: "ok" };
  }
}

function StatusBadge({ status }: { status: string }) {
  const { text, tone } = statusLabel(status);
  const colorMap = {
    ok: { dot: "bg-green-500", text: "text-gray-600" },
    pending: { dot: "bg-amber-500", text: "text-amber-600" },
    error: { dot: "bg-red-500", text: "text-red-600" },
  } as const;
  const c = colorMap[tone];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${c.text} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {text}
    </span>
  );
}

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
  // 互斥展开：同时只能展开一个类型的二级列表
  const [expandedType, setExpandedType] = useState<string>("");
  const toggleExpand = (agentType: string) => {
    setExpandedType((prev) => (prev === agentType ? "" : agentType));
  };

  return (
    <div className="rounded-[4px] border border-[#E5E5E5] bg-white overflow-x-auto">
      <table className="w-full text-sm table-auto">
        <thead>
          <tr style={{ backgroundColor: "#f9fafb" }}>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ width: 300, minWidth: 300, maxWidth: 300 }}>
              Agent 类型
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: 170 }}>
              Agent 版本
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: 220 }}>
              镜像
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: 160 }}>
              应用范围
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: 100 }}>
              用户可见
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: 300, width: "1%" }}>
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <AgentTypeRow
              key={row.agentType}
              row={row}
              expanded={expandedType === row.agentType}
              onToggleExpand={() => toggleExpand(row.agentType)}
              onSetDefaultType={() => onSetDefaultType(row.agentType)}
              onRemoveCustomType={() => onRemoveCustomType(row.agentType)}
              onEnableImage={(imgId) => onEnableImage(imgId, row.agentType)}
              onDisableImage={onDisableImage}
              onSelectImage={(imgId) => onSelectImage(imgId, row.agentType)}
              onEditImage={onEditImage}
              onDeleteImage={onDeleteImage}
              onViewPublicHistory={onViewPublicHistory}
              onImportCustom={() => onImportCustom(row.agentType)}
              scopeSlot={renderScope(row.agentType)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 单行 + 展开行 ────────────────────────────────────────────────────
function AgentTypeRow({
  row,
  expanded,
  onToggleExpand,
  onSetDefaultType,
  onRemoveCustomType,
  onEnableImage,
  onDisableImage,
  onSelectImage,
  onEditImage,
  onDeleteImage,
  onViewPublicHistory,
  onImportCustom,
  scopeSlot,
}: {
  row: AgentTypeRowData;
  expanded: boolean;
  onToggleExpand: () => void;
  onSetDefaultType: () => void;
  onRemoveCustomType: () => void;
  onEnableImage: (imgId: string) => void;
  onDisableImage: (imgId: string) => void;
  onSelectImage: (imgId: string) => void;
  onEditImage: (imgId: string) => void;
  onDeleteImage: (imgId: string) => void;
  onViewPublicHistory: (imgId: string) => void;
  onImportCustom: () => void;
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
    <>
      <tr
        id={`section-${row.agentType}`}
        data-anchor={row.agentType}
        className="group hover:bg-gray-50/50 transition-colors"
      >
        {/* 1. Agent 类型 */}
        <td className="px-4 py-4 align-top" style={{ width: 300, minWidth: 300, maxWidth: 300 }}>
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
            {!isDefault && (
              <button
                onClick={onSetDefaultType}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium text-[#1447E6] hover:bg-blue-50 transition-colors whitespace-nowrap invisible group-hover:visible"
              >
                <Star className="w-2.5 h-2.5" /> 设为首选
              </button>
            )}
          </div>
          {(isNative || (customType && !isNative && kernelBaseLabel)) && (
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              {isNative && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><StatusTag variant="gray" dot>自定义内核</StatusTag></span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                    完全自研内核：管控台部分功能不可用，用户需通过终端配置
                  </TooltipContent>
                </Tooltip>
              )}
              {customType && !isNative && kernelBaseLabel && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StatusTag variant="gray" className="text-[10px] h-4 px-1.5">兼容 {kernelBaseLabel}</StatusTag>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
                    与 {kernelBaseLabel} 完全兼容，管控台功能保持一致
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </td>

        {/* 2. Agent 版本 */}
        <td className="px-4 py-4 align-top">
          {selected ? (
            <AgentVersionCell
              image={selected}
              onViewHistory={() => onViewPublicHistory(selected.id)}
            />
          ) : (
            <span className="text-[12px] text-gray-400">—</span>
          )}
        </td>

        {/* 3. 镜像（合并：类型标签 + 名称 + ID + 导入时间 + 状态） */}
        <td className="px-4 py-4 align-top">
          {selected ? (
            <ImageCombinedCell image={selected} />
          ) : (
            <span className="text-[12px] text-gray-400">尚未选择镜像</span>
          )}
        </td>

        {/* 4. 应用范围（外部注入） */}
        <td className="px-4 py-4 align-top">
          {scopeSlot}
        </td>

        {/* 5. 用户可见 */}
        <td className="px-4 py-4 align-top whitespace-nowrap">
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
        </td>

        {/* 6. 操作：[切换镜像 ▷] [更多 ⋯] */}
        <td className="px-4 py-4 align-top whitespace-nowrap">
          <div className="flex items-center gap-2">
            {/* 切换镜像 */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2.5 justify-center border border-[#E5E5E5]"
              onClick={onToggleExpand}
            >
              {expanded ? "收起列表" : "切换镜像"}
              {expanded ? (
                <ChevronDown className="w-3 h-3 ml-1" />
              ) : (
                <ChevronRight className="w-3 h-3 ml-1" />
              )}
            </Button>

            {/* 更多：内含「设为首选」+（自定义类型）「删除类型」
                 当所有项都不可操作时（已是首选 + 非自定义类型），按钮整体禁用 */}
            {(() => {
              const hasClickableMenuItem = !isDefault || isCustom;
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2.5 justify-center border border-[#E5E5E5]"
                      aria-label="更多操作"
                      disabled={!hasClickableMenuItem}
                    >
                      更多
                      <MoreVertical className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    {/* 设为首选 */}
                    {isDefault ? (
                      <DropdownMenuItem disabled>
                        <Star className="w-3.5 h-3.5 mr-2" />
                        已是用户端首选
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={onSetDefaultType}>
                        <Star className="w-3.5 h-3.5 mr-2" />
                        设为首选
                      </DropdownMenuItem>
                    )}
                    {/* 删除类型（仅自定义类型） */}
                    {isCustom && (
                      <DropdownMenuItem
                        onClick={onRemoveCustomType}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        删除类型
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        </td>
      </tr>

      {/* 展开行 */}
      {expanded && (
        <tr>
          <td
            colSpan={6}
            className="p-0 bg-slate-50/80 border-b border-gray-200"
          >
            <div className="px-4 py-3">
              <div className="rounded-[4px] border border-[#E5E5E5] bg-white">
                <AgentTypeImagePicker
                  view={view}
                  isCustomAgentType={isCustom}
                  onSelectImage={onSelectImage}
                  onEditImage={onEditImage}
                  onDeleteImage={onDeleteImage}
                  onViewPublicHistory={onViewPublicHistory}
                  onImportCustom={onImportCustom}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
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
                className="inline-flex items-center justify-center w-6 h-6 rounded bg-white border border-[#E5E5E5] text-[#737373] hover:text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors shrink-0"
              >
                <History className="w-3.5 h-3.5" />
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
function ImageCombinedCell({ image }: { image: ViewImage }) {
  const isPublic = image.source === "public";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusTag variant="gray" className="text-[10px] h-4 px-1.5">
          {isPublic ? "公共" : "自定义"}
        </StatusTag>
        <span className="text-sm font-medium text-gray-900 truncate">
          {image.name}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
        <span className="font-mono truncate">{image.id}</span>
        <span className="text-gray-300">·</span>
        <StatusBadge status={image.status} />
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
