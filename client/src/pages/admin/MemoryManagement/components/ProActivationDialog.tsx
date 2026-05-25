import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle, AlertOperationInfoIcon } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CircleAlert, Lock } from 'lucide-react';

// 配置常量
const FIXED_MEMORY_SPACES = 500; // 固定配额：每个用户限额 500 个记忆空间

interface ProActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (config: {
    autoEnableForNewInstances: boolean;
  }) => void;
}

export const ProActivationDialog: React.FC<ProActivationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 增量配置：新创建的 Agent 是否默认开通 Pro
  const [autoEnableForNewInstances, setAutoEnableForNewInstances] = useState(true);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.05) {
            resolve(true);
          } else {
            reject(new Error('网络错误，请稍后重试'));
          }
        }, 800);
      });

      setIsLoading(false);
      onOpenChange(false);
      onConfirm?.({ autoEnableForNewInstances });
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : '开通失败，请稍后重试');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md"
        style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader>
          <DialogTitle>开通 Memory Pro</DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1">
          <div className="space-y-4">
            {/* 错误提示 */}
            {error && (
              <Alert variant="warning">
                <CircleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 限免活动提示 */}
            <Alert variant="warning">
              <CircleAlert />
              <AlertTitle>限时免费体验（至 2026.6.15）</AlertTitle>
              <AlertDescription>
                免费体验期内可使用全部 Pro 能力，体验结束前我们会提前通知定价；体验期结束后<span className="font-medium">不会自动扣费</span>，需在控制台主动确认转为付费后方可继续使用。
              </AlertDescription>
            </Alert>

            <Alert variant="operation-info">
              <AlertOperationInfoIcon />
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>开通后将获得 <span className="font-semibold">{FIXED_MEMORY_SPACES}</span> 个记忆空间，每个记忆空间可绑定一个 Agent</li>
                  <li>开通服务需要 3-5 分钟准备资源，准备完成后即可使用</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* 配置项 */}
            <div className="rounded-[4px] border border-[#E5E5E5] bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-[#0A0A0A]">记忆空间配额</Label>
                  <Lock className="w-3.5 h-3.5 text-[#737373]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0A0A0A]">{FIXED_MEMORY_SPACES} 个</span>
                  <span className="text-xs text-[#737373]">如需更多请联系商务</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-[#0A0A0A]">默认开通</Label>
                  <p className="text-xs text-[#737373]">新创建的 Agent 自动开通 Pro 版</p>
                </div>
                <Switch
                  checked={autoEnableForNewInstances}
                  onCheckedChange={setAutoEnableForNewInstances}
                />
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            取消
          </Button>
          <Button variant="dialog-confirm" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                开通中...
              </>
            ) : (
              '确认开通'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
