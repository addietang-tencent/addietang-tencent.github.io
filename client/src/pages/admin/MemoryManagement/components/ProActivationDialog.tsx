import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Lock } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A]">开通 Memory Pro</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-5 space-y-5">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-[4px] px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-700">{error}</p>
            </div>
          )}

          {/* 限免活动提示 */}
          <div className="rounded-[4px] border border-[#E5E5E5] bg-[#FAFAFA] px-5 py-4 space-y-3">
            <p className="text-[13px] font-semibold text-[#0A0A0A]">限时免费体验（至 2026.8.15）</p>
            <p className="text-[12px] text-[#737373] leading-relaxed">
              免费体验期内可使用全部 Pro 能力，体验结束前我们会提前通知定价；体验期结束后<span className="font-medium text-[#0A0A0A]">不会自动扣费</span>，需在控制台主动确认转为付费后方可继续使用。
            </p>
            <div className="pt-3 border-t border-[#E5E5E5] space-y-1.5">
              <p className="text-[12px] text-[#737373] leading-relaxed">
                开通后将获得 <span className="font-semibold text-[#0A0A0A]">{FIXED_MEMORY_SPACES}</span> 个记忆空间，每个记忆空间可绑定一个 Agent。
              </p>
              <p className="text-[12px] text-[#737373] leading-relaxed">
                开通服务需要 3–5 分钟准备资源，准备完成后即可使用。
              </p>
            </div>
          </div>

          {/* 配置项 */}
          <div className="space-y-4">
            {/* 记忆空间配额 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#0A0A0A]">记忆空间配额</span>
                <Lock className="w-3.5 h-3.5 text-[#A3A3A3]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#0A0A0A]">{FIXED_MEMORY_SPACES} 个</span>
                <span className="text-[11px] text-[#A3A3A3]">如需更多请联系商务</span>
              </div>
            </div>

            {/* 默认开通 */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#0A0A0A]">默认开通</span>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={autoEnableForNewInstances} 
                  onCheckedChange={setAutoEnableForNewInstances}
                />
                <span className="text-[11px] text-[#A3A3A3]">新创建的 Agent 自动开通 Pro 版</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#E5E5E5] gap-3 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[100px] text-white border-none"
            style={{ background: '#0A0A0A' }}
          >
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
