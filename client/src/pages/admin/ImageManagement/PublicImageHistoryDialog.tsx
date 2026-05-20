/**
 * PublicImageHistoryDialog - 公共镜像版本更新记录
 *
 * 展示某个公共镜像在腾讯云的发布历史。
 * 数据源：AGENT_VERSIONS（按 agentType 过滤）。
 *
 * 设计要点：
 *   - 时间线形式展示，最新在上
 *   - 每条记录：版本号 + 发布时间 + 更新内容
 *   - 当前版本（最新版）高亮
 *   - 不暴露"切换到历史版本"的能力（按需求约束）
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud } from "lucide-react";
import { AGENT_VERSIONS } from "../VersionManagement/mockData";
import type { AgentTypeKey } from "../VersionManagement/mockData";

interface Props {
  open: boolean;
  imageName: string;
  imageId: string;
  agentType: AgentTypeKey | string;
  onClose: () => void;
}

export default function PublicImageHistoryDialog({
  open,
  imageName,
  imageId,
  agentType,
  onClose,
}: Props) {
  const records = AGENT_VERSIONS.filter((v) => v.agentType === agentType).sort(
    (a, b) => b.releaseTime.localeCompare(a.releaseTime),
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#1447E6]" />
            版本更新记录
          </DialogTitle>
          <DialogDescription className="text-xs text-[#737373] leading-relaxed">
            <div className="font-medium text-[#334155]">{imageName}</div>
            <div className="font-mono text-[11px] text-[#A3A3A3] mt-0.5">{imageId}</div>
          </DialogDescription>
        </DialogHeader>

        {records.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#A3A3A3]">
            暂无版本更新记录
          </div>
        ) : (
          <div className="py-2">
            <ol className="relative space-y-4 ml-4 border-l-2 border-[#F5F5F5] pl-6">
              {records.map((r, idx) => {
                const isCurrent = r.isLatest;
                return (
                  <li key={`${r.agentType}-${r.version}`} className="relative">
                    {/* 圆点 */}
                    <span
                      className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 ${
                        isCurrent
                          ? "bg-[#1447E6] border-[#1447E6]/30"
                          : "bg-white border-[#A3A3A3]"
                      }`}
                    />
                    <div
                      className={`rounded-[4px] p-3 ${
                        isCurrent
                          ? "bg-[#1447E6]/5 border border-[#1447E6]/20"
                          : "bg-[#FAFAFA] border border-[#E5E5E5]"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-sm text-[#0A0A0A] tabular-nums">
                          v{r.version}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1447E6] text-white">
                            当前版本
                          </span>
                        )}
                        <span className="text-[11px] text-[#A3A3A3] font-mono ml-auto">
                          {r.releaseTime}
                        </span>
                      </div>
                      {r.description && (
                        <p className="mt-1.5 text-xs text-[#334155] leading-relaxed">
                          {r.description}
                        </p>
                      )}
                    </div>
                    {/* 与下一条的间距由 space-y 决定，无需额外节点 */}
                    {idx < records.length - 1 && null}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <DialogFooter>
          <Button variant="claw-outline" size="claw-sm" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
