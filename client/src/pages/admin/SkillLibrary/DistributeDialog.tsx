import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

interface OpenClawInstance {
  id: string;
  name: string;
  createdBy: string;
}

interface DistributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  instances: OpenClawInstance[];
  onDistribute: (selectedInstanceIds: string[]) => void;
  onViewProgress: () => void;
}

export default function DistributeDialog({
  open,
  onOpenChange,
  skillName,
  instances,
  onDistribute,
  onViewProgress,
}: DistributeDialogProps) {
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInstances(instances.map(i => i.id));
    } else {
      setSelectedInstances([]);
    }
  };

  const handleSelectInstance = (instanceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInstances([...selectedInstances, instanceId]);
    } else {
      setSelectedInstances(selectedInstances.filter(id => id !== instanceId));
    }
  };

  const handleStartDistribute = () => {
    setIsDistributing(true);
    onDistribute(selectedInstances);
    
    // 模拟安装流程开始
    setTimeout(() => {
      setShowSuccessMessage(true);
    }, 500);
  };

  const handleConfirm = () => {
    setShowSuccessMessage(false);
    setIsDistributing(false);
    setSelectedInstances([]);
    onOpenChange(false);
  };

  if (showSuccessMessage) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>下发 {skillName}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">已开始安装流程</p>
                <p className="text-sm text-gray-600 mt-1">
                  已向 {selectedInstances.length} 个 OpenClaw 实例下发 {skillName}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleConfirm}>
              确认
            </Button>
            <Button onClick={onViewProgress}>
              查看进度
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>下发 {skillName}</DialogTitle>
          <DialogDescription>
            选择要下发该 Skill 的 OpenClaw 实例
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* 全选 */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              checked={selectedInstances.length === instances.length && instances.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label className="text-sm font-medium text-gray-900 cursor-pointer flex-1">
              全选 ({selectedInstances.length}/{instances.length})
            </label>
          </div>

          {/* 实例列表 */}
          <div className="space-y-2">
            {instances.map(instance => (
              <div
                key={instance.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  checked={selectedInstances.includes(instance.id)}
                  onCheckedChange={(checked) =>
                    handleSelectInstance(instance.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{instance.name}</p>
                  <p className="text-xs text-gray-600">创建人: {instance.createdBy}</p>
                </div>
              </div>
            ))}
          </div>

          {instances.length === 0 && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">暂无可用的 OpenClaw 实例</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleStartDistribute}
            disabled={selectedInstances.length === 0 || isDistributing}
          >
            {isDistributing ? '下发中...' : '确认下发'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
