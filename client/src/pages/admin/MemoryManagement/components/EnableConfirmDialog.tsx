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
import { AlertTriangle, Info } from 'lucide-react';

interface EnableConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EnableConfirmDialog: React.FC<EnableConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  const [checked, setChecked] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setChecked(false);
    toast.success('已开启记忆功能，正在向所有实例推送安装...');
  };

  const handleCancel = () => {
    setChecked(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>开启 Memory Free 版</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info box */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700 leading-relaxed space-y-1">
              <p>• 新创建的 OpenClaw 实例将<strong>默认安装并启用</strong> Memory Free 版记忆插件。</p>
              <p>• 所有现有实例将<strong>自动安装</strong>此插件，安装过程需要重启 Gateway 服务。</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>请注意：</strong>安装过程中，实例的 Gateway 服务将重启，会导致<strong>服务短暂中断（约 1 分钟/实例）</strong>。建议避开业务高峰期。
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-600">我已了解上述说明，确认开启</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button
            onClick={handleConfirm}
            disabled={!checked}
            className="text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
          >
            确认开启
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
