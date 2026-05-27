import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  CircleAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { OcInstance } from './InstanceTable';

interface OneClickUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateInstances: OcInstance[];
  onConfirm: (targets: OcInstance[]) => void | Promise<void>;
}

type DetectStatus = 'detecting' | 'has-upgradable' | 'all-latest';

export const OneClickUpgradeDialog: React.FC<OneClickUpgradeDialogProps> = ({
  open,
  onOpenChange,
  candidateInstances,
  onConfirm,
}) => {
  const [status, setStatus] = useState<DetectStatus>('detecting');
  const [upgradableInstances, setUpgradableInstances] = useState<OcInstance[]>([]);

  useEffect(() => {
    if (!open) {
      setStatus('detecting');
      setUpgradableInstances([]);
      return;
    }

    setStatus('detecting');
    const timer = setTimeout(() => {
      if (candidateInstances.length === 0) {
        setUpgradableInstances([]);
        setStatus('all-latest');
        return;
      }
      const pickCount = Math.max(
        1,
        Math.round(candidateInstances.length * 0.6)
      );
      const picked = candidateInstances.slice(0, pickCount);
      setUpgradableInstances(picked);
      setStatus('has-upgradable');
    }, 800);

    return () => clearTimeout(timer);
  }, [open, candidateInstances]);

  const pendingCount = upgradableInstances.length;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (pendingCount === 0) {
      onOpenChange(false);
      return;
    }
    onConfirm(upgradableInstances);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="sm:max-w-md"
        style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader>
          <DialogTitle>一键启用</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex-1">
          {status === 'detecting' && (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#355EF1] animate-spin" />
              <p className="text-sm text-[#0A0A0A]">正在检测需要升级的 Agent...</p>
              <p className="text-xs text-[#737373]">请稍候</p>
            </div>
          )}
          {status === 'all-latest' && (
            <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E9F8EB] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#008236]" />
              </div>
              <p className="text-sm font-medium text-[#0A0A0A]">
                当前所有 Agent 的记忆服务均为最新版本
              </p>
              <p className="text-xs text-[#737373] leading-relaxed max-w-[360px]">
                您无需进行任何操作。Pro 版 Agent（OpenClaw 类型）已具备 Pro 版全部最新能力。
              </p>
            </div>
          )}
          {status === 'has-upgradable' && (
            <div className="space-y-4">
              <Alert variant="warning">
                <CircleAlert />
                <AlertTitle>升级影响说明</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>升级过程中，对应 Agent 的 Gateway 服务会有短暂中断（约 10–30 秒）</li>
                    <li>升级任务将在后台异步执行，执行期间 Agent 将暂时锁定相关操作</li>
                    <li>本次升级仅升级记忆服务版本，不改变 Free / Pro 版本档位</li>
                    <li>正在进行记忆读写的会话可能需要重试</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-[#0A0A0A] leading-relaxed">
                检测到 <span className="font-semibold">{pendingCount}</span> 个 OpenClaw 类型 Pro 版 Agent 可升级至最新版本，升级后即可使用 <span className="font-medium">Pro 版最新能力</span>。
              </p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {status === 'has-upgradable' && (
            <>
              <Button variant="outline" onClick={handleClose}>取消</Button>
              <Button variant="dialog-confirm" onClick={handleConfirm}>确认启用</Button>
            </>
          )}
          {status === 'all-latest' && (
            <Button variant="dialog-confirm" onClick={handleClose}>我知道了</Button>
          )}
          {status === 'detecting' && (
            <Button variant="outline" onClick={handleClose}>取消</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OneClickUpgradeDialog;
