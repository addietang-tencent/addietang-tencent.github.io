import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface ProCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  ocCount: number;
}

export const ProCloseDialog: React.FC<ProCloseDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  ocCount,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setConfirmText('');
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setConfirmText('');
    onOpenChange(false);
    onConfirm?.();
  };

  const isConfirmValid = confirmText === '确认关闭';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            关闭 Memory Pro 服务
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 当前资源使用情况 - 文字形式，放在影响提示上方 */}
          <div className="text-sm text-gray-600">
            当前已有 <strong className="text-gray-900">{ocCount}</strong> 个实例开通了 Memory Pro 服务
          </div>

          {/* 关闭影响说明 */}
          <div className="space-y-2">
            <div className="font-medium text-gray-900">关闭后将产生以下影响：</div>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />
                <span>所有已开通 Memory Pro 的实例将<strong>失去记忆能力</strong>，对应的<strong>记忆数据将被清空且不可恢复</strong></span>
              </li>
            </ul>
          </div>

          {/* 二次确认 */}
          <div className="space-y-2 pt-2">
            <Label className="text-left block">
              请输入 <strong className="text-red-600">确认关闭</strong> 以继续：
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='输入"确认关闭"'
              className={confirmText && !isConfirmValid ? 'border-red-300' : ''}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-red-500">请输入正确的确认文字</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            取消
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                关闭中...
              </>
            ) : (
              '确认关闭服务'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
