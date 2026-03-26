import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { MOCK_OPENCLAW_INSTANCES } from './mockData';

interface BatchDistributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId?: string;
  skillName?: string;
  onDistributionStart?: (selectedInstanceIds: string[], selectedInstancesData: any[]) => void;
}

export default function BatchDistributeDialog({
  open,
  onOpenChange,
  skillName,
  onDistributionStart,
}: BatchDistributeDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [distributionFilter, setDistributionFilter] = useState<'all' | 'distributed' | 'not_distributed'>('all');

  const filteredInstances = MOCK_OPENCLAW_INSTANCES.filter(instance => {
    const matchesSearch = instance.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      distributionFilter === 'all' ||
      instance.distributionStatus === distributionFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedInstances.length === filteredInstances.length) {
      setSelectedInstances([]);
    } else {
      setSelectedInstances(filteredInstances.map(i => i.id));
    }
  };

  const handleSelectInstance = (id: string) => {
    setSelectedInstances(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDistribute = () => {
    const selectedInstancesData = MOCK_OPENCLAW_INSTANCES.filter(i => selectedInstances.includes(i.id));
    
    if (onDistributionStart) {
      onDistributionStart(selectedInstances, selectedInstancesData);
    }
    
    setSelectedInstances([]);
    setSearchQuery('');
    setDistributionFilter('all');
  };

  const getStatusDisplay = (status?: string) => {
    if (status === 'distributed') {
      return <span className="text-green-600 font-medium">已下发</span>;
    } else if (status === 'not_distributed') {
      return <span className="text-gray-500">未下发</span>;
    }
    return <span className="text-gray-500">未下发</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量下发 Skill</DialogTitle>
          <DialogDescription>
            将 <span className="font-semibold text-gray-900">{skillName}</span> 下发到选中的 OpenClaw 云服务器
          </DialogDescription>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索 OpenClaw 云服务器..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 筛选按钮 */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={distributionFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDistributionFilter('all')}
          >
            全部
          </Button>
          <Button
            variant={distributionFilter === 'distributed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDistributionFilter('distributed')}
          >
            已下发
          </Button>
          <Button
            variant={distributionFilter === 'not_distributed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDistributionFilter('not_distributed')}
          >
            未下发
          </Button>
        </div>

        {/* 实例列表 */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {/* 全选复选框 */}
          <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-gray-50 sticky top-0">
            <Checkbox
              checked={selectedInstances.length === filteredInstances.length && filteredInstances.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-gray-900">
              全选 ({selectedInstances.length}/{filteredInstances.length})
            </span>
          </div>

          {/* 实例项 */}
          {filteredInstances.map(instance => (
            <div
              key={instance.id}
              className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <Checkbox
                checked={selectedInstances.includes(instance.id)}
                onCheckedChange={() => handleSelectInstance(instance.id)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{instance.name}</p>
                <p className="text-xs text-gray-500">
                  状态: {getStatusDisplay(instance.distributionStatus)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleDistribute}
            disabled={selectedInstances.length === 0}
          >
            确认下发 ({selectedInstances.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
