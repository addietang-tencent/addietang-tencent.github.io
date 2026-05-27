/**
 * NewVersionPushNotice - 新版本提醒组件
 *
 * 两种 trigger 形态：
 *   - banner: 黄色横幅按钮「有 N 个新版本，M 个正在提醒员工更新 / 可去提醒员工更新」
 *             右侧跟一个向右箭头图标，点击即打开「全部更新记录」侧边栏
 *             （用于镜像管理 / Agent 类型页面顶部）
 *   - bell:   工具栏右上角铃铛图标按钮（带红点提示），用于 Agent 列表页面
 *
 * 数据源：
 *   - 父组件可显式传入 pushable（来自 ImageManagement 内部已聚合的 PushableAgentType[]）
 *   - 若未传则内部使用 useOutdatedTypes() 兜底（用于 Agent 列表等无法直接访问 ImageManagement 内部状态的场景）
 *
 * 点击行为：直接调用父组件传入的 onViewAllRecords，无下拉面板
 */
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import type { PushableAgentType } from "./PushUpgradeDialog";
import { listActivePushes, type ActivePush } from "@/lib/upgradePushStore";
import { useOutdatedTypes } from "../BatchUpdateNotice";

interface NewVersionPushNoticeProps {
  /** trigger 形态：默认 banner（横幅按钮）；bell 为铃铛图标按钮 */
  variant?: "banner" | "bell";
  /** 可选：父组件已聚合的 pushable 列表；未传则内部用 useOutdatedTypes 兜底 */
  pushable?: PushableAgentType[];
  /** 「查看全部更新记录」入口（可选） */
  onViewAllRecords?: () => void;
}

export default function NewVersionPushNotice({
  variant = "banner",
  pushable: pushableFromProps,
  onViewAllRecords,
}: NewVersionPushNoticeProps) {
  // 内部兜底数据源（仅未提供 pushable 时使用）
  const outdated = useOutdatedTypes();

  // 把 OutdatedTypeStat 适配为 PushableAgentType
  const fallbackPushable = useMemo<PushableAgentType[]>(
    () =>
      outdated.map((o) => ({
        agentType: o.agentType,
        agentTypeLabel: o.agentTypeLabel,
        enabledVersion: o.enabledVersion,
        // 兜底 enabledImage：本组件已不消费此字段，给个最小可用对象避免类型断言
        enabledImage: {} as PushableAgentType["enabledImage"],
        imageName: o.enabledImageName,
        imageSource: o.imageSource,
        outdatedInstanceCount: o.outdatedCount,
        allUpToDate: o.outdatedCount === 0,
      })),
    [outdated],
  );

  const pushable = pushableFromProps ?? fallbackPushable;

  // 订阅活跃推送变化，用于 trigger 上的「N 个正在提醒」实时数字
  const [activePushes, setActivePushes] = useState<ActivePush[]>(() => listActivePushes());
  useEffect(() => {
    const onChange = () => setActivePushes(listActivePushes());
    window.addEventListener("upgrade-push-changed", onChange);
    return () => window.removeEventListener("upgrade-push-changed", onChange);
  }, []);

  // 有"旧版本实例"的 Agent 类型数量
  const total = pushable.filter((p) => !p.allUpToDate).length;
  // 正在推送当前版本的 Agent 类型数量
  const pushed = pushable.filter((p) =>
    activePushes.some(
      (ap) => ap.agentType === p.agentType && ap.version === p.enabledVersion,
    ),
  ).length;

  if (total === 0) return null;

  return (
    <button
      type="button"
      onClick={onViewAllRecords}
      className="inline-flex items-center gap-2 px-3 h-8 rounded-[4px] border border-[var(--alert-warning-border)] bg-[var(--alert-warning-bg)] text-[13px] text-[var(--alert-warning-foreground)] hover:brightness-95 transition-colors shrink-0"
    >
      <Bell className="w-3.5 h-3.5 text-[var(--alert-warning-icon)]" />
      <span>
        {variant === "bell"
          ? `${total} 个新版本`
          : pushed === 0
            ? `有 ${total} 个新版本，可去提醒员工更新`
            : `有 ${total} 个新版本，${pushed} 个正在提醒员工更新`}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-[var(--alert-warning-icon)]" />
    </button>
  );
}
