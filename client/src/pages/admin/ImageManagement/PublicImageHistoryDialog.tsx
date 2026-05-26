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
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import { SurfaceInner } from "@/components/ui/Surface";
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
      <DialogContent
        className="sm:max-w-md"
        style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader>
          <DialogTitle>版本更新记录</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-[#0A0A0A]">{imageName}</div>
              <div className="text-sm text-[#525252]">{imageId}</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1">
          {records.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#525252]">
              暂无版本更新记录
            </div>
          ) : (
            <ol className="relative ml-2 border-l border-[#E5E5E5] pl-5 space-y-5">
              {records.map((r) => {
                const isCurrent = r.isLatest;
                return (
                  <li key={`${r.agentType}-${r.version}`} className="relative">
                    <span
                      className={`absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full ${
                        isCurrent ? "bg-[#355EF1]" : "bg-[#D4D4D4]"
                      }`}
                    />
                    <SurfaceInner className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#0A0A0A]">
                          v{r.version}
                        </span>
                        {isCurrent && <StatusTag variant="green">当前版本</StatusTag>}
                        <span className="text-sm text-[#525252] ml-auto">
                          {r.releaseTime}
                        </span>
                      </div>
                      {r.description && (
                        <p className="mt-1 text-sm text-[#525252] leading-relaxed">
                          {r.description}
                        </p>
                      )}
                    </SurfaceInner>
                  </li>
                );
              })}
            </ol>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
