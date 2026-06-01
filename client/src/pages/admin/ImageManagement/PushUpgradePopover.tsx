/**
 * PushUpgradePopover - 推送更新提醒下拉框（支持 Agent 类型多选）
 *
 * 形态从 Dialog 改为 Popover：
 *   - 触发器由父组件渲染（如顶部黄色「当前有 N 个生效镜像有新版本」按钮）
 *   - PopoverContent 内含 Agent 类型多选 + 信息提示 + 操作按钮
 *
 * 心智：与原 PushUpgradeDialog 完全一致。
 *   - 不需要选目标版本：版本由"当前启用镜像"决定
 *   - 不需要选实例范围：默认就是该类型下所有"实例版本 ≠ 启用版本"的员工
 *   - 已经在推送当前版本的类型：禁用 Checkbox，提示「正在提醒员工更新」
 */
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, Info, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  setActivePush,
  listActivePushes,
  clearActivePush,
  type ActivePush,
} from "@/lib/upgradePushStore";
import { cn } from "@/lib/utils";
import type { PushableAgentType } from "./PushUpgradeDialog";

interface Props {
  /** Popover 触发节点（如顶部黄色按钮） */
  trigger: React.ReactNode;
  /** 当前所有可推送的 Agent 类型 */
  pushable: PushableAgentType[];
  /** 默认选中的 agent 类型 */
  defaultAgentType?: string;
  /** 推送人（mock） */
  pushedBy?: string;
  /** 点击「查看全部更新记录」按钮时触发 */
  onViewAllRecords?: () => void;
  /** 受控开关状态（可选） */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PushUpgradePopover({
  trigger,
  pushable,
  defaultAgentType,
  pushedBy = "alice@acompany.com",
  onViewAllRecords,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: Props) {
  // 内部 / 受控开关
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    setControlledOpen?.(next);
  };

  // 活跃推送列表
  const [activePushes, setActivePushes] = useState<ActivePush[]>(() => listActivePushes());
  useEffect(() => {
    if (!open) return;
    setActivePushes(listActivePushes());
    const onChange = () => setActivePushes(listActivePushes());
    window.addEventListener("upgrade-push-changed", onChange);
    return () => window.removeEventListener("upgrade-push-changed", onChange);
  }, [open]);

  /** agentType -> 当前活跃推送 */
  const activePushByType = useMemo(() => {
    const map = new Map<string, ActivePush>();
    pushable.forEach((p) => {
      const push = activePushes.find(
        (ap) => ap.agentType === p.agentType && ap.version === p.enabledVersion,
      );
      if (push) map.set(p.agentType, push);
    });
    return map;
  }, [pushable, activePushes]);

  // 仅"已启用 + 有旧版本实例 + 未在推送当前版本"才可选
  const selectable = useMemo(
    () => pushable.filter((p) => !p.allUpToDate && !activePushByType.has(p.agentType)),
    [pushable, activePushByType],
  );

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (defaultAgentType && selectable.some((p) => p.agentType === defaultAgentType)) {
      setSelectedTypes([defaultAgentType]);
    } else if (selectable.length > 0) {
      setSelectedTypes(selectable.map((p) => p.agentType));
    } else {
      setSelectedTypes([]);
    }
  }, [open, defaultAgentType, selectable]);

  const selectedItems = useMemo(
    () =>
      pushable.filter(
        (p) =>
          selectedTypes.includes(p.agentType) &&
          !p.allUpToDate &&
          !activePushByType.has(p.agentType),
      ),
    [pushable, selectedTypes, activePushByType],
  );

  const totalOutdated = useMemo(
    () => selectedItems.reduce((sum, p) => sum + p.outdatedInstanceCount, 0),
    [selectedItems],
  );

  const allSelectableChecked =
    selectable.length > 0 && selectable.every((p) => selectedTypes.includes(p.agentType));

  const toggleOne = (agentType: string, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...new Set([...prev, agentType])] : prev.filter((t) => t !== agentType),
    );
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedTypes(selectable.map((p) => p.agentType));
    } else {
      setSelectedTypes([]);
    }
  };

  const canPush = selectedItems.length > 0;

  /** 撤回某 Agent 类型的当前推送 */
  const handleRevoke = (p: PushableAgentType) => {
    clearActivePush(p.agentType);
    setActivePushes(listActivePushes());
    toast.success(`已撤回「${p.agentTypeLabel}」的更新推送提醒`);
  };

  const handleConfirm = () => {
    if (selectedItems.length === 0) {
      toast.error("请至少选择一个 Agent 类型");
      return;
    }
    const ts = nowStr();
    selectedItems.forEach((item) => {
      const push: ActivePush = {
        agentType: item.agentType,
        agentTypeLabel: item.agentTypeLabel,
        version: item.enabledVersion,
        imageName: item.imageName,
        imageSource: item.imageSource,
        pushedAt: ts,
        pushedBy,
        message: `管理员推荐更新到 v${item.enabledVersion}`,
      };
      setActivePush(push);
    });
    const labels = selectedItems.map((p) => p.agentTypeLabel).join("、");
    toast.success(
      `已向「${labels}」共 ${totalOutdated} 个旧版本 Agent 推送更新提醒`,
    );
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[480px] p-0"
      >
        {/* 标题区 */}
        <div className="px-4 pt-4 pb-3 border-b border-[#F5F5F5]">
          <div className="text-sm font-medium text-[#0A0A0A]">新版本更新推送提醒</div>
          <div className="text-xs text-[#737373] mt-0.5">
            向使用某 Agent 类型的员工推送更新提醒，建议更新到当前启用的镜像版本
          </div>
        </div>

        {/* 内容区 */}
        <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* 1. Agent 类型多选 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Agent 类型 <span className="text-red-400">*</span>
                <span className="ml-1 text-[#A3A3A3]">（可多选）</span>
              </Label>
              {selectable.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleAll(!allSelectableChecked)}
                  className="text-[11px] text-[#1447E6] hover:opacity-80"
                >
                  {allSelectableChecked ? "取消全选" : "全选"}
                </button>
              )}
            </div>
            {pushable.length === 0 ? (
              <div className="text-xs text-[#737373] bg-[#FAFAFA] rounded-[4px] px-3 py-3 text-center">
                暂无已启用的 Agent 类型，请先到表格中启用一个镜像
              </div>
            ) : (
              <div className="space-y-2">
                {pushable.map((p) => {
                  const checked = selectedTypes.includes(p.agentType);
                  const activePush = activePushByType.get(p.agentType);
                  const isActivePushing = !!activePush;
                  const disabled = p.allUpToDate || isActivePushing;
                  const id = `push-popover-${p.agentType}`;
                  return (
                    <label
                      key={p.agentType}
                      htmlFor={id}
                      className={cn(
                        "flex items-start gap-2.5 rounded-[4px] border px-3 py-3 transition-colors",
                        "border-gray-200 bg-white",
                        !checked && !disabled && "hover:border-[#1447E6]/40 cursor-pointer",
                        checked && "border-[#1447E6] bg-[#1447E6]/5",
                        p.allUpToDate && "cursor-not-allowed opacity-60",
                        isActivePushing && "cursor-not-allowed",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(c) => toggleOne(p.agentType, c === true)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {p.imageSource === "custom" && (
                            <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-[#0A0A0A] truncate leading-snug">
                            {p.agentTypeLabel}
                          </span>
                          <span className="text-[11px] text-[#A3A3A3] font-mono tabular-nums shrink-0">
                            v{p.enabledVersion}
                          </span>
                          {isActivePushing ? (
                            <div className="inline-flex items-center gap-2 shrink-0 ml-auto">
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#1447E6]">
                                <Megaphone className="w-2.5 h-2.5" />
                                正在提醒员工更新
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRevoke(p);
                                    }}
                                    className="inline-flex items-center gap-0.5 text-[10px] text-[#737373] hover:text-[#d42a1e] transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                    撤回提醒
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-[220px]">
                                  撤回后用户端的"可更新"徽章将立即消失
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ) : p.allUpToDate ? (
                            <span className="text-[11px] text-[#A3A3A3] shrink-0 ml-auto">
                              已是最新版
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#737373] shrink-0 ml-auto">
                              {p.outdatedInstanceCount} 个旧版本
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#737373] leading-relaxed mt-0.5 truncate">
                          {p.imageName}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. 信息提示（多选汇总） */}
          {selectedItems.length > 0 && (
            <div className="rounded-[4px] bg-[#1447E6]/5 border border-[#1447E6]/20 px-3 py-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#1447E6] mt-0.5 shrink-0" />
              <div className="text-xs text-[#334155] leading-relaxed">
                <div>
                  推送后，已选
                  <span className="mx-1 font-semibold text-[#1447E6] tabular-nums">
                    {selectedItems.length}
                  </span>
                  个 Agent 类型下共
                  <span className="mx-1 font-semibold text-[#1447E6] tabular-nums">
                    {totalOutdated}
                  </span>
                  个旧版本 Agent，将在用户端收到更新提醒。
                </div>
              </div>
            </div>
          )}

          {/* 3. 全部已是最新版提示 */}
          {selectable.length === 0 && pushable.length > 0 && (
            <div className="rounded-[4px] bg-[#FAFAFA] border border-gray-200 px-3 py-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#A3A3A3] mt-0.5 shrink-0" />
              <div className="text-xs text-[#737373] leading-relaxed">
                所有可推送的 Agent 类型当前都已是最新版或已在推送中
              </div>
            </div>
          )}
        </div>

        {/* 操作区 */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#F5F5F5]">
          <Button variant="claw-outline" size="claw-sm" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            variant="dialog-confirm"
            size="claw-sm"
            onClick={handleConfirm}
            disabled={!canPush}
          >
            推送最新版本
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function nowStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
