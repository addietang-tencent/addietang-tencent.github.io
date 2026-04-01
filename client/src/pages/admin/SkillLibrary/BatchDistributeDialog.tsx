import { useState, useEffect } from 'react';
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
import { type DistributionStatus, DISTRIBUTION_STATUS_MAP, type InstanceStatus, INSTANCE_STATUS_MAP } from './types';

interface BatchDistributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId?: string;
  skillName?: string;
  onDistributionStart?: (selectedInstanceIds: string[], selectedInstancesData: any[]) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500];

export default function BatchDistributeDialog({
  open,
  onOpenChange,
  skillName,
  onDistributionStart,
}: BatchDistributeDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [distributionFilter, setDistributionFilter] = useState<'all' | DistributionStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 当打开弹窗时，默认选中所有运行中且未下发或下发失败的实例
  useEffect(() => {
    if (open) {
      const validIds = MOCK_OPENCLAW_INSTANCES
        .filter(i => i.status === 'running' && (i.distributionStatus === 'not_distributed' || i.distributionStatus === 'failed'))
        .map(i => i.id);
      setSelectedInstances(validIds);
    }
  }, [open]);

  const allFilteredInstances = MOCK_OPENCLAW_INSTANCES
    .filter(instance => {
      // 仅显示运行中的实例
      if (instance.status !== 'running') return false;
      const matchesSearch = instance.name.toLowerCase().includes(searchQuery.toLowerCase()) || instance.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        distributionFilter === 'all' ? (instance.distributionStatus === 'not_distributed' || instance.distributionStatus === 'failed') :
        instance.distributionStatus === distributionFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 分页计算
  const totalCount = allFilteredInstances.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const filteredInstances = allFilteredInstances.slice(startIndex, startIndex + pageSize);

  const handleSelectAll = () => {
    const currentPageIds = filteredInstances.map(i => i.id);
    const allSelected = currentPageIds.every(id => selectedInstances.includes(id));
    if (allSelected) {
      setSelectedInstances(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedInstances(prev => [...new Set([...prev, ...currentPageIds])]);
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
    setCurrentPage(1);
    setPageSize(20);
    onOpenChange(false);
  };

  const getStatusDisplay = (status?: DistributionStatus) => {
    const s = status || 'not_distributed';
    const { label, color } = DISTRIBUTION_STATUS_MAP[s];
    return <span className={`font-medium text-xs ${color.split(' ')[0]}`}>{label}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量下发 Skill</DialogTitle>
          <DialogDescription>
            将 <span className="font-semibold text-gray-900">{skillName}</span> 下发到选中的 OpenClaw 云服务器，仅支持状态为运行中，并且下发状态为未下发或下发失败的实例。
          </DialogDescription>
        </DialogHeader>

        {/* 搜索框 + 筛选 */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索 OpenClaw 云服务器..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
          <Select value={distributionFilter} onValueChange={(value: any) => { setDistributionFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="not_distributed">未下发</SelectItem>
              <SelectItem value="failed">下发失败</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 实例列表 */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {/* 全选复选框 */}
          <div className="flex items-center gap-3 p-2 border-b border-gray-200 bg-gray-50 sticky top-0">
            <Checkbox
              checked={filteredInstances.length > 0 && filteredInstances.every(i => selectedInstances.includes(i.id))}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-gray-900">
              全选本页 ({filteredInstances.filter(i => selectedInstances.includes(i.id)).length}/{filteredInstances.length})
              {selectedInstances.length > 0 && <span className="text-gray-500 ml-2">· 共选中 {selectedInstances.length} 个</span>}
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
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium text-gray-900 truncate min-w-fit">{instance.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{instance.id}</p>
                </div>

              </div>
              <div className="flex-shrink-0">
                {getStatusDisplay(instance.distributionStatus)}
              </div>
            </div>
          ))}
        </div>

        {/* 分页控件 */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>每页</span>
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>{size} 条</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span>共 {totalCount} 条</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                ‹
              </Button>
              <span className="px-2">{safeCurrentPage} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                ›
              </Button>
            </div>
          </div>
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
