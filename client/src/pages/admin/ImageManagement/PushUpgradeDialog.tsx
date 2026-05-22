/**
 * PushUpgradeDialog - 推送更新提醒弹窗（支持 Agent 类型多选）
 *
 * 心智：
 *   推送是声音放大 = "管理员让员工知道：你的实例和当前生效镜像版本不一致"
 *   - 不需要选目标版本：版本由"当前启用镜像"决定
 *   - 不需要选实例范围：默认就是该类型下所有"实例版本 ≠ 启用版本"的员工
 *   - 弹窗里只让用户选「Agent 类型」（支持多选）
 *
 * 可推送条件：
 *   - 该类型已启用某镜像（启用版本存在）
 *   - 实际有 ≥ 1 个实例版本 < 启用版本（mock：演示时全部类型都可选）
 */
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Megaphone, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { setActivePush, type ActivePush } from "@/lib/upgradePushStore";
import type { ImageRow } from "./deriveAgentTypeView";

// ─── 输入信息 ─────────────────────────────────────────────
/** 一个可被推送的 Agent 类型条目 */
export interface PushableAgentType {
  /** Agent 类型 ID（OpenClaw / HermesAgent / ... / custom-xxx） */
  agentType: string;
  /** 展示名 */
  agentTypeLabel: string;
  /** 当前启用版本（必有，否则不会出现在列表） */
  enabledVersion: string;
  /** 当前启用镜像 */
  enabledImage: ImageRow;
  /** 启用镜像名（人类可读） */
  imageName: string;
  /** 镜像来源 */
  imageSource: "public" | "custom";
  /** 旧版本实例数（mock 演示用） */
  outdatedInstanceCount: number;
  /** 是否所有实例都已是最新版（true 时不可推送） */
  allUpToDate: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 当前所有可推送的 Agent 类型 */
  pushable: PushableAgentType[];
  /** 默认选中的 agent 类型（从某条更新记录入口触发时传） */
  defaultAgentType?: string;
  /** 推送人（mock） */
  pushedBy?: string;
}

export default function PushUpgradeDialog({
  open,
  onOpenChange,
  pushable,
  defaultAgentType,
  pushedBy = "alice@acompany.com",
}: Props) {
  // 仅"已启用 + 有旧版本实例"才可选
  const selectable = useMemo(
    () => pushable.filter((p) => !p.allUpToDate),
    [pushable],
  );

  // 多选：保存被选中的 agentType 列表
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    // 优先用默认值；否则默认全选
    if (defaultAgentType && selectable.some((p) => p.agentType === defaultAgentType)) {
      setSelectedTypes([defaultAgentType]);
    } else if (selectable.length > 0) {
      setSelectedTypes(selectable.map((p) => p.agentType));
    } else {
      setSelectedTypes([]);
    }
  }, [open, defaultAgentType, selectable]);

  const selectedItems = useMemo(
    () => pushable.filter((p) => selectedTypes.includes(p.agentType) && !p.allUpToDate),
    [pushable, selectedTypes],
  );

  const totalOutdated = useMemo(
    () => selectedItems.reduce((sum, p) => sum + p.outdatedInstanceCount, 0),
    [selectedItems],
  );

  const allSelectableChecked =
    selectable.length > 0 && selectable.every((p) => selectedTypes.includes(p.agentType));
  const someSelectableChecked = selectable.some((p) => selectedTypes.includes(p.agentType));

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            推送更新提醒
          </DialogTitle>
          <DialogDescription className="text-xs text-[#737373]">
            向使用某 Agent 类型的员工推送更新提醒，建议更新到当前启用的镜像版本
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
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
              <div className="rounded-[4px] border border-[#E5E5E5] bg-[#FAFAFA] divide-y divide-[#E5E5E5] max-h-[280px] overflow-y-auto">
                {pushable.map((p) => {
                  const checked = selectedTypes.includes(p.agentType);
                  const disabled = p.allUpToDate;
                  return (
                    <label
                      key={p.agentType}
                      className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                        disabled
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-white"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(c) => toggleOne(p.agentType, c === true)}
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {p.imageSource === "custom" && (
                          <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium text-[#0A0A0A] truncate">
                          {p.agentTypeLabel}
                        </span>
                        <span className="text-[11px] text-[#A3A3A3] font-mono tabular-nums shrink-0">
                          v{p.enabledVersion}
                        </span>
                        {!disabled && (
                          <span className="text-[11px] text-[#737373] shrink-0 ml-auto">
                            {p.outdatedInstanceCount} 个旧版本
                          </span>
                        )}
                        {disabled && (
                          <span className="text-[11px] text-[#A3A3A3] shrink-0 ml-auto">
                            已是最新版
                          </span>
                        )}
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
                <ul className="mt-1.5 space-y-0.5 text-[11px] text-[#737373]">
                  {selectedItems.map((item) => (
                    <li key={item.agentType} className="flex items-center gap-1">
                      <span className="font-medium text-[#334155]">{item.agentTypeLabel}</span>
                      <span className="font-mono tabular-nums">→ v{item.enabledVersion}</span>
                      <span>· {item.outdatedInstanceCount} 个</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. 全部已是最新版提示 */}
          {selectable.length === 0 && pushable.length > 0 && (
            <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#A3A3A3] mt-0.5 shrink-0" />
              <div className="text-xs text-[#737373] leading-relaxed">
                所有 Agent 类型下的实例都已是最新版，无需推送
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="claw-outline" size="claw-sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="dialog-confirm"
            size="claw-sm"
            onClick={handleConfirm}
            disabled={!canPush}
          >
            确认推送
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function nowStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
