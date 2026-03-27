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

interface DisableConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 关闭 TDAI-Memory Free 版确认弹窗
 */
export const DisableConfirmDialog: React.FC<DisableConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
    toast.success('已关闭记忆功能，新创建的实例将不再默认安装');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1a1a2e]">
            关闭 TDAI-Memory Free 版
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 黄色警告框 */}
          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-[10px] p-4">
            <div className="flex gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>
                <h4 className="font-semibold text-[#92400e] mb-2">关闭后效果</h4>
                <ul className="text-sm text-[#92400e] space-y-1">
                  <li>• 新创建的 OpenClaw 实例将<strong>不再默认安装</strong>记忆插件</li>
                  <li>• 已有的存量实例不受影响，用户可在龙虾端自行关闭</li>
                  <li>• 已有记忆数据不会删除，但是记忆不会被引用</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 确认文案 */}
          <p className="text-sm text-[#5c5c7a]">确认关闭吗？</p>
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
            className="bg-[#f97316] text-white hover:bg-[#ea580c]"
          >
            确认关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
