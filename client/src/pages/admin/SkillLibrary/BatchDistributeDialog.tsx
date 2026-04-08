import { useState, useEffect, useRef } from 'react';
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
import { Search, ChevronDown, Check } from 'lucide-react';
import { MOCK_OPENCLAW_INSTANCES } from './mockData';
import { type DistributionStatus, DISTRIBUTION_STATUS_MAP, type InstanceStatus, INSTANCE_STATUS_MAP } from './types';

/** 筛选选项类型 —— 多选 */
type FilterOption = 'not_distributed' | 'failed' | 'needs_update';

interface BatchDistributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId?: string;
  skillName?: string;
  /** 当前 Skill 最新版本号，用于判定"待更新" */
  skillVersion?: string;
  onDistributionStart?: (selectedInstanceIds: string[], selectedInstancesData: any[]) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500];

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'not_distributed', label: '未下发' },
  { key: 'failed', label: '下发失败' },
  { key: 'needs_update', label: '待更新' },
];

export default function BatchDistributeDialog({
  open,
  onOpenChange,
  skillName,
  skillVersion,
  onDistributionStart,
}: BatchDistributeDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  /** 状态多选筛选 */
  const [statusFilters, setStatusFilters] = useState<FilterOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** 多选下拉的展开状态 */
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 当打开弹窗时，默认选中所有运行中且未下发或下发失败的实例
  useEffect(() => {
    if (open) {
      setStatusFilters(['not_distributed', 'failed']);
      setSearchQuery('');
      setCurrentPage(1);
      setPageSize(20);
      setFilterDropdownOpen(false);
      const validIds = MOCK_OPENCLAW_INSTANCES
        .filter(i => i.status === 'running' && (i.distributionStatus === 'not_distributed' || i.distributionStatus === 'failed'))
        .map(i => i.id);
      setSelectedInstances(validIds);
    }
  }, [open]);

  /** 切换筛选选项 */
  const toggleFilterOption = (key: FilterOption) => {
    setStatusFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setCurrentPage(1);
  };

  /** 获取筛选下拉的显示文本 */
  const getFilterDisplayText = () => {
    if (statusFilters.length === 0) return '全部';
    if (statusFilters.length === FILTER_OPTIONS.length) return '全部';
    return statusFilters.map(k => FILTER_OPTIONS.find(o => o.key === k)?.label).filter(Boolean).join('、');
  };

  /** 判断实例是否需要更新 */
  const isNeedsUpdate = (instance: typeof MOCK_OPENCLAW_INSTANCES[0]): boolean => {
    if (!skillVersion) return false;
    if (instance.distributionStatus !== 'success') return false;
    if (!instance.distributedVersion) return false;
    return instance.distributedVersion !== skillVersion;
  };

  /** 获取实例的显示状态 */
  const getInstanceFilterKey = (instance: typeof MOCK_OPENCLAW_INSTANCES[0]): FilterOption | null => {
    if (isNeedsUpdate(instance)) return 'needs_update';
    if (instance.distributionStatus === 'not_distributed') return 'not_distributed';
    if (instance.distributionStatus === 'failed') return 'failed';
    return null;
  };

  const allFilteredInstances = MOCK_OPENCLAW_INSTANCES
    .filter(instance => {
      // 仅显示运行中的实例
      if (instance.status !== 'running') return false;
      // 仅显示未下发、下发失败、待更新的实例
      const filterKey = getInstanceFilterKey(instance);
      if (!filterKey) return false;

      const matchesSearch = instance.name.toLowerCase().includes(searchQuery.toLowerCase()) || instance.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 多选筛选逻辑：空数组 = 全部
      if (statusFilters.length === 0) {
        return matchesSearch;
      }
      return matchesSearch && statusFilters.includes(filterKey);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 分页计算
  const totalCount = allFilteredInstances.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pagedInstances = allFilteredInstances.slice(startIndex, startIndex + pageSize);

  /** 全选 / 取消全选 —— 操作所有筛选后的实例（跨页） */
  const handleSelectAll = () => {
    const allIds = allFilteredInstances.map(i => i.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedInstances.includes(id));
    if (allSelected) {
      // 取消全选：移除所有筛选结果中的 id
      setSelectedInstances(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      // 全选：合并所有筛选结果的 id
      setSelectedInstances(prev => [...new Set([...prev, ...allIds])]);
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
    setStatusFilters([]);
    setCurrentPage(1);
    setPageSize(20);
    onOpenChange(false);
  };

  const getStatusDisplay = (instance: typeof MOCK_OPENCLAW_INSTANCES[0]) => {
    if (isNeedsUpdate(instance)) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-xs text-gray-400">v{instance.distributedVersion}</span>
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600">待更新</span>
        </span>
      );
    }
    const s = instance.distributionStatus || 'not_distributed';
    const { label, color } = DISTRIBUTION_STATUS_MAP[s];
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
  };

  // 全选判断：跨所有页
  const allIds = allFilteredInstances.map(i => i.id);
  const selectedInFilterCount = allIds.filter(id => selectedInstances.includes(id)).length;
  const isAllSelected = allIds.length > 0 && selectedInFilterCount === allIds.length;
  const isIndeterminate = selectedInFilterCount > 0 && selectedInFilterCount < allIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量下发 Skill</DialogTitle>
          <DialogDescription>
            将 <span className="font-semibold text-gray-900">{skillName}</span> 下发到选中的 OpenClaw 云服务器，仅支持状态为运行中，并且下发状态为未下发、下发失败或待更新的实例。
          </DialogDescription>
        </DialogHeader>

        {/* 搜索框 + 状态下拉 */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索实例名称/ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setFilterDropdownOpen(prev => !prev)}
              className="flex items-center justify-between gap-1 w-32 h-10 px-3 border border-gray-200 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="truncate">{getFilterDisplayText()}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {/* 全部选项 */}
                <button
                  type="button"
                  onClick={() => { setStatusFilters([]); setCurrentPage(1); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>全部</span>
                  {statusFilters.length === 0 && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleFilterOption(opt.key)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>{opt.label}</span>
                    {statusFilters.includes(opt.key) && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 实例列表 */}
        <div className="border border-gray-200 rounded-lg max-h-[340px] overflow-y-auto">
          {/* 全选复选框 — 跨页全选 */}
          <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <Checkbox
              checked={isAllSelected}
              // @ts-ignore – indeterminate prop
              indeterminate={isIndeterminate}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-gray-900">
              全选（{selectedInFilterCount}/{totalCount}）
            </span>
          </div>

          {/* 实例项 */}
          {pagedInstances.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">
              暂无匹配的实例
            </div>
          ) : (
            pagedInstances.map(instance => (
              <div
                key={instance.id}
                className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={selectedInstances.includes(instance.id)}
                  onCheckedChange={() => handleSelectInstance(instance.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 truncate">{instance.name}</span>
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0">{instance.id}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusDisplay(instance)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 分页控件 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span>共 {totalCount} 条，每页</span>
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="w-16 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>条</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <span className="px-2 text-gray-600">{safeCurrentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              下一页
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleDistribute}
            disabled={selectedInstances.length === 0}
            className="btn-primary-glow text-white"
            style={{ background: selectedInstances.length === 0 ? undefined : 'linear-gradient(135deg, #007AFF, #5856D6)' }}
          >
            确认下发（{selectedInstances.length}）
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
