import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle, AlertOperationInfoIcon } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

interface EnableConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 开启 Memory Free 版确认弹窗
 */
export const EnableConfirmDialog: React.FC<EnableConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = () => {
    if (!isChecked) {
      toast.error('请勾选确认框');
      return;
    }
    onConfirm();
    toast.success('已开启 Memory Free 版，正在为所有实例开启记忆插件');
    setIsChecked(false);
  };

  const handleCancel = () => {
    setIsChecked(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent
        className="sm:max-w-md"
        style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader>
          <DialogTitle>开启 Memory Free 版</DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1">
          <div className="space-y-4">
            <p className="text-sm text-[#0A0A0A]">
              确认后将在所有实例上安装并启用记忆功能。
            </p>

            <Alert variant="operation-info">
              <AlertOperationInfoIcon />
              <AlertTitle>开启后效果</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>新创建的 Agent 将<span className="font-medium">默认安装并启用</span> Memory Free 版记忆插件</li>
                  <li>所有现有 Agent 将会<span className="font-medium">自动安装</span>此插件，安装过程需要重启 Agent Gateway 服务</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <CircleAlert />
              <AlertTitle>请注意：此操作涉及所有现有实例</AlertTitle>
              <AlertDescription>
                安装过程中，实例的 Gateway 服务将重启，会导致
                <span className="font-medium text-[#DC2626]">服务短暂中断（约 1 分钟/实例）</span>。
                建议避开业务高峰期进行操作。
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-2">
              <Checkbox
                id="enableCheck"
                checked={isChecked}
                onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="enableCheck" className="text-sm font-medium text-[#0A0A0A] cursor-pointer">
                我已了解上述说明，确认开启
              </Label>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button variant="dialog-confirm" onClick={handleConfirm} disabled={!isChecked}>
            确认开启
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
