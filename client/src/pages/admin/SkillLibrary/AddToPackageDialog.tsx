/**
 * 加入初始技能包弹窗
 * 用于从公共技能库或企业技能库将技能加入到某个初始技能包
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle2, AlertCircle } from 'lucide-react';

interface PackageOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface AddToPackageDialogProps {
  open: boolean;
  skillName: string;
  packages: PackageOption[];
  onConfirm: (packageId: string) => void;
  onCancel: () => void;
}

export default function AddToPackageDialog({
  open,
  skillName,
  packages,
  onConfirm,
  onCancel,
}: AddToPackageDialogProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [result, setResult] = useState<{ packageId: string; packageName: string; isActive: boolean } | null>(null);

  const handleConfirm = () => {
    if (!selectedPackageId) return;
    const pkg = packages.find(p => p.id === selectedPackageId);
    if (!pkg) return;
    setResult({ packageId: pkg.id, packageName: pkg.name, isActive: pkg.isActive });
    onConfirm(selectedPackageId);
  };

  const handleClose = () => {
    setSelectedPackageId(null);
    setResult(null);
    onCancel();
  };

  const handleGoToPackage = () => {
    handleClose();
    // 实际项目中这里可以跳转到对应技能包
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm">
        {!result ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                选择初始技能包
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 my-2">
              <p className="text-sm text-gray-500">
                将「<span className="font-medium text-gray-800">{skillName}</span>」加入到：
              </p>
              <div className="space-y-2">
                {packages.length > 0 ? (
                  packages.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        selectedPackageId === pkg.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPackageId === pkg.id
                            ? 'border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPackageId === pkg.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{pkg.name}</span>
                      </div>
                      {pkg.isActive && (
                        <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                          生效中
                        </Badge>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无初始技能包</p>
                    <p className="text-xs mt-1">请先在「技能初始包」Tab 中创建</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>取消</Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedPackageId || packages.length === 0}
              >
                确认加入
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                添加成功
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 my-2">
              <p className="text-sm text-gray-600">
                「{skillName}」已成功加入「<span className="font-medium text-gray-800">{result.packageName}</span>」
              </p>
              {result.isActive ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium mb-0.5">需要发布才能对用户生效</p>
                    <p>该技能包正在生效中，已添加成功，但需要前往技能包详情页保存并发布修改后，才能对用户生效。</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-green-800">
                    <p>已成功加入，该技能包当前未生效，等待生效后将对用户可见。</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>关闭</Button>
              <Button onClick={handleGoToPackage}>
                {result.isActive ? '去发布' : '去查看'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
