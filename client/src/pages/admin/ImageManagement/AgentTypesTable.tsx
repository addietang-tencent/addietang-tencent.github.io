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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: 180 }}>
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
        <td className="px-4 py-4 align-top">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
              {label}
            </span>
            {isDefault && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white cursor-default whitespace-nowrap"
                    style={{
                      background: "linear-gradient(90deg, #020617 70%, #1447E6 100%)", // allow-inline-gradient: 首选徽章使用主 CTA 渐变
                    }}
                  >
                    <Star className="w-2.5 h-2.5" /> 用户端首选
                  </span>
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
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 cursor-default whitespace-nowrap">
                      <Sparkles className="w-2.5 h-2.5" /> 自定义内核
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
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 cursor-default whitespace-nowrap">
                      兼容 {kernelBaseLabel}
                    </span>
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

        {/* 5. 操作（最多两行）：
         *   第一行 [用户可见 ⚪] [设首选 ★] [切换镜像 ▷]
         *   第二行 [删除类型]（仅自定义类型）
         */}
        <td className="px-4 py-4 align-top whitespace-nowrap">
          <div className="flex flex-col items-start gap-1.5">
            {/* 第一行：用户可见 + 设首选 + 切换镜像 */}
            <div className="flex items-center gap-2">
              {/* 用户可见 Switch */}
              {selected ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`text-[11px] ${
                      isEnabled ? "text-[#1447E6] font-medium" : "text-[#737373]"
                    }`}
                  >
                    用户可见
                  </span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={handleSwitchToggle}
                  />
                </span>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 cursor-not-allowed">
                      <span className="text-[11px] text-gray-300">用户可见</span>
                      <Switch checked={false} disabled />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    请先选择一个镜像
                  </TooltipContent>
                </Tooltip>
              )}

              {/* 设首选 */}
              {isDefault ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2.5 justify-center"
                        disabled
                      >
                        <Star className="w-3 h-3 mr-1" />
                        设首选
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    已是用户端首选类型
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2.5 justify-center"
                  onClick={onSetDefaultType}
                >
                  <Star className="w-3 h-3 mr-1" />
                  设首选
                </Button>
              )}

              {/* 切换镜像 */}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 justify-center"
                onClick={onToggleExpand}
              >
                {expanded ? "收起列表" : "切换镜像"}
                {expanded ? (
                  <ChevronDown className="w-3 h-3 ml-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 ml-1" />
                )}
              </Button>
            </div>

            {/* 第二行：删除（仅自定义类型，左对齐） */}
            {isCustom && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onRemoveCustomType}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除类型
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px] text-xs">
                  删除此自定义 Agent 类型
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
      </tr>

      {/* 展开行 */}
      {expanded && (
        <tr>
          <td
            colSpan={5}
            className="p-0 bg-slate-50/80 border-b border-gray-200"
          >
            {/* 内嵌缩进容器：左侧大缩进 + 蓝色竖线，强化"二级"视觉层级 */}
            <div className="pl-12 pr-6 py-3 relative">
              <span
                aria-hidden
                className="absolute left-6 top-3 bottom-3 w-0.5 rounded-full"
                style={{ background: "linear-gradient(180deg, #020617 70%, #1447E6 100%)" }} // allow-inline-gradient: 二级层级标识使用主 CTA 渐变
              />
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
        <span className="font-mono font-bold text-base text-gray-900 tabular-nums">
          v{image.agentVersion}
        </span>
        {isPublic && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onViewHistory}
                className="inline-flex items-center justify-center w-6 h-6 rounded text-[#1447E6] hover:bg-[#1447E6]/10 transition-colors shrink-0"
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
      <div className="mt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-default whitespace-nowrap ${
                isPublic
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "bg-purple-50 text-purple-700 border-purple-100"
              }`}
            >
              {isPublic ? "腾讯云维护" : "企业自维护"}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
            {isPublic
              ? "由腾讯云持续维护更新，自动跟随官方版本"
              : "由企业自行制作和维护"}
          </TooltipContent>
        </Tooltip>
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
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-default whitespace-nowrap shrink-0 ${
            isPublic
              ? "bg-blue-50 text-blue-700 border-blue-100"
              : "bg-purple-50 text-purple-700 border-purple-100"
          }`}
        >
          {isPublic ? "公共" : "自定义"}
        </span>
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
