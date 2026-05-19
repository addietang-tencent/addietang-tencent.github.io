/**
 * PushUpgradeDialog - 推送更新提醒弹窗
 *
 * 心智：
 *   推送是声音放大 = "管理员让员工知道：你的实例和当前生效镜像版本不一致"
 *   - 不需要选目标版本：版本由"当前启用镜像"决定
 *   - 不需要选实例范围：默认就是该类型下所有"实例版本 ≠ 启用版本"的员工
 *   - 弹窗里只让用户选「Agent 类型」
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    // 优先用默认值，否则用第一个可选
    if (defaultAgentType && selectable.some((p) => p.agentType === defaultAgentType)) {
      setSelectedType(defaultAgentType);
    } else if (selectable.length > 0) {
      setSelectedType(selectable[0].agentType);
    } else {
      setSelectedType("");
    }
  }, [open, defaultAgentType, selectable]);

  const selected = useMemo(
    () => pushable.find((p) => p.agentType === selectedType),
    [pushable, selectedType],
  );

  const canPush = !!selected && !selected.allUpToDate;

  const handleConfirm = () => {
    if (!selected) {
      toast.error("请选择 Agent 类型");
      return;
    }
    if (selected.allUpToDate) {
      toast.error("该类型下所有实例已是最新版，无需推送");
      return;
    }
    const push: ActivePush = {
      agentType: selected.agentType,
      agentTypeLabel: selected.agentTypeLabel,
      version: selected.enabledVersion,
      imageName: selected.imageName,
      imageSource: selected.imageSource,
      pushedAt: nowStr(),
      pushedBy,
      message: `管理员推荐更新到 v${selected.enabledVersion}`,
    };
    setActivePush(push);
    toast.success(
      `已向「${selected.agentTypeLabel}」的 ${selected.outdatedInstanceCount} 个旧版本 Agent 推送更新提醒`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Megaphone className="w-4 h-4 text-blue-500" />
            推送更新提醒
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            向使用某 Agent 类型的员工推送更新提醒，建议更新到当前启用的镜像版本
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* 1. Agent 类型选择 */}
          <div className="space-y-2">
            <Label className="text-xs">
              Agent 类型 <span className="text-red-400">*</span>
            </Label>
            {pushable.length === 0 ? (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-3 text-center">
                暂无已启用的 Agent 类型，请先到表格中启用一个镜像
              </div>
            ) : (
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                disabled={selectable.length === 0}
              >
                <SelectTrigger className="bg-gray-50 w-full h-auto py-2">
                  <SelectValue
                    placeholder={
                      selectable.length === 0
                        ? "全部类型实例已是最新版"
                        : "选择要推送的 Agent 类型"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {pushable.map((p) => (
                    <SelectItem
                      key={p.agentType}
                      value={p.agentType}
                      disabled={p.allUpToDate}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {p.imageSource === "custom" && (
                          <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                        )}
                        <span className="font-medium">{p.agentTypeLabel}</span>
                        <span className="text-[11px] text-gray-400 font-mono tabular-nums">
                          v{p.enabledVersion}
                        </span>
                        {p.allUpToDate && (
                          <span className="ml-auto text-[11px] text-gray-400 shrink-0">
                            全部已是最新版
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 2. 信息提示 */}
          {selected && !selected.allUpToDate && (
            <div className="rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-700 leading-relaxed">
                <div>
                  推送后，使用 <strong>{selected.agentTypeLabel}</strong> 且版本低于
                  <span className="mx-1 font-mono font-semibold text-blue-700 tabular-nums">
                    v{selected.enabledVersion}
                  </span>
                  的
                  <span className="mx-1 font-semibold text-blue-700 tabular-nums">
                    {selected.outdatedInstanceCount}
                  </span>
                  个 Agent，将在用户端收到更新提醒。
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  当前镜像：{selected.imageName}（
                  {selected.imageSource === "public" ? "腾讯云维护" : "企业自维护"}）
                </div>
              </div>
            </div>
          )}

          {/* 3. 已是最新版提示 */}
          {selected && selected.allUpToDate && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-500 leading-relaxed">
                {selected.agentTypeLabel} 下所有实例都已是 v{selected.enabledVersion}，无需推送
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canPush}
            style={
              canPush
                ? { background: "linear-gradient(135deg, #007AFF, #5856D6)", color: "white" }
                : {}
            }
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
