/**
 * 编辑应用范围 Popover 气泡
 * - 参考模型配置 ScopePopover 交互
 * - 两个胶囊按钮：全部用户 / 按分组
 * - 按分组时：搜索框 + checkbox 列表 + 已选计数 + 清除筛选
 * - 底部：取消 / 确认
 */
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import { Search, Check, Edit2, X } from 'lucide-react';
import { type SkillScope, type Group } from './types';

interface EditScopePopoverProps {
  groups: Group[];
  currentScope: SkillScope;
  currentGroupIds: string[];
  onConfirm: (scope: SkillScope, groupIds: string[]) => void;
  /** 应用范围展示标签 */
  scopeLabels: string[];
  /** 是否是 public 范围 */
  isPublic: boolean;
}

export default function EditScopePopover({
  groups,
  currentScope,
  currentGroupIds,
  onConfirm,
  scopeLabels,
  isPublic,
}: EditScopePopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<SkillScope>('public');
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 每次打开时同步当前状态
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(currentScope);
      setDraftGroupIds([...currentGroupIds]);
      setSearchQuery('');
    }
    setOpen(v);
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGroup = (gid: string) => {
    setDraftGroupIds(prev =>
      prev.includes(gid) ? prev.filter(id => id !== gid) : [...prev, gid]
    );
  };

  const handleClearSelection = () => {
    setDraftGroupIds([]);
    setSearchQuery('');
  };

  const isConfirmDisabled = draftScope === 'private' && draftGroupIds.length === 0;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm(draftScope, draftScope === 'public' ? [] : draftGroupIds);
    setOpen(false);
  };

  // 渲染范围徽章
  const renderBadges = () => {
    if (isPublic) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          全部用户
        </span>
      );
    }

    // 按分组：第一个分组名 + +N
    const firstName = scopeLabels[0] || '';
    const rest = scopeLabels.length - 1;
    const tooltipText = scopeLabels.join('，');

    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full max-w-[100px] truncate">
              {firstName}
            </span>
            {rest > 0 && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full whitespace-nowrap">
                +{rest}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      {renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 text-gray-400 hover:text-gray-900 rounded transition-colors flex-shrink-0"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            编辑应用范围
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          className="w-68 p-0"
          align="start"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-4 pb-3 space-y-3">
            {/* 全部用户 / 按分组 Segment 切换 */}
            <SegmentGroup className="w-full">
              <SegmentOption active={draftScope === 'public'} onClick={() => setDraftScope('public')} className="flex-1">
                全部用户
              </SegmentOption>
              <SegmentOption active={draftScope === 'private'} onClick={() => setDraftScope('private')} className="flex-1">
                按分组
              </SegmentOption>
            </SegmentGroup>

            {/* 分组列表（仅 private 模式） */}
            {draftScope === 'private' && (
              <div className="space-y-2">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a3a3a3]" />
                  <input
                    type="text"
                    placeholder="搜索分组…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 h-9 text-[13px] border border-[#E5E5E5] rounded-[4px] bg-white outline-none focus:border-[#1447E6] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#525252]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 分组 checkbox 列表 */}
                <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                  {filteredGroups.length === 0 ? (
                    <p className="text-[12px] text-[#a3a3a3] text-center py-4">无匹配分组</p>
                  ) : (
                    filteredGroups.map((group) => {
                      const checked = draftGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          onClick={() => toggleGroup(group.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] transition-colors text-left ${
                            checked ? 'bg-[#EBF4FF]' : 'hover:bg-[#fafafa]'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-[3px] border shrink-0 flex items-center justify-center transition-colors ${
                              checked
                                ? 'bg-[#1447E6] border-[#1447E6]'
                                : 'border-[#E5E5E5] bg-white'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="text-[13px] text-[#020617] truncate">{group.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* 已选数量 + 清除筛选 */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="text-[12px] text-[#737373]">
                    已选 {draftGroupIds.length} 个分组
                  </span>
                  {draftGroupIds.length > 0 && (
                    <button
                      onClick={handleClearSelection}
                      className="text-[12px] text-[#1447E6] hover:text-[#0a226f] transition-colors"
                    >
                      清除筛选
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E5E5E5]">
            <Button size="sm" variant="outline" className="h-8 text-[13px] px-4" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              variant="dialog-confirm"
              className="h-8 text-[13px] px-4"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
            >
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
