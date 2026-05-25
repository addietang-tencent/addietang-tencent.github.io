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
      // TODO: 替换为实际 API 调用（开通 Memory Pro 服务）
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟 95% 成功率
          if (Math.random() > 0.05) {
            resolve(true);
          } else {
            reject(new Error('网络错误，请稍后重试'));
          }
        }, 800);
      });
      
      // 请求成功，立即关闭弹窗并回调
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
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">开通 Memory Pro</DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 限免活动提示 —— 合并「免费体验规则」与「开通后获得的额度 / 准备时长」，让管理员一眼看全本次开通的边界 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
            <p className="font-semibold text-amber-800 text-sm">限时免费体验（至 2026.6.15）</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              免费体验期内可使用全部 Pro 能力，体验结束前我们会提前通知定价；体验期结束后<span className="font-medium">不会自动扣费</span>，需在控制台主动确认转为付费后方可继续使用。
            </p>
            <div className="pt-2 border-t border-amber-200/70 space-y-1">
              <p className="text-xs text-amber-700 leading-relaxed">
                开通后将获得 <span className="font-semibold">{FIXED_MEMORY_SPACES}</span> 个记忆空间，每个记忆空间可绑定一个 Agent。
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                开通服务需要 3-5 分钟准备资源，准备完成后即可使用。
              </p>
            </div>
          </div>

          {/* 配置项 */}
          <div className="space-y-3 py-2">
            {/* 记忆空间配额 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#334155]">记忆空间配额</p>
                <Lock className="w-3.5 h-3.5 text-[#A3A3A3]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#0A0A0A]">{FIXED_MEMORY_SPACES} 个</span>
                <span className="text-xs text-[#A3A3A3]">如需更多请联系商务</span>
              </div>
            </div>

            {/* 默认开通 */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#334155]">默认开通</p>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={autoEnableForNewInstances} 
                  onCheckedChange={setAutoEnableForNewInstances}
                />
                <span className="text-xs text-[#A3A3A3]">新创建的 Agent 自动开通 Pro 版</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button 
            variant="dialog-confirm"
            onClick={handleConfirm}
            disabled={isLoading}
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
