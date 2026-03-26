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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      return <span className="text-green-600 font-medium text-xs">已下发</span>;
    } else if (status === 'not_distributed') {
      return <span className="text-gray-500 text-xs">未下发</span>;
    }
    return <span className="text-gray-500 text-xs">未下发</span>;
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

        {/* 搜索框 + 筛选 */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索 OpenClaw 云服务器..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={distributionFilter} onValueChange={(value: any) => setDistributionFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="distributed">已下发</SelectItem>
              <SelectItem value="not_distributed">未下发</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 实例列表 */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {/* 全选复选框 */}
          <div className="flex items-center gap-3 p-2 border-b border-gray-200 bg-gray-50 sticky top-0">
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
              className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <Checkbox
                checked={selectedInstances.includes(instance.id)}
                onCheckedChange={() => handleSelectInstance(instance.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{instance.name}</p>
              </div>
              <div className="flex-shrink-0">
                {getStatusDisplay(instance.distributionStatus)}
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
