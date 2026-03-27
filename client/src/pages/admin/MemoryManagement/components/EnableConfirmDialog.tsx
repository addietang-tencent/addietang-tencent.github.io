import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EnableConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 开启 TDAI-Memory Free 版确认弹窗
 */
export const EnableConfirmDialog: React.FC<EnableConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
    toast.success('已开启记忆功能，新创建的实例将默认安装');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1a1a2e]">
            开启 TDAI-Memory Free 版
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 蓝色提示框 */}
          <div className="bg-[#dbeafe] border border-[#93c5fd] rounded-[10px] p-4">
            <div className="flex gap-3">
              <span className="text-lg flex-shrink-0">📦</span>
              <div>
                <h4 className="font-semibold text-[#1e40af] mb-2">开启后效果</h4>
                <ul className="text-sm text-[#1e40af] space-y-1">
                  <li>• 新创建的 OpenClaw 实例将<strong>默认安装并启用</strong> TDAI-Memory Free 版记忆插件</li>
                  <li>• 已有的存量实例不受影响，用户可在龙虾端自行开启</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 确认文案 */}
          <p className="text-sm text-[#5c5c7a]">确认开启吗？</p>
        </div>

        <DialogFooter className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-[#e8eaf0] text-[#5c5c7a] hover:bg-[#f9fafb]"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#007AFF] text-white hover:bg-[#0051d5]"
          >
            确认开启
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
