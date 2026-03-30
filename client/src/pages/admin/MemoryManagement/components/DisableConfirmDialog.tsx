import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DisableConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DisableConfirmDialog: React.FC<DisableConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  const [checked, setChecked] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setChecked(false);
    toast.success('已关闭记忆功能，所有实例记忆插件已禁用');
  };

  const handleCancel = () => {
    setChecked(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>关闭 Memory Free 版</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning box */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 leading-relaxed space-y-1">
              <p>• 新创建的 OpenClaw 实例将<strong>不再默认启用</strong>记忆功能。</p>
              <p>• 所有现有实例的记忆插件将被<strong>禁用</strong>（插件保留，但停止工作）。</p>
              <p>• 已产生的记忆数据不会删除，重新开启后可恢复使用。</p>
            </div>
          </div>

          {/* Danger notice */}
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-sm mt-0.5 shrink-0">🚨</span>
            <p className="text-xs text-red-800 leading-relaxed">
              关闭后，所有现有实例将<strong>立即失去记忆能力</strong>，对话将回退到无记忆状态。请务必提前通知相关用户。
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-red-600"
            />
            <span className="text-sm text-gray-600">我已了解上述说明，确认关闭</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button
            onClick={handleConfirm}
            disabled={!checked}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            确认关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
