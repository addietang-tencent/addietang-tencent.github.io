'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, AlertTriangle, ChevronDown, Check, X } from 'lucide-react';
import type { Group } from './types';

/** 卸载状态筛选选项 */
type UninstallFilterOption = 'not_deleted' | 'delete_failed';

const UNINSTALL_FILTER_OPTIONS: { key: UninstallFilterOption; label: string }[] = [
  { key: 'not_deleted', label: '未卸载' },
  { key: 'delete_failed', label: '卸载失败' },
];

interface BatchDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  skillVersion: string;
  /** 已下发成功过的实例列表（从下发记录中聚合） */
  distributedInstances: Array<{
    id: string;
    name: string;
    createdBy: string;
    groupName?: string;
    distributedVersion?: string;
    distributedTime?: string;
    /** 是否曾经卸载失败 */
    deleteStatus?: 'not_deleted' | 'delete_failed';
    deleteFailReason?: string;
  }>;
  groups: Group[];
  onDeleteStart: (selectedInstanceIds: string[], selectedInstancesData: any[]) => void;
}

export default function BatchDeleteDialog({
  open,
  onOpenChange,
  skillName,
  skillVersion,
  distributedInstances,
  groups,
  onDeleteStart,
}: BatchDeleteDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  /** 状态多选筛选 */
  const [statusFilters, setStatusFilters] = useState<UninstallFilterOption[]>([]);
  /** 分组筛选：空数组=全部, 否则为选中的分组名列表（多选） */
  const [scopeFilters, setScopeFilters] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  /** 多选下拉展开状态 */
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [scopeSearchQuery, setScopeSearchQuery] = useState('');
  const scopeDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target as Node)) {
        setScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开时重置状态
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedInstances([]);
      setStatusFilters([]);
      setScopeFilters([]);
      setConfirmDialogOpen(false);
      setStatusDropdownOpen(false);
      setScopeDropdownOpen(false);
      setScopeSearchQuery('');
    }
  }, [open]);

  // 提取所有可用的分组名（去重）
  const availableGroupNames = useMemo(() => {
    const names = new Set<string>();
    distributedInstances.forEach(inst => {
      if (inst.groupName && inst.groupName !== '全部用户') {
        names.add(inst.groupName);
      }
    });
    return Array.from(names);
  }, [distributedInstances]);

  // 筛选后的实例列表
  const filteredInstances = useMemo(() => {
    return distributedInstances.filter(inst => {
      // 搜索过滤
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!inst.name.toLowerCase().includes(q) && !inst.id.toLowerCase().includes(q)) {
          return false;
        }
      }
      // 分组过滤（多选）
      if (scopeFilters.length > 0) {
        if (scopeFilters[0] === '__none__') return false;
        const instGroup = inst.groupName || '全部用户';
        const hasUngrouped = scopeFilters.includes('__ungrouped__');
        const groupNames = scopeFilters.filter(n => n !== '__ungrouped__');
        const matchesGroup = groupNames.includes(instGroup);
        const matchesUngrouped = hasUngrouped && (instGroup === '全部用户' || !instGroup);
        if (!matchesGroup && !matchesUngrouped) return false;
      }
      // 状态过滤（多选）
      if (statusFilters.length > 0) {
        if ((statusFilters as any)[0] === '__none__') return false;
        const instStatus = (inst.deleteStatus || 'not_deleted') as UninstallFilterOption;
        if (!statusFilters.includes(instStatus)) return false;
      }
      return true;
    });
  }, [distributedInstances, searchQuery, scopeFilters, statusFilters]);

  // 全选/取消全选
  const isAllSelected = filteredInstances.length > 0 && filteredInstances.every(inst => selectedInstances.includes(inst.id));
  const isSomeSelected = filteredInstances.some(inst => selectedInstances.includes(inst.id)) && !isAllSelected;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedInstances(prev => prev.filter(id => !filteredInstances.some(inst => inst.id === id)));
    } else {
      const newIds = filteredInstances.map(inst => inst.id);
      setSelectedInstances(prev => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const toggleInstance = (id: string) => {
    setSelectedInstances(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedInstances.length === 0) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const selectedData = distributedInstances.filter(inst => selectedInstances.includes(inst.id));
    onDeleteStart(selectedInstances, selectedData);
    setConfirmDialogOpen(false);
    onOpenChange(false);
  };

  // 选中数量（在筛选范围内）
  const selectedInFilterCount = filteredInstances.filter(inst => selectedInstances.includes(inst.id)).length;

  /** 是否为全部状态 */
  const isAllStatusSelected = statusFilters.length === 0 || statusFilters.length === UNINSTALL_FILTER_OPTIONS.length;

  /** 获取状态筛选显示文本 */
  const getStatusDisplayText = () => {
    if (statusFilters.length === 0) return '全部状态';
    if ((statusFilters as any)[0] === '__none__') return '状态';
    if (statusFilters.length === UNINSTALL_FILTER_OPTIONS.length) return '全部状态';
    return statusFilters.map(k => UNINSTALL_FILTER_OPTIONS.find(o => o.key === k)?.label).filter(Boolean).join('、');
  };

  /** 获取分组筛选显示文本 */
  const getScopeDisplayText = () => {
    if (scopeFilters.length === 0) return '全部分组';
    if (scopeFilters[0] === '__none__') return '分组';
    const groupNames = scopeFilters.filter(n => n !== '__ungrouped__');
    const hasUngrouped = scopeFilters.includes('__ungrouped__');
    if (groupNames.length === availableGroupNames.length && hasUngrouped) return '全部分组';
    const names = [...groupNames];
    if (hasUngrouped) names.push('未分组');
    return names.join('、') || '分组';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[920px]">
          <DialogHeader>
            <DialogTitle>
              批量卸载实例
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                <p>
                  从已下发实例中卸载技能{' '}
                  <span className="font-semibold text-[#0A0A0A]">
                    {skillName}
                  </span>
                </p>
                <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    通过下发按钮安装的技能可支持移出（包括用户下发和管理端下发）。卸载成功后，该技能在对应实例上恢复为"未下发"状态。
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* 搜索框 + 筛选 */}
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <Input
                placeholder="搜索实例名称/ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* 分组筛选 — 多选带搜索（参考下发弹窗） */}
            <div className="relative" ref={scopeDropdownRef}>
              <Tooltip delayDuration={1000} open={scopeDropdownOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setScopeDropdownOpen(prev => !prev)}
                    className="flex items-center justify-between gap-1 w-32 h-9 px-3 border border-gray-200 rounded-md bg-white text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                  >
                    <span className="truncate text-left">
                      {getScopeDisplayText()}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#A3A3A3] flex-shrink-0 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px]">
                  <p className="break-words">{getScopeDisplayText()}</p>
                </TooltipContent>
              </Tooltip>
              {scopeDropdownOpen && (() => {
                const groupOnlyFilters = scopeFilters.filter(n => n !== '__ungrouped__' && n !== '__none__');
                const hasUngrouped = scopeFilters.includes('__ungrouped__');
                const isAllGroupSelected = scopeFilters.length === 0 || (availableGroupNames.every(n => groupOnlyFilters.includes(n)) && hasUngrouped);
                const selectedCount = groupOnlyFilters.length + (hasUngrouped ? 1 : 0);
                const isSomeGroupSelected = selectedCount > 0 && !isAllGroupSelected;
                const filteredGroups = availableGroupNames.filter(n => n.toLowerCase().includes(scopeSearchQuery.toLowerCase()));
                const showUngrouped = !scopeSearchQuery || '未分组'.includes(scopeSearchQuery);

                return (
                  <div className="absolute left-0 top-full mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    {/* 搜索框 */}
                    <div className="px-2 pb-1.5 pt-1.5">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                        <input
                          placeholder="搜索分组..."
                          value={scopeSearchQuery}
                          onChange={(e) => setScopeSearchQuery(e.target.value)}
                          className="w-full pl-7 pr-2 h-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    {/* 全部分组 */}
                    {!scopeSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isAllGroupSelected) {
                            setScopeFilters(['__none__']);
                          } else {
                            setScopeFilters([...availableGroupNames, '__ungrouped__']);
                          }
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#334155] hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isAllGroupSelected ? 'bg-blue-600 border-blue-600' : isSomeGroupSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {isAllGroupSelected && <Check className="w-3 h-3 text-white" />}
                          {isSomeGroupSelected && <div className="w-2 h-0.5 bg-white rounded-sm" />}
                        </div>
                        <span>全部分组</span>
                      </button>
                    )}
                    {/* 分组列表 */}
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredGroups.map(groupName => {
                        const isSelected = isAllGroupSelected || groupOnlyFilters.includes(groupName);
                        return (
                          <button
                            key={groupName}
                            type="button"
                            onClick={() => {
                              setScopeFilters(prev => {
                                const cleaned = prev.filter(n => n !== '__none__');
                                const hasUng = cleaned.includes('__ungrouped__');
                                const grpOnly = cleaned.filter(n => n !== '__ungrouped__');
                                if (prev.length === 0) {
                                  const remaining = availableGroupNames.filter(n => n !== groupName);
                                  return [...remaining, '__ungrouped__'];
                                }
                                const next = grpOnly.includes(groupName)
                                  ? grpOnly.filter(n => n !== groupName)
                                  : [...grpOnly, groupName];
                                const combined = hasUng ? [...next, '__ungrouped__'] : next;
                                if (combined.length === 0) return ['__none__'];
                                if (next.length === availableGroupNames.length && hasUng) return [];
                                return combined;
                              });
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="truncate text-left" title={groupName}>{groupName}</span>
                          </button>
                        );
                      })}
                      {/* 未分组 */}
                      {showUngrouped && (
                        <button
                          type="button"
                          onClick={() => {
                            setScopeFilters(prev => {
                              const cleaned = prev.filter(n => n !== '__none__');
                              const grpOnly = cleaned.filter(n => n !== '__ungrouped__');
                              const hadUng = cleaned.includes('__ungrouped__');
                              if (prev.length === 0) {
                                return [...availableGroupNames];
                              }
                              if (hadUng) {
                                const result = grpOnly.length > 0 ? grpOnly : ['__none__'];
                                return result;
                              } else {
                                const combined = [...grpOnly, '__ungrouped__'];
                                if (grpOnly.length === availableGroupNames.length) return [];
                                return combined;
                              }
                            });
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            (isAllGroupSelected || hasUngrouped) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {(isAllGroupSelected || hasUngrouped) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-[#737373]">未分组</span>
                        </button>
                      )}
                      {filteredGroups.length === 0 && !showUngrouped && scopeSearchQuery && (
                        <p className="text-xs text-[#A3A3A3] py-3 text-center">没有匹配的分组</p>
                      )}
                    </div>
                    {/* 底部统计 */}
                    {selectedCount > 0 && !isAllGroupSelected && (
                      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-xs">
                        <span className="text-[#737373]">已选 {selectedCount} 个分组</span>
                        <button
                          type="button"
                          onClick={() => setScopeFilters([])}
                          className="text-[#355EF1] hover:text-[#355EF1] font-medium"
                        >
                          清除筛选
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            {/* 状态筛选 — 多选下拉（参考下发弹窗） */}
            <div className="relative" ref={statusDropdownRef}>
              <Tooltip delayDuration={1000} open={statusDropdownOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(prev => !prev)}
                    className="flex items-center justify-between gap-1 w-28 h-9 px-3 border border-gray-200 rounded-md bg-white text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                  >
                    <span className="truncate text-left">{getStatusDisplayText()}</span>
                    <ChevronDown className={`w-4 h-4 text-[#A3A3A3] flex-shrink-0 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px]">
                  <p className="break-words">{getStatusDisplayText()}</p>
                </TooltipContent>
              </Tooltip>
              {statusDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  {/* 全部状态 */}
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilters(prev => {
                        if (isAllStatusSelected) return ['__none__'] as any;
                        return [];
                      });
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isAllStatusSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isAllStatusSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>全部状态</span>
                  </button>
                  {UNINSTALL_FILTER_OPTIONS.map(opt => {
                    const isOptSelected = isAllStatusSelected || (!(statusFilters as any).includes('__none__') && statusFilters.includes(opt.key));
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setStatusFilters(prev => {
                            const cleaned = (prev as any).filter((k: string) => k !== '__none__') as UninstallFilterOption[];
                            if (prev.length === 0) {
                              return UNINSTALL_FILTER_OPTIONS.filter(o => o.key !== opt.key).map(o => o.key);
                            }
                            if (prev.length === UNINSTALL_FILTER_OPTIONS.length) {
                              return UNINSTALL_FILTER_OPTIONS.filter(o => o.key !== opt.key).map(o => o.key);
                            }
                            const next = cleaned.includes(opt.key)
                              ? cleaned.filter(k => k !== opt.key)
                              : [...cleaned, opt.key];
                            if (next.length === UNINSTALL_FILTER_OPTIONS.length) return [];
                            if (next.length === 0) return ['__none__'] as any;
                            return next;
                          });
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isOptSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {isOptSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 实例列表 — 卡片式布局，参考下发弹窗 */}
          <div className="border border-gray-200 rounded-lg max-h-[340px] overflow-y-auto">
            {/* 全选复选框 */}
            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <Checkbox
                checked={isAllSelected}
                // @ts-ignore – indeterminate prop
                indeterminate={isSomeSelected}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium text-[#0A0A0A]">
                全选（{selectedInFilterCount}/{filteredInstances.length}）
              </span>
            </div>

            {/* 实例项 */}
            {filteredInstances.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-[#A3A3A3]">
                暂无已下发的实例
              </div>
            ) : (
              filteredInstances.map(inst => {
                const isSelected = selectedInstances.includes(inst.id);
                const deleteStatus = inst.deleteStatus || 'not_deleted';
                return (
                  <div
                    key={inst.id}
                    onClick={() => toggleInstance(inst.id)}
                    className={`flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0 self-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleInstance(inst.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-medium text-[#0A0A0A] truncate">{inst.name}</span>
                        <span className="text-xs text-[#A3A3A3] font-mono flex-shrink-0">{inst.id}</span>
                        {deleteStatus === 'delete_failed' ? (
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 cursor-help ml-auto flex-shrink-0">
                                卸载失败
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span className="text-xs">{inst.deleteFailReason || '未知原因'}</span>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-[#737373] ml-auto flex-shrink-0">
                            未卸载
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[#737373]">创建人：{inst.createdBy}</span>
                        <span className="text-xs text-[#737373]">分组：{inst.groupName || '全部用户'}</span>
                        <span className="text-[11px] text-[#A3A3A3] ml-auto">
                          v{inst.distributedVersion || skillVersion}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-[#737373]">
              已选择 <span className="font-semibold text-[#0A0A0A]">{selectedInstances.length}</span> 个实例
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={handleDelete}
                disabled={selectedInstances.length === 0}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                确认卸载
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 二次确认弹窗 */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setConfirmDialogOpen(false)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              确认卸载
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要从 <span className="font-semibold text-[#0A0A0A]">{selectedInstances.length}</span> 个实例中卸载技能「{skillName}」吗？卸载后该技能将恢复为未下发状态。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              确认卸载
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
